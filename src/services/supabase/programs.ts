import { supabase } from './client';
import { env } from './env';
import { Program } from '../../types';
import { DEMO_PROGRAMS } from './demoData';
import { logAuditAction } from './audit';
import {
  normalizeDeliveryMode,
  normalizeRegistrationStatus,
  normalizeContentStatus,
} from '../../utils/enumMappers';

let localProgramsCache: Program[] = DEMO_PROGRAMS.map((p) => ({
  ...p,
  is_published: p.status === 'published',
}));

export async function getPublishedPrograms(): Promise<Program[]> {
  if (!env.isSupabaseConfigured) {
    return localProgramsCache.filter((p) => p.status === 'published' || p.is_published);
  }

  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return (data as Program[]).map((p) => ({ ...p, is_published: p.status === 'published' }));
  } catch (err) {
    throw err;
  }
}

export async function getFeaturedPrograms(): Promise<Program[]> {
  const allPublished = await getPublishedPrograms();
  const featured = allPublished.filter((p) => p.is_featured);
  if (featured.length > 0) {
    return featured.slice(0, 3);
  }
  return allPublished.slice(0, 3);
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  if (!env.isSupabaseConfigured) {
    const found = localProgramsCache.find(
      (p) => p.slug === slug && (p.status === 'published' || p.is_published),
    );
    return found || null;
  }

  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return { ...(data as Program), is_published: data.status === 'published' };
  } catch (err) {
    throw err;
  }
}

export async function getAllProgramsAdmin(): Promise<Program[]> {
  if (!env.isSupabaseConfigured) {
    return localProgramsCache;
  }

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin programs:', error);
    throw error;
  }

  return (data as Program[]).map((p) => ({ ...p, is_published: p.status === 'published' }));
}

export async function getProgramByIdAdmin(id: string): Promise<Program | null> {
  if (!env.isSupabaseConfigured) {
    return localProgramsCache.find((p) => p.id === id) || null;
  }

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return { ...(data as Program), is_published: data.status === 'published' };
}

export async function createProgramAdmin(programData: Partial<Program>): Promise<Program | null> {
  const now = new Date().toISOString();
  const slug = programData.slug || (programData.title || 'program').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const delivery_mode = normalizeDeliveryMode(programData.delivery_mode);
  const registration_status = normalizeRegistrationStatus(programData.registration_status);
  const status = normalizeContentStatus(programData.status, programData.is_published);

  const newProgramPayload = {
    title: programData.title || 'Program Baru',
    slug,
    short_description: programData.short_description || '',
    description: programData.description || '',
    category: programData.category || 'Kepemudaan',
    target_audience: programData.target_audience || '',
    objectives: programData.objectives || [],
    benefits: programData.benefits || [],
    requirements: programData.requirements || [],
    delivery_mode,
    location: programData.location || '',
    start_date: programData.start_date || now.split('T')[0],
    end_date: programData.end_date || now.split('T')[0],
    registration_status,
    fee_information: programData.fee_information || 'Gratis',
    contact_information: programData.contact_information || '',
    cover_image_path: programData.cover_image_path || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    is_featured: programData.is_featured || false,
    status,
  };

  if (!env.isSupabaseConfigured) {
    const localProg: Program = {
      ...newProgramPayload,
      id: 'p-' + Date.now(),
      is_published: status === 'published',
      created_at: now,
      updated_at: now,
    };
    localProgramsCache.unshift(localProg);
    return localProg;
  }

  const { data, error } = await supabase
    .from('programs')
    .insert([newProgramPayload])
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to create program in Supabase:', error);
    throw error;
  }

  const result = { ...(data as Program), is_published: data.status === 'published' };

  await logAuditAction({
    action: 'CREATE_PROGRAM',
    entityType: 'programs',
    entityId: result.id,
    summary: `Buat program baru "${result.title}"`,
  });

  return result;
}

export async function updateProgramAdmin(id: string, programData: Partial<Program>): Promise<Program | null> {
  const now = new Date().toISOString();

  const updateFields: Record<string, any> = { ...programData, updated_at: now };

  if (programData.delivery_mode !== undefined) {
    updateFields.delivery_mode = normalizeDeliveryMode(programData.delivery_mode);
  }
  if (programData.registration_status !== undefined) {
    updateFields.registration_status = normalizeRegistrationStatus(programData.registration_status);
  }
  if (programData.status !== undefined || programData.is_published !== undefined) {
    updateFields.status = normalizeContentStatus(programData.status, programData.is_published);
  }

  delete updateFields.is_published;

  if (!env.isSupabaseConfigured) {
    localProgramsCache = localProgramsCache.map((p) =>
      p.id === id
        ? {
            ...p,
            ...updateFields,
            is_published: updateFields.status === 'published',
            updated_at: now,
          }
        : p
    );
    return localProgramsCache.find((p) => p.id === id) || null;
  }

  const { data, error } = await supabase
    .from('programs')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to update program in Supabase:', error);
    throw error;
  }

  const result = { ...(data as Program), is_published: data.status === 'published' };

  await logAuditAction({
    action: 'UPDATE_PROGRAM',
    entityType: 'programs',
    entityId: id,
    summary: `Edit program "${result.title}"`,
  });

  return result;
}

export async function deleteProgramAdmin(id: string): Promise<boolean> {
  localProgramsCache = localProgramsCache.filter((p) => p.id !== id);

  if (!env.isSupabaseConfigured) {
    return true;
  }

  const { error } = await supabase.from('programs').delete().eq('id', id);

  if (!error) {
    await logAuditAction({
      action: 'DELETE_PROGRAM',
      entityType: 'programs',
      entityId: id,
      summary: `Hapus program ID ${id}`,
    });
  }

  return !error;
}

export async function toggleProgramPublication(id: string, isPublished: boolean): Promise<boolean> {
  const status = isPublished ? 'published' : 'draft';
  return Boolean(await updateProgramAdmin(id, { is_published: isPublished, status }));
}
