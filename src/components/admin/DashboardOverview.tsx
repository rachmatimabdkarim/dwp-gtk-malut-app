import React from 'react';
import { useApp } from '../../context/AppContext';
import { hasTabAccess } from '../../utils/RoleAccessControl';
import { formatDateRangeDDMMYYYY } from '../../utils/dateFormatter';
import { 
  Users, 
  UserCheck, 
  Globe, 
  ArrowRight, 
  Sparkles, 
  Lock,
  CheckSquare,
  Calendar
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { 
    currentRole,
    activePersona, 
    members, 
    userAccounts,
    proposals,
    setAdminSubTab 
  } = useApp();

  const canAccessProposals = hasTabAccess(currentRole, 'proposals');
  const canAccessMembers = hasTabAccess(currentRole, 'members');
  const canAccessUsers = hasTabAccess(currentRole, 'users');
  const canAccessCMS = hasTabAccess(currentRole, 'cms');

  const pendingProposalsCount = proposals.filter(p => p.currentStage !== 'approved' && p.currentStage !== 'rejected').length;

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'approved':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Disetujui</span>;
      case 'rejected':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">✕ Ditolak</span>;
      case 'revision_requested':
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">⚠️ Revisi</span>;
      default:
        return <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300">⏳ Verifikasi</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Clean & Minimal Welcome Header */}
      <div className="bg-gradient-to-r from-dwp-burgundy via-dwp-darkBurgundy to-slate-900 text-white rounded-3xl p-6 shadow-md border border-dwp-gold/30 flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-dwp-gold/20 text-dwp-lightGold text-xs font-semibold px-3 py-0.5 rounded-full border border-dwp-gold/30">
            <Sparkles className="w-3.5 h-3.5 text-dwp-gold" />
            <span>{activePersona.title}</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">
            Selamat Datang, {activePersona.name}
          </h2>
        </div>

        {canAccessProposals && (
          <button
            onClick={() => setAdminSubTab('proposals')}
            className="bg-dwp-gold hover:bg-dwp-darkGold text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow flex items-center gap-1.5 transition-all shrink-0"
          >
            <span>Kelola Kegiatan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Clean 4 KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Kegiatan */}
        <div 
          onClick={canAccessProposals ? () => setAdminSubTab('proposals') : undefined}
          className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all ${
            canAccessProposals ? 'hover:border-dwp-burgundy/50 cursor-pointer group' : 'opacity-90 cursor-default'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5 text-amber-800" />
            </div>
            {canAccessProposals && pendingProposalsCount > 0 ? (
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                {pendingProposalsCount} Pending
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Aktif
              </span>
            )}
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">{proposals.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Kegiatan DWP</div>
        </div>

        {/* KPI 2: Data Anggota */}
        <div 
          onClick={canAccessMembers ? () => setAdminSubTab('members') : undefined}
          className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all ${
            canAccessMembers ? 'hover:border-dwp-burgundy/50 cursor-pointer group' : 'opacity-90 cursor-default'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-dwp-burgundy/10 text-dwp-burgundy flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-dwp-burgundy" />
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              Terdaftar
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">{members.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Data Anggota</div>
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
              Live Portal
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-700">Online</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Website Public</div>
        </div>

      </div>

      {/* Clean Recent Activities Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-dwp-burgundy" />
            <h3 className="font-serif font-bold text-slate-900 text-base">
              Kegiatan Terbaru
            </h3>
          </div>
          {canAccessProposals && (
            <button 
              onClick={() => setAdminSubTab('proposals')} 
              className="text-xs font-bold text-dwp-burgundy hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua Kegiatan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {proposals.slice(0, 4).map((p) => (
            <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-dwp-burgundy/10 text-dwp-burgundy">
                    Bidang {p.bidang}
                  </span>
                  <span className="font-bold text-slate-900">{p.title}</span>
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
