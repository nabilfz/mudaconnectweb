export const deliveryModeOptions = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Tatap Muka' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const registrationStatusOptions = [
  { value: 'interest_open', label: 'Buka Minat' },
  { value: 'coming_soon', label: 'Akan Datang' },
  { value: 'ongoing', label: 'Sedang Berjalan' },
  { value: 'completed', label: 'Selesai' },
  { value: 'closed', label: 'Ditutup' },
];

export const contentStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Dipublikasikan' },
  { value: 'archived', label: 'Diarsipkan' },
];

export const deliveryModeMap: Record<string, string> = {
  online: 'online',
  Online: 'online',
  offline: 'offline',
  Offline: 'offline',
  'Tatap Muka': 'offline',
  'tatap muka': 'offline',
  luring: 'offline',
  Luring: 'offline',
  daring: 'online',
  Daring: 'online',
  hybrid: 'hybrid',
  Hybrid: 'hybrid',
};

export const registrationStatusMap: Record<string, string> = {
  interest_open: 'interest_open',
  'Buka Minat': 'interest_open',
  'buka minat': 'interest_open',
  Dibuka: 'interest_open',
  dibuka: 'interest_open',
  coming_soon: 'coming_soon',
  'Akan Datang': 'coming_soon',
  'akan datang': 'coming_soon',
  'segera hadir': 'coming_soon',
  'Segera Hadir': 'coming_soon',
  ongoing: 'ongoing',
  'Sedang Berjalan': 'ongoing',
  'sedang berjalan': 'ongoing',
  Berjalan: 'ongoing',
  berjalan: 'ongoing',
  completed: 'completed',
  Selesai: 'completed',
  selesai: 'completed',
  'Telah Selesai': 'completed',
  'telah selesai': 'completed',
  closed: 'closed',
  Ditutup: 'closed',
  ditutup: 'closed',
};

export function cleanRawEnumValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  while (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'")) ||
    (str.startsWith('\\"') && str.endsWith('\\"')) ||
    (str.startsWith('\\') && str.endsWith('\\'))
  ) {
    str = str.replace(/^["'\\]+|["'\\]+$/g, '').trim();
  }
  return str;
}

export function normalizeDeliveryMode(value?: unknown): 'online' | 'offline' | 'hybrid' {
  const cleaned = cleanRawEnumValue(value);
  if (!cleaned) return 'online';
  const mapped = deliveryModeMap[cleaned] || deliveryModeMap[cleaned.toLowerCase()];
  if (mapped === 'online' || mapped === 'offline' || mapped === 'hybrid') {
    return mapped;
  }
  return 'online';
}

export function normalizeRegistrationStatus(
  value?: unknown
): 'interest_open' | 'coming_soon' | 'ongoing' | 'completed' | 'closed' {
  const cleaned = cleanRawEnumValue(value);
  if (!cleaned) return 'coming_soon';
  const mapped = registrationStatusMap[cleaned] || registrationStatusMap[cleaned.toLowerCase()];
  if (
    mapped === 'interest_open' ||
    mapped === 'coming_soon' ||
    mapped === 'ongoing' ||
    mapped === 'completed' ||
    mapped === 'closed'
  ) {
    return mapped;
  }
  return 'coming_soon';
}

export function normalizeContentStatus(
  value?: unknown,
  isPublished?: boolean
): 'published' | 'draft' | 'archived' {
  if (isPublished !== undefined) {
    return isPublished ? 'published' : 'draft';
  }
  const cleaned = cleanRawEnumValue(value);
  if (!cleaned) return 'draft';

  const map: Record<string, 'published' | 'draft' | 'archived'> = {
    draft: 'draft',
    Draft: 'draft',
    published: 'published',
    Published: 'published',
    Dipublikasikan: 'published',
    archived: 'archived',
    Archived: 'archived',
    Diarsipkan: 'archived',
  };

  return map[cleaned] || map[cleaned.toLowerCase()] || 'draft';
}

/**
 * Maps raw registration_status database enum or localized string to human-readable Indonesian.
 * interest_open → Form minat dibuka
 * coming_soon → Segera hadir
 * ongoing → Sedang berjalan
 * completed → Telah selesai
 * closed → Ditutup
 */
export function mapRegistrationStatus(status?: string | null): string {
  if (!status) return 'Status tidak diketahui';
  const normalized = normalizeRegistrationStatus(status);
  switch (normalized) {
    case 'interest_open':
      return 'Form minat dibuka';
    case 'coming_soon':
      return 'Segera hadir';
    case 'ongoing':
      return 'Sedang berjalan';
    case 'completed':
      return 'Telah selesai';
    case 'closed':
      return 'Ditutup';
    default:
      return status;
  }
}

/**
 * Maps raw delivery_mode database enum to human-readable Indonesian sentence case.
 * online → Daring
 * offline → Tatap muka
 * hybrid → Hybrid
 */
export function mapDeliveryMode(mode?: string | null): string {
  if (!mode) return 'Informasi belum tersedia';
  const normalized = normalizeDeliveryMode(mode);
  switch (normalized) {
    case 'online':
      return 'Daring';
    case 'offline':
      return 'Tatap muka';
    case 'hybrid':
      return 'Hybrid';
    default:
      return mode;
  }
}

/**
 * Maps decision_status enum to human-readable Indonesian badge label.
 * pending → Belum Diputuskan
 * accepted → Diterima
 * rejected → Ditolak
 */
export function mapDecisionStatus(status?: string | null): string {
  if (!status) return 'Belum Diputuskan';
  const s = status.toLowerCase().trim();
  switch (s) {
    case 'accepted':
      return 'Diterima';
    case 'rejected':
      return 'Ditolak';
    case 'pending':
    default:
      return 'Belum Diputuskan';
  }
}

/**
 * Maps notification_status enum to human-readable Indonesian label.
 * not_sent → Email belum dikirim
 * pending → Menunggu pengiriman
 * sending → Sedang mengirim email
 * sent → Email berhasil dikirim
 * failed → Email gagal dikirim
 */
export function mapNotificationStatus(status?: string | null): string {
  if (!status) return 'Email belum dikirim';
  const s = status.toLowerCase().trim();
  switch (s) {
    case 'not_sent':
      return 'Email belum dikirim';
    case 'pending':
      return 'Menunggu pengiriman';
    case 'sending':
      return 'Sedang mengirim email';
    case 'sent':
      return 'Email berhasil dikirim';
    case 'failed':
      return 'Email gagal dikirim';
    default:
      return 'Email belum dikirim';
  }
}

/**
 * Maps reply_status enum to human-readable Indonesian text:
 * not_sent → Belum Dibalas
 * pending → Menunggu Pengiriman
 * sending → Sedang Mengirim
 * sent → Balasan Terkirim
 * failed → Pengiriman Gagal
 */
export function mapReplyStatus(status?: string | null): string {
  if (!status) return 'Belum Dibalas';
  const s = status.toLowerCase().trim();
  switch (s) {
    case 'not_sent':
      return 'Belum Dibalas';
    case 'pending':
      return 'Menunggu Pengiriman';
    case 'sending':
      return 'Sedang Mengirim';
    case 'sent':
      return 'Balasan Terkirim';
    case 'failed':
      return 'Pengiriman Gagal';
    default:
      return 'Belum Dibalas';
  }
}

/**
 * Maps raw content type database enum to human-readable Indonesian.
 * article → Artikel
 * campaign → Kampanye
 * image → Foto
 * audio → Audio
 * video → Video
 * activity → Kegiatan
 */
export function mapContentType(type?: string | null): string {
  if (!type) return 'Kegiatan';
  const t = type.toLowerCase().trim();
  switch (t) {
    case 'article':
    case 'artikel':
      return 'Artikel';
    case 'campaign':
    case 'kampanye':
      return 'Kampanye';
    case 'image':
    case 'foto':
    case 'galeri foto':
      return 'Foto';
    case 'audio':
      return 'Audio';
    case 'video':
      return 'Video';
    case 'activity':
    case 'kegiatan':
      return 'Kegiatan';
    default:
      return type;
  }
}
