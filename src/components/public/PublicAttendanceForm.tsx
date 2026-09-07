import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { isUUID, ensureUUID, generateUUID } from '../../services/cloudSync';
import { formatDateRangeDDMMYYYY } from '../../utils/dateFormatter';
import { 
  CheckCircle2, 
  RotateCcw, 
  PenTool, 
  Calendar, 
  MapPin, 
  User, 
  Building, 
  Phone, 
  AlertCircle, 
  ArrowLeft, 
  ShieldCheck,
  Loader2
} from 'lucide-react';

interface PublicAttendanceFormProps {
  proposalId: string;
}

interface PublicActivity {
  id: string;
  title: string;
  bidang?: string;
  organizer?: string;
  location: string;
  startDate: string;
  endDate?: string;
}

export const PublicAttendanceForm: React.FC<PublicAttendanceFormProps> = ({ proposalId }) => {
  const { proposals, siteConfig, addAttendanceRecord } = useApp();

  // Loading & Data states
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [activity, setActivity] = useState<PublicActivity | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Form input states
  const [participantName, setParticipantName] = useState('');
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [phone, setPhone] = useState('');

  // Signature canvas states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    time: string;
    activityTitle: string;
  } | null>(null);

  // 1. Fetch activity identity from public view v_kegiatan_publik
  useEffect(() => {
    let isMounted = true;

    const fetchActivity = async () => {
      setIsLoadingActivity(true);
      setNotFound(false);
      setFormError(null);

      const trimmedId = (proposalId || '').trim();

      // Validasi: bila kosong atau bukan format UUID / legacy mock
      const isKnownId = isUUID(trimmedId) || ['prop-001', 'prop-002', 'prop-003', 'dwp-001', 'dwp-002', 'dwp-003'].includes(trimmedId);
      if (!trimmedId || !isKnownId) {
        if (isMounted) {
          setNotFound(true);
          setIsLoadingActivity(false);
        }
        return;
      }

      const targetUUID = isUUID(trimmedId) ? trimmedId : ensureUUID(trimmedId);

      try {
        // Query view publik v_kegiatan_publik (RLS anonim diizinkan)
        const { data, error } = await supabase
          .from('v_kegiatan_publik')
          .select('id, title, bidang, organizer, location, start_date, end_date')
          .eq('id', targetUUID)
          .maybeSingle();

        if (!isMounted) return;

        if (data && !error) {
          setActivity({
            id: data.id,
            title: data.title,
            bidang: data.bidang || 'Pendidikan',
            organizer: data.organizer || 'DWP GTK Maluku Utara',
            location: data.location || 'Kantor GTK Provinsi Maluku Utara',
            startDate: data.start_date || '',
            endDate: data.end_date || data.start_date || ''
          });
          setIsLoadingActivity(false);
          return;
        }

        // Fallback: periksa proposals lokal dari konteks (mode demo/offline)
        const localProposal = proposals.find(p => p.id === trimmedId || p.id === targetUUID);
        if (localProposal) {
          setActivity({
            id: localProposal.id,
            title: localProposal.title,
            bidang: localProposal.bidang,
            organizer: localProposal.organizer,
            location: localProposal.location,
            startDate: localProposal.startDate,
            endDate: localProposal.endDate || localProposal.startDate
          });
          setIsLoadingActivity(false);
          return;
        }

        // Jika tidak ditemukan di view publik maupun lokal
        setNotFound(true);
      } catch (err) {
        console.warn('Error fetching public activity:', err);
        // Fallback lokal jika terjadi network error
        const localProposal = proposals.find(p => p.id === trimmedId || p.id === targetUUID);
        if (localProposal && isMounted) {
          setActivity({
            id: localProposal.id,
            title: localProposal.title,
            bidang: localProposal.bidang,
            organizer: localProposal.organizer,
            location: localProposal.location,
            startDate: localProposal.startDate,
            endDate: localProposal.endDate || localProposal.startDate
          });
        } else if (isMounted) {
          setNotFound(true);
        }
      } finally {
        if (isMounted) {
          setIsLoadingActivity(false);
        }
      }
    };

    fetchActivity();

    return () => {
      isMounted = false;
    };
  }, [proposalId, proposals]);

  // Canvas drawing coordinate helper (supports responsive canvas sizing)
  const getCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.cancelable) {
      // Prevent scrolling while drawing on touchscreen
      e.preventDefault();
    }
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = '#0f172a'; // Navy/slate-900 pen
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setHasSigned(true);
    setFormError(null);
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

  // 2. Submit attendance handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!participantName.trim()) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }

    if (!hasSigned) {
      setFormError('Silakan bubuhkan tanda tangan digital Anda pada area kanvas sebelum mengirim.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || !activity) return;

    setIsSubmitting(true);

    try {
      const signatureDataUrl = canvas.toDataURL('image/png');

      // Timestamp lokal format: YYYY-MM-DD HH:mm
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const localCheckInTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const newRecordId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : generateUUID();
      const finalActivityId = ensureUUID(activity.id);

      const recordPayload = {
        id: newRecordId,
        activity_id: finalActivityId,
        participant_name: participantName.trim(),
        nip: nip.trim() || null,
        jabatan: jabatan.trim() || 'Peserta Kegiatan',
        phone: phone.trim() || null,
        check_in_time: localCheckInTime,
        signature_url: signatureDataUrl,
        status: 'unverified' as const
      };

      // 1. INSERT anonim ke tabel attendance_records (anon key, tanpa login)
      const { error: insertError } = await supabase
        .from('attendance_records')
        .insert([recordPayload]);

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw new Error(insertError.message || 'Gagal menyimpan data presensi ke server.');
      }

      // 2. Simpan juga ke AppContext lokal jika tersedia untuk sinkronisasi antarmuka
      addAttendanceRecord({
        id: newRecordId,
        activityId: finalActivityId,
        participantName: participantName.trim(),
        nip: nip.trim() || undefined,
        jabatan: jabatan.trim() || 'Peserta Kegiatan',
        phone: phone.trim() || '',
        checkInTime: localCheckInTime,
        signatureUrl: signatureDataUrl,
        status: 'unverified'
      });

      // Sukses
      setSubmittedData({
        name: participantName.trim(),
        time: localCheckInTime,
        activityTitle: activity.title
      });
    } catch (err: any) {
      setFormError(err?.message || 'Terjadi gangguan jaringan saat menyimpan daftar hadir. Silakan coba beberapa saat lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setParticipantName('');
    setNip('');
    setJabatan('');
    setPhone('');
    clearCanvas();
    setFormError(null);
    setSubmittedData(null);
  };

  const navigateToHome = () => {
    window.history.pushState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Header Brand Component
  const HeaderBrand = () => (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={navigateToHome}>
          {siteConfig.siteLogoUrl ? (
            <img src={siteConfig.siteLogoUrl} alt="Logo DWP" className="w-8 h-8 rounded-lg object-contain shadow-sm border border-dwp-gold/40 p-0.5 bg-white" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dwp-burgundy to-dwp-darkBurgundy p-1 shadow-sm border border-dwp-gold/40 flex items-center justify-center text-dwp-gold font-serif font-bold text-xs">
              DWP
            </div>
          )}
          <div>
            <h1 className="font-serif font-bold text-slate-900 text-sm leading-tight">
              {siteConfig.siteTitle || 'Dharma Wanita Persatuan'}
            </h1>
            <p className="text-[10px] text-dwp-burgundy font-semibold leading-none">
              {siteConfig.subTitle || 'Kantor GTK Provinsi Maluku Utara'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={navigateToHome}
          className="text-xs font-semibold text-slate-600 hover:text-dwp-burgundy flex items-center gap-1 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Beranda</span>
        </button>
      </div>
    </header>
  );

  // Render 1: Loading Screen
  if (isLoadingActivity) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <HeaderBrand />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-sm w-full space-y-4">
            <Loader2 className="w-10 h-10 text-dwp-burgundy animate-spin mx-auto" />
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">Memuat Data Kegiatan...</h3>
              <p className="text-xs text-slate-500 mt-1">Menghubungkan ke portal presensi DWP GTK Maluku Utara</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render 2: Activity Not Found / Invalid URL
  if (notFound || !activity) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <HeaderBrand />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm text-center max-w-md w-full space-y-5">
            <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-slate-900">
                Kegiatan Tidak Ditemukan / Link Tidak Valid
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tautan presensi yang Anda akses tidak terdaftar atau ID kegiatan tidak valid. Pastikan Anda memindai QR Code resmi yang disediakan oleh panitia pelaksana.
              </p>
            </div>
            <button
              onClick={navigateToHome}
              className="w-full bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-dwp-gold" />
              <span>Kembali ke Halaman Depan</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Render 3: Success Screen (After Submission)
  if (submittedData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <HeaderBrand />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-lg text-center max-w-lg w-full space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200 inline-block">
                Presensi Berhasil Dicatat
              </span>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                Terima Kasih, Kehadiran Tercatat!
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Daftar hadir Anda telah berhasil disimpan ke dalam sistem DWP GTK Maluku Utara dan menunggu verifikasi panitia.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Nama Peserta:</span>
                <span className="font-bold text-slate-900 text-right">{submittedData.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Kegiatan:</span>
                <span className="font-bold text-dwp-burgundy text-right max-w-[200px] truncate" title={submittedData.activityTitle}>
                  {submittedData.activityTitle}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Waktu Presensi:</span>
                <span className="font-mono font-bold text-slate-800 text-right">{submittedData.time} WIT</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 font-medium">Status Dokumen:</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  Menunggu Verifikasi Panitia
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 border border-slate-300"
              >
                <RotateCcw className="w-4 h-4 text-dwp-burgundy" />
                <span>Isi Presensi Peserta Lain</span>
              </button>
              <button
                type="button"
                onClick={navigateToHome}
                className="flex-1 bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-dwp-gold" />
                <span>Kembali ke Beranda</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render 4: Form Pengisian Presensi Digital
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <HeaderBrand />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Activity Identity Card */}
        <div className="bg-gradient-to-br from-dwp-burgundy via-dwp-darkBurgundy to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-dwp-gold/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-dwp-gold/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-dwp-gold text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {activity.bidang || 'Pendidikan'}
              </span>
              <span className="bg-white/10 text-dwp-lightGold text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-dwp-gold/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-dwp-gold" />
                <span>Portal Presensi Resmi</span>
              </span>
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug">
              {activity.title}
            </h2>

            <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-dwp-gold shrink-0" />
                <span>{formatDateRangeDDMMYYYY(activity.startDate, activity.endDate || activity.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-dwp-gold shrink-0" />
                <span className="truncate">{activity.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Presensi Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-serif font-bold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
              <PenTool className="w-5 h-5 text-dwp-burgundy" />
              <span>Formulir Daftar Hadir Peserta</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Mohon lengkapi identitas dan bubuhkan tanda tangan digital langsung pada kanvas di bawah ini.
            </p>
          </div>

          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium">{formError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Nama Lengkap */}
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                Nama Lengkap Peserta <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Contoh: Dra. Hj. Ratna Dewi, M.Pd"
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:border-dwp-burgundy focus:outline-none font-medium text-slate-900"
                />
              </div>
            </div>

            {/* NIP / NIK & Jabatan / Instansi */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  NIP / NIK <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Contoh: 198203152005012004"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:border-dwp-burgundy focus:outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Jabatan / Instansi <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    placeholder="Contoh: Guru / Anggota DWP"
                    className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:border-dwp-burgundy focus:outline-none text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* No. HP / WhatsApp */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">
                No. HP / WhatsApp <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:border-dwp-burgundy focus:outline-none text-slate-900"
                />
              </div>
            </div>

            {/* Signature Canvas */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-dwp-burgundy" />
                  <span>Tanda Tangan Digital <span className="text-rose-600">*</span></span>
                </label>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:underline p-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Hapus / Ulang</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 hover:border-dwp-burgundy/50 transition-colors rounded-2xl bg-slate-50/70 relative overflow-hidden h-44 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={176}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair touch-none bg-transparent"
                />

                {!hasSigned && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs font-serif italic gap-1 select-none">
                    <PenTool className="w-6 h-6 text-slate-300 animate-pulse" />
                    <span>Bubuhkan tanda tangan Anda di sini (Layar Sentuh / Mouse)</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 italic">
                * Gunakan jari pada layar ponsel/tablet atau gerakkan kursor mouse untuk menandatangani.
              </p>
            </div>

            {/* Tombol Kirim */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-dwp-burgundy hover:bg-dwp-darkBurgundy disabled:bg-slate-400 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-dwp-gold" />
                    <span>Menyimpan Daftar Hadir...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-dwp-gold" />
                    <span>Kirim Daftar Hadir Saya</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Public Notice Footer */}
        <div className="text-center text-[11px] text-slate-500 py-4">
          <p>© {new Date().getFullYear()} Dharma Wanita Persatuan — Kantor Guru dan Tenaga Kependidikan (GTK) Provinsi Maluku Utara</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Sistem Presensi Digital Terenkripsi & Terverifikasi Panitia</p>
        </div>

      </main>
    </div>
  );
};
