import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { canEditCMSSection, CMSSection, getRoleDescription } from '../../utils/RoleAccessControl';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';
import { 
  Globe, 
  Save, 
  CheckCircle2, 
  Image as ImageIcon, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Sparkles, 
  Plus, 
  Trash2, 
  Tag, 
  Layers, 
  Link, 
  Info,
  UserCheck,
  Lock,
  ShieldCheck
} from 'lucide-react';

export const CMSCustomizer: React.FC = () => {
  const { currentRole, siteConfig, updateSiteConfig, setActiveTab, setAdminSubTab } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [siteTitle, setSiteTitle] = useState(siteConfig.siteTitle || 'Dharma Wanita Persatuan');
  const [subTitle, setSubTitle] = useState(siteConfig.subTitle || 'Kantor GTK Provinsi Maluku Utara');
  const [siteLogoUrl, setSiteLogoUrl] = useState(siteConfig.siteLogoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(siteConfig.faviconUrl || '');

  const [heroTitle, setHeroTitle] = useState(siteConfig.heroTitle);
  const [heroSubtext, setHeroSubtext] = useState(siteConfig.heroSubtext);
  const [heroCtaText, setHeroCtaText] = useState(siteConfig.heroCtaText || 'Jelajahi Warta Kegiatan');
  const [heroCtaAction, setHeroCtaAction] = useState(siteConfig.heroCtaAction || 'scroll_berita');
  const [heroCtaUrl, setHeroCtaUrl] = useState(siteConfig.heroCtaUrl || '');
  const [heroBannerUrl, setHeroBannerUrl] = useState(siteConfig.heroBannerUrl);
  const [heroOverlayOpacity, setHeroOverlayOpacity] = useState(siteConfig.heroOverlayOpacity ?? 50);
  const [heroOverlayStyle, setHeroOverlayStyle] = useState<'dark' | 'burgundy' | 'navy' | 'subtle'>(siteConfig.heroOverlayStyle || 'burgundy');

  const [sambutanTagText, setSambutanTagText] = useState(siteConfig.sambutanTagText || 'Kata Sambutan');
  const [sambutanQuote, setSambutanQuote] = useState(siteConfig.sambutanKetuaQuote || 'Bersama Membangun Kesejahteraan & Mendukung Pendidikan di Maluku Utara');
  const [sambutanText, setSambutanText] = useState(siteConfig.sambutanKetuaText);

  const [visiTagText, setVisiTagText] = useState(siteConfig.visiTagText || 'Landasan Organisasi');
  const [visiTitle, setVisiTitle] = useState(siteConfig.visiTitle || 'Visi & Misi DWP GTK Maluku Utara');
  const [visiSubtext, setVisiSubtext] = useState(siteConfig.visiSubtext || 'Pedoman arah langkah pengurus dan anggota dalam berkarya bagi kemajuan organisasi dan daerah.');
  const [visiText, setVisiText] = useState(siteConfig.visiText);
  const [misiList, setMisiList] = useState<string[]>(siteConfig.misiList || []);

  const [strukturTagText, setStrukturTagText] = useState(siteConfig.strukturTagText || 'Kepengurusan Resmi');
  const [strukturTitle, setStrukturTitle] = useState(siteConfig.strukturTitle || 'Struktur Organisasi DWP GTK Maluku Utara');
  const [strukturSubtext, setStrukturSubtext] = useState(siteConfig.strukturSubtext || 'Susunan Pengurus Inti dan Ketua Bidang Dharma Wanita Persatuan Kantor GTK Provinsi Maluku Utara.');

  const [beritaTagText, setBeritaTagText] = useState(siteConfig.beritaTagText || 'Warta & Publikasi');
  const [beritaTitle, setBeritaTitle] = useState(siteConfig.beritaTitle || 'Berita & Dokumentasi Kegiatan');
  const [beritaSubtext, setBeritaSubtext] = useState(siteConfig.beritaSubtext || 'Publikasi resmi hasil pelaksanaan kegiatan DWP GTK Provinsi Maluku Utara.');

  const [agendaTagText, setAgendaTagText] = useState(siteConfig.agendaTagText || 'Agenda Kegiatan & Absensi');
  const [agendaTitle, setAgendaTitle] = useState(siteConfig.agendaTitle || 'Jadwal Kegiatan & Portal Absensi Digital');
  const [agendaSubtext, setAgendaSubtext] = useState(siteConfig.agendaSubtext || 'Peserta yang menghadiri kegiatan dapat melakukan pengisian kehadiran dan tanda tangan digital secara langsung.');

  const [address, setAddress] = useState(siteConfig.address);
  const [phone, setPhone] = useState(siteConfig.phone);
  const [email, setEmail] = useState(siteConfig.email);
  const [facebook, setFacebook] = useState(siteConfig.facebook);
  const [instagram, setInstagram] = useState(siteConfig.instagram);
  const [youtube, setYoutube] = useState(siteConfig.youtube);
  const [footerDescription, setFooterDescription] = useState(siteConfig.footerDescription || '');
  const [copyrightText, setCopyrightText] = useState(siteConfig.copyrightText || '');

  // Sync state if siteConfig changes
  useEffect(() => {
    setSiteTitle(siteConfig.siteTitle || 'Dharma Wanita Persatuan');
    setSubTitle(siteConfig.subTitle || 'Kantor GTK Provinsi Maluku Utara');
    setSiteLogoUrl(siteConfig.siteLogoUrl || '');
    setFaviconUrl(siteConfig.faviconUrl || '');

    setHeroTitle(siteConfig.heroTitle);
    setHeroSubtext(siteConfig.heroSubtext);
    setHeroCtaText(siteConfig.heroCtaText || 'Jelajahi Warta Kegiatan');
    setHeroCtaAction(siteConfig.heroCtaAction || 'scroll_berita');
    setHeroCtaUrl(siteConfig.heroCtaUrl || '');
    setHeroBannerUrl(siteConfig.heroBannerUrl);
    setHeroOverlayOpacity(siteConfig.heroOverlayOpacity ?? 50);
    setHeroOverlayStyle(siteConfig.heroOverlayStyle || 'burgundy');

    setSambutanTagText(siteConfig.sambutanTagText || 'Kata Sambutan');
    setSambutanQuote(siteConfig.sambutanKetuaQuote || '');
    setSambutanText(siteConfig.sambutanKetuaText);

    setVisiTagText(siteConfig.visiTagText || '');
    setVisiTitle(siteConfig.visiTitle || '');
    setVisiSubtext(siteConfig.visiSubtext || '');
    setVisiText(siteConfig.visiText);
    setMisiList(siteConfig.misiList || []);

    setStrukturTagText(siteConfig.strukturTagText || '');
    setStrukturTitle(siteConfig.strukturTitle || '');
    setStrukturSubtext(siteConfig.strukturSubtext || '');

    setBeritaTagText(siteConfig.beritaTagText || '');
    setBeritaTitle(siteConfig.beritaTitle || '');
    setBeritaSubtext(siteConfig.beritaSubtext || '');

    setAgendaTagText(siteConfig.agendaTagText || '');
    setAgendaTitle(siteConfig.agendaTitle || '');
    setAgendaSubtext(siteConfig.agendaSubtext || '');

    setAddress(siteConfig.address);
    setPhone(siteConfig.phone);
    setEmail(siteConfig.email);
    setFacebook(siteConfig.facebook);
    setInstagram(siteConfig.instagram);
    setYoutube(siteConfig.youtube);
    setFooterDescription(siteConfig.footerDescription || '');
    setCopyrightText(siteConfig.copyrightText || '');
  }, [siteConfig]);

  const handleFileUpload = (file: File, setter: (val: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteConfig({
      siteTitle,
      subTitle,
      siteLogoUrl,
      faviconUrl,
      heroTitle,
      heroSubtext,
      heroCtaText,
      heroCtaAction,
      heroCtaUrl,
      heroBannerUrl,
      heroOverlayOpacity,
      heroOverlayStyle,
      sambutanTagText,
      sambutanKetuaQuote: sambutanQuote,
      sambutanKetuaText: sambutanText,
      visiTagText,
      visiTitle,
      visiSubtext,
      visiText,
      misiList,
      strukturTagText,
      strukturTitle,
      strukturSubtext,
      beritaTagText,
      beritaTitle,
      beritaSubtext,
      agendaTagText,
      agendaTitle,
      agendaSubtext,
      address,
      phone,
      email,
      facebook,
      instagram,
      youtube,
      footerDescription,
      copyrightText
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleViewPublicWeb = () => {
    handleSaveCMS({ preventDefault: () => {} } as any);
    setActiveTab('public');
  };

  const handleAddMisi = () => {
    setMisiList([...misiList, 'Poin misi strategis baru...']);
  };

  const handleUpdateMisi = (index: number, val: string) => {
    const updated = [...misiList];
    updated[index] = val;
    setMisiList(updated);
  };

  const handleDeleteMisi = (index: number) => {
    setMisiList(misiList.filter((_, i) => i !== index));
  };

  // Section Access Helper
  const canEditSection = (sec: CMSSection) => canEditCMSSection(currentRole, sec);
  const roleDesc = getRoleDescription(currentRole);

  const renderLockNotice = (secTitle: string, ownerRole: string) => (
    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl text-xs flex items-center justify-between font-medium mb-4">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Bagian <strong>{secTitle}</strong> hanya dapat disunting oleh <strong>{ownerRole}</strong>. Mode Anda saat ini: <strong>Read-Only</strong>.</span>
      </div>
      <span className="bg-amber-200/80 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">Read Only</span>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg md:text-xl font-bold text-slate-900">
              Live Customizer CMS Website
            </h2>
            <span className="bg-dwp-burgundy text-dwp-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-dwp-gold/40">
              Role: {roleDesc.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pengelolaan tampilan & konten website publik resmi DWP Kantor GTK Provinsi Maluku Utara.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleViewPublicWeb}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Simpan & Lihat Web</span>
          </button>
        </div>
      </div>

      {/* Role Notice Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-dwp-darkBurgundy to-slate-900 text-white p-4 rounded-2xl border border-dwp-gold/30 shadow-md text-xs space-y-1">
        <div className="font-bold text-dwp-gold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-dwp-gold" />
          Hak Akses Penyuntingan CMS - Role: {roleDesc.label}
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          {currentRole === 'ketua' && '👑 Sebagai Ketua DWP, Anda berwenang menyunting Bagian 3 (Kata Sambutan) dan Bagian 4 (Visi & Misi Organisasi). Bagian lainnya terkunci dalam mode Read-Only.'}
          {currentRole === 'sekretaris' && '📜 Sebagai Sekretaris DWP, Anda berwenang menyunting Bagian Identitas, Hero Banner, Tagline Section, serta Kontak Footer. Bagian Sambutan & Visi Misi dikelola khusus oleh Ketua DWP.'}
          {currentRole === 'admin_master' && '⚡ Sebagai Superadmin IT, Anda memegang akses penuh untuk menyunting seluruh bagian CMS demi pemeliharaan teknis.'}
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl font-bold text-xs shadow flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Seluruh Kustomisasi Teks & Gambar Berhasil Disimpan!</span>
        </div>
      )}

      <form onSubmit={handleSaveCMS} className="space-y-6">

        {/* 1. Identitas, Logo & Favicon Browser */}
        <div className={`bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6 ${!canEditSection('identitas') ? 'opacity-90' : ''}`}>
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-dwp-burgundy" />
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                1. Identitas, Logo Organisasi & Favicon Browser
              </h3>
            </div>
            {!canEditSection('identitas') && (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Read Only
              </span>
            )}
          </div>

          {!canEditSection('identitas') && renderLockNotice('1. Identitas, Logo & Favicon', 'Sekretaris DWP / Superadmin IT')}

          <div className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Utama Instansi *</label>
                <input
                  type="text"
                  readOnly={!canEditSection('identitas')}
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className={`w-full p-3 border border-slate-300 rounded-xl font-bold text-slate-900 ${
                    !canEditSection('identitas') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sub-Nama Instansi / Wilayah</label>
                <input
                  type="text"
                  readOnly={!canEditSection('identitas')}
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className={`w-full p-3 border border-slate-300 rounded-xl ${
                    !canEditSection('identitas') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                  }`}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              {/* Logo Upload */}
              {canEditSection('identitas') ? (
                <ImageUploadCompressor
                  label="Logo Resmi Organisasi (Navbar & Footer)"
                  value={siteLogoUrl}
                  onChange={(compressedUrl) => setSiteLogoUrl(compressedUrl)}
                  maxWidth={800}
                  maxHeight={800}
                  quality={0.85}
                  helpText="Otomatis dikompres & dikonversi ke format WebP super cepat."
                />
              ) : (
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="font-bold text-slate-800 block text-xs">Logo Resmi Organisasi</label>
                  <p className="text-[11px] text-slate-500 italic">Pengunggahan logo hanya dapat dilakukan oleh Sekretaris DWP / Superadmin IT.</p>
                </div>
              )}

              {/* Favicon Upload */}
              {canEditSection('identitas') ? (
                <ImageUploadCompressor
                  label="Favicon Browser (Ikon Tab Browser)"
                  value={faviconUrl}
                  onChange={(compressedUrl) => setFaviconUrl(compressedUrl)}
                  maxWidth={256}
                  maxHeight={256}
                  quality={0.90}
                  helpText="Ikon kecil di tab browser. Otomatis dikompres ringan."
                />
              ) : (
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="font-bold text-slate-800 block text-xs">Favicon Browser</label>
                  <p className="text-[11px] text-slate-500 italic">Pengunggahan favicon hanya dapat dilakukan oleh Sekretaris DWP / Superadmin IT.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Hero Section & Banner Background */}
        <div className={`bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6 ${!canEditSection('hero') ? 'opacity-90' : ''}`}>
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-dwp-burgundy" />
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                2. Kustomisasi Beranda & Hero Section
              </h3>
            </div>
            {!canEditSection('hero') && (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Read Only
              </span>
            )}
          </div>

          {!canEditSection('hero') && renderLockNotice('2. Hero Section', 'Sekretaris DWP / Superadmin IT')}

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Judul Hero Utama</label>
              <input
                type="text"
                readOnly={!canEditSection('hero')}
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className={`w-full p-3 border border-slate-300 rounded-xl font-bold text-slate-900 ${
                  !canEditSection('hero') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                }`}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Subteks Deskripsi Hero</label>
              <textarea
                rows={3}
                readOnly={!canEditSection('hero')}
                value={heroSubtext}
                onChange={(e) => setHeroSubtext(e.target.value)}
                className={`w-full p-3 border border-slate-300 rounded-xl ${
                  !canEditSection('hero') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                }`}
              />
            </div>

            {/* Kustomisasi Tombol Utama Hero */}
            <div className="space-y-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
              <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-dwp-gold" />
                <span>Pengaturan Tombol Utama Hero (CTA Button)</span>
              </h4>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Label Teks Tombol</label>
                  <input
                    type="text"
                    readOnly={!canEditSection('hero')}
                    value={heroCtaText}
                    onChange={(e) => setHeroCtaText(e.target.value)}
                    placeholder="Jelajahi Warta Kegiatan"
                    className={`w-full p-2.5 border border-slate-300 rounded-xl font-bold ${
                      !canEditSection('hero') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                    }`}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Aksi / Fungsi Klik Tombol</label>
                  <select
                    disabled={!canEditSection('hero')}
                    value={heroCtaAction}
                    onChange={(e) => setHeroCtaAction(e.target.value as any)}
                    className={`w-full p-2.5 border border-slate-300 rounded-xl font-semibold ${
                      !canEditSection('hero') ? 'bg-slate-100 cursor-not-allowed' : 'cursor-pointer focus:ring-2 focus:ring-dwp-burgundy'
                    }`}
                  >
                    <option value="scroll_berita">📜 Scroll ke Warta & Berita (#berita)</option>
                    <option value="scroll_agenda">📅 Scroll ke Agenda & Absensi (#agenda)</option>
                    <option value="scroll_sambutan">💬 Scroll ke Sambutan Ketua (#sambutan)</option>
                    <option value="scroll_visi">🎯 Scroll ke Visi & Misi (#visi-misi)</option>
                    <option value="scroll_struktur">👥 Scroll ke Struktur Organisasi (#struktur)</option>
                    <option value="open_admin">🔐 Masuk ke Portal Admin Backoffice</option>
                    <option value="custom_url">🌐 Buka Tautan Eksternal / URL Khusus</option>
                  </select>
                </div>
              </div>

              {heroCtaAction === 'custom_url' && (
                <div className="pt-1">
                  <label className="font-bold text-slate-700 block mb-1">Alamat Tautan Eksternal / URL (https://...)</label>
                  <input
                    type="url"
                    readOnly={!canEditSection('hero')}
                    value={heroCtaUrl}
                    onChange={(e) => setHeroCtaUrl(e.target.value)}
                    placeholder="https://google.com atau https://forms.gle/..."
                    className={`w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs ${
                      !canEditSection('hero') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Gambar Background Hero */}
            {canEditSection('hero') ? (
              <ImageUploadCompressor
                label="Foto Banner Utama Hero (Background Depan)"
                value={heroBannerUrl}
                onChange={(compressedUrl) => setHeroBannerUrl(compressedUrl)}
                maxWidth={1920}
                maxHeight={1080}
                quality={0.82}
                helpText="Banner utama publik. Otomatis dikompres cerdas (hemat 80%-95% storage tanpa mengurangi kualitas)."
              />
            ) : (
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="font-bold text-slate-800 block text-xs">Gambar Background Hero</label>
                <p className="text-[11px] text-slate-500 italic">Pengunggahan gambar hero hanya dapat dilakukan oleh Sekretaris DWP / Superadmin IT.</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Kepekatan Overlay Gelap ({heroOverlayOpacity}%)
                </label>
                <input
                  type="range"
                  disabled={!canEditSection('hero')}
                  min={10}
                  max={90}
                  step={5}
                  value={heroOverlayOpacity}
                  onChange={(e) => setHeroOverlayOpacity(Number(e.target.value))}
                  className="w-full accent-dwp-burgundy cursor-pointer"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gaya Warna Gradient Overlay</label>
                <select
                  disabled={!canEditSection('hero')}
                  value={heroOverlayStyle}
                  onChange={(e) => setHeroOverlayStyle(e.target.value as any)}
                  className={`w-full p-3 border border-slate-300 rounded-xl font-semibold ${
                    !canEditSection('hero') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                  }`}
                >
                  <option value="burgundy">🍷 DWP Signature Burgundy</option>
                  <option value="dark">🖤 Sleek Onyx & Charcoal Dark</option>
                  <option value="navy">🌊 Deep Ocean Navy</option>
                  <option value="subtle">✨ Subtle Soft Glow (Terang)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Kata Sambutan Ketua DWP */}
        <div className={`bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6 ${!canEditSection('sambutan') ? 'opacity-90' : ''}`}>
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-dwp-burgundy" />
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                3. Kata Sambutan Ketua DWP
              </h3>
            </div>
            {canEditSection('sambutan') ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                👑 Akses Penyuntingan Ketua DWP
              </span>
            ) : (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Read Only
              </span>
            )}
          </div>

          {!canEditSection('sambutan') && renderLockNotice('3. Kata Sambutan', 'Ketua DWP / Superadmin IT')}

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Teks Badge Tag ("Kata Sambutan")</label>
              <input
                type="text"
                readOnly={!canEditSection('sambutan')}
                value={sambutanTagText}
                onChange={(e) => setSambutanTagText(e.target.value)}
                className={`w-full p-3 border border-slate-300 rounded-xl font-semibold ${
                  !canEditSection('sambutan') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                }`}
              />
            </div>

            {/* Informational Box: Profil & Foto Ketua 100% dari Data Anggota */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-sky-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sky-950">Foto Profil, Nama & Jabatan Ketua DWP Terpusat</p>
                  <p className="text-[11px] text-sky-700 mt-0.5">
                    Seluruh profil pengurus (termasuk foto profil Ketua DWP) dikelola terpusat dari menu <strong>Manajemen Anggota</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminSubTab('members')}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex-shrink-0 transition-colors shadow-sm"
              >
                Buka Data Anggota
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Judul Kutipan Sambutan / Headline Utama</label>
              <input
                type="text"
                readOnly={!canEditSection('sambutan')}
                value={sambutanQuote}
                onChange={(e) => setSambutanQuote(e.target.value)}
                className={`w-full p-3 border border-slate-300 rounded-xl font-bold text-slate-900 ${
                  !canEditSection('sambutan') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                }`}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Teks Isi Sambutan Lengkap</label>
              <textarea
                rows={5}
                readOnly={!canEditSection('sambutan')}
                value={sambutanText}
                onChange={(e) => setSambutanText(e.target.value)}
                className={`w-full p-3 border border-slate-300 rounded-xl ${
                  !canEditSection('sambutan') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 4. Visi, Misi & Tagline Section */}
        <div className={`bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6 ${!canEditSection('visi_misi') ? 'opacity-90' : ''}`}>
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-dwp-burgundy" />
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                4. Visi, Misi & Pengelolaan Poin Misi
              </h3>
            </div>
            {canEditSection('visi_misi') ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                👑 Akses Penyuntingan Ketua DWP
              </span>
            ) : (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Read Only
              </span>
            )}
          </div>

          {!canEditSection('visi_misi') && renderLockNotice('4. Visi & Misi', 'Ketua DWP / Superadmin IT')}

          <div className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Badge Tag Section</label>
                <input
                  type="text"
                  readOnly={!canEditSection('visi_misi')}
                  value={visiTagText}
                  onChange={(e) => setVisiTagText(e.target.value)}
                  className={`w-full p-3 border border-slate-300 rounded-xl ${
                    !canEditSection('visi_misi') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Section Visi Misi</label>
                <input
                  type="text"
                  readOnly={!canEditSection('visi_misi')}
                  value={visiTitle}
                  onChange={(e) => setVisiTitle(e.target.value)}
                  className={`w-full p-3 border border-slate-300 rounded-xl font-bold ${
                    !canEditSection('visi_misi') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subteks Deskripsi Visi Misi</label>
                <input
                  type="text"
                  readOnly={!canEditSection('visi_misi')}
                  value={visiSubtext}
                  onChange={(e) => setVisiSubtext(e.target.value)}
                  className={`w-full p-3 border border-slate-300 rounded-xl ${
                    !canEditSection('visi_misi') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Teks Visi Utama Organisasi</label>
              <textarea
                rows={2}
                readOnly={!canEditSection('visi_misi')}
                value={visiText}
                onChange={(e) => setVisiText(e.target.value)}
                className={`w-full p-3 border border-slate-300 rounded-xl font-medium ${
                  !canEditSection('visi_misi') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                }`}
              />
            </div>

            {/* Dynamic Misi List Editor */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800">Daftar Poin Misi Strategis DWP ({misiList.length} Poin)</label>
                {canEditSection('visi_misi') && (
                  <button
                    type="button"
                    onClick={handleAddMisi}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Poin Misi
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {misiList.map((misi, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-dwp-burgundy text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      readOnly={!canEditSection('visi_misi')}
                      value={misi}
                      onChange={(e) => handleUpdateMisi(idx, e.target.value)}
                      className={`flex-1 p-2.5 border border-slate-300 rounded-xl text-xs ${
                        !canEditSection('visi_misi') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'
                      }`}
                    />
                    {canEditSection('visi_misi') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMisi(idx)}
                        className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Judul & Label Semua Section (Struktur, Berita, Agenda) */}
        <div className={`bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6 ${!canEditSection('section_headers') ? 'opacity-90' : ''}`}>
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-dwp-burgundy" />
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                5. Pengaturan Label Tag & Judul Section Website Publik
              </h3>
            </div>
            {!canEditSection('section_headers') && (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Read Only
              </span>
            )}
          </div>

          {!canEditSection('section_headers') && renderLockNotice('5. Judul Section', 'Sekretaris DWP / Superadmin IT')}

          <div className="space-y-6 text-xs">
            {/* Struktur Organisasi Section Header */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-dwp-burgundy">Section Struktur Organisasi</h4>
              <div className="grid sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  readOnly={!canEditSection('section_headers')}
                  placeholder="Badge Tag"
                  value={strukturTagText}
                  onChange={(e) => setStrukturTagText(e.target.value)}
                  className={`p-2.5 border border-slate-300 rounded-xl ${!canEditSection('section_headers') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
                <input
                  type="text"
                  readOnly={!canEditSection('section_headers')}
                  placeholder="Judul Section"
                  value={strukturTitle}
                  onChange={(e) => setStrukturTitle(e.target.value)}
                  className={`p-2.5 border border-slate-300 rounded-xl font-bold ${!canEditSection('section_headers') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
                <input
                  type="text"
                  readOnly={!canEditSection('section_headers')}
                  placeholder="Subteks Deskripsi"
                  value={strukturSubtext}
                  onChange={(e) => setStrukturSubtext(e.target.value)}
                  className={`p-2.5 border border-slate-300 rounded-xl ${!canEditSection('section_headers') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            {/* Warta Berita Section Header */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-dwp-burgundy">Section Warta & Berita Kegiatan</h4>
              <div className="grid sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  readOnly={!canEditSection('section_headers')}
                  placeholder="Badge Tag"
                  value={beritaTagText}
                  onChange={(e) => setBeritaTagText(e.target.value)}
                  className={`p-2.5 border border-slate-300 rounded-xl ${!canEditSection('section_headers') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
                <input
                  type="text"
                  readOnly={!canEditSection('section_headers')}
                  placeholder="Judul Section"
                  value={beritaTitle}
                  onChange={(e) => setBeritaTitle(e.target.value)}
                  className={`p-2.5 border border-slate-300 rounded-xl font-bold ${!canEditSection('section_headers') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
                <input
                  type="text"
                  readOnly={!canEditSection('section_headers')}
                  placeholder="Subteks Deskripsi"
                  value={beritaSubtext}
                  onChange={(e) => setBeritaSubtext(e.target.value)}
                  className={`p-2.5 border border-slate-300 rounded-xl ${!canEditSection('section_headers') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            {/* Agenda & Absensi Section Header */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-dwp-burgundy">Section Agenda Kegiatan & Absensi</h4>
              <div className="grid sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  readOnly={!canEditSection('section_headers')}
                  placeholder="Badge Tag"
                  value={agendaTagText}
                  onChange={(e) => setAgendaTagText(e.target.value)}
                  className={`p-2.5 border border-slate-300 rounded-xl ${!canEditSection('section_headers') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
                <input
                  type="text"
                  readOnly={!canEditSection('section_headers')}
                  placeholder="Judul Section"
                  value={agendaTitle}
                  onChange={(e) => setAgendaTitle(e.target.value)}
                  className={`p-2.5 border border-slate-300 rounded-xl font-bold ${!canEditSection('section_headers') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
                <input
                  type="text"
                  readOnly={!canEditSection('section_headers')}
                  placeholder="Subteks Deskripsi"
                  value={agendaSubtext}
                  onChange={(e) => setAgendaSubtext(e.target.value)}
                  className={`p-2.5 border border-slate-300 rounded-xl ${!canEditSection('section_headers') ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 6. Kontak, Sosial Media & Footer */}
        <div className={`bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6 ${!canEditSection('kontak_footer') ? 'opacity-90' : ''}`}>
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-dwp-burgundy" />
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                6. Kontak Sekretariat, Media Sosial & Footer
              </h3>
            </div>
            {!canEditSection('kontak_footer') && (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Read Only
              </span>
            )}
          </div>

          {!canEditSection('kontak_footer') && renderLockNotice('6. Kontak & Footer', 'Sekretaris DWP / Superadmin IT')}

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Deskripsi Singkat Organisasi pada Footer</label>
              <textarea
                rows={2}
                readOnly={!canEditSection('kontak_footer')}
                value={footerDescription}
                onChange={(e) => setFooterDescription(e.target.value)}
                className={`w-full p-3 border border-slate-300 rounded-xl ${!canEditSection('kontak_footer') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'}`}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Sekretariat</label>
                <input
                  type="text"
                  readOnly={!canEditSection('kontak_footer')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full p-3 border border-slate-300 rounded-xl ${!canEditSection('kontak_footer') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'}`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Telepon Office</label>
                <input
                  type="text"
                  readOnly={!canEditSection('kontak_footer')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full p-3 border border-slate-300 rounded-xl ${!canEditSection('kontak_footer') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'}`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Resmi</label>
                <input
                  type="email"
                  readOnly={!canEditSection('kontak_footer')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-3 border border-slate-300 rounded-xl ${!canEditSection('kontak_footer') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'}`}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Link Facebook</label>
                <input
                  type="text"
                  readOnly={!canEditSection('kontak_footer')}
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className={`w-full p-3 border border-slate-300 rounded-xl ${!canEditSection('kontak_footer') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'}`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Link Instagram</label>
                <input
                  type="text"
                  readOnly={!canEditSection('kontak_footer')}
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className={`w-full p-3 border border-slate-300 rounded-xl ${!canEditSection('kontak_footer') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'}`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Link Youtube Channel</label>
                <input
                  type="text"
                  readOnly={!canEditSection('kontak_footer')}
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className={`w-full p-3 border border-slate-300 rounded-xl ${!canEditSection('kontak_footer') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'}`}
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Teks Hak Cipta (Copyright Footer)</label>
              <input
                type="text"
                readOnly={!canEditSection('kontak_footer')}
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
                className={`w-full p-3 border border-slate-300 rounded-xl ${!canEditSection('kontak_footer') ? 'bg-slate-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-dwp-burgundy'}`}
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold px-10 py-4 rounded-2xl text-sm shadow-xl flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Save className="w-5 h-5 text-dwp-gold" />
            <span>Simpan Kustomisasi CMS Website</span>
          </button>
        </div>

      </form>
    </div>
  );
};
