import { normalizeRegistrationStatus } from './enumMappers';

export function formatDateIndonesian(dateString?: string | null): string {
  if (!dateString || dateString.trim() === '' || dateString.trim() === '-') {
    return 'Jadwal belum dipublikasikan';
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Jadwal belum dipublikasikan';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return 'Jadwal belum dipublikasikan';
  }
}

export function formatDateRange(startDate?: string | null, endDate?: string | null): string {
  const startValid = startDate && startDate.trim() !== '' && startDate.trim() !== '-';
  const endValid = endDate && endDate.trim() !== '' && endDate.trim() !== '-';

  const startFormatted = startValid ? formatDateIndonesian(startDate) : null;
  const endFormatted = endValid ? formatDateIndonesian(endDate) : null;

  if (startFormatted && startFormatted !== 'Jadwal belum dipublikasikan' && endFormatted && endFormatted !== 'Jadwal belum dipublikasikan') {
    return `${startFormatted} - ${endFormatted}`;
  }
  if (startFormatted && startFormatted !== 'Jadwal belum dipublikasikan') {
    return startFormatted;
  }
  if (endFormatted && endFormatted !== 'Jadwal belum dipublikasikan') {
    return endFormatted;
  }
  return 'Jadwal belum dipublikasikan';
}

export function formatDateTimeIndonesian(dateString?: string | null): string {
  if (!dateString || dateString.trim() === '' || dateString.trim() === '-') {
    return 'Belum dipublikasikan';
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Belum dipublikasikan';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return 'Belum dipublikasikan';
  }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getStatusBadgeVariant(status: string): {
  color: string;
  bg: string;
  label: string;
} {
  const normalized = normalizeRegistrationStatus(status);
  switch (normalized) {
    case 'interest_open':
      return { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Buka Minat' };
    case 'coming_soon':
      return { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Akan Datang' };
    case 'ongoing':
      return { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Sedang Berjalan' };
    case 'completed':
      return { color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', label: 'Selesai' };
    case 'closed':
      return { color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', label: 'Ditutup' };
    default:
      return { color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200', label: status };
  }
}
