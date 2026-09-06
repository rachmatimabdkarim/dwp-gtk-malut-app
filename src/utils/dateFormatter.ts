/**
 * Date Formatting Utilities for DWP App
 * Ensures standard "DD/MM/YYYY" format across all UI components and safe ISO conversions.
 */

/**
 * Safely parses any date representation (DD/MM/YYYY, YYYY-MM-DD, ISO string, or Date) into a valid Date object.
 */
export const parseCustomDate = (dateStr: string | Date | undefined | null): Date | null => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr;
  }

  const trimmed = String(dateStr).trim();
  if (!trimmed) return null;

  // 1. Full ISO string with timestamp
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. Format DD/MM/YYYY or DD-MM-YYYY (with optional time e.g. "14/07/2026, 10:00:00" or "14/07/2026 10.00.00")
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[,\s]+(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?)?/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1; // 0-indexed
    const year = parseInt(ddmmyyyyMatch[3], 10);
    const hour = ddmmyyyyMatch[4] ? parseInt(ddmmyyyyMatch[4], 10) : 0;
    const minute = ddmmyyyyMatch[5] ? parseInt(ddmmyyyyMatch[5], 10) : 0;
    const second = ddmmyyyyMatch[6] ? parseInt(ddmmyyyyMatch[6], 10) : 0;

    const parsed = new Date(Date.UTC(year, month, day, hour, minute, second));
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // 3. Format YYYY-MM-DD or YYYY/MM/DD (with optional time)
  const yyyymmddMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[,\sT]+(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?)?/);
  if (yyyymmddMatch) {
    const year = parseInt(yyyymmddMatch[1], 10);
    const month = parseInt(yyyymmddMatch[2], 10) - 1;
    const day = parseInt(yyyymmddMatch[3], 10);
    const hour = yyyymmddMatch[4] ? parseInt(yyyymmddMatch[4], 10) : 0;
    const minute = yyyymmddMatch[5] ? parseInt(yyyymmddMatch[5], 10) : 0;
    const second = yyyymmddMatch[6] ? parseInt(yyyymmddMatch[6], 10) : 0;

    const parsed = new Date(Date.UTC(year, month, day, hour, minute, second));
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // 4. Standard Date fallback
  const fallback = new Date(trimmed);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
};

/**
 * Safely converts any date representation to an ISO string (for Supabase timestamptz).
 * Guarantees no RangeError: Invalid time value is thrown.
 */
export const toISOStringSafe = (dateStr: string | Date | undefined | null, fallback = new Date().toISOString()): string => {
  const d = parseCustomDate(dateStr);
  if (!d) return fallback;
  try {
    return d.toISOString();
  } catch {
    return fallback;
  }
};

/**
 * Safely converts any date representation to YYYY-MM-DD format (for Supabase DATE columns).
 */
export const toISODateSafe = (dateStr: string | Date | undefined | null, fallback = new Date().toISOString().split('T')[0]): string => {
  const d = parseCustomDate(dateStr);
  if (!d) return fallback;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDDMMYYYY = (rawDate: string | Date | undefined | null): string => {
  if (!rawDate) return '-';

  try {
    // If already formatted as standard DD/MM/YYYY, return directly
    if (typeof rawDate === 'string') {
      const trimmed = rawDate.trim();
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
        return trimmed;
      }
    }

    const dateObj = parseCustomDate(rawDate);
    if (!dateObj || isNaN(dateObj.getTime())) {
      return String(rawDate);
    }

    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObj.getUTCFullYear();

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
