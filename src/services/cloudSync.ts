import { supabase } from '../lib/supabase';
import { 
  Member, 
  UserAccount, 
  ActivityProposal, 
  SiteConfig, 
  NewsArticle, 
  AttendanceRecord,
  UserRole,
  ProposalStage
} from '../types';
import { toISODateSafe, toISOStringSafe } from '../utils/dateFormatter';

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

export const cloudSync = {
  // ==========================================
  // 1. DATA ANGGOTA / MEMBERS
  // ==========================================
  async fetchMembers(): Promise<Member[] | null> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.warn('Supabase fetchMembers error:', error.message);
        return null;
      }
      if (!data || data.length === 0) return null;

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
      if (!members || members.length === 0) return;
      const rows = members.map(m => ({
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
      if (error) console.warn('Supabase syncMembers error:', error.message);
    } catch (e) {
      console.warn('Sync members error:', e);
    }
  },

  async deleteMember(id: string) {
    try {
      const uuid = ensureUUID(id);
      await supabase.from('members').delete().eq('id', uuid);
    } catch (e) {
      console.warn('Delete member error:', e);
    }
  },

  // ==========================================
  // 2. DATA AKUN / USER ACCOUNTS
  // ==========================================
  async fetchUserAccounts(): Promise<UserAccount[] | null> {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Supabase fetchUserAccounts error:', error.message);
        return null;
      }
      if (!data || data.length === 0) return null;

      return data.map((row: any): UserAccount => ({
        id: row.id,
        username: row.username,
        email: row.email,
        password: row.password_hash || (row.role === 'admin_master' ? 'admin123' : 'dwp2026!'),
        role: row.role as UserRole,
        memberId: row.member_id || undefined,
        status: row.status === 'non-aktif' ? 'non-aktif' : 'aktif',
        createdAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      }));
    } catch (e) {
      console.warn('Supabase fetchUserAccounts exception:', e);
      return null;
    }
  },

  async syncUserAccounts(users: UserAccount[]) {
    try {
      if (!users || users.length === 0) return;
      const rows = users.map(u => ({
        id: ensureUUID(u.id),
        username: u.username,
        email: u.email,
        password_hash: u.password || 'admin123',
        role: u.role,
        member_id: u.memberId ? ensureUUID(u.memberId) : null,
        status: u.status || 'aktif',
        created_at: toISOStringSafe(u.createdAt)
      }));

      const { error } = await supabase.from('user_accounts').upsert(rows, { onConflict: 'id' });
      if (error) console.warn('Supabase syncUserAccounts error:', error.message);
    } catch (e) {
      console.warn('Sync user accounts error:', e);
    }
  },

  async deleteUserAccount(id: string) {
    try {
      const uuid = ensureUUID(id);
      await supabase.from('user_accounts').delete().eq('id', uuid);
    } catch (e) {
      console.warn('Delete user account error:', e);
    }
  },

  // ==========================================
  // 3. PROPOSAL KEGIATAN & LOG APPROVAL
  // ==========================================
  async fetchProposals(): Promise<ActivityProposal[] | null> {
    try {
      const { data, error } = await supabase
        .from('activity_proposals')
        .select('*, approval_logs(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetchProposals error:', error.message);
        return null;
      }
      if (!data || data.length === 0) return null;

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
          created_at: toISOStringSafe(p.createdAt)
        }, { onConflict: 'id' });

        if (pErr) {
          console.warn('Upsert proposal error:', pErr.message);
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
          if (lErr) console.warn('Upsert approval logs error:', lErr.message);
        }
      }
    } catch (e) {
      console.warn('Sync proposals error:', e);
    }
  },

  async deleteProposal(id: string) {
    try {
      const propId = ensureUUID(id);
      await supabase.from('approval_logs').delete().eq('proposal_id', propId);
      await supabase.from('activity_proposals').delete().eq('id', propId);
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
        console.warn('Supabase fetchSiteConfig error:', error.message);
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

      if (error) console.warn('Supabase syncSiteConfig error:', error.message);
    } catch (e) {
      console.warn('Sync site config error:', e);
    }
  },

  // ==========================================
  // 5. WARTA & BERITA KEGIATAN (NEWS)
  // ==========================================
  async fetchNews(): Promise<NewsArticle[] | null> {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Table might not be created in Supabase yet
        return null;
      }
      if (!data || data.length === 0) return null;

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
        console.warn('Supabase syncNews error:', error.message);
      }
    } catch (e) {
      // Ignored if table doesn't exist
    }
  },

  async deleteNews(id: string) {
    try {
      const uuid = ensureUUID(id);
      await supabase.from('news').delete().eq('id', uuid);
    } catch (e) {
      console.warn('Delete news error:', e);
    }
  },

  // ==========================================
  // 6. ABSENSI DIGITAL (ATTENDANCE)
  // ==========================================
  async fetchAttendance(): Promise<AttendanceRecord[] | null> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Table might not be created in Supabase yet
        return null;
      }
      if (!data || data.length === 0) return null;

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
        console.warn('Supabase syncAttendance error:', error.message);
      }
    } catch (e) {
      // Ignored if table doesn't exist
    }
  },

  // ==========================================
  // 7. INITIAL BULK LOADER
  // ==========================================
  async fetchAllInitialData() {
    try {
      const [
        membersRes,
        userAccountsRes,
        proposalsRes,
        siteConfigRes,
        newsRes,
        attendanceRes
      ] = await Promise.allSettled([
        this.fetchMembers(),
        this.fetchUserAccounts(),
        this.fetchProposals(),
        this.fetchSiteConfig(),
        this.fetchNews(),
        this.fetchAttendance()
      ]);

      return {
        members: membersRes.status === 'fulfilled' ? membersRes.value : null,
        userAccounts: userAccountsRes.status === 'fulfilled' ? userAccountsRes.value : null,
        proposals: proposalsRes.status === 'fulfilled' ? proposalsRes.value : null,
        siteConfig: siteConfigRes.status === 'fulfilled' ? siteConfigRes.value : null,
        news: newsRes.status === 'fulfilled' ? newsRes.value : null,
        attendance: attendanceRes.status === 'fulfilled' ? attendanceRes.value : null
      };
    } catch (e) {
      console.warn('Fetch all initial data exception:', e);
      return null;
    }
  }
};
