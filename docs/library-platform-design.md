# libs - Library / Connection Platform Design Doc

> Status: **Draft / RFC** · Owner: Surya · Last updated: 2026-08-28
>
> **libs** - the multi-tenant library / connection service. Repo
> `github.com/srytmj/libs`. Public host `libs.yado.my.id`. Could alternatively
> be shipped as the next major version of **Malas**.
>
> This is **Project A** of two. Project B is **[Pore.js](reader-engine-design.md)**,
> the reader engine, a separate repo. The contract between them is §10 of this doc.

---

## 1. Summary

A multi-tenant backend that lets a Yado user connect one or more of
**their own** self-hosted content servers (Komga first, Kavita later) and exposes
a single **normalized read API** over all of them: libraries, series, books, page
images, book files, and reading progress.

The platform hosts **no content** and never holds the user's content-server
credentials. Bytes are pulled on demand from the user's server through a thin
outbound **agent** the user runs next to their library. Everything platform-side
runs on the owner's **homelab** alongside the rest of Yado.

The Reader UI is **not** part of this project - it is a separate, source-agnostic
frontend (Project B) that consumes the API in §10.

### Why this shape

- **Learning / showcase goal (Project A)**: the novel part is the agent + relay
  tunnel - Go, yamux multiplexing, reverse proxying, cache tiering, sync engine.
- **No inbound firewall changes for users**: the agent dials *out*.
- **No credential custody**: content-server credentials live only in the agent's
  local config. A platform DB leak exposes no content-server passwords.
- **No SSRF surface**: the platform never fetches a user-supplied URL. All
  traffic to a user's server is framed through their authenticated agent tunnel.
- **Clean seam for Project B**: the reader only ever sees the §10 API, so it can
  also run against a local file or a demo fixture with zero backend.

---

## 2. Goals / Non-goals

### Goals

1. One account (SSO) → many content servers per user.
2. Normalized read API across server types (adapter pattern).
3. Serve manga page images *and* whole book files (EPUB / PDF / CBZ).
4. Store and sync reading position; push it back to the origin server best-effort.
5. Onboarding a server = run one binary with one token.
6. Adding a server type = a driver, not a rewrite.

### Non-goals (v1)

- Any reader / rendering UI (that is Project B).
- Hosting or storing content.
- Discovery / recommendations / social features.
- High availability. Residential infra, best-effort.
- Replacing the user's library manager - the content server stays authoritative
  for the catalog.

---

## 3. Terminology

| Term | Meaning |
|---|---|
| **Platform** | Public-facing backend: BFF API + catalog store + Relay + Redis + Postgres, all on the homelab. |
| **Relay** | Go service. Terminates agent tunnels, proxies HTTP into them, serves media with cache tiering. |
| **Agent** | Small Go binary the user runs on their homelab. Dials out to Relay, forwards requests to the local content server, holds the content-server credentials. |
| **Connection** | A row linking a user to one agent / one content server. |
| **Content server** | The user's Komga / Kavita / etc. instance. |
| **Driver** | Server-type-specific adapter implementing a common interface. Runs *inside the agent*. |
| **Reader** | Project B. Consumes the §10 API. Out of scope here. |

---

## 4. System architecture

```
                       ┌───────────────────────── homelab (owner) ─────────────────────────┐
   Pore.js (Project B)  │                                                                   │
   browser ── HTTPS ──► │  BFF API  ◄── SSO (OAuth2, existing) ──►                           │
                        │    │  │                                                            │
                        │    │  │ media (signed URL)                                         │
                        │    │  ▼                                                            │
                        │    │ Relay (Go) ──► Redis (hot cache) ──► disk cache               │
                        │    │   │                                                           │
                        │    ▼   │ yamux stream over WSS                                     │
                        │  Catalog + progress (Postgres)                                     │
                        │    ▲   │                                                           │
                        │    │ sync jobs (Go worker)                                         │
                        └────┼───┼───────────────────────────────────────────────────────────┘
                             │   │  outbound WSS, agent-initiated
                             │   ▼
                        ┌────┴────────── homelab (user) ───────────────┐
                        │   Agent (Go) + Driver ──HTTP──► Komga :25600  │
                        │   - holds Komga creds locally                 │
                        └──────────────────────────────────────────────┘
```

### Components

| Component | Tech | Responsibility |
|---|---|---|
| **BFF API** | Go (shares code with Relay - see §11) | SSO session, issue/verify signed media URLs, serve the normalized read API (§10), enqueue sync + progress-push jobs. |
| **Catalog + progress** | Postgres | `connection`, mirrored `series` / `book` index, `read_progress`. |
| **Relay** | Go | Accept agent tunnels, multiplex HTTP into them, `/media/*` with cache tiering. |
| **Agent** | Go, single static binary | Dial Relay, authenticate, run the Driver against the local content server. |
| **Redis** | existing | Hot media cache, session store, job queue. |
| **Sync worker** | Go | Pull catalog metadata per Connection on a schedule / on demand; push progress back. |

---

## 5. Agent ↔ Relay protocol

### Transport

- Agent opens **one** outbound `wss://relay.yado.my.id/tunnel`.
- Over it runs **[yamux](https://github.com/hashicorp/yamux)** (same approach as
  ngrok / frp). Each proxied request = a **new yamux stream**.
- Relay implements `http.RoundTripper` with a `DialContext` that opens a yamux
  stream instead of a TCP socket, then speaks HTTP/1.1 over it. Callers just see
  an `*http.Client`.
- Rejected alternatives: custom framing (reinvents flow control), gRPC bidi
  (boilerplate, awkward for large streamed bodies), WebTransport/HTTP3 (too new).

### Connection lifecycle

1. **Dial** → agent sends `HELLO { agent_version, connection_token }`.
2. **Auth** → Relay validates the token → `connection_id` + `user_id`, checks
   Connection is `enabled`.
3. **Ready** → Relay registers `connection_id → live session` (in-memory; single
   Relay in v1, see §13).
4. **Heartbeat** → yamux keep-alive + app `PING/PONG` every 30 s carrying
   `{ server_reachable, server_type, server_version }`.
5. **Request** → platform opens a stream, writes a normalized-API request; agent's
   Driver translates it to the real server API, injects credentials, streams the
   response back.
6. **Disconnect** → Relay marks Connection `offline`, keeps the row. Agent
   reconnects with exponential backoff + jitter (1 s → 60 s).

### Framing

- Control channel: yamux stream 0, newline-delimited JSON.
- Request streams: `REQ` header (`op`, `args`, `request_id`, trace context) then
  optional body, response mirrored back.
- Large bodies stream chunked - Relay never buffers a whole file.
- Per-agent in-flight cap (default 8). Excess queues on the Relay side with a
  timeout, so a Raspberry Pi behind the agent isn't hammered.

### Agent constraints

- Agent config pins **exactly one** content-server base URL.
- Agent is **not** a general HTTP proxy - it only performs Driver operations.
- Agent refuses link-local / cloud-metadata addresses even if misconfigured.

---

## 6. Connectivity & security

### Credential model

| Secret | Stored where | Notes |
|---|---|---|
| Content-server credentials | **Agent local config only** | Never sent to the platform. |
| `connection_token` (agent ↔ Relay) | Platform DB (hashed) + agent config | Opaque 256-bit random, one per Connection, revocable, rotatable. Shown once. |
| SSO session | Redis + httpOnly cookie | Standard. |
| Media-URL signing key | Platform secret store | HMAC key. |

- Revoke = disable/delete the Connection → Relay drops the tunnel (control-plane
  nudge + next heartbeat).
- Rotate = issue new token, old valid for a grace window.

### SSRF / internal-network protection

Classic SSRF is out of scope by construction (no user-supplied address is ever
dialed). Residual:

- Agent → content server: single pinned base URL only; refuses metadata IPs.
- Relay → Redis / disk: cache keys derived from validated tuples, never raw
  client input.
- Signed media URLs: HMAC over the full resource tuple + expiry; tampering fails
  before any tunnel work.

### Transport & abuse

- HTTPS only, HSTS, `wss://` tunnel.
- Per-user Connection cap (~10). Per-Connection sync-frequency cap. Per-agent
  in-flight cap. Global Relay egress cap to protect the homelab uplink (§12).
- Optional future: TOFU-pin an agent public key to detect token theft.

---

## 7. Data model (Postgres)

```sql
user_account (
  id uuid pk, sso_subject text unique not null,
  display_name text, created_at timestamptz )

connection (
  id uuid pk, user_id uuid fk,
  name text not null,                 -- "Home Komga", "Seedbox"
  server_type text not null,          -- 'komga' | 'kavita' | ...
  token_hash text not null,
  status text not null,               -- 'pending'|'online'|'offline'|'disabled'
  server_version text,
  last_seen_at timestamptz, last_synced_at timestamptz,
  created_at timestamptz )

library (
  id uuid pk, connection_id uuid fk,
  remote_id text not null, name text,
  kind text,                          -- 'manga' | 'book' | 'mixed'
  unique (connection_id, remote_id) )

series (
  id uuid pk, connection_id uuid fk, library_id uuid fk,
  remote_id text not null, title text, sort_title text,
  cover_etag text, book_count int,
  metadata jsonb,                     -- authors, tags, summary, ...
  content_type text,                  -- 'image' | 'epub' | 'pdf' | 'cbz'
  updated_remote_at timestamptz, deleted_at timestamptz,
  unique (connection_id, remote_id) )

book (
  id uuid pk, series_id uuid fk, connection_id uuid fk,
  remote_id text not null, number numeric, title text,
  content_type text not null,         -- 'image' | 'epub' | 'pdf' | 'cbz'
  page_count int,                     -- image/pdf; null for reflowable epub
  file_size bigint, file_etag text,
  updated_remote_at timestamptz, deleted_at timestamptz,
  unique (connection_id, remote_id) )

read_progress (
  id uuid pk, user_id uuid fk, book_id uuid fk,
  position jsonb not null,            -- polymorphic, see Reader doc §-position
  status text not null,               -- 'unread'|'in_progress'|'read'
  updated_at timestamptz not null,
  synced_remote_at timestamptz, device_id text,
  unique (user_id, book_id) )
```

- Every query scoped by `user_id`; consider Postgres RLS as defense in depth.
- `series` / `book` are a **mirror**; the content server is authoritative.
  Deletes are soft so progress survives a transient sync glitch.
- No page bytes in Postgres, ever.

---

## 8. Sync engine

### Triggers

- Connection first comes online → full sync.
- Scheduled per Connection (default every 6 h).
- On demand (user hits "refresh" in the reader → BFF enqueues).
- Opportunistic: subscribe to Komga's event stream for incremental updates;
  poll for drivers without one.

### Algorithm (per Connection)

1. List libraries → upsert.
2. Page series per library (`updated_remote_at > last_synced_at` where supported).
3. Upsert series; diff book lists; upsert new/changed, soft-delete missing.
4. Record `last_synced_at`; emit cache-invalidation for changed etags.

### Guardrails

- **Rate limit per Connection**: token bucket (default 5 req/s), tunable down for
  weak boxes.
- **Backoff on errors**: 429/5xx → exponential backoff; `status='offline'` after
  M consecutive failures.
- **Bounded**: wall-clock budget per run, resume next run.
- **Idempotent**: keyed upserts.

### Queue

Redis-backed (**asynq** or **River**). Jobs: `sync.full`, `sync.incremental`,
`progress.push`, `media.prefetch`.

---

## 9. Media pipeline

### Flow (manga page)

```
GET /media/v1/{sig}?e={expiry}
  sig = HMAC(key, connection_id|book_id|page|variant|expiry|file_etag)
   │
   ▼ verify sig + expiry
  Relay ── Redis GET ─┬─ hit → bytes
          disk  GET ──┤─ hit → bytes + warm Redis
                      └─ miss → yamux → Agent → Komga page → fill caches → bytes
```

### Cache tiering

| Tier | Contents | Policy |
|---|---|---|
| **Redis** | Covers, thumbnails, pages read in ~24 h | `allkeys-lru`, explicit `maxmemory` (512 MB–1 GB), TTL 24 h, skip values > ~1.5 MB. |
| **Disk** (homelab volume) | Full-size pages, EPUB/PDF/CBZ files | LRU by atime, size cap (20–50 GB), sweeper cron. |

- Key: `sha256(connection_id | book_id | page | variant | file_etag)`,
  `variant ∈ {orig, w800, w1600, webp}`. Etag change busts stale entries.
- A given (book, page) is effectively immutable → aggressive caching is safe.

### Novels are simpler

EPUB / PDF / CBZ: fetch the **whole file once** through the tunnel, store in the
disk tier, serve it to the reader. No per-page tunnel traffic. This is why the
novel path is the recommended first vertical slice for both projects.

### Prefetch (manga)

BFF asks Relay to warm `N+1 … N+3` when the reader reports opening page `N`.
Single-flight per key. Best-effort, lower priority than live requests.

---

## 10. Public read API - the contract with Pore.js (Project B)

Base: `https://libs.yado.my.id/api/v1`. Auth: SSO session cookie **or**
bearer token. All list endpoints are cursor-paginated and scoped to the caller.

```
GET  /connections
        → [{ id, name, server_type, status, last_synced_at, server_version }]
POST /connections                 { name, server_type } → { id, connection_token }   (token shown once)
POST /connections/{id}/rotate-token → { connection_token }
DELETE /connections/{id}
POST /connections/{id}/sync       → { job_id }           (enqueue a resync)

GET  /libraries?connection_id=&cursor=
        → [{ id, connection_id, name, kind }]
GET  /series?library_id=&connection_id=&q=&sort=&cursor=
        → [{ id, title, content_type, book_count, cover_url, metadata, unread_count }]
GET  /series/{id}
        → { ...series, books: [{ id, number, title, content_type, page_count, file_size, progress }] }
GET  /books/{id}
        → { id, series_id, title, content_type, page_count, file_size, file_etag, progress }

# --- content (all return short-lived signed URLs on /media, or 302 to them) ---
GET  /books/{id}/manifest         → reader manifest (see Reader doc)
        image: { type:"image", pages:[{ index, width, height, media_url }] }
        epub|pdf|cbz: { type:"epub"|"pdf"|"cbz", file: { media_url, bytes, etag } }
GET  /books/{id}/pages/{n}?variant=  → 302 signed /media URL (image books)
GET  /books/{id}/file               → 302 signed /media URL (epub/pdf/cbz)
GET  /covers/{scope}/{id}           → 302 signed /media URL

# --- progress ---
GET  /books/{id}/progress          → { position, status, updated_at }
PUT  /books/{id}/progress          { position, status, device_id }   (last-writer-wins on updated_at)
```

- `position` is the polymorphic shape defined in the
  [Pore.js doc](reader-engine-design.md#5-reading-position-model). The
  platform stores it opaquely and only reads `status` + `updated_at`.
- `media_url` entries are signed, expire in ~10 min, and are safe to hand
  straight to `<img src>` / `fetch`.
- The reader never talks to the Relay directly; it only sees `libs.yado.my.id`.
- This same surface is what a `DemoSource` / `LocalFileSource` in Project B mocks,
  so the reader repo runs with no backend.

---

## 11. Where the BFF lives

Decision: **one Go binary for BFF + Relay** (or two binaries sharing a Go module).
Reasons: the Drivers, media-signing, and cache code are shared; the reader SPA
(Project B) becomes pure static hosting; cleaner microservices story. The
alternative (Next route handlers) was rejected - it drags an unneeded SSR runtime
and splits the toolchain.

---

## 12. Deployment

| Service | Host | Public? |
|---|---|---|
| `libs.yado.my.id` (BFF API) | homelab | yes (HTTPS) |
| `relay.yado.my.id` (Relay + `/media`) | homelab | yes (HTTPS + WSS) |
| Postgres, Redis, sync worker | homelab | internal |
| **Agent** | **each user's** homelab | outbound only |
| Reader static site (Project B) | homelab (or any static host / CDN) | yes |

- Ingress via the existing Yado reverse proxy. Register health endpoints
  so `library` + `relay` appear on the landing status dashboard
  (`src/lib/services.ts`).

### Bandwidth - the real constraint

Every *first* read of every page for every user crosses the owner's home uplink
(user server → homelab → reader). Cache only helps repeat reads. Mitigations:
cache tiering, `w800`/`webp` variants, global Relay egress limiter, per-user
fair-queuing. If it outgrows the homelab, **only the Relay + Redis + disk cache**
needs to move to a VPS - it sits behind a clean interface.

---

## 13. Drivers

```go
type Driver interface {
    ServerInfo(ctx) (ServerInfo, error)

    ListLibraries(ctx) ([]Library, error)
    ListSeries(ctx, libraryID string, since time.Time, p Pager) ([]Series, error)
    ListBooks(ctx, seriesID string, since time.Time, p Pager) ([]Book, error)

    BookFile(ctx, bookID string) (io.ReadCloser, ContentMeta, error)          // epub/pdf/cbz
    PageImage(ctx, bookID string, page int, v Variant) (io.ReadCloser, ContentMeta, error)
    Cover(ctx, scope, id string) (io.ReadCloser, ContentMeta, error)

    GetProgress(ctx, bookID string) (RemoteProgress, error)
    SetProgress(ctx, bookID string, p RemoteProgress) error
}
```

- v1: **`KomgaDriver` only** (clean REST, page + progress endpoints, event stream).
- v2: `KavitaDriver`. Later: read-only `OPDSDriver` catch-all.
- The Driver runs **inside the Agent** (it holds credentials). Relay ↔ Agent
  speak a normalized internal protocol; the Driver maps it to the real API.

---

## 14. Known risks

| Risk | Stance for v1 |
|---|---|
| Home uplink saturation | Accept; cache hard; egress-limit; Relay portable to a VPS. |
| Single Relay = SPOF, in-memory registry | Accept; agents auto-reconnect in seconds. Scale-out needs a shared registry - deferred. |
| Residential hosting a "platform" | Frame as showcase + small trusted user set. |
| Proxying copyrighted material | Platform hosts nothing; users bring their own servers/content; keep invite-only. |
| Agent binary trust | Open source, signed releases (GoReleaser + cosign), reproducible where feasible. |
| Solo-dev + Claude Code scope | Strict MVP, vertical slices, de-risk the Go tunnel first. |

---

## 15. MVP & milestones

**Cut for v1**: Kavita, OPDS, image variants/transcoding, prefetch,
progress push-back, multi-Relay scale-out.

- **M0 - De-risk the tunnel (spike).** Minimal Relay + Agent: hardcoded token,
  yamux over WSS, proxy one `GET` to `localhost:25600` and stream it back.
  Success = fetch a Komga cover through the agent from another network.
- **M1 - Catalog + novel content.** SSO on the BFF. Add-server flow → token →
  agent connects → `status=online`. Sync libraries/series/books for EPUB/PDF.
  `/api/v1` list endpoints. `/books/{id}/file` → signed URL → whole-file fetch
  through the tunnel → disk cache. Progress GET/PUT.
- **M2 - Manga content.** Page endpoints through the tunnel. Redis hot cache +
  signed media URLs. Per-agent concurrency + per-connection sync rate limits.
- **M3 - Operability.** Connection health, token rotate/revoke, landing status
  dashboard entries, metrics (§16), agent releases + docs.
- **M4+** - prefetch → progress push-back → Kavita driver → image variants →
  Relay scale-out.

---

## 16. Observability

- **Tracing**: OpenTelemetry BFF → Relay → (tunnel) → Agent, trace context in the
  yamux request header. Wire from M1.
- **Metrics**: tunnel count, per-connection req/error rate, cache hit ratio per
  tier, media bytes egressed, sync duration, queue depth.
- **Logs**: structured JSON, `connection_id` + `request_id` everywhere.
- `/healthz` + `/metrics` on BFF and Relay for the status dashboard.

---

## Appendix A - Request path cheat-sheet

| User action (in the Reader) | Path |
|---|---|
| Open library / series | Reader → BFF → Postgres. No tunnel. Covers via `/media` (usually Redis hit). |
| Open manga page | signed `/media` URL → Relay → Redis/disk → miss → yamux → Agent → Komga. Fill caches. |
| Open a novel | `/books/{id}/file` → signed `/media` URL (disk tier) → miss → whole-file fetch via tunnel. |
| Turn page | Local to the reader. Debounced `PUT /progress`. |
| Add a server | BFF issues `connection_token`; user configures agent; agent dials Relay; sync enqueued. |
| Server offline | Heartbeat stops → Connection `offline` → reader shows a badge; cached content still readable. |
