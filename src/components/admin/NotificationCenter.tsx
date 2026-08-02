import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getRoleDisplayName } from '../../utils/RoleAccessControl';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Search, 
  ExternalLink,
  Inbox
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
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-dwp-burgundy via-slate-900 to-dwp-burgundy p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-dwp-gold/20 rounded-xl border border-dwp-gold/40 text-dwp-gold">
              <Bell className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-dwp-gold">
              Pusat Notifikasi & Pemberitahuan Sistem
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Akses Khusus Role: <strong className="text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/20">{getRoleDisplayName(currentRole)}</strong> — Pemberitahuan verifikasi kegiatan, persetujuan panitia, dan penerbitan SK.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {unreadNotifs.length > 0 && (
            <button
              onClick={() => markAllNotificationsAsRead()}
              className="bg-dwp-gold hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}

          {readNotifs.length > 0 && (
            <button
              onClick={() => clearReadNotifications()}
              className="bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700/60 px-3.5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
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
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
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
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
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
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              filterState === 'read' 
                ? 'bg-slate-700 text-white shadow' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Telah Dibaca</span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded-full">{readNotifs.length}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kata kunci notifikasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-dwp-burgundy transition-all"
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
              className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 ${
                !n.isRead 
                  ? 'bg-amber-100/90 border-dwp-burgundy border-t-amber-300 border-r-amber-300 border-b-amber-300 hover:bg-amber-100 hover:shadow-md' 
                  : 'bg-white border-slate-200 text-slate-600 opacity-75 hover:opacity-100 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-1">
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

                <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                  {n.message}
                </p>
              </div>

              <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-mono font-medium">
                  {n.timestamp}
                </span>

                <span className="text-[11px] font-bold text-dwp-burgundy hover:underline flex items-center gap-1">
                  <span>Buka Tindak Lanjut</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
