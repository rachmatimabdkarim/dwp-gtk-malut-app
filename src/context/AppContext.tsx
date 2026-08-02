import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  UserPersona, 
  UserAccount,
  Member, 
  ActivityProposal, 
  AttendanceRecord, 
  ExecutionReport, 
  NewsArticle, 
  SiteConfig,
  ProposalStage,
  AppNotification,
  CommitteeMember,
  CommitteeStatus,
  CommitteeLog,
  SystemAuditLogEntry,
  KopSuratConfig,
  ActivityDocument,
  DocumentType,
  DocumentStatus,
  DocumentLog
} from '../types';
import { apiService } from '../services/apiService';
import { 
  DynamicPermissionMatrix, 
  getDynamicPermissions, 
  saveDynamicPermissions, 
  resetDynamicPermissionsToDefault,
  canViewProposalDetail,
  AdminSubTab
} from '../utils/RoleAccessControl';

export const getEffectiveRole = (user: UserAccount, membersList: Member[]): UserRole => {
  if (!user.memberId) return user.role;
  const member = membersList.find(m => m.id === user.memberId);
  if (!member) return user.role;

  const cleanJabatan = member.jabatan.trim().toLowerCase();
  if (cleanJabatan.includes('ketua') && !cleanJabatan.includes('wakil') && !cleanJabatan.includes('bidang')) {
    return 'ketua';
  }
  if (cleanJabatan.includes('wakil ketua')) {
    return 'wakil_ketua';
  }
  if (cleanJabatan.includes('sekretaris')) {
    return 'sekretaris';
  }
  if (cleanJabatan.includes('bendahara')) {
    return 'bendahara';
  }
  if (cleanJabatan.includes('ketua bidang') || (member.bidang && member.bidang !== '-')) {
    return 'admin_bidang';
  }
  return 'anggota';
};

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-001',
    username: 'admin',
    password: 'admin123',
    email: 'admin.it@malut.go.id',
    role: 'admin_master',
    memberId: undefined, // User Non-Anggota (Superadmin IT Support)
    status: 'aktif',
    createdAt: '2026-01-01'
  },
  {
    id: 'usr-002',
    username: 'ketua',
    password: 'dwp2026!',
    email: 'rahmiati.dwpgtk@malut.go.id',
    role: 'ketua',
    memberId: 'dwp-001', // Linked ke Ketua DWP
    status: 'aktif',
    createdAt: '2026-01-05'
  },
  {
    id: 'usr-003',
    username: 'waket',
    password: 'dwp2026!',
    email: 'endang.dwp@malut.go.id',
    role: 'wakil_ketua',
    memberId: 'dwp-002', // Linked ke Wakil Ketua
    status: 'aktif',
    createdAt: '2026-01-10'
  },
  {
    id: 'usr-004',
    username: 'sekretaris',
    password: 'dwp2026!',
    email: 'fitriani.sekretaris@malut.go.id',
    role: 'sekretaris',
    memberId: 'dwp-003', // Linked ke Sekretaris
    status: 'aktif',
    createdAt: '2026-01-12'
  },
  {
    id: 'usr-005',
    username: 'bendahara',
    password: 'dwp2026!',
    email: 'hasnah.bendahara@malut.go.id',
    role: 'bendahara',
    memberId: 'dwp-005', // Linked ke Bendahara
    status: 'aktif',
    createdAt: '2026-01-14'
  },
  {
    id: 'usr-006',
    username: 'kabid_pendidikan',
    password: 'dwp2026!',
    email: 'siti.aminah@malut.go.id',
    role: 'admin_bidang',
    memberId: 'dwp-006', // Linked ke Ketua Bidang Pendidikan
    status: 'aktif',
    createdAt: '2026-01-15'
  },
  {
    id: 'usr-007',
    username: 'kabid_ekonomi',
    password: 'dwp2026!',
    email: 'fatimah.ekonomi@malut.go.id',
    role: 'admin_bidang',
    memberId: 'dwp-007', // Linked ke Ketua Bidang Ekonomi
    status: 'aktif',
    createdAt: '2026-01-16'
  },
  {
    id: 'usr-008',
    username: 'kabid_sosbud',
    password: 'dwp2026!',
    email: 'hawa.sosbud@malut.go.id',
    role: 'admin_bidang',
    memberId: 'dwp-008', // Linked ke Ketua Bidang Sosbud
    status: 'aktif',
    createdAt: '2026-01-17'
  },
  {
    id: 'usr-009',
    username: 'anggota',
    password: 'dwp2026!',
    email: 'halimah.anggota@malut.go.id',
    role: 'anggota',
    memberId: 'dwp-009', // Linked ke Anggota DWP
    status: 'aktif',
    createdAt: '2026-01-18'
  }
];

export const USER_PERSONAS: Record<UserRole, UserPersona> = {
  admin_master: {
    role: 'admin_master',
    name: 'Tim IT Super Admin',
    title: 'Super Admin IT',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  admin_bidang: {
    role: 'admin_bidang',
    name: 'Ny. Hj. Siti Aminah, S.Pd',
    title: 'Ketua Bidang Pendidikan',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    memberId: 'dwp-006'
  },
  sekretaris: {
    role: 'sekretaris',
    name: 'Ny. Fitriani Nurdin, S.E',
    title: 'Sekretaris DWP',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    memberId: 'dwp-003'
  },
  bendahara: {
    role: 'bendahara',
    name: 'Ny. Hasnah Usman, S.E',
    title: 'Bendahara DWP',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    memberId: 'dwp-005'
  },
  wakil_ketua: {
    role: 'wakil_ketua',
    name: 'Ny. Dra. Endang Kusuma',
    title: 'Wakil Ketua DWP',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    memberId: 'dwp-002'
  },
  ketua: {
    role: 'ketua',
    name: 'Ny. Hj. Rahmiati Ahmad, M.Pd',
    title: 'Ketua DWP',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    memberId: 'dwp-001'
  },
  anggota: {
    role: 'anggota',
    name: 'Ny. Sitti Maryam Subhan',
    title: 'Anggota DWP',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    memberId: 'dwp-004'
  }
};

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'dwp-001',
    nip: '19780512 200312 2 001',
    name: 'Ny. Hj. Rahmiati Ahmad, M.Pd',
    jabatan: 'Ketua',
    unitKerja: 'Kantor GTK Prov. Maluku Utara',
    pekerjaan: 'Pegawai Negeri Sipil (PNS)',
    golonganDarah: 'O',
    namaSuami: 'Dr. H. Ahmad Mansur, M.Si',
    namaAnak: '1. Muhammad Rizky, 2. Anisa Rahma',
    bidang: '-',
    phone: '0812-4567-8901',
    email: 'rahmiati.dwpgtk@malut.go.id',
    status: 'Aktif',
    dateJoined: '2021-01-15',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-002',
    nip: '19820315 200801 2 004',
    name: 'Ny. Dra. Endang Kusuma',
    jabatan: 'Wakil Ketua',
    unitKerja: 'Subbag Umum & Tata Usaha BGP Malut',
    pekerjaan: 'Pegawai Negeri Sipil (PNS)',
    golonganDarah: 'A',
    namaSuami: 'Ir. Bambang Kusuma',
    namaAnak: '1. Dewa Kusuma',
    bidang: '-',
    phone: '0813-9876-5432',
    email: 'endang.dwp@malut.go.id',
    status: 'Aktif',
    dateJoined: '2021-02-10',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-003',
    nip: '19851120 201012 2 008',
    name: 'Ny. Fitriani Nurdin, S.E',
    jabatan: 'Sekretaris',
    unitKerja: 'Kantor GTK Sofifi',
    pekerjaan: 'Pegawai Negeri Sipil (PNS)',
    golonganDarah: 'B',
    namaSuami: "Nurdin Syafi'i, S.T",

    namaAnak: '1. Farah Nurdin, 2. Fadel Nurdin',
    bidang: '-',
    phone: '0821-3344-5566',
    email: 'fitriani.sekretaris@malut.go.id',
    status: 'Aktif',
    dateJoined: '2022-03-01',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-004',
    nip: '19870914 201103 2 005',
    name: 'Ny. Sitti Maryam Subhan, S.Pd',
    jabatan: 'Wakil Sekretaris',
    unitKerja: 'SMA Negeri 1 Ternate',
    pekerjaan: 'Guru Tenaga Pendidik',
    golonganDarah: 'AB',
    namaSuami: 'Subhan Abdullah, S.Pd',
    namaAnak: '1. Aulia Subhan',
    bidang: '-',
    phone: '0821-9988-7766',
    email: 'sitti.sekretaris@malut.go.id',
    status: 'Aktif',
    dateJoined: '2022-05-15',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-005',
    nip: '19860412 201201 2 009',
    name: 'Ny. Hasnah Usman, S.E',
    jabatan: 'Bendahara',
    unitKerja: 'BGP Provinsi Maluku Utara',
    pekerjaan: 'Staf Pengelolaan Keuangan',
    golonganDarah: 'O',
    namaSuami: 'Usman Ali, M.M',
    namaAnak: '1. Hafiz Usman, 2. Hana Usman',
    bidang: '-',
    phone: '0812-6677-8899',
    email: 'hasnah.bendahara@malut.go.id',
    status: 'Aktif',
    dateJoined: '2022-01-10',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-006',
    nip: '19880418 201204 2 002',
    name: 'Ny. Hj. Siti Aminah, S.Pd',
    jabatan: 'Ketua Bidang Pendidikan',
    unitKerja: 'Dinas Pendidikan Prov. Maluku Utara',
    pekerjaan: 'Pengawas Sekolah',
    golonganDarah: 'A',
    namaSuami: 'H. Faisal Amir, S.Pd',
    namaAnak: '1. Rayhan Amir',
    bidang: 'Pendidikan',
    phone: '0852-1122-3344',
    email: 'siti.aminah@malut.go.id',
    status: 'Aktif',
    dateJoined: '2021-05-12',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-007',
    nip: '19900902 201503 2 007',
    name: 'Ny. Fatimah Az-Zahra, SE',
    jabatan: 'Ketua Bidang Ekonomi',
    unitKerja: 'Kantor GTK Ternate',
    pekerjaan: 'Wiraswasta / Pelaku UMKM',
    golonganDarah: 'B',
    namaSuami: 'Zulkifli Ibrahim',
    namaAnak: '1. Zahra Ibrahim',
    bidang: 'Ekonomi',
    phone: '0812-7788-9900',
    email: 'fatimah.ekonomi@malut.go.id',
    status: 'Aktif',
    dateJoined: '2022-08-20',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-008',
    nip: '19930711 201902 2 005',
    name: 'Ny. Mariam Syaiful, S.Sos',
    jabatan: 'Ketua Bidang Sosial Budaya',
    unitKerja: 'Dinas Sosial Kota Ternate',
    pekerjaan: 'Penyuluh Sosial',
    golonganDarah: 'AB',
    namaSuami: 'Syaiful Bahri, S.Sos',
    namaAnak: '1. Syaifa Bahri',
    bidang: 'Sosial Budaya',
    phone: '0822-4455-6677',
    email: 'mariam.sosbud@malut.go.id',
    status: 'Aktif',
    dateJoined: '2023-01-10',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'dwp-009',
    nip: '19910214 201604 2 003',
    name: 'Ny. Dra. Halimah Mansur',
    jabatan: 'Anggota',
    unitKerja: 'SMP Negeri 2 Kota Ternate',
    pekerjaan: 'Guru Pendidik',
    golonganDarah: 'O',
    namaSuami: 'Mansur Hasan, M.Pd',
    namaAnak: '1. Hilman Mansur',
    bidang: 'Pendidikan',
    phone: '0852-9988-1122',
    email: 'halimah.anggota@malut.go.id',
    status: 'Aktif',
    dateJoined: '2023-04-18',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  }
];




const INITIAL_PROPOSALS: ActivityProposal[] = [
  {
    id: 'prop-001',
    title: 'Pelatihan Literasi Digital & Parenting Bagi Anggota DWP GTK Maluku Utara',
    bidang: 'Pendidikan',
    organizer: 'Bidang Pendidikan DWP GTK',
    background: 'Pentingnya penguatan literasi digital bagi anggota DWP dalam mendampingi anak di era digital.',
    objective: 'Meningkatkan pemahaman anggota tentang pemanfaatan internet sehat dan pola pengasuhan digital.',
    targetAudience: '50 Orang Anggota & Pengurus DWP GTK Malut',
    estimatedBudget: 12500000,
    location: 'Aula Kantor BGP / GTK Provinsi Maluku Utara, Ternate',
    startDate: '2026-08-15',
    endDate: '2026-08-15',
    currentStage: 'stage_4_wakil_ketua',
    stageProgress: 4,
    creatorRole: 'admin_bidang',
    logs: [
      {
        id: 'log-1',
        stageName: 'Usulan Dibuat',
        actorRole: 'admin_bidang',
        actorName: 'Ny. Hj. Siti Aminah, S.Pd',
        decision: 'approved',
        notes: 'Usulan diajukan. Menunggu Verifikasi Wakil Ketua.',
        timestamp: '2026-07-20 09:00'
      }
    ],
    createdBy: 'Ny. Hj. Siti Aminah, S.Pd',
    createdAt: '2026-07-20'
  },
  {
    id: 'prop-002',
    title: 'Bazaar Usaha Mikro DWP & Pelatihan Kewirausahaan Produk Lokal Maluku Utara',
    bidang: 'Ekonomi',
    organizer: 'Bidang Ekonomi DWP GTK',
    background: 'Mendukung kemandirian ekonomi keluarga anggota DWP melalui pengolahan olahan pangan lokal khas Maluku Utara.',
    objective: 'Meningkatkan keterampilan memasarkan produk olahan pala dan kenari secara online.',
    targetAudience: 'Seluruh Anggota DWP & UMKM Binaan GTK',
    estimatedBudget: 18000000,
    location: 'Halaman Utama Kantor GTK Prov. Maluku Utara, Sofifi',
    startDate: '2026-09-02',
    endDate: '2026-09-03',
    currentStage: 'stage_5_ketua',
    stageProgress: 5,
    creatorRole: 'admin_bidang',
    logs: [
      {
        id: 'log-21',
        stageName: 'Usulan Dibuat',
        actorRole: 'admin_bidang',
        actorName: 'Ny. Fatimah Az-Zahra, SE',
        decision: 'approved',
        notes: 'Usulan diajukan oleh pengurus bidang ekonomi.',
        timestamp: '2026-07-15 08:30'
      },
      {
        id: 'log-23',
        stageName: 'Verifikasi Wakil Ketua',
        actorRole: 'wakil_ketua',
        actorName: 'Ny. Dra. Endang Kusuma',
        decision: 'approved',
        notes: 'Diverifikasi. Sangat baik, diteruskan ke Ketua DWP untuk persetujuan akhir.',
        timestamp: '2026-07-19 16:20'
      }
    ],
    createdBy: 'Ny. Fatimah Az-Zahra, SE',
    createdAt: '2026-07-15'
  },
  {
    id: 'prop-003',
    title: 'Bakti Sosial DWP GTK Peduli Pendidikan Anak Pesisir Halmahera',
    bidang: 'Sosial Budaya',
    organizer: 'Bidang Sosial Budaya DWP GTK',
    background: 'Kepedulian sosial DWP terhadap fasilitas belajar anak-anak di wilayah pesisir.',
    objective: 'Penyaluran 200 paket perlengkapan sekolah & buku bacaan anak.',
    targetAudience: 'Siswa SD Pesisir Halmahera Barat',
    estimatedBudget: 25000000,
    location: 'Halmahera Barat, Provinsi Maluku Utara',
    startDate: '2026-07-10',
    endDate: '2026-07-10',
    currentStage: 'approved',
    stageProgress: 5,
    logs: [
      {
        id: 'log-31',
        stageName: 'Persetujuan Ketua',
        actorRole: 'ketua',
        actorName: 'Ny. Hj. Rahmiati Ahmad, M.Pd',
        decision: 'approved',
        notes: 'Disetujui. Laksanakan kegiatan dengan penuh tanggung jawab.',
        timestamp: '2026-07-05 10:00'
      }
    ],
    createdBy: 'Ny. Mariam Syaiful, S.Sos',
    createdAt: '2026-07-01'
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-waket-001',
    targetRole: 'wakil_ketua',
    title: '🛡️ Usulan Kegiatan Baru Perlu Verifikasi',
    message: 'Usulan Kegiatan "Pelatihan Literasi Digital Anggota DWP GTK Maluku Utara" dari Ny. Hj. Siti Aminah, S.Pd (Bidang Pendidikan) memerlukan Verifikasi awal dari Anda.',
    timestamp: '20/07/2026 09:00',
    isRead: false,
    type: 'new_proposal',
    proposalId: 'prop-001',
    nextStepAction: '👉 Langkah Selanjutnya: Mohon telaah & verifikasi kesesuaian usulan kegiatan dan anggaran.',
    targetTab: 'usulan',
    actionButtonText: 'Verifikasi Usulan ➔'
  },
  {
    id: 'notif-ketua-001',
    targetRole: 'ketua',
    title: '👑 Usulan Kegiatan Perlu Persetujuan Akhir',
    message: 'Usulan Kegiatan "Bazaar Usaha Mikro DWP & Pelatihan Kewirausahaan Produk Lokal Maluku Utara" telah diverifikasi oleh Wakil Ketua dan membutuhkan Persetujuan Akhir dari Anda.',
    timestamp: '19/07/2026 16:20',
    isRead: false,
    type: 'new_proposal',
    proposalId: 'prop-002',
    nextStepAction: '👉 Langkah Selanjutnya: Berikan persetujuan akhir usulan kegiatan.',
    targetTab: 'usulan',
    actionButtonText: 'Buka Persetujuan Ketua ➔'
  },
  {
    id: 'notif-001',
    targetRole: 'bendahara',
    title: '💰 Pemberitahuan Pencairan Dana RAB',
    message: 'Usulan Kegiatan "Bhakti Sosial Peringatan Hari Kartini & Penyerahan Beasiswa DWP" telah disetujui resmi oleh Ketua DWP. Anggaran Rp 25.000.000 siap diproses.',
    timestamp: '05/07/2026 10:00',
    isRead: false,
    type: 'rab_pencairan',
    proposalId: 'prop-003',
    nextStepAction: '👉 Langkah Selanjutnya: Siapkan pencairan anggaran sesuai RAB disetujui.',
    targetTab: 'usulan',
    actionButtonText: 'Lihat RAB Disetujui ➔'
  },
  {
    id: 'notif-002',
    targetRole: 'sekretaris',
    title: '📜 Pemberitahuan Persuratan & SK',
    message: 'Usulan Kegiatan "Bhakti Sosial Peringatan Hari Kartini & Penyerahan Beasiswa DWP" telah disetujui resmi oleh Ketua DWP. Draf SK Panitia, Surat Tugas, & Undangan siap dibuat.',
    timestamp: '05/07/2026 10:00',
    isRead: false,
    type: 'sk_pengarsipan',
    proposalId: 'prop-003',
    nextStepAction: '👉 Langkah Selanjutnya: Tentukan Ketua Panitia & Tim Panitia Pelaksana di Tab Panitia.',
    targetTab: 'panitia',
    actionButtonText: 'Susun Panitia ➔'
  }
];

// Mock Signature Canvas Data URL
const MOCK_SIGNATURE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M 20 40 Q 60 10 100 50 T 180 30" stroke="%230f172a" stroke-width="3" fill="none"/></svg>';

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    activityId: 'prop-003',
    memberId: 'dwp-001',
    participantName: 'Ny. Hj. Rahmiati Ahmad, M.Pd',
    nip: '19780512 200312 2 001',
    jabatan: 'Ketua Pengurus DWP',
    phone: '0812-4567-8901',
    checkInTime: '2026-07-10 08:30',
    signatureUrl: MOCK_SIGNATURE,
    status: 'verified',
    verifiedBy: 'Panitia Sekretariat'
  },
  {
    id: 'att-2',
    activityId: 'prop-003',
    memberId: 'dwp-004',
    participantName: 'Ny. Hj. Siti Aminah, S.Pd',
    nip: '19880418 201204 2 002',
    jabatan: 'Ketua Bidang Pendidikan',
    phone: '0852-1122-3344',
    checkInTime: '2026-07-10 08:45',
    signatureUrl: MOCK_SIGNATURE,
    status: 'verified',
    verifiedBy: 'Panitia Sekretariat'
  },
  {
    id: 'att-3',
    activityId: 'prop-003',
    memberId: 'dwp-006',
    participantName: 'Ny. Mariam Syaiful, S.Sos',
    nip: '19930711 201902 2 005',
    jabatan: 'Ketua Bidang Sosial Budaya',
    phone: '0822-4455-6677',
    checkInTime: '2026-07-10 09:00',
    signatureUrl: MOCK_SIGNATURE,
    status: 'verified',
    verifiedBy: 'Panitia Sekretariat'
  }
];

const INITIAL_REPORTS: ExecutionReport[] = [
  {
    id: 'rep-001',
    activityId: 'prop-003',
    activityTitle: 'Bakti Sosial DWP GTK Peduli Pendidikan Anak Pesisir Halmahera',
    reportTitle: 'LAPORAN PELAKSANAAN KEGIATAN BAKTI SOSIAL DWP KANTOR GTK PROVINSI MALUKU UTARA TAHUN 2026',
    background: 'Kegiatan Bakti Sosial diselenggarakan sebagai bentuk keperdulian pengurus DWP Kantor GTK Maluku Utara dalam meningkatkan kualitas sarana belajar anak-anak di pesisir.',
    executionSummary: 'Kegiatan berjalan dengan sukses dan penuh khidmat. Telah disalurkan 200 paket bantuan perlengkapan sekolah yang diterima langsung oleh kepala sekolah dan perwakilan orang tua murid di Halmahera Barat.',
    totalParticipants: 45,
    actualBudget: 24500000,
    outcomeResults: 'Terjalin hubungan silaturahmi yang erat antara pengurus DWP GTK dan masyarakat pesisir, serta tersalurkannya bantuan pendidikan secara tepat sasaran.',
    photoUrls: [
      'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'approved_published',
    ketuaNotes: 'Laporan sangat lengkap dan dokumentasi luar biasa. Disetujui untuk dipublikasikan di Website Publik.',
    createdAt: '2026-07-12',
    updatedAt: '2026-07-14'
  }
];

const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'DWP Kantor GTK Maluku Utara Salurkan 200 Paket Perlengkapan Sekolah di Halmahera Barat',
    category: 'Sosial Budaya',
    author: 'Humas DWP GTK Malut',
    date: '14 Juli 2026',
    summary: 'Wujud kepedulian pendidikan anak pesisir, pengurus DWP Kantor GTK Prov. Maluku Utara sukses menggelar Bakti Sosial tahunan.',
    content: `Jelbar, Halmahera Barat — Pengurus Dharma Wanita Persatuan (DWP) Kantor Balai Guru Penggerak / GTK Provinsi Maluku Utara sukses melaksanakan kegiatan Bakti Sosial Peduli Pendidikan Anak Pesisir.\n\nKetua DWP Kantor GTK Maluku Utara, Ny. Hj. Rahmiati Ahmad, M.Pd menyatakan bahwa paket bantuan berupa tas sekolah, buku tulis, alat tulis, dan seragam diserahkan secara simbolis kepada perwakilan siswa.\n\n"Semoga bantuan ini dapat memacu semangat belajar anak-anak generasi penerus Maluku Utara di wilayah pesisir," ujar Ny. Rahmiati.`,
    mainImage: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80',
    isPublished: true,
    sourceReportId: 'rep-001'
  },
  {
    id: 'news-2',
    title: 'Persiapan Pelatihan Literasi Digital DWP GTK Malut Hadapi Era Edukasi Modern',
    category: 'Pendidikan',
    author: 'Bidang Pendidikan DWP',
    date: '22 Juli 2026',
    summary: 'Pengurus DWP GTK Maluku Utara merampungkan draf program pelatihan literasi digital dan pengasuhan keluarga bagi para anggota.',
    content: `Ternate — Dalam rangka merespons pesatnya perkembangan teknologi informasi, DWP Kantor GTK Provinsi Maluku Utara akan menyelenggarakan Pelatihan Literasi Digital & Parenting.\n\nKegiatan ini dirancang untuk membekali para ibu dan anggota pengurus DWP agar mahir mendampingi putra-putri dalam pemanfaatan internet sehat.`,
    mainImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    isPublished: true
  }
];

const INITIAL_SITE_CONFIG: SiteConfig = {
  siteTitle: 'Dharma Wanita Persatuan',
  subTitle: 'Kantor GTK Provinsi Maluku Utara',
  siteLogoUrl: '',
  faviconUrl: '',
  heroTitle: 'Dharma Wanita Persatuan Kantor GTK Provinsi Maluku Utara',
  heroSubtext: 'Memperkuat peran perempuan, mendukung profesionalisme GTK, dan membangun kesejahteraan keluarga yang berkarakter di Provinsi Maluku Utara.',
  heroCtaText: 'Jelajahi Warta Kegiatan',
  heroCtaAction: 'scroll_berita',
  heroCtaUrl: '',
  heroBannerUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=1200&auto=format&fit=crop&q=80',

  heroOverlayOpacity: 50,
  heroOverlayStyle: 'burgundy',


  sambutanTagText: 'Kata Sambutan',
  sambutanKetuaQuote: 'Bersama Membangun Kesejahteraan & Mendukung Pendidikan di Maluku Utara',
  sambutanKetuaText: 'Assalamu’alaikum Warahmatullahi Wabarakatuh dan Selamat Sejahtera.\n\nSelamat datang di Website Resmi Dharma Wanita Persatuan Kantor GTK Provinsi Maluku Utara. Media ini hadir sebagai sarana publikasi kegiatan, transparansi pengelolaan organisasi, dan ruang silaturahmi seluruh anggota DWP GTK Maluku Utara dalam mendukung pembangunan dunia pendidikan di Maluku Utara.',

  
  visiTagText: 'Landasan Organisasi',
  visiTitle: 'Visi & Misi DWP GTK Maluku Utara',
  visiSubtext: 'Pedoman arah langkah pengurus dan anggota dalam berkarya bagi kemajuan organisasi dan daerah.',
  visiText: 'Terwujudnya Organisasi Dharma Wanita Persatuan yang Mandiri, Profesional, dan Bertanggung Jawab dalam Meningkatkan Kesejahteraan Anggota dan Masyarakat di Provinsi Maluku Utara.',
  misiList: [
    'Meningkatkan kualitas sumber daya manusia anggota DWP melalui pendidikan dan pelatihan berkelanjutan.',
    'Mendorong kemandirian ekonomi anggota berbasis potensi lokal Maluku Utara.',
    'Menyelenggarakan kegiatan sosial budaya dan kepedulian pendidikan masyarakat.',
    'Memperkuat kerja sama dengan Kantor GTK Kemendikbudristek dan mitra strategis daerah.'
  ],
  
  strukturTagText: 'Kepengurusan Resmi',
  strukturTitle: 'Struktur Organisasi DWP GTK Maluku Utara',
  strukturSubtext: 'Susunan Pengurus Inti dan Ketua Bidang Dharma Wanita Persatuan Kantor GTK Provinsi Maluku Utara.',
  
  beritaTagText: 'Warta & Publikasi',
  beritaTitle: 'Berita & Dokumentasi Kegiatan',
  beritaSubtext: 'Publikasi resmi hasil pelaksanaan kegiatan DWP GTK Provinsi Maluku Utara.',
  
  agendaTagText: 'Agenda Kegiatan & Absensi',
  agendaTitle: 'Jadwal Kegiatan & Portal Absensi Digital',
  agendaSubtext: 'Peserta yang menghadiri kegiatan dapat melakukan pengisian kehadiran dan tanda tangan digital secara langsung.',
  
  address: 'Jl. Sultan Babullah No. 45, Ternate, Provinsi Maluku Utara',
  phone: '(0921) 3123456',
  email: 'dwp.gtk@malut.kemdikbud.go.id',
  facebook: 'https://facebook.com/dwpgtkmalut',
  instagram: 'https://instagram.com/dwp_gtk_malut',
  youtube: 'https://youtube.com/@dwpgtkmalut',
  primaryThemeColor: '#6b0f1a',
  footerDescription: 'Organisasi istri Pegawai Negeri Sipil di lingkungan Balai Guru Penggerak / Kantor Guru dan Tenaga Kependidikan (GTK) Provinsi Maluku Utara yang bergerak di bidang Pendidikan, Ekonomi, dan Sosial Budaya.',
  copyrightText: '© 2026 Dharma Wanita Persatuan - Kantor GTK Provinsi Maluku Utara. Hak Cipta Dilindungi.'
};


export const defaultKopSuratConfig: KopSuratConfig = {
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Logo_Dharma_Wanita_Persatuan.png',
  headerLine1: 'DHARMA WANITA PERSATUAN',
  headerLine2: 'KANTOR GURU DAN TENAGA KEPENDIDIKAN',
  headerLine3: 'PROVINSI MALUKU UTARA',
  address: 'Jl. Raya Rum Kecamatan Tidore Utara, Kota Tidore Kepulauan (Kompleks BPMP Provinsi Maluku Utara)',
  email: 'dwp.gtk.malut@gmail.com',
  website: 'dwp-gtk-malut.id',
  phone: '(0921) 3123456',
  showDoubleLine: true,
  logoSize: 56,
  headerLine1FontSize: 14,
  headerLine2FontSize: 11,
  headerLine3FontSize: 10,
  addressFontSize: 9,
  headerLineSpacing: 2,
  bottomLineSpacing: 12,
  borderStyle: 'single_thick',
  borderWidth: 3.5
};

interface AppContextType {
  isAuthenticated: boolean;
  currentAccount: UserAccount | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activePersona: UserPersona;
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'dateJoined'>) => void;
  updateMember: (id: string, updated: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  userAccounts: UserAccount[];
  addUserAccount: (account: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  updateUserAccount: (id: string, updated: Partial<UserAccount>) => void;
  deleteUserAccount: (id: string) => void;
  
  proposals: ActivityProposal[];
  addProposal: (proposal: Omit<ActivityProposal, 'id' | 'currentStage' | 'stageProgress' | 'logs' | 'createdAt'>) => void;
  advanceApproval: (proposalId: string, decision: 'approved' | 'rejected' | 'revision', notes: string) => void;
  resubmitProposal: (proposalId: string, updated: Partial<ActivityProposal>) => void;
  updateProposalCommittee: (proposalId: string, committeeMembers: CommitteeMember[]) => void;
  updateCommitteeStatus: (proposalId: string, status: CommitteeStatus, notes?: string, actorName?: string) => void;
  deleteProposal: (proposalId: string) => void;
  
  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'status'>) => void;
  verifyAttendanceRecord: (recordId: string, verifierName: string) => void;
  
  reports: ExecutionReport[];
  createOrUpdateReport: (report: Partial<ExecutionReport> & { activityId: string }) => void;
  approveReportAndPublishNews: (reportId: string, ketuaNotes: string) => void;
  
  news: NewsArticle[];
  addNewsArticle: (article: Omit<NewsArticle, 'id'>) => void;
  
  siteConfig: SiteConfig;
  updateSiteConfig: (newConfig: Partial<SiteConfig>) => void;

  kopSuratConfig: KopSuratConfig;
  updateKopSuratConfig: (newConfig: Partial<KopSuratConfig>) => void;

  activityDocuments: ActivityDocument[];
  createOrUpdateActivityDocument: (docData: Partial<ActivityDocument> & { proposalId: string; documentType: DocumentType }) => void;
  assignDocumentTask: (documentId: string, memberId: string, memberName: string) => void;
  advanceDocumentApproval: (documentId: string, status: DocumentStatus, notes?: string, letterNumber?: string) => void;
  deleteActivityDocument: (documentId: string) => void;

  permissionMatrix: DynamicPermissionMatrix;
  updatePermissionMatrix: (matrix: DynamicPermissionMatrix) => void;
  resetPermissionMatrix: () => void;
  
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearReadNotifications: () => void;

  systemAuditLogs: SystemAuditLogEntry[];
  addSystemAuditLog: (entry: Omit<SystemAuditLogEntry, 'id' | 'timestamp'>) => void;
  
  activeTab: 'public' | 'admin';
  setActiveTab: (tab: 'public' | 'admin') => void;
  adminSubTab: AdminSubTab;
  setAdminSubTab: (tab: AdminSubTab) => void;

  focusedProposalId: string | null;
  setFocusedProposalId: (id: string | null) => void;
  focusedWorkspaceTab: 'usulan' | 'panitia' | 'sk' | 'absensi' | 'lpj';
  setFocusedWorkspaceTab: (tab: 'usulan' | 'panitia' | 'sk' | 'absensi' | 'lpj') => void;
  openProposalWorkspace: (proposalId: string, workspaceTab?: 'usulan' | 'panitia' | 'sk' | 'absensi' | 'lpj') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin_master');

  // Load initial data from localStorage if available, or fallback to INITIAL constants
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('dwp_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [proposals, setProposals] = useState<ActivityProposal[]>(() => {
    const saved = localStorage.getItem('dwp_proposals');
    return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('dwp_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [reports, setReports] = useState<ExecutionReport[]>(() => {
    const saved = localStorage.getItem('dwp_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [news, setNews] = useState<NewsArticle[]>(() => {
    const saved = localStorage.getItem('dwp_news');
    return saved ? JSON.parse(saved) : INITIAL_NEWS;
  });

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('dwp_user_accounts');
    return saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS;
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('dwp_site_config');
    return saved ? JSON.parse(saved) : INITIAL_SITE_CONFIG;
  });

  const [kopSuratConfig, setKopSuratConfig] = useState<KopSuratConfig>(() => {
    const saved = localStorage.getItem('dwp_kop_surat_config');
    return saved ? JSON.parse(saved) : defaultKopSuratConfig;
  });

  const [activityDocuments, setActivityDocuments] = useState<ActivityDocument[]>(() => {
    const saved = localStorage.getItem('dwp_activity_documents');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('dwp_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [systemAuditLogs, setSystemAuditLogs] = useState<SystemAuditLogEntry[]>(() => {
    const saved = localStorage.getItem('dwp_system_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dwp_system_audit_logs', JSON.stringify(systemAuditLogs));
  }, [systemAuditLogs]);

  const addSystemAuditLog = (entry: Omit<SystemAuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: SystemAuditLogEntry = {
      ...entry,
      id: `log-sys-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleString('id-ID'),
      ipAddress: entry.ipAddress || '180.252.34.12 (Terverifikasi)'
    };
    setSystemAuditLogs(prev => [newLog, ...prev]);
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!apiService.getAuthSession();
  });

  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(() => {
    const session = apiService.getAuthSession();
    return session ? session.user : null;
  });

  const [activeTab, setActiveTabState] = useState<'public' | 'admin'>('public');
  const [adminSubTab, setAdminSubTabState] = useState<AdminSubTab>('dashboard');

  const updateUrlPath = (tab: 'public' | 'admin', subTab?: AdminSubTab) => {
    let path = '/';
    if (tab === 'admin') {
      path = `/admin/${subTab || 'dashboard'}`;
    }
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  const setActiveTab = (tab: 'public' | 'admin') => {
    setActiveTabState(tab);
    updateUrlPath(tab, adminSubTab);
  };

  const setAdminSubTab = (subTab: AdminSubTab) => {
    setAdminSubTabState(subTab);
    updateUrlPath('admin', subTab);
  };

  // Sync state on page load and window popstate (Browser Back/Forward & F5 Refresh)
  useEffect(() => {
    const parseUrl = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setActiveTabState('admin');
        if (path.includes('/proposals')) setAdminSubTabState('proposals');
        else if (path.includes('/members')) setAdminSubTabState('members');
        else if (path.includes('/users')) setAdminSubTabState('users');
        else if (path.includes('/cms')) setAdminSubTabState('cms');
        else if (path.includes('/logs')) setAdminSubTabState('logs');
        else setAdminSubTabState('dashboard');
      } else {
        setActiveTabState('public');
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  const login = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    const user = await apiService.authenticateUser(usernameInput, passwordInput);
    if (!user) return false;
    apiService.setAuthSession(user);
    setIsAuthenticated(true);
    setCurrentAccount(user);

    const effRole = getEffectiveRole(user, members);
    setCurrentRole(effRole);

    addSystemAuditLog({
      category: 'auth',
      severity: 'success',
      actorName: user.username,
      actorRole: effRole,
      action: 'Sesi Login Pengguna System',
      details: `User "${user.username}" (${user.email}) berhasil login masuk ke Portal Admin sebagai ${effRole}.`
    });

    setActiveTab('admin');
    setAdminSubTab('dashboard');
    return true;
  };

  const logout = () => {
    if (currentAccount) {
      addSystemAuditLog({
        category: 'auth',
        severity: 'info',
        actorName: activePersona.name,
        actorRole: currentRole,
        action: 'Keluar Sesi (Logout)',
        details: `Pengguna ${activePersona.name} (${currentRole}) telah keluar dari portal admin.`
      });
    }
    apiService.clearAuthSession();
    setIsAuthenticated(false);
    setCurrentAccount(null);
    setActiveTab('public');
    window.history.pushState(null, '', '/login');
  };

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('dwp_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem('dwp_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('dwp_proposals', JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem('dwp_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('dwp_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('dwp_news', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem('dwp_site_config', JSON.stringify(siteConfig));
    // Update browser tab favicon dynamically if faviconUrl is present
    if (siteConfig.faviconUrl) {
      let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(faviconLink);
      }
      faviconLink.href = siteConfig.faviconUrl;
    }
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem('dwp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const [focusedProposalId, setFocusedProposalId] = useState<string | null>(null);
  const [focusedWorkspaceTab, setFocusedWorkspaceTab] = useState<'usulan' | 'panitia' | 'sk' | 'absensi' | 'lpj'>('usulan');

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearReadNotifications = () => {
    setNotifications(prev => prev.filter(n => !(n.isRead && (n.targetRole === currentRole || n.targetRole === 'all'))));
  };

  const openProposalWorkspace = (proposalId: string, workspaceTab: 'usulan' | 'panitia' | 'sk' | 'absensi' | 'lpj' = 'usulan') => {
    const targetProposal = proposals.find(p => p.id === proposalId);
    if (!targetProposal) return;

    const canView = canViewProposalDetail(currentRole, activePersona.name, targetProposal);
    if (!canView) {
      alert(`🔒 AKSES DETIL TERBATAS:\n\nSebagai Ketua Bidang, Anda hanya dapat membuka detil kegiatan yang Anda usulkan sendiri.\n\nDetil kegiatan "${targetProposal.title}" ini hanya dapat dibuka oleh Pengusul (${targetProposal.createdBy}) atau Pimpinan (Ketua, Wakil, Sekretaris).`);
      return;
    }

    setAdminSubTab('proposals');
    setFocusedProposalId(proposalId);
    setFocusedWorkspaceTab(workspaceTab);
  };


  const basePersona = USER_PERSONAS[currentRole] || USER_PERSONAS.admin_master;
  let activePersona = { ...basePersona };

  if (basePersona.memberId) {
    const linkedMem = members.find(m => m.id === basePersona.memberId);
    if (linkedMem) {
      activePersona.name = linkedMem.name;
      activePersona.title = basePersona.title || linkedMem.jabatan;
      if (linkedMem.avatar) activePersona.avatar = linkedMem.avatar;
    }
  }

  // Helper functions
  const addUserAccount = (accData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    let finalEmail = accData.email;
    if (accData.memberId) {
      const linkedMem = members.find(m => m.id === accData.memberId);
      if (linkedMem && linkedMem.email) {
        finalEmail = linkedMem.email;
      }
    }
    const newAcc: UserAccount = {
      ...accData,
      email: finalEmail,
      id: `usr-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUserAccounts(prev => [newAcc, ...prev]);

    addSystemAuditLog({
      category: 'user',
      severity: 'info',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Pembuatan Akun User System Baru',
      details: `Akun user baru "${newAcc.username}" (${newAcc.email}) dengan role "${newAcc.role}" berhasil dibuat.`
    });
  };

  const updateUserAccount = (id: string, updated: Partial<UserAccount>) => {
    const targetUser = userAccounts.find(u => u.id === id);
    const uname = targetUser ? targetUser.username : id;

    setUserAccounts(prev => prev.map(u => {
      if (u.id !== id) return u;
      const targetMemberId = updated.memberId !== undefined ? updated.memberId : u.memberId;
      let finalEmail = updated.email || u.email;
      if (targetMemberId) {
        const linkedMem = members.find(m => m.id === targetMemberId);
        if (linkedMem && linkedMem.email) {
          finalEmail = linkedMem.email;
        }
      }
      return { ...u, ...updated, email: finalEmail };
    }));

    addSystemAuditLog({
      category: 'user',
      severity: 'info',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Pembaruan Kredensial Akun User',
      details: `Akun user "${uname}" diperbarui (Role: ${updated.role || 'tetap'}, Status: ${updated.status || 'tetap'}${updated.password ? ', Password Di-reset' : ''}).`
    });
  };

  const deleteUserAccount = (id: string) => {
    const targetUser = userAccounts.find(u => u.id === id);
    const uname = targetUser ? targetUser.username : id;

    setUserAccounts(prev => prev.filter(u => u.id !== id));

    addSystemAuditLog({
      category: 'user',
      severity: 'warning',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Penghapusan Akun User System',
      details: `Akun user system "${uname}" telah dihapus dari database oleh ${activePersona.name}.`
    });
  };

  const addMember = (newMem: Omit<Member, 'id' | 'dateJoined'>) => {
    const created: Member = {
      ...newMem,
      id: `dwp-${Date.now().toString().slice(-4)}`,
      dateJoined: new Date().toISOString().split('T')[0]
    };
    setMembers(prev => [created, ...prev]);

    addSystemAuditLog({
      category: 'member',
      severity: 'info',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Penambahan Data Anggota DWP Baru',
      details: `Anggota baru "${created.name}" (NIP: ${created.nip || '-'}, Jabatan: ${created.jabatan}, Bidang: ${created.bidang}) berhasil didaftarkan.`
    });
  };

  const updateMember = (id: string, updated: Partial<Member>) => {
    const targetMem = members.find(m => m.id === id);
    const mName = targetMem ? targetMem.name : id;

    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
    // Auto sync email to any linked user account
    if (updated.email) {
      setUserAccounts(prev => prev.map(u => u.memberId === id ? { ...u, email: updated.email! } : u));
    }

    addSystemAuditLog({
      category: 'member',
      severity: 'info',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Pembaruan Profil Data Anggota DWP',
      details: `Profil data anggota "${mName}" telah diperbarui oleh ${activePersona.name}.`
    });
  };

  const deleteMember = (id: string) => {
    const targetMem = members.find(m => m.id === id);
    const mName = targetMem ? targetMem.name : id;

    setMembers(prev => prev.filter(m => m.id !== id));

    addSystemAuditLog({
      category: 'member',
      severity: 'warning',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Penghapusan Data Anggota DWP',
      details: `Data anggota "${mName}" telah dihapus dari database oleh ${activePersona.name}.`
    });
  };

  const addProposal = (propData: Omit<ActivityProposal, 'id' | 'currentStage' | 'stageProgress' | 'logs' | 'createdAt'>) => {
    const role = activePersona.role;
    let initialStage: ProposalStage = 'stage_4_wakil_ketua';
    let initialProgress = 4;
    let initialLogNote = 'Usulan kegiatan diajukan. Menunggu Verifikasi Wakil Ketua.';

    if (role === 'wakil_ketua') {
      initialStage = 'stage_5_ketua';
      initialProgress = 5;
      initialLogNote = 'Usulan diajukan oleh Wakil Ketua (Verifikasi awal dilompati). Menunggu Persetujuan Ketua DWP.';
    } else if (role === 'ketua') {
      initialStage = 'approved';
      initialProgress = 5;
      initialLogNote = 'Kegiatan diterbitkan langsung oleh Ketua DWP (Auto-Approved).';
    }

    const newProp: ActivityProposal = {
      ...propData,
      id: `prop-${Date.now().toString().slice(-4)}`,
      currentStage: initialStage,
      stageProgress: initialProgress,
      createdBy: propData.createdBy || activePersona.name,
      creatorRole: role,
      createdAt: new Date().toISOString().split('T')[0],
      logs: [
        {
          id: `log-${Date.now()}`,
          stageName: 'Usulan Dibuat',
          actorRole: activePersona.role,
          actorName: activePersona.name,
          decision: 'approved',
          notes: initialLogNote,
          timestamp: new Date().toLocaleString('id-ID')
        }
      ]
    };

    // If auto-approved by Ketua, add notification log to Bendahara & Sekretaris
    if (role === 'ketua') {
      newProp.logs.push({
        id: `log-notif-${Date.now()}`,
        stageName: 'Tembusan Otomatis',
        actorRole: 'ketua',
        actorName: 'Sistem Organisasi DWP',
        decision: 'approved',
        notes: '📬 Tembusan otomatis dikirim ke Bendahara (Pencairan Dana) & Sekretaris (Pengarsipan & Agenda).',
        timestamp: new Date().toLocaleString('id-ID')
      });
    }

    setProposals(prev => [newProp, ...prev]);

    // System Audit Log Recording
    addSystemAuditLog({
      category: 'proposal',
      severity: 'info',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Pengajuan Usulan Kegiatan Baru',
      details: `Usulan "${newProp.title}" (Bidang: ${newProp.bidang}, RAB: Rp ${newProp.estimatedBudget.toLocaleString('id-ID')}) berhasil diajukan oleh ${activePersona.name}.`
    });

    // Dispatch real-time notification based on initial stage
    setTimeout(() => {
      const timestampStr = new Date().toLocaleString('id-ID');
      if (initialStage === 'stage_4_wakil_ketua') {
        setNotifications(prevNotifs => [
          {
            id: `notif-waket-${Date.now()}`,
            targetRole: 'wakil_ketua',
            title: '🛡️ Usulan Kegiatan Baru Perlu Verifikasi',
            message: `Usulan Kegiatan "${newProp.title}" dari ${newProp.createdBy} (Bidang ${newProp.bidang}) membutuhkan Verifikasi awal dari Anda.`,
            timestamp: timestampStr,
            isRead: false,
            type: 'new_proposal',
            proposalId: newProp.id,
            nextStepAction: '👉 Langkah Selanjutnya: Mohon telaah & verifikasi kelayakan usulan kegiatan & RAB.',
            targetTab: 'usulan',
            actionButtonText: 'Verifikasi Usulan ➔'
          },
          ...prevNotifs
        ]);
      } else if (initialStage === 'stage_5_ketua') {
        setNotifications(prevNotifs => [
          {
            id: `notif-ketua-${Date.now()}`,
            targetRole: 'ketua',
            title: '👑 Usulan Kegiatan Perlu Persetujuan Akhir',
            message: `Usulan Kegiatan "${newProp.title}" dari ${newProp.createdBy} (Bidang ${newProp.bidang}) membutuhkan Persetujuan Akhir dari Anda.`,
            timestamp: timestampStr,
            isRead: false,
            type: 'new_proposal',
            proposalId: newProp.id,
            nextStepAction: '👉 Langkah Selanjutnya: Berikan persetujuan akhir usulan kegiatan.',
            targetTab: 'usulan',
            actionButtonText: 'Buka Persetujuan Ketua ➔'
          },
          ...prevNotifs
        ]);
      }
    }, 50);
  };

  const advanceApproval = (proposalId: string, decision: 'approved' | 'rejected' | 'revision', notes: string) => {
    setProposals(prev => prev.map(p => {
      if (p.id !== proposalId) return p;

      let nextStage: ProposalStage = p.currentStage;
      let nextProgress = p.stageProgress;

      if (decision === 'rejected') {
        nextStage = 'rejected';
      } else if (decision === 'revision') {
        nextStage = 'revision_requested';
      } else {
        // Stage progression logic:
        // stage_4_wakil_ketua (Verifikasi Wakil Ketua) -> stage_5_ketua (Persetujuan Ketua)
        // stage_5_ketua (Persetujuan Ketua) -> approved (Final Disetujui)
        if (p.currentStage === 'stage_4_wakil_ketua') {
          nextStage = 'stage_5_ketua';
          nextProgress = 5;
        } else if (p.currentStage === 'stage_5_ketua') {
          nextStage = 'approved';
          nextProgress = 5;
        }
      }

      const stageLabels: Record<string, string> = {
        stage_4_wakil_ketua: 'Verifikasi Wakil Ketua',
        stage_5_ketua: 'Persetujuan Ketua DWP'
      };

      const newLog = {
        id: `log-${Date.now()}`,
        stageName: stageLabels[p.currentStage] || 'Peninjauan Proposal',
        actorRole: activePersona.role,
        actorName: activePersona.name,
        decision,
        notes: notes || (decision === 'approved' ? 'Telah diverifikasi dan disetujui.' : decision === 'revision' ? 'Perlu revisi penyesuaian.' : 'Ditolak.'),
        timestamp: new Date().toLocaleString('id-ID')
      };

      const updatedLogs = [...p.logs, newLog];

      // System Audit Log Recording
      addSystemAuditLog({
        category: 'proposal',
        severity: decision === 'approved' ? 'success' : decision === 'revision' ? 'warning' : 'error',
        actorName: activePersona.name,
        actorRole: currentRole,
        action: `Peninjauan Tahap Usulan Kegiatan`,
        details: `Usulan: "${p.title}" | Tahap: ${stageLabels[p.currentStage] || 'Peninjauan'} | Keputusan: ${decision.toUpperCase()} | Catatan: "${notes || '-'}"`
      });

      // Trigger real-time notifications based on stage transition
      setTimeout(() => {
        const timestampStr = new Date().toLocaleString('id-ID');

        // Case 1: Approved by Wakil Ketua -> Moves to Persetujuan Ketua DWP
        if (decision === 'approved' && nextStage === 'stage_5_ketua') {
          setNotifications(prevNotifs => [
            {
              id: `notif-ketua-${Date.now()}`,
              targetRole: 'ketua',
              title: '👑 Usulan Kegiatan Perlu Persetujuan Akhir',
              message: `Usulan Kegiatan "${p.title}" telah diverifikasi oleh Wakil Ketua dan membutuhkan Persetujuan Akhir dari Anda.`,
              timestamp: timestampStr,
              isRead: false,
              type: 'new_proposal',
              proposalId: p.id,
              nextStepAction: '👉 Langkah Selanjutnya: Berikan persetujuan akhir usulan kegiatan.',
              targetTab: 'usulan',
              actionButtonText: 'Buka Persetujuan Ketua ➔'
            },
            ...prevNotifs
          ]);
        }
        // Case 2: Final Approved by Ketua DWP -> Send to Bendahara, Sekretaris, & Pengusul
        else if (decision === 'approved' && nextStage === 'approved') {
          setNotifications(prevNotifs => [
            {
              id: `notif-bendahara-${Date.now()}`,
              targetRole: 'bendahara',
              title: '💰 Informasi Anggaran Disetujui Ketua DWP',
              message: `Informasi: Usulan Kegiatan "${p.title}" beserta RAB-nya telah disetujui resmi oleh Ketua DWP. Anggaran Rp ${p.estimatedBudget.toLocaleString('id-ID')} telah disahkan.`,
              timestamp: timestampStr,
              isRead: false,
              type: 'rab_pencairan',
              proposalId: p.id,
              nextStepAction: '👉 Informasi: Anggaran kegiatan telah disahkan. Siapkan alokasi pencairan dana sesuai RAB yang disetujui.',
              targetTab: 'usulan',
              actionButtonText: 'Lihat RAB Disetujui ➔'
            },
            {
              id: `notif-sekretaris-${Date.now() + 1}`,
              targetRole: 'sekretaris',
              title: '📜 Informasi Proposal Disetujui Ketua DWP',
              message: `Informasi: Usulan Kegiatan "${p.title}" telah disetujui resmi oleh Ketua DWP. Pengusul saat ini sedang menyusun panitia pelaksana kegiatan.`,
              timestamp: timestampStr,
              isRead: false,
              type: 'sk_pengarsipan',
              proposalId: p.id,
              nextStepAction: '👉 Informasi: Proposal telah disetujui Ketua DWP. Pengusul sedang menyusun panitia pelaksana. Anda akan mendapat notifikasi berikutnya saat draf dokumen siap.',
              targetTab: 'usulan',
              actionButtonText: 'Lihat Status Proposal ➔'
            },
            {
              id: `notif-pengusul-${Date.now() + 2}`,
              targetRole: p.creatorRole || 'admin_bidang',
              title: '🎉 Proposal Disetujui Resmi!',
              message: `Usulan Kegiatan "${p.title}" yang Anda ajukan telah disetujui resmi oleh Ketua DWP.`,
              timestamp: timestampStr,
              isRead: false,
              type: 'approved',
              proposalId: p.id,
              nextStepAction: '👉 Langkah Selanjutnya: Ketua Bidang / Pengusul menentukan Ketua Panitia & Tim Panitia Pelaksana di Tab Panitia.',
              targetTab: 'panitia',
              actionButtonText: 'Susun Panitia ➔'
            },
            ...prevNotifs
          ]);
        }
        // Case 3: Revision Requested -> Send to Pengusul
        else if (decision === 'revision') {
          setNotifications(prevNotifs => [
            {
              id: `notif-revisi-${Date.now()}`,
              targetRole: p.creatorRole || 'admin_bidang',
              title: '⚠️ Usulan Kegiatan Memerlukan Revisi',
              message: `Usulan Kegiatan "${p.title}" memerlukan revisi: "${notes || 'Perlu penyesuaian data.'}"`,
              timestamp: timestampStr,
              isRead: false,
              type: 'revision',
              proposalId: p.id,
              nextStepAction: '👉 Langkah Selanjutnya: Perbaiki poin-poin yang dicatat pada draf usulan lalu ajukan kembali.',
              targetTab: 'usulan',
              actionButtonText: 'Perbaiki Usulan ➔'
            },
            ...prevNotifs
          ]);
        }
        // Case 4: Rejected -> Send to Pengusul
        else if (decision === 'rejected') {
          setNotifications(prevNotifs => [
            {
              id: `notif-ditolak-${Date.now()}`,
              targetRole: p.creatorRole || 'admin_bidang',
              title: '🔴 Usulan Kegiatan Ditolak',
              message: `Usulan Kegiatan "${p.title}" ditolak: "${notes || 'Tidak disetujui.'}"`,
              timestamp: timestampStr,
              isRead: false,
              type: 'rejected',
              proposalId: p.id,
              nextStepAction: '👉 Usulan kegiatan ini ditolak. Anda dapat meninjau alasan penolakan pada log usulan.',
              targetTab: 'usulan',
              actionButtonText: 'Lihat Detail Log ➔'
            },
            ...prevNotifs
          ]);
        }
      }, 50);

      // If finally approved by Ketua, add automatic notification log to Bendahara & Sekretaris
      if (decision === 'approved' && nextStage === 'approved') {
        updatedLogs.push({
          id: `log-notif-${Date.now() + 1}`,
          stageName: 'Tembusan Otomatis',
          actorRole: 'ketua',
          actorName: 'Sistem Organisasi DWP',
          decision: 'approved',
          notes: '📬 Tembusan otomatis dikirim ke Bendahara (Pencairan Dana) & Sekretaris (Pengarsipan & Agenda).',
          timestamp: new Date().toLocaleString('id-ID')
        });
      }

      return {
        ...p,
        currentStage: nextStage,
        stageProgress: nextProgress,
        revisionComment: decision === 'revision' ? notes : undefined,
        logs: updatedLogs
      };
    }));
  };

  const resubmitProposal = (proposalId: string, updatedData: Partial<ActivityProposal>) => {
    setProposals(prev => prev.map(p => {
      if (p.id !== proposalId) return p;

      const creatorRole = p.creatorRole || 'admin_bidang';
      const targetStage: ProposalStage = creatorRole === 'wakil_ketua' ? 'stage_5_ketua' : 'stage_4_wakil_ketua';

      const resubmitLog = {
        id: `log-${Date.now()}`,
        stageName: 'Revisi Diajukan Kembali',
        actorRole: activePersona.role,
        actorName: activePersona.name,
        decision: 'approved' as const,
        notes: 'Proposal telah diperbaiki dan diajukan ulang untuk verifikasi.',
        timestamp: new Date().toLocaleString('id-ID')
      };

      setTimeout(() => {
        const timestampStr = new Date().toLocaleString('id-ID');
        const targetNotifRole = targetStage === 'stage_5_ketua' ? 'ketua' : 'wakil_ketua';
        setNotifications(prevNotifs => [
          {
            id: `notif-resubmit-${Date.now()}`,
            targetRole: targetNotifRole,
            title: '📝 Proposal Revisi Diajukan Kembali',
            message: `Usulan Kegiatan "${p.title}" yang sebelumnya direvisi telah diperbaiki dan diajukan kembali untuk peninjauan Anda.`,
            timestamp: timestampStr,
            isRead: false,
            type: 'new_proposal',
            proposalId: p.id
          },
          ...prevNotifs
        ]);
      }, 50);

      addSystemAuditLog({
        category: 'proposal',
        severity: 'info',
        actorName: activePersona.name,
        actorRole: currentRole,
        action: `Pengajuan Ulang Usulan (Revisi)`,
        details: `Usulan "${p.title}" yang sebelumnya direvisi telah diperbaiki dan diajukan kembali untuk verifikasi.`
      });

      return {
        ...p,
        ...updatedData,
        currentStage: targetStage,
        revisionComment: undefined,
        logs: [...p.logs, resubmitLog]
      };
    }));
  };

  const updateProposalCommittee = (proposalId: string, committeeMembers: CommitteeMember[]) => {
    const targetProp = proposals.find(p => p.id === proposalId);
    const pTitle = targetProp ? targetProp.title : proposalId;

    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, committeeMembers } : p));

    addSystemAuditLog({
      category: 'proposal',
      severity: 'info',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: `Pembaruan Susunan Panitia Pelaksana`,
      details: `Susunan Panitia Kegiatan "${pTitle}" telah diperbarui oleh ${activePersona.name} (${committeeMembers.length} Anggota Panitia).`
    });
  };

  const updateCommitteeStatus = (proposalId: string, status: CommitteeStatus, notes?: string, actorName?: string) => {
    let targetProposalTitle = '';
    let creatorRole: UserRole = 'admin_bidang';
    const timestampStr = new Date().toLocaleString('id-ID');

    setProposals(prev => prev.map(p => {
      if (p.id !== proposalId) return p;
      targetProposalTitle = p.title;
      creatorRole = p.creatorRole || 'admin_bidang';

      let stageName = 'Pengajuan Panitia Pelaksana';
      let decision: 'submitted' | 'verified' | 'approved' | 'revision' = 'submitted';

      if (status === 'pending_waket_verification') {
        stageName = 'Pengajuan Panitia Pelaksana';
        decision = 'submitted';
      } else if (status === 'pending_ketua_approval') {
        stageName = 'Verifikasi Wakil Ketua';
        decision = 'verified';
      } else if (status === 'approved_by_ketua') {
        stageName = 'Persetujuan Ketua DWP';
        decision = 'approved';
      } else if (status === 'revision_requested') {
        stageName = 'Permintaan Revisi Panitia';
        decision = 'revision';
      }

      const newLog: CommitteeLog = {
        id: `commlog-${Date.now()}`,
        stageName,
        actorName: actorName || activePersona.name || 'Pengurus DWP',
        decision,
        notes: notes || (status === 'pending_waket_verification' ? 'Susunan panitia diajukan untuk verifikasi.' : 'Tindak lanjut susunan panitia.'),
        timestamp: timestampStr
      };

      const existingLogs = p.committeeLogs || [];

      return {
        ...p,
        committeeStatus: status,
        committeeNotes: notes,
        committeeLogs: [...existingLogs, newLog]
      };
    }));

    addSystemAuditLog({
      category: 'proposal',
      severity: status === 'approved_by_ketua' ? 'success' : status === 'pending_waket_verification' ? 'info' : 'warning',
      actorName: actorName || activePersona.name,
      actorRole: currentRole,
      action: `Tindak Lanjut Status Panitia Pelaksana`,
      details: `Usulan "${targetProposalTitle}": Status Panitia -> ${status.toUpperCase()} | Catatan: "${notes || '-'}"`
    });

    setTimeout(() => {
      const timestampStr = new Date().toLocaleString('id-ID');
      if (status === 'pending_waket_verification') {
        setNotifications(prevNotifs => [
          {
            id: `notif-comm-waket-${Date.now()}`,
            targetRole: 'wakil_ketua',
            title: '🛡️ Susunan Panitia Perlu Verifikasi',
            message: `Susunan Panitia Pelaksana untuk kegiatan "${targetProposalTitle}" telah diajukan dan membutuhkan Verifikasi awal dari Anda.`,
            timestamp: timestampStr,
            isRead: false,
            type: 'new_proposal',
            proposalId
          },
          ...prevNotifs
        ]);
      } else if (status === 'pending_ketua_approval') {
        setNotifications(prevNotifs => [
          {
            id: `notif-comm-ketua-${Date.now()}`,
            targetRole: 'ketua',
            title: '👑 Susunan Panitia Perlu Persetujuan Akhir',
            message: `Susunan Panitia Pelaksana untuk kegiatan "${targetProposalTitle}" telah diverifikasi oleh Wakil Ketua dan membutuhkan Persetujuan Akhir dari Anda.`,
            timestamp: timestampStr,
            isRead: false,
            type: 'new_proposal',
            proposalId
          },
          ...prevNotifs
        ]);
      } else if (status === 'approved_by_ketua') {
        setNotifications(prevNotifs => [
          {
            id: `notif-comm-sekretaris-${Date.now()}`,
            targetRole: 'sekretaris',
            title: '📜 SK Panitia Siap Diterbitkan',
            message: `Susunan Panitia Pelaksana untuk kegiatan "${targetProposalTitle}" telah disetujui resmi oleh Ketua DWP. Draf SK Panitia siap dicetak.`,
            timestamp: timestampStr,
            isRead: false,
            type: 'sk_pengarsipan',
            proposalId
          },
          {
            id: `notif-comm-pengusul-${Date.now() + 1}`,
            targetRole: creatorRole,
            title: '🎉 Susunan Panitia Disetujui Resmi!',
            message: `Susunan Panitia Pelaksana yang Anda ajukan untuk kegiatan "${targetProposalTitle}" telah disetujui resmi oleh Ketua DWP.`,
            timestamp: timestampStr,
            isRead: false,
            type: 'approved',
            proposalId
          },
          ...prevNotifs
        ]);
      } else if (status === 'revision_requested') {
        setNotifications(prevNotifs => [
          {
            id: `notif-comm-revisi-${Date.now()}`,
            targetRole: creatorRole,
            title: '⚠️ Susunan Panitia Memerlukan Revisi',
            message: `Susunan Panitia Pelaksana untuk kegiatan "${targetProposalTitle}" memerlukan revisi: "${notes || 'Perlu penyesuaian susunan.'}"`,
            timestamp: timestampStr,
            isRead: false,
            type: 'revision',
            proposalId
          },
          ...prevNotifs
        ]);
      }
    }, 50);
  };

  const deleteProposal = (proposalId: string) => {
    const targetProposal = proposals.find(p => p.id === proposalId);
    const targetTitle = targetProposal ? targetProposal.title : proposalId;
    const targetOrganizer = targetProposal ? targetProposal.createdBy : 'Pengurus';
    const targetBudget = targetProposal ? targetProposal.estimatedBudget : 0;

    setProposals(prev => {
      const updated = prev.filter(p => p.id !== proposalId);
      localStorage.setItem('dwp_proposals', JSON.stringify(updated));
      return updated;
    });

    // Record Deletion Event in System Audit Logs
    addSystemAuditLog({
      category: 'proposal',
      severity: 'error',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: `Penghapusan Permanent Usulan Kegiatan`,
      details: `Usulan kegiatan "${targetTitle}" (Pengusul: ${targetOrganizer}, RAB: Rp ${targetBudget.toLocaleString('id-ID')}) telah dihapus dari sistem secara permanen oleh ${activePersona.name} (${activePersona.title}).`
    });
  };

  const addAttendanceRecord = (rec: Omit<AttendanceRecord, 'id' | 'status'>) => {
    const newRecord: AttendanceRecord = {
      ...rec,
      id: `att-${Date.now()}`,
      status: 'verified', // Auto verified if submitted
      checkInTime: new Date().toLocaleString('id-ID')
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
  };

  const verifyAttendanceRecord = (recordId: string, verifierName: string) => {
    setAttendanceRecords(prev => prev.map(r => 
      r.id === recordId ? { ...r, status: 'verified', verifiedBy: verifierName } : r
    ));
  };

  const createOrUpdateReport = (repData: Partial<ExecutionReport> & { activityId: string }) => {
    const existing = reports.find(r => r.activityId === repData.activityId);
    const nowStr = new Date().toISOString().split('T')[0];
    const proposal = proposals.find(p => p.id === repData.activityId);

    if (existing) {
      setReports(prev => prev.map(r => r.id === existing.id ? { ...r, ...repData, updatedAt: nowStr } : r));
    } else {
      const newRep: ExecutionReport = {
        id: `rep-${Date.now()}`,
        activityId: repData.activityId,
        activityTitle: proposal ? proposal.title : 'Kegiatan DWP GTK Malut',
        reportTitle: repData.reportTitle || `LAPORAN PELAKSANAAN KEGIATAN ${proposal?.title.toUpperCase()}`,
        background: repData.background || proposal?.background || '',
        executionSummary: repData.executionSummary || '',
        totalParticipants: repData.totalParticipants || 0,
        actualBudget: repData.actualBudget || proposal?.estimatedBudget || 0,
        outcomeResults: repData.outcomeResults || '',
        photoUrls: repData.photoUrls || [
          'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80'
        ],
        status: repData.status || 'draft',
        createdAt: nowStr,
        updatedAt: nowStr
      };
      setReports(prev => [newRep, ...prev]);
    }
  };

  const approveReportAndPublishNews = (reportId: string, ketuaNotes: string) => {
    const targetReport = reports.find(r => r.id === reportId);
    if (!targetReport) return;

    // 1. Update report status to approved_published
    setReports(prev => prev.map(r => r.id === reportId ? {
      ...r,
      status: 'approved_published',
      ketuaNotes
    } : r));

    // 2. Automatically generate News Article for Public Web!
    const newArticle: NewsArticle = {
      id: `news-${Date.now()}`,
      title: targetReport.reportTitle.replace('LAPORAN PELAKSANAAN KEGIATAN', 'DWP GTK Malut Success:'),
      category: 'Warta Kegiatan',
      author: 'Pengurus DWP GTK Malut',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      summary: targetReport.executionSummary.slice(0, 160) + '...',
      content: `${targetReport.executionSummary}\n\nHasil & Capaian Kegiatan:\n${targetReport.outcomeResults}`,
      mainImage: targetReport.photoUrls[0] || 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&auto=format&fit=crop&q=80',
      isPublished: true,
      sourceReportId: reportId
    };

    setNews(prev => [newArticle, ...prev]);

    addSystemAuditLog({
      category: 'proposal',
      severity: 'success',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Persetujuan LPJ & Publikasi Berita',
      details: `Laporan Pelaksanaan Kegiatan "${targetReport.activityTitle}" telah disetujui resmi oleh Ketua DWP dan diterbitkan sebagai Berita Publik.`
    });
  };

  const addNewsArticle = (art: Omit<NewsArticle, 'id'>) => {
    setNews(prev => [{ ...art, id: `news-${Date.now()}` }, ...prev]);
    addSystemAuditLog({
      category: 'cms',
      severity: 'info',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Publikasi Berita Baru',
      details: `Berita baru "${art.title}" (${art.category}) berhasil dipublikasikan ke situs web utama.`
    });
  };

  const [permissionMatrix, setPermissionMatrix] = useState<DynamicPermissionMatrix>(() => getDynamicPermissions());

  const updatePermissionMatrix = (matrix: DynamicPermissionMatrix) => {
    saveDynamicPermissions(matrix);
    setPermissionMatrix(matrix);

    addSystemAuditLog({
      category: 'system',
      severity: 'warning',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Pembaruan Matriks Hak Akses (RBAC)',
      details: `Matriks Hak Akses & Kewenangan Role Pengurus telah diperbarui secara real-time oleh ${activePersona.name}.`
    });
  };

  const resetPermissionMatrix = () => {
    const defaultMatrix = resetDynamicPermissionsToDefault();
    setPermissionMatrix(defaultMatrix);

    addSystemAuditLog({
      category: 'system',
      severity: 'warning',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Reset Matriks Hak Akses ke Default',
      details: `Matriks Hak Akses Role telah dikembalikan ke pengaturan standar oleh ${activePersona.name}.`
    });
  };

  const updateSiteConfig = (newCfg: Partial<SiteConfig>) => {
    setSiteConfig(prev => {
      const updated = { ...prev, ...newCfg };
      localStorage.setItem('dwp_site_config', JSON.stringify(updated));
      return updated;
    });

    addSystemAuditLog({
      category: 'cms',
      severity: 'info',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Pembaruan Tampilan CMS & Identitas Web',
      details: `Pengaturan CMS & Tampilan Situs Utama telah diperbarui oleh ${activePersona.name}.`
    });
  };

  const updateKopSuratConfig = (newCfg: Partial<KopSuratConfig>) => {
    setKopSuratConfig(prev => {
      const updated = { ...prev, ...newCfg };
      localStorage.setItem('dwp_kop_surat_config', JSON.stringify(updated));
      return updated;
    });

    addSystemAuditLog({
      category: 'cms',
      severity: 'info',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Pembaruan Pengaturan Kop Surat Resmi',
      details: `Pengaturan Header & Teks Kop Surat Resmi DWP GTK Maluku Utara telah diperbarui oleh ${activePersona.name}.`
    });
  };

  const createOrUpdateActivityDocument = (docData: Partial<ActivityDocument> & { proposalId: string; documentType: DocumentType }) => {
    const targetProp = proposals.find(p => p.id === docData.proposalId);
    const pTitle = targetProp ? targetProp.title : docData.proposalId;
    const nowStr = new Date().toLocaleString('id-ID');

    setActivityDocuments(prev => {
      const existingIndex = prev.findIndex(d => d.id === docData.id || (d.proposalId === docData.proposalId && d.documentType === docData.documentType && docData.documentType !== 'custom'));

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updatedDoc: ActivityDocument = {
          ...existing,
          ...docData,
          contentData: {
            ...existing.contentData,
            ...docData.contentData
          },
          updatedAt: nowStr
        };
        const newList = [...prev];
        newList[existingIndex] = updatedDoc;
        return newList;
      } else {
        const newDoc: ActivityDocument = {
          id: docData.id || `doc-${Date.now()}`,
          proposalId: docData.proposalId,
          documentType: docData.documentType,
          customTitle: docData.customTitle,
          assignedToMemberId: docData.assignedToMemberId,
          assignedToMemberName: docData.assignedToMemberName,
          status: docData.status || 'draft',
          letterNumber: docData.letterNumber,
          contentData: docData.contentData || {},
          logs: docData.logs || [{
            id: `doclog-${Date.now()}`,
            stageName: 'Draf Dokumen Dibuat',
            actorName: activePersona.name,
            actorRole: currentRole,
            decision: 'submitted',
            notes: 'Draf dokumen berhasil dibuat dan disimpan.',
            timestamp: nowStr
          }],
          createdAt: nowStr,
          updatedAt: nowStr
        };
        return [newDoc, ...prev];
      }
    });

    addSystemAuditLog({
      category: 'proposal',
      severity: 'info',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Penyusunan Draf Persuratan / SK',
      details: `Dokumen "${docData.customTitle || docData.documentType.toUpperCase()}" untuk kegiatan "${pTitle}" disimpan oleh ${activePersona.name}.`
    });
  };

  const assignDocumentTask = (documentId: string, memberId: string, memberName: string) => {
    setActivityDocuments(prev => prev.map(d => d.id === documentId ? {
      ...d,
      assignedToMemberId: memberId,
      assignedToMemberName: memberName,
      updatedAt: new Date().toLocaleString('id-ID')
    } : d));
  };

  const advanceDocumentApproval = (documentId: string, status: DocumentStatus, notes?: string, letterNumber?: string) => {
    const timestampStr = new Date().toLocaleString('id-ID');

    setActivityDocuments(prev => prev.map(d => {
      if (d.id !== documentId) return d;

      let stageName = 'Pengajuan Draf Dokumen';
      let decision: 'submitted' | 'verified' | 'approved' | 'revision' = 'submitted';

      if (status === 'pending_sekretaris_verification') {
        stageName = 'Penyerahan ke Sekretaris DWP';
        decision = 'submitted';
      } else if (status === 'pending_waket_verification') {
        stageName = 'Verifikasi Nomor Sekretaris DWP';
        decision = 'verified';
      } else if (status === 'pending_ketua_approval') {
        stageName = 'Verifikasi Wakil Ketua DWP';
        decision = 'verified';
      } else if (status === 'approved_published') {
        stageName = 'Pengesahan Resmi Ketua DWP';
        decision = 'approved';
      } else if (status === 'revision_requested') {
        stageName = 'Permintaan Revisi Dokumen';
        decision = 'revision';
      }

      const newLog: DocumentLog = {
        id: `doclog-${Date.now()}`,
        stageName,
        actorName: activePersona.name,
        actorRole: currentRole,
        decision,
        notes: notes || (status === 'approved_published' ? 'Dokumen resmi disahkan oleh Ketua DWP.' : 'Proses verifikasi dokumen.'),
        timestamp: timestampStr
      };

      // Dispatch targeted real-time notifications with next-step guidance
      setTimeout(() => {
        const docTitle = d.customTitle || d.documentType.toUpperCase();
        if (status === 'pending_sekretaris_verification') {
          setNotifications(prevNotifs => [
            {
              id: `notif-doc-sekretaris-${Date.now()}`,
              targetRole: 'sekretaris',
              title: '📝 Draf Dokumen Perlu Penomoran Surat',
              message: `Draf dokumen "${docTitle}" diserahkan panitia untuk penomoran surat resmi.`,
              timestamp: timestampStr,
              isRead: false,
              type: 'sk_pengarsipan',
              proposalId: d.proposalId,
              nextStepAction: '👉 Langkah Selanjutnya: Sekretaris DWP menginput Nomor Surat Resmi Organisasi.',
              targetTab: 'sk',
              actionButtonText: 'Input Nomor Surat ➔'
            },
            ...prevNotifs
          ]);
        } else if (status === 'pending_waket_verification') {
          setNotifications(prevNotifs => [
            {
              id: `notif-doc-waket-${Date.now()}`,
              targetRole: 'wakil_ketua',
              title: '🛡️ Dokumen Perlu Verifikasi Redaksi',
              message: `Nomor Surat "${letterNumber || d.letterNumber || '...'}" telah diisi oleh Sekretaris DWP.`,
              timestamp: timestampStr,
              isRead: false,
              type: 'sk_pengarsipan',
              proposalId: d.proposalId,
              nextStepAction: '👉 Langkah Selanjutnya: Wakil Ketua memverifikasi redaksi & kelengkapan lampiran surat.',
              targetTab: 'sk',
              actionButtonText: 'Verifikasi Redaksi Surat ➔'
            },
            ...prevNotifs
          ]);
        } else if (status === 'pending_ketua_approval') {
          setNotifications(prevNotifs => [
            {
              id: `notif-doc-ketua-${Date.now()}`,
              targetRole: 'ketua',
              title: '✍️ Dokumen Perlu Pengesahan & Cap Stempel',
              message: `Dokumen "${docTitle}" telah diverifikasi oleh Wakil Ketua DWP dan siap disahkan.`,
              timestamp: timestampStr,
              isRead: false,
              type: 'sk_pengarsipan',
              proposalId: d.proposalId,
              nextStepAction: '👉 Langkah Selanjutnya: Ketua DWP memberikan pengesahan Tanda Tangan Digital & Cap Stempel Resmi.',
              targetTab: 'sk',
              actionButtonText: 'Tandatangani & Cap Surat ➔'
            },
            ...prevNotifs
          ]);
        } else if (status === 'approved_published') {
          setNotifications(prevNotifs => [
            {
              id: `notif-doc-pub-${Date.now()}`,
              targetRole: 'all',
              title: '🖨️ Dokumen Resmi Berhasil Diterbitkan',
              message: `Dokumen "${docTitle}" telah resmi disahkan oleh Ketua DWP dan siap dicetak.`,
              timestamp: timestampStr,
              isRead: false,
              type: 'approved',
              proposalId: d.proposalId,
              nextStepAction: '👉 Langkah Selanjutnya: Cetak / Unduh PDF Surat dan laksanakan kegiatan. Setelah selesai, kumpulkan LPJ di Tab LPJ.',
              targetTab: 'sk',
              actionButtonText: 'Cetak Dokumen / Tab LPJ ➔'
            },
            ...prevNotifs
          ]);
        } else if (status === 'revision_requested') {
          setNotifications(prevNotifs => [
            {
              id: `notif-doc-rev-${Date.now()}`,
              targetRole: 'all',
              title: '⚠️ Dokumen Kegiatan Perlu Perbaikan Redaksi',
              message: `Dokumen "${docTitle}" memerlukan revisi: "${notes || '-'}"`,
              timestamp: timestampStr,
              isRead: false,
              type: 'revision',
              proposalId: d.proposalId,
              nextStepAction: '👉 Langkah Selanjutnya: Perbaiki redaksi dokumen sesuai catatan verifikator lalu ajukan kembali.',
              targetTab: 'sk',
              actionButtonText: 'Perbaiki Dokumen ➔'
            },
            ...prevNotifs
          ]);
        }
      }, 50);

      return {
        ...d,
        status,
        letterNumber: letterNumber || d.letterNumber,
        logs: [...d.logs, newLog],
        updatedAt: timestampStr
      };
    }));

    addSystemAuditLog({
      category: 'proposal',
      severity: status === 'approved_published' ? 'success' : status === 'revision_requested' ? 'warning' : 'info',
      actorName: activePersona.name,
      actorRole: currentRole,
      action: 'Verifikasi & Approval Persuratan',
      details: `Status Dokumen ID ${documentId} -> ${status.toUpperCase()} | Catatan: "${notes || '-'}"`
    });
  };

  const deleteActivityDocument = (documentId: string) => {
    setActivityDocuments(prev => prev.filter(d => d.id !== documentId));
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      currentAccount,
      login,
      logout,
      currentRole,
      setCurrentRole,
      activePersona,
      members,
      addMember,
      updateMember,
      deleteMember,
      userAccounts,
      addUserAccount,
      updateUserAccount,
      deleteUserAccount,
      proposals,
      addProposal,
      advanceApproval,
      resubmitProposal,
      updateProposalCommittee,
      updateCommitteeStatus,
      deleteProposal,
      attendanceRecords,
      addAttendanceRecord,
      verifyAttendanceRecord,
      reports,
      createOrUpdateReport,
      approveReportAndPublishNews,
      news,
      addNewsArticle,
      siteConfig,
      updateSiteConfig,
      kopSuratConfig,
      updateKopSuratConfig,
      activityDocuments,
      createOrUpdateActivityDocument,
      assignDocumentTask,
      advanceDocumentApproval,
      deleteActivityDocument,
      permissionMatrix,
      updatePermissionMatrix,
      resetPermissionMatrix,
      activeTab,
      setActiveTab,
      adminSubTab,
      setAdminSubTab,
      notifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearReadNotifications,
      systemAuditLogs,
      addSystemAuditLog,
      focusedProposalId,
      setFocusedProposalId,
      focusedWorkspaceTab,
      setFocusedWorkspaceTab,
      openProposalWorkspace
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

