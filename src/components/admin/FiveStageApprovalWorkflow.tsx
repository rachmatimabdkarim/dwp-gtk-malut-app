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
  const { proposals, addProposal, advanceApproval, resubmitProposal, activePersona, members, currentAccount } = useApp();

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

  // Helper function to detect active persona's assigned Bidang
  const getActivePersonaBidang = (): 'Pendidikan' | 'Ekonomi' | 'Sosial Budaya' | 'Sekretariat' => {
    if (currentAccount && currentAccount.memberId) {
      const m = members.find(mem => mem.id === currentAccount.memberId);
      if (m && ['Pendidikan', 'Ekonomi', 'Sosial Budaya'].includes(m.bidang)) {
        return m.bidang as 'Pendidikan' | 'Ekonomi' | 'Sosial Budaya';
      }
    }

    const titleLower = activePersona.title.toLowerCase();
    if (titleLower.includes('pendidikan')) return 'Pendidikan';
    if (titleLower.includes('ekonomi')) return 'Ekonomi';
    if (titleLower.includes('sosial')) return 'Sosial Budaya';
    if (activePersona.role === 'sekretaris') return 'Sekretariat';

    return 'Pendidikan';
  };

  const handleOpenAddModal = () => {
    const userBidang = getActivePersonaBidang();
    setBidang(userBidang);
    setTitle('');
    setBackground('');
    setObjective('');
    setTargetAudience('');
    setEstimatedBudget(10000000);
    setShowAddModal(true);
  };

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
    switch (proposal.currentStage) {
      case 'stage_4_wakil_ketua':
        return 'Verifikasi Wakil Ketua';
      case 'stage_5_ketua':
        return 'Persetujuan Ketua DWP';
      case 'approved':
        return 'Disetujui Resmi (Approved)';
      case 'rejected':
        return 'Ditolak';
      case 'revision_requested':
        return 'Perlu Revisi Pengusul';
      default:
        return 'Peninjauan';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-bold text-slate-900">
              Workflow Usulan Kegiatan DWP
            </h2>
            <span className="bg-dwp-gold text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              Dynamic Approval Hierarchy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengusulan kegiatan oleh Ketua Bidang, Sekretaris, Waket, atau Ketua DWP via formulir digital berjenjang.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow flex items-center gap-2 transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4 text-dwp-gold" />
          <span>Buat Usulan Kegiatan Baru</span>
        </button>
      </div>

      {/* Dynamic Hierarchy Explanation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-dwp-darkBurgundy to-slate-900 text-white p-5 rounded-2xl border border-dwp-gold/30 shadow-md space-y-2">
        <div className="flex items-center gap-2 text-dwp-gold font-bold text-xs">
          <Sparkles className="w-4 h-4 text-dwp-gold" />
          <span>Aturan Dynamic Hierarchy Verifikasi Usulan Kegiatan DWP:</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-[11px] text-slate-300 pt-1">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">1. Usulan Ketua Bidang & Sekretaris</span>
            <p className="text-slate-400 leading-relaxed">
              Memulai dari <strong>Stage 4 (Verifikasi Waket)</strong> ➔ Diteruskan ke <strong>Stage 5 (Persetujuan Ketua DWP)</strong>.
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-dwp-gold block">2. Usulan Wakil Ketua DWP</span>
            <p className="text-slate-400 leading-relaxed">
              Verifikasi awal otomatis dilompati (⏩ <i>Auto-Skipped</i>). Usulan <strong>langsung dikirim ke Ketua DWP</strong>.
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 block">3. Usulan Ketua DWP</span>
            <p className="text-slate-400 leading-relaxed">
              Usulan yang diajukan oleh Ketua DWP <strong>langsung disetujui resmi (⏩ Direct Approved)</strong> & notifikasi otomatis terkirim.
            </p>
          </div>
        </div>
      </div>

      {/* List Proposals */}
      <div className="space-y-4">
        {proposals.map((proposal) => {
          const isApproved = proposal.currentStage === 'approved';
          const isRejected = proposal.currentStage === 'rejected';
          const isRevision = proposal.currentStage === 'revision_requested';
          const userCanAct = canPersonaActOnStage(proposal);
          const isMyProposal = proposal.createdBy === activePersona.name;

          return (
            <div 
              key={proposal.id}
              className={`bg-white rounded-2xl p-5 border transition-all space-y-4 shadow-sm ${
                isApproved ? 'border-emerald-200 bg-emerald-50/20' : 
                isRejected ? 'border-rose-200 bg-rose-50/20' : 
                isRevision ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 hover:border-dwp-burgundy/40'
              }`}
            >
              {/* Proposal Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-dwp-burgundy/10 text-dwp-burgundy border border-dwp-burgundy/20">
                      Bidang {proposal.bidang}
                    </span>
                    <span className="text-xs font-serif font-bold text-slate-900">
                      {proposal.title}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span>Pengusul: <strong className="text-slate-800">{proposal.createdBy}</strong></span>
                    <span>•</span>
                    <span>Estimasi RAB: <strong className="text-emerald-700">Rp {proposal.estimatedBudget.toLocaleString('id-ID')}</strong></span>
                    <span>•</span>
                    <span>Tanggal Pelaksanaan: <strong className="text-slate-800">{proposal.startDate} s.d. {proposal.endDate}</strong></span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 w-fit ${
                    isApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    isRejected ? 'bg-rose-100 text-rose-800 border-rose-300' :
                    isRevision ? 'bg-amber-100 text-amber-900 border-amber-300' :
                    'bg-sky-100 text-sky-900 border-sky-300'
                  }`}>
                    {isApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> :
                     isRejected ? <XCircle className="w-3.5 h-3.5 text-rose-600" /> :
                     isRevision ? <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> :
                     <Clock className="w-3.5 h-3.5 text-sky-600" />}
                    <span>{getStageBadgeLabel(proposal)}</span>
                  </span>
                </div>
              </div>

              {/* Proposal Content Body */}
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Latar Belakang & Urgensi:</span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {proposal.background}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Maksud & Tujuan:</span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {proposal.objective || 'Meningkatkan partisipasi dan kualitas kegiatan DWP GTK Maluku Utara.'}
                  </p>
                </div>
              </div>

              {/* Approval History Logs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-dwp-burgundy" />
                  <span>Riwayat Verifikasi & Log Keputusan:</span>
                </div>
                <div className="space-y-1.5 divide-y divide-slate-200/60">
                  {proposal.logs.map((log) => (
                    <div key={log.id} className="pt-1.5 first:pt-0 flex items-start justify-between text-[11px] gap-2">
                      <div>
                        <span className="font-bold text-slate-800">{log.actorName}</span>
                        <span className="text-slate-500"> ({log.stageName}): </span>
                        <span className="italic text-slate-700">"{log.notes}"</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dual Role Auto-Notification Alert (Secretaris & Bendahara) */}
              {isApproved && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <BellRing className="w-4 h-4 text-emerald-700" />
                    <span>Notifikasi Otomatis Pasca-Approval Disertai Tembusan Dua Peran:</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-[11px] text-emerald-900 pt-1">
                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <strong>📜 Notifikasi Sekretaris DWP:</strong> Agenda kegiatan resmi diterbitkan & diarsipkan dalam sistem.
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <strong>💰 Notifikasi Bendahara DWP:</strong> Pencairan dana RAB sebesar <strong>Rp {proposal.estimatedBudget.toLocaleString('id-ID')}</strong> disiapkan.
                    </div>
                  </div>
                </div>
              )}

              {/* Actions Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  {isRevision && isMyProposal && (
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
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
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
                    disabled={activePersona.role === 'admin_bidang'}
                    onChange={(e) => setBidang(e.target.value as any)}
                    className={`w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold ${
                      activePersona.role === 'admin_bidang' ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'bg-white text-slate-900 cursor-pointer'
                    }`}
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
                <label className="font-bold text-slate-700 block mb-1">Latar Belakang & Urgensi Kegiatan *</label>
                <textarea
                  required
                  rows={3}
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="Jelaskan dasar pertimbangan dan urgensi dilaksanakannya kegiatan ini..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Maksud & Tujuan Kegiatan</label>
                <textarea
                  rows={2}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Jelaskan tujuan dan hasil yang ingin dicapai..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sasaran / Peserta</label>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">Bidang Penyelenggara *</label>
                    {activePersona.role === 'admin_bidang' && (
                      <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                        🔒 Disesuaikan Role
                      </span>
                    )}
                  </div>
                  <select
                    value={bidang}
                    disabled={activePersona.role === 'admin_bidang'}
                    onChange={(e) => setBidang(e.target.value as any)}
                    className={`w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold ${
                      activePersona.role === 'admin_bidang' ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'bg-white text-slate-900 cursor-pointer'
                    }`}
                  >
                    <option value="Pendidikan">Bidang Pendidikan</option>
                    <option value="Ekonomi">Bidang Ekonomi</option>
                    <option value="Sosial Budaya">Bidang Sosial Budaya</option>
                    <option value="Sekretariat">Sekretariat Inti</option>
                  </select>
                  {activePersona.role === 'admin_bidang' && (
                    <p className="text-[10px] text-slate-400 italic mt-1">
                      Otomatis terkunci ke Bidang {bidang} sesuai posisi pengusul.
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimasi Anggaran (RAB) Rp *</label>
                  <input
                    type="number"
                    required
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Latar Belakang & Urgensi Kegiatan *</label>
                <textarea
                  required
                  rows={3}
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="Jelaskan dasar pertimbangan dan urgensi dilaksanakannya kegiatan ini..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Maksud & Tujuan Kegiatan</label>
                <textarea
                  rows={2}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Jelaskan tujuan dan hasil yang ingin dicapai..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sasaran / Peserta</label>
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
