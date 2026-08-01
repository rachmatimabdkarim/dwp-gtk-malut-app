import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Shield, Eye, UserCheck, LogOut, Sparkles, Bell, CheckCheck, X } from 'lucide-react';

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
    openProposalWorkspace
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const roleNotifs = notifications.filter(n => 
    n.targetRole === currentRole || 
    n.targetRole === 'all' || 
    currentRole === 'admin_master'
  );
  const unreadCount = roleNotifs.filter(n => !n.isRead).length;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-sm">
      {/* Brand & Persona badge */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dwp-burgundy to-dwp-darkBurgundy p-1 border border-dwp-gold/50 flex items-center justify-center font-serif font-bold text-dwp-gold text-sm shadow">
          DWP
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-xs md:text-sm text-white">
              Portal Admin & Workflow DWP
            </h2>
            <span className="bg-dwp-gold/20 text-dwp-lightGold text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-dwp-gold/30">
              GTK Malut
            </span>
          </div>
        </div>
      </div>

      {/* Role Switcher & Action Widgets */}
      <div className="flex items-center gap-3">
        
        {/* Notification Bell Dropdown Widget */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all"
            title="Pemberitahuan & Notifikasi Otomatis"
          >
            <Bell className="w-4 h-4 text-dwp-gold" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-xs animate-in fade-in slide-in-from-top-2">
              <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2 font-serif font-bold text-sm">
                  <Bell className="w-4 h-4 text-dwp-gold" />
                  <span>Notifikasi ({unreadCount} Baru)</span>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsAsRead()}
                      className="text-[10px] text-dwp-gold hover:underline font-bold flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" /> Tandai Dibaca
                    </button>
                  )}
                  <button onClick={() => setShowNotifDropdown(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {roleNotifs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-600">Belum ada notifikasi baru.</p>
                    <p className="text-[11px]">Notifikasi otomatis akan muncul saat usulan kegiatan disetujui.</p>
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
                      className={`p-3.5 transition-colors cursor-pointer space-y-1 ${
                        !n.isRead ? 'bg-amber-50/60 border-l-4 border-dwp-burgundy' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                        <span>{n.title}</span>
                        <span className="text-[9px] font-mono text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Widget */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-1.5 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-1 border-r border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-dwp-gold" />
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Role:</span>
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
