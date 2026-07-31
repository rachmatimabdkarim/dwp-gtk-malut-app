import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExecutionReport } from '../../types';
import { FileCheck, Printer, Globe, Edit3, CheckCircle2, Sparkles, Image as ImageIcon, Send, ArrowRight } from 'lucide-react';

export const ReportGeneratorModal: React.FC = () => {
  const { proposals, reports, createOrUpdateReport, approveReportAndPublishNews, attendanceRecords, activePersona } = useApp();

  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    proposals.length > 0 ? proposals[0].id : ''
  );

  const activeReport = reports.find(r => r.activityId === selectedActivityId);
  const activeProposal = proposals.find(p => p.id === selectedActivityId);
  const currentAttendance = attendanceRecords.filter(a => a.activityId === selectedActivityId);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [reportTitle, setReportTitle] = useState(
    activeReport?.reportTitle || `LAPORAN PELAKSANAAN KEGIATAN ${activeProposal?.title.toUpperCase()}`
  );
  const [background, setBackground] = useState(activeReport?.background || activeProposal?.background || '');
  const [executionSummary, setExecutionSummary] = useState(activeReport?.executionSummary || '');
  const [totalParticipants, setTotalParticipants] = useState(activeReport?.totalParticipants || currentAttendance.length || 50);
  const [actualBudget, setActualBudget] = useState(activeReport?.actualBudget || activeProposal?.estimatedBudget || 10000000);
  const [outcomeResults, setOutcomeResults] = useState(activeReport?.outcomeResults || '');
  const [photoUrl, setPhotoUrl] = useState(activeReport?.photoUrls[0] || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80');

  const [ketuaNotes, setKetuaNotes] = useState('');

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateReport({
      activityId: selectedActivityId,
      reportTitle,
      background,
      executionSummary,
      totalParticipants: Number(totalParticipants),
      actualBudget: Number(actualBudget),
      outcomeResults,
      photoUrls: [photoUrl],
      status: 'pending_ketua_review'
    });
    setIsEditing(false);
  };

  const handlePublishNews = () => {
    if (!activeReport) return;
    approveReportAndPublishNews(activeReport.id, ketuaNotes || 'Laporan telah disetujui & dipublikasikan ke Website Publik.');
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              Generator Naskah Laporan Pelaksanaan (LPJ) & Berita
            </h2>
            <span className="bg-dwp-burgundy text-dwp-gold text-xs font-bold px-3 py-0.5 rounded-full">
              DWP GTK Malut
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Form otomatis menyusun Naskah Laporan LPJ resmi lengkap dengan Lampiran Tanda Tangan Digital & Foto Kegiatan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-semibold px-4 py-2.5 rounded-2xl text-xs shadow flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4 text-dwp-gold" />
            <span>{isEditing ? 'Lihat Preview Dokumen' : 'Sunting Naskah Laporan'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs shadow flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-dwp-gold" />
            <span>Export / Cetak PDF Packet LPJ</span>
          </button>
        </div>
      </div>

      {/* Select Activity */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-4 text-xs font-semibold">
        <span className="text-slate-700">Pilih Kegiatan Untuk Menyusun Naskah LPJ:</span>
        <select
          value={selectedActivityId}
          onChange={(e) => {
            setSelectedActivityId(e.target.value);
            const foundRep = reports.find(r => r.activityId === e.target.value);
            const foundProp = proposals.find(p => p.id === e.target.value);
            if (foundRep) {
              setReportTitle(foundRep.reportTitle);
              setBackground(foundRep.background);
              setExecutionSummary(foundRep.executionSummary);
              setTotalParticipants(foundRep.totalParticipants);
              setActualBudget(foundRep.actualBudget);
              setOutcomeResults(foundRep.outcomeResults);
              setPhotoUrl(foundRep.photoUrls[0] || '');
            } else if (foundProp) {
              setReportTitle(`LAPORAN PELAKSANAAN KEGIATAN ${foundProp.title.toUpperCase()}`);
              setBackground(foundProp.background);
              setExecutionSummary('');
              setOutcomeResults('');
            }
          }}
          className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold text-slate-900 max-w-md"
        >
          {proposals.map(p => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Form Editor or Live Document Preview */}
      {isEditing ? (
        <form onSubmit={handleSaveReport} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-serif font-bold text-slate-900 text-lg">
              Form Input & Penyuntingan Naskah LPJ
            </h3>
            <span className="text-dwp-burgundy font-bold">Kop Surat Resmi DWP GTK Maluku Utara</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Judul Laporan Resmi *</label>
              <input
                type="text"
                required
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jumlah Peserta Hadir (Orang)</label>
                <input
                  type="number"
                  value={totalParticipants}
                  onChange={(e) => setTotalParticipants(Number(e.target.value))}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Realisasi Anggaran Total Rp</label>
                <input
                  type="number"
                  value={actualBudget}
                  onChange={(e) => setActualBudget(Number(e.target.value))}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Pendahuluan & Latar Belakang</label>
              <textarea
                rows={3}
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Uraian Pelaksanaan Kegiatan *</label>
              <textarea
                required
                rows={4}
                value={executionSummary}
                onChange={(e) => setExecutionSummary(e.target.value)}
                placeholder="Tuliskan jalannya kegiatan secara rinci..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Hasil, Capaian & Rekomendasi</label>
              <textarea
                rows={3}
                value={outcomeResults}
                onChange={(e) => setOutcomeResults(e.target.value)}
                placeholder="Capaian kegiatan dan tindak lanjut..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">URL Foto Utama Dokumentasi Kegiatan</label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold px-6 py-3 rounded-xl shadow"
            >
              Simpan Naskah LPJ & Ajukan ke Ketua
            </button>
          </div>
        </form>
      ) : (
        /* Printable LPJ Formal Document View */
        <div id="printable-area" className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm space-y-8">
          
          {/* Formal Kop Surat DWP Maluku Utara */}
          <div className="border-b-4 border-double border-slate-900 pb-4 text-center space-y-1">
            <div className="font-serif font-extrabold text-slate-900 text-lg md:text-xl tracking-wide uppercase">
              DHARMA WANITA PERSATUAN
            </div>
            <div className="font-serif font-bold text-dwp-burgundy text-sm md:text-base">
              KANTOR BALAI GURU PENGGERAK / GTK PROVINSI MALUKU UTARA
            </div>
            <div className="text-[11px] text-slate-600 font-sans">
              Jl. Sultan Babullah No. 45, Ternate — Email: dwp.gtk@malut.kemdikbud.go.id
            </div>
          </div>

          {/* Document Header */}
          <div className="text-center space-y-2">
            <h3 className="font-serif font-bold text-slate-900 text-base md:text-lg uppercase text-decoration underline">
              {reportTitle}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Nomor: {activeReport ? `LPJ/${activeReport.id.toUpperCase()}/DWP-GTK/2026` : 'DRAF/LPJ/DWP-GTK/2026'}
            </p>
          </div>

          {/* Section 1: Data Kegiatan */}
          <div className="space-y-2 text-xs text-slate-800">
            <h4 className="font-serif font-bold text-sm text-dwp-burgundy uppercase border-b border-slate-200 pb-1">
              I. DATA KEGIATAN
            </h4>
            <div className="grid sm:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium">
              <div><span className="font-bold text-slate-900">Nama Kegiatan:</span> {activeProposal?.title}</div>
              <div><span className="font-bold text-slate-900">Bidang Penyelenggara:</span> {activeProposal?.bidang}</div>
              <div><span className="font-bold text-slate-900">Waktu & Lokasi:</span> {activeProposal?.startDate} | {activeProposal?.location}</div>
              <div><span className="font-bold text-slate-900">Jumlah Peserta Hadir:</span> {totalParticipants} Orang</div>
              <div><span className="font-bold text-slate-900">Realisasi Anggaran:</span> Rp {actualBudget.toLocaleString('id-ID')}</div>
            </div>
          </div>

          {/* Section 2: Uraian Pelaksanaan */}
          <div className="space-y-2 text-xs text-slate-800">
            <h4 className="font-serif font-bold text-sm text-dwp-burgundy uppercase border-b border-slate-200 pb-1">
              II. URAIAN PELAKSANAAN
            </h4>
            <div className="text-slate-700 leading-relaxed whitespace-pre-line font-sans">
              {executionSummary || activeProposal?.background || 'Uraian belum diisi.'}
            </div>
          </div>

          {/* Section 3: Hasil & Capaian */}
          <div className="space-y-2 text-xs text-slate-800">
            <h4 className="font-serif font-bold text-sm text-dwp-burgundy uppercase border-b border-slate-200 pb-1">
              III. HASIL & CAPAIAN KEGIATAN
            </h4>
            <div className="text-slate-700 leading-relaxed whitespace-pre-line font-sans">
              {outcomeResults || 'Capaian kegiatan telah sesuai dengan target dan sasaran yang ditetapkan.'}
            </div>
          </div>

          {/* Section 4: Foto Dokumentasi */}
          <div className="space-y-3 text-xs text-slate-800">
            <h4 className="font-serif font-bold text-sm text-dwp-burgundy uppercase border-b border-slate-200 pb-1">
              IV. FOTO DOKUMENTASI KEGIATAN
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-100">
                <img src={photoUrl} alt="Dokumentasi 1" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-100">
                <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80" alt="Dokumentasi 2" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Section 5: Lampiran Dokumen Daftar Hadir Ber-Tanda Tangan Digital */}
          <div className="space-y-3 text-xs text-slate-800 pt-4 border-t-2 border-dashed border-slate-300">
            <h4 className="font-serif font-bold text-sm text-dwp-burgundy uppercase border-b border-slate-200 pb-1">
              LAMPIRAN: DOKUMEN DAFTAR HADIR PESERTA & TANDA TANGAN DIGITAL
            </h4>

            {currentAttendance.length === 0 ? (
              <p className="text-slate-400 italic">Belum ada presensi digital terekam untuk lampiran ini.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-300">
                    <th className="p-2 border border-slate-300 text-center w-8">No</th>
                    <th className="p-2 border border-slate-300">Nama Peserta</th>
                    <th className="p-2 border border-slate-300">Jabatan</th>
                    <th className="p-2 border border-slate-300 text-center">Waktu Presensi</th>
                    <th className="p-2 border border-slate-300 text-center w-28">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAttendance.map((rec, i) => (
                    <tr key={rec.id} className="border-b border-slate-200 font-medium">
                      <td className="p-2 border border-slate-300 text-center font-bold">{i + 1}</td>
                      <td className="p-2 border border-slate-300 font-bold text-slate-900">{rec.participantName}</td>
                      <td className="p-2 border border-slate-300">{rec.jabatan}</td>
                      <td className="p-2 border border-slate-300 text-center text-[10px]">{rec.checkInTime}</td>
                      <td className="p-2 border border-slate-300 text-center">
                        {rec.signatureUrl && (
                          <img src={rec.signatureUrl} alt="Signature" className="h-7 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Document Formal Sign-off */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-bold text-slate-900 mt-1">Ketua DWP Kantor GTK Prov. Maluku Utara</p>
              <div className="h-16" />
              <p className="font-bold text-slate-900 border-b border-slate-400 inline-block px-6">
                Ny. Hj. Rahmiati Ahmad, M.Pd
              </p>
            </div>

            <div>
              <p className="text-slate-500">Ternate, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-slate-900 mt-1">Sekretaris / Pengurus Penanggung Jawab</p>
              <div className="h-16" />
              <p className="font-bold text-slate-900 border-b border-slate-400 inline-block px-6">
                Ny. Dr. Nurul Hidayah, M.Si
              </p>
            </div>
          </div>

          {/* Action to Publish to Public Website News */}
          <div className="no-print pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-dwp-cream p-4 rounded-2xl border border-dwp-gold/40">
            <div className="space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Globe className="w-4 h-4 text-dwp-burgundy" />
                Publikasi Menjadi Berita Web Publik DWP
              </span>
              <p className="text-[11px] text-slate-600">
                Setelah disetujui Ketua, naskah laporan & foto otomatis tampil di halaman Warta Berita Website Publik.
              </p>
            </div>

            <button
              onClick={handlePublishNews}
              className="bg-gradient-to-r from-dwp-burgundy to-dwp-darkBurgundy text-white hover:brightness-110 px-5 py-3 rounded-xl font-bold text-xs shadow-md border border-dwp-gold/40 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-dwp-gold" />
              <span>Review Ketua & Publish Ke Web Publik</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
