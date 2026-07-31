import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  AlertCircle,
  Building2,
  KeyRound
} from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, userAccounts, siteConfig } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setErrorMsg('Username atau Password yang Anda masukkan tidak cocok.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal melakukan otentikasi login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Login Handler
  const handleQuickLogin = (userAccount: typeof userAccounts[0]) => {
    setUsername(userAccount.username);
    setPassword('dwp123');
    login(userAccount.username, 'dwp123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dwp-burgundy via-dwp-darkBurgundy to-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Patterns */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-dwp-gold/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-gradient-to-br from-dwp-gold to-amber-500 rounded-3xl p-0.5 shadow-2xl mx-auto flex items-center justify-center transform hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center overflow-hidden">
              <img 
                src={siteConfig.siteLogoUrl || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&auto=format&fit=crop&q=80'} 
                alt="Logo DWP" 
                className="w-14 h-14 object-contain" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-dwp-gold/20 text-dwp-lightGold text-[11px] font-bold px-3 py-1 rounded-full border border-dwp-gold/30">
              <Sparkles className="w-3.5 h-3.5 text-dwp-gold" />
              <span>Portal Autentikasi Keamanan System</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-wide">
              DWP GTK Maluku Utara
            </h1>
            <p className="text-slate-300 text-xs max-w-xs mx-auto">
              Silakan login untuk mengakses Portal Pengelolaan Organisasi & Dashboard Hak Akses.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 space-y-6">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username / Email Akses *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan Username atau Email..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-dwp-burgundy focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password Akun *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan Password..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-dwp-burgundy focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-dwp-burgundy to-dwp-darkBurgundy hover:brightness-110 text-white font-bold py-3.5 rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memverifikasi Autentikasi...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-dwp-gold" />
                  <span>Masuk Ke Portal Admin</span>
                  <ArrowRight className="w-4 h-4 text-dwp-gold" />
                </>
              )}
            </button>
          </form>

          {/* Quick Persona Demo Account Selector */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center">
              Pilih Akun Demo Login Berdasarkan Role:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {userAccounts.slice(0, 6).map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  className="p-2.5 bg-slate-50 hover:bg-dwp-burgundy hover:text-white border border-slate-200 rounded-xl text-left transition-all group"
                >
                  <div className="font-bold text-[11px] truncate group-hover:text-dwp-gold">
                    {acc.username}
                  </div>
                  <div className="text-[9px] text-slate-500 group-hover:text-slate-200 capitalize truncate">
                    {acc.role.replace('_', ' ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-slate-400">
          © 2026 Dharma Wanita Persatuan GTK Provinsi Maluku Utara. Security Secured.
        </p>
      </div>
    </div>
  );
};
