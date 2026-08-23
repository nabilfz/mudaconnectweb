import { supabase } from './client';
import { env } from './env';
import { FAQ } from '../../types';
import { DEMO_FAQS } from './demoData';
import { logAuditAction } from './audit';

let localFaqsCache: FAQ[] = DEMO_FAQS.map((f) => ({
  ...f,
  is_published: f.status === 'published',
}));

export async function getPublishedFaqs(): Promise<FAQ[]> {
  if (!env.isSupabaseConfigured) {
    return localFaqsCache
      .filter((f) => f.status === 'published' || f.is_published)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return (data as FAQ[]).map((f) => ({ ...f, is_published: f.status === 'published' }));
  } catch (err) {
    throw err;
  }
}

export async function getPopularFaqs(): Promise<FAQ[]> {
  const published = await getPublishedFaqs();
  const popular = published.filter((f) => f.is_popular);
  if (popular.length > 0) return popular.slice(0, 5);
  return published.slice(0, 5);
}

export async function getAllFaqsAdmin(): Promise<FAQ[]> {
  if (!env.isSupabaseConfigured) {
    return localFaqsCache.sort((a, b) => a.sort_order - b.sort_order);
  }

  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching admin FAQs:', error);
    throw error;
  }

  return (data as FAQ[]).map((f) => ({ ...f, is_published: f.status === 'published' }));
}

export async function createFaqAdmin(faqData: Partial<FAQ>): Promise<FAQ | null> {
  const now = new Date().toISOString();
  const status: 'published' | 'draft' = faqData.is_published ? 'published' : 'draft';

  const newFaqPayload = {
    category: faqData.category || 'Umum',
    question: faqData.question || 'Pertanyaan baru?',
    answer: faqData.answer || 'Jawaban...',
    keywords: faqData.keywords || [],
    sort_order: faqData.sort_order || 1,
    is_popular: faqData.is_popular || false,
    status,
    program_id: faqData.program_id || null,
  };

  if (!env.isSupabaseConfigured) {
    const localFaq: FAQ = {
      ...newFaqPayload,
      id: 'f-' + Date.now(),
      is_published: faqData.is_published ?? true,
      created_at: now,
    };
    localFaqsCache.push(localFaq);
    return localFaq;
  }

  const { data, error } = await supabase
    .from('faqs')
    .insert([newFaqPayload])
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to create FAQ in Supabase:', error);
    throw error;
  }

  const result = { ...(data as FAQ), is_published: data.status === 'published' };

  await logAuditAction({
    action: 'CREATE_FAQ',
    entityType: 'faqs',
    entityId: result.id,
    summary: `Buat FAQ baru "${result.question.substring(0, 30)}..."`,
  });

  return result;
}

export async function updateFaqAdmin(id: string, faqData: Partial<FAQ>): Promise<FAQ | null> {
  const status = faqData.is_published !== undefined ? (faqData.is_published ? 'published' : 'draft') : undefined;

  const updateFields: Record<string, any> = { ...faqData };
  if (status) updateFields.status = status;
  delete updateFields.is_published;

  if (!env.isSupabaseConfigured) {
    localFaqsCache = localFaqsCache.map((f) =>
      f.id === id ? { ...f, ...faqData, status: status || f.status, is_published: faqData.is_published ?? f.is_published } : f
    );
    return localFaqsCache.find((f) => f.id === id) || null;
  }

  const { data, error } = await supabase
    .from('faqs')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to update FAQ in Supabase:', error);
    throw error;
  }

  const result = { ...(data as FAQ), is_published: data.status === 'published' };

  await logAuditAction({
    action: 'UPDATE_FAQ',
    entityType: 'faqs',
    entityId: id,
    summary: `Edit FAQ "${result.question.substring(0, 30)}..."`,
  });

  return result;
}

export async function deleteFaqAdmin(id: string): Promise<boolean> {
  localFaqsCache = localFaqsCache.filter((f) => f.id !== id);

  if (!env.isSupabaseConfigured) {
    return true;
  }

  const { error } = await supabase.from('faqs').delete().eq('id', id);

  if (!error) {
    await logAuditAction({
      action: 'DELETE_FAQ',
      entityType: 'faqs',
      entityId: id,
      summary: `Hapus FAQ ID ${id}`,
    });
  }

  return !error;
}
