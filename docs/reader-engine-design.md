# Pore.js — Reader Engine Design Doc

> Status: **Draft / RFC** · Owner: Surya · Last updated: 2026-08-28
>
> **Pore.js** — the reading engine ("pore over a book"). Separate repo
> (`github.com/srytmj/pore.js`). Public demo at `pore.suryatmaja.dev`.
>
> This is **Project B** of two. Project A is **[libs](library-platform-design.md)**,
> the library / connection platform; its `/api/v1` is one of the sources this
> engine can read from.

---

## 1. Summary

A **source-agnostic web reader** for manga (image-based) and text (EPUB, PDF,
CBZ). Built from scratch rather than wrapping an existing library, because:

- No JS reader library cleanly covers *both* image manga (RTL, webtoon,
  double-page spread) *and* reflowable text with the UX and theming control we
  want, in one coherent shell.
- The rendering + pagination engine is the point — it is the frontend
  engineering showcase.
- As its own repo it is independently useful and demoable (bundled public-domain
  fixtures, no backend required), which makes it a stronger portfolio piece than
  a component buried in a platform.

**PDF is the one exception**: nobody reimplements a PDF renderer — we wrap
**pdf.js**. That is standard practice, not a shortcut.

### What "build our own" actually means

| Format | Approach | Effort |
|---|---|---|
| Manga / images | 100% custom | Low–medium. Genuinely worth it. |
| CBZ | Unzip client-side → feed the manga renderer | Trivial |
| EPUB | **Custom pagination engine** (sandboxed iframe + CSS columns) | High. This is the real work. |
| PDF | Wrap **pdf.js**, own navigation/theming shell | Low–medium |

---

## 2. Goals / Non-goals

### Goals

1. One reader shell, two rendering engines (image + text), pluggable sources.
2. Manga: paged (single + double spread), webtoon (vertical continuous),
   LTR / RTL / vertical-JP directions, fit modes, zoom/pan, preload.
3. Text: reflowable pagination, user typography + theme, TOC, in-book search,
   text selection, bookmarks, footnotes, RTL + vertical writing mode.
4. Position tracking that round-trips across devices and viewport sizes.
5. Offline: render entirely client-side from a cached blob.
6. Runs standalone with zero backend via bundled fixtures.
7. Framework-agnostic core; thin React bindings for the White Archive app.
8. Accessible: keyboard-complete, screen-reader linear mode for text.

### Non-goals (v1)

- Authoring / editing books.
- Annotations beyond bookmarks (highlights/notes are M4+).
- DRM of any kind.
- Audiobooks / TTS (TTS is a stretch goal — the text engine leaves room for it).
- Native apps. PWA only.
- Being a general document viewer (Office formats, CBR/RAR — RAR is patent-ugly).

---

## 3. Package layout

```
pore.js/
  packages/
    reader-core/     TypeScript, no framework. DOM is used but no React.
                     - source interface + built-in sources
                     - image engine
                     - text engine (epub pagination + pdf via pdf.js)
                     - navigation / position model
                     - settings + gesture + keyboard layers
    reader-react/    React 19 bindings: <Reader/>, hooks, context.
  apps/
    demo/            Vite app. Bundled fixtures. Deployable as the public demo.
  fixtures/
    gutenberg-*.epub        (public domain)
    sample-webtoon/         (CC-licensed art)
    sample-manga.cbz
    sample.pdf
```

- `reader-core` heavy deps: **pdf.js** (lazy-loaded chunk), **fflate** (tiny, for
  ZIP: EPUB + CBZ). Nothing else large.
- Tests: **Vitest** for pagination math, CFI/anchor round-trips, ZIP parsing;
  **Playwright** for the demo app (gestures, resize, restore).

---

## 4. Source interface — the seam

```ts
interface ReaderSource {
  getManifest(bookId: string): Promise<Manifest>;
  // image books
  getPage(bookId: string, index: number, opts?: { variant?: Variant; signal?: AbortSignal }):
    Promise<Blob | string>;                 // Blob or ready-to-use URL
  // text books
  getFile(bookId: string, opts?: { signal?: AbortSignal }): Promise<Blob>;  // whole epub/pdf/cbz
  // progress
  loadProgress(bookId: string): Promise<Position | null>;
  saveProgress(bookId: string, p: Position): Promise<void>;
}

type Manifest =
  | { type: "image"; pageCount: number; direction: Direction;
      pages: { index: number; width?: number; height?: number }[] }
  | { type: "epub" | "pdf" | "cbz"; bytes?: number; etag?: string };

type Direction = "ltr" | "rtl" | "vertical";
type Variant = "orig" | "w800" | "w1600" | "webp";
```

Built-in implementations shipped in `reader-core`:

| Source | Use |
|---|---|
| `WhiteArchiveSource(baseUrl, auth)` | Talks to Platform §10 API. The real one. |
| `LocalFileSource(File)` | User drops an `.epub` / `.cbz` / `.pdf` / folder of images. |
| `DemoSource()` | Serves the bundled `fixtures/`. Powers the public demo + tests. |
| `OpdsSource(url)` (later) | Read-only, for any OPDS server directly. |

Everything above the source is source-blind.

---

## 5. Reading position model

`read_progress.position` (stored opaquely by the Platform, §7/§10 of that doc):

```ts
type Position =
  | { type: "page";   value: number; total: number }              // image, pdf
  | { type: "anchor"; spine: number; block: number; offset: number; percent: number }  // epub
  | { type: "scroll"; value: number; total: number }              // webtoon
```

### EPUB: why `anchor`, not raw CFI

- **CFI** (EPUB Canonical Fragment Identifier, `epubcfi(/6/4[chap01]!/4/2/1:0)`) is
  the spec-blessed anchor. Generating and resolving it correctly is fiddly
  (step-node numbering, assertions, ranges).
- v1 uses a pragmatic **`anchor`**: `spine` index + `block` element ordinal within
  that spine doc + character `offset` into that block, plus a `percent` for
  progress bars and a "good enough" restore when the exact block moved.
- Resolve order on open: exact anchor → nearest block → `percent` of spine →
  `percent` of book.
- **CFI is a stretch goal** (`type: "cfi"`) once the engine is stable — it makes
  positions portable to other readers and is a nice spec-compliance flex.

### Manga / PDF

Page index is stable; trivial. Double-page spread stores the left page index.

### Webtoon

Fractional scroll offset over total scroll height; re-derived after layout so it
survives image-height changes.

---

## 6. Image engine (manga)

### Layout modes

| Mode | Notes |
|---|---|
| **Paged — single** | One page fills the viewport per fit mode. |
| **Paged — double spread** | Two pages side by side. Detect wide pages (aspect > 1) and show them solo, centered. Configurable cover-alone offset. |
| **Continuous vertical (webtoon)** | Virtualized list; images stream in; gap configurable (0 for true webtoon). |
| **Continuous horizontal** | Same, horizontal; respects RTL. |

### Fit modes

`width` · `height` · `contain` · `original` · `smart` (contain, but allow the
user to zoom past 100% with pan). Per-page zoom state is remembered until page
turn.

### Direction

`ltr` · `rtl` (manga default) · `vertical`. Affects page-turn direction, spread
pairing, and swipe gesture mapping. Taken from the manifest, user-overridable.

### Preloading

- Ring buffer: keep decoded `N-2 … N+4` (paged) or a viewport-scaled window
  (continuous).
- Fetches are `AbortController`-cancelled when they fall out of the window
  (fast page-flipping shouldn't queue 50 requests).
- Decode off the main thread with `createImageBitmap` where available.
- Report `page opened` to the source so the Platform can prefetch server-side.

### Rendering

- `<img>` with `decoding="async"`; `<canvas>` only when zoomed (for crisp
  scaling + pan performance).
- `object-fit` for fit modes; CSS `image-rendering` toggle for pixel-art webtoons.

### Input

- Keyboard: `← → Space ⇧Space Home End`, `f` fullscreen, `1/2` single/double,
  `+/-` zoom.
- Touch: horizontal swipe = page turn (direction-aware), vertical swipe in
  continuous = scroll, pinch = zoom, double-tap = toggle zoom, edge taps = turn.
- Click zones: left / center / right thirds (center toggles chrome).

---

## 7. Text engine (EPUB) — the hard part

### Parsing

1. `fflate` unzip the EPUB in memory.
2. `META-INF/container.xml` → path to the OPF.
3. OPF → `metadata`, `manifest` (id → href, media-type, properties),
   `spine` (ordered idrefs, `page-progression-direction`).
4. Nav: EPUB3 `nav.xhtml` (`epub:type="toc"`), fallback EPUB2 `toc.ncx`.
5. Build a resource resolver: every `href` / `src` / CSS `url()` is rewritten to a
   `blob:` URL (or a `source-served` URL for lazy loading of big images).

### Rendering & pagination

The proven approach (epub.js / foliate-js lineage), reimplemented:

- Each spine document renders inside a **sandboxed `<iframe>`**
  (`sandbox="allow-same-origin"`, no `allow-scripts` → author JS is dead) for
  style isolation.
- Inject a **user stylesheet** into the iframe:
  ```css
  html { column-width: <viewportWidth>px; column-gap: <gap>px; height: <viewportHeight>px;
         overflow: hidden; }
  body { margin: 0; padding: <margins>; }
  img, svg, table { max-width: 100%; break-inside: avoid; }
  ```
  CSS multicol turns one tall document into N side-by-side columns; paginating =
  translating the scroll position by `pageWidth` increments.
- **Page count** for a spine item = `scrollWidth / pageWidth`, summed across the
  spine for the book total. Recomputed on resize / font change (debounced), with
  the current `anchor` re-resolved afterward so the reader doesn't jump.
- **Spanning content** (wide images, tables): `break-inside: avoid` + a max-height
  clamp; oversize images get their own page.
- **Prev/next across spine boundaries**: turning past the last column of spine `i`
  loads spine `i+1` at column 0 (and preloads `i+1` while reading the tail of `i`).

### Theming — override without breaking

- User controls: font family (bundled + embedded), size, line-height, text-align
  (justify toggle), margins, column count (1 or 2), theme (light / sepia / dark /
  black-OLED).
- Injected as a **layered user stylesheet**, *not* blanket `!important`. Target
  common selectors (`body, p, div, li, ...`) at low specificity; let deliberate
  author styling (drop caps, poem indentation) survive. Provide a "publisher
  styles off" switch that raises the gloves for stubborn books.
- Dark theme: don't just invert — set `color` / `background`, and use
  `filter: invert() hue-rotate()` *only* on images the user opts to dim.

### Writing modes

- `page-progression-direction="rtl"` → columns flow right-to-left; page-turn
  gestures flip.
- Vertical Japanese: `writing-mode: vertical-rl` on the iframe root; pagination
  math switches to `scrollHeight / pageHeight`. Great light-novel flex, and it
  falls out of the same column mechanism.

### Position (CFI/anchor) generation

- On every settle, walk from the top-left visible node: record `spine` index,
  the ordinal of its nearest block ancestor among siblings, and the character
  offset. That is the `anchor`.
- Resolve = reverse walk with the fallbacks in §5.
- Keep the DOM-walk utilities isolated and unit-tested — this is the bug-prone
  core.

### Search, selection, footnotes

- **Search**: on load, extract plain text per spine (Range/`textContent`); build a
  lightweight inverted index in a worker. Hits map back to an `anchor`; jump +
  highlight via CSS Custom Highlight API (fallback: wrap in `<mark>`).
- **Selection**: native selection inside the iframe; a `selectionchange` bridge
  surfaces a floating toolbar (copy, bookmark, "search this").
- **Footnotes**: intercept clicks on `a[epub:type="noteref"]` (or `href="#..."`
  into the same doc) → render the target in a popover instead of navigating.

### Fonts

- Bundle 3–4 good reading faces (a serif, a sans, a slab, OpenDyslexic).
- Embedded EPUB fonts: honour unless the user picked an override.
- `@font-face` sources rewritten to blob URLs by the resource resolver.

---

## 8. PDF engine

- Lazy-load **pdf.js**; render pages to `<canvas>` at devicePixelRatio.
- Reuse the **image engine's** navigation shell (paged + continuous, zoom/pan,
  fit modes, same gestures/keys).
- Render pdf.js **text layer** over the canvas for selection + search
  (pdf.js `getTextContent`).
- Outline (`getOutline`) → TOC.
- Position = `{ type: "page" }`.
- Big PDFs: render window only, discard far canvases, keep a low-res thumbnail
  strip for the scrubber.

---

## 9. Shared shell

- **Location model**: an abstract `Locator` (spine+anchor | pageIndex | scroll%)
  with `toPosition()` / `fromPosition()`. The chrome (progress bar, scrubber,
  "chapter 4 of 12", "18 min left") is computed from it uniformly.
- **Settings store**: Zustand, persisted to `localStorage`; per-book overrides
  (a manga that reads LTR) layered over global defaults.
- **Chrome**: auto-hiding top bar (title, TOC, search, settings) + bottom bar
  (scrubber, page label). Idle-hide, tap-center to toggle.
- **Gestures / keyboard**: one layer, direction-aware, shared by all engines.
- **Fullscreen** + **Wake Lock** while reading.
- **Progress reporting**: debounced (page turn or every ~5 s) → `source.saveProgress`.
  Offline writes queue in IndexedDB, flush on reconnect.
- **A11y**: text engine exposes a "continuous flow" mode (no pagination, semantic
  HTML, normal scroll) for screen readers; all controls are real buttons with
  labels; focus is trapped sensibly in popovers.

---

## 10. Offline

- "Download" a book → `source.getFile` (text) or a bounded page range
  (`source.getPage` × N, image) → store the blob(s) in **IndexedDB** keyed by
  `bookId`.
- A `CachedSource` decorator wraps any source: checks IndexedDB first, falls
  through to the wrapped source, populates on read.
- Service worker (Workbox, configured by the host app) caches the engine assets +
  the demo fixtures so the whole reader works offline.
- Progress made offline → queue → flush.

---

## 11. React bindings

```tsx
<ReaderProvider source={waSource}>
  <Reader
    bookId={id}
    onPositionChange={(p) => {/* host may mirror to its own store */}}
    initialSettings={{ theme: "sepia" }}
  />
</ReaderProvider>
```

- `<Reader/>` mounts the core into a ref'd container; core owns the imperative
  rendering, React owns the chrome.
- Hooks: `useReaderLocation()`, `useReaderSettings()`, `useTableOfContents()`,
  `useReaderSearch()`.
- No React inside the iframes — ever.

---

## 12. Known risks

| Risk | Stance for v1 |
|---|---|
| EPUB pagination edge cases (nested floats, huge tables, MathML, fixed-layout EPUB) | v1 targets **reflowable** EPUB. Fixed-layout (many kids' books, some manga-as-epub) is detected and shown page-image style or deferred. |
| CSS multicol performance on 400-page chapters | Paginate per spine item, not per book; most spine items are one chapter. Virtualize the spine. |
| Theming overrides fighting publisher CSS | Layered low-specificity sheet + "publisher styles off" escape hatch. Accept it won't be perfect for every book. |
| pdf.js bundle size | Lazy chunk; only loaded for PDF books. |
| Anchor drift when a book is re-synced with different internal ids | `percent` fallback; anchors are best-effort, not guaranteed. |
| Scope: this is a large frontend project | Vertical slices (§14); the image engine ships first and is genuinely small. |
| Reimplementing what foliate-js already does well | Conscious choice for the showcase + unified shell. Study foliate-js source as prior art; don't copy-paste its license-incompatible bits. |

---

## 13. Prior art to study (not depend on)

- **foliate-js** — the modern reference for EPUB pagination without epub.js's
  baggage. Read its paginator.
- **epub.js** — older, widely used; good for understanding CFI.
- **pdf.js** — we depend on this one.
- **Komga / Kavita webtoon readers** — image reader UX reference.
- **Readium** (web) — spec-heavy, good for the Locator model vocabulary.

---

## 14. MVP & milestones

**Cut for v1**: CFI (anchor only), highlights/notes, TTS, fixed-layout EPUB,
OPDS source, in-book search (M3), vertical-JP (M3).

- **M0 — Image engine + DemoSource.** Paged single/double + webtoon, fit modes,
  LTR/RTL, zoom/pan, preload ring, gestures/keys. Runs on bundled CBZ + image
  fixtures. **No backend.**
- **M1 — Text engine (EPUB reflowable).** Parse, sandboxed iframe + multicol
  pagination, spine-boundary turns, `anchor` generation + restore, typography +
  theme controls, TOC. Runs on Gutenberg fixtures.
- **M2 — PDF + shared shell.** pdf.js wrap reusing the image shell; unified
  `Locator`, chrome, progress reporting; `LocalFileSource` (drag-drop any file).
- **M3 — Integration + polish.** `WhiteArchiveSource` against Platform §10;
  React bindings; offline (`CachedSource` + IndexedDB); in-book search;
  vertical-JP; a11y flow mode.
- **M4+** — CFI, highlights/notes, TTS, fixed-layout, OPDS source.

The demo app is deployable and useful from **M0** — that is the portfolio artifact
even before the platform exists.

---

## 15. Relationship to libs (Project A)

```
Pore.js ── ReaderSource ──┬── WhiteArchiveSource ──► libs.suryatmaja.dev /api/v1  (Project A)
                          ├── LocalFileSource      ──► a File the user dropped
                          └── DemoSource           ──► bundled fixtures
```

- The engine has **no knowledge** of agents, relays, tunnels, or SSO — that is
  entirely libs's concern, hidden behind the source.
- The two repos share only: the `Position` JSON shape (§5), and the shape of
  libs's §10 responses (which `WhiteArchiveSource` adapts to `Manifest`).
- Either project can be built, demoed, and shown off without the other.
