import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { formatDateDDMMYYYY } from '../../utils/dateFormatter';

interface CustomDateInputProps {
  label?: string;
  value: string; // ISO format 'YYYY-MM-DD'
  onChange: (isoValue: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  subLabel?: string;
}

export const CustomDateInput: React.FC<CustomDateInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  className = '',
  placeholder = 'dd/mm/yyyy',
  subLabel
}) => {
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  const formattedDisplay = value ? formatDateDDMMYYYY(value) : '';

  const handleOpenPicker = () => {
    const el = hiddenDateInputRef.current;
    if (el) {
      if (typeof (el as any).showPicker === 'function') {
        try {
          (el as any).showPicker();
        } catch {
          el.click();
        }
      } else {
        el.click();
      }
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="font-bold text-slate-700 block text-xs">
          {label} {subLabel && <span className="text-[10px] text-dwp-burgundy font-semibold">{subLabel}</span>}
        </label>
      )}
      
      <div 
        onClick={handleOpenPicker}
        className={`relative flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-3 cursor-pointer hover:border-dwp-burgundy transition-all focus-within:ring-2 focus-within:ring-dwp-burgundy shadow-sm ${className}`}
      >
        <span className={`flex-1 text-xs ${formattedDisplay ? 'text-slate-900 font-bold font-mono tracking-wider' : 'text-slate-400 font-medium'}`}>
          {formattedDisplay || placeholder}
        </span>

        <Calendar className="w-4 h-4 text-dwp-burgundy shrink-0 ml-2" />

        {/* Hidden Native Date Input for picker popup */}
        <input
          ref={hiddenDateInputRef}
          type="date"
          required={required}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full pointer-events-auto"
        />
      </div>
    </div>
  );
};
