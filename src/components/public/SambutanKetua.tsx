import React from 'react';
import { useApp } from '../../context/AppContext';
import { Quote } from 'lucide-react';

export const SambutanKetua: React.FC = () => {
  const { siteConfig, members } = useApp();

  // Single Source of Truth: Find Chairwoman from Admin Member Management
  const ketuaMember = members.find(m => 
    m.jabatan.toLowerCase() === 'ketua' || 
    m.jabatan.toLowerCase().includes('ketua pengurus') || 
    m.jabatan.toLowerCase().includes('ketua dwp')
  );


  const ketuaName = ketuaMember ? ketuaMember.name : 'Ny. Hj. Rahmiati Ahmad, M.Pd';
  const ketuaTitle = ketuaMember ? ketuaMember.jabatan : 'Ketua DWP Kantor GTK Provinsi Maluku Utara';
  const ketuaPhoto = ketuaMember?.avatar || 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80';

  return (
    <section id="sambutan" className="py-10 md:py-14 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-dwp-cream to-slate-50 border border-dwp-gold/30 rounded-2xl p-6 md:p-8 shadow-lg relative">
          
          <Quote className="absolute top-4 right-4 w-16 h-16 text-dwp-gold/15 pointer-events-none" />

          <div className="grid md:grid-cols-12 gap-6 items-center">
            
            {/* Foto Ketua - Dynamic from Member Management */}
            <div className="md:col-span-4 text-center">
              <div className="relative inline-block">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-3 border-dwp-gold shadow-xl mx-auto bg-slate-100">
                  <img 
                    src={ketuaPhoto} 
                    alt={ketuaName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover object-center" 
                  />
                </div>
              </div>

              <h3 className="mt-3 font-serif font-bold text-base text-slate-900">
                {ketuaName}
              </h3>
              <p className="text-[11px] text-dwp-burgundy font-medium">
                {ketuaTitle}
              </p>
            </div>

            {/* Teks Sambutan */}
            <div className="md:col-span-8 space-y-3">
              <div className="inline-block bg-dwp-burgundy/10 text-dwp-burgundy text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                {siteConfig.sambutanTagText || 'Kata Sambutan'}
              </div>

              <h2 className="font-serif text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                "{siteConfig.sambutanKetuaQuote || 'Bersama Membangun Kesejahteraan & Mendukung Pendidikan di Maluku Utara'}"
              </h2>

              <div className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-line font-serif italic">
                {siteConfig.sambutanKetuaText}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
