import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityProposal, ProposalStage } from '../../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  FileText, 
  Check, 
  AlertTriangle, 
  UserCheck, 
  ShieldCheck, 
  X,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Send,
  Edit3,
  BellRing
} from 'lucide-react';

export const FiveStageApprovalWorkflow: React.FC = () => {
  const { proposals, addProposal, advanceApproval, resubmitProposal, activePersona } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ActivityProposal | null>(null);
  const [revisingProposal, setRevisingProposal] = useState<ActivityProposal | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [bidang, setBidang] = useState<'Pendidikan' | 'Ekonomi' | 'Sosial Budaya' | 'Sekretariat'>('Pendidikan');
  const [background, setBackground] = useState('');
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState(10000000);
  const [location, setLocation] = useState('Aula Kantor GTK Prov. Maluku Utara, Ternate');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !background) return;

    addProposal({
      title,
      bidang,
      organizer: `Bidang ${bidang} DWP GTK`,
      background,
      objective,
      targetAudience,
      estimatedBudget: Number(estimatedBudget),
      location,
      startDate,
      endDate,
      createdBy: activePersona.name
    });

    setShowAddModal(false);
    // Reset
    setTitle('');
    setBackground('');
    setObjective('');
  };

  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisingProposal) return;

    resubmitProposal(revisingProposal.id, {
      title,
      bidang,
      background,
      objective,
      targetAudience,
      estimatedBudget: Number(estimatedBudget),
      location,
      startDate,
      endDate
    });

    setRevisingProposal(null);
  };

  const handleDecision = (decision: 'approved' | 'rejected' | 'revision') => {
    if (!selectedProposal) return;

    if ((decision === 'rejected' || decision === 'revision') && !decisionNotes.trim()) {
      alert(`⚠️ CATATAN ALASAN WAJIB DIISI:\n\nMohon berikan catatan arahan revisi atau alasan penolakan secara jelas agar pengusul kegiatan mengetahui poin yang harus diperbaiki.`);
      return;
    }

    advanceApproval(selectedProposal.id, decision, decisionNotes);
    setSelectedProposal(null);
    setDecisionNotes('');
  };

  // Helper check if current persona can act on a proposal stage
  const canPersonaActOnStage = (proposal: ActivityProposal) => {
    const role = activePersona.role;
    if (role === 'admin_master') return true;

    if (proposal.currentStage === 'stage_4_wakil_ketua') {
      return role === 'wakil_ketua';
    }
    if (proposal.currentStage === 'stage_5_ketua') {
      return role === 'ketua';
    }
    return false;
  };

  const getStageBadgeLabel = (proposal: ActivityProposal) => {
    if (proposal.currentStage === 'approved') return '✅ Disetujui Final';
    if (proposal.currentStage === 'rejected') return '❌ Ditolak';
    if (proposal.currentStage === 'revision_requested') return '⚠️ Minta Revisi';
    if (proposal.currentStage === 'stage_4_wakil_ketua') return '🛡️ Verifikasi Wakil Ketua';
    if (proposal.currentStage === 'stage_5_ketua') return '👑 Persetujuan Ketua DWP';
    return 'Draf';
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              Workflow Approval Usulan Kegiatan DWP
            </h2>
            <span className="bg-dwp-burgundy text-dwp-gold text-xs font-bold px-3 py-0.5 rounded-full">
              Hirarki Resmi DWP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Alur Usulan: <strong>Ketua Bidang & Sekretaris</strong> ➔ Verifikasi Waket ➔ Persetujuan Ketua | <strong>Wakil Ketua</strong> ➔ Persetujuan Ketua | <strong>Ketua DWP</strong> ➔ Direct Auto-Approve.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setBackground('');
            setObjective('');
            setShowAddModal(true);
          }}
          className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-semibold px-5 py-3 rounded-2xl text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4 text-dwp-gold" />
          <span>Usulkan Kegiatan Baru</span>
        </button>
      </div>

      {/* Role Active Persona Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <img src={activePersona.avatar} alt={activePersona.name} className="w-8 h-8 rounded-full border border-dwp-gold object-cover" />
          <div>
            <span className="text-slate-400 text-[10px] block">Login Sebagai Persona:</span>
            <span className="font-bold text-dwp-gold">{activePersona.name} ({activePersona.title})</span>
          </div>
        </div>
        <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-slate-300">
          Role Hak Akses: <strong className="text-white capitalize">{activePersona.role.replace('_', ' ')}</strong>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-6">
        {proposals.map(proposal => {
          const isApproved = proposal.currentStage === 'approved';
          const isRejected = proposal.currentStage === 'rejected';
          const isRevision = proposal.currentStage === 'revision_requested';

          const creatorRole = proposal.creatorRole || 'admin_bidang';
          const isCreatedByWaket = creatorRole === 'wakil_ketua';
          const isCreatedByKetua = creatorRole === 'ketua';

          const userCanAct = canPersonaActOnStage(proposal);

          return (
            <div 
              key={proposal.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-dwp-burgundy text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Bidang {proposal.bidang}
                    </span>
                    <span className="text-xs text-slate-500">
                      ID: {proposal.id} | Dibuat: {proposal.createdAt} oleh <strong>{proposal.createdBy}</strong>
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-slate-900 text-xl">
                    {proposal.title}
                  </h3>
                </div>

                {/* Status Badge */}
                <div>
                  {isApproved && (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Disetujui Ketua DWP
                    </span>
                  )}
                  {isRejected && (
                    <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Ditolak
                    </span>
                  )}
                  {isRevision && (
                    <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Minta Revisi
                    </span>
                  )}
                  {!isApproved && !isRejected && !isRevision && (
                    <span className="bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-sky-600 animate-spin" />
                      {getStageBadgeLabel(proposal)}
                    </span>
                  )}
                </div>
              </div>

              {/* Revision Alert Notification */}
              {isRevision && proposal.revisionComment && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs space-y-1.5">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Catatan Revisi Verifikator:
                  </div>
                  <p className="text-amber-800 italic bg-white p-2.5 rounded-xl border border-amber-200">
                    "{proposal.revisionComment}"
                  </p>
                </div>
              )}

              {/* Proposal Key Details */}
              <div className="grid sm:grid-cols-3 gap-4 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Estimasi Anggaran (RAB)</span>
                  <span className="font-bold text-slate-900 text-sm">
                    Rp {proposal.estimatedBudget.toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Jadwal & Tempat</span>
                  <span className="font-semibold text-slate-900">
                    {proposal.startDate} | {proposal.location}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Sasaran Peserta</span>
                  <span className="font-semibold text-slate-900">
                    {proposal.targetAudience}
                  </span>
                </div>
              </div>

              {/* Dynamic Approval Workflow Stepper */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-500">
                    Alur Verification Stepper (Sesuai Role Pengusul)
                  </span>
                  <span className="text-[11px] text-dwp-burgundy font-semibold">
                    {isCreatedByKetua ? '⚡ Auto-Approved oleh Ketua DWP' : isCreatedByWaket ? '⏩ Skip Verifikasi Waket' : '📋 Verifikasi 2 Tahap'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  {/* Step 1: Pengusulan */}
                  <div className="p-3 rounded-2xl border bg-emerald-50 border-emerald-300 text-emerald-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-[11px]">1. Draf Diusulkan</div>
                      <div className="text-[9px] text-emerald-700">Oleh {proposal.createdBy}</div>
                    </div>
                  </div>

                  {/* Step 2: Verifikasi Wakil Ketua */}
                  <div className={`p-3 rounded-2xl border flex items-center gap-2 ${
                    isCreatedByKetua || isCreatedByWaket
                      ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-65'
                      : proposal.currentStage === 'stage_5_ketua' || isApproved
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : proposal.currentStage === 'stage_4_wakil_ketua'
                      ? 'bg-dwp-burgundy text-white border-dwp-gold shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCreatedByKetua || isCreatedByWaket
                        ? 'bg-slate-200 text-slate-400'
                        : proposal.currentStage === 'stage_5_ketua' || isApproved
                        ? 'bg-emerald-600 text-white'
                        : proposal.currentStage === 'stage_4_wakil_ketua'
                        ? 'bg-dwp-gold text-slate-950'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isCreatedByKetua || isCreatedByWaket ? '⏩' : (proposal.currentStage === 'stage_5_ketua' || isApproved) ? <Check className="w-3.5 h-3.5" /> : '2'}
                    </div>
                    <div>
                      <div className="font-bold text-[11px]">2. Verifikasi Waket</div>
                      <div className="text-[9px]">
                        {isCreatedByKetua || isCreatedByWaket ? '(Auto-Skipped)' : proposal.currentStage === 'stage_4_wakil_ketua' ? 'Menunggu Review' : 'Wakil Ketua'}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Persetujuan Ketua DWP */}
                  <div className={`p-3 rounded-2xl border flex items-center gap-2 ${
                    isCreatedByKetua
                      ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-65'
                      : isApproved
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : proposal.currentStage === 'stage_5_ketua'
                      ? 'bg-dwp-burgundy text-white border-dwp-gold shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCreatedByKetua
                        ? 'bg-slate-200 text-slate-400'
                        : isApproved
                        ? 'bg-emerald-600 text-white'
                        : proposal.currentStage === 'stage_5_ketua'
                        ? 'bg-dwp-gold text-slate-950'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isCreatedByKetua ? '⚡' : isApproved ? <Check className="w-3.5 h-3.5" /> : '3'}
                    </div>
                    <div>
                      <div className="font-bold text-[11px]">3. Persetujuan Ketua</div>
                      <div className="text-[9px]">
                        {isCreatedByKetua ? '(Auto-Approved)' : proposal.currentStage === 'stage_5_ketua' ? 'Menunggu Ketua DWP' : 'Ketua DWP'}
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Disetujui & Tembusan */}
                  <div className={`p-3 rounded-2xl border flex items-center gap-2 ${
                    isApproved
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isApproved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isApproved ? <Check className="w-3.5 h-3.5" /> : '4'}
                    </div>
                    <div>
                      <div className="font-bold text-[11px]">4. Disetujui & Tembusan</div>
                      <div className="text-[9px]">{isApproved ? 'Tembusan Dikirimkan' : 'Selesai'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Log Timeline */}
              {proposal.logs.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <span className="text-xs font-bold text-slate-500">Riwayat Catatan Review & Verifikasi:</span>
                  <div className="space-y-2">
                    {proposal.logs.map((log) => (
                      <div key={log.id} className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        log.stageName === 'Tembusan Otomatis' ? 'bg-sky-50/80 border-sky-200 text-sky-900' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900">{log.actorName} ({log.stageName})</span>
                          <p className="text-slate-600 italic">"{log.notes}"</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                <div>
                  {isRevision && (
                    <button
                      onClick={() => {
                        setRevisingProposal(proposal);
                        setTitle(proposal.title);
                        setBidang(proposal.bidang);
                        setBackground(proposal.background);
                        setObjective(proposal.objective);
                        setTargetAudience(proposal.targetAudience);
                        setEstimatedBudget(proposal.estimatedBudget);
                        setLocation(proposal.location);
                        setStartDate(proposal.startDate);
                        setEndDate(proposal.endDate);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Perbaiki Draf & Ajukan Ulang</span>
                    </button>
                  )}
                </div>

                {!isApproved && !isRejected && !isRevision && (
                  <div className="flex items-center gap-2">
                    {userCanAct ? (
                      <button
                        onClick={() => setSelectedProposal(proposal)}
                        className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-dwp-gold" />
                        <span>Tinjau & Berikan Keputusan ({activePersona.title})</span>
                      </button>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        🔒 Menunggu Akses: {getStageBadgeLabel(proposal)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Action Sheet Approval */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dwp-burgundy text-dwp-gold flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-lg">
                    Form Keputusan Reviewer
                  </h3>
                  <p className="text-xs text-dwp-burgundy font-semibold">
                    Sebagai: {activePersona.title} ({activePersona.name})
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedProposal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedProposal.title}</div>
              <div className="text-slate-500">Estimasi Anggaran: Rp {selectedProposal.estimatedBudget.toLocaleString('id-ID')}</div>
              <div className="text-dwp-burgundy font-semibold">Tahap Saat Ini: {getStageBadgeLabel(selectedProposal)}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Catatan Review / Masukan Verifikator:</span>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  * Wajib diisi jika Minta Revisi / Tolak
                </span>
              </label>
              <textarea
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Tuliskan catatan verifikasi, arahan revisi, atau alasan penolakan..."
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleDecision('approved')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs shadow flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Setujui</span>
              </button>

              <button
                onClick={() => handleDecision('revision')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-xs shadow flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Minta Revisi</span>
              </button>

              <button
                onClick={() => handleDecision('rejected')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-xs shadow flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Resubmit Proposal */}
      {revisingProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleResubmit} className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-xl">
                  Perbaiki Draf & Ajukan Ulang Proposal
                </h3>
                <p className="text-xs text-amber-700">
                  Sesuaikan draf usulan kegiatan sesuai dengan arahan verifikator.
                </p>
              </div>
              <button type="button" onClick={() => setRevisingProposal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Kegiatan DWP *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bidang Penyelenggara *</label>
                  <select
                    value={bidang}
                    onChange={(e) => setBidang(e.target.value as any)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  >
                    <option value="Pendidikan">Bidang Pendidikan</option>
                    <option value="Ekonomi">Bidang Ekonomi</option>
                    <option value="Sosial Budaya">Bidang Sosial Budaya</option>
                    <option value="Sekretariat">Sekretariat Inti</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimasi Anggaran (RAB) Rp *</label>
                  <input
                    type="number"
                    required
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Latar Belakang & Urgensi *</label>
                <textarea
                  required
                  rows={3}
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRevisingProposal(null)}
                  className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl text-xs font-bold shadow flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Ulang Proposal Revisi</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal Add Proposal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleCreateProposal} className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-xl">
                  Pengajuan Usulan Kegiatan Baru
                </h3>
                <p className="text-xs text-slate-500">
                  Diusulkan oleh: <strong>{activePersona.name} ({activePersona.title})</strong>
                </p>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-dwp-burgundy flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-dwp-gold" />
                Info Alur Verification Berdasarkan Role Anda:
              </div>
              {activePersona.role === 'admin_bidang' || activePersona.role === 'sekretaris' ? (
                <p>Usulan Anda akan diverifikasi oleh <strong>Wakil Ketua</strong> terlebih dahulu sebelum diteruskan ke <strong>Ketua DWP</strong>.</p>
              ) : activePersona.role === 'wakil_ketua' ? (
                <p>Usulan dari Wakil Ketua akan melompati verifikasi awal dan <strong>langsung dikirimkan ke Ketua DWP</strong> untuk persetujuan akhir.</p>
              ) : (
                <p>Usulan dari Ketua DWP akan <strong>langsung disetujui (Auto-Approved)</strong> dan diterbitkan ke sistem.</p>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Kegiatan DWP *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pelatihan Literasi Digital Anggota DWP GTK Maluku Utara"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bidang Penyelenggara *</label>
                  <select
                    value={bidang}
                    onChange={(e) => setBidang(e.target.value as any)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  >
                    <option value="Pendidikan">Bidang Pendidikan</option>
                    <option value="Ekonomi">Bidang Ekonomi</option>
                    <option value="Sosial Budaya">Bidang Sosial Budaya</option>
                    <option value="Sekretariat">Sekretariat Inti</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimasi Anggaran (RAB) Rp *</label>
                  <input
                    type="number"
                    required
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Latar Belakang & Urgensi *</label>
                <textarea
                  required
                  rows={3}
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="Jelaskan alasan dan latar belakang pelaksanaan kegiatan..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tujuan & Hasil Yang Diharapkan</label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Contoh: Meningkatkan wawasan pengasuhan digital anggota DWP"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Peserta</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="50 Orang Anggota"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lokasi Pelaksanaan</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white px-6 py-3 rounded-xl text-xs font-bold shadow flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Usulan Kegiatan</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
