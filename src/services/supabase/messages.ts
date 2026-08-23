import { supabase } from './client';
import { env } from './env';
import { Message, MessageStatus, ContactReplyEmail } from '../../types';
import { DEMO_MESSAGES } from './demoData';
import { logAuditAction } from './audit';

let localMessagesCache: Message[] = [...DEMO_MESSAGES];

export async function getAllMessagesAdmin(): Promise<Message[]> {
  if (!env.isSupabaseConfigured) {
    return localMessagesCache.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contact messages from Supabase:', error);
    throw error;
  }

  return (data || []).map((msg: any) => ({
    ...msg,
    status: msg.message_status || msg.status,
    reply_status: msg.reply_status || 'not_sent',
    last_replied_at: msg.last_replied_at || null,
    last_replied_by: msg.last_replied_by || null,
    reply_error: msg.reply_error || null,
  })) as Message[];
}

export async function sendContactReplyAdmin(
  contactMessageId: string,
  replySubject: string,
  replyBody: string
): Promise<{ success: boolean; message: string; data?: any }> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session || !session.access_token) {
    return {
      success: false,
      message: 'Sesi admin telah berakhir. Silakan login kembali.',
    };
  }

  if (!env.apiProxyEnabled) {
    return {
      success: false,
      message: 'Layanan balasan pesan belum dikonfigurasi.',
    };
  }

  try {
    const response = await fetch('/api/contact-reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        contactMessageId,
        replySubject: replySubject.trim(),
        replyBody: replyBody.trim(),
      }),
    });

    let resData: any = {};
    try {
      resData = await response.json();
    } catch (_) {
      // Ignore json parsing error
    }

    if (!response.ok || resData.success === false) {
      const statusMap: Record<number, string> = {
        400: 'Data balasan tidak valid.',
        401: 'Sesi admin telah berakhir. Silakan login kembali.',
        403: 'Akun tidak memiliki izin untuk membalas pesan.',
        404: 'Pesan kontak tidak ditemukan.',
        409: 'Balasan sedang diproses.',
        422: 'Data pengirim belum lengkap.',
        502: 'Balasan belum berhasil dikirim. Silakan coba kembali.',
      };

      const fallbackMsg = statusMap[response.status] || 'Layanan balasan pesan sementara tidak dapat diakses.';
      const finalMsg =
        typeof resData?.message === 'string' && resData.message.trim().length > 0 && resData.message.length < 150
          ? resData.message
          : fallbackMsg;

      return {
        success: false,
        message: finalMsg,
      };
    }

    await logAuditAction({
      action: 'SEND_REPLY',
      entityType: 'contact_messages',
      entityId: contactMessageId,
      summary: `Kirim balasan email ke pengirim pesan`,
    });

    return {
      success: true,
      message: resData.message || 'Balasan berhasil dikirim melalui email.',
      data: resData,
    };
  } catch (err) {
    console.error('Error calling contact reply webhook:', err);
    return {
      success: false,
      message: 'Layanan balasan pesan sementara tidak dapat diakses.',
    };
  }
}

export async function getContactReplyHistoryAdmin(
  contactMessageId: string
): Promise<ContactReplyEmail[]> {
  if (!env.isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('contact_reply_emails')
      .select('*')
      .eq('contact_message_id', contactMessageId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not fetch contact reply history:', error.message);
      return [];
    }

    return (data || []) as ContactReplyEmail[];
  } catch (err) {
    console.warn('Error fetching contact reply history:', err);
    return [];
  }
}

export async function updateMessageStatusAdmin(
  id: string,
  status?: MessageStatus | null,
  admin_notes?: string
): Promise<Message | null> {
  if (!env.isSupabaseConfigured) {
    localMessagesCache = localMessagesCache.map((msg) =>
      msg.id === id ? { ...msg, ...(status ? { status } : {}), admin_notes: admin_notes ?? msg.admin_notes } : msg
    );
    return localMessagesCache.find((m) => m.id === id) || null;
  }

  const updateFields: Record<string, any> = {};

  if (status) {
    const statusMap: Record<string, string> = {
      baru: 'unread',
      dibaca: 'read',
      dibalas: 'replied',
      diarsipkan: 'archived',
    };
    const nextStatus = statusMap[status] || status;
    updateFields.message_status = nextStatus;
  }

  if (admin_notes !== undefined) {
    updateFields.admin_notes = admin_notes.trim();
  }
  updateFields.updated_at = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .update(updateFields)
      .eq('id', id)
      .select('id, message_status, updated_at, admin_notes')
      .maybeSingle();

    if (error) {
      console.error('[AdminStatusUpdate]', {
        resource: 'contact_messages',
        recordId: id,
        attemptedStatus: updateFields.message_status ?? null,
        errorCode: error?.code ?? null,
        errorMessage: error?.message ?? null,
      });
      return { _error: error } as any; // to signal error
    }

    if (!data) {
      console.error('Failed to update message in Supabase: data is null');
      return null;
    }

    const updatedMsg = {
      id: data.id,
      status: data.message_status,
      admin_notes: data.admin_notes,
    } as any;

    await logAuditAction({
      action: 'UPDATE_STATUS',
      entityType: 'contact_messages',
      entityId: id,
      summary: `Perbarui data pesan kontak (Status: ${updateFields.message_status ?? 'tetap'})`,
    });

    return updatedMsg;
  } catch (err) {
    console.error('Error in updateMessageStatusAdmin:', err);
    return null;
  }
}

export function recordLocalMessage(message: Message) {
  localMessagesCache.unshift(message);
}
