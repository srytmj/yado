# White Archive — Design Docs

## Ecosystem

White Archive is a set of self-hosted services under `*.suryatmaja.dev`, all
deployed on the owner's homelab. This repo is the **landing page + status
dashboard**.

| Service | Repo | Status |
|---|---|---|
| **SSO** | `srytmj/sso.whitearchive` | live — OAuth2 identity for every service |
| **Malas** | `srytmj/malas` | live — manga library |
| **libs** — library / connection platform | `srytmj/libs` *(planned)* | [design](library-platform-design.md) |
| **Pore.js** — reader engine | `srytmj/pore.js` *(planned)* | [design](reader-engine-design.md) |

## The reader effort — two projects, one seam

The plan is a multi-tenant reader where users connect **their own** Komga/Kavita
servers and read manga + novels in the browser. It splits into two independent
repos:

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│  A. libs                    │        │  B. Pore.js                  │
│     (Go)                    │        │     (TypeScript, framework-  │
│                             │        │      agnostic + React)       │
│  · SSO integration          │        │                              │
│  · outbound agent + relay   │  /api  │  · image engine (manga)      │
│    (yamux tunnel)           │  /v1   │  · text engine (custom EPUB  │
│  · catalog sync + store     │◄──────►│    pagination) + pdf.js      │
│  · media proxy + cache      │        │  · source-agnostic:          │
│  · normalized read API      │        │    WhiteArchive / File / Demo │
└─────────────────────────────┘        └──────────────────────────────┘
   showcase: backend / infra              showcase: frontend engineering
   novelty budget: Go, tunneling          deliberately mainstream stack
```

**The seam**
([libs §10](library-platform-design.md#10-public-read-api--the-contract-with-porejs-project-b)):
libs exposes one normalized HTTP read API; Pore.js defines a `ReaderSource`
interface and ships `WhiteArchiveSource` to consume it. Pore.js also ships
`LocalFileSource` and `DemoSource`, so **Project B runs and demos with no backend
at all** — it's a portfolio artifact on its own from its first milestone.

Shared contract surface between the repos is tiny: the `Position` JSON shape and
the shape of the §10 responses. Nothing else.

## Docs

- [library-platform-design.md](library-platform-design.md) — **libs**: agent/relay
  tunnel, sync engine, media pipeline, read API, deployment.
- [reader-engine-design.md](reader-engine-design.md) — **Pore.js**: image + text
  rendering engines, pagination, position model, offline, milestones.

Both are **Draft / RFC** as of 2026-08-28.
