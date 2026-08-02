import { UserAccount, Member, ActivityProposal, UserRole } from '../types';

// API Service Layer (Mock & Production Cloud DB Adapter Interface)
// Ready to connect to Supabase PostgreSQL: import { createClient } from '@supabase/supabase-js'

export const apiService = {
  // Authentication
  async authenticateUser(usernameInput: string, passwordInput: string): Promise<UserAccount | null> {
    const saved = localStorage.getItem('dwp_user_accounts');
    const users: UserAccount[] = saved ? JSON.parse(saved) : [];
    
    // Find matching user (case-insensitive username or email check)
    const user = users.find(
      u => (u.username.toLowerCase() === usernameInput.trim().toLowerCase() || u.email.toLowerCase() === usernameInput.trim().toLowerCase())
    );

    if (!user) return null;
    if (user.status !== 'aktif') throw new Error('Akun Anda dalam status Non-Aktif. Hubungi Superadmin IT.');

    // Password verification logic
    const defaultPassword = (user.username === 'admin' || user.role === 'admin_master') ? 'admin123' : 'dwp2026!';
    const validPassword = user.password || defaultPassword;

    if (passwordInput !== validPassword) {
      return null;
    }

    return user;
  },

  // Save Session Token securely
  setAuthSession(user: UserAccount) {
    const sessionData = {
      user,
      token: `jwt-${Date.now()}-${user.id}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 Hours Session Expiry
    };
    localStorage.setItem('dwp_auth_session', JSON.stringify(sessionData));
  },

  getAuthSession(): { user: UserAccount; token: string } | null {
    const saved = localStorage.getItem('dwp_auth_session');
    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved);
      if (parsed.expiresAt < Date.now()) {
        this.clearAuthSession();
        return null;
      }
      return parsed;
    } catch {
      this.clearAuthSession();
      return null;
    }
  },

  clearAuthSession() {
    localStorage.removeItem('dwp_auth_session');
  }
};
