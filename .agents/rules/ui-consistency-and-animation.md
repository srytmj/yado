# Standar Desain, Animasi, dan Konsistensi White Archive

Dokumen aturan ini wajib dipatuhi oleh setiap pengembang dan AI agent dalam membuat atau memodifikasi komponen dan halaman di proyek White Archive.

---

## 1. Animasi Masuk Halaman & Komponen (Entrance Animation)
- **Wajib Animasi Transisi:** Setiap halaman baru (`page.tsx`) dan seksi utama TIDAK BOLEH tampil secara statis atau mendadak.
- **Implementasi:** Gunakan `framer-motion` dengan konfigurasi standar:
  - Container:
    ```tsx
    const container = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.05 },
      },
    };
    ```
  - Item:
    ```tsx
    const item = {
      hidden: { opacity: 0, y: 16 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      },
    };
    ```

## 2. Navigasi & Smooth Scrolling
- Navigasi anchor horizontal maupun vertikal (`#services`, `#status`, dll.) **wajib menggunakan smooth scrolling** via engine `useLenis` (`lenis.scrollTo(...)`). Dilarang keras menggunakan *hard jump* yang menyebabkan kedipan (blink) atau sentakan layar.
- Navigasi antar halaman wajib menggunakan komponen `<Link>` dari `next/link`.

## 3. Gaya Bahasa & Anti-AI Slop
- Dilarang menggunakan kalimat marketing klise AI (misal: *powerhouse*, *seamless*, *cutting-edge*, *revolutionary*).
- Gunakan bahasa yang ringkas, teknis, objektif, dan natural.
- Hindari penggunaan deretan emoji dekoratif yang berlebihan.

## 4. Tema Sistem
- Tema aplikasi terkunci otomatis mengikuti preferensi sistem operasi pengguna (OS Dark/Light mode).
- Seluruh elemen layout wajib memiliki CSS transition yang halus (`0.4s cubic-bezier(0.16, 1, 0.3, 1)`) agar pergantian warna latar dan border tidak terjadi secara mendadak.

## 5. Dokumentasi Perubahan Wajib (Changelog)
- Setiap modifikasi atau penambahan file baru wajib didokumentasikan di `CHANGELOG.md` lengkap dengan nomor versi, nama file yang disentuh, dan penjelasan teknis perubahan.
