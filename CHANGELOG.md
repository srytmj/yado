# Changelog - White Archive

Catatan riwayat perubahan kode, arsitektur, penambahan komponen, dan prosedur rollback.

## Rollback

Untuk mengembalikan kode ke commit baseline (v0.1.0):
```bash
git checkout 5cc6c5d
# atau batalkan perubahan lokal:
git restore .
```

## Riwayat Perubahan

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
  - Menambahkan panduan komprehensif dengan trigger khusus: `## 🤖 If you are an AI Assistant (Claude Code, Gemini CLI, Cursor, Antigravity) — READ THIS` serta panduan praktis untuk Product Owner homelab (via AI, via CLI, via JSON langsung, dan webhook otomatis Uptime Kuma).
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
  - `src/app/docs/page.tsx`: Menerjemahkan seluruh isi dokumentasi arsitektur White Archive ke bahasa Inggris teknis yang lugas dan bersih.

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

- `src/components/navbar.tsx`: Menambahkan interaksi klik pada logo/teks "White Archive". Jika sedang berada di beranda, klik logo akan menggulir halaman langsung ke posisi paling atas (*smooth scroll to top*) menggunakan engine Lenis.

### v0.2.4 - 2026-09-05

Penambahan halaman dokumentasi internal dan perbaikan navigasi scroll:
- `src/components/navbar.tsx`:
  - Mengintegrasikan hook `useLenis` untuk navigasi anchor `#services` dan `#status`. Perpindahan ke seksi target kini berjalan dengan animasi *smooth scroll* tanpa sentakan (tanpa blink atau reload).
  - Mengubah tautan "Dokumentasi" agar mengarah ke rute internal `/docs` menggunakan `next/link`.
- `src/app/docs/page.tsx`:
  - Membuat halaman dokumentasi arsitektur internal White Archive (peta ekosistem homelab, spesifikasi platform `libs` (Go) dan reader engine `Pore.js` (TypeScript), serta alur autentikasi OAuth2 SSO).

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
