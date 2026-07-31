import React, { useState } from 'react';
import { compressImage, CompressionResult } from '../../utils/imageCompressor';
import { Upload, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface ImageUploadCompressorProps {
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  helpText?: string;
}

export const ImageUploadCompressor: React.FC<ImageUploadCompressorProps> = ({
  label,
  value,
  onChange,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82,
  helpText
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [lastResult, setLastResult] = useState<CompressionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setErrorMsg(null);

    try {
      const result = await compressImage(file, maxWidth, maxHeight, quality);
      setLastResult(result);
      onChange(result.dataUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengompres gambar.');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-bold text-slate-800 text-xs">{label}</label>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Preview Image */}
          <div className="flex items-center gap-3">
            {value ? (
              <div className="w-16 h-16 rounded-xl border border-slate-300 bg-white overflow-hidden shadow-sm shrink-0 flex items-center justify-center">
                <img src={value} alt="Preview" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}

            <div>
              <label className="inline-flex items-center gap-2 bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow cursor-pointer transition-all">
                {isCompressing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-dwp-gold" />
                    <span>Mengompres Foto...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-dwp-gold" />
                    <span>Pilih Foto dari Perangkat</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  disabled={isCompressing}
                  className="hidden" 
                />
              </label>
              {helpText && <p className="text-[10px] text-slate-500 mt-1">{helpText}</p>}
            </div>
          </div>
        </div>

        {/* Compression Statistics Badge */}
        {lastResult && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-[11px] space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Foto Berhasil Dikompres Cerdas (WebP HD)</span>
              </span>
              <span className="bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                ⚡ Hemat {lastResult.compressionRatio}% Storage
              </span>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">
              Ukuran Awal: <strong>{lastResult.originalSizeKB} KB</strong> ➔ Ukuran Setelah Dikompres: <strong className="underline">{lastResult.compressedSizeKB} KB</strong> ({lastResult.width}x{lastResult.height}px)
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-[11px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
