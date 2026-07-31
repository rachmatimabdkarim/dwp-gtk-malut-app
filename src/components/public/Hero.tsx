import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, ExternalLink, Shield } from 'lucide-react';

export const Hero: React.FC = () => {
  const { siteConfig, setActiveTab, setAdminSubTab } = useApp();

  const opacityVal = (siteConfig.heroOverlayOpacity ?? 50) / 100;

  const styleGradients: Record<string, string> = {
    burgundy: 'from-dwp-darkBurgundy via-slate-900/90 to-slate-950',
    dark: 'from-slate-950 via-slate-900 to-black',
    navy: 'from-slate-900 via-sky-950 to-slate-950',
    subtle: 'from-dwp-burgundy/60 via-slate-900/40 to-slate-950/60'
  };

  const selectedGradient = styleGradients[siteConfig.heroOverlayStyle || 'burgundy'] || styleGradients.burgundy;

  const handleCtaClick = () => {
    const action = siteConfig.heroCtaAction || 'scroll_berita';

    if (action === 'open_admin') {
      setActiveTab('admin');
      setAdminSubTab('dashboard');
      return;
    }

    if (action === 'custom_url') {
      if (siteConfig.heroCtaUrl) {
        window.open(siteConfig.heroCtaUrl, '_blank');
      }
      return;
    }

    const sectionMap: Record<string, string> = {
      scroll_berita: 'berita',
      scroll_agenda: 'agenda',
      scroll_sambutan: 'sambutan',
      scroll_visi: 'visi-misi',
      scroll_struktur: 'struktur'
    };

    const targetId = sectionMap[action] || 'berita';
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const ctaText = siteConfig.heroCtaText || 'Jelajahi Warta Kegiatan';
  const ctaAction = siteConfig.heroCtaAction || 'scroll_berita';

  return (
    <section id="beranda" className="relative overflow-hidden bg-slate-900 text-white min-h-[520px] flex items-center">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
        style={{ 
          backgroundImage: `url("${siteConfig.heroBannerUrl || 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=1200&auto=format&fit=crop&q=80'}")`,
          opacity: Math.max(0.15, 1 - (opacityVal * 0.75))
        }}
      />
      {/* Dynamic Dark Gradient Overlay Layer */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${selectedGradient} transition-all duration-500`}
        style={{ opacity: opacityVal }}
      />

      {/* Decorative Golden Pattern Accent */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-dwp-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-dwp-burgundy/30 blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 text-center">
        <div className="space-y-6 max-w-3xl mx-auto">
          
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            {siteConfig.heroTitle}
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            {siteConfig.heroSubtext}
          </p>

          <div className="pt-2 flex justify-center">
            <button
              onClick={handleCtaClick}
              className="bg-dwp-gold hover:bg-dwp-darkGold text-slate-950 font-semibold px-6 py-3 rounded-xl text-xs md:text-sm shadow-lg shadow-dwp-gold/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>{ctaText}</span>
              {ctaAction === 'custom_url' ? (
                <ExternalLink className="w-4 h-4" />
              ) : ctaAction === 'open_admin' ? (
                <Shield className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>

        </div>
      </div>

    </section>
  );
};
