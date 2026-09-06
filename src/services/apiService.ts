import { UserAccount, UserRole } from '../types';
import { supabase } from '../lib/supabase';

// Seed data akun pengguna lokal untuk fallback offline & pemetaan role
export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: '09d3f668-c647-4156-97de-ab059e1f9800',
    username: 'admin',
    password: 'admin123',
    email: 'admin.it@malut.go.id',
    role: 'admin_master',
    memberId: undefined, // User Non-Anggota (Superadmin IT Support)
    status: 'aktif',
    createdAt: '2026-01-01'
  },
  {
    id: '12b747b5-07f3-41e6-a59f-edfd54b84402',
    username: 'ketua',
    password: 'dwp2026!',
    email: 'rahmiati.dwpgtk@malut.go.id',
    role: 'ketua',
    memberId: '11111111-1111-1111-1111-111111111111', // Linked ke Ketua DWP
    status: 'aktif',
    createdAt: '2026-01-05'
  },
  {
    id: '1ebffcb5-1da3-4878-9f3e-01edc0c87423',
    username: 'waket',
    password: 'dwp2026!',
    email: 'endang.dwp@malut.go.id',
    role: 'wakil_ketua',
    memberId: '22222222-2222-2222-2222-222222222222', // Linked ke Wakil Ketua
    status: 'aktif',
    createdAt: '2026-01-10'
  },
  {
    id: '7f7046c1-1389-4c38-a036-4bf640cb1537',
    username: 'sekretaris',
    password: 'dwp2026!',
    email: 'fitriani.sekretaris@malut.go.id',
    role: 'sekretaris',
    memberId: '33333333-3333-3333-3333-333333333333', // Linked ke Sekretaris
    status: 'aktif',
    createdAt: '2026-01-12'
  },
  {
    id: '9097a2f5-1584-4570-844a-fd8ed68ee814',
    username: 'bendahara',
    password: 'dwp2026!',
    email: 'hasnah.bendahara@malut.go.id',
    role: 'bendahara',
    memberId: '44444444-4444-4444-4444-444444444444', // Linked ke Bendahara
    status: 'aktif',
    createdAt: '2026-01-14'
  },
  {
    id: '879a9725-f247-4378-a6e8-e0648196105c',
    username: 'kabid_pendidikan',
    password: 'dwp2026!',
    email: 'siti.aminah@malut.go.id',
    role: 'admin_bidang',
    memberId: '55555555-5555-5555-5555-555555555555', // Linked ke Ketua Bidang Pendidikan
    status: 'aktif',
    createdAt: '2026-01-15'
  },
  {
    id: '23a9b8c7-d6e5-4f3a-2b1c-0d9e8f7a6b5c',
    username: 'kabid_ekonomi',
    password: 'dwp2026!',
    email: 'fatimah.ekonomi@malut.go.id',
    role: 'admin_bidang',
    memberId: '66666666-6666-6666-6666-666666666666', // Linked ke Ketua Bidang Ekonomi
    status: 'aktif',
    createdAt: '2026-01-16'
  },
  {
    id: '34b0c9d8-e7f6-5a4b-3c2d-1e0f9a8b7c6d',
    username: 'kabid_sosbud',
    password: 'dwp2026!',
    email: 'hawa.sosbud@malut.go.id',
    role: 'admin_bidang',
    memberId: '77777777-7777-7777-7777-777777777777', // Linked ke Ketua Bidang Sosbud
    status: 'aktif',
    createdAt: '2026-01-17'
  },
  {
    id: '45c1dae9-f8a7-6b5c-4d3e-2f1a0b9c8d7e',
    username: 'anggota',
    password: 'dwp2026!',
    email: 'halimah.anggota@malut.go.id',
    role: 'anggota',
    memberId: '88888888-8888-8888-8888-888888888888', // Linked ke Anggota DWP
    status: 'aktif',
    createdAt: '2026-01-18'
  }
];

export interface DwpAuthSessionUser {
  id: string;
  email: string;
  app_metadata?: {
    dwp_role?: UserRole;
    member_id?: string;
    [key: string]: any;
  };
  user_metadata?: {
    username?: string;
    [key: string]: any;
  };
  demo?: boolean;
}

export interface DwpAuthSession {
  access_token: string;
  refresh_token: string;
  user: DwpAuthSessionUser;
  expires_at?: number;
}

export const apiService = {
  /**
   * Autentikasi Supabase Auth asli (email + password).
   * Mendukung input username ATAU email.
   */
  async login(emailOrUsername: string, passwordInput: string): Promise<DwpAuthSession> {
    const cleanInput = emailOrUsername.trim();
    let targetEmail = cleanInput;

    // Jika input tidak mengandung '@', cari email akun di user_accounts LOKAL
    if (!cleanInput.includes('@')) {
      const saved = localStorage.getItem('dwp_user_accounts');
      const localUsers: UserAccount[] = saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS;
      const found = localUsers.find(
        u => u.username.toLowerCase() === cleanInput.toLowerCase()
      );
      if (found && found.email) {
        targetEmail = found.email;
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: passwordInput
      });

      if (error) {
        // Cek jika error terjadi akibat gangguan koneksi/offline (Supabase unreachable)
        const isNetworkErr = 
          error.message?.toLowerCase().includes('failed to fetch') ||
          error.message?.toLowerCase().includes('network') ||
          (error as any).status === 0;

        if (isNetworkErr) {
          // DEMO OFFLINE: fallback jika Supabase tidak terjangkau
          return this.loginDemoOffline(cleanInput, passwordInput);
        }

        // Error autentikasi Supabase asli (misal: Invalid login credentials)
        throw error;
      }

      if (!data.session || !data.user) {
        throw new Error('Sesi autentikasi tidak ditemukan dari respons Supabase.');
      }

      const authSession: DwpAuthSession = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          app_metadata: data.user.app_metadata || {},
          user_metadata: data.user.user_metadata || {},
          demo: false
        },
        expires_at: data.session.expires_at
      };

      this.setAuthSession(authSession);
      return authSession;
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('offline') || msg.includes('load failed')) {
        // DEMO OFFLINE: fallback jika server tidak dapat dijangkau
        return this.loginDemoOffline(cleanInput, passwordInput);
      }
      throw err;
    }
  },

  // DEMO OFFLINE: fallback saat Supabase unreachable tanpa backdoor universal
  loginDemoOffline(cleanInput: string, passwordInput: string): DwpAuthSession {
    const saved = localStorage.getItem('dwp_user_accounts');
    const localUsers: UserAccount[] = saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS;

    const user = localUsers.find(
      u => u.username.toLowerCase() === cleanInput.toLowerCase() || 
           (u.email && u.email.toLowerCase() === cleanInput.toLowerCase())
    );

    if (!user) {
      throw new Error('Akun pengguna tidak ditemukan.');
    }

    if (user.status !== 'aktif') {
      throw new Error('Akun Anda dalam status Non-Aktif. Hubungi Superadmin IT.');
    }

    // Pencocokan password TERSIMPAN persis (tanpa backdoor universal 'admin123'/'dwp2026!')
    if (!user.password || user.password !== passwordInput) {
      throw new Error('Username / Email atau Password yang Anda masukkan tidak cocok.');
    }

    // DEMO OFFLINE
    const demoSession: DwpAuthSession = {
      access_token: `demo-offline-${Date.now()}-${user.id}`,
      refresh_token: `demo-offline-refresh-${Date.now()}-${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        app_metadata: {
          dwp_role: user.role,
          member_id: user.memberId
        },
        user_metadata: {
          username: user.username
        },
        demo: true
      },
      expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60
    };

    this.setAuthSession(demoSession);
    return demoSession;
  },

  // Simpan sesi autentikasi Supabase di localStorage dwp_auth_session
  setAuthSession(session: any) {
    if (!session) return;
    const sessionData: DwpAuthSession = {
      access_token: session.access_token || '',
      refresh_token: session.refresh_token || '',
      user: {
        id: session.user?.id || 'auth-user',
        email: session.user?.email || '',
        app_metadata: {
          dwp_role: session.user?.app_metadata?.dwp_role,
          member_id: session.user?.app_metadata?.member_id,
          ...session.user?.app_metadata
        },
        user_metadata: session.user?.user_metadata || {},
        demo: !!(session.user?.demo ?? session.demo)
      },
      expires_at: session.expires_at || Math.floor(Date.now() / 1000) + 24 * 60 * 60
    };
    localStorage.setItem('dwp_auth_session', JSON.stringify(sessionData));
  },

  // Baca sesi autentikasi Supabase dari localStorage dwp_auth_session
  getAuthSession(): DwpAuthSession | null {
    const saved = localStorage.getItem('dwp_auth_session');
    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved);
      if (!parsed || (!parsed.access_token && !parsed.user)) {
        return null;
      }
      return parsed;
    } catch {
      this.clearAuthSession();
      return null;
    }
  },

  // Hapus sesi autentikasi Supabase
  clearAuthSession() {
    localStorage.removeItem('dwp_auth_session');
  }
};
