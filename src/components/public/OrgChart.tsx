import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Shield, Award, UserCheck, HeartHandshake, BookOpen, Banknote, FileText } from 'lucide-react';

export const OrgChart: React.FC = () => {
  const { members, siteConfig } = useApp();

  // Single Source of Truth Filtering according to Official Hierarchy
  const ketua = members.find(m => 
    m.jabatan.toLowerCase() === 'ketua' || 
    m.jabatan.toLowerCase().includes('ketua pengurus') || 
    m.jabatan.toLowerCase().includes('ketua dwp')
  );

  const wakilKetua = members.find(m => m.jabatan.toLowerCase() === 'wakil ketua');
  
  const sekretaris = members.find(m => m.jabatan.toLowerCase() === 'sekretaris');
  const wakilSekretaris = members.find(m => m.jabatan.toLowerCase() === 'wakil sekretaris');
  const bendahara = members.find(m => m.jabatan.toLowerCase() === 'bendahara');

  const kabidPendidikan = members.find(m => m.jabatan.toLowerCase().includes('pendidikan'));
  const kabidEkonomi = members.find(m => m.jabatan.toLowerCase().includes('ekonomi'));
  const kabidSosbud = members.find(m => m.jabatan.toLowerCase().includes('sosial budaya') || m.jabatan.toLowerCase().includes('sosbud'));

  const anggotaList = members.filter(m => 
    m.jabatan.toLowerCase().includes('anggota')
  );

  return (
    <section id="struktur" className="py-10 md:py-14 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-dwp-burgundy text-[10px] font-bold uppercase tracking-widest bg-dwp-burgundy/10 px-3 py-0.5 rounded-full">
            {siteConfig.strukturTagText || 'Kepengurusan Resmi'}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {siteConfig.strukturTitle || 'Struktur Organisasi DWP GTK Maluku Utara'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            {siteConfig.strukturSubtext || 'Susunan Pengurus Inti dan Ketua Bidang Dharma Wanita Persatuan Kantor GTK Provinsi Maluku Utara.'}
          </p>
        </div>

        <div className="space-y-8">
          
          {/* LEVEL 1: KETUA */}
          <div className="flex justify-center">
            {ketua && (
              <div className="bg-gradient-to-br from-dwp-burgundy to-dwp-darkBurgundy text-white rounded-2xl p-5 shadow-lg border-2 border-dwp-gold max-w-sm w-full text-center relative overflow-hidden">
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-dwp-gold mx-auto shadow-md mb-3 bg-slate-100">
                  <img src={ketua.avatar} alt={ketua.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-serif font-bold text-base text-dwp-lightGold">
                  {ketua.name}
                </h3>
                <p className="text-[11px] text-slate-200 mt-0.5 font-semibold uppercase tracking-wider">
                  Ketua DWP
                </p>
              </div>
            )}
          </div>

          {/* Vertical Connecting Line */}
          <div className="w-0.5 h-6 bg-dwp-gold mx-auto" />

          {/* LEVEL 2: WAKIL KETUA */}
          <div className="flex justify-center">
            {wakilKetua ? (
              <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-dwp-burgundy text-center max-w-xs w-full">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 mx-auto mb-2 shadow-sm bg-slate-50">
                  <img src={wakilKetua.avatar} alt={wakilKetua.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-serif font-bold text-slate-900 text-sm">{wakilKetua.name}</h4>
                <p className="text-[11px] text-dwp-burgundy font-bold mt-0.5 uppercase tracking-wider">Wakil Ketua</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{wakilKetua.unitKerja}</p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-300 text-center max-w-xs w-full">
                <p className="text-xs font-bold text-slate-700">Wakil Ketua</p>
                <p className="text-[10px] text-slate-400">Belum Ditentukan</p>
              </div>
            )}
          </div>

          {/* Vertical Connecting Line */}
          <div className="w-0.5 h-6 bg-dwp-gold mx-auto" />

          {/* LEVEL 3: SEKRETARIAT & BENDAHARA (Sekretaris, Wakil Sekretaris, Bendahara) */}
          <div>
            <div className="text-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Sekretariat & Keuangan
              </span>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {/* Sekretaris */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center hover:border-dwp-gold transition-colors">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 mx-auto mb-2 bg-slate-50">
                  <img src={sekretaris?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'} alt="Sekretaris" className="w-full h-full object-cover" />
                </div>
                <h5 className="font-serif font-bold text-slate-900 text-xs leading-snug">{sekretaris?.name || 'Ny. Fitriani Nurdin, S.E'}</h5>
                <p className="text-[10px] text-dwp-burgundy font-bold mt-1 uppercase">Sekretaris</p>
              </div>

              {/* Wakil Sekretaris */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center hover:border-dwp-gold transition-colors">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 mx-auto mb-2 bg-slate-50">
                  <img src={wakilSekretaris?.avatar || 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'} alt="Wakil Sekretaris" className="w-full h-full object-cover" />
                </div>
                <h5 className="font-serif font-bold text-slate-900 text-xs leading-snug">{wakilSekretaris?.name || 'Ny. Sitti Maryam Subhan, S.Pd'}</h5>
                <p className="text-[10px] text-dwp-burgundy font-bold mt-1 uppercase">Wakil Sekretaris</p>
              </div>

              {/* Bendahara */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center hover:border-dwp-gold transition-colors">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 mx-auto mb-2 bg-slate-50">
                  <img src={bendahara?.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'} alt="Bendahara" className="w-full h-full object-cover" />
                </div>
                <h5 className="font-serif font-bold text-slate-900 text-xs leading-snug">{bendahara?.name || 'Ny. Hasnah Usman, S.E'}</h5>
                <p className="text-[10px] text-dwp-burgundy font-bold mt-1 uppercase">Bendahara</p>
              </div>
            </div>
          </div>

          {/* Vertical Connecting Line */}
          <div className="w-0.5 h-6 bg-dwp-gold mx-auto" />

          {/* LEVEL 4: KETUA BIDANG (Pendidikan, Ekonomi, Sosial Budaya) */}
          <div>
            <div className="text-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Ketua Bidang Operasional
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {/* Ketua Bidang Pendidikan */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center hover:border-dwp-gold transition-colors">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-300 mx-auto mb-2 bg-white">
                  <img src={kabidPendidikan?.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'} alt="Ketua Bidang Pendidikan" className="w-full h-full object-cover" />
                </div>
                <span className="inline-flex items-center gap-1 bg-dwp-burgundy/10 text-dwp-burgundy text-[9px] font-bold px-2 py-0.5 rounded-full mb-1">
                  <BookOpen className="w-3 h-3" />
                  <span>Bidang Pendidikan</span>
                </span>
                <h5 className="font-serif font-bold text-slate-900 text-xs leading-snug">{kabidPendidikan?.name || 'Ny. Hj. Siti Aminah, S.Pd'}</h5>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Ketua Bidang Pendidikan</p>
              </div>

              {/* Ketua Bidang Ekonomi */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center hover:border-dwp-gold transition-colors">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-300 mx-auto mb-2 bg-white">
                  <img src={kabidEkonomi?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt="Ketua Bidang Ekonomi" className="w-full h-full object-cover" />
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full mb-1">
                  <Banknote className="w-3 h-3 text-emerald-600" />
                  <span>Bidang Ekonomi</span>
                </span>
                <h5 className="font-serif font-bold text-slate-900 text-xs leading-snug">{kabidEkonomi?.name || 'Ny. Fatimah Az-Zahra, SE'}</h5>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Ketua Bidang Ekonomi</p>
              </div>

              {/* Ketua Bidang Sosial Budaya */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center hover:border-dwp-gold transition-colors">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-300 mx-auto mb-2 bg-white">
                  <img src={kabidSosbud?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'} alt="Ketua Bidang Sosial Budaya" className="w-full h-full object-cover" />
                </div>
                <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-[9px] font-bold px-2 py-0.5 rounded-full mb-1">
                  <HeartHandshake className="w-3 h-3 text-sky-600" />
                  <span>Bidang Sosial Budaya</span>
                </span>
                <h5 className="font-serif font-bold text-slate-900 text-xs leading-snug">{kabidSosbud?.name || 'Ny. Mariam Syaiful, S.Sos'}</h5>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Ketua Bidang Sosial Budaya</p>
              </div>
            </div>
          </div>

          {/* LEVEL 5: ANGGOTA DWP */}
          {anggotaList.length > 0 && (
            <div className="max-w-4xl mx-auto pt-4 border-t border-slate-100 text-center">
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold">
                <Users className="w-4 h-4 text-dwp-burgundy" />
                <span>Didukung oleh {anggotaList.length} Anggota Resmi DWP Kantor GTK Provinsi Maluku Utara</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
