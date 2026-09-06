-- ============================================================
-- PERBAIKAN SKEMA: sinkronkan tabel news & attendance_records
-- dengan supabase_schema.sql (DWP GTK Maluku Utara)
-- AMAN: kedua tabel masih 0 baris -> tidak ada data yang hilang
-- Cara pakai: Supabase Dashboard -> SQL Editor -> New query ->
-- tempel SEMUA baris ini -> RUN
-- ============================================================

DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;

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

-- Verifikasi cepat (harus kembalikan 4 kolom tanpa error)
SELECT column_name FROM information_schema.columns
WHERE table_name IN ('news','attendance_records')
  AND column_name IN ('created_at','updated_at','signature_url','is_published')
ORDER BY table_name, column_name;
