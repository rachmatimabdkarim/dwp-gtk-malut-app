-- ====================================================================
-- SKEMA DATABASE REAL POSTGRESQL / SUPABASE FOR DWP GTK MALUKU UTARA
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL DATA ANGGOTA DWP (members)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nik VARCHAR(20) UNIQUE,
    nip VARCHAR(30) UNIQUE,
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

-- ====================================================================
-- INITIAL SEED DATA (DATA AWAL RESMI)
-- ====================================================================

-- Seed Members Initial Data
INSERT INTO members (id, name, nip, email, phone, jabatan, bidang, unit_kerja, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Ny. Rahmiati S.Pd', '197805122003122001', 'rahmiati.ketua@malut.go.id', '081234567890', 'Ketua', 'Pengurus Inti', 'Kantor GTK Prov. Maluku Utara', 'Aktif'),
  ('22222222-2222-2222-2222-222222222222', 'Ny. Hj. Fatimah M.Pd', '198003152005012003', 'fatimah.waket@malut.go.id', '081298765432', 'Wakil Ketua', 'Pengurus Inti', 'Kantor GTK Prov. Maluku Utara', 'Aktif'),
  ('33333333-3333-3333-3333-333333333333', 'Ny. Dra. Salmawati', '198211042006042002', 'salmawati.sekr@malut.go.id', '081345678901', 'Sekretaris', 'Pengurus Inti', 'Kantor GTK Prov. Maluku Utara', 'Aktif'),
  ('44444444-4444-4444-4444-444444444444', 'Ny. Nurhayati S.E', '198507202008022004', 'nurhayati.bend@malut.go.id', '081356789012', 'Bendahara', 'Pengurus Inti', 'Kantor GTK Prov. Maluku Utara', 'Aktif'),
  ('55555555-5555-5555-5555-555555555555', 'Ny. Hasnah S.Pd', '198809102010012005', 'hasnah.pendidikan@malut.go.id', '081367890123', 'Ketua Bidang Pendidikan', 'Pendidikan', 'Kantor GTK Prov. Maluku Utara', 'Aktif')
ON CONFLICT (email) DO NOTHING;

-- Seed User Accounts Initial Data
INSERT INTO user_accounts (username, email, password_hash, role, member_id, status)
VALUES 
  ('admin.it', 'admin.it@malut.go.id', '$2a$10$e8T1w1...bcrypt_hash', 'admin_master', NULL, 'aktif'),
  ('rahmiati.ketua', 'rahmiati.ketua@malut.go.id', '$2a$10$e8T1w1...bcrypt_hash', 'ketua', '11111111-1111-1111-1111-111111111111', 'aktif'),
  ('fatimah.waket', 'fatimah.waket@malut.go.id', '$2a$10$e8T1w1...bcrypt_hash', 'wakil_ketua', '22222222-2222-2222-2222-222222222222', 'aktif'),
  ('salmawati.sekr', 'salmawati.sekr@malut.go.id', '$2a$10$e8T1w1...bcrypt_hash', 'sekretaris', '33333333-3333-3333-3333-333333333333', 'aktif'),
  ('nurhayati.bend', 'nurhayati.bend@malut.go.id', '$2a$10$e8T1w1...bcrypt_hash', 'bendahara', '44444444-4444-4444-4444-444444444444', 'aktif'),
  ('hasnah.pendidikan', 'hasnah.pendidikan@malut.go.id', '$2a$10$e8T1w1...bcrypt_hash', 'admin_bidang', '55555555-5555-5555-5555-555555555555', 'aktif')
ON CONFLICT (username) DO NOTHING;

-- Seed Initial Site Config
INSERT INTO site_config (id, site_title, sub_title, address, phone, email)
VALUES (1, 'Dharma Wanita Persatuan', 'Kantor GTK Provinsi Maluku Utara', 'Jl. Sultan Babullah No. 45, Ternate, Provinsi Maluku Utara', '(0921) 3123456', 'dwp.gtk@malut.kemdikbud.go.id')
ON CONFLICT (id) DO NOTHING;
