import React from 'react';
import { useApp } from '../../context/AppContext';
import { hasTabAccess, getRoleDisplayName } from '../../utils/RoleAccessControl';
import { formatDateRangeDDMMYYYY } from '../../utils/dateFormatter';
import { 
  Users, 
  UserCheck, 
  Globe, 
  ArrowRight, 
  Sparkles, 
  Lock,
  CheckSquare,
  Calendar,
  BellRing,
  Trash2
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { 
    currentRole,
    activePersona, 
    members, 
    userAccounts,
    proposals,
    setAdminSubTab,
    notifications,
    markNotificationAsRead,
    clearReadNotifications,
    openProposalWorkspace
  } = useApp();

  const roleNotifs = notifications.filter(n => 
    (n.targetRole === currentRole || n.targetRole === 'all')
  );
  const unreadNotifs = roleNotifs.filter(n => !n.isRead);
  const hasReadNotifs = roleNotifs.some(n => n.isRead);

  const canAccessMembers = hasTabAccess(currentRole, 'members');
  const canAccessUsers = hasTabAccess(currentRole, 'users');
  const canAccessCMS = hasTabAccess(currentRole, 'cms');
  const canAccessProposals = hasTabAccess(currentRole, 'proposals');

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">Disetujui</span>;
      case 'rejected':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-300">Ditolak</span>;
      case 'revision_requested':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">Revisi</span>;
      default:
        return <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-sky-300">Proses Verifikasi</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Widget / Banner */}
      <div className="bg-gradient-to-r from-dwp-burgundy via-slate-900 to-dwp-burgundy p-6 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-dwp-gold">
              Selamat Datang, {activePersona.name}
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Role Aktif: <strong className="text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/20">{getRoleDisplayName(currentRole)}</strong> — Sistem Informasi Manajemen Terpadu Dharma Wanita Persatuan GTK Maluku Utara.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <button 
            onClick={() => setAdminSubTab('proposals')}
            className="bg-dwp-gold hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Manajemen Usulan Kegiatan</span>
          </button>
        </div>
      </div>

      {/* NOTIFIKASI KHUSUS ROLE AKTIFF */}
      {roleNotifs.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-white to-amber-500/10 p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <BellRing className="w-4 h-4 text-dwp-burgundy" />
              <span>Notifikasi Aksi Role: {getRoleDisplayName(currentRole)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-dwp-burgundy text-dwp-gold font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                {unreadNotifs.length} Belum Dibaca
              </span>
              {hasReadNotifs && (
                <button
                  onClick={() => clearReadNotifications()}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 transition-colors"
                  title="Hapus semua notifikasi yang sudah dibaca"
                >
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  <span>Bersihkan Terbaca</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {roleNotifs.slice(0, 4).map((n) => (
              <div 
                key={n.id}
                onClick={() => {
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
                }}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-4 ${
                  !n.isRead 
                    ? 'bg-amber-100/90 border-dwp-burgundy border-t-amber-300 border-r-amber-300 border-b-amber-300 shadow-sm hover:bg-amber-100' 
                    : 'bg-slate-50/60 border-slate-200 text-slate-500 opacity-65 hover:opacity-100 hover:bg-slate-100'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center gap-2">
                    <span className={!n.isRead ? 'text-slate-950 font-extrabold' : 'text-slate-600 font-semibold'}>
                      {n.title}
                    </span>
                    {!n.isRead ? (
                      <span className="bg-dwp-burgundy text-dwp-gold font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                        🔴 BARU
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-semibold bg-slate-200/70 px-1.5 py-0.5 rounded">
                        ✓ Dibaca
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-relaxed ${!n.isRead ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    {n.message}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono self-end sm:self-center">{n.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI STATISTIK UTAMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Usulan Kegiatan */}
        <div 
          onClick={canAccessProposals ? () => setAdminSubTab('proposals') : undefined}
          className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all ${
            canAccessProposals ? 'hover:border-dwp-burgundy/50 cursor-pointer group' : 'opacity-90 cursor-default'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-dwp-burgundy/10 text-dwp-burgundy flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              Total Kegiatan
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">{proposals.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Usulan Kegiatan</div>
        </div>

        {/* KPI 2: Anggota DWP */}
        <div 
          onClick={canAccessMembers ? () => setAdminSubTab('members') : undefined}
          className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all ${
            canAccessMembers ? 'hover:border-dwp-burgundy/50 cursor-pointer group' : 'opacity-90 cursor-default'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-amber-700" />
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              Database
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">{members.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Anggota Resmi</div>
        </div>

        {/* KPI 3: Akun User */}
        <div 
          onClick={canAccessUsers ? () => setAdminSubTab('users') : undefined}
          className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all ${
            canAccessUsers ? 'hover:border-dwp-burgundy/50 cursor-pointer group' : 'opacity-90 cursor-default'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5 text-sky-700" />
            </div>
            <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
              Pengurus
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">{userAccounts.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Akun System</div>
        </div>

        {/* KPI 4: Status Website */}
        <div 
          onClick={canAccessCMS ? () => setAdminSubTab('cms') : undefined}
          className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all ${
            canAccessCMS ? 'hover:border-dwp-burgundy/50 cursor-pointer group' : 'opacity-90 cursor-default'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5 text-emerald-700" />
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Online
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">Aktif</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Portal Publik DWP</div>
        </div>

      </div>

      {/* KEGIATAN TERBARU LIST */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-dwp-burgundy" />
            <span>Kegiatan & Usulan Terbaru</span>
          </div>
          <button 
            onClick={() => setAdminSubTab('proposals')}
            className="text-xs font-bold text-dwp-burgundy hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua Kegiatan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {proposals.slice(0, 4).map((p) => (
            <div 
              key={p.id} 
              onClick={() => openProposalWorkspace(p.id, 'usulan')}
              className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-50 p-2 rounded-xl cursor-pointer transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-dwp-burgundy/10 text-dwp-burgundy">
                    Bidang {p.bidang}
                  </span>
                  <span className="font-bold text-slate-900 hover:text-dwp-burgundy">{p.title}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Pengusul: <strong>{p.createdBy}</strong> | Pelaksanaan: <strong>{formatDateRangeDDMMYYYY(p.startDate, p.endDate)}</strong>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <span className="font-mono text-emerald-700 font-bold">
                  Rp {p.estimatedBudget.toLocaleString('id-ID')}
                </span>
                {getStageBadge(p.currentStage)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
