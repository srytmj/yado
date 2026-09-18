# Changelog - Yado

Catatan riwayat perubahan kode, arsitektur, penambahan komponen, dan prosedur rollback.

## Rollback

Untuk mengembalikan kode ke commit baseline (v0.1.0):
```bash
git checkout 5cc6c5d
# atau batalkan perubahan lokal:
git restore .
```

## Riwayat Perubahan

### v0.4.0 - 2026-09-19

Redesign visual total "Digital Ryokan" dan perbaikan sumber data telemetri palsu:

#### Desain: Sistem Warna & Tipografi
- `src/app/globals.css`:
  - Mengganti seluruh token warna dashboard-gelap (`#ffffff`/`#000000` + `--grid-line`) dengan palet krem hangat (`#f5efe6`) dan empat aksen bumi: indigo (`#2c3e50`, dye shibori), moss (`#6b7a5e`), ochre (`#a9762e`), clay (`#b15533`) - masing-masing punya varian gelap dan varian "soft" (`color-mix` untuk latar badge).
  - Menambahkan token `--hairline` untuk garis pembatas tipis pengganti border/shadow tebal ala kartu SaaS.
  - Mendaftarkan font custom ke `@theme inline`: `--font-serif` (Fraunces), `--font-sans` (General Sans), `--font-jp` (Shippori Mincho), `--font-mono` (Geist Mono tetap dipakai untuk angka/telemetri).
- `src/app/fonts/general-sans/*.woff2`:
  - Mengunduh dan self-host 4 berat General Sans (Light/Regular/Medium/Semibold) dari Fontshare (lisensi gratis) via `next/font/local`, karena font ini tidak tersedia di Google Fonts.
- `src/app/layout.tsx`:
  - Mengganti Geist Sans dengan `Fraunces` (headline serif, axes opsz/SOFT/WONK, italic) + `General Sans` (body/UI) + `Shippori Mincho` (aksen kanji 宿, tervalidasi mengandung glyph CJK penuh meski terdaftar subset "latin" di metadata next/font).
  - Memperbarui metadata judul/deskripsi situs ke narasi "a place to stay".

#### Desain: Komponen
- `src/components/hero.tsx`: Headline dua baris baru ("One *roof*." serif bold/italic + "Every service welcome." sans light), tagline kanji 宿 berwarna moss dengan romanisasi "(yado) - a place to stay.", layout asimetris rata-kiri (bukan simetris terpusat), search bar & tombol tanpa `rounded-full`/glow, micro-interaction diturunkan ke underline/opacity halus (menghapus wrapper `whileHover scale` yang terkesan seperti dashboard).
- `src/components/navbar.tsx`: Disederhanakan jadi wordmark serif + kanji kecil, label nav huruf besar dengan tracking lebar, underline-on-hover, search trigger & kbd hint berbentuk kotak hairline (bukan pill).
- `src/components/service-grid.tsx`: Bento grid kartu diganti total menjadi **daftar "room directory"** - satu kolom, setiap layanan dipisah garis hairline (bukan kartu berbayang), tab filter jadi underline-sliding (bukan pill terisi), badge lifecycle terpusat lewat helper baru `lifecycleAccent` di `src/lib/services.ts` (production=moss, staging=ochre, development=indigo) menggantikan field `accent` per-layanan yang tadinya hardcode warna sky/emerald/purple/amber.
- `src/components/interactive/tilt-card.tsx`: **Dihapus** - efek tilt/glare 3D sudah tidak dipakai di mana pun setelah service-grid pindah ke gaya list hairline (bertentangan dengan aturan "no glow/scale-up" desain baru).
- `src/components/status-dashboard.tsx`, `src/components/status-row.tsx`, `src/components/status-dot.tsx`: Recolor dari emerald/red neon ke moss/clay, border tebal diganti hairline.
- `src/components/footer.tsx`: Disederhanakan jadi signature kanji 宿 di tengah + link minimal, sesuai spek "small kanji as a signature mark".
- `src/components/background-glow.tsx`: Grid teknis + orb neon (fuchsia/sky) diganti tekstur washi (noise SVG `feTurbulence` tipis) + wash hangat indigo/moss redup.
- `src/components/sso-login-button.tsx`, `src/components/sso-profile-widget.tsx`, `src/components/theme-toggle.tsx`, `src/components/interactive/command-palette.tsx`: Recolor menyeluruh ke token indigo/moss/ochre/clay + hairline, radius kotak dipertajam (bukan rounded-2xl/pill).
- `src/components/telemetry/uptime-bar-graph.tsx`, `src/components/telemetry/incident-history.tsx`: Recolor status (operational=moss, degraded=ochre, outage=clay, maintenance=indigo), border hairline.
- `src/app/docs/page.tsx`, `src/app/status/page.tsx`: Recolor total + restyle tabel/kartu metrik ke gaya hairline-divided, heading pakai `font-serif`.
- `src/app/page.tsx`: Menambahkan `border-t border-hairline` di antar-seksi sebagai pembatas "kertas washi" dan menambah animasi stagger `whileInView` pada `ServiceGrid` agar konsisten dengan aturan animasi wajib di `AGENTS.md`.

#### Perbaikan Fungsional: Telemetri Data Nyata (bukan angka palsu)
- `src/app/api/health/route.ts`:
  - Menambahkan probe real untuk `libs` via env `LIBS_HEALTH_URL` (pola sama seperti `sso`/`malas`, default `unknown` jika belum dikonfigurasi - bukan tebakan).
  - `telemetry` (aplikasi ini sendiri) dan `gateway` (edge ingress yang meneruskan request ini) sekarang dianggap "up" secara self-evident dengan latency dihitung dari durasi request itu sendiri (`Date.now() - requestStarted`), menggantikan angka hardcode `latencyMs: 8`.
- `.env.example`: Menambahkan `LIBS_HEALTH_URL` (kosong/opsional, dengan komentar penjelasan).
- `src/lib/telemetry.ts` (**rewrite total**):
  - Menghapus seluruh data 90-hari yang di-hardcode manual (`specialDays` naratif yang ditulis tangan, terpisah dari `incidents.json` yang sebenarnya).
  - Bucket 90-hari kini diturunkan langsung dari `src/data/incidents.json`: field `date` ("Today (...)" / "N days ago") di-parse jadi offset hari, `severity` dipetakan ke `DayStatus`, dan `duration` (mis. "38 minutes") dipakai menghitung persentase uptime hari itu secara matematis - bukan angka karangan.
  - `uptime90d` per layanan kini rata-rata asli dari 90 bucket, bukan konstanta (`99.98`, `99.94`, dst.) yang ditulis tangan.
  - `currentStatus` dan `avgLatencyMs` sekarang diisi dari `HealthResponse` live (`useHealth()`/`/api/health`) via parameter baru `getTelemetryData(liveHealth)`, bukan `currentStatus: "up"` yang di-hardcode untuk semua layanan.
- `src/app/status/page.tsx`:
  - Memperbaiki bug nyata di tabel "Live Endpoint Probes": kondisi `isLiveUp ? "Operational" : "Operational"` sebelumnya selalu menampilkan "Operational" apa pun hasil probe-nya - sekarang menampilkan status asli (Operational/Unreachable/No live probe) dari data live.
  - Banner utama dan kartu ringkasan metrik ("90-Day Uptime", "Avg Latency", "90d Incidents") kini dihitung dari data live + incident log asli, bukan teks statis "All Systems Operational" / "90-Day SLA Target: Met".
  - Memperbaiki bug tampilan lanjutan: `networkAvgLatencyMs` sempat bertipe `number` dengan fallback `0`, sehingga probe self-check yang benar-benar bernilai `0ms` salah tertampil sebagai "-" (dikira "tidak ada data"). Diperbaiki dengan tipe `number | null` agar `0ms` asli tetap tampil sebagai `0ms`.

#### Copy
- Headline, tagline, dan seluruh copy pendukung (hero, feature strip, status page, docs) diselaraskan ke nuansa "digital ryokan" sambil tetap mengikuti Aturan 3 (bahasa teknis lugas, tanpa hiperbola marketing, tanpa em dash).

#### Penyesuaian Lanjutan (feedback langsung)
- `src/components/background-glow.tsx`: Tekstur washi paper dinaikkan intensitasnya (dua layer noise - mottling kasar + grain halus, masing-masing di-desaturasi lewat `feColorMatrix`) karena versi awal terlalu polos/nyaris tak terlihat; tetap dijaga redup (opacity 0.05-0.13) dan blend `multiply`/`overlay` agar tidak mengganggu keterbacaan UI atau terkesan berlebihan.
  - Revisi lanjutan: layer noise `feTurbulence` asimetris (baseFrequency `0.012 0.09`) ternyata terlihat seperti serat kayu, bukan kertas. Diganti dengan kisi tipis ala shoji (`repeating-linear-gradient` crosshatch, geometris & non-organik) + satu layer grain isotropik (baseFrequency simetris `0.85`, tanpa arah dominan) agar kesan tetap modern dan Jepang tanpa terlihat seperti tekstur kayu.
- `src/app/docs/page.tsx`: Seksi 4 ("Telemetry & Incident Reporting") sekarang dibatasi hanya untuk sesi dengan role Owner/Sysadmin (`useSsoSession`) - pengunjung biasa melihat panel "Admin access required" dengan tombol sign-in, bukan instruksi CLI/AI mentah. Catatan: ini adalah gerbang tampilan sisi klien (bukan proteksi server-side), konsisten dengan pola sesi demo yang sudah ada di `use-sso-session.ts`.
- `src/components/interactive/cursor-spotlight.tsx`: **Dihapus** beserta pemanggilannya di `src/app/layout.tsx` - efek radial glow lembut yang mengikuti kursor dihilangkan sepenuhnya atas permintaan langsung.

### v0.5.0 - 2026-09-19

Background art Bauhaus line-art, favicon kanji final, scrollbar bertema, dan pengetatan admin gate di `/docs`:

- `src/components/background-glow.tsx` (**rewrite total**, beberapa iterasi berdasarkan referensi visual langsung dari user):
  - Kisi shoji sebelumnya diganti komposisi "Bauhaus line-art": motif `Ribbon` (bundel garis paralel yang membentuk satu tikungan membulat - radius bertambah per salinan dengan titik pusat arc yang sama, sehingga benar-benar sejajar, bukan sekadar garis yang saling tumpuk) dan `RingCluster` (lingkaran konsentris) plus beberapa titik solid, satu warna tinta (`text-foreground`) mengikuti tema, terinspirasi dari referensi poster "Bauhaus 1919" dan pola pipa/ribbon garis paralel yang diberikan user.
  - Container diubah dari `position: fixed` ke `position: absolute` (dan `body` di `layout.tsx` diberi `position: relative` sebagai containing block) agar background ikut scroll bersama halaman, bukan diam menempel di viewport.
  - Sempat over-koreksi (density 9 garis + opacity 0.16-0.22 + ribbon cermin ganda) sampai membanjiri kontras judul "One roof." - direvisi ke komposisi yang tetap kaya (beberapa motif tersebar di sepanjang halaman) tapi opacity dikembalikan ke level yang tidak mengganggu keterbacaan (0.09/0.13).
  - Bug tabrakan di lebar desktop (~900px): bundel garis vertikal pada motif hero memotong langsung baris "Every service welcome." karena ukurannya tetap besar sementara tata letak hero berubah di breakpoint lebar. Diperbaiki dengan mengecilkan & memindahkan motif hero jadi aksen sudut kecil (14rem, disandarkan ke sudut kiri-atas, tidak menjangkau baris kedua headline sama sekali).
- `src/app/icon.svg`: Sempat dicoba diganti mark geometris Bauhaus (lingkaran/segitiga/kotak solid, lalu versi line-art), tapi dikembalikan ke kanji 宿 sesuai instruksi eksplisit user ("favicon tetep pake kanji") - perubahan Bauhaus diarahkan ke background, bukan favicon. `src/app/favicon.ico` (ikon segitiga default Next.js) dihapus karena digantikan `icon.svg`.
- `src/app/globals.css`: Menambahkan styling scrollbar bertema (`scrollbar-color`/`scrollbar-width` untuk Firefox, `::-webkit-scrollbar*` untuk Chrome/Edge/Safari) - thumb tipis translucent mengikuti warna foreground, menggantikan scrollbar default OS yang kontras dengan palet krem/indigo.
- `src/app/docs/page.tsx`: Gerbang admin pada Seksi 4 diperketat - alih-alih menampilkan panel "Admin access required", seksi tersebut (judul dan isinya) kini **sepenuhnya tidak dirender** untuk pengunjung non-admin (`{isAdmin && (...)}`), sehingga halaman terlihat berhenti wajar di Seksi 3 tanpa memberi petunjuk bahwa ada seksi tersembunyi.

### v0.3.0 - 2026-09-18

Ganti nama proyek dan pembaruan domain:
- Mengubah nama proyek secara keseluruhan dari "White Archive" menjadi "Yado" (terinspirasi dari karakter Kanji 宿, yang berarti penginapan/tempat singgah; memberikan kesan "rumah buat koleksimu").
- Mengubah seluruh referensi domain dari `*.suryatmaja.dev` menjadi `*.yado.my.id`.
- Pembaruan nama proyek, domain, dan referensi file pada semua file yang terkait di dalam repositori `yado`.
- Perubahan selaras juga diterapkan pada repositori turunan `sso.yado`.

### v0.2.16 - 2026-09-05

Pemisahan Data Insiden, CLI Helper, dan Dokumentasi Dual-Mode (AI + Human):
- `src/data/incidents.json`:
  - Memisahkan data riwayat insiden dan pemeliharaan terjadwal dari kode sumber ke file JSON terpusat agar mudah dikelola oleh manusia (GitOps/VS Code) maupun agen AI.
- `src/lib/telemetry.ts`:
  - Mengimpor data insiden langsung dari `src/data/incidents.json`.
- `scripts/incident-cli.mjs`:
  - Membuat tool CLI interaktif berbasis Node.js untuk operasi incident management (`list`, `create`, `update`, `resolve`) yang ramah dijalankan oleh Claude Code, Gemini CLI, Antigravity, maupun manusia melalui terminal.
- `package.json`:
  - Menambahkan script shortcut: `incident`, `incident:list`, `incident:create`, `incident:update`, `incident:resolve`.
- `AGENTS.md`:
  - Menambahkan Aturan 6: Protokol Standar AI Agent untuk logging insiden, konversi waktu UTC, format ID, dan validasi build.
- `README.md`:
  - Menambahkan panduan komprehensif dengan trigger khusus: `## 🤖 If you are an AI Assistant (Claude Code, Gemini CLI, Cursor, Antigravity) - READ THIS` serta panduan praktis untuk Product Owner homelab (via AI, via CLI, via JSON langsung, dan webhook otomatis Uptime Kuma).
- `src/app/docs/page.tsx`:
  - Menambahkan Seksi 4: "Telemetry & Incident Reporting (AI & Homelab Workflows)" pada halaman dokumentasi web resmi (`/docs`) lengkap dengan box contoh prompt AI conversational, perintah terminal CLI, dan panduan GitOps JSON.

### v0.2.15 - 2026-09-05

Pembuatan Halaman Khusus Status & OpenTelemetry 90 Hari (`/status`):
- `src/lib/telemetry.ts`:
  - Membuat modul data telemetri historis yang menghasilkan 90 bucket harian per microservice (`sso`, `malas`, `libs`, `pore`, `gateway`) dengan kalkulasi SLA uptime 90 hari dan latency rata-rata.
  - Menambahkan dataset riwayat insiden dan pemeliharaan terjadwal lengkap dengan timeline update (`Investigating` -> `Monitoring` -> `Resolved`/`Completed`).
- `src/components/telemetry/uptime-bar-graph.tsx`:
  - Membuat komponen visualisasi 90 bar harian dengan pewarnaan dinamis (*operational* hijau, *degraded* kuning, *outage* merah, *maintenance* biru langit).
  - Dilengkapi tooltip interaktif melayang saat kursor di-hover pada masing-masing hari (menampilkan tanggal, status, persentase uptime, dan ringkasan insiden).
- `src/components/telemetry/incident-history.tsx`:
  - Menampilkan daftar insiden dan laporan pasca-insiden (*post-mortem*) 90 hari terakhir secara kronologis dan transparan.
- `src/app/status/page.tsx`:
  - Halaman khusus `/status` dengan banner utama ("All Systems Operational" & heartbeat 30 detik), kartu ringkasan metrik jaringan, seksi grafik 90 bar per layanan, tabel live endpoint probe, dan log riwayat insiden.
- `src/components/navbar.tsx` & `src/components/status-dashboard.tsx`:
  - Menghubungkan tautan navigasi "System Status" dan tombol kartu status launcher langsung ke halaman dedicated `/status`.

### v0.2.14 - 2026-09-05

Penghapusan efek getar tombol hero & Penyeragaman bahasa 100% Inggris:
- `src/components/hero.tsx`:
  - Menghapus wrapper magnetik elastis (`Magnetic`) yang menyebabkan getaran/wobble aneh saat kursor melintas di tombol "Sign in" dan "Browse Services".
  - Menggantinya dengan transisi interaksi standar Framer Motion yang stabil dan halus (`whileHover={{ scale: 1.025, y: -1 }}` dan `whileTap={{ scale: 0.98 }}`).
- Penyeragaman Bahasa (100% English Harmonization):
  - `src/components/hero.tsx`: Menyeragamkan seluruh copy hero ("Browse Services", status pill, search placeholder, feature items).
  - `src/components/navbar.tsx`: Menyeragamkan label navigasi ("Services", "System Status", "Documentation").
  - `src/lib/services.ts`: Menyeragamkan deskripsi, tagline, dan quick link microservices.
  - `src/components/service-grid.tsx`: Menyeragamkan filter tab ("All", "Production", "Development", "Staging"), header, metrik kartu, dan tombol aksi.
  - `src/components/sso-profile-widget.tsx`: Menyeragamkan menu akun, tag status, dan tombol aksi masuk/keluar.
  - `src/components/status-dashboard.tsx`: Menyeragamkan label telemetri ("System Telemetry & Health", "System Status", "All systems operational", "Partial system outage", "Updated:", "Updating...").
  - `src/components/footer.tsx`: Menyeragamkan catatan hak cipta dan status SSO ("All services SSO-enabled.").
  - `src/app/docs/page.tsx`: Menerjemahkan seluruh isi dokumentasi arsitektur Yado ke bahasa Inggris teknis yang lugas dan bersih.

### v0.2.13 - 2026-09-05

Perbaikan 2 isu Next.js (Hydration Mismatch & Anime.js Deprecation):
- `src/components/sso-profile-widget.tsx` & `src/hooks/use-sso-session.ts`:
  - Menyelesaikan isu *Hydration Mismatch* antara Server-Side Rendering (SSR) dan Client Hydration pada tombol widget SSO dengan memastikan struktur DOM awal selalu konsisten sebelum status sesi lokal diterapkan.
- `src/components/interactive/animated-headline.tsx`:
  - Menyelesaikan isu *Deprecation Warning* Anime.js v4 (`text.split() is deprecated`) dengan mengganti impor dan pemanggilan fungsi ke `splitText()`.

### v0.2.12 - 2026-09-05

Penerapan mode interaksi aplikasi native (Nonaktifkan text selection & blog cursor):
- `src/app/globals.css`:
  - Menetapkan `user-select: none` pada elemen global (`body`) sehingga pengguna tidak dapat memblok/menyorot teks atau melakukan copy-paste layaknya situs artikel blog.
  - Mengubah kursor default menjadi panah aplikasi biasa (`cursor: default`) tanpa kursor I-beam teks pada konten umum.
  - Memastikan seluruh elemen interaktif (tombol, tautan, kartu) memiliki indikator klik yang konsisten (`cursor: pointer`).
  - Hanya kolom input form pencarian yang tetap mempertahankan `user-select: text` dan `cursor: text` untuk kebutuhan pengetikan kata kunci.
- `src/app/layout.tsx` & `src/app/page.tsx`: Menghapus utility class seleksi teks (`selection:...`).

### v0.2.11 - 2026-09-05

Otomatisasi telemetri sistem (Heartbeat Auto-refresh 30 Detik):
- `src/hooks/use-health.ts`: Menambahkan timer interval 1 detik untuk menghitung mundur (*countdown*) siklus auto-refresh 30 detik secara presisi tanpa perlu memicu tombol manual.
- `src/components/status-dashboard.tsx`: Mengganti tombol manual dengan badge indikator otomatis `Auto-refresh: {countdown}s` yang dilengkapi animasi radar pulse hijau saat proses pembaruan data telemetri berlangsung.

### v0.2.10 - 2026-09-05

Penambahan widget profil SSO:
- `src/hooks/use-sso-session.ts`: Membuat hook pendeteksi status sesi login SSO (menyimpan data profil pengguna, alur login/logout, dan fungsi simulasi sesi demo).
- `src/components/sso-profile-widget.tsx`: Membuat komponen widget profil di header:
  - Mode Guest: Menampilkan tombol `SSO Sign In` dan opsi simulasi sesi.
  - Mode Authenticated: Menampilkan avatar dengan indikator hijau aktif, nama pengguna, serta menu dropdown interaktif (detail akun, link ke portal SSO, dan tombol keluar).
- `src/components/navbar.tsx`: Mengintegrasikan `SsoProfileWidget` ke sisi kanan header.

### v0.2.9 - 2026-09-05

Penyederhanaan dan pemasangan kembali tombol toggle tema:
- `src/components/theme-toggle.tsx`:
  - Menghapus opsi *system* dari urutan tombol agar pengguna dapat langsung beralih instan antara mode **Gelap (Dark)** dan **Terang (Light)** dalam satu kali klik.
  - Menambahkan animasi rotasi dan skala halus pada ikon Matahari (`Sun`) dan Bulan (`Moon`) menggunakan `framer-motion`.
- `src/components/navbar.tsx`: Memasang kembali tombol `ThemeToggle` pada sisi kanan header navigasi.
- `src/components/theme-provider.tsx`: Memastikan tema awal tetap mendeteksi sistem operasi secara default, namun tetap mengizinkan perubahan manual melalui tombol.

### v0.2.8 - 2026-09-05

Penyempurnaan animasi filter status kanal layanan:
- `src/components/service-grid.tsx`:
  - Menghilangkan `mode="popLayout"` pada AnimatePresence yang sebelumnya menyebabkan elemen keluar mengalami loncatan posisi (absolute offset collision) di dalam CSS grid.
  - Menerapkan `layout="position"` dengan transisi terpisah untuk `opacity` dan pergeseran posisi kartu, sehingga kartu yang bertahan atau berpindah kolom bergerak secara presisi dan mulus.
  - Menambahkan animasi kapsul penyorot aktif (*sliding pill highlight*) berbasis `layoutId="activeFilterPill"` dengan kurva pegas (*spring physics*), membuat peralihan tombol tab filter bergerak elastis dan natural.

### v0.2.7 - 2026-09-05

Penerapan animasi halaman dokumentasi dan penetapan aturan proyek:
- `src/app/docs/page.tsx`: Mengintegrasikan `framer-motion` dengan animasi *stagger entrance* (fade-in dan slide-up bertahap) pada breadcrumb, header, tabel layanan, dan kartu arsitektur.
- `.agents/rules/ui-consistency-and-animation.md`: Membuat aturan resmi proyek yang mewajibkan penggunaan animasi transisi masuk pada setiap halaman baru, smooth scrolling Lenis, bahasa anti-AI slop, dan pencatatan changelog.
- `AGENTS.md`: Menambahkan rangkuman standar desain dan aturan animasi agar selalu ditaati oleh sistem agent.

### v0.2.6 - 2026-09-05

Otomatisasi tema mengikuti sistem dan animasi transisi halus:
- `src/components/navbar.tsx`: Menghapus tombol toggle tema manual.
- `src/components/theme-provider.tsx`: Mengunci tema agar 100% otomatis mengikuti preferensi sistem operasi pengguna (*OS appearance*) dan mengaktifkan transisi perubahan tema.
- `src/app/globals.css`: Menambahkan transisi CSS (`background-color`, `border-color`, `color` dengan durasi 0.4s dan kurva bezier halus) agar pergantian tema gelap/terang berlangsung mulus tanpa sentakan tajam.

### v0.2.5 - 2026-09-05

- `src/components/navbar.tsx`: Menambahkan interaksi klik pada logo/teks "Yado". Jika sedang berada di beranda, klik logo akan menggulir halaman langsung ke posisi paling atas (*smooth scroll to top*) menggunakan engine Lenis.

### v0.2.4 - 2026-09-05

Penambahan halaman dokumentasi internal dan perbaikan navigasi scroll:
- `src/components/navbar.tsx`:
  - Mengintegrasikan hook `useLenis` untuk navigasi anchor `#services` dan `#status`. Perpindahan ke seksi target kini berjalan dengan animasi *smooth scroll* tanpa sentakan (tanpa blink atau reload).
  - Mengubah tautan "Dokumentasi" agar mengarah ke rute internal `/docs` menggunakan `next/link`.
- `src/app/docs/page.tsx`:
  - Membuat halaman dokumentasi arsitektur internal Yado (peta ekosistem homelab, spesifikasi platform `libs` (Go) dan reader engine `Pore.js` (TypeScript), serta alur autentikasi OAuth2 SSO).

### v0.2.2 - 2026-09-05

Pembaruan header navigasi:
- `src/components/navbar.tsx`: Mengubah header dari bentuk floating pill menjadi *Clean Edge-to-Edge Sticky Header* (`top-0`, border bawah tipis, backdrop blur).
- Menambahkan tautan navigasi internal (`Layanan`, `Status Sistem`, dan `Dokumentasi`).
- Menyederhanakan tampilan logo dan status dot operasional.
- `src/components/hero.tsx`: Menyesuaikan padding atas (`pt-28 sm:pt-36`) agar proporsional terhadap tinggi header baru.

### v0.2.1 - 2026-09-05

Perbaikan tata letak, proporsi spasi, dan penyatuan footer:
- `src/components/footer.tsx`: Menghapus garis horizontal pembatas (`border-t`) yang membuat footer terkesan terputus dari layout halaman.
- `src/components/status-dashboard.tsx`: Menambahkan header judul seksi "Status Sistem" agar seimbang dan konsisten dengan seksi katalog layanan.
- `src/components/hero.tsx`: Menambah padding vertikal atas dan bawah agar memiliki ruang nafas yang cukup terhadap navbar dan seksi di bawahnya.
- `src/app/page.tsx`: Menyesuaikan spasi antar seksi (`py-16 sm:py-24`) agar tidak terlalu rapat dan menempatkan footer secara mandiri di bagian bawah halaman.

### v0.2.0 - 2026-09-05

Pembaruan antarmuka launcher: integrasi command palette, filter status aplikasi, perbaikan sistem scroll, dan restrukturisasi kartu layanan.

#### File Baru
- `src/components/navbar.tsx`: Header navigasi dengan indikator status, tombol shortcut pencarian (Ctrl+K), link SSO, dan toggle tema.
- `src/components/interactive/command-palette.tsx`: Dialog pencarian cepat untuk berpindah antar layanan dengan shortcut keyboard (panah, enter, dan angka 1-9).
- `src/components/interactive/command-palette-provider.tsx`: Wrapper client component untuk me-render dialog pencarian di root layout.
- `src/hooks/use-command-palette.ts`: Hook dan event listener kustom untuk kontrol state buka/tutup palette.

#### File Dimodifikasi
- `src/lib/services.ts`:
  - Penambahan field pada tipe `ServiceDef`: `category`, `lifecycle` (`production` | `staging` | `development`), `version`, `progress`, `iconName`, `accent`, dan `quickLinks`.
  - Penambahan entri layanan `pore` (status development) dan `telemetry` (status staging).
- `src/components/hero.tsx`:
  - Penambahan tombol trigger pencarian langsung di area hero.
  - Penyesuaian deskripsi launcher dan ringkasan fitur sistem.
- `src/components/service-grid.tsx`:
  - Penambahan tab filter status (`all`, `production`, `development`, `staging`).
  - Penambahan progress bar pengerjaan untuk layanan dalam tahap pengembangan.
  - Penambahan info latency dan tautan cepat (source code dan dokumentasi).
- `src/app/page.tsx`:
  - Penghapusan ketergantungan `SectionSnap` dan layout 100vh kaku agar scroll berjalan normal.
- `src/app/layout.tsx`:
  - Integrasi komponen `Navbar` dan `CommandPaletteProvider`.
- `src/app/api/health/route.ts`:
  - Penambahan respons status untuk service `telemetry` dan `pore`.

### v0.1.0 - Baseline (Commit: 5cc6c5d)
- Implementasi awal landing page 3 seksi berbasis ScrollSection dan SectionSnap.
