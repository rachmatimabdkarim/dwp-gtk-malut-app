import { supabase } from '../lib/supabase';
import { 
  Member, 
  UserAccount, 
  ActivityProposal, 
  SiteConfig, 
  NewsArticle, 
  AttendanceRecord,
  UserRole,
  ProposalStage,
  ActivityDocument,
  AppNotification,
  KopSuratConfig,
  DocumentType,
  DocumentStatus,
  CommitteeMember,
  CommitteeStatus,
  CommitteeLog,
  DocumentJobDesk,
  JobDeskLog
} from '../types';
import { toISODateSafe, toISOStringSafe } from '../utils/dateFormatter';

/**
 * ID Notifikasi bawaan (Seed Demo INITIAL_NOTIFICATIONS) yang tidak boleh disinkronkan ke cloud.
 */
export const SEED_NOTIFICATION_IDS = new Set<string>([
  'e0000001-0000-0000-0000-000000000001',
  'e0000002-0000-0000-0000-000000000002',
  'e0000003-0000-0000-0000-000000000003',
  'e0000004-0000-0000-0000-000000000004'
]);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUUID = (str?: string): boolean => {
  if (!str) return false;
  return UUID_REGEX.test(str);
};

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Deterministic map for predefined legacy / mock IDs
const legacyUuidMap: Record<string, string> = {
  'dwp-001': '11111111-1111-1111-1111-111111111111',
  'dwp-002': '22222222-2222-2222-2222-222222222222',
  'dwp-003': '33333333-3333-3333-3333-333333333333',
  'dwp-004': '44444444-4444-4444-4444-444444444444',
  'dwp-005': '55555555-5555-5555-5555-555555555555',
  'dwp-006': '66666666-6666-6666-6666-666666666666',
  'dwp-007': '77777777-7777-7777-7777-777777777777',
  'dwp-008': '88888888-8888-8888-8888-888888888888',
  'dwp-009': '99999999-9999-9999-9999-999999999999',
  'usr-001': '09d3f668-c647-4156-97de-ab059e1f9800',
  'usr-002': '12b747b5-07f3-41e6-a59f-edfd54b84402',
  'usr-003': '1ebffcb5-1da3-4878-9f3e-01edc0c87423',
  'usr-004': '7f7046c1-1389-4c38-a036-4bf640cb1537',
  'usr-005': '9097a2f5-1584-4570-844a-fd8ed68ee814',
  'usr-006': '879a9725-f247-4378-a6e8-e0648196105c',
  'usr-007': '23a9b8c7-d6e5-4f3a-2b1c-0d9e8f7a6b5c',
  'usr-008': '34b0c9d8-e7f6-5a4b-3c2d-1e0f9a8b7c6d',
  'usr-009': '45c1dae9-f8a7-6b5c-4d3e-2f1a0b9c8d7e',
  'prop-001': 'a0000001-0000-0000-0000-000000000001',
  'prop-002': 'a0000002-0000-0000-0000-000000000002',
  'prop-003': 'a0000003-0000-0000-0000-000000000003',
  'news-1': 'c0000001-0000-0000-0000-000000000001',
  'news-2': 'c0000002-0000-0000-0000-000000000002',
  'att-1': 'd0000001-0000-0000-0000-000000000001',
  'att-2': 'd0000002-0000-0000-0000-000000000002',
  'att-3': 'd0000003-0000-0000-0000-000000000003'
};

const dynamicUuidCache = new Map<string, string>();

export const ensureUUID = (id?: string): string => {
  if (!id) return generateUUID();
  if (isUUID(id)) return id;
  if (legacyUuidMap[id]) return legacyUuidMap[id];
  if (dynamicUuidCache.has(id)) return dynamicUuidCache.get(id)!;
  const newUuid = generateUUID();
  dynamicUuidCache.set(id, newUuid);
  return newUuid;
};

export const parseJsonArray = <T>(val: any): T[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

/**
 * Cek apakah terdapat sesi login aktif di Supabase Auth.
 */
export const hasActiveAuthSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Menangani error Supabase dengan tenang (terutama 403 / 42501 RLS restriction).
 * Menghindari error merah di console pengguna.
 */
const handleSupabaseError = (context: string, error: any) => {
  if (!error) return;
  const isRlsRestriction = 
    error.code === '42501' || 
    error.status === 403 || 
    (error.message && (
      error.message.toLowerCase().includes('row-level security') ||
      error.message.toLowerCase().includes('permission denied') ||
      error.message.toLowerCase().includes('violates row-level security')
    ));

  if (isRlsRestriction) {
    console.info(`[RLS Policy] Akses dibatasi pada ${context}: ${error.message}`);
  } else {
    console.warn(`Supabase ${context} warning:`, error.message);
  }
};

export const cloudSync = {
  // ==========================================
  // 1. DATA ANGGOTA / MEMBERS
  // ==========================================
  async fetchMembers(isLoggedIn?: boolean): Promise<Member[] | null> {
    try {
      const isAuth = isLoggedIn !== undefined ? isLoggedIn : await hasActiveAuthSession();

      if (!isAuth) {
        // Mode Anonim: HANYA baca view publik v_members_publik
        const { data, error } = await supabase
          .from('v_members_publik')
          .select('id, name, jabatan, bidang, unit_kerja, avatar')
          .order('name', { ascending: true });

        if (error) {
          handleSupabaseError('fetchMembers (v_members_publik)', error);
          return null;
        }
        if (!data) return null;
        if (data.length === 0) return [];

        return data.map((row: any): Member => ({
          id: row.id,
          nik: undefined,
          nip: undefined,
          name: row.name,
          email: '',
          phone: '',
          jabatan: row.jabatan || 'Anggota',
          bidang: (row.bidang as any) || '-',
          unitKerja: row.unit_kerja || '',
          pekerjaan: undefined,
          golonganDarah: '-',
          namaSuami: undefined,
          namaAnak: undefined,
          status: 'Aktif',
          avatar: row.avatar || undefined,
          dateJoined: ''
        }));
      }

      // Mode Login: Baca tabel privat members lengkap
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        handleSupabaseError('fetchMembers (members table)', error);
        return null;
      }
      if (!data) return null;
      if (data.length === 0) return [];

      return data.map((row: any): Member => ({
        id: row.id,
        nik: row.nik || undefined,
        nip: row.nip || undefined,
        name: row.name,
        email: row.email,
        phone: row.phone || '',
        jabatan: row.jabatan || 'Anggota',
        bidang: (row.bidang as any) || '-',
        unitKerja: row.unit_kerja || '',
        pekerjaan: row.pekerjaan || undefined,
        golonganDarah: row.golongan_darah || '-',
        namaSuami: row.nama_suami || undefined,
        namaAnak: row.nama_anak || undefined,
        status: row.status === 'Non-Aktif' ? 'Non-Aktif' : 'Aktif',
        avatar: row.avatar || undefined,
        dateJoined: row.date_joined || new Date().toISOString().split('T')[0]
      }));
    } catch (e) {
      console.warn('Supabase fetchMembers exception:', e);
      return null;
    }
  },

  async syncMembers(members: Member[]) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati push ke cloud jika tidak login
      if (!members || members.length === 0) return;
      // Jangan pernah push data anggota tanpa email valid (mis. dari view publik v_members_publik)
      const validMembers = members.filter(m => m.email && m.email.trim() !== '');
      if (validMembers.length === 0) return;
      const rows = validMembers.map(m => ({
        id: ensureUUID(m.id),
        nik: m.nik || null,
        nip: m.nip || null,
        name: m.name,
        email: m.email,
        phone: m.phone || null,
        jabatan: m.jabatan,
        bidang: m.bidang || '-',
        unit_kerja: m.unitKerja || '',
        pekerjaan: m.pekerjaan || null,
        golongan_darah: m.golonganDarah || '-',
        nama_suami: m.namaSuami || null,
        nama_anak: m.namaAnak || null,
        status: m.status || 'Aktif',
        avatar: m.avatar || null,
        date_joined: m.dateJoined ? toISODateSafe(m.dateJoined) : new Date().toISOString().split('T')[0]
      }));

      const { error } = await supabase.from('members').upsert(rows, { onConflict: 'id' });
      if (error) handleSupabaseError('syncMembers', error);
    } catch (e) {
      console.warn('Sync members error:', e);
    }
  },

  async deleteMember(id: string) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati push ke cloud jika tidak login
      const uuid = ensureUUID(id);
      const { error } = await supabase.from('members').delete().eq('id', uuid);
      if (error) handleSupabaseError('deleteMember', error);
    } catch (e) {
      console.warn('Delete member error:', e);
    }
  },

  // ==========================================
  async fetchUserAccounts(isLoggedIn?: boolean): Promise<UserAccount[] | null> {
    try {
      const isAuth = isLoggedIn !== undefined ? isLoggedIn : await hasActiveAuthSession();
      if (!isAuth) {
        // Mode Anonim: JANGAN baca user_accounts dari Supabase (cegah 403 RLS console error)
        return null;
      }

      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        handleSupabaseError('fetchUserAccounts', error);
        return null;
      }
      if (!data) return null;
      if (data.length === 0) return [];

      return data.map((row: any): UserAccount => ({
        id: row.id,
        username: row.username,
        email: row.email,
        password: '', // Keamanan RLS: jangan simpan password/hash ke state lokal
        role: row.role as UserRole,
        memberId: row.member_id || undefined,
        status: row.status === 'non-aktif' ? 'non-aktif' : 'aktif',
        createdAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        auth_id: row.auth_id || undefined
      }));
    } catch (e) {
      console.warn('Supabase fetchUserAccounts exception:', e);
      return null;
    }
  },

  async syncUserAccounts(users: UserAccount[]) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati push ke cloud jika tidak login
      if (!users || users.length === 0) return;
      // Jangan simpan atau push plaintext password ke kolom password_hash
      const rows = users.map(u => ({
        id: ensureUUID(u.id),
        username: u.username,
        email: u.email,
        role: u.role,
        member_id: u.memberId ? ensureUUID(u.memberId) : null,
        status: u.status || 'aktif',
        created_at: toISOStringSafe(u.createdAt),
        ...(u.auth_id ? { auth_id: ensureUUID(u.auth_id) } : {})
      }));

      const { error } = await supabase.from('user_accounts').upsert(rows, { onConflict: 'id' });
      if (error) handleSupabaseError('syncUserAccounts', error);
    } catch (e) {
      console.warn('Sync user accounts error:', e);
    }
  },

  async deleteUserAccount(id: string) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati push ke cloud jika tidak login
      const uuid = ensureUUID(id);
      const { error } = await supabase.from('user_accounts').delete().eq('id', uuid);
      if (error) handleSupabaseError('deleteUserAccount', error);
    } catch (e) {
      console.warn('Delete user account error:', e);
    }
  },

  // ==========================================
  // 3. PROPOSAL KEGIATAN & LOG APPROVAL
  // ==========================================
  async fetchProposals(isLoggedIn?: boolean): Promise<ActivityProposal[] | null> {
    try {
      const isAuth = isLoggedIn !== undefined ? isLoggedIn : await hasActiveAuthSession();

      if (!isAuth) {
        // Mode Anonim: HANYA baca view publik v_kegiatan_publik (tanpa approval_logs privat)
        const { data, error } = await supabase
          .from('v_kegiatan_publik')
          .select('id, title, bidang, organizer, location, start_date, end_date, current_stage');

        if (error) {
          handleSupabaseError('fetchProposals (v_kegiatan_publik)', error);
          return null;
        }
        if (!data) return null;
        if (data.length === 0) return [];

        return data.map((row: any): ActivityProposal => ({
          id: row.id,
          title: row.title,
          bidang: row.bidang || 'Pendidikan',
          organizer: row.organizer || '',
          background: '',
          objective: '',
          targetAudience: '',
          estimatedBudget: 0,
          location: row.location || '',
          startDate: row.start_date || '',
          endDate: row.end_date || '',
          currentStage: (row.current_stage as ProposalStage) || 'approved',
          stageProgress: 5,
          createdBy: row.organizer || 'Admin DWP',
          createdAt: row.start_date || '',
          logs: [],
          committeeMembers: [],
          committeeStatus: undefined,
          committeeNotes: undefined,
          committeeLogs: [],
          documentJobDesks: [],
          jobDeskLogs: []
        }));
      }

      // Mode Login: Baca tabel privat activity_proposals & approval_logs lengkap
      const { data, error } = await supabase
        .from('activity_proposals')
        .select('*, approval_logs(*)')
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError('fetchProposals (activity_proposals)', error);
        return null;
      }
      if (!data) return null;
      if (data.length === 0) return [];

      return data.map((row: any): ActivityProposal => {
        const rawLogs = Array.isArray(row.approval_logs) ? row.approval_logs : [];
        const logs = rawLogs.map((l: any) => ({
          id: l.id,
          stageName: l.stage_name,
          actorRole: l.actor_role as UserRole,
          actorName: l.actor_name,
          decision: l.decision as 'approved' | 'rejected' | 'revision',
          notes: l.notes || '',
          timestamp: l.created_at ? new Date(l.created_at).toLocaleString('id-ID') : ''
        }));

        return {
          id: row.id,
          title: row.title,
          bidang: row.bidang,
          organizer: row.organizer || '',
          background: row.background || '',
          objective: row.objective || '',
          targetAudience: row.target_audience || '',
          estimatedBudget: Number(row.estimated_budget) || 0,
          location: row.location || '',
          startDate: row.start_date || '',
          endDate: row.end_date || '',
          currentStage: (row.current_stage as ProposalStage) || 'stage_4_wakil_ketua',
          stageProgress: row.stage_progress || 1,
          createdBy: row.created_by,
          creatorRole: row.creator_role ? (row.creator_role as UserRole) : undefined,
          revisionComment: row.revision_comment || undefined,
          committeeMembers: parseJsonArray<CommitteeMember>(row.committee_members),
          committeeStatus: (row.committee_status as CommitteeStatus) || undefined,
          committeeNotes: row.committee_notes || undefined,
          committeeLogs: parseJsonArray<CommitteeLog>(row.committee_logs),
          documentJobDesks: parseJsonArray<DocumentJobDesk>(row.document_job_desks),
          jobDeskLogs: parseJsonArray<JobDeskLog>(row.job_desk_logs),
          createdAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          logs: logs.length > 0 ? logs : [
            {
              id: `log-${row.id}`,
              stageName: 'Usulan Dibuat',
              actorRole: (row.creator_role as UserRole) || 'admin_bidang',
              actorName: row.created_by,
              decision: 'approved',
              notes: 'Usulan kegiatan diajukan.',
              timestamp: row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : ''
            }
          ]
        };
      });
    } catch (e) {
      console.warn('Supabase fetchProposals exception:', e);
      return null;
    }
  },

  async syncProposals(proposals: ActivityProposal[]) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati push ke cloud jika tidak login
      if (!proposals || proposals.length === 0) return;

      for (const p of proposals) {
        const propId = ensureUUID(p.id);
        const { error: pErr } = await supabase.from('activity_proposals').upsert({
          id: propId,
          title: p.title,
          bidang: p.bidang,
          organizer: p.organizer || '',
          background: p.background || '',
          objective: p.objective || '',
          target_audience: p.targetAudience || '',
          estimated_budget: Number(p.estimatedBudget) || 0,
          location: p.location || '',
          start_date: toISODateSafe(p.startDate),
          end_date: toISODateSafe(p.endDate),
          current_stage: p.currentStage || 'stage_4_wakil_ketua',
          stage_progress: p.stageProgress || 1,
          created_by: p.createdBy,
          creator_role: p.creatorRole || null,
          revision_comment: p.revisionComment || null,
          committee_members: parseJsonArray(p.committeeMembers),
          committee_status: p.committeeStatus || null,
          committee_notes: p.committeeNotes || null,
          committee_logs: parseJsonArray(p.committeeLogs),
          document_job_desks: parseJsonArray(p.documentJobDesks),
          job_desk_logs: parseJsonArray(p.jobDeskLogs),
          created_at: toISOStringSafe(p.createdAt)
        }, { onConflict: 'id' });

        if (pErr) {
          handleSupabaseError('syncProposals (activity_proposals)', pErr);
          continue;
        }

        // Upsert logs associated with this proposal
        if (p.logs && p.logs.length > 0) {
          const logRows = p.logs.map(l => ({
            id: ensureUUID(l.id),
            proposal_id: propId,
            stage_name: l.stageName,
            actor_role: l.actorRole,
            actor_name: l.actorName,
            decision: l.decision,
            notes: l.notes || '',
            created_at: toISOStringSafe(l.timestamp)
          }));

          const { error: lErr } = await supabase.from('approval_logs').upsert(logRows, { onConflict: 'id' });
          if (lErr) handleSupabaseError('syncProposals (approval_logs)', lErr);
        }
      }
    } catch (e) {
      console.warn('Sync proposals error:', e);
    }
  },

  async deleteProposal(id: string) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati push ke cloud jika tidak login
      const propId = ensureUUID(id);
      await supabase.from('approval_logs').delete().eq('proposal_id', propId);
      const { error } = await supabase.from('activity_proposals').delete().eq('id', propId);
      if (error) handleSupabaseError('deleteProposal', error);
    } catch (e) {
      console.warn('Delete proposal error:', e);
    }
  },

  // ==========================================
  // 4. SITE CONFIGURATION (CMS)
  // ==========================================
  async fetchSiteConfig(): Promise<Partial<SiteConfig> | null> {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .limit(1);

      if (error) {
        handleSupabaseError('fetchSiteConfig', error);
        return null;
      }
      if (!data || data.length === 0) return null;

      const row = data[0];
      return {
        siteTitle: row.site_title || undefined,
        subTitle: row.sub_title || undefined,
        siteLogoUrl: row.site_logo_url || undefined,
        faviconUrl: row.favicon_url || undefined,
        heroTitle: row.hero_title || undefined,
        heroSubtext: row.hero_subtext || undefined,
        heroBannerUrl: row.hero_banner_url || undefined,
        sambutanKetuaQuote: row.sambutan_ketua_quote || undefined,
        sambutanKetuaText: row.sambutan_ketua_text || undefined,
        visiTitle: row.visi_title || undefined,
        visiText: row.visi_text || undefined,
        misiList: Array.isArray(row.misi_list) ? row.misi_list : undefined,
        address: row.address || undefined,
        phone: row.phone || undefined,
        email: row.email || undefined,
        copyrightText: row.copyright_text || undefined
      };
    } catch (e) {
      console.warn('Supabase fetchSiteConfig exception:', e);
      return null;
    }
  },

  async syncSiteConfig(config: SiteConfig) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati push ke cloud jika tidak login
      if (!config) return;
      const { error } = await supabase.from('site_config').upsert({
        id: 1,
        site_title: config.siteTitle,
        sub_title: config.subTitle || null,
        site_logo_url: config.siteLogoUrl || null,
        favicon_url: config.faviconUrl || null,
        hero_title: config.heroTitle || null,
        hero_subtext: config.heroSubtext || null,
        hero_banner_url: config.heroBannerUrl || null,
        sambutan_ketua_quote: config.sambutanKetuaQuote || null,
        sambutan_ketua_text: config.sambutanKetuaText || null,
        visi_title: config.visiTitle || null,
        visi_text: config.visiText || null,
        misi_list: config.misiList || [],
        address: config.address || null,
        phone: config.phone || null,
        email: config.email || null,
        copyright_text: config.copyrightText || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (error) handleSupabaseError('syncSiteConfig', error);
    } catch (e) {
      console.warn('Sync site config error:', e);
    }
  },

  // ==========================================
  // 5. WARTA & BERITA KEGIATAN (NEWS)
  // ==========================================
  async fetchNews(isLoggedIn?: boolean): Promise<NewsArticle[] | null> {
    try {
      const isAuth = isLoggedIn !== undefined ? isLoggedIn : await hasActiveAuthSession();
      let query = supabase.from('news').select('*');

      // Jika anonim, hanya query artikel yang dipublikasikan (is_published = true)
      if (!isAuth) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError('fetchNews', error);
        return null;
      }
      if (!data) return null;
      if (data.length === 0) return [];

      return data.map((row: any): NewsArticle => ({
        id: row.id,
        title: row.title,
        category: row.category || 'Sosial Budaya',
        author: row.author || 'Humas DWP GTK Malut',
        date: row.date || new Date().toLocaleDateString('id-ID'),
        summary: row.summary || '',
        content: row.content || '',
        mainImage: row.main_image || '',
        isPublished: row.is_published ?? true,
        sourceReportId: row.source_report_id || undefined
      }));
    } catch (e) {
      return null;
    }
  },

  async syncNews(newsList: NewsArticle[]) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati push ke cloud jika tidak login
      if (!newsList || newsList.length === 0) return;
      const rows = newsList.map(n => ({
        id: ensureUUID(n.id),
        title: n.title,
        category: n.category,
        author: n.author,
        date: n.date,
        summary: n.summary,
        content: n.content,
        main_image: n.mainImage || null,
        is_published: n.isPublished ?? true,
        source_report_id: n.sourceReportId || null
      }));

      const { error } = await supabase.from('news').upsert(rows, { onConflict: 'id' });
      if (error && !error.message.includes('not find')) {
        handleSupabaseError('syncNews', error);
      }
    } catch (e) {
      // Ignored if table doesn't exist
    }
  },

  async deleteNews(id: string) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati push ke cloud jika tidak login
      const uuid = ensureUUID(id);
      const { error } = await supabase.from('news').delete().eq('id', uuid);
      if (error) handleSupabaseError('deleteNews', error);
    } catch (e) {
      console.warn('Delete news error:', e);
    }
  },

  // ==========================================
  // 6. ABSENSI DIGITAL (ATTENDANCE)
  // ==========================================
  async fetchAttendance(isLoggedIn?: boolean): Promise<AttendanceRecord[] | null> {
    try {
      const isAuth = isLoggedIn !== undefined ? isLoggedIn : await hasActiveAuthSession();
      if (!isAuth) {
        // Mode Anonim: JANGAN baca tabel absensi privat dari Supabase
        return null;
      }

      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError('fetchAttendance', error);
        return null;
      }
      if (!data) return null;
      if (data.length === 0) return [];

      return data.map((row: any): AttendanceRecord => ({
        id: row.id,
        activityId: row.activity_id,
        memberId: row.member_id || undefined,
        participantName: row.participant_name,
        nip: row.nip || undefined,
        jabatan: row.jabatan || 'Anggota DWP GTK',
        phone: row.phone || '',
        checkInTime: row.check_in_time || '',
        signatureUrl: row.signature_url || '',
        status: (row.status as 'verified' | 'unverified') || 'verified',
        verifiedBy: row.verified_by || undefined,
        notes: row.notes || undefined
      }));
    } catch (e) {
      return null;
    }
  },

  async syncAttendance(records: AttendanceRecord[]) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati push ke cloud jika tidak login
      if (!records || records.length === 0) return;
      const rows = records.map(r => ({
        id: ensureUUID(r.id),
        activity_id: ensureUUID(r.activityId),
        member_id: r.memberId ? ensureUUID(r.memberId) : null,
        participant_name: r.participantName,
        nip: r.nip || null,
        jabatan: r.jabatan || 'Anggota DWP GTK',
        phone: r.phone || '',
        check_in_time: r.checkInTime || new Date().toISOString(),
        signature_url: r.signatureUrl || '',
        status: r.status || 'verified',
        verified_by: r.verifiedBy || null,
        notes: r.notes || null
      }));

      const { error } = await supabase.from('attendance_records').upsert(rows, { onConflict: 'id' });
      if (error && !error.message.includes('not find')) {
        handleSupabaseError('syncAttendance', error);
      }
    } catch (e) {
      // Ignored if table doesn't exist
    }
  },

  // ==========================================
  // 7. DOKUMEN KEGIATAN (ACTIVITY DOCUMENTS)
  // ==========================================
  async fetchActivityDocuments(isLoggedIn?: boolean): Promise<ActivityDocument[] | null> {
    try {
      const isAuth = isLoggedIn !== undefined ? isLoggedIn : await hasActiveAuthSession();
      if (!isAuth) {
        // Mode Anonim: JANGAN baca activity_documents privat dari Supabase
        return null;
      }

      const { data, error } = await supabase
        .from('activity_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError('fetchActivityDocuments', error);
        return null;
      }
      if (!data) return null;
      if (data.length === 0) return [];

      return data.map((row: any): ActivityDocument => ({
        id: row.id,
        proposalId: row.proposal_id,
        documentType: row.document_type as DocumentType,
        customTitle: row.custom_title || undefined,
        assignedToMemberId: row.assigned_to_member_id || undefined,
        assignedToMemberName: row.assigned_to_member_name || undefined,
        status: (row.status as DocumentStatus) || 'draft',
        letterNumber: row.letter_number || undefined,
        contentData: (typeof row.content_data === 'object' && row.content_data !== null) ? row.content_data : {},
        logs: Array.isArray(row.logs) ? row.logs : [],
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Supabase fetchActivityDocuments exception:', e);
      return null;
    }
  },

  async syncActivityDocuments(docs: ActivityDocument[]) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati push jika tidak login
      if (!docs || docs.length === 0) return;

      // Ambil daftar ID proposal yang valid di cloud untuk menjaga integritas foreign key
      const { data: cloudProposals, error: propErr } = await supabase
        .from('activity_proposals')
        .select('id');

      if (propErr) {
        handleSupabaseError('syncActivityDocuments (check proposals)', propErr);
        return;
      }

      const cloudPropIds = new Set((cloudProposals || []).map((p: any) => p.id));

      const rows: any[] = [];
      for (const doc of docs) {
        const proposalUuid = ensureUUID(doc.proposalId);
        if (!cloudPropIds.has(proposalUuid)) {
          console.info(`[syncActivityDocuments] Proposal terkait (${doc.proposalId} -> ${proposalUuid}) belum ada di cloud, dokumen ${doc.id} dilewati.`);
          continue;
        }

        rows.push({
          id: doc.id,
          proposal_id: proposalUuid,
          document_type: doc.documentType,
          custom_title: doc.customTitle || null,
          assigned_to_member_id: doc.assignedToMemberId || null,
          assigned_to_member_name: doc.assignedToMemberName || null,
          status: doc.status || 'draft',
          letter_number: doc.letterNumber || null,
          content_data: doc.contentData || {},
          logs: doc.logs || [],
          created_at: toISOStringSafe(doc.createdAt),
          updated_at: toISOStringSafe(doc.updatedAt)
        });
      }

      if (rows.length === 0) return;

      const { error } = await supabase
        .from('activity_documents')
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        handleSupabaseError('syncActivityDocuments', error);
      }
    } catch (e) {
      console.warn('Sync activity documents error:', e);
    }
  },

  async deleteActivityDocument(id: string) {
    try {
      if (!await hasActiveAuthSession()) return;
      const { error } = await supabase.from('activity_documents').delete().eq('id', id);
      if (error) handleSupabaseError('deleteActivityDocument', error);
    } catch (e) {
      console.warn('Delete activity document error:', e);
    }
  },

  // ==========================================
  // 8. NOTIFIKASI APLIKASI (NOTIFICATIONS)
  // ==========================================
  async fetchNotifications(isLoggedIn?: boolean): Promise<AppNotification[] | null> {
    try {
      const isAuth = isLoggedIn !== undefined ? isLoggedIn : await hasActiveAuthSession();
      if (!isAuth) {
        // Mode Anonim: JANGAN baca tabel notifikasi privat dari Supabase
        return null;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError('fetchNotifications', error);
        return null;
      }
      if (!data) return null;
      if (data.length === 0) return [];

      return data.map((row: any): AppNotification => ({
        id: row.id,
        targetRole: (row.target_role as UserRole | 'all') || 'all',
        title: row.title,
        message: row.message || '',
        timestamp: row.created_at || new Date().toISOString(),
        isRead: false, // isRead tidak di-cloud-kan (baca perangkat lokal); default false untuk baris cloud baru
        type: (row.type as any) || 'new_proposal',
        proposalId: row.proposal_id || undefined,
        nextStepAction: row.next_step_action || undefined,
        targetTab: row.target_tab || undefined,
        actionButtonText: row.action_button_text || undefined
      }));
    } catch (e) {
      console.warn('Supabase fetchNotifications exception:', e);
      return null;
    }
  },

  async syncNotifications(notifications: AppNotification[]) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati jika tidak login
      if (!notifications || notifications.length === 0) return;

      // Filter baris seed demo INITIAL_NOTIFICATIONS (jangan pernah dikirim ke cloud)
      const validNotifs = notifications.filter(
        n => !SEED_NOTIFICATION_IDS.has(n.id) && !n.id.startsWith('seed-')
      );
      if (validNotifs.length === 0) return;

      const rows = validNotifs.map(n => ({
        id: n.id,
        target_role: n.targetRole || 'all',
        title: n.title,
        message: n.message || '',
        type: n.type || 'info',
        proposal_id: n.proposalId || null,
        next_step_action: n.nextStepAction || null,
        target_tab: n.targetTab || null,
        action_button_text: n.actionButtonText || null,
        created_at: toISOStringSafe(n.timestamp),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notifications')
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        handleSupabaseError('syncNotifications', error);
      }
    } catch (e) {
      console.warn('Sync notifications error:', e);
    }
  },

  // ==========================================
  // 9. KOP SURAT RESMI (KOP SURAT CONFIG)
  // ==========================================
  async fetchKopSuratConfig(isLoggedIn?: boolean): Promise<KopSuratConfig | null> {
    try {
      const isAuth = isLoggedIn !== undefined ? isLoggedIn : await hasActiveAuthSession();
      if (!isAuth) {
        // Mode Anonim: JANGAN baca kop_surat_config dari Supabase
        return null;
      }

      const { data, error } = await supabase
        .from('kop_surat_config')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        handleSupabaseError('fetchKopSuratConfig', error);
        return null;
      }
      if (!data || !data.data || typeof data.data !== 'object' || Object.keys(data.data).length === 0) {
        return null;
      }

      return data.data as KopSuratConfig;
    } catch (e) {
      console.warn('Supabase fetchKopSuratConfig exception:', e);
      return null;
    }
  },

  async syncKopSuratConfig(config: KopSuratConfig) {
    try {
      if (!await hasActiveAuthSession()) return; // Lewati jika tidak login
      if (!config) return;

      const { error } = await supabase
        .from('kop_surat_config')
        .upsert({
          id: 1,
          data: config,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) {
        handleSupabaseError('syncKopSuratConfig', error);
      }
    } catch (e) {
      console.warn('Sync kop surat config error:', e);
    }
  },

  // ==========================================
  // 10. INITIAL BULK LOADER
  // ==========================================
  async fetchAllInitialData(isLoggedIn?: boolean) {
    try {
      const isAuth = isLoggedIn !== undefined ? isLoggedIn : await hasActiveAuthSession();
      const [
        membersRes,
        userAccountsRes,
        proposalsRes,
        siteConfigRes,
        newsRes,
        attendanceRes,
        activityDocumentsRes,
        notificationsRes,
        kopSuratConfigRes
      ] = await Promise.allSettled([
        this.fetchMembers(isAuth),
        this.fetchUserAccounts(isAuth),
        this.fetchProposals(isAuth),
        this.fetchSiteConfig(),
        this.fetchNews(isAuth),
        this.fetchAttendance(isAuth),
        this.fetchActivityDocuments(isAuth),
        this.fetchNotifications(isAuth),
        this.fetchKopSuratConfig(isAuth)
      ]);

      return {
        members: membersRes.status === 'fulfilled' ? membersRes.value : null,
        userAccounts: userAccountsRes.status === 'fulfilled' ? userAccountsRes.value : null,
        proposals: proposalsRes.status === 'fulfilled' ? proposalsRes.value : null,
        siteConfig: siteConfigRes.status === 'fulfilled' ? siteConfigRes.value : null,
        news: newsRes.status === 'fulfilled' ? newsRes.value : null,
        attendance: attendanceRes.status === 'fulfilled' ? attendanceRes.value : null,
        activityDocuments: activityDocumentsRes.status === 'fulfilled' ? activityDocumentsRes.value : null,
        notifications: notificationsRes.status === 'fulfilled' ? notificationsRes.value : null,
        kopSuratConfig: kopSuratConfigRes.status === 'fulfilled' ? kopSuratConfigRes.value : null
      };
    } catch (e) {
      console.warn('Fetch all initial data exception:', e);
      return null;
    }
  }
};
