# Arsitektur & Panduan Pengembang — DWP Kantor GTK Provinsi Maluku Utara

Aplikasi **Portal Publik + Sistem Informasi Manajemen** DWP Kantor GTK Maluku Utara, SPA React,
dengan cache lokal (LocalStorage) dan **Supabase** sebagai sumber data bersama + otentikasi + RLS.

---

## 1. Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Lucide
- **Data/Auth:** Supabase Cloud PostgreSQL (project ref `ucbjqyqxqmgaixepngtx`, region ap-southeast-1)
- **Deploy:** Vercel (auto-deploy dari `origin/main`)

## 2. Model Data & Hak Akses
### Tabel cloud (semua RLS AKTIF)
| Tabel | Isi | Akses |
|---|---|---|
| `site_config` | Konten CMS situs publik | baca: anonim & login; tulis: admin_master/ketua/sekretaris |
| `news` | Berita | anonim: hanya `is_published=true`; tulis: admin_master/ketua/sekretaris |
| `members` | Profil anggota (NIP, kontak, keluarga → privat) | anonim: **tidak** (via view saja); login: baca semua; tulis pengurus inti |
| `activity_proposals` | Usulan kegiatan + RAB | anonim: tidak; login: baca; tulis peran pengelola workflow |
| `attendance_records` | Absensi digital | login; tulis panitia/pengurus |
| `execution_reports` | LPJ | login; tulis admin/ketua/sekretaris/ketua bidang |
| `approval_logs` | Log persetujuan | login |
| `user_accounts` | Direktori akun (tanpa password) | hanya admin_master/ketua; akun sendiri via `auth_id` |
| `activity_documents` | Dokumen SK Panitia/ST/Undangan | login; tulis pengelola |
| `notifications` | Notifikasi lintas perangkat | login (filter `target_role`); tulis pembuat |
| `kop_surat_config` | Kop surat (1 baris, jsonb) | login; tulis admin/ketua/sekretaris |

### View publik (anonim)
- `v_members_publik` — id, name, jabatan, bidang, unit_kerja, avatar (TANPA NIP/email/telepon/dll)
- `v_kegiatan_publik` — id, title, bidang, organizer, location, start_date, end_date, current_stage
  (TANPA anggaran/uraian privat)

### Peran & RBAC
Peran (`UserRole`): `admin_master, ketua, wakil_ketua, sekretaris, bendahara, admin_bidang, anggota`.
- Sumber kebenaran peran server: `app_metadata.dwp_role` pada JWT (di-set saat akun dibuat).
- Matriks tab/menu di klien: `src/utils/RoleAccessControl.ts`.
- Policy RLS memakai helper SQL `public.current_dwp_role()` / `public.is_role(...)` yang membaca
  `request.jwt.claims -> app_metadata.dwp_role`.

## 3. Otentikasi (Supabase Auth)
- Login: `supabase.auth.signInWithPassword` (email alias `dwpgtk.*@gmail.com`; username asli tetap
  dipakai di UI via `user_accounts.username`).
- Sesi disimpan via supabase-js (`dwp_auth_session`), dipulihkan saat muat + `onAuthStateChange`.
- Ganti password: `src/components/admin/ChangePasswordForm.tsx` (verifikasi password lama → `updateUser`).
- Peran diturunkan dari `app_metadata.dwp_role`, fallback `user_accounts.role`; default `anggota`.
- Mode offline/demo (saat Supabase tidak terjangkau): hanya cache lokal, ditandai `{demo:true}`.

## 4. Pola Sinkronisasi (cloudSync + AppContext)
- Setiap domain: `fetchX` (dari cloud) ↔ `syncX` (upsert `on_conflict=id`), mapping snake_case→camelCase.
- **Anonim:** hanya membaca view publik + `news`(terbit) + `site_config`; TIDAK ada request tulis.
- **Login:** muat data penuh; **push hanya** untuk (a) tabel cloud kosong saat seeding, atau (b)
  perubahan nyata dari aksi pengguna di UI — bukan echo saat menerima dari cloud (anti-loop via flag
  `isReceivingFromCloudRef`).
- Dokumen kegiatan, notifikasi, kop surat (F2): notifikasi seed demo (`SEED_NOTIFICATION_IDS`) tidak
  pernah dikirim; status baca notifikasi bersifat per-perangkat (lokal); kop surat hanya di-push dari
  handler simpan pengguna.
- Kesalahan RLS/403/42501 ditangani tenang (console info, tanpa error merah).

## 5. Alur Rilis (SOP — lihat juga AGENTS.md)
1. Kerjakan & uji di localhost (`npm run dev -- --host 0.0.0.0 --port 4000`).
2. Quality gate: `npm run build` → **Zero TypeScript Error**.
3. Perubahan skema Supabase: file SQL diuji via Management API (PAT/service_role tersimpan lokal,
   prosedur di skill `supabase-sql-runner`); kompatibel mundur.
4. Push `origin/main` **hanya dengan izin tertulis pemilik**; verifikasi live pasca-deploy
   (±15–60 dtk) — bandingkan aset bundle & cek konsol.

## 6. Lingkungan & Kredensial
- `.env.local` (tidak di-commit): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- PAT & service role tersimpan di `/root/.supabase-hermes/` (chmod 600) — di luar repo.
- Jalur dev server lokal: `http://localhost:4000`; produksi: `https://dwp-gtk-malut-app.vercel.app`.
