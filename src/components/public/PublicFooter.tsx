import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, ArrowUp } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const { siteConfig } = useApp();

  return (
    <footer className="bg-slate-950 text-white pt-10 pb-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
          
          {/* Col 1: Brand & Desc */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              {siteConfig.siteLogoUrl ? (
                <img src={siteConfig.siteLogoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain border border-dwp-gold bg-white p-0.5" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-dwp-burgundy border border-dwp-gold flex items-center justify-center text-dwp-gold font-serif font-bold text-sm">
                  DWP
                </div>
              )}
              <div>
                <h3 className="font-serif font-bold text-white text-sm">
                  {siteConfig.siteTitle || 'Dharma Wanita Persatuan'}
                </h3>
                <p className="text-[11px] text-dwp-gold font-medium">
                  {siteConfig.subTitle || 'Kantor GTK Provinsi Maluku Utara'}
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              {siteConfig.footerDescription || 'Organisasi istri Pegawai Negeri Sipil di lingkungan Balai Guru Penggerak / Kantor Guru dan Tenaga Kependidikan (GTK) Provinsi Maluku Utara.'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a href={siteConfig.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-dwp-gold hover:border-dwp-gold transition-colors">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href={siteConfig.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-dwp-gold hover:border-dwp-gold transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href={siteConfig.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-dwp-gold hover:border-dwp-gold transition-colors">
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-2.5 text-xs">
            <h4 className="font-serif font-bold text-dwp-gold text-xs tracking-wider uppercase">
              Tautan Cepat
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li><a href="#beranda" className="hover:text-dwp-gold transition-colors">Beranda Utama</a></li>
              <li><a href="#sambutan" className="hover:text-dwp-gold transition-colors">Sambutan Ketua DWP</a></li>
              <li><a href="#visi-misi" className="hover:text-dwp-gold transition-colors">Visi & Misi Organisasi</a></li>
              <li><a href="#struktur" className="hover:text-dwp-gold transition-colors">Struktur Kepengurusan</a></li>
              <li><a href="#berita" className="hover:text-dwp-gold transition-colors">Warta & Berita Kegiatan</a></li>
              <li><a href="#agenda" className="hover:text-dwp-gold transition-colors">Agenda & Absensi Online</a></li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="md:col-span-4 space-y-2.5 text-xs">
            <h4 className="font-serif font-bold text-dwp-gold text-xs tracking-wider uppercase">
              Kontak Sekretariat
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-dwp-gold flex-shrink-0 mt-0.5" />
                <span>{siteConfig.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-dwp-gold flex-shrink-0" />
                <span>{siteConfig.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-dwp-gold flex-shrink-0" />
                <span>{siteConfig.email}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>{siteConfig.copyrightText || `© ${new Date().getFullYear()} Dharma Wanita Persatuan - Kantor GTK Provinsi Maluku Utara. Hak Cipta Dilindungi.`}</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 hover:text-dwp-gold transition-colors"
          >
            <span>Kembali ke Atas</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>


      </div>
    </footer>
  );
};
