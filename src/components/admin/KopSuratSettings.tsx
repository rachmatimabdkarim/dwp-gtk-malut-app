import React, { useState } from 'react';
import { useApp, defaultKopSuratConfig } from '../../context/AppContext';
import { KopSuratConfig } from '../../types';
import { 
  FileText, 
  Save, 
  RotateCcw, 
  Image as ImageIcon, 
  MapPin, 
  Mail, 
  Globe, 
  Phone, 
  CheckCircle2,
  Eye,
  Sliders
} from 'lucide-react';

export const KopSuratSettings: React.FC = () => {
  const { kopSuratConfig, updateKopSuratConfig } = useApp();

  const [formConfig, setFormConfig] = useState<KopSuratConfig>(kopSuratConfig || defaultKopSuratConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateKopSuratConfig(formConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    if (confirm('⚠️ KONFIRMASI RESET KOP SURAT:\n\nApakah Anda yakin ingin mengembalikan identitas Kop Surat ke format standar DWP GTK Malut?')) {
      setFormConfig(defaultKopSuratConfig);
      updateKopSuratConfig(defaultKopSuratConfig);
      alert('✅ Pengaturan Kop Surat berhasil dikembalikan ke standar DWP GTK Malut.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-dwp-burgundy via-slate-900 to-dwp-burgundy p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-dwp-gold/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-dwp-gold" />
            <h2 className="font-serif font-bold text-xl md:text-2xl text-dwp-gold">
              Pengaturan Kop Surat Resmi Organisasi
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Sesuaikan logo, teks header 3 baris, alamat sekretariat, dan kontak resmi DWP. Tampilan ini otomatis digunakan sebagai Kop Surat Resmi pada <strong>SK Panitia, Surat Tugas, Surat Undangan, & Dokumen Kustom</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar DWP</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-md animate-in fade-in-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Pengaturan Kop Surat Resmi berhasil diperbarui dan diterapkan ke seluruh dokumen sistem!</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-dwp-burgundy" />
            <h3 className="font-serif font-bold text-slate-900 text-base">
              Form Parameter Kop Surat
            </h3>
          </div>

          {/* Logo URL Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-dwp-burgundy" />
              <span>URL Gambar Logo Kop Surat *</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                required
                value={formConfig.logoUrl}
                onChange={(e) => setFormConfig({ ...formConfig, logoUrl: e.target.value })}
                placeholder="https://domain.com/logo.png"
                className="flex-1 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={() => setFormConfig({ ...formConfig, logoUrl: defaultKopSuratConfig.logoUrl })}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-[11px] shrink-0 cursor-pointer"
              >
                Gunakan Logo Official DWP
              </button>
            </div>
          </div>

          {/* Header Lines */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Baris Header 1 (Induk Organisasi Utama) *
              </label>
              <input
                type="text"
                required
                value={formConfig.headerLine1}
                onChange={(e) => setFormConfig({ ...formConfig, headerLine1: e.target.value })}
                placeholder="DHARMA WANITA PERSATUAN"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold uppercase text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Baris Header 2 (Kantor / Unsur Pelaksana) *
              </label>
              <input
                type="text"
                required
                value={formConfig.headerLine2}
                onChange={(e) => setFormConfig({ ...formConfig, headerLine2: e.target.value })}
                placeholder="KANTOR GURU DAN TENAGA KEPENDIDIKAN"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-bold uppercase text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Baris Header 3 (Wilayah / Provinsi) *
              </label>
              <input
                type="text"
                required
                value={formConfig.headerLine3}
                onChange={(e) => setFormConfig({ ...formConfig, headerLine3: e.target.value })}
                placeholder="PROVINSI MALUKU UTARA"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-semibold uppercase text-slate-800"
              />
            </div>
          </div>

          {/* Address & Contact */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div>
              <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-dwp-burgundy" />
                <span>Alamat Sekretariat Resmi *</span>
              </label>
              <textarea
                rows={2}
                required
                value={formConfig.address}
                onChange={(e) => setFormConfig({ ...formConfig, address: e.target.value })}
                placeholder="Jl. Raya Rum Kecamatan Tidore Utara, Kota Tidore Kepulauan..."
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium text-slate-800"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5 text-dwp-burgundy" />
                  <span>Email Resmi</span>
                </label>
                <input
                  type="email"
                  value={formConfig.email}
                  onChange={(e) => setFormConfig({ ...formConfig, email: e.target.value })}
                  placeholder="dwp.gtk.malut@gmail.com"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Globe className="w-3.5 h-3.5 text-dwp-burgundy" />
                  <span>Situs Web</span>
                </label>
                <input
                  type="text"
                  value={formConfig.website}
                  onChange={(e) => setFormConfig({ ...formConfig, website: e.target.value })}
                  placeholder="dwp-gtk-malut.id"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-dwp-burgundy" />
                <span>Nomor Telepon Sekretariat</span>
              </label>
              <input
                type="text"
                value={formConfig.phone || ''}
                onChange={(e) => setFormConfig({ ...formConfig, phone: e.target.value })}
                placeholder="(0921) 3123456"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-dwp-burgundy focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-dwp-gold" />
              <span>Simpan Pengaturan Kop Surat</span>
            </button>
          </div>
        </form>

        {/* Live Visual Preview Box */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs sticky top-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <h3 className="font-serif font-bold text-slate-900 text-sm">
                Simulasi Live Kop Surat Resmi
              </h3>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Real-Time Preview
            </span>
          </div>

          {/* Letterhead Paper Rendering Box */}
          <div className="bg-slate-50 border border-slate-300 p-5 rounded-2xl shadow-inner font-serif space-y-3">
            <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3">
              <img
                src={formConfig.logoUrl || defaultKopSuratConfig.logoUrl}
                alt="Logo Kop DWP"
                className="w-14 h-14 object-contain shrink-0"
                onError={(e: any) => {
                  e.target.src = defaultKopSuratConfig.logoUrl;
                }}
              />

              <div className="text-center flex-1 space-y-0.5 text-slate-900">
                <h4 className="font-bold text-sm tracking-wide leading-tight">
                  {formConfig.headerLine1 || 'DHARMA WANITA PERSATUAN'}
                </h4>
                <h5 className="font-bold text-[11px] tracking-wide leading-tight">
                  {formConfig.headerLine2 || 'KANTOR GURU DAN TENAGA KEPENDIDIKAN'}
                </h5>
                <h6 className="font-semibold text-[10px] tracking-wide leading-tight">
                  {formConfig.headerLine3 || 'PROVINSI MALUKU UTARA'}
                </h6>
                <p className="text-[9px] font-sans text-slate-600 leading-tight mt-1">
                  {formConfig.address || 'Jl. Raya Rum Kecamatan Tidore Utara, Kota Tidore Kepulauan (Kompleks BPMP Provinsi Maluku Utara)'}
                </p>
                <div className="text-[8px] font-sans text-slate-500 flex items-center justify-center gap-2 flex-wrap">
                  {formConfig.phone && <span>Telp: {formConfig.phone}</span>}
                  {formConfig.email && <span>Email: {formConfig.email}</span>}
                  {formConfig.website && <span>Web: {formConfig.website}</span>}
                </div>
              </div>
            </div>

            {/* Simulated Document Body Preview */}
            <div className="text-[10px] font-sans text-slate-400 italic text-center py-6 border border-dashed border-slate-300 rounded-xl bg-white/60">
              [Area Isi Surat Resmi / SK / Surat Tugas / Undangan]
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic leading-relaxed text-center">
            💡 Seluruh SK, Surat Tugas, Surat Undangan, dan Dokumen Kustom yang dibuat panitia akan menyertakan header Kop Surat Resmi di atas.
          </p>
        </div>
      </div>
    </div>
  );
};
