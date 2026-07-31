# Dharma Wanita Persatuan — Kantor GTK Provinsi Maluku Utara

Aplikasi Web Portal Resmi dan Sistem Informasi Manajemen Internal Dharma Wanita Persatuan (DWP) Kantor Balai Guru Penggerak / GTK Provinsi Maluku Utara.

---

## 🚀 Teknologi Utama

- **Framework**: React 18 (Vite)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS (Modern, Responsive, Compact UI Layout)
- **Ikon**: Lucide React Icons
- **Penyimpanan Data**: LocalStorage (Persistensi Otomatis)

---

## 🏛️ Arsitektur & Struktur Direktori

```text
dharma-wanita-app/
├── src/
│   ├── components/
│   │   ├── admin/             # Portal Admin Backoffice
│   │   │   ├── MemberManagement.tsx   # Single Source of Truth Data Anggota & Pengurus
│   │   │   ├── CMSCustomizer.tsx      # Customizer Teks & Pengaturan Web Publik
│   │   │   ├── ProposalManagement.tsx # Workflow Persetujuan Proposal 5-Tahap
│   │   │   ├── ExecutionReportManagement.tsx
│   │   │   └── NewsManagement.tsx
│   │   └── public/            # Tampilan Situs Web Publik
│   │       ├── Hero.tsx               # Banner Utama & Tombol CTA Dinamis
│   │       ├── SambutanKetua.tsx      # Kata Sambutan (Auto-pull dari Member Management)
│   │       ├── VisiMisi.tsx           # Visi & Misi Organisasi
│   │       ├── OrgChart.tsx           # Bagan Struktur Organisasi 9 Jabatan
│   │       ├── NewsSection.tsx        # Warta & Publikasi Kegiatan
│   │       ├── AgendaSection.tsx      # Agenda & Absensi Tanda Tangan Digital
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   ├── context/
│   │   └── AppContext.tsx     # State Manager & Initial Data Store
│   ├── types/
│   │   └── index.ts           # Definisi Tipe Data TypeScript
│   ├── App.tsx
│   └── main.tsx
├── README.md
├── package.json
└── vite.config.ts
```

---

## 📝 Catatan Perubahan & Pembaruan Terlengkap (Changelog)

### 1. Single Source of Truth Data Profil & Foto Pengurus
- Seluruh data anggota, pengurus inti, hingga Ketua DWP dikelola **100% dari Manajemen Anggota** (`MemberManagement.tsx`).
- Foto profil yang diunggah di Manajemen Anggota secara otomatis terhubung dan tampil di halaman publik (**Sambutan Ketua** dan **Bagan Struktur Organisasi**).

### 2. Penyesuaian 9 Struktur Jabatan Resmi DWP
Struktur hirarki jabatan di seluruh aplikasi mengikut 9 susunan resmi:
1. `Ketua`
2. `Wakil Ketua`
3. `Sekretaris`
4. `Wakil Sekretaris`
5. `Bendahara`
6. `Ketua Bidang Pendidikan`
7. `Ketua Bidang Ekonomi`
8. `Ketua Bidang Sosial Budaya`
9. `Anggota`

### 3. Validasi Jabatan Tunggal (Bebas Duplikasi)
- 8 Jabatan Pengurus bersifat **Tunggal**. Sistem secara otomatis memblokir simpan apabila terjadi duplikasi pengurus pada posisi yang sama.

### 4. Pemetaan Otomatis Kolom Bidang Organisasi
- **Ketua, Wakil Ketua, Sekretaris, Wakil Sekretaris, Bendahara** ➔ Otomatis `-` (*Blank / Tanpa Bidang*).
- **Ketua Bidang Pendidikan** ➔ Otomatis `Pendidikan`.
- **Ketua Bidang Ekonomi** ➔ Otomatis `Ekonomi`.
- **Ketua Bidang Sosial Budaya** ➔ Otomatis `Sosial Budaya`.
- **Anggota** ➔ Bebas memilih bidang (Pendidikan, Ekonomi, Sosbud, `-`).
- Opsi `Sekretariat` telah dihapus dari pilihan bidang.

### 5. Penyesuaian & Penambahan Field Profil Anggota
- **Pekerjaan / Profesi**: Diisi dengan diketik manual *(opsional)*.
- **Instansi / Tempat Bekerja**: Diisi dengan diketik manual.
- **Gol. Darah**: Pilih dropdown (`-`, `A`, `B`, `AB`, `O`) milik Anggota DWP.
- **Nama Suami**: Diisi dengan diketik manual.
- **Nama Anak-Anak**: Diisi dengan diketik manual.
- **Urutan Field Formulir**: Pekerjaan ➔ Instansi ➔ Gol. Darah ➔ Nama Suami ➔ Nama Anak-Anak.
- Tampilan modal formulir dirancang proporsional, tanpa box grouping, dan menggunakan scroll internal (`max-h-[92vh]`) agar tidak ada field yang terpotong.

### 6. Kustomisasi Dinamis Tombol Utama Hero (CTA Button)
- Label Teks dan Aksi/Fungsi Klik tombol utama Hero dapat disunting bebas dari menu **CMS Customizer** (*Scroll Berita, Agenda, Sambutan, Visi Misi, Struktur, Masuk Admin, atau URL Khusus*).

### 7. Penyederhanaan & Pembersihan Elemen Tampilan
- Menghapus Top Notice Banner ("Situs Resmi...").
- Menghapus Pill Badge ("Portal Resmi DWP...").
- Menghapus Ringkasan Organisasi dari Hero section.
- Menghapus Tombol Workflow Approval dari Hero section.
- Menghapus Subteks berulang di bawah Sambutan Ketua dan Visi Misi.
- Menghapus badge "Ketua Pengurus" dan subteks unit kerja pada kartu Ketua DWP di Bagan Struktur Organisasi.

---

## 🛠️ Cara Menjalankan di Antigravity IDE

1. **Buka Folder Proyek** di Antigravity IDE:
   `File -> Open Folder` ➔ `C:\Users\rachmat\.gemini\antigravity\scratch\dharma-wanita-app`
2. **Jalankan Dev Server**:
   Buka Terminal di Antigravity IDE (`Ctrl + ~`) lalu jalankan:
   ```bash
   npm run dev
   ```
3. **Akses Aplikasi**:
   Buka peramban di `http://localhost:3000`.
4. **Kompilasi Production**:
   ```bash
   npm run build
   ```
