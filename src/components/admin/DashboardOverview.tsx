import React from 'react';
import { useApp } from '../../context/AppContext';
import { hasTabAccess } from '../../utils/RoleAccessControl';
import { 
  Users, 
  UserCheck, 
  Globe, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Lock,
  CheckSquare,
  BellRing,
  FileText
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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-dwp-burgundy via-dwp-darkBurgundy to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-dwp-gold/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-dwp-gold/20 text-dwp-lightGold text-xs font-semibold px-3 py-1 rounded-full border border-dwp-gold/30">
              <Sparkles className="w-3.5 h-3.5 text-dwp-gold" />
              <span>Selamat Datang, {activePersona.title}</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">
              {activePersona.name}
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl">
              Portal Pengelolaan Workflow Usulan Kegiatan DWP, Data Keanggotaan Resmi, Manajemen Hak Akses User, dan Live Customizer Web DWP GTK Maluku Utara.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {canAccessProposals && (
              <button
                onClick={() => setAdminSubTab('proposals')}
                className="bg-dwp-gold hover:bg-dwp-darkGold text-slate-950 font-bold px-5 py-3 rounded-2xl text-xs shadow-lg flex items-center gap-2 transition-all"
              >
                <span>📝 Workflow Usulan Kegiatan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {canAccessMembers && (
              <button
                onClick={() => setAdminSubTab('members')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl text-xs shadow-lg flex items-center gap-2 transition-all border border-slate-700"
              >
                <span>👥 Kelola Data Anggota</span>
                <ArrowRight className="w-4 h-4 text-dwp-gold" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Usulan Kegiatan */}
        <div 
          onClick={canAccessProposals ? () => setAdminSubTab('proposals') : undefined}
          className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-sm transition-all ${
            canAccessProposals ? 'hover:shadow-md cursor-pointer group' : 'opacity-90 cursor-default'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center ${canAccessProposals ? 'group-hover:scale-110 transition-transform' : ''}`}>
              <CheckSquare className="w-6 h-6" />
            </div>
            {canAccessProposals ? (
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-200">
                {pendingProposalsCount} Pending Action
              </span>
            ) : (
              <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Info Statistik
              </span>
            )}
          </div>
          <div className="text-3xl font-serif font-bold text-slate-900">{proposals.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-1">Total Usulan Kegiatan</div>
          <p className="text-[10px] text-slate-400 mt-2">Alur Verifikasi: Pengusul ➔ Waket ➔ Ketua DWP.</p>
        </div>

        {/* KPI 2: Data Anggota */}
        <div 
          onClick={canAccessMembers ? () => setAdminSubTab('members') : undefined}
          className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-sm transition-all ${
            canAccessMembers ? 'hover:shadow-md cursor-pointer group' : 'opacity-90 cursor-default'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-dwp-burgundy/10 text-dwp-burgundy flex items-center justify-center ${canAccessMembers ? 'group-hover:scale-110 transition-transform' : ''}`}>
              <Users className="w-6 h-6" />
            </div>
            {canAccessMembers ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                Akses Kelola
              </span>
            ) : (
              <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Info Statistik
              </span>
            )}
          </div>
          <div className="text-3xl font-serif font-bold text-slate-900">{members.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-1">Total Anggota Terdaftar</div>
          <p className="text-[10px] text-slate-400 mt-2">Data resmi pengurus & anggota DWP GTK.</p>
        </div>

        {/* KPI 3: Akun User Terdaftar */}
        <div 
          onClick={canAccessUsers ? () => setAdminSubTab('users') : undefined}
          className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-sm transition-all ${
            canAccessUsers ? 'hover:shadow-md cursor-pointer group' : 'opacity-90 cursor-default'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center ${canAccessUsers ? 'group-hover:scale-110 transition-transform' : ''}`}>
              <UserCheck className="w-6 h-6" />
            </div>
            {canAccessUsers ? (
              <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-3 py-1 rounded-full border border-sky-200">
                Terintegrasi
              </span>
            ) : (
              <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Khusus IT / Ketua
              </span>
            )}
          </div>
          <div className="text-3xl font-serif font-bold text-slate-900">{userAccounts.length}</div>
          <div className="text-xs text-slate-500 font-semibold mt-1">Akun User System Active</div>
          <p className="text-[10px] text-slate-400 mt-2">Kredensial login terhubung ke Profil Anggota.</p>
        </div>

        {/* KPI 4: CMS Web Status */}
        <div 
          onClick={canAccessCMS ? () => setAdminSubTab('cms') : undefined}
          className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-sm transition-all ${
            canAccessCMS ? 'hover:shadow-md cursor-pointer group' : 'opacity-90 cursor-default'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center ${canAccessCMS ? 'group-hover:scale-110 transition-transform' : ''}`}>
              <Globe className="w-6 h-6" />
            </div>
            {canAccessCMS ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                Live Customizer
              </span>
            ) : (
              <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Read Only
              </span>
            )}
          </div>
          <div className="text-3xl font-serif font-bold text-slate-900">Aktif</div>
          <div className="text-xs text-slate-500 font-semibold mt-1">Portal Web DWP</div>
          <p className="text-[10px] text-slate-400 mt-2">Pengaturan logo, kata sambutan, visi misi, & footer.</p>
        </div>
      </div>

      {/* Info Card Hirarki Verifikasi Organisasi */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-dwp-burgundy text-dwp-gold flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Hirarki Verifikasi Usulan & Tata Kelola Organisasi DWP
            </h3>
            <p className="text-xs text-slate-500">
              Panduan alur pengusulan kegiatan dan wewenang verifikasi berjenjang pengurus DWP.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-dwp-burgundy" />
              <span>1. Form Pengusulan Digital</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Pengusulan dilakukan oleh Ketua Bidang, Sekretaris, Waket, atau Ketua DWP via pengisian formulir digital interaktif.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>2. Verifikasi Berjenjang</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Usulan diperiksa terlebih dahulu oleh Wakil Ketua DWP sebelum diteruskan untuk Persetujuan Akhir Ketua DWP.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-emerald-600" />
              <span>3. Notifikasi Pasca-Approval</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Saat disetujui, Sekretaris menerima notifikasi agenda/surat & Bendahara menerima notifikasi pencairan dana RAB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
