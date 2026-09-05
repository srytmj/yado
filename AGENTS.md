<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Standar Desain, Animasi, dan Konsistensi White Archive

1. **Wajib Animasi Transisi Masuk:** Setiap halaman (`page.tsx`) dan seksi utama wajib menggunakan Framer Motion dengan pola stagger fade/slide-up (`[0.16, 1, 0.3, 1]`). Halaman dilarang muncul statis tanpa animasi.
2. **Smooth Scrolling:** Navigasi ke ID anchor (`#services`, `#status`, dll.) wajib menggunakan `useLenis` (`lenis.scrollTo(...)`) agar transisi gulir berjalan halus tanpa kedipan.
3. **Bahasa Anti-AI Slop:** Hindari kata marketing hiperbola dan emoji berlebihan. Gunakan istilah teknis ringkas dan lugas.
4. **Tema Otomatis OS:** Tema mengikuti sistem operasi secara otomatis dengan transisi CSS warna yang halus.
5. **Wajib Catat Changelog:** Setiap perubahan atau penambahan file wajib dicatat secara terperinci di `CHANGELOG.md`.
6. **Protokol Telemetri & Log Insiden (AI Agent Rules):**
   - File sumber data utama insiden berada di `src/data/incidents.json`.
   - AI dilarang menulis format tanggal lokal yang ambigu; gunakan format standar UTC untuk updates timestamp (`HH:MM UTC`) dan format tanggal deskriptif (`Month DD, YYYY` atau `X days ago` / `Today (Month DD, YYYY)`).
   - Jalankan helper script `node scripts/incident-cli.mjs [create|update|resolve|list]` atau edit `src/data/incidents.json` secara langsung dengan mematuhi schema TypeScript `IncidentRecord` di `src/lib/telemetry.ts`.
   - Severity valid: `minor`, `major`, `maintenance`.
   - Status investigasi valid: `Investigating`, `Identified`, `Monitoring`, `Resolved`, `Completed`.
   - Validasi perubahan dengan menjalankan `npm run build` sebelum menyelesaikan tugas.
