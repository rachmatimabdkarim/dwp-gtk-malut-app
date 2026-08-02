export type UserRole = 
  | 'admin_master'
  | 'admin_bidang'
  | 'sekretaris'
  | 'bendahara'
  | 'wakil_ketua'
  | 'ketua'
  | 'anggota';

export interface UserPersona {
  role: UserRole;
  name: string;
  title: string;
  avatar: string;
  memberId?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  email: string;
  role: UserRole;          // Role fallback jika non-anggota, atau role otomatis jika terhubung ke memberId
  memberId?: string;       // Optional link to Member. Null for non-member IT Admins.
  status: 'aktif' | 'non-aktif';
  createdAt: string;
}

export interface Member {
  id: string;
  nip?: string;
  name: string;
  jabatan: string; // e.g. "Ketua Bidang Pendidikan", "Anggota", "Sekretaris II"
  unitKerja: string; // Instansi / Tempat Bekerja
  pekerjaan?: string; // Pekerjaan / Profesi
  golonganDarah?: string; // Golongan Darah (A, B, AB, O, -)
  namaSuami?: string; // Nama Suami
  namaAnak?: string; // Nama Anak-Anak
  bidang: 'Pendidikan' | 'Ekonomi' | 'Sosial Budaya' | '-';




  phone: string;
  email: string;
  status: 'Aktif' | 'Non-Aktif';
  dateJoined: string;
  avatar?: string;
}

export type ProposalStage = 
  | 'stage_4_wakil_ketua'
  | 'stage_5_ketua'
  | 'approved'
  | 'rejected'
  | 'revision_requested';

export interface ApprovalLog {
  id: string;
  stageName: string;
  actorRole: UserRole;
  actorName: string;
  decision: 'approved' | 'rejected' | 'revision';
  notes: string;
  timestamp: string;
}

export interface CommitteeMember {
  id: string;
  roleTitle: 'Ketua Panitia' | 'Sekretaris Panitia' | 'Bendahara Panitia' | 'Seksi Acara' | 'Seksi Humas & Logistik' | 'Anggota Panitia';
  memberName: string;
  memberId?: string;
  phone?: string;
}

export interface CommitteeLog {
  id: string;
  stageName: string;
  actorName: string;
  decision: 'submitted' | 'verified' | 'approved' | 'revision';
  notes: string;
  timestamp: string;
}

export type CommitteeStatus = 
  | 'draft' 
  | 'pending_waket_verification' 
  | 'pending_ketua_approval' 
  | 'approved_by_ketua' 
  | 'revision_requested';

export interface ActivityProposal {
  id: string;
  title: string;
  bidang: 'Pendidikan' | 'Ekonomi' | 'Sosial Budaya' | 'Sekretariat';
  organizer: string;
  background: string;
  objective: string;
  targetAudience: string;
  estimatedBudget: number;
  location: string;
  startDate: string;
  endDate: string;
  currentStage: ProposalStage;
  stageProgress: number; // 1 to 5
  logs: ApprovalLog[];
  createdBy: string;
  creatorRole?: UserRole;
  createdAt: string;
  revisionComment?: string;
  committeeMembers?: CommitteeMember[];
  committeeStatus?: CommitteeStatus;
  committeeNotes?: string;
  committeeLogs?: CommitteeLog[];
}

export interface AttendanceRecord {
  id: string;
  activityId: string;
  memberId?: string;
  participantName: string;
  nip?: string;
  jabatan: string;
  phone: string;
  checkInTime: string;
  signatureUrl: string; // Base64 Canvas Drawing
  status: 'verified' | 'unverified';
  verifiedBy?: string;
  notes?: string;
}

export interface SystemAuditLogEntry {
  id: string;
  timestamp: string;
  category: 'proposal' | 'member' | 'user' | 'security' | 'system' | 'auth' | 'cms';
  severity: 'info' | 'success' | 'warning' | 'error';
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface ExecutionReport {
  id: string;
  activityId: string;
  activityTitle: string;
  reportTitle: string;
  background: string;
  executionSummary: string;
  totalParticipants: number;
  actualBudget: number;
  outcomeResults: string;
  photoUrls: string[];
  status: 'draft' | 'pending_ketua_review' | 'approved_published';
  ketuaNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  targetRole: UserRole | 'all';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'approved' | 'revision' | 'rejected' | 'new_proposal' | 'rab_pencairan' | 'sk_pengarsipan';
  proposalId?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  summary: string;
  content: string;
  mainImage: string;
  isPublished: boolean;
  sourceReportId?: string;
}

export interface SiteConfig {
  siteTitle: string;
  subTitle?: string;
  siteLogoUrl?: string;
  faviconUrl?: string;
  heroTitle: string;
  heroSubtext: string;
  heroCtaText?: string;
  heroCtaAction?: 'scroll_berita' | 'scroll_agenda' | 'scroll_sambutan' | 'scroll_visi' | 'scroll_struktur' | 'open_admin' | 'custom_url';
  heroCtaUrl?: string;
  heroBannerUrl: string;

  heroOverlayOpacity?: number; // 0 to 100
  heroOverlayStyle?: 'dark' | 'burgundy' | 'navy' | 'subtle';
  sambutanTagText?: string;
  sambutanKetuaQuote?: string;
  sambutanKetuaText: string;

  visiTagText?: string;
  visiTitle?: string;
  visiSubtext?: string;
  visiText: string;
  misiList: string[];
  strukturTagText?: string;
  strukturTitle?: string;
  strukturSubtext?: string;
  beritaTagText?: string;
  beritaTitle?: string;
  beritaSubtext?: string;
  agendaTagText?: string;
  agendaTitle?: string;
  agendaSubtext?: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  youtube: string;
  primaryThemeColor: string;
  footerDescription?: string;
  copyrightText?: string;
  kopSurat?: KopSuratConfig;
}

export interface KopSuratConfig {
  logoUrl: string;
  headerLine1: string;
  headerLine2: string;
  headerLine3: string;
  address: string;
  phone?: string;
  email: string;
  website: string;
  showDoubleLine: boolean;
  logoSize?: number; // in px
  headerLine1FontSize?: number; // in px
  headerLine2FontSize?: number; // in px
  headerLine3FontSize?: number; // in px
  addressFontSize?: number; // in px
  headerLineSpacing?: number; // in px
  bottomLineSpacing?: number; // in px
  borderStyle?: 'single_thick' | 'double';
  borderWidth?: number; // in px
}

export type DocumentType = 'sk_panitia' | 'surat_tugas' | 'surat_undangan' | 'custom';
export type DocumentStatus = 
  | 'draft'
  | 'pending_panitia_review'
  | 'pending_sekretaris_verification'
  | 'pending_waket_verification'
  | 'pending_ketua_approval'
  | 'approved_published'
  | 'revision_requested';

export interface DocumentLog {
  id: string;
  stageName: string;
  actorName: string;
  actorRole: string;
  decision: 'submitted' | 'verified' | 'approved' | 'revision';
  notes: string;
  timestamp: string;
}

export interface ActivityDocument {
  id: string;
  proposalId: string;
  documentType: DocumentType;
  customTitle?: string;
  assignedToMemberId?: string;
  assignedToMemberName?: string;
  status: DocumentStatus;
  letterNumber?: string;
  contentData: {
    menimbang?: string[];
    mengingat?: string[];
    diktum?: string[];
    maksudTugas?: string;
    penerima?: string;
    rundown?: string;
    bodyText?: string;
    letterDate?: string;
    locationCity?: string;
    signedByKetuaName?: string;
    signedByKetuaNip?: string;
    ketuaNotes?: string;
  };
  logs: DocumentLog[];
  createdAt: string;
  updatedAt: string;
}



