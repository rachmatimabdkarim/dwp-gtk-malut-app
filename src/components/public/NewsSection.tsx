import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsArticle } from '../../types';
import { Newspaper, Calendar, User, ArrowRight, X, CheckCircle, Tag } from 'lucide-react';

export const NewsSection: React.FC = () => {
  const { news, siteConfig } = useApp();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const publishedNews = news.filter(n => n.isPublished);

  return (
    <section id="berita" className="py-10 md:py-14 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-dwp-burgundy text-[10px] font-bold uppercase tracking-widest bg-dwp-burgundy/10 px-3 py-0.5 rounded-full">
              {siteConfig.beritaTagText || 'Warta & Publikasi'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5">
              {siteConfig.beritaTitle || 'Berita & Dokumentasi Kegiatan'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              {siteConfig.beritaSubtext || 'Publikasi resmi hasil pelaksanaan kegiatan DWP GTK Provinsi Maluku Utara.'}
            </p>
          </div>
        </div>

        {publishedNews.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
            Belum ada berita terpublikasi saat ini.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedNews.map(article => (
              <div 
                key={article.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img 
                    src={article.mainImage} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 bg-dwp-burgundy/90 backdrop-blur-md text-dwp-gold text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-dwp-gold/30">
                    {article.category}
                  </div>
                </div>


                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-dwp-burgundy" /> {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-dwp-burgundy" /> {article.author}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-slate-900 text-lg leading-snug group-hover:text-dwp-burgundy transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-dwp-burgundy group-hover:translate-x-1 transition-transform">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Detail Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="relative h-64 md:h-80 bg-slate-900">
              <img 
                src={selectedArticle.mainImage} 
                alt={selectedArticle.title}
                className="w-full h-full object-cover opacity-90" 
              />
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 bg-dwp-burgundy text-dwp-gold text-xs font-semibold px-3 py-1 rounded-full">
                {selectedArticle.category}
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                  <span><Calendar className="inline w-3.5 h-3.5 text-dwp-burgundy mr-1" /> {selectedArticle.date}</span>
                  <span><User className="inline w-3.5 h-3.5 text-dwp-burgundy mr-1" /> {selectedArticle.author}</span>
                  {selectedArticle.sourceReportId && (
                    <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                      Terverifikasi Naskah LPJ
                    </span>
                  )}
                </div>

                <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
                  {selectedArticle.title}
                </h2>
              </div>

              <div className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line border-t border-slate-100 pt-4 font-sans">
                {selectedArticle.content}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Tutup Berita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
