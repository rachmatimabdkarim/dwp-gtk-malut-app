import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, BookOpen, Calendar, Users, Newspaper, Shield, Menu, X, ChevronRight, Phone } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { siteConfig, setActiveTab, setAdminSubTab, activePersona } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Main Navbar */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {siteConfig.siteLogoUrl ? (
            <img src={siteConfig.siteLogoUrl} alt="Logo DWP" className="w-9 h-9 rounded-lg object-contain shadow-sm border border-dwp-gold/40 p-0.5 bg-white" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-dwp-burgundy to-dwp-darkBurgundy p-1 shadow-sm border border-dwp-gold/40 flex items-center justify-center text-dwp-gold font-serif font-bold text-sm">
              DWP
            </div>
          )}
          <div>
            <h1 className="font-serif font-bold text-slate-900 text-sm md:text-base leading-snug tracking-tight">
              {siteConfig.siteTitle || 'Dharma Wanita Persatuan'}
            </h1>
            <p className="text-[11px] text-dwp-burgundy font-semibold leading-none">
              {siteConfig.subTitle || 'Kantor GTK Provinsi Maluku Utara'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs md:text-sm font-semibold text-slate-700">
          <button onClick={() => scrollToSection('beranda')} className="hover:text-dwp-burgundy transition-colors">
            Beranda
          </button>
          <button onClick={() => scrollToSection('sambutan')} className="hover:text-dwp-burgundy transition-colors">
            Sambutan
          </button>
          <button onClick={() => scrollToSection('visi-misi')} className="hover:text-dwp-burgundy transition-colors">
            Visi & Misi
          </button>
          <button onClick={() => scrollToSection('struktur')} className="hover:text-dwp-burgundy transition-colors">
            Struktur
          </button>
          <button onClick={() => scrollToSection('berita')} className="hover:text-dwp-burgundy transition-colors">
            Warta
          </button>
          <button onClick={() => scrollToSection('agenda')} className="hover:text-dwp-burgundy transition-colors">
            Agenda & Absensi
          </button>
        </nav>

        {/* Action Button: Portal Admin */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('admin');
              setAdminSubTab('dashboard');
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-dwp-burgundy to-dwp-darkBurgundy text-white hover:brightness-110 px-3.5 py-1.5 rounded-lg font-semibold text-xs shadow border border-dwp-gold/30 transition-all hover:scale-[1.02]"
          >
            <Shield className="w-3.5 h-3.5 text-dwp-gold" />
            <span>Portal Admin</span>
          </button>
        </div>


        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-dwp-burgundy"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 font-medium text-sm">
          <button onClick={() => scrollToSection('beranda')} className="block w-full text-left py-2 text-slate-800 hover:text-dwp-burgundy">
            Beranda
          </button>
          <button onClick={() => scrollToSection('sambutan')} className="block w-full text-left py-2 text-slate-800 hover:text-dwp-burgundy">
            Sambutan Ketua
          </button>
          <button onClick={() => scrollToSection('visi-misi')} className="block w-full text-left py-2 text-slate-800 hover:text-dwp-burgundy">
            Visi & Misi
          </button>
          <button onClick={() => scrollToSection('struktur')} className="block w-full text-left py-2 text-slate-800 hover:text-dwp-burgundy">
            Struktur Organisasi
          </button>
          <button onClick={() => scrollToSection('berita')} className="block w-full text-left py-2 text-slate-800 hover:text-dwp-burgundy">
            Warta Kegiatan
          </button>
          <button onClick={() => scrollToSection('agenda')} className="block w-full text-left py-2 text-slate-800 hover:text-dwp-burgundy">
            Agenda & Absensi
          </button>
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setActiveTab('admin');
                setAdminSubTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-dwp-burgundy text-white py-2.5 rounded-xl font-semibold text-xs shadow-md"
            >
              <Shield className="w-4 h-4 text-dwp-gold" />
              <span>Masuk Portal Admin</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
