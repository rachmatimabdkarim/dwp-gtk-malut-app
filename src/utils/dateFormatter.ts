/**
 * Date Formatting Utilities for DWP App
 * Ensures standard "DD/MM/YYYY" format across all UI components.
 */

export const formatDateDDMMYYYY = (rawDate: string | Date | undefined | null): string => {
  if (!rawDate) return '-';

  try {
    // Handle string date YYYY-MM-DD or ISO string
    let dateObj: Date;
    if (typeof rawDate === 'string') {
      // If already formatted as DD/MM/YYYY, return directly
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate.trim())) {
        return rawDate.trim();
      }
      
      // If YYYY-MM-DD
      const parts = rawDate.split('T')[0].split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${day}/${month}/${year}`;
      }
      dateObj = new Date(rawDate);
    } else {
      dateObj = rawDate;
    }

    if (isNaN(dateObj.getTime())) {
      return String(rawDate);
    }

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return String(rawDate);
  }
};

/**
 * Format Date Range (e.g. 01/08/2026 s.d. 05/08/2026)
 */
export const formatDateRangeDDMMYYYY = (start: string, end: string): string => {
  const formattedStart = formatDateDDMMYYYY(start);
  const formattedEnd = formatDateDDMMYYYY(end);
  if (formattedStart === formattedEnd) return formattedStart;
  return `${formattedStart} s.d. ${formattedEnd}`;
};
