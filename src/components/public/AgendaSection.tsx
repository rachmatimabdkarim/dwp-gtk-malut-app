import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityProposal } from '../../types';
import { Calendar, MapPin, Clock, PenTool, CheckCircle, FileText, ArrowRight } from 'lucide-react';

export const AgendaSection: React.FC = () => {
  const { proposals, siteConfig, setActiveTab, setAdminSubTab } = useApp();


  const activeAgendas = proposals.filter(p => p.currentStage === 'approved' || p.currentStage === 'stage_5_ketua');

  return (
    <section id="agenda" className="py-10 md:py-14 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-dwp-burgundy text-[10px] font-bold uppercase tracking-widest bg-dwp-burgundy/10 px-3 py-0.5 rounded-full">
            {siteConfig.agendaTagText || 'Agenda Kegiatan & Absensi'}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {siteConfig.agendaTitle || 'Jadwal Kegiatan & Portal Absensi Digital'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            {siteConfig.agendaSubtext || 'Peserta yang menghadiri kegiatan dapat melakukan pengisian kehadiran dan tanda tangan digital secara langsung.'}
          </p>
        </div>

        <div className="space-y-4">
          {activeAgendas.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
              Belum ada agenda kegiatan mendatang.
            </div>
          ) : (
            activeAgendas.map(agenda => (
              <div 
                key={agenda.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-dwp-burgundy text-dwp-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {agenda.bidang}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Disetujui Ketua DWP
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-slate-900 text-base md:text-lg">
                    {agenda.title}
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-dwp-burgundy" />
                      <span>{agenda.startDate} s.d {agenda.endDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-dwp-burgundy" />
                      <span className="truncate">{agenda.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      setAdminSubTab('dashboard');
                    }}
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-semibold px-3.5 py-2 rounded-xl text-xs shadow flex items-center justify-center gap-1.5 transition-all"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Portal Admin</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>

  );
};
