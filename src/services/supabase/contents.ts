import { supabase } from './client';
import { env } from './env';
import { ContentItem } from '../../types';
import { DEMO_CONTENTS } from './demoData';
import { logAuditAction } from './audit';

let localContentsCache: ContentItem[] = DEMO_CONTENTS.map((c) => ({
  ...c,
}));

export async function getPublishedContents(): Promise<ContentItem[]> {
  if (!env.isSupabaseConfigured) {
    return localContentsCache
      .filter((c) => c.status === 'published')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  try {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV) {
        console.error("[ContentQuery]", {
          code: error?.code ?? null,
          message: error?.message ?? null,
        });
      }
      throw error;
    }

    if (!data) return [];
    return data as ContentItem[];
  } catch (err) {
    throw err;
  }
}

export async function getLatestContents(limit: number = 3): Promise<ContentItem[]> {
  const published = await getPublishedContents();
  return published.slice(0, limit);
}

export async function getContentBySlug(slug: string): Promise<ContentItem | null> {
  if (!env.isSupabaseConfigured) {
    return (
      localContentsCache.find((c) => c.slug === slug && c.status === 'published') ||
      null
    );
  }

  try {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.error("[ContentQuery]", {
          code: error?.code ?? null,
          message: error?.message ?? null,
        });
      }
      throw error;
    }

    if (!data) return null;
    return data as ContentItem;
  } catch (err) {
    throw err;
  }
}

export async function getAllContentsAdmin(): Promise<ContentItem[]> {
  if (!env.isSupabaseConfigured) {
    return localContentsCache;
  }

  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin contents:', error);
    throw error;
  }

  return data as ContentItem[];
}

export async function createContentAdmin(itemData: Partial<ContentItem>): Promise<ContentItem | null> {
  const now = new Date().toISOString();
  const slug = itemData.slug || (itemData.title || 'konten').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const status: 'published' | 'draft' | 'archived' = itemData.status || 'draft';

  const newItemPayload = {
    title: itemData.title || 'Konten Baru',
    slug,
    excerpt: itemData.excerpt || '',
    body: itemData.body || '',
    content_type: itemData.content_type || 'article',
    media_path: itemData.media_path || null,
    thumbnail_path: itemData.thumbnail_path || null,
    caption_path: itemData.caption_path || null,
    transcript: itemData.transcript || null,
    alt_text: itemData.alt_text || null,
    status,
  };

  if (!env.isSupabaseConfigured) {
    const localContent: ContentItem = {
      ...newItemPayload,
      id: 'c-' + Date.now(),
      created_at: now,
      updated_at: now,
    };
    localContentsCache.unshift(localContent);
    return localContent;
  }

  const insertController = new AbortController();
  const insertTimeout = window.setTimeout(
    () => insertController.abort(),
    15000
  );

  let data, error;
  try {
    const res = await supabase
      .from('content_items')
      .insert([newItemPayload])
      .select('id,slug,title,status,content_type,created_at,excerpt,body,media_path,thumbnail_path,caption_path,transcript,alt_text')
      .single()
      // @ts-ignore
      .abortSignal(insertController.signal) as any;
    
    data = res.data;
    error = res.error;
  } finally {
    window.clearTimeout(insertTimeout);
  }

  if (error) {
    console.error('[ContentQuery] Create Error:', {
      code: error?.code ?? null,
      message: error?.message ?? null,
    });
    throw error;
  }
  if (!data) {
    throw new Error('CONTENT_INSERT_RETURNED_NO_ROW');
  }

  const result = { ...(data as ContentItem) };

  await logAuditAction({
    action: 'CREATE_CONTENT',
    entityType: 'content_items',
    entityId: result.id,
    summary: `Buat konten baru "${result.title}"`,
  });

  return result;
}

export async function updateContentAdmin(id: string, itemData: Partial<ContentItem>): Promise<ContentItem | null> {
  const updateFields: Record<string, any> = { ...itemData };
  delete updateFields.id;
  delete updateFields.created_at;

  updateFields.updated_at = new Date().toISOString();

  if (!env.isSupabaseConfigured) {
    localContentsCache = localContentsCache.map((c) =>
      c.id === id ? { ...c, ...itemData, status: itemData.status || c.status } : c
    ) as any[];
    return localContentsCache.find((c) => c.id === id) || null;
  }

  const updateController = new AbortController();
  const updateTimeout = window.setTimeout(
    () => updateController.abort(),
    15000
  );

  let data, error;
  try {
    const res = await supabase
      .from('content_items')
      .update(updateFields)
      .eq('id', id)
      .select('id,slug,title,status,content_type,created_at,excerpt,body,media_path,thumbnail_path,caption_path,transcript,alt_text')
      .single()
      // @ts-ignore
      .abortSignal(updateController.signal) as any;
      
    data = res.data;
    error = res.error;
  } finally {
    window.clearTimeout(updateTimeout);
  }

  if (error) {
    console.error('Failed to update content in Supabase:', error);
    throw error;
  }
  if (!data) {
    throw new Error('CONTENT_INSERT_RETURNED_NO_ROW');
  }

  const result = data as ContentItem;

  await logAuditAction({
    action: 'UPDATE_CONTENT',
    entityType: 'content_items',
    entityId: id,
    summary: `Edit konten "${result.title}"`,
  });

  return result;
}

export async function deleteContentAdmin(id: string): Promise<boolean> {
  localContentsCache = localContentsCache.filter((c) => c.id !== id);

  if (!env.isSupabaseConfigured) {
    return true;
  }

  const { error } = await supabase.from('content_items').delete().eq('id', id);

  if (!error) {
    await logAuditAction({
      action: 'DELETE_CONTENT',
      entityType: 'content_items',
      entityId: id,
      summary: `Hapus konten ID ${id}`,
    });
  }

  return !error;
}
