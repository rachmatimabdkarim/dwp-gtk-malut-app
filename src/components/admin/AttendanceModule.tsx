import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PenTool, CheckCircle2, RotateCcw, User, ShieldCheck, Printer, FileCheck } from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const { proposals, members, attendanceRecords, addAttendanceRecord, verifyAttendanceRecord, activePersona } = useApp();

  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    proposals.length > 0 ? proposals[0].id : ''
  );

  // Form state
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [participantName, setParticipantName] = useState<string>('');
  const [nip, setNip] = useState<string>('');
  const [jabatan, setJabatan] = useState<string>('Anggota DWP GTK');
  const [phone, setPhone] = useState<string>('');
  
  // HTML5 Canvas for Digital Signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    if (selectedMemberId) {
      const found = members.find(m => m.id === selectedMemberId);
      if (found) {
        setParticipantName(found.name);
        setNip(found.nip || '');
        setJabatan(found.jabatan);
        setPhone(found.phone);
      }
    }
  }, [selectedMemberId, members]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName || !selectedActivityId) return;

    const canvas = canvasRef.current;
    let signatureUrl = '';
    if (canvas && hasSigned) {
      signatureUrl = canvas.toDataURL('image/png');
    } else {
      // Default fallback mock signature
      signatureUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M 20 40 Q 60 10 100 50 T 180 30" stroke="%230f172a" stroke-width="3" fill="none"/></svg>';
    }

    addAttendanceRecord({
      activityId: selectedActivityId,
      memberId: selectedMemberId,
      participantName,
      nip,
      jabatan,
      phone,
      checkInTime: new Date().toLocaleString('id-ID'),
      signatureUrl,
      verifiedBy: activePersona.name
    });

    // Reset Form
    setSelectedMemberId('');
    setParticipantName('');
    setNip('');
    setPhone('');
    clearCanvas();
  };

  const currentRecords = attendanceRecords.filter(r => r.activityId === selectedActivityId);
  const activeProposal = proposals.find(p => p.id === selectedActivityId);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              Absensi Digital & Tanda Tangan Online Peserta
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-0.5 rounded-full border border-emerald-300">
              Verifikasi Panitia
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Modul pengisian kehadiran dan tanda tangan kanvas digital langsung dari perangkat, otomatis membentuk dokumen daftar hadir.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs shadow flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-dwp-gold" />
          <span>Cetak Dokumen Daftar Hadir</span>
        </button>
      </div>

      {/* Select Activity & Form Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left: Input Form with Canvas */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-dwp-burgundy" />
            <h3 className="font-serif font-bold text-slate-900 text-lg">
              Form Presensi Peserta
            </h3>
          </div>

          <form onSubmit={handleSubmitAttendance} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pilih Kegiatan *</label>
              <select
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-semibold text-slate-900"
              >
                {proposals.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.startDate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Pilih Dari Data Anggota (Opsional)</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
              >
                <option value="">-- Manual / Tamu --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.jabatan})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Peserta *</label>
              <input
                type="text"
                required
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Contoh: Ny. Hj. Siti Aminah, S.Pd"
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">NIP (Jika Ada)</label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="19820315..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jabatan / Instansi</label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Pengurus DWP"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none"
                />
              </div>
            </div>

            {/* Signature Canvas Box */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-dwp-burgundy" />
                  <span>Bubuhkan Tanda Tangan Digital *</span>
                </label>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[11px] text-rose-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Bersihkan Kanvas
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden h-36 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair touch-none"
                />
                {!hasSigned && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-serif italic">
                    Goreskan tanda tangan Anda di sini (Mouse / Touchscreen)
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-dwp-gold" />
              <span>Simpan & Verifikasi Kehadiran</span>
            </button>
          </form>
        </div>

        {/* Right: Real-time Formatted Attendance Document Table */}
        <div id="printable-area" className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b-2 border-dwp-burgundy pb-4 text-center space-y-1">
            <h4 className="font-serif font-bold text-slate-900 text-base uppercase tracking-wider">
              DOKUMEN DAFTAR HADIR PESERTA KEGIATAN
            </h4>
            <p className="font-serif font-bold text-dwp-burgundy text-xs">
              DHARMA WANITA PERSATUAN - KANTOR GTK PROVINSI MALUKU UTARA
            </p>
            {activeProposal && (
              <div className="pt-2 text-xs font-medium text-slate-700 space-y-0.5">
                <p className="font-bold text-slate-900">{activeProposal.title}</p>
                <p>Hari/Tanggal: {activeProposal.startDate} | Tempat: {activeProposal.location}</p>
              </div>
            )}
          </div>

          {currentRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada peserta yang mengisi kehadiran untuk kegiatan ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2.5 border border-slate-200 text-center w-10">No</th>
                    <th className="p-2.5 border border-slate-200">Nama & NIP Peserta</th>
                    <th className="p-2.5 border border-slate-200">Jabatan</th>
                    <th className="p-2.5 border border-slate-200 text-center">Waktu</th>
                    <th className="p-2.5 border border-slate-200 text-center w-28">Tanda Tangan</th>
                    <th className="p-2.5 border border-slate-200 text-center no-print">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                  {currentRecords.map((rec, idx) => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="p-2.5 border border-slate-200 text-center font-bold">{idx + 1}</td>
                      <td className="p-2.5 border border-slate-200">
                        <div className="font-bold text-slate-900">{rec.participantName}</div>
                        {rec.nip && <div className="text-[10px] text-slate-500">NIP. {rec.nip}</div>}
                      </td>
                      <td className="p-2.5 border border-slate-200">{rec.jabatan}</td>
                      <td className="p-2.5 border border-slate-200 text-center text-[10px]">{rec.checkInTime}</td>
                      <td className="p-2.5 border border-slate-200 text-center">
                        {rec.signatureUrl && (
                          <img 
                            src={rec.signatureUrl} 
                            alt="Tanda Tangan" 
                            className="h-9 mx-auto object-contain max-w-[100px]" 
                          />
                        )}
                      </td>
                      <td className="p-2.5 border border-slate-200 text-center no-print">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Document Sign-off Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p className="text-slate-500">Mengetahui,</p>
                  <p className="font-bold text-slate-900 mt-1">Ketua Panitia Pelaksana</p>
                  <div className="h-16" />
                  <p className="font-bold text-slate-900 border-b border-slate-400 inline-block px-4">
                    Ny. Hj. Siti Aminah, S.Pd
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Ternate, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-bold text-slate-900 mt-1">Petugas Verifikasi Panitia</p>
                  <div className="h-16" />
                  <p className="font-bold text-slate-900 border-b border-slate-400 inline-block px-4">
                    {activePersona.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
