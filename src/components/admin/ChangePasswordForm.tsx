import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { 
  Key, 
  Lock, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Loader2,
  Info
} from 'lucide-react';

export const ChangePasswordForm: React.FC = () => {
  const { currentAccount } = useApp();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 1. Validasi sisi klien: semua field wajib diisi
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Semua field wajib diisi.');
      return;
    }

    // 2. Validasi sisi klien: password baru min. 8 karakter
    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }

    // 3. Validasi sisi klien: konfirmasi harus sama
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      // Ambil email dari sesi aktif Supabase atau fallback state auth
      let userEmail = '';
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.email) {
        userEmail = sessionData.session.user.email;
      } else if (currentAccount?.email) {
        userEmail = currentAccount.email;
      } else {
        const localSession = apiService.getAuthSession();
        if (localSession?.user?.email) {
          userEmail = localSession.user.email;
        }
      }

      if (!userEmail) {
        setError('Sesi autentikasi tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }

      // Alur aman: Verifikasi Password Lama via Supabase signInWithPassword
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: oldPassword
      });

      if (signInError) {
        const isNetworkErr = 
          signInError.message?.toLowerCase().includes('failed to fetch') ||
          signInError.message?.toLowerCase().includes('network') ||
          (signInError as any).status === 0;

        if (isNetworkErr) {
          setError('Koneksi ke server gagal. Periksa koneksi internet Anda.');
        } else {
          setError('Password lama salah.');
        }
        setLoading(false);
        return;
      }

      // Setelah terverifikasi, perbarui password pengguna via Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        const msg = updateError.message || '';
        if (msg.toLowerCase().includes('same_password') || msg.toLowerCase().includes('different from')) {
          setError('Password baru tidak boleh sama dengan password saat ini.');
        } else if (msg.toLowerCase().includes('at least 6') || msg.toLowerCase().includes('at least 8')) {
          setError('Password baru minimal harus 8 karakter.');
        } else if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many requests')) {
          setError('Terlalu banyak permintaan perubahan. Silakan coba lagi beberapa saat kemudian.');
        } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
          setError('Koneksi ke server gagal saat menyimpan password. Silakan coba lagi.');
        } else {
          setError(`Gagal memperbarui password: ${msg}`);
        }
        setLoading(false);
        return;
      }

      // Berhasil: Tampilkan notifikasi sukses, kosongkan form
      setSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setTimeout(() => {
        setSuccess(false);
      }, 7000);
    } catch (err: any) {
      console.error('Change password error:', err);
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('failed to fetch') || msg.includes('network')) {
        setError('Koneksi ke server gagal. Periksa koneksi internet Anda.');
      } else {
        setError('Terjadi kendala saat mengubah password. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-dwp-burgundy" />
          <h3 className="font-serif font-bold text-slate-900 text-lg">
            Keamanan Akun & Ganti Password
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-dwp-burgundy bg-dwp-burgundy/10 px-2.5 py-1 rounded-full border border-dwp-burgundy/20">
          Supabase Auth
        </span>
      </div>

      {error && (
        <div className="bg-rose-100 text-rose-900 border border-rose-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-medium space-y-1 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Password akun Anda berhasil diperbarui!</span>
          </div>
          <p className="text-emerald-700 pl-6">
            Gunakan password baru untuk login berikutnya. Sesi login Anda saat ini tetap aktif.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Password Lama */}
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Password Lama <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type={showOldPassword ? 'text' : 'password'}
              required
              disabled={loading}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Masukkan password saat ini..."
              className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-dwp-burgundy focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Baru & Konfirmasi */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Password Baru <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                disabled={loading}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-dwp-burgundy focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Minimal 8 karakter</p>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Konfirmasi Password Baru <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru..."
                className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-dwp-burgundy focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Petunjuk info kecil */}
        <div className="flex items-start gap-2 text-slate-500 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Gunakan minimal 8 karakter. Password baru akan digunakan pada sesi login berikutnya.
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-dwp-gold font-bold px-5 py-2.5 rounded-xl shadow flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-dwp-gold" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Key className="w-4 h-4 text-dwp-gold" />
                <span>Update Password Akun</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
