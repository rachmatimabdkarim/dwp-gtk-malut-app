# Dharma Wanita Persatuan — Kantor GTK Provinsi Maluku Utara

Aplikasi Web Portal Resmi + Sistem Informasi Manajemen Internal **DWP Kantor GTK Provinsi Maluku Utara**
(Kantor Guru dan Tenaga Kependidikan, Kemendikdasmen).

- **Situs live:** https://dwp-gtk-malut-app.vercel.app
- **Alamat kantor:** Jl. Raya Rum, RT.01 RW.01, Kec. Tidore Utara, Kota Tidore Kepulauan, Provinsi Maluku Utara

---

## 🚀 Teknologi
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide React
- **Backend/Auth:** Supabase (PostgreSQL + Auth + RLS) — database cloud `ucbjqyqxqmgaixepngtx` (ap-southeast-1)
- **Hosting:** Vercel (auto-deploy dari `origin/main`)

## 🗂️ Struktur Direktori
```text
src/
├── components/
│   ├── admin/     # Dashboard, Anggota, Workflow Proposal 5-Tahap, Absensi, Dokumen SK/ST, LPJ, CMS, Log
│   ├── auth/      # LoginPage
│   ├── common/    # Komponen umum (CustomDateInput, ImageUploadCompressor, dll)
│   └── public/    # Halaman publik (Hero, Sambutan, VisiMisi, Struktur, Berita, Agenda, Footer)
├── context/       # AppContext.tsx — state global + seed + sinkronisasi
├── lib/           # supabase.ts — inisialisasi client Supabase
├── services/      # apiService.ts (sesi/auth), cloudSync.ts (adapter CRUD cloud)
├── types/         # Definisi tipe TypeScript
└── utils/         # dateFormatter, RoleAccessControl (RBAC), dll
```

## 🔐 Keamanan & Otentikasi (penting — sudah diterapkan)
- **Login = Supabase Auth** (email + password). Tidak ada lagi password plaintext, sesi palsu, atau
  password universal cadangan.
- **6 akun pengurus** (super admin, ketua, wakil ketua, sekretaris, bendahara, ketua bidang) terdaftar di
  Supabase Auth; peran tersimpan di `app_metadata.dwp_role` (JWT) — sumber kebenaran server.
- **RLS aktif di semua tabel.** Anonim hanya bisa membaca: `news` yang terbit, `site_config`, dan dua
  *view* publik (`v_members_publik`, `v_kegiatan_publik`) yang TIDAK memuat data pribadi (NIP, kontak,
  golongan darah, keluarga, anggaran). Semua tulis/ubah wajib login sesuai peran.
- Data privat (anggota, proposal, absensi, LPJ, log, akun, dokumen, notifikasi) hanya untuk pengguna login.
- Kolom `password_hash` sudah dihapus dari `user_accounts`.

> Catatan teknis: validator email Supabase menolak domain `@malut.go.id`, sehingga email login memakai
> alias `dwpgtk.<username>@gmail.com`. Username & peran di aplikasi tidak berubah.

## 💾 Penyimpanan Data
Arsitektur **lokal-cache + cloud**:
- Data publik & kerja disinkronkan ke Supabase (11 tabel: `members`, `activity_proposals`, `news`,
  `site_config`, `attendance_records`, `execution_reports`, `approval_logs`, `user_accounts`,
  `activity_documents`, `notifications`, `kop_surat_config`).
- Mode anonim/offline: baca publik via view + cache LocalStorage; **tidak ada tulis cloud**.
- Seed demo hanya di-push ke cloud saat tabel terkait masih kosong; notifikasi seed demo tidak pernah
  dikirim ke cloud.

## 🛠️ Menjalankan di Local (localhost-first)
```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4000   # akses http://localhost:4000
npm run build                                # quality gate: tsc + vite, Zero TS Error
```
Env lokal (`.env.local`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## 🚦 Alur Rilis (WAJIB — lihat AGENTS.md)
1. Semua pengembangan & uji dilakukan di **localhost:4000**.
2. Lolos `npm run build` (Zero TS Error) + verifikasi visual/QA.
3. **Push ke `origin/main` hanya dengan izin tertulis pemilik** → Vercel auto-deploy (±1–2 menit).
4. Skema Supabase diubah hanya via SQL terverifikasi (kompatibel mundur / zero-downtime).

## 📝 Catatan Rilis Terbaru
- **Keamanan (RLS + Auth):** login Supabase Auth asli, akun Auth 6 pengurus, RLS 8(+3) tabel, view publik
  aman, hapus backdoor password & kolom password_hash.
- **Sinkron cloud:** dokumen kegiatan (SK/ST/undangan), notifikasi, kop surat kini tersimpan di Supabase.
- **Perbaikan data:** normalisasi tanggal ISO (anti `RangeError`), seed absensi selaras proposal.
- **Branding & SEO:** hapus semua sisa "Balai Guru Penggerak"/Kemendikbudristek; alamat resmi Tidore
  Kepulauan konsisten; meta description, Open Graph, Twitter card.
