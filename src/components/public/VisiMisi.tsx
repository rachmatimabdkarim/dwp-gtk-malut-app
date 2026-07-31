import React from 'react';
import { useApp } from '../../context/AppContext';
import { Target, Compass } from 'lucide-react';

export const VisiMisi: React.FC = () => {
  const { siteConfig } = useApp();

  return (
    <section id="visi-misi" className="py-10 md:py-14 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-dwp-burgundy text-[10px] font-bold uppercase tracking-widest bg-dwp-burgundy/10 px-3 py-0.5 rounded-full">
            {siteConfig.visiTagText || 'Landasan Organisasi'}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {siteConfig.visiTitle || 'Visi & Misi DWP GTK Maluku Utara'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            {siteConfig.visiSubtext || 'Pedoman arah langkah pengurus dan anggota dalam berkarya bagi kemajuan organisasi dan daerah.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Visi Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-dwp-burgundy to-dwp-darkBurgundy text-white rounded-2xl p-6 shadow-lg border border-dwp-gold/40 flex flex-col justify-center">
            <div>
              <div className="w-10 h-10 rounded-xl bg-dwp-gold/20 border border-dwp-gold/40 flex items-center justify-center text-dwp-lightGold mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-dwp-lightGold mb-3">
                Visi Utama
              </h3>
              <p className="text-slate-200 text-sm md:text-base leading-relaxed font-serif italic">
                "{siteConfig.visiText}"
              </p>
            </div>
          </div>

          {/* Misi Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-lg bg-dwp-burgundy/10 text-dwp-burgundy flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900">
                  Misi Strategis
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pilar Pelaksanaan Program Kerja DWP
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {siteConfig.misiList.map((misi, idx) => (
                <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-dwp-cream transition-colors">
                  <div className="w-6 h-6 rounded-full bg-dwp-burgundy text-dwp-gold flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {misi}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
