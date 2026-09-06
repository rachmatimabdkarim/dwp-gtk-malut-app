# ⚠️ PANDUAN PENGEMBANGAN & ATURAN KERJA AI (AI AGENT RULES & WORKFLOW SOP)

Dokumen ini adalah aturan wajib (**MANDATORY POLICY**) untuk semua AI coding assistant (Antigravity CLI, Claude Code, Cursor, Copilot, dll.) dan pengembang yang bekerja pada repositori ini.

---

## 1. Aturan Mutlak Deployment & Git Push (Strict Localhost-First)
* **DILARANG KERAS** menjalankan `git push origin main` atau memicu deployment publik Vercel secara otomatis tanpa izin/persetujuan tertulis eksplisit dari pemilik proyek (User).
* Semua penambahan fitur, pengujian kode, integrasi skema database, perbaikan bug, dan refactoring **WAJIB DIUJI LOKAL TERLEBIH DAHULU** di `http://localhost:4000` (atau port dev yang berjalan).
* Jangan pernah menyentuh branch `main` publik saat pekerjaan masih dalam tahap eksperimen atau belum selesai diverifikasi secara visual oleh pengguna.

---

## 2. Alur Kerja Pengembangan (Standard Operating Procedure)

1. **Local Development (Branching):**
   * Gunakan branch kerja lokal (misal: `dev` atau `feature/<nama-fitur>`) jika mengerjakan fitur multi-komponen.
   * Pastikan server lokal berjalan: `npm run dev -- --host 0.0.0.0 --port 4000`.

2. **Verifikasi Kualitas Kode (Quality Gate):**
   * Sebelum mengajukan persetujuan rilis ke pemilik proyek, jalankan validasi build:
     ```bash
     npm run build
     ```
   * Pastikan **Zero TypeScript Error** (`tsc`) dan bundle Vite terbentuk sempurna tanpa warning kritis.

3. **Verifikasi Zero-Downtime:**
   * Pastikan skema database cloud Supabase kompatibel mundur (*backward compatible*) agar pengguna yang sedang aktif di website publik `dwp-gtk-malut-app.vercel.app` tidak mengalami error/crash data.

4. **Konfirmasi Pengguna Sebelum Rilis:**
   * AI/Pengembang harus meminta konfirmasi dengan kalimat: *"Fitur telah selesai diuji di localhost dan lolos `npm run build`. Apakah Anda menyetujui untuk melakukan push ke repositori publik Vercel?"*
   * Hanya lakukan `git push origin main` setelah pengguna memberikan jawaban persetujuan.

---

## 3. Tech Stack & Environment
* **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
* **Database:** Supabase Cloud PostgreSQL
* **Port Dev:** `4000` (Binding: `0.0.0.0`)
* **Environment Keys:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
