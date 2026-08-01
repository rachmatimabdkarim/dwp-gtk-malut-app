import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Shield, Eye, UserCheck, LogOut, Sparkles, Bell, CheckCheck, X, Trash2 } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    activePersona, 
    setActiveTab, 
    setAdminSubTab, 
    logout,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearReadNotifications,
    openProposalWorkspace
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const roleNotifs = notifications.filter(n => 
    n.targetRole === currentRole || n.targetRole === 'all'
  );
  const unreadCount = roleNotifs.filter(n => !n.isRead).length;
  const hasReadNotifs = roleNotifs.some(n => n.isRead);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left Side: Brand & Role Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-dwp-burgundy border border-dwp-gold flex items-center justify-center text-dwp-gold shadow-sm font-bold text-sm shrink-0">
            DWP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-sm sm:text-base text-white leading-tight">
                Dharma Wanita Persatuan
              </h1>
              <span className="bg-dwp-gold text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full hidden md:inline-block">
                GTK Malut
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Sistem Informasi Manajemen Terpadu
            </p>
          </div>
        </div>

        {/* Right Side: Role Selector & Controls */}
        <div className="flex items-center gap-3">
          
          {/* Notification Bell Widget */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Notifikasi Sistem"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border-2 border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm">
                    <Bell className="w-4 h-4 text-dwp-gold" />
                    <span>Notifikasi ({unreadCount} Baru)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[10px] text-dwp-gold hover:underline font-bold flex items-center gap-1"
                        title="Tandai semua notifikasi telah dibaca"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Tandai Dibaca
                      </button>
                    )}
                    {hasReadNotifs && (
                      <button
                        onClick={() => clearReadNotifications()}
                        className="text-[10px] text-rose-300 hover:text-white font-bold flex items-center gap-1 bg-rose-950/50 hover:bg-rose-900/80 px-2 py-0.5 rounded-lg border border-rose-700/50 transition-all"
                        title="Bersihkan semua notifikasi yang sudah dibaca"
                      >
                        <Trash2 className="w-3 h-3 text-rose-300" />
                        <span>Bersihkan Terbaca</span>
                      </button>
                    )}
                    <button onClick={() => setShowNotifDropdown(false)} className="text-slate-400 hover:text-white p-0.5">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {roleNotifs.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 space-y-1">
                      <p className="font-semibold text-slate-600">Belum ada notifikasi.</p>
                      <p className="text-[11px]">Notifikasi otomatis akan muncul saat ada pengajuan atau verifikasi.</p>
                    </div>
                  ) : (
                    roleNotifs.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          setShowNotifDropdown(false);

                          if (n.proposalId) {
                            let targetTab: 'usulan' | 'panitia' | 'sk' | 'absensi' | 'lpj' = 'usulan';
                            if (n.title.toLowerCase().includes('panitia')) {
                              targetTab = 'panitia';
                            } else if (n.type === 'sk_pengarsipan' || n.title.toLowerCase().includes('sk')) {
                              targetTab = 'sk';
                            }
                            openProposalWorkspace(n.proposalId, targetTab);
                          } else {
                            setAdminSubTab('proposals');
                          }
                        }}
                        className={`p-3.5 transition-all cursor-pointer space-y-1.5 border-l-4 ${
                          !n.isRead 
                            ? 'bg-amber-100/90 border-dwp-burgundy hover:bg-amber-100 shadow-sm' 
                            : 'bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-100 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs gap-2">
                          <span className={!n.isRead ? 'text-slate-950 font-extrabold' : 'text-slate-600 font-semibold'}>
                            {n.title}
                          </span>
                          {!n.isRead ? (
                            <span className="bg-dwp-burgundy text-dwp-gold text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-sm animate-pulse">
                              🔴 BARU
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-semibold bg-slate-200/70 px-1.5 py-0.5 rounded shrink-0">
                              ✓ Dibaca
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] leading-relaxed ${!n.isRead ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                          {n.message}
                        </p>
                        <div className="text-[9px] font-mono text-slate-400 text-right">
                          {n.timestamp}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-slate-900 text-dwp-lightGold border border-dwp-gold/40 text-[11px] font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-dwp-gold cursor-pointer"
            >
              <option value="admin_master">⚡ Super Admin IT (Non-Anggota)</option>
              <option value="admin_bidang">🎓 Ketua Bidang (Pengusul Kegiatan)</option>
              <option value="sekretaris">📜 Sekretaris DWP (Pengusul & Administrasi)</option>
              <option value="bendahara">💰 Bendahara DWP (Keuangan & RAB)</option>
              <option value="wakil_ketua">🛡️ Wakil Ketua DWP (Verifikator Usulan)</option>
              <option value="ketua">👑 Ketua DWP (Persetujuan Akhir)</option>
              <option value="anggota">👤 Anggota DWP (Anggota Biasa)</option>
            </select>
          </div>
        </div>

        {/* Current Active Persona Info */}
        <div 
          onClick={() => setAdminSubTab('profile')}
          className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer hover:opacity-80 transition-opacity"
          title="Klik untuk Pengaturan Profil Saya & Ganti Password"
        >
          <img 
            src={activePersona.avatar} 
            alt={activePersona.name} 
            className="w-7 h-7 rounded-full object-cover border border-dwp-gold"
          />
          <div className="text-[11px]">
            <div className="font-bold text-white leading-tight flex items-center gap-1">
              <span>{activePersona.name}</span>
              <span className="text-[9px] bg-dwp-gold/20 text-dwp-gold px-1 rounded">Profil</span>
            </div>
            <div className="text-[10px] text-dwp-gold font-medium">{activePersona.title}</div>
          </div>
        </div>

        {/* Back to Public Web Button */}
        <button
          onClick={() => setActiveTab('public')}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
          title="Lihat Web Tampilan Publik"
        >
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Web Publik</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin keluar (logout) dari Portal Admin?')) {
              logout();
            }
          }}
          className="flex items-center gap-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
          title="Keluar Sesi Login"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
