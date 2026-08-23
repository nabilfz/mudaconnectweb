import { supabase } from './client';
import { env } from './env';

export interface UploadOptions {
  bucket?: 'public-media' | 'private-exports';
  folder: 'programs' | 'contents' | 'settings' | 'uploads';
  entityId?: string;
  onProgress?: (percent: number) => void;
}

type MediaKind = 'image' | 'audio' | 'video';

const MEDIA_RULES: Record<
  MediaKind,
  { mimeTypes: Set<string>; extensions: Set<string>; maxBytes: number; label: string }
> = {
  image: {
    mimeTypes: new Set(['image/jpeg', 'image/png', 'image/webp']),
    extensions: new Set(['jpg', 'jpeg', 'png', 'webp']),
    maxBytes: 10 * 1024 * 1024,
    label: 'gambar',
  },
  audio: {
    mimeTypes: new Set(['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4']),
    extensions: new Set(['mp3', 'wav', 'm4a']),
    maxBytes: 25 * 1024 * 1024,
    label: 'audio',
  },
  video: {
    mimeTypes: new Set(['video/mp4', 'video/webm']),
    extensions: new Set(['mp4', 'webm']),
    maxBytes: 100 * 1024 * 1024,
    label: 'video',
  },
};

function getMediaKind(file: File): MediaKind | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return (
    (Object.entries(MEDIA_RULES) as [MediaKind, (typeof MEDIA_RULES)[MediaKind]][])
      .find(([, rule]) => rule.mimeTypes.has(file.type) && rule.extensions.has(extension))?.[0] ??
    null
  );
}

export function validateMediaFile(file: File): { valid: boolean; error?: string } {
  const mediaKind = getMediaKind(file);
  if (!mediaKind) {
    return {
      valid: false,
      error:
        'Tipe atau ekstensi file tidak didukung. Gunakan JPG/PNG/WEBP, MP3/WAV/M4A, atau MP4/WEBM.',
    };
  }

  const rule = MEDIA_RULES[mediaKind];
  if (file.size > rule.maxBytes) {
    const maxMegabytes = Math.round(rule.maxBytes / 1024 / 1024);
    return {
      valid: false,
      error: `Ukuran ${rule.label} melebihi batas maksimal ${maxMegabytes} MB.`,
    };
  }

  return { valid: true };
}

export async function uploadMediaFile(
  file: File,
  options: UploadOptions
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const bucket = options.bucket || 'public-media';
  const sanitizedName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+/, '');
  const uniquePrefix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const uniqueName = `${uniquePrefix}-${sanitizedName}`;
  const safeEntityId = options.entityId?.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = safeEntityId
    ? `${options.folder}/${safeEntityId}/${uniqueName}`
    : `${options.folder}/${uniqueName}`;

  if (options.onProgress) options.onProgress(30);

  if (!env.isSupabaseConfigured) {
    if (options.onProgress) options.onProgress(100);
    const mockUrl = URL.createObjectURL(file);
    return {
      success: true,
      publicUrl: mockUrl,
    };
  }

  try {
    if (options.onProgress) options.onProgress(60);

    const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (uploadErr) {
      return { success: false, error: 'Unggahan gagal disimpan. Silakan coba kembali.' };
    }

    if (options.onProgress) options.onProgress(90);

    if (options.onProgress) options.onProgress(100);

    if (bucket === 'private-exports') {
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) {
        return { success: false, error: 'Tautan unduhan privat gagal dibuat.' };
      }
      return { success: true, publicUrl: data.signedUrl };
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return {
      success: true,
      publicUrl: urlData.publicUrl,
    };
  } catch {
    return {
      success: false,
      error: 'Terjadi kendala saat mengunggah media. Silakan coba kembali.',
    };
  }
}

export async function uploadFileToBucket(
  bucketName: string,
  folder: string,
  file: File
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const bucket = bucketName === 'private-exports' ? 'private-exports' : 'public-media';
  const safeFolder: UploadOptions['folder'] = ['programs', 'contents', 'settings'].includes(folder)
    ? (folder as UploadOptions['folder'])
    : 'uploads';
  return uploadMediaFile(file, { bucket, folder: safeFolder });
}
