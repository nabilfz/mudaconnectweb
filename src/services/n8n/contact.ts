import { N8nContactPayload } from '../../types';
import { env } from '../supabase/env';

export const contactWebhookUrl = '/api/contact';

export interface ContactWebhookResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

export function isContactConfigured(): boolean {
  return env.isN8nContactConfigured;
}

export async function submitContactForm(
  payload: N8nContactPayload
): Promise<ContactWebhookResponse> {
  const isConfigured = isContactConfigured();

  if (!isConfigured) {
    return {
      success: false,
      message: 'Layanan formulir kontak belum dikonfigurasi.',
    };
  }

  // Honeypot check
  if (payload.website && payload.website.trim() !== '') {
    return {
      success: true,
      message: 'Pesan berhasil dikirim. Tim MudaConnect akan meninjaunya.',
    };
  }

  const sanitizedPayload = {
    fullName: payload.fullName.trim(),
    email: payload.email.trim(),
    subject: payload.subject.trim(),
    message: payload.message.trim(),
    consentPrivacy: Boolean(payload.consentPrivacy),
    website: '',
    formStartedAt: payload.formStartedAt || new Date().toISOString(),
  };

  const abortController = new AbortController();
  const timeoutMs = 30000;
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const response = await fetch(contactWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(sanitizedPayload),
      signal: abortController.signal,
    });

    const rawText = await response.text();
    let data: Record<string, unknown> | null = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }
    } catch {
      // Invalid JSON
    }

    if (response.ok) {
      const message =
        data && typeof data.message === 'string' && data.message.trim() !== ''
          ? data.message
          : 'Pesan berhasil dikirim. Tim MudaConnect akan meninjaunya.';
      const messageId = data && typeof data.messageId === 'string' ? data.messageId : undefined;

      return {
        success: true,
        message,
        messageId,
      };
    }

    if (response.status === 400 && data && typeof data.message === 'string' && data.message.trim() !== '') {
      return {
        success: false,
        message: data.message,
      };
    }

    return {
      success: false,
      message: 'Pesan belum berhasil dikirim. Silakan periksa data dan coba kembali.',
    };
  } catch {
    return {
      success: false,
      message: 'Layanan sementara tidak dapat diakses. Silakan coba kembali.',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
