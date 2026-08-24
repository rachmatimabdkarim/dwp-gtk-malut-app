# Arsitektur & Panduan Pengembang - DWP BGP Maluku Utara

Aplikasi Portal Publik dan Sistem Informasi Manajemen Kegiatan Dharma Wanita Persatuan (DWP) BGP Maluku Utara berbasis Single Page Application (SPA).

---

## 1. Tech Stack Utama
* **Frontend Framework:** React 18 + TypeScript + Vite
* **Styling & Icons:** Tailwind CSS + Lucide React
* **Backend Database:** Supabase Cloud PostgreSQL
* **Hosting & Deployment:** Vercel CI/CD Pipeline

---

## 2. Struktur Direktori
```text
src/
├── components/
│   ├── admin/       # Dashboard, Manajemen Anggota, 5-Stage Workflow, Absensi
│   ├── auth/        # Login Page & Form Autentikasi
│   ├── common/      # Komponen umum (Date picker, Image compressor)
│   └── public/      # Halaman Publik (Hero, Sambutan, Visi Misi, Warta, Agenda)
├── context/         # AppContext.tsx (Global State Provider)
├── lib/             # Inisialisasi Supabase Client (supabase.ts)
├── services/        # apiService.ts (Auth), cloudSync.ts (Supabase CRUD Adapter)
├── types/           # Definisi TypeScript Interface & Enums
└── utils/           # Helper format tanggal, kontrol akses RBAC, kompresi gambar
```
