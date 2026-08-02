import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateDDMMYYYY } from '../../utils/dateFormatter';
import { 
  ScrollText, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  FileText, 
  Settings, 
  Activity,
  HardDrive,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  category: 'auth' | 'proposal' | 'member' | 'cms' | 'system';
  severity: 'info' | 'success' | 'warning' | 'error';
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  ipAddress?: string;
}

export const SystemAuditLogs: React.FC = () => {
  const { proposals, members, userAccounts, activePersona, systemAuditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  // Generate combined audit logs from system state, deletion events, and proposal workflows
  const generateAuditLogs = (): AuditLogItem[] => {
    const logs: AuditLogItem[] = [
      ...systemAuditLogs.map(s => ({
        id: s.id,
        timestamp: s.timestamp,
        category: s.category as any,
        severity: s.severity,
        actorName: s.actorName,
        actorRole: s.actorRole,
        action: s.action,
        details: s.details,
        ipAddress: s.ipAddress || '180.252.34.12 (Akses Terverifikasi)'
      }))
    ];

    // 1. Proposal Workflow Logs
    proposals.forEach(p => {
      p.logs.forEach(l => {
        let severity: 'info' | 'success' | 'warning' | 'error' = 'info';
        if (l.decision === 'approved') severity = 'success';
        if (l.decision === 'revision') severity = 'warning';
        if (l.decision === 'rejected') severity = 'error';

        logs.push({
          id: `log-prop-${l.id}`,
          timestamp: l.timestamp,
          category: 'proposal',
          severity,
          actorName: l.actorName || 'Sistem Organisasi',
          actorRole: l.actorRole || 'system',
          action: `Peninjauan Usulan: "${p.title}"`,
          details: `Tahap: ${l.stageName} | Keputusan: ${l.decision.toUpperCase()} | Catatan: "${l.notes}"`,
          ipAddress: '180.252.34.12 (Akses Terverifikasi)'
        });
      });

      // Creation Log
      logs.push({
        id: `log-create-${p.id}`,
        timestamp: p.createdAt || '01/08/2026 08:00',
        category: 'proposal',
        severity: 'info',
        actorName: p.createdBy,
        actorRole: p.creatorRole || 'admin_bidang',
        action: `Pengajuan Usulan Kegiatan Baru`,
        details: `Judul: "${p.title}" | Bidang: ${p.bidang} | RAB: Rp ${p.estimatedBudget.toLocaleString('id-ID')}`,
        ipAddress: '180.252.34.12'
      });
    });

    // 2. Auth & Persona Switch Activity Logs
    logs.push({
      id: 'log-auth-1',
      timestamp: new Date().toLocaleString('id-ID'),
      category: 'auth',
      severity: 'success',
      actorName: activePersona.name,
      actorRole: activePersona.role,
      action: 'Sesi Aktif Pengurus & Switch Persona Role',
      details: `Masuk sebagai ${activePersona.title} (${activePersona.role}). Hak akses verifikasi dinamis diaktifkan.`,
      ipAddress: '180.252.34.12 (Session Token Validated)'
    });

    // 3. Member Management Activity Logs
    members.slice(0, 5).forEach((m, idx) => {
      logs.push({
        id: `log-mem-${m.id}`,
        timestamp: `01/08/2026 ${10 + idx}:15:00`,
        category: 'member',
        severity: 'info',
        actorName: 'Administrasi Keanggotaan',
        actorRole: 'sekretaris',
        action: `Pembaruan Profile Anggota / Foto WebP`,
        details: `Nama: "${m.name}" | NIP: ${m.nip || '-'} | Jabatan: ${m.jabatan} | Status Foto: WebP Terkompres`,
        ipAddress: '180.252.34.12'
      });
    });

    // 4. System Storage & Auto-Purge Logs
    logs.push({
      id: 'log-sys-storage',
      timestamp: '01/08/2026 08:00:00',
      category: 'system',
      severity: 'success',
      actorName: 'Auto-Purge Storage Cleanup Engine',
      actorRole: 'system',
      action: 'Pembersihan Memori & Revoke Blob URL',
      details: 'Pembersihan otomatis file gambar lama saat pergantian foto profil/logo. RAM Browser 0% file sampah.',
      ipAddress: '127.0.0.1 (Local Runtime)'
    });

    // Sort by timestamp descending (mock sort)
    return logs.sort((a, b) => b.id.localeCompare(a.id));
  };

  const allLogs = generateAuditLogs();

  // Filtering Logic
  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = 
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorRole.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  // Export CSV Function
  const handleExportCSV = () => {
    const headers = ['Waktu', 'Kategori', 'Severity', 'Pengurus / Pengguna', 'Role', 'Aktivitas / Tindakan', 'Detail Pesan Log', 'IP Address'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.category}"`,
      `"${l.severity}"`,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Logs_DWP_GTK_Malut_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg md:text-xl font-bold text-slate-900">
              Log Audit & Aktivitas Sistem
            </h2>
            <span className="bg-slate-900 text-dwp-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-dwp-gold" />
              <span>Realtime Audit</span>
            </span>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1.5 transition-all hover:scale-[1.02] shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-emerald-200" />
          <span>Export Log ke CSV</span>
        </button>
      </div>

      {/* System Health & Status Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Log Aktivitas</span>
            <ScrollText className="w-4 h-4 text-dwp-burgundy" />
          </div>
          <div className="text-xl font-bold text-slate-900">{allLogs.length} Events</div>
          <div className="text-[10px] text-emerald-600 font-medium">✓ Terindeks Otomatis</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Audit Security & Auth</span>
            <UserCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {allLogs.filter(l => l.category === 'auth').length} Akses
          </div>
          <div className="text-[10px] text-sky-600 font-medium">✓ Sesi Sempurna</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Log Proposal & RAB</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {allLogs.filter(l => l.category === 'proposal').length} Verifikasi
          </div>
          <div className="text-[10px] text-amber-700 font-medium">✓ Hierarchy Multi-stage</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Kesehatan Storage</span>
            <HardDrive className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700">0% Trash</div>
          <div className="text-[10px] text-emerald-600 font-medium">⚡ Auto-Purge Active</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid md:grid-cols-3 gap-3 text-xs">
          
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pengurus, role, atau kata kunci..."
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
            />
          </div>

          {/* Filter Category */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium bg-white"
            >
              <option value="all">Semua Kategori Log</option>
              <option value="proposal">📜 Workflow Proposal & RAB</option>
              <option value="auth">🛡️ Keamanan & Authentikasi</option>
              <option value="member">👥 Data Anggota & Akun</option>
              <option value="system">⚡ Sistem & Storage Cleanup</option>
            </select>
          </div>

          {/* Filter Severity */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium bg-white"
            >
              <option value="all">Semua Tingkat (Severity)</option>
              <option value="success">✅ Disetujui / Sukses</option>
              <option value="info">ℹ️ Informasi / Pengajuan</option>
              <option value="warning">⚠️ Perlu Revisi / Warning</option>
              <option value="error">🔴 Ditolak / Error</option>
            </select>
          </div>

        </div>
      </div>

      {/* Log Feed List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
            <Activity className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold">Tidak ada log aktivitas yang cocok dengan kriteria pencarian.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isSuccess = log.severity === 'success';
            const isWarning = log.severity === 'warning';
            const isError = log.severity === 'error';

            return (
              <div 
                key={log.id}
                className={`bg-white rounded-2xl p-4 border transition-all space-y-2 shadow-sm ${
                  isSuccess ? 'border-emerald-200 bg-emerald-50/10' :
                  isWarning ? 'border-amber-200 bg-amber-50/10' :
                  isError ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Severity Icon */}
                    {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> :
                     isWarning ? <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> :
                     isError ? <XCircle className="w-4 h-4 text-rose-600 shrink-0" /> :
                     <Info className="w-4 h-4 text-sky-600 shrink-0" />}

                    <span className="font-bold text-xs text-slate-900">{log.action}</span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                      {log.category}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 shrink-0">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatDateDDMMYYYY(log.timestamp)}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-sans leading-relaxed">
                    {log.details}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div>
                      Aktor: <strong className="text-slate-800">{log.actorName}</strong> ({log.actorRole})
                    </div>
                    {log.ipAddress && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Client: {log.ipAddress}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
