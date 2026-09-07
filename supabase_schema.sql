-- ====================================================================
-- SKEMA DATABASE REAL POSTGRESQL / SUPABASE FOR DWP GTK MALUKU UTARA
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL DATA ANGGOTA DWP (members)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nik VARCHAR(20),
    nip VARCHAR(30),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    jabatan VARCHAR(100) NOT NULL,
    bidang VARCHAR(50) DEFAULT '-',
    unit_kerja VARCHAR(100) NOT NULL,
    pekerjaan VARCHAR(100),
    golongan_darah VARCHAR(10) DEFAULT '-',
    nama_suami VARCHAR(100),
    nama_anak TEXT,
    status VARCHAR(20) DEFAULT 'Aktif',
    avatar TEXT,
    date_joined DATE DEFAULT CURRENT_DATE
);

-- 3. TABEL AKUN USER SYSTEM (user_accounts)
CREATE TABLE IF NOT EXISTS user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'admin_master','ketua','wakil_ketua','sekretaris','bendahara','admin_bidang','anggota'
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL WORKFLOW PROPOSAL KEGIATAN (activity_proposals)
CREATE TABLE IF NOT EXISTS activity_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    bidang VARCHAR(50) NOT NULL,
    organizer VARCHAR(100) NOT NULL,
    background TEXT NOT NULL,
    objective TEXT NOT NULL,
    target_audience VARCHAR(150),
    estimated_budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
    location VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_stage VARCHAR(50) NOT NULL, -- 'stage_4_wakil_ketua', 'stage_5_ketua', 'approved', 'rejected', 'revision_requested'
    stage_progress INT DEFAULT 1,
    created_by VARCHAR(100) NOT NULL,
    creator_role VARCHAR(30),
    revision_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL LOG AUDIT & NOTIFIKASI APPROVAL (approval_logs)
CREATE TABLE IF NOT EXISTS approval_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES activity_proposals(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    actor_role VARCHAR(30) NOT NULL,
    actor_name VARCHAR(100) NOT NULL,
    decision VARCHAR(30) NOT NULL, -- 'approved', 'rejected', 'revision'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL CMS CONFIGURATION (site_config)
CREATE TABLE IF NOT EXISTS site_config (
    id INT PRIMARY KEY DEFAULT 1,
    site_title VARCHAR(150) DEFAULT 'Dharma Wanita Persatuan',
    sub_title VARCHAR(150) DEFAULT 'Kantor GTK Provinsi Maluku Utara',
    site_logo_url TEXT,
    favicon_url TEXT,
    hero_title VARCHAR(200),
    hero_subtext TEXT,
    hero_banner_url TEXT,
    sambutan_ketua_quote TEXT,
    sambutan_ketua_text TEXT,
    visi_title VARCHAR(200),
    visi_text TEXT,
    misi_list JSONB,
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(100),
    copyright_text TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL WARTA & BERITA KEGIATAN (news)
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Sosial Budaya',
    author VARCHAR(100) NOT NULL,
    date VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    main_image TEXT,
    is_published BOOLEAN DEFAULT true,
    source_report_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABEL ABSENSI DIGITAL & TANDA TANGAN (attendance_records)
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activity_proposals(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    participant_name VARCHAR(150) NOT NULL,
    nip VARCHAR(50),
    jabatan VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    check_in_time VARCHAR(50) NOT NULL,
    signature_url TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'verified',
    verified_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABEL LAPORAN PERTANGGUNGJAWABAN / LPJ (execution_reports)
CREATE TABLE IF NOT EXISTS execution_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activity_proposals(id) ON DELETE CASCADE,
    activity_title VARCHAR(255) NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    background TEXT,
    execution_summary TEXT NOT NULL,
    total_participants INT DEFAULT 0,
    actual_budget NUMERIC(15, 2) DEFAULT 0,
    outcome_results TEXT,
    photo_urls JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    ketua_notes TEXT,
    created_at DATE DEFAULT CURRENT_DATE,
    updated_at DATE DEFAULT CURRENT_DATE
);

-- ====================================================================
-- INITIAL SEED DATA (DATA AWAL RESMI)
-- ====================================================================

-- Seed Members Initial Data
INSERT INTO members (id, name, nip, email, phone, jabatan, bidang, unit_kerja, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Ny. Washliyatul Qodari', '', 'washliyatul.dwp@malut.go.id', '0812-4567-8901', 'Ketua', '-', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('22222222-2222-2222-2222-222222222222', 'Ny. Wahyuni Bailussy', '', 'wahyuni.dwp@malut.go.id', '0813-9876-5432', 'Wakil Ketua', '-', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('33333333-3333-3333-3333-333333333333', 'Ny. Fadila Assagaf', '', 'fadila.dwp@malut.go.id', '0821-3344-5566', 'Sekretaris', '-', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('44444444-4444-4444-4444-444444444444', 'Ny. Jumaini', '', 'jumaini.dwp@malut.go.id', '0812-6677-8899', 'Bendahara', '-', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('55555555-5555-5555-5555-555555555555', 'Ny. Jusna', '', 'jusna.dwp@malut.go.id', '0852-1122-3344', 'Ketua Bidang Pendidikan', 'Pendidikan', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('b0000001-0000-0000-0000-000000000001', 'Ny. Hastizia Ismira', '', 'hastizia.dwp@malut.go.id', '0821-9988-7766', 'Wakil Sekretaris', '-', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('b0000002-0000-0000-0000-000000000002', 'Ny. Yayuk Setiyawati', '', 'yayuk.dwp@malut.go.id', '0812-7788-9900', 'Ketua Bidang Ekonomi', 'Ekonomi', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('b0000003-0000-0000-0000-000000000003', 'Ny. Risna Kanurna Sopalatu', '', 'risna.dwp@malut.go.id', '0822-4455-6677', 'Ketua Bidang Sosial Budaya', 'Sosial Budaya', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('b0000004-0000-0000-0000-000000000004', 'Ny. Nurlaela A. Barmawi', '', 'nurlaela.dwp@malut.go.id', '0852-9988-1122', 'Anggota', 'Pendidikan', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('b0000005-0000-0000-0000-000000000005', 'Ny. Nur', '', 'nur.dwp@malut.go.id', '0852-9988-1123', 'Anggota', 'Pendidikan', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('b0000006-0000-0000-0000-000000000006', 'Ny. Nining Suaib', '', 'nining.dwp@malut.go.id', '0852-9988-1124', 'Anggota', 'Pendidikan', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('b0000007-0000-0000-0000-000000000007', 'Ny. Sahdia Abukasim', '', 'sahdia.dwp@malut.go.id', '0812-7788-9901', 'Anggota', 'Ekonomi', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('b0000008-0000-0000-0000-000000000008', 'Ny. Jumiarti Audina', '', 'jumiarti.dwp@malut.go.id', '0812-7788-9902', 'Anggota', 'Ekonomi', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('b0000009-0000-0000-0000-000000000009', 'Ny. Aida Ibrahim', '', 'aida.dwp@malut.go.id', '0822-4455-6678', 'Anggota', 'Sosial Budaya', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('b000000a-0000-0000-0000-00000000000a', 'Ny. Siti Masita Muhammad', '', 'sitimasita.dwp@malut.go.id', '0822-4455-6679', 'Anggota', 'Sosial Budaya', 'Kantor GTK Provinsi Maluku Utara', 'Aktif'),
  ('b000000b-0000-0000-0000-00000000000b', 'Ny. Nur Alisnawati Anas', '', 'nuralisnawati.dwp@malut.go.id', '0822-4455-6680', 'Anggota', 'Sosial Budaya', 'Kantor GTK Provinsi Maluku Utara', 'Aktif')
ON CONFLICT (email) DO NOTHING;

-- Seed User Accounts Initial Data
INSERT INTO user_accounts (username, email, password_hash, role, member_id, status)
VALUES 
  ('admin', 'admin.it@malut.go.id', 'admin123', 'admin_master', NULL, 'aktif'),
  ('ketua', 'rahmiati.dwpgtk@malut.go.id', 'dwp2026!', 'ketua', '11111111-1111-1111-1111-111111111111', 'aktif'),
  ('waket', 'endang.dwp@malut.go.id', 'dwp2026!', 'wakil_ketua', '22222222-2222-2222-2222-222222222222', 'aktif'),
  ('sekretaris', 'fitriani.sekretaris@malut.go.id', 'dwp2026!', 'sekretaris', '33333333-3333-3333-3333-333333333333', 'aktif'),
  ('bendahara', 'hasnah.bendahara@malut.go.id', 'dwp2026!', 'bendahara', '44444444-4444-4444-4444-444444444444', 'aktif'),
  ('kabid_pendidikan', 'siti.aminah@malut.go.id', 'dwp2026!', 'admin_bidang', '55555555-5555-5555-5555-555555555555', 'aktif')
ON CONFLICT (username) DO NOTHING;

-- Seed Initial Site Config
INSERT INTO site_config (id, site_title, sub_title, address, phone, email)
VALUES (1, 'Dharma Wanita Persatuan', 'Kantor GTK Provinsi Maluku Utara', 'Jl. Raya Rum, RT.01 RW.01 Kecamatan Tidore Utara, Kota Tidore Kepulauan, Provinsi Maluku Utara', '(0921) 3123456', 'dwp.gtk@malut.kemdikbud.go.id')
ON CONFLICT (id) DO NOTHING;
