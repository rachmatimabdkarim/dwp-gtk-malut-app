import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getRoleDisplayName } from '../../utils/RoleAccessControl';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Search, 
  ExternalLink,
  Inbox,
  ArrowRight
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { 
    currentRole, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearReadNotifications,
    openProposalWorkspace,
    setAdminSubTab
  } = useApp();

  const [filterState, setFilterState] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter notifications for current role or 'all'
  const roleNotifs = notifications.filter(n => 
    n.targetRole === currentRole || n.targetRole === 'all'
  );

  const unreadNotifs = roleNotifs.filter(n => !n.isRead);
  const readNotifs = roleNotifs.filter(n => n.isRead);

  // Apply sub-filter
  const filteredNotifs = roleNotifs.filter(n => {
    if (filterState === 'unread' && n.isRead) return false;
    if (filterState === 'read' && !n.isRead) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }
    return true;
  });

  const handleNotificationClick = (n: typeof roleNotifs[0]) => {
    markNotificationAsRead(n.id);
    if (n.proposalId) {
      openProposalWorkspace(n.proposalId, n.targetTab || 'usulan');
    } else {
      setAdminSubTab('proposals');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-900 via-dwp-burgundy to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-dwp-gold/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-dwp-gold" />
            <h2 className="font-serif font-bold text-xl md:text-2xl text-dwp-gold">
              Pusat Notifikasi & Instruksi Alur Kerja
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Pantau seluruh pemberitahuan pengajuan, verifikasi, surat keputusan, pencairan dana, dan pengumpulan LPJ lengkap dengan <strong>Petunjuk Langkah Selanjutnya & Tombol Navigasi Langsung</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {unreadNotifs.length > 0 && (
            <button
              onClick={() => markAllNotificationsAsRead()}
              className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white border border-dwp-gold/40 px-3.5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
              title="Tandai semua notifikasi telah dibaca"
            >
              <CheckCheck className="w-4 h-4 text-dwp-gold" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}

          {readNotifs.length > 0 && (
            <button
              onClick={() => clearReadNotifications()}
              className="bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700/60 px-3.5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
              title="Hapus semua pemberitahuan yang sudah dibaca"
            >
              <Trash2 className="w-4 h-4 text-rose-300" />
              <span>Bersihkan Terbaca</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-bold">
          <button
            onClick={() => setFilterState('all')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              filterState === 'all' 
                ? 'bg-slate-900 text-white shadow' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Semua Notifikasi</span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded-full">{roleNotifs.length}</span>
          </button>

          <button
            onClick={() => setFilterState('unread')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              filterState === 'unread' 
                ? 'bg-dwp-burgundy text-dwp-gold shadow' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Belum Dibaca</span>
            {unreadNotifs.length > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">{unreadNotifs.length}</span>
            )}
          </button>

          <button
            onClick={() => setFilterState('read')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              filterState === 'read' 
                ? 'bg-slate-900 text-white shadow' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Sudah Dibaca</span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded-full">{readNotifs.length}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari notifikasi kegiatan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-dwp-burgundy focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Notification List Container */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-base">Tidak Ada Notifikasi</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {searchQuery 
                  ? `Tidak ada notifikasi yang cocok dengan kata kunci "${searchQuery}".`
                  : filterState === 'unread'
                  ? 'Semua notifikasi penting untuk role Anda sudah dibaca.'
                  : 'Belum ada notifikasi baru untuk role Anda saat ini.'}
              </p>
            </div>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm space-y-3 border-l-4 ${
                !n.isRead 
                  ? 'bg-amber-50/90 border-dwp-burgundy border-t-amber-200 border-r-amber-200 border-b-amber-200 hover:bg-amber-100/90 hover:shadow-md' 
                  : 'bg-white border-slate-200 text-slate-600 opacity-75 hover:opacity-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={!n.isRead ? 'text-slate-950 font-black text-sm' : 'text-slate-700 font-bold text-sm'}>
                    {n.title}
                  </span>

                  {!n.isRead ? (
                    <span className="bg-dwp-burgundy text-dwp-gold font-extrabold text-[9px] px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
                      🔴 BELUM DIBACA
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                      ✓ Telah Dibaca
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 font-mono font-medium shrink-0">
                  {n.timestamp}
                </span>
              </div>

              <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                {n.message}
              </p>

              {/* Next Step Instruction Highlight Box */}
              {n.nextStepAction && (
                <div className="bg-amber-100/90 border border-amber-300 text-amber-950 p-3 rounded-xl text-xs font-bold shadow-sm leading-snug">
                  {n.nextStepAction}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-dwp-gold" />
                  <span>{n.actionButtonText || 'Buka Tindak Lanjut ➔'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
