import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityProposal, ProposalStage, DocumentJobDesk, DocumentType } from '../../types';
import { formatDateRangeDDMMYYYY, formatDateDDMMYYYY } from '../../utils/dateFormatter';
import { canViewProposalDetail } from '../../utils/RoleAccessControl';
import { CustomDateInput } from '../common/CustomDateInput';
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
  BellRing,
  Trash2,
  Users,
  FileSpreadsheet,
  QrCode,
  Newspaper,
  Calendar,
  Layers,
  Link,
  Lock,
  ClipboardList,
  History
} from 'lucide-react';

export const FiveStageApprovalWorkflow: React.FC = () => {
  const { 
    proposals, 
    addProposal, 
    advanceApproval, 
    resubmitProposal, 
    updateProposalCommittee,
    updateCommitteeStatus,
    setDocumentJobDesks,
    deleteProposal, 
    activePersona, 
    currentRole,
    members, 
    currentAccount,
    focusedProposalId,
    setFocusedProposalId,
    focusedWorkspaceTab,
    kopSuratConfig,
    activityDocuments,
    createOrUpdateActivityDocument,
    assignDocumentTask,
    advanceDocumentApproval,
    deleteActivityDocument
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ActivityProposal | null>(null);
  const [revisingProposal, setRevisingProposal] = useState<ActivityProposal | null>(null);
  const [decisionType, setDecisionType] = useState<'approved' | 'revision' | 'rejected'>('approved');
  const [decisionNotes, setDecisionNotes] = useState('');

  // Activity Workspace Detail Modal State
  const [detailProposal, setDetailProposal] = useState<ActivityProposal | null>(null);
  const [activeTabWorkspace, setActiveTabWorkspace] = useState<'usulan' | 'panitia' | 'sk' | 'absensi' | 'lpj'>('usulan');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Revision Inline Edit State
  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBidang, setEditBidang] = useState<'Pendidikan' | 'Ekonomi' | 'Sosial Budaya' | 'Sekretariat'>('Pendidikan');
  const [editBackground, setEditBackground] = useState('');
  const [editObjective, setEditObjective] = useState('');
  const [editTargetAudience, setEditTargetAudience] = useState('');
  const [editEstimatedBudget, setEditEstimatedBudget] = useState(10000000);
  const [editLocation, setEditLocation] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  React.useEffect(() => {
    if (detailProposal) {
      setEditTitle(detailProposal.title);
      setEditBidang(detailProposal.bidang);
      setEditBackground(detailProposal.background);
      setEditObjective(detailProposal.objective || '');
      setEditTargetAudience(detailProposal.targetAudience || '');
      setEditEstimatedBudget(detailProposal.estimatedBudget);
      setEditLocation(detailProposal.location);
      setEditStartDate(detailProposal.startDate);
      setEditEndDate(detailProposal.endDate);
      setIsEditingProposal(detailProposal.currentStage === 'revision_requested');
    }
  }, [detailProposal]);

  // Auto open proposal workspace when triggered by notification or global focus
  React.useEffect(() => {
    if (focusedProposalId) {
      const targetP = proposals.find(p => p.id === focusedProposalId);
      if (targetP) {
        setDetailProposal(targetP);
        setActiveTabWorkspace(focusedWorkspaceTab);
        setFocusedProposalId(null);
      }
    }
  }, [focusedProposalId, focusedWorkspaceTab, proposals, setFocusedProposalId]);

  // Committee Modal State
  const [showAddCommitteeModal, setShowAddCommitteeModal] = useState(false);
  const [committeeMemberId, setCommitteeMemberId] = useState('');
  const [committeeRoleTitle, setCommitteeRoleTitle] = useState<'Ketua Panitia' | 'Sekretaris Panitia' | 'Bendahara Panitia' | 'Seksi Acara' | 'Seksi Humas & Logistik' | 'Anggota Panitia'>('Anggota Panitia');

  // Jobdesk State
  const [draftJobDesks, setDraftJobDesks] = useState<DocumentJobDesk[]>([]);
  const [showJobDeskLogs, setShowJobDeskLogs] = useState(false);
  const [newCustomDocTitle, setNewCustomDocTitle] = useState('');
  const [newCustomDocAssignee, setNewCustomDocAssignee] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [bidang, setBidang] = useState<'Pendidikan' | 'Ekonomi' | 'Sosial Budaya' | 'Sekretariat'>('Pendidikan');
  const [background, setBackground] = useState('');
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState(10000000);
  const [location, setLocation] = useState('');
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
    setLocation('');
    setShowAddModal(true);
  };

  const validateAllFields = (): boolean => {
    if (
      !title.trim() ||
      !background.trim() ||
      !objective.trim() ||
      !targetAudience.trim() ||
      !location.trim() ||
      !startDate ||
      !endDate ||
      !estimatedBudget ||
      estimatedBudget <= 0
    ) {
      alert(`⚠️ SEMUA KOLOM ISIAN WAJIB DIISI:\n\nMohon lengkapi seluruh kolom isian usulan kegiatan (Judul, Bidang, RAB, Latar Belakang, Maksud & Tujuan, Sasaran, Tanggal Mulai/Selesai, dan Lokasi Pelaksanaan).\n\nTidak boleh ada kolom yang dikosongkan!`);
      return false;
    }
    return true;
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAllFields()) return;

    addProposal({
      title: title.trim(),
      bidang,
      organizer: `Bidang ${bidang} DWP GTK`,
      background: background.trim(),
      objective: objective.trim(),
      targetAudience: targetAudience.trim(),
      estimatedBudget: Number(estimatedBudget),
      location: location.trim(),
      startDate,
      endDate,
      createdBy: activePersona.name
    });

    setShowAddModal(false);
    setTitle('');
    setBackground('');
    setObjective('');
    setTargetAudience('');
  };

  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisingProposal) return;
    if (!validateAllFields()) return;

    resubmitProposal(revisingProposal.id, {
      title: title.trim(),
      bidang,
      background: background.trim(),
      objective: objective.trim(),
      targetAudience: targetAudience.trim(),
      estimatedBudget: Number(estimatedBudget),
      location: location.trim(),
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

  const handleAddCommitteeMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailProposal) return;
    if (!committeeMemberId) {
      alert('Pilih anggota DWP terlebih dahulu!');
      return;
    }

    const targetMem = members.find(m => m.id === committeeMemberId);
    const memberName = targetMem ? targetMem.name : 'Anggota DWP';
    const currentComm = detailProposal.committeeMembers || [];
    const coreRoles = ['Ketua Panitia', 'Sekretaris Panitia', 'Bendahara Panitia'];

    // Check 1: Core roles (Ketua Panitia, Sekretaris, Bendahara) cannot be held by the same person (No Rangkap Jabatan)
    if (coreRoles.includes(committeeRoleTitle)) {
      const existingCoreHolding = currentComm.find(
        c => (c.memberId === committeeMemberId || c.memberName === memberName) && coreRoles.includes(c.roleTitle)
      );

      if (existingCoreHolding) {
        alert(`⚠️ JABATAN PANITIA INTI TIDAK BOLEH DIRANGKAP:\n\n${memberName} sudah ditunjuk sebagai "${existingCoreHolding.roleTitle}".\n\nKetua Panitia, Sekretaris Panitia, dan Bendahara Panitia tidak boleh dirangkap oleh pengurus yang sama.`);
        return;
      }

      // Check 2: Core role slot can only be filled once (e.g. only 1 Ketua Panitia)
      const existingRoleHolder = currentComm.find(c => c.roleTitle === committeeRoleTitle);
      if (existingRoleHolder) {
        alert(`⚠️ JABATAN POSISI TERISI:\n\nPosisi "${committeeRoleTitle}" sudah diisi oleh ${existingRoleHolder.memberName}.\n\nHapus posisi ${existingRoleHolder.memberName} terlebih dahulu jika ingin mengganti.`);
        return;
      }
    }

    const newCommItem = {
      id: `comm-${Date.now()}`,
      roleTitle: committeeRoleTitle,
      memberName,
      memberId: committeeMemberId,
      phone: targetMem ? targetMem.phone : undefined
    };

    const updatedComm = [...currentComm, newCommItem];

    updateProposalCommittee(detailProposal.id, updatedComm);
    setDetailProposal(prev => prev ? { ...prev, committeeMembers: updatedComm } : null);
    setShowAddCommitteeModal(false);
    setCommitteeMemberId('');
  };

  const handleRemoveCommitteeMember = (commId: string) => {
    if (!detailProposal) return;
    if (!confirm('Apakah Anda yakin ingin menghapus susunan panitia ini?')) return;

    const currentComm = detailProposal.committeeMembers || [];
    const updatedComm = currentComm.filter(c => c.id !== commId);

    updateProposalCommittee(detailProposal.id, updatedComm);
    setDetailProposal(prev => prev ? { ...prev, committeeMembers: updatedComm } : null);
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
              Kegiatan DWP
            </h2>
            <span className="bg-dwp-gold text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              Manajemen Terpadu Kegiatan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengusulan, verifikasi berjenjang, penunjukan panitia, persuratan SK, hingga presensi online kegiatan.
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

      {/* List Activities */}
      <div className="space-y-4">
        {proposals.map((proposal) => {
          const isApproved = proposal.currentStage === 'approved';
          const isRejected = proposal.currentStage === 'rejected';
          const isRevision = proposal.currentStage === 'revision_requested';
          const userCanAct = canPersonaActOnStage(proposal);
          const isMyProposal = proposal.createdBy === activePersona.name;
          const userCanViewDetail = canViewProposalDetail(currentRole, activePersona.name, proposal);

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
                    
                    {/* Clickable Title to open Workspace Detail */}
                    <button
                      onClick={() => {
                        if (!userCanViewDetail) {
                          alert(`🔒 AKSES DETIL TERBATAS:\n\nSebagai Ketua Bidang, Anda hanya dapat membuka detil kegiatan yang Anda usulkan sendiri.\n\nSesuai aturan hak akses, detil kegiatan "${proposal.title}" ini hanya dapat dibuka oleh Pengusul (${proposal.createdBy}) atau Pimpinan Harian (Ketua DWP, Wakil Ketua, Sekretaris).`);
                          return;
                        }
                        setDetailProposal(proposal);
                        setActiveTabWorkspace('usulan');
                      }}
                      className={`text-xs font-serif font-bold text-left underline decoration-dotted underline-offset-4 transition-colors ${
                        userCanViewDetail ? 'text-slate-900 hover:text-dwp-burgundy' : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      {proposal.title}
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span>Pengusul: <strong className="text-slate-800">{proposal.createdBy}</strong></span>
                    <span>•</span>
                    <span>Estimasi RAB: <strong className="text-emerald-700">Rp {proposal.estimatedBudget.toLocaleString('id-ID')}</strong></span>
                    <span>•</span>
                    <span>Pelaksanaan: <strong className="text-slate-800">{formatDateRangeDDMMYYYY(proposal.startDate, proposal.endDate)}</strong></span>
                  </div>
                </div>

                {/* Status Badge & Detail Button */}
                <div className="shrink-0 flex items-center gap-2">
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

                  {userCanViewDetail ? (
                    <button
                      onClick={() => {
                        setDetailProposal(proposal);
                        setActiveTabWorkspace('usulan');
                      }}
                      className="bg-slate-900 hover:bg-dwp-burgundy text-dwp-gold text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1 transition-all"
                    >
                      <span>Detail & Workspace</span>
                      <ArrowRight className="w-3 h-3 text-dwp-gold" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        alert(`🔒 AKSES DETIL TERBATAS:\n\nSebagai Ketua Bidang, Anda hanya dapat membuka detil kegiatan yang Anda usulkan sendiri.\n\nDetil kegiatan "${proposal.title}" ini hanya dapat dibuka oleh Pengusul (${proposal.createdBy}) atau Pimpinan (Ketua, Wakil Ketua, Sekretaris).`);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-500 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Hanya Pengusul Kegiatan atau Pimpinan yang dapat membuka detil"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Detil Terbatas</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-3">
                <div className="flex items-center gap-2">
                  {/* Superadmin IT Delete Button */}
                  {activePersona.role === 'admin_master' && (
                    <button
                      onClick={() => {
                        if (confirm(`⚠️ KONFIRMASI HAPUS PROPOSAL (KHUSUS SUPERADMIN):\n\nApakah Anda yakin ingin menghapus usulan kegiatan:\n👉 "${proposal.title}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
                          deleteProposal(proposal.id);
                        }
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                      title="Hapus Usulan Kegiatan (Wewenang Khusus Superadmin IT)"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus Proposal</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: WORKSPACE DETAIL KEGIATAN (5 TABS PROCESS) */}
      {/* ========================================================================= */}
      {detailProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            
            {/* Header Modal Workspace */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-dwp-burgundy text-dwp-gold">
                    Bidang {detailProposal.bidang}
                  </span>
                  <h3 className="font-serif font-bold text-slate-900 text-lg md:text-xl">
                    {detailProposal.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Pengusul: <strong>{detailProposal.createdBy}</strong> | Status: <strong className="text-emerald-700">{getStageBadgeLabel(detailProposal)}</strong>
                </p>
              </div>

              <button 
                onClick={() => {
                  setDetailProposal(null);
                  setFocusedProposalId(null);
                }} 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation Workspace */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto shrink-0 text-xs font-bold">
              <button
                onClick={() => setActiveTabWorkspace('usulan')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                  activeTabWorkspace === 'usulan' ? 'bg-dwp-burgundy text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 text-dwp-gold" />
                <span>📌 Usulan & Verifikasi</span>
              </button>

              <button
                onClick={() => setActiveTabWorkspace('panitia')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                  activeTabWorkspace === 'panitia' ? 'bg-dwp-burgundy text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>👥 Kepanitiaan Pelaksana</span>
              </button>

              <button
                onClick={() => setActiveTabWorkspace('sk')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                  activeTabWorkspace === 'sk' ? 'bg-dwp-burgundy text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>📜 Persuratan & SK</span>
              </button>

              <button
                onClick={() => setActiveTabWorkspace('absensi')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                  activeTabWorkspace === 'absensi' ? 'bg-dwp-burgundy text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>📝 Absensi Digital</span>
              </button>

              <button
                onClick={() => setActiveTabWorkspace('lpj')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                  activeTabWorkspace === 'lpj' ? 'bg-dwp-burgundy text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                <span>📊 LPJ & Berita</span>
              </button>
            </div>

            {/* Tab Body Content - Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              
              {/* TAB 1: USULAN & VERIFIKASI */}
              {activeTabWorkspace === 'usulan' && (() => {
                const isApprovedOrRejected = detailProposal.currentStage === 'approved' || detailProposal.currentStage === 'rejected';
                const canReview = !isApprovedOrRejected && (
                  (currentRole as string) === 'admin_master' ||
                  (detailProposal.currentStage === 'stage_4_wakil_ketua' && (currentRole === 'wakil_ketua' || (currentRole as string) === 'admin_master')) ||
                  (detailProposal.currentStage === 'stage_5_ketua' && (currentRole === 'ketua' || (currentRole as string) === 'admin_master'))
                );
                const isProposer = detailProposal.createdBy === activePersona.name || 
                                   detailProposal.creatorRole === currentRole || 
                                   (currentRole as string) === 'admin_master';
                const isRevisionRequested = detailProposal.currentStage === 'revision_requested';

                return (
                  <div className="space-y-4">
                    {/* BANNER STATUS REVISI & FORM EDIT PERBAIKAN (KHUSUS PENGUSUL) */}
                    {isRevisionRequested && isProposer && (
                      <div className="space-y-3">
                        <div className="bg-amber-500/15 border border-amber-300 p-4 rounded-2xl text-amber-900 space-y-2 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="font-bold flex items-center gap-2 text-xs text-amber-950">
                              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                              <span>PROPOSAL MEMERLUKAN REVISI DARI PIMPINAN</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsEditingProposal(!isEditingProposal)}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer w-fit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isEditingProposal ? 'Tutup Form Edit' : 'Edit & Perbaiki Draf Usulan'}</span>
                            </button>
                          </div>

                          <p className="text-xs text-amber-900 bg-white/80 p-3 rounded-xl border border-amber-200/80 font-medium leading-relaxed">
                            💬 <strong>Catatan / Instruksi Revisi:</strong> "{detailProposal.revisionComment || detailProposal.logs[detailProposal.logs.length - 1]?.notes || 'Mohon perbaiki data usulan kegiatan sesuai arahan pimpinan.'}"
                          </p>
                        </div>

                        {/* FORM EDIT DRAF PERBAIKAN */}
                        {isEditingProposal && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              resubmitProposal(detailProposal.id, {
                                title: editTitle,
                                bidang: editBidang,
                                background: editBackground,
                                objective: editObjective,
                                targetAudience: editTargetAudience,
                                estimatedBudget: Number(editEstimatedBudget),
                                location: editLocation,
                                startDate: editStartDate,
                                endDate: editEndDate
                              });

                              const creatorRole = detailProposal.creatorRole || 'admin_bidang';
                              const targetStage: ProposalStage = creatorRole === 'wakil_ketua' ? 'stage_5_ketua' : 'stage_4_wakil_ketua';

                              const resubmitLog = {
                                id: `log-${Date.now()}`,
                                stageName: 'Revisi Diajukan Kembali',
                                actorRole: currentRole,
                                actorName: activePersona.name,
                                decision: 'approved' as const,
                                notes: 'Proposal telah diperbaiki dan diajukan ulang untuk verifikasi.',
                                timestamp: new Date().toLocaleString('id-ID')
                              };

                              setDetailProposal(prev => prev ? {
                                ...prev,
                                title: editTitle,
                                bidang: editBidang,
                                background: editBackground,
                                objective: editObjective,
                                targetAudience: editTargetAudience,
                                estimatedBudget: Number(editEstimatedBudget),
                                location: editLocation,
                                startDate: editStartDate,
                                endDate: editEndDate,
                                currentStage: targetStage,
                                revisionComment: undefined,
                                logs: [...prev.logs, resubmitLog]
                              } : null);

                              setIsEditingProposal(false);
                              alert('🚀 Perbaikan Draf usulan berhasil disimpan dan diajukan kembali ke Pimpinan untuk verifikasi!');
                            }}
                            className="bg-white p-4.5 rounded-2xl border-2 border-amber-300 space-y-3.5 shadow-md text-xs animate-in fade-in-50"
                          >
                            <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="flex items-center gap-1.5 text-dwp-burgundy font-serif text-sm">
                                <Edit3 className="w-4 h-4 text-amber-600" />
                                Form Perbaikan Draf Usulan Kegiatan
                              </span>
                              <span className="text-[10px] text-slate-500 font-normal">Isi perubahan lalu klik tombol Ajukan Ulang</span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Judul Kegiatan *</label>
                                <input
                                  type="text"
                                  required
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                                />
                              </div>

                              <div>
                                <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                                  <span>Bidang Organisasi *</span>
                                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                                    🔒 Terkunci (Sesuai Usulan Awal)
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  disabled
                                  value={`Bidang ${editBidang}`}
                                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-600 font-bold cursor-not-allowed select-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Latar Belakang & Urgensi *</label>
                              <textarea
                                rows={3}
                                required
                                value={editBackground}
                                onChange={(e) => setEditBackground(e.target.value)}
                                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Maksud & Tujuan Kegiatan *</label>
                              <textarea
                                rows={2}
                                required
                                value={editObjective}
                                onChange={(e) => setEditObjective(e.target.value)}
                                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                              />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Estimasi RAB (Rp) *</label>
                                <input
                                  type="number"
                                  required
                                  value={editEstimatedBudget}
                                  onChange={(e) => setEditEstimatedBudget(Number(e.target.value))}
                                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                                />
                              </div>

                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Sasaran / Peserta *</label>
                                <input
                                  type="text"
                                  required
                                  value={editTargetAudience}
                                  onChange={(e) => setEditTargetAudience(e.target.value)}
                                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                                />
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3">
                              <CustomDateInput
                                label="Tanggal Mulai *"
                                subLabel="(tgl/bln/thn)"
                                value={editStartDate}
                                onChange={(val) => setEditStartDate(val)}
                                required
                              />

                              <CustomDateInput
                                label="Tanggal Selesai *"
                                subLabel="(tgl/bln/thn)"
                                value={editEndDate}
                                onChange={(val) => setEditEndDate(val)}
                                required
                              />

                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Lokasi Pelaksanaan *</label>
                                <input
                                  type="text"
                                  required
                                  value={editLocation}
                                  onChange={(e) => setEditLocation(e.target.value)}
                                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                                />
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsEditingProposal(false)}
                                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                              >
                                Batal
                              </button>
                              <button
                                type="submit"
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Send className="w-4 h-4" />
                                <span>🚀 Simpan Perbaikan & Ajukan Ulang Usulan</span>
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                    {/* MINIMALIST & COMPACT PANEL PENINJAUAN */}
                    {canReview && (
                      <div className="bg-amber-500/10 border border-amber-300/60 p-3.5 rounded-2xl space-y-3 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/50 pb-2">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-dwp-burgundy shrink-0" />
                            <span className="font-bold text-slate-900 text-xs">
                              Peninjauan Usulan — Role Akses: <strong className="text-dwp-burgundy">{activePersona.title}</strong>
                            </span>
                          </div>
                          <span className="text-[10px] bg-dwp-burgundy text-white font-semibold px-2.5 py-0.5 rounded-full w-fit">
                            Tahap: {getStageBadgeLabel(detailProposal)}
                          </span>
                        </div>

                        {/* Compact Action Controls */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
                          {/* 3 Compact Decision Badges */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setDecisionType('approved')}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                                decisionType === 'approved'
                                  ? 'bg-emerald-700 text-white shadow-sm border border-emerald-800'
                                  : 'bg-white text-emerald-800 border border-slate-200 hover:bg-emerald-50'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDecisionType('revision')}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                                decisionType === 'revision'
                                  ? 'bg-amber-600 text-white shadow-sm border border-amber-700'
                                  : 'bg-white text-amber-800 border border-slate-200 hover:bg-amber-50'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Revisi</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDecisionType('rejected')}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                                decisionType === 'rejected'
                                  ? 'bg-rose-700 text-white shadow-sm border border-rose-800'
                                  : 'bg-white text-rose-800 border border-slate-200 hover:bg-rose-50'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>

                          {/* Inline Catatan Input & Submit */}
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={decisionNotes}
                              onChange={(e) => setDecisionNotes(e.target.value)}
                              placeholder={
                                decisionType === 'approved'
                                  ? "Catatan persetujuan (Opsional)..."
                                  : decisionType === 'revision'
                                  ? "Catatan instruksi revisi (Wajib)..."
                                  : "Alasan penolakan usulan (Wajib)..."
                              }
                              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                if (decisionType !== 'approved' && !decisionNotes.trim()) {
                                  alert('⚠️ Catatan Peninjauan Wajib Diisi untuk keputusan Revisi atau Penolakan.');
                                  return;
                                }
                                advanceApproval(detailProposal.id, decisionType, decisionNotes);
                                
                                let newStage: ProposalStage = detailProposal.currentStage;
                                if (decisionType === 'rejected') newStage = 'rejected';
                                else if (decisionType === 'revision') newStage = 'revision_requested';
                                else {
                                  if (detailProposal.currentStage === 'stage_4_wakil_ketua') newStage = 'stage_5_ketua';
                                  else if (detailProposal.currentStage === 'stage_5_ketua') newStage = 'approved';
                                }

                                const newLog = {
                                  id: `log-${Date.now()}`,
                                  stageName: getStageBadgeLabel(detailProposal),
                                  actorRole: currentRole,
                                  actorName: activePersona.name,
                                  decision: decisionType,
                                  notes: decisionNotes || (decisionType === 'approved' ? 'Telah diverifikasi dan disetujui.' : decisionType === 'revision' ? 'Perlu revisi penyesuaian.' : 'Ditolak.'),
                                  timestamp: new Date().toLocaleString('id-ID')
                                };

                                setDetailProposal(prev => prev ? {
                                  ...prev,
                                  currentStage: newStage,
                                  logs: [...prev.logs, newLog]
                                } : null);

                                setDecisionNotes('');
                                alert(`✅ Keputusan "${decisionType.toUpperCase()}" berhasil disimpan!`);
                              }}
                              className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5 text-dwp-gold" />
                              <span>Kirim</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Estimasi RAB:</span>
                        <strong className="text-emerald-700 text-sm font-serif">Rp {detailProposal.estimatedBudget.toLocaleString('id-ID')}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Tanggal Pelaksanaan:</span>
                        <strong className="text-slate-800">{formatDateRangeDDMMYYYY(detailProposal.startDate, detailProposal.endDate)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Lokasi Pelaksanaan:</span>
                        <strong className="text-slate-800">{detailProposal.location}</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-slate-800 block text-xs">Latar Belakang & Urgensi:</span>
                      <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                        {detailProposal.background}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-slate-800 block text-xs">Maksud & Tujuan Kegiatan:</span>
                      <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                        {detailProposal.objective || 'Meningkatkan partisipasi dan kualitas kegiatan DWP GTK Maluku Utara.'}
                      </p>
                    </div>

                    {/* Logs */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-dwp-burgundy" />
                        <span>Riwayat Verifikasi Berjenjang:</span>
                      </div>
                      <div className="space-y-2 divide-y divide-slate-200">
                        {detailProposal.logs.map((log) => (
                          <div key={log.id} className="pt-2 first:pt-0 flex items-start justify-between text-xs gap-2">
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
                  </div>
                );
              })()}

              {/* TAB 2: KEPANITIAAN PELAKSANA */}
              {activeTabWorkspace === 'panitia' && (() => {
                const isProposer = detailProposal.createdBy === activePersona.name || 
                                   detailProposal.creatorRole === currentRole || 
                                   currentRole === 'admin_master';
                const commList = detailProposal.committeeMembers || [];
                const commStatus = detailProposal.committeeStatus || 'draft';
                const canWaketAct = (currentRole === 'wakil_ketua' || currentRole === 'admin_master') && commStatus === 'pending_waket_verification';
                const canKetuaAct = (currentRole === 'ketua' || currentRole === 'admin_master') && commStatus === 'pending_ketua_approval';

                return (
                  <div className="space-y-4">
                    {detailProposal.currentStage !== 'approved' ? (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-2 text-xs">
                          <Lock className="w-4 h-4 text-amber-700" />
                          <span>Pembentukan Panitia Terkunci (Menunggu Persetujuan Ketua DWP)</span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          Penunjukan Panitia Pelaksana dapat dilakukan setelah kegiatan ini resmi disetujui oleh <strong>Ketua DWP</strong>.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Status Header Bar for Committee Approval Workflow */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Persetujuan Panitia:</span>
                            <div className="flex items-center gap-2">
                              {commStatus === 'approved_by_ketua' ? (
                                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Disetujui Resmi Ketua DWP</span>
                                </span>
                              ) : commStatus === 'pending_ketua_approval' ? (
                                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-amber-600" />
                                  <span>Menunggu Persetujuan Ketua DWP</span>
                                </span>
                              ) : commStatus === 'pending_waket_verification' ? (
                                <span className="bg-sky-100 text-sky-900 text-xs font-bold px-3 py-1 rounded-full border border-sky-300 flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                                  <span>Menunggu Verifikasi Wakil Ketua</span>
                                </span>
                              ) : commStatus === 'revision_requested' ? (
                                <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-300 flex items-center gap-1.5">
                                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                                  <span>Perlu Revisi Panitia</span>
                                </span>
                              ) : (
                                <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-300 flex items-center gap-1.5">
                                  <FileText className="w-4 h-4 text-slate-500" />
                                  <span>Draf Susunan Panitia</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Committee Workflow Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Proposer Submit Button */}
                            {isProposer && (commStatus === 'draft' || commStatus === 'revision_requested') && commList.length > 0 && (
                              <button
                                onClick={() => {
                                  const hasKetuaPanitia = commList.some(c => c.roleTitle === 'Ketua Panitia');
                                  if (!hasKetuaPanitia) {
                                    alert('⚠️ SUSUNAN PANITIA BELUM LENGKAP:\n\nSusunan panitia pelaksana minimal harus memiliki 1 orang yang ditunjuk sebagai "Ketua Panitia".\n\nMohon pilih dan tambahkan "Ketua Panitia" terlebih dahulu sebelum mengajukan verifikasi ke Wakil Ketua.');
                                    return;
                                  }

                                  updateCommitteeStatus(detailProposal.id, 'pending_waket_verification', 'Susunan panitia pelaksana diajukan untuk verifikasi Wakil Ketua.', activePersona.name);
                                  setDetailProposal(prev => prev ? { ...prev, committeeStatus: 'pending_waket_verification' } : null);
                                  alert('✅ Usulan Susunan Panitia berhasil dikirimkan ke Wakil Ketua untuk verifikasi awal!');
                                }}
                                className="bg-sky-700 hover:bg-sky-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Kirim Ajuan Panitia ke Wakil Ketua</span>
                              </button>
                            )}

                            {/* Wakil Ketua Verification Buttons */}
                            {canWaketAct && (
                              <>
                                <button
                                  onClick={() => {
                                    const notes = prompt('Masukkan Catatan Verifikasi Panitia (Opsional):', 'Susunan panitia sesuai dan diverifikasi.');
                                    if (notes === null) return;
                                    updateCommitteeStatus(detailProposal.id, 'pending_ketua_approval', notes, activePersona.name);
                                    setDetailProposal(prev => prev ? { ...prev, committeeStatus: 'pending_ketua_approval', committeeNotes: notes } : null);
                                    alert('🛡️ Susunan Panitia Berhasil Diverifikasi! Diteruskan ke Ketua DWP untuk persetujuan akhir.');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Verifikasi Panitia (Wakil Ketua)</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const notes = prompt('Masukkan Alasan Revisi Susunan Panitia:');
                                    if (!notes) return;
                                    updateCommitteeStatus(detailProposal.id, 'revision_requested', notes, activePersona.name);
                                    setDetailProposal(prev => prev ? { ...prev, committeeStatus: 'revision_requested', committeeNotes: notes } : null);
                                    alert('⚠️ Permintaan revisi susunan panitia telah dikirimkan ke pengusul kegiatan.');
                                  }}
                                  className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Minta Revisi Panitia</span>
                                </button>
                              </>
                            )}

                            {/* Ketua DWP Approval Buttons */}
                            {canKetuaAct && (
                              <>
                                <button
                                  onClick={() => {
                                    const notes = prompt('Masukkan Catatan Persetujuan Ketua DWP (Opsional):', 'Disetujui resmi susunan panitia pelaksana.');
                                    if (notes === null) return;
                                    updateCommitteeStatus(detailProposal.id, 'approved_by_ketua', notes, activePersona.name);
                                    setDetailProposal(prev => prev ? { ...prev, committeeStatus: 'approved_by_ketua', committeeNotes: notes } : null);
                                    alert('👑 Susunan Panitia Pelaksana Berhasil Disetujui Resmi oleh Ketua DWP! Draf SK Panitia dapat dicetak oleh Sekretaris.');
                                  }}
                                  className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-dwp-gold" />
                                  <span>Setujui Resmi Panitia (Ketua DWP)</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const notes = prompt('Masukkan Alasan Revisi Susunan Panitia dari Ketua DWP:');
                                    if (!notes) return;
                                    updateCommitteeStatus(detailProposal.id, 'revision_requested', notes, activePersona.name);
                                    setDetailProposal(prev => prev ? { ...prev, committeeStatus: 'revision_requested', committeeNotes: notes } : null);
                                    alert('⚠️ Catatan revisi panitia telah dikirimkan ke pengusul kegiatan.');
                                  }}
                                  className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Minta Revisi Panitia</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {detailProposal.committeeNotes && (
                          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs space-y-0.5">
                            <span className="font-bold text-slate-700 block">Catatan Verifikasi / Approver Panitia:</span>
                            <p className="italic text-slate-800">"{detailProposal.committeeNotes}"</p>
                          </div>
                        )}

                        {!isProposer && (
                          <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl text-sky-900 flex items-start gap-2.5">
                            <Lock className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                            <div className="text-xs space-y-0.5">
                              <span className="font-bold block">Wewenang Khusus Pengusul Kegiatan ({detailProposal.createdBy})</span>
                              <p className="text-[11px] text-sky-800 leading-relaxed">
                                Penambahan & penunjukan susunan Panitia Pelaksana hanya dapat dilakukan oleh Pengusul Kegiatan yang bersangkutan (<strong>{detailProposal.createdBy}</strong>).
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                          <div className="font-bold text-slate-900 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-dwp-burgundy" />
                              <span>Susunan Panitia Pelaksana ({commList.length} Orang):</span>
                            </span>

                            {isProposer && (commStatus === 'draft' || commStatus === 'revision_requested') && (
                              <button 
                                onClick={() => setShowAddCommitteeModal(true)}
                                className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                              >
                                <Plus className="w-3.5 h-3.5 text-dwp-gold" />
                                <span>Tambah Panitia</span>
                              </button>
                            )}
                          </div>

                          {commList.length === 0 ? (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500 text-xs space-y-1">
                              <Users className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                              <p className="font-semibold text-slate-700">Belum ada panitia yang ditunjuk.</p>
                              {isProposer ? (
                                <p className="text-[11px] text-slate-500">Klik tombol "Tambah Panitia" di atas untuk menyusun panitia pelaksana kegiatan.</p>
                              ) : (
                                <p className="text-[11px] text-slate-500">Menunggu pengusul kegiatan ({detailProposal.createdBy}) menyusun panitia.</p>
                              )}
                            </div>
                          ) : (
                            <div className="grid sm:grid-cols-2 gap-3 text-xs">
                              {commList.map((comm) => (
                                <div key={comm.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-sm">
                                  <div className="space-y-0.5">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dwp-burgundy/10 text-dwp-burgundy">
                                      {comm.roleTitle}
                                    </span>
                                    <strong className="text-slate-900 block text-xs mt-1">{comm.memberName}</strong>
                                    {comm.phone && <span className="text-[10px] text-slate-400 block">📞 {comm.phone}</span>}
                                  </div>

                                  {isProposer && (commStatus === 'draft' || commStatus === 'revision_requested') && (
                                    <button
                                      onClick={() => handleRemoveCommitteeMember(comm.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                      title="Hapus dari Panitia"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* ========== PANEL JOBDESK DOKUMEN ========== */}
                        {commStatus === 'approved_by_ketua' && (() => {
                          const ketuaPanitiaItem = commList.find(c => c.roleTitle === 'Ketua Panitia');
                          const isSinglePanitia = commList.length === 1 && ketuaPanitiaItem;
                          const isKetuaPanitia = currentRole === 'admin_master' || (
                            ketuaPanitiaItem &&
                            currentAccount?.memberId &&
                            ketuaPanitiaItem.memberId === currentAccount.memberId
                          );
                          const savedJobDesks = detailProposal.documentJobDesks || [];

                          // On first render or when detailProposal changes: sync draft from saved
                          const currentDraft = draftJobDesks.length === 0 && savedJobDesks.length > 0
                            ? savedJobDesks
                            : draftJobDesks;

                          const getAssignee = (docType: DocumentType, customTitle?: string) => {
                            const jd = currentDraft.find(j =>
                              j.documentType === docType &&
                              (docType !== 'custom' || j.customTitle === customTitle)
                            );
                            return jd?.assignedMemberId || '';
                          };

                          const updateAssignee = (docType: DocumentType, memberId: string, customTitle?: string) => {
                            const targetMember = commList.find(c => c.memberId === memberId);
                            const now = new Date().toLocaleString('id-ID');
                            const existing = currentDraft.find(j =>
                              j.documentType === docType &&
                              (docType !== 'custom' || j.customTitle === customTitle)
                            );
                            if (existing) {
                              setDraftJobDesks(currentDraft.map(j => {
                                if (j.documentType === docType && (docType !== 'custom' || j.customTitle === customTitle)) {
                                  return { ...j, assignedMemberId: memberId, assignedMemberName: targetMember?.memberName || memberId, assignedAt: now };
                                }
                                return j;
                              }));
                            } else {
                              setDraftJobDesks([...currentDraft, {
                                id: `jd-${Date.now()}`,
                                documentType: docType,
                                customTitle,
                                assignedMemberId: memberId,
                                assignedMemberName: targetMember?.memberName || memberId,
                                assignedAt: now,
                                assignedBy: activePersona.name
                              }]);
                            }
                          };

                          const customJobDesks = currentDraft.filter(j => j.documentType === 'custom');

                          const getDocLabel = (docType: DocumentType) => {
                            if (docType === 'sk_panitia') return '📜 SK Penetapan Panitia';
                            if (docType === 'surat_tugas') return '📑 Surat Tugas Panitia';
                            if (docType === 'surat_undangan') return '✉️ Surat Undangan';
                            return '📄 Dokumen Kustom';
                          };

                          const handleSaveJobDesks = () => {
                            const allStandard: DocumentType[] = ['sk_panitia', 'surat_tugas', 'surat_undangan'];
                            const missingStd = allStandard.filter(dt =>
                              !currentDraft.some(j => j.documentType === dt)
                            );
                            if (missingStd.length > 0 && !isSinglePanitia) {
                              alert(`⚠️ Belum semua dokumen standar ditugaskan:\n\n${missingStd.map(dt => getDocLabel(dt)).join('\n')}\n\nMohon tentukan siapa yang bertugas mengerjakan setiap dokumen.`);
                              return;
                            }

                            const finalJobDesks: DocumentJobDesk[] = isSinglePanitia && ketuaPanitiaItem
                              ? allStandard.map(dt => ({
                                  id: `jd-${dt}-${Date.now()}`,
                                  documentType: dt as DocumentType,
                                  assignedMemberId: ketuaPanitiaItem.memberId || '',
                                  assignedMemberName: ketuaPanitiaItem.memberName,
                                  assignedAt: new Date().toLocaleString('id-ID'),
                                  assignedBy: activePersona.name
                                }))
                              : currentDraft;

                            setDocumentJobDesks(
                              detailProposal.id,
                              finalJobDesks,
                              activePersona.name,
                              savedJobDesks
                            );
                            setDetailProposal(prev => prev ? { ...prev, documentJobDesks: finalJobDesks } : null);
                            setDraftJobDesks([]);
                            setActiveTabWorkspace('sk');
                            alert('✅ Jobdesk dokumen berhasil disimpan! Silakan lanjutkan ke Tab SK untuk mulai membuat dokumen.');
                          };

                          return (
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-200 rounded-2xl p-5 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ClipboardList className="w-4 h-4 text-blue-700" />
                                  <span className="font-bold text-slate-800 text-sm">Penetapan Jobdesk Dokumen Kegiatan</span>
                                  <span className="text-[10px] bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-full font-bold">
                                    {savedJobDesks.length > 0 ? '✅ Sudah Ditetapkan' : '⏳ Belum Ditetapkan'}
                                  </span>
                                </div>
                                {(detailProposal.jobDeskLogs && detailProposal.jobDeskLogs.length > 0) && (
                                  <button
                                    onClick={() => setShowJobDeskLogs(!showJobDeskLogs)}
                                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <History className="w-3 h-3" />
                                    <span>Riwayat Perubahan ({detailProposal.jobDeskLogs.length})</span>
                                  </button>
                                )}
                              </div>

                              {!isKetuaPanitia && !isSinglePanitia && (
                                <div className="bg-sky-50 border border-sky-200 text-sky-900 p-3 rounded-xl text-xs flex items-center gap-2">
                                  <Lock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                  <span>Penetapan Jobdesk hanya dapat dilakukan oleh <strong>Ketua Panitia</strong>{ketuaPanitiaItem ? ` (${ketuaPanitiaItem.memberName})` : ''}.</span>
                                </div>
                              )}

                              {isSinglePanitia && ketuaPanitiaItem && (
                                <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-xl text-xs flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>⚡ <strong>Mode Panitia Tunggal:</strong> Semua dokumen otomatis ditugaskan ke Ketua Panitia (<strong>{ketuaPanitiaItem.memberName}</strong>).</span>
                                </div>
                              )}

                              {/* Standard Document Jobdesk Rows */}
                              {!isSinglePanitia && (
                                <div className="space-y-2">
                                  {(['sk_panitia', 'surat_tugas', 'surat_undangan'] as DocumentType[]).map(docType => {
                                    const assigneeId = getAssignee(docType);
                                    const assignedMember = commList.find(c => c.memberId === assigneeId);
                                    return (
                                      <div key={docType} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                        <span className="text-xs font-bold text-slate-700 w-44 shrink-0">{getDocLabel(docType)}</span>
                                        {isKetuaPanitia ? (
                                          <select
                                            value={assigneeId}
                                            onChange={e => updateAssignee(docType, e.target.value)}
                                            className="flex-1 p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                                          >
                                            <option value="">— Pilih Anggota Panitia —</option>
                                            {commList.map(c => (
                                              <option key={c.id} value={c.memberId || c.id}>{c.memberName} ({c.roleTitle})</option>
                                            ))}
                                          </select>
                                        ) : (
                                          <span className={`flex-1 text-xs px-3 py-1.5 rounded-lg border ${assignedMember ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-400 italic'}`}>
                                            {assignedMember ? `👤 ${assignedMember.memberName} (${assignedMember.roleTitle})` : 'Belum ditetapkan'}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}

                                  {/* Custom Document Jobdesk Rows */}
                                  {customJobDesks.map((jd, idx) => {
                                    const assignedMember = commList.find(c => c.memberId === jd.assignedMemberId);
                                    return (
                                      <div key={jd.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                                        <span className="text-xs font-bold text-emerald-700 w-44 shrink-0">📄 {jd.customTitle}</span>
                                        {isKetuaPanitia ? (
                                          <>
                                            <select
                                              value={jd.assignedMemberId}
                                              onChange={e => updateAssignee('custom', e.target.value, jd.customTitle)}
                                              className="flex-1 p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white cursor-pointer"
                                            >
                                              <option value="">— Pilih Anggota Panitia —</option>
                                              {commList.map(c => (
                                                <option key={c.id} value={c.memberId || c.id}>{c.memberName} ({c.roleTitle})</option>
                                              ))}
                                            </select>
                                            <button
                                              onClick={() => setDraftJobDesks(currentDraft.filter(item => item.id !== jd.id))}
                                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                              title="Hapus dokumen kustom ini"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </>
                                        ) : (
                                          <span className={`flex-1 text-xs px-3 py-1.5 rounded-lg border ${assignedMember ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-400 italic'}`}>
                                            {assignedMember ? `👤 ${assignedMember.memberName} (${assignedMember.roleTitle})` : 'Belum ditetapkan'}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}

                                  {/* Add Custom Document Row */}
                                  {isKetuaPanitia && (
                                    <div className="flex items-center gap-2 bg-emerald-50 border border-dashed border-emerald-300 p-3 rounded-xl">
                                      <input
                                        type="text"
                                        value={newCustomDocTitle}
                                        onChange={e => setNewCustomDocTitle(e.target.value)}
                                        placeholder="Judul dokumen kustom (mis: Surat Izin Tempat)"
                                        className="flex-1 p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                                      />
                                      <select
                                        value={newCustomDocAssignee}
                                        onChange={e => setNewCustomDocAssignee(e.target.value)}
                                        className="w-48 p-2 border border-slate-300 rounded-lg text-xs focus:outline-none bg-white cursor-pointer"
                                      >
                                        <option value="">— Pilih Petugas —</option>
                                        {commList.map(c => (
                                          <option key={c.id} value={c.memberId || c.id}>{c.memberName}</option>
                                        ))}
                                      </select>
                                      <button
                                        onClick={() => {
                                          if (!newCustomDocTitle.trim() || !newCustomDocAssignee) {
                                            alert('Lengkapi judul dokumen dan pilih petugas terlebih dahulu!');
                                            return;
                                          }
                                          const targetMember = commList.find(c => c.memberId === newCustomDocAssignee);
                                          setDraftJobDesks([...currentDraft, {
                                            id: `jd-custom-${Date.now()}`,
                                            documentType: 'custom',
                                            customTitle: newCustomDocTitle.trim(),
                                            assignedMemberId: newCustomDocAssignee,
                                            assignedMemberName: targetMember?.memberName || newCustomDocAssignee,
                                            assignedAt: new Date().toLocaleString('id-ID'),
                                            assignedBy: activePersona.name
                                          }]);
                                          setNewCustomDocTitle('');
                                          setNewCustomDocAssignee('');
                                        }}
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                                      >
                                        <Plus className="w-3.5 h-3.5" /> Tambah
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Save Button */}
                              {isKetuaPanitia && (
                                <div className="flex justify-end pt-1">
                                  <button
                                    onClick={handleSaveJobDesks}
                                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2 rounded-xl text-xs shadow flex items-center gap-2 transition-all cursor-pointer"
                                  >
                                    <ClipboardList className="w-3.5 h-3.5" />
                                    <span>{savedJobDesks.length > 0 ? 'Perbarui Jobdesk & Buka Tab SK' : 'Simpan Jobdesk & Mulai Buat Dokumen'}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}

                              {/* Jobdesk Change History Log */}
                              {showJobDeskLogs && detailProposal.jobDeskLogs && detailProposal.jobDeskLogs.length > 0 && (
                                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                                    <History className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Riwayat Perubahan Jobdesk:</span>
                                  </div>
                                  <div className="space-y-1.5 divide-y divide-slate-100">
                                    {detailProposal.jobDeskLogs.map(log => (
                                      <div key={log.id} className="pt-1.5 first:pt-0 text-[11px] flex items-start justify-between gap-2">
                                        <div className="space-y-0.5">
                                          <span className="font-bold text-slate-800">
                                            {log.customTitle || log.documentType.replace('_', ' ').toUpperCase()}
                                          </span>
                                          <div className="text-slate-600">
                                            {log.previousMemberName
                                              ? <span>{log.previousMemberName} → <strong>{log.newMemberName}</strong></span>
                                              : <span>Ditugaskan ke <strong>{log.newMemberName}</strong></span>
                                            }
                                            {' '}· oleh <em>{log.changedBy}</em>
                                          </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.changedAt}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Riwayat Verifikasi & Persetujuan Panitia */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                            <ShieldCheck className="w-4 h-4 text-dwp-burgundy" />
                            <span>Riwayat Verifikasi & Persetujuan Panitia:</span>
                          </div>

                          {(!detailProposal.committeeLogs || detailProposal.committeeLogs.length === 0) ? (
                            <p className="text-[11px] text-slate-400 italic">Belum ada catatan riwayat verifikasi panitia.</p>
                          ) : (
                            <div className="space-y-2 divide-y divide-slate-200">
                              {detailProposal.committeeLogs.map((log) => (
                                <div key={log.id} className="pt-2 first:pt-0 flex items-start justify-between text-xs gap-2">
                                  <div>
                                    <span className="font-bold text-slate-800">{log.actorName}</span>
                                    <span className="text-slate-500"> ({log.stageName}): </span>
                                    <span className="italic text-slate-700">"{log.notes}"</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">{log.timestamp}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}


              {/* TAB 3: PERSURATAN & SK */}
              {activeTabWorkspace === 'sk' && (
                <div className="space-y-6">
                  {(() => {
                    const currentDocs = activityDocuments.filter(d => d.proposalId === detailProposal.id);
                    const commMembers = detailProposal.committeeMembers || [];
                    const isSinglePanitia = commMembers.length === 1;
                    const ketuaPanitiaItem = commMembers.find(c => c.roleTitle === 'Ketua Panitia') || commMembers[0];

                    // Jobdesk guard variables
                    const jobDesks = detailProposal.documentJobDesks || [];
                    const jobDesksSet = jobDesks.length > 0;
                    const isAdminMaster = currentRole === 'admin_master';
                    const myMemberId = currentAccount?.memberId || '';
                    const isAssignedToMe = (docType: DocumentType, customTitle?: string) => {
                      if (isAdminMaster || isSinglePanitia) return true;
                      const jd = jobDesks.find(j =>
                        j.documentType === docType &&
                        (docType !== 'custom' || j.customTitle === customTitle)
                      );
                      return jd ? jd.assignedMemberId === myMemberId : false;
                    };
                    const getJobDeskHolder = (docType: DocumentType, customTitle?: string) => {
                      const jd = jobDesks.find(j =>
                        j.documentType === docType &&
                        (docType !== 'custom' || j.customTitle === customTitle)
                      );
                      return jd ? jd.assignedMemberName : null;
                    };

                    const activeDoc = currentDocs.find(d => d.id === selectedDocId) || currentDocs[0];

                    const handleCreateDoc = (docType: 'sk_panitia' | 'surat_tugas' | 'surat_undangan' | 'custom', titleText?: string) => {
                      const docTitle = titleText || (
                        docType === 'sk_panitia' ? 'SK Penetapan Panitia Pelaksana' :
                        docType === 'surat_tugas' ? 'Surat Tugas Panitia' :
                        docType === 'surat_undangan' ? 'Surat Undangan Official DWP' : 'Dokumen Kustom'
                      );

                      const defaultNumber = docType === 'sk_panitia' ? `001/SK/DWP-GTK/MALUT/VIII/${new Date().getFullYear()}` :
                                           docType === 'surat_tugas' ? `002/ST/DWP-GTK/MALUT/VIII/${new Date().getFullYear()}` :
                                           docType === 'surat_undangan' ? `003/UND/DWP-GTK/MALUT/VIII/${new Date().getFullYear()}` :
                                           `004/KUST/DWP-GTK/MALUT/VIII/${new Date().getFullYear()}`;

                      const assignedId = isSinglePanitia && ketuaPanitiaItem ? ketuaPanitiaItem.memberId : (currentAccount?.id || 'admin');
                      const assignedName = isSinglePanitia && ketuaPanitiaItem ? ketuaPanitiaItem.memberName : activePersona.name;

                      const newDoc = {
                        id: `doc-${Date.now()}`,
                        proposalId: detailProposal.id,
                        documentType: docType,
                        customTitle: docTitle,
                        assignedToMemberId: assignedId,
                        assignedToMemberName: assignedName,
                        status: 'draft' as const,
                        letterNumber: defaultNumber,
                        contentData: {
                          letterDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                          locationCity: 'Tidore Kepulauan',
                          menimbang: [
                            `Bahwa demi kelancaran dan suksesnya pelaksanaan kegiatan "${detailProposal.title}", maka dipandang perlu menetapkan Susunan Panitia Pelaksana.`,
                            `Bahwa pengurus yang namanya tercantum dalam lampiran surat keputusan ini dianggap mampu dan memenuhi syarat untuk melaksanakan tugas.`
                          ],
                          mengingat: [
                            `Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART) Dharma Wanita Persatuan.`,
                            `Program Kerja DWP GTK Provinsi Maluku Utara Tahun ${new Date().getFullYear()}.`,
                            `Keputusan Rapat Pengurus DWP GTK Maluku Utara.`
                          ],
                          diktum: [
                            `Menetapkan Susunan Panitia Pelaksana Kegiatan ${detailProposal.title} sebagaimana tercantum dalam lampiran keputusan ini.`,
                            `Panitia Pelaksana bertanggung jawab melaporkan pelaksanaan kegiatan dan LPJ kepada Ketua DWP GTK Maluku Utara.`,
                            `Keputusan ini berlaku sejak tanggal ditetapkan.`
                          ],
                          maksudTugas: `Melaksanakan koordinasi, persiapan, teknis lapangan, dan pelaksanaan kegiatan ${detailProposal.title} di ${detailProposal.location}.`,
                          penerima: `Pengurus dan Seluruh Anggota Dharma Wanita Persatuan GTK Maluku Utara`,
                          rundown: `1. Pembukaan\n2. Sambutan Ketua DWP GTK Malut\n3. Pelaksanaan Acara Utama\n4. Doa & Penutup`,
                          bodyText: `Dengan ini diberitahukan bahwa sehubungan dengan pelaksanaan kegiatan ${detailProposal.title}, diharapkan perkenan Bapak/Ibu/Saudara/i untuk menghadiri dan berpartisipasi aktif dalam rangkaian kegiatan tersebut.`,
                          signedByKetuaName: 'Ny. Hajjah Nurjanah S.Pd',
                          signedByKetuaNip: '19780512 200501 2 003'
                        }
                      };

                      createOrUpdateActivityDocument(newDoc);
                      setSelectedDocId(newDoc.id);
                    };

                    return (
                      <div className="space-y-6 text-xs">
                        {/* Section A: Header Banner & Dynamic Document Selector */}
                        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-dwp-gold" />
                              <h3 className="font-serif font-bold text-lg text-dwp-gold">
                                Modul Otomatisasi Persuratan & SK Official DWP
                              </h3>
                            </div>
                            <p className="text-[11px] text-slate-300">
                              Pilih dokumen yang dibutuhkan untuk kegiatan ini. Sistem mengisikan data secara otomatis dengan Kop Surat Resmi DWP GTK Malut.
                            </p>
                          </div>

                          {/* Action Buttons to Add Documents — Gated by Jobdesk */}
                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            {!jobDesksSet && !isAdminMaster ? (
                              <span className="text-amber-300 text-[11px] font-semibold flex items-center gap-1">
                                ⏳ Menunggu Ketua Panitia menetapkan Jobdesk
                              </span>
                            ) : (
                              <>
                                {/* SK Panitia */}
                                {!currentDocs.some(d => d.documentType === 'sk_panitia') && (
                                  isAssignedToMe('sk_panitia') ? (
                                    <button
                                      onClick={() => handleCreateDoc('sk_panitia')}
                                      className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-dwp-gold border border-dwp-gold/40 px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> + SK Panitia
                                    </button>
                                  ) : (
                                    <span className="text-slate-400 text-[11px] flex items-center gap-1 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
                                      📜 SK Panitia — dikerjakan oleh: <em>{getJobDeskHolder('sk_panitia')}</em>
                                    </span>
                                  )
                                )}

                                {/* Surat Tugas */}
                                {!currentDocs.some(d => d.documentType === 'surat_tugas') && (
                                  isAssignedToMe('surat_tugas') ? (
                                    <button
                                      onClick={() => handleCreateDoc('surat_tugas')}
                                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> + Surat Tugas
                                    </button>
                                  ) : (
                                    <span className="text-slate-400 text-[11px] flex items-center gap-1 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
                                      📑 Surat Tugas — dikerjakan oleh: <em>{getJobDeskHolder('surat_tugas')}</em>
                                    </span>
                                  )
                                )}

                                {/* Surat Undangan */}
                                {!currentDocs.some(d => d.documentType === 'surat_undangan') && (
                                  isAssignedToMe('surat_undangan') ? (
                                    <button
                                      onClick={() => handleCreateDoc('surat_undangan')}
                                      className="bg-sky-900 hover:bg-sky-800 text-sky-200 border border-sky-700 px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> + Surat Undangan
                                    </button>
                                  ) : (
                                    <span className="text-slate-400 text-[11px] flex items-center gap-1 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
                                      ✉️ Surat Undangan — dikerjakan oleh: <em>{getJobDeskHolder('surat_undangan')}</em>
                                    </span>
                                  )
                                )}

                                {/* Custom Docs from Jobdesk */}
                                {jobDesks.filter(jd => jd.documentType === 'custom').map(jd => {
                                  const alreadyMade = currentDocs.some(d => d.documentType === 'custom' && d.customTitle === jd.customTitle);
                                  if (alreadyMade) return null;
                                  return isAssignedToMe('custom', jd.customTitle) ? (
                                    <button
                                      key={jd.id}
                                      onClick={() => handleCreateDoc('custom', jd.customTitle)}
                                      className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600 px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> + {jd.customTitle}
                                    </button>
                                  ) : (
                                    <span key={jd.id} className="text-slate-400 text-[11px] flex items-center gap-1 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
                                      📄 {jd.customTitle} — dikerjakan oleh: <em>{jd.assignedMemberName}</em>
                                    </span>
                                  );
                                })}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Jobdesk Not Set Banner */}
                        {!jobDesksSet && !isAdminMaster && (
                          <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-2xl flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <span className="font-bold text-sm block">⏳ Menunggu Penetapan Jobdesk Dokumen</span>
                              <p className="text-xs leading-relaxed">
                                Ketua Panitia belum menetapkan jobdesk dokumen. Silakan buka <strong>Tab Panitia</strong> dan tetapkan jobdesk terlebih dahulu sebelum dokumen dapat dibuat.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Notice for Single Panitia Mode */}
                        {isSinglePanitia && (
                          <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3.5 rounded-2xl flex items-center justify-between gap-3 font-medium">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>⚡ <strong>Mode Panitia Tunggal Detected:</strong> Kegiatan ini ditangani oleh Ketua Panitia (<strong>{ketuaPanitiaItem?.memberName}</strong>). Seluruh pengerjaan draf dokumen otomatis dialokasikan langsung.</span>
                            </div>
                            <span className="bg-amber-200 text-amber-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400">Pengerjaan Langsung</span>
                          </div>
                        )}

                        {/* Document List / Tabs Bar */}
                        {currentDocs.length === 0 ? (
                          <div className="bg-slate-50 border border-dashed border-slate-300 p-8 rounded-3xl text-center space-y-3">
                            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-700 text-sm">Belum Ada Dokumen Administrasi yang Dibuat</h4>
                              <p className="text-slate-500 text-xs max-w-md mx-auto">
                                Klik salah satu tombol di atas untuk membuat <strong>SK Panitia, Surat Tugas, Surat Undangan</strong> (untuk Rapat/Acara), atau <strong>Dokumen Kustom</strong>.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Document Tabs */}
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
                              {currentDocs.map((doc) => {
                                const isSel = activeDoc?.id === doc.id;
                                return (
                                  <button
                                    key={doc.id}
                                    onClick={() => setSelectedDocId(doc.id)}
                                    className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                                      isSel 
                                        ? 'bg-dwp-burgundy text-white shadow-md' 
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    <span>
                                      {doc.documentType === 'sk_panitia' ? '📜 SK Panitia' :
                                       doc.documentType === 'surat_tugas' ? '📑 Surat Tugas' :
                                       doc.documentType === 'surat_undangan' ? '✉️ Surat Undangan' :
                                       `📄 ${doc.customTitle}`}
                                    </span>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                      doc.status === 'approved_published' ? 'bg-emerald-400 text-emerald-950' :
                                      doc.status === 'pending_sekretaris_verification' ? 'bg-amber-300 text-amber-950' :
                                      doc.status === 'pending_waket_verification' ? 'bg-sky-300 text-sky-950' :
                                      doc.status === 'pending_ketua_approval' ? 'bg-purple-300 text-purple-950' :
                                      'bg-slate-200 text-slate-800'
                                    }`}>
                                      {doc.status.replace('_', ' ')}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Active Document Workspace */}
                            {activeDoc && (
                              <div className="grid lg:grid-cols-12 gap-6 items-start">
                                {/* Left Side: Workflow & Editor Form */}
                                <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                  {/* Status & Approval Bar */}
                                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-800">Status & Tahap Approval Dokumen:</span>
                                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                                        activeDoc.status === 'approved_published' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' :
                                        activeDoc.status === 'pending_sekretaris_verification' ? 'bg-amber-100 border-amber-300 text-amber-900' :
                                        activeDoc.status === 'pending_waket_verification' ? 'bg-sky-100 border-sky-300 text-sky-900' :
                                        activeDoc.status === 'pending_ketua_approval' ? 'bg-purple-100 border-purple-300 text-purple-900' :
                                        'bg-slate-200 border-slate-300 text-slate-800'
                                      }`}>
                                        {activeDoc.status === 'draft' ? '📝 Draf Panitia' :
                                         activeDoc.status === 'pending_sekretaris_verification' ? '⏳ Menunggu Penomoran Sekretaris DWP' :
                                         activeDoc.status === 'pending_waket_verification' ? '🛡️ Menunggu Verifikasi Wakil Ketua' :
                                         activeDoc.status === 'pending_ketua_approval' ? '👑 Menunggu Pengesahan Ketua DWP' :
                                         '✅ TERBIT RESMI (Digital Signed)'}
                                      </span>
                                    </div>

                                    {/* Action Buttons for Document Stage */}
                                    <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-200">
                                      {/* Submit to Sekretaris DWP */}
                                      {(activeDoc.status === 'draft' || activeDoc.status === 'revision_requested') && (
                                        <button
                                          onClick={() => {
                                            advanceDocumentApproval(activeDoc.id, 'pending_sekretaris_verification', 'Draf dokumen diserahkan ke Sekretaris DWP untuk penomoran resmi.');
                                            alert('✅ Draf dokumen berhasil dikirimkan ke Sekretaris DWP untuk penomoran resmi!');
                                          }}
                                          className="bg-sky-700 hover:bg-sky-800 text-white font-bold px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all text-xs cursor-pointer"
                                        >
                                          <Send className="w-3.5 h-3.5" />
                                          <span>Kirim Draf ke Sekretaris DWP</span>
                                        </button>
                                      )}

                                      {/* Sekretaris DWP Action */}
                                      {activeDoc.status === 'pending_sekretaris_verification' && (currentRole === 'sekretaris' || currentRole === 'admin_master') && (
                                        <button
                                          onClick={() => {
                                            const num = prompt('Masukkan Nomor Surat Resmi DWP:', activeDoc.letterNumber || `001/SK/DWP-GTK/MALUT/VIII/${new Date().getFullYear()}`);
                                            if (!num) return;
                                            advanceDocumentApproval(activeDoc.id, 'pending_waket_verification', `Nomor Surat Resmi ${num} diterbitkan oleh Sekretaris DWP.`, num);
                                            alert(`🛡️ Nomor Surat Resmi "${num}" berhasil dibubuhkan! Diteruskan ke Wakil Ketua DWP.`);
                                          }}
                                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all text-xs cursor-pointer"
                                        >
                                          <ShieldCheck className="w-3.5 h-3.5" />
                                          <span>Bubuhkan Nomor Surat & Teruskan ke Wakil Ketua</span>
                                        </button>
                                      )}

                                      {/* Wakil Ketua Action */}
                                      {activeDoc.status === 'pending_waket_verification' && (currentRole === 'wakil_ketua' || currentRole === 'admin_master') && (
                                        <button
                                          onClick={() => {
                                            const notes = prompt('Catatan Verifikasi Wakil Ketua (Opsional):', 'Dokumen terverifikasi layak dan sesuai format.');
                                            if (notes === null) return;
                                            advanceDocumentApproval(activeDoc.id, 'pending_ketua_approval', notes);
                                            alert('🛡️ Dokumen terverifikasi oleh Wakil Ketua DWP! Diteruskan ke Ketua DWP untuk pengesahan akhir.');
                                          }}
                                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all text-xs cursor-pointer"
                                        >
                                          <ShieldCheck className="w-3.5 h-3.5" />
                                          <span>Verifikasi Kelayakan (Wakil Ketua)</span>
                                        </button>
                                      )}

                                      {/* Ketua DWP Approval */}
                                      {activeDoc.status === 'pending_ketua_approval' && (currentRole === 'ketua' || currentRole === 'admin_master') && (
                                        <button
                                          onClick={() => {
                                            advanceDocumentApproval(activeDoc.id, 'approved_published', 'Disahkan dan ditandatangani secara resmi oleh Ketua DWP GTK Maluku Utara.');
                                            alert('👑 Dokumen Berhasil Disahkan Resmi oleh Ketua DWP! Dokumen siap dicetak / diunduh PDF.');
                                          }}
                                          className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold px-4 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all text-xs cursor-pointer"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5 text-dwp-gold" />
                                          <span>Sah & Tanda Tangan Resmi (Ketua DWP)</span>
                                        </button>
                                      )}

                                      <button
                                        onClick={() => {
                                          if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
                                            deleteActivityDocument(activeDoc.id);
                                          }
                                        }}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-xl border border-rose-200 text-xs flex items-center gap-1 ml-auto cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                                      </button>
                                    </div>
                                  </div>

                                  {/* Editor Form */}
                                  <div className="space-y-3 font-sans">
                                    <div className="font-bold text-slate-800 text-xs flex items-center justify-between border-b border-slate-100 pb-2">
                                      <span>Redaksi & Parameter Dokumen:</span>
                                      <span className="text-[10px] text-slate-400">Auto-Prefilled dari Usulan</span>
                                    </div>

                                    <div>
                                      <label className="font-bold text-slate-700 block mb-1">Nomor Surat Resmi DWP</label>
                                      <input
                                        type="text"
                                        value={activeDoc.letterNumber || ''}
                                        onChange={(e) => {
                                          createOrUpdateActivityDocument({
                                            ...activeDoc,
                                            letterNumber: e.target.value
                                          });
                                        }}
                                        placeholder="001/SK/DWP-GTK/MALUT/VIII/2026"
                                        className="w-full p-2 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="font-bold text-slate-700 block mb-1">Kota Penerbitan</label>
                                        <input
                                          type="text"
                                          value={activeDoc.contentData.locationCity || 'Tidore Kepulauan'}
                                          onChange={(e) => {
                                            createOrUpdateActivityDocument({
                                              ...activeDoc,
                                              contentData: { ...activeDoc.contentData, locationCity: e.target.value }
                                            });
                                          }}
                                          className="w-full p-2 border border-slate-300 rounded-xl text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="font-bold text-slate-700 block mb-1">Tanggal Surat</label>
                                        <input
                                          type="text"
                                          value={activeDoc.contentData.letterDate || ''}
                                          onChange={(e) => {
                                            createOrUpdateActivityDocument({
                                              ...activeDoc,
                                              contentData: { ...activeDoc.contentData, letterDate: e.target.value }
                                            });
                                          }}
                                          className="w-full p-2 border border-slate-300 rounded-xl text-xs"
                                        />
                                      </div>
                                    </div>

                                    {activeDoc.documentType === 'surat_undangan' && (
                                      <div>
                                        <label className="font-bold text-slate-700 block mb-1">Penerima Undangan</label>
                                        <input
                                          type="text"
                                          value={activeDoc.contentData.penerima || ''}
                                          onChange={(e) => {
                                            createOrUpdateActivityDocument({
                                              ...activeDoc,
                                              contentData: { ...activeDoc.contentData, penerima: e.target.value }
                                            });
                                          }}
                                          placeholder="Pengurus & Anggota DWP GTK Maluku Utara"
                                          className="w-full p-2 border border-slate-300 rounded-xl text-xs"
                                        />
                                      </div>
                                    )}

                                    {activeDoc.documentType === 'surat_tugas' && (
                                      <div>
                                        <label className="font-bold text-slate-700 block mb-1">Maksud Penugasan</label>
                                        <textarea
                                          rows={2}
                                          value={activeDoc.contentData.maksudTugas || ''}
                                          onChange={(e) => {
                                            createOrUpdateActivityDocument({
                                              ...activeDoc,
                                              contentData: { ...activeDoc.contentData, maksudTugas: e.target.value }
                                            });
                                          }}
                                          className="w-full p-2 border border-slate-300 rounded-xl text-xs"
                                        />
                                      </div>
                                    )}

                                    {activeDoc.documentType === 'custom' && (
                                      <div>
                                        <label className="font-bold text-slate-700 block mb-1">Isi Dokumen Kustom</label>
                                        <textarea
                                          rows={5}
                                          value={activeDoc.contentData.bodyText || ''}
                                          onChange={(e) => {
                                            createOrUpdateActivityDocument({
                                              ...activeDoc,
                                              contentData: { ...activeDoc.contentData, bodyText: e.target.value }
                                            });
                                          }}
                                          className="w-full p-2 border border-slate-300 rounded-xl text-xs font-serif leading-relaxed"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Right Side: Render Kop Surat Official Paper View (Print Ready) */}
                                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-300 shadow-md space-y-4">
                                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                    <span className="font-serif font-bold text-slate-900 text-sm">
                                      📜 Tampilan Resmi Kop DWP & Hasil Cetak
                                    </span>
                                    <button
                                      onClick={() => window.print()}
                                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
                                    >
                                      🖨️ Cetak Dokumen / PDF
                                    </button>
                                  </div>

                                  {/* Simulated Printable Paper */}
                                  <div className="bg-white p-6 rounded-xl border border-slate-300 font-serif text-[11px] text-slate-900 leading-normal space-y-4 shadow-sm">
                                    {/* Kop Surat Header */}
                                     <div 
                                        style={{ 
                                          paddingBottom: `${kopSuratConfig.bottomLineSpacing ?? 12}px`,
                                          borderBottomWidth: `${kopSuratConfig.borderWidth ?? 3.5}px`
                                        }}
                                        className={`flex items-center gap-3 ${
                                          (kopSuratConfig.borderStyle || 'single_thick') === 'double'
                                            ? 'border-b-double border-slate-900'
                                            : 'border-b-solid border-slate-900'
                                        }`}
                                      >
                                      <img
                                        src={kopSuratConfig.logoUrl}
                                        alt="Logo DWP"
                                        style={{
                                          width: `${kopSuratConfig.logoSize || 56}px`,
                                          height: `${kopSuratConfig.logoSize || 56}px`
                                        }}
                                        className="object-contain shrink-0"
                                      />
                                      <div 
                                        style={{ gap: `${kopSuratConfig.headerLineSpacing ?? 2}px` }}
                                        className="text-center flex-1 flex flex-col justify-center text-slate-900"
                                      >
                                        <h4 
                                          style={{ fontSize: `${kopSuratConfig.headerLine1FontSize || 14}px` }}
                                          className="font-bold uppercase tracking-wide"
                                        >
                                          {kopSuratConfig.headerLine1}
                                        </h4>
                                        <h5 
                                          style={{ fontSize: `${kopSuratConfig.headerLine2FontSize || 11}px` }}
                                          className="font-bold uppercase tracking-wide"
                                        >
                                          {kopSuratConfig.headerLine2}
                                        </h5>
                                        <h6 
                                          style={{ fontSize: `${kopSuratConfig.headerLine3FontSize || 10}px` }}
                                          className="font-semibold uppercase tracking-wide"
                                        >
                                          {kopSuratConfig.headerLine3}
                                        </h6>
                                        <p 
                                          style={{ fontSize: `${kopSuratConfig.addressFontSize || 9}px` }}
                                          className="font-sans text-slate-600 leading-tight"
                                        >
                                          {kopSuratConfig.address}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Document Title & Number */}
                                    <div className="text-center space-y-1 py-2">
                                      <h3 className="font-bold text-xs underline uppercase tracking-wider">
                                        {activeDoc.documentType === 'sk_panitia' ? 'SURAT KEPUTUSAN KETUA DHARMA WANITA PERSATUAN' :
                                         activeDoc.documentType === 'surat_tugas' ? 'SURAT TUGAS PANITIA PELAKSANA' :
                                         activeDoc.documentType === 'surat_undangan' ? 'SURAT UNDANGAN OFFICIAL' :
                                         (activeDoc.customTitle || 'DOKUMEN ORGANISASI').toUpperCase()}
                                      </h3>
                                      <p className="font-mono text-[10px] text-slate-700">
                                        Nomor: {activeDoc.letterNumber || '.../DWP-GTK/MALUT/2026'}
                                      </p>
                                      {activeDoc.documentType === 'sk_panitia' && (
                                        <p className="text-[10px] font-bold italic pt-1">
                                          TENTANG PENETAPAN SUSUNAN PANITIA PELAKSANA {detailProposal.title.toUpperCase()}
                                        </p>
                                      )}
                                    </div>

                                    {/* Document Body Content */}
                                    <div className="space-y-3 text-[10.5px]">
                                      {activeDoc.documentType === 'sk_panitia' && (
                                        <>
                                          <div className="space-y-1">
                                            <span className="font-bold block">Menimbang:</span>
                                            <ul className="list-disc pl-5 space-y-0.5">
                                              {activeDoc.contentData.menimbang?.map((m, idx) => (
                                                <li key={idx}>{m}</li>
                                              ))}
                                            </ul>
                                          </div>

                                          <div className="space-y-1">
                                            <span className="font-bold block">Mengingat:</span>
                                            <ul className="list-disc pl-5 space-y-0.5">
                                              {activeDoc.contentData.mengingat?.map((m, idx) => (
                                                <li key={idx}>{m}</li>
                                              ))}
                                            </ul>
                                          </div>

                                          <div className="space-y-1 pt-1">
                                            <span className="font-bold block text-center uppercase tracking-wider">MEMUTUSKAN:</span>
                                            <span className="font-bold block">Menetapkan:</span>
                                            <ul className="list-decimal pl-5 space-y-1">
                                              {activeDoc.contentData.diktum?.map((d, idx) => (
                                                <li key={idx}>{d}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        </>
                                      )}

                                      {activeDoc.documentType === 'surat_tugas' && (
                                        <div className="space-y-2">
                                          <p>Yang bertanda tangan di bawah ini Ketua Dharma Wanita Persatuan GTK Provinsi Maluku Utara menugaskan kepada:</p>
                                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-[10px]">
                                            {commMembers.map((c, idx) => (
                                              <div key={idx} className="flex justify-between border-b border-slate-200 last:border-0 pb-1 font-sans">
                                                <span><strong>{c.memberName}</strong> ({c.roleTitle})</span>
                                                <span className="text-slate-500">{c.phone || '-'}</span>
                                              </div>
                                            ))}
                                          </div>
                                          <p><strong>Maksud Penugasan:</strong> {activeDoc.contentData.maksudTugas}</p>
                                        </div>
                                      )}

                                      {activeDoc.documentType === 'surat_undangan' && (
                                        <div className="space-y-2">
                                          <p>Kepada Yth.<br /><strong>{activeDoc.contentData.penerima}</strong><br />di Tempat</p>
                                          <p>{activeDoc.contentData.bodyText}</p>
                                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] space-y-1 font-sans">
                                            <div><strong>Kegiatan:</strong> {detailProposal.title}</div>
                                            <div><strong>Waktu:</strong> {detailProposal.startDate} s.d {detailProposal.endDate}</div>
                                            <div><strong>Lokasi:</strong> {detailProposal.location}</div>
                                          </div>
                                        </div>
                                      )}

                                      {activeDoc.documentType === 'custom' && (
                                        <p className="whitespace-pre-line leading-relaxed">{activeDoc.contentData.bodyText}</p>
                                      )}
                                    </div>

                                    {/* Committee Attachment Table if SK */}
                                    {activeDoc.documentType === 'sk_panitia' && commMembers.length > 0 && (
                                      <div className="pt-2 space-y-1">
                                        <span className="font-bold block text-[10px]">Lampiran Susunan Panitia Pelaksana:</span>
                                        <table className="w-full border-collapse border border-slate-300 text-[9.5px] font-sans">
                                          <thead>
                                            <tr className="bg-slate-100">
                                              <th className="border border-slate-300 p-1 text-left">No</th>
                                              <th className="border border-slate-300 p-1 text-left">Nama Panitia</th>
                                              <th className="border border-slate-300 p-1 text-left">Jabatan Panitia</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {commMembers.map((c, idx) => (
                                              <tr key={c.id}>
                                                <td className="border border-slate-300 p-1">{idx + 1}</td>
                                                <td className="border border-slate-300 p-1 font-bold">{c.memberName}</td>
                                                <td className="border border-slate-300 p-1">{c.roleTitle}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}

                                    {/* Signatures Block */}
                                    <div className="pt-4 flex justify-end font-sans">
                                      <div className="text-center space-y-1">
                                        <p className="text-[10px]">
                                          {activeDoc.contentData.locationCity || 'Tidore Kepulauan'}, {activeDoc.contentData.letterDate || '2 Agustus 2026'}
                                        </p>
                                        <p className="font-bold text-[10.5px] text-dwp-burgundy">
                                          Ketua Dharma Wanita Persatuan<br />GTK Provinsi Maluku Utara
                                        </p>
                                        <div className="h-12 flex items-center justify-center">
                                          {activeDoc.status === 'approved_published' ? (
                                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold text-[9px] px-3 py-1 rounded-full shadow flex items-center gap-1">
                                              👑 TANDA TANGAN DIGITAL KETUA DWP
                                            </span>
                                          ) : (
                                            <span className="text-[9px] text-slate-400 italic font-mono">[ Draf Menunggu Pengesahan ]</span>
                                          )}
                                        </div>
                                        <p className="font-bold underline text-[11px]">
                                          {activeDoc.contentData.signedByKetuaName || 'Ny. Hajjah Nurjanah S.Pd'}
                                        </p>
                                        <p className="text-[9px] text-slate-600 font-mono">
                                          NIP. {activeDoc.contentData.signedByKetuaNip || '19780512 200501 2 003'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 4: ABSENSI DIGITAL */}
              {activeTabWorkspace === 'absensi' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>Presensi Online & QR Code Absensi:</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        🟢 Sistem Absensi Ready
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-24 h-24 bg-slate-900 text-dwp-gold p-2 rounded-xl flex items-center justify-center shrink-0">
                        <QrCode className="w-16 h-16 text-dwp-gold" />
                      </div>
                      <div className="space-y-2">
                        <div className="font-bold text-slate-900">Link Absensi Online Kegiatan:</div>
                        <div className="bg-slate-100 p-2 rounded-lg text-[11px] font-mono text-slate-700 flex items-center gap-2">
                          <Link className="w-3.5 h-3.5 text-dwp-burgundy shrink-0" />
                          <span>https://dwp-gtkmalut.org/absensi/{detailProposal.id}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Peserta dapat memindai QR Code di lokasi atau mengisi daftar hadir online melalui link resmi di atas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: LPJ & BERITA */}
              {activeTabWorkspace === 'lpj' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900">Laporan Pelaksanaan & Publikasi Berita Website:</div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <span className="font-bold text-slate-800 block">📊 Upload LPJ & RAB Akhir</span>
                        <p className="text-[10px] text-slate-500">Upload laporan pertanggungjawaban kegiatan & realisasi anggaran.</p>
                        <button className="bg-dwp-burgundy text-white text-[11px] font-bold px-3 py-2 rounded-lg w-full">
                          Upload Dokumen LPJ
                        </button>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <span className="font-bold text-slate-800 block">📰 Terbitkan Berita Kegiatan</span>
                        <p className="text-[10px] text-slate-500">Publikasikan dokumentasi & narasi berita ke Halaman Depan Website.</p>
                        <button className="bg-emerald-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg w-full">
                          Publish ke Berita Publik
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

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
                <label className="font-bold text-slate-700 block mb-1">Maksud & Tujuan Kegiatan *</label>
                <textarea
                  required
                  rows={2}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Jelaskan tujuan dan hasil yang ingin dicapai..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sasaran / Peserta *</label>
                  <input
                    type="text"
                    required
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="50 Orang Anggota"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                  />
                </div>

                <CustomDateInput
                  label="Tanggal Mulai *"
                  subLabel="(tgl/bln/thn)"
                  value={startDate}
                  onChange={(val) => setStartDate(val)}
                  required
                />

                <CustomDateInput
                  label="Tanggal Selesai *"
                  subLabel="(tgl/bln/thn)"
                  value={endDate}
                  onChange={(val) => setEndDate(val)}
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lokasi Pelaksanaan *</label>
                <input
                  type="text"
                  required
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
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
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
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Maksud & Tujuan Kegiatan *</label>
                <textarea
                  required
                  rows={2}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Jelaskan tujuan dan hasil yang ingin dicapai..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sasaran / Peserta *</label>
                  <input
                    type="text"
                    required
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="50 Orang Anggota"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                  />
                </div>

                <CustomDateInput
                  label="Tanggal Mulai *"
                  subLabel="(tgl/bln/thn)"
                  value={startDate}
                  onChange={(val) => setStartDate(val)}
                  required
                />

                <CustomDateInput
                  label="Tanggal Selesai *"
                  subLabel="(tgl/bln/thn)"
                  value={endDate}
                  onChange={(val) => setEndDate(val)}
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lokasi Pelaksanaan *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Aula Kantor GTK / Hotel Grand Dafam Ternate"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
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

      {/* Modal Tambah Anggota Panitia (Khusus Pengusul Kegiatan) */}
      {showAddCommitteeModal && detailProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddCommitteeMember}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-base">
                  Tambah Panitia Pelaksana
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kegiatan: <strong>{detailProposal.title}</strong>
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddCommitteeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jabatan / Posisi Panitia *</label>
                <select
                  value={committeeRoleTitle}
                  onChange={(e: any) => setCommitteeRoleTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-semibold text-slate-900 bg-white"
                >
                  <option value="Ketua Panitia">👤 Ketua Panitia</option>
                  <option value="Sekretaris Panitia">📜 Sekretaris Panitia</option>
                  <option value="Bendahara Panitia">💰 Bendahara Panitia</option>
                  <option value="Seksi Acara">🎤 Seksi Acara</option>
                  <option value="Seksi Humas & Logistik">📢 Seksi Humas & Logistik</option>
                  <option value="Anggota Panitia">👥 Anggota Panitia</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Anggota DWP *</label>
                <select
                  required
                  value={committeeMemberId}
                  onChange={(e) => setCommitteeMemberId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-semibold text-slate-900 bg-white"
                >
                  <option value="">-- Pilih Nama Anggota DWP --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.jabatan} - {m.unitKerja || 'GTK Malut'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAddCommitteeModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-dwp-gold" />
                <span>Simpan Panitia</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
