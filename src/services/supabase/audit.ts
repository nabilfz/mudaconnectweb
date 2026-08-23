import { supabase } from './client';
import { env } from './env';

export async function logAuditAction(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary?: string;
}) {
  if (!env.isSupabaseConfigured) return;

  try {
    const userRes = await supabase.auth.getUser();
    const currentUserId = params.userId || userRes.data.user?.id;

    if (!currentUserId) return;

    await supabase.from('audit_logs').insert([
      {
        user_id: currentUserId,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        summary: params.summary,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    // Fail gracefully without interrupting administrative workflow
    console.warn('Audit log entry could not be saved:', err);
  }
}
