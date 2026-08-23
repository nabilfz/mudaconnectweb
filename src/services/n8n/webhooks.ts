import { env } from '../supabase/env';
import {
  N8nInterestPayload,
  N8nContactPayload,
  N8nChatPayload,
  N8nChatResponse,
} from '../../types';
import { submitContactForm as submitContactFormService } from './contact';

export async function submitInterestForm(
  payload: N8nInterestPayload,
  _programTitle?: string
): Promise<{ success: boolean; message: string; submissionId?: string; isDuplicate?: boolean }> {
  if (!env.isN8nInterestConfigured) {
    return {
      success: false,
      message: 'Layanan formulir minat belum dikonfigurasi.',
    };
  }

  // Honeypot check
  if (payload.website && payload.website.trim() !== '') {
    return {
      success: true,
      message: 'Formulir berhasil dikirim. Terima kasih atas minat kamu!',
    };
  }

  const sanitizedPayload: N8nInterestPayload = {
    fullName: payload.fullName.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    domicile: payload.domicile.trim(),
    ageRange: payload.ageRange,
    programId: payload.programId,
    motivation: payload.motivation.trim(),
    consentPrivacy: Boolean(payload.consentPrivacy),
    website: '',
    formStartedAt: payload.formStartedAt || new Date().toISOString(),
    source: 'website',
  };

  const controller = new AbortController();
  const timeoutMs = 30000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('/api/interest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(sanitizedPayload),
      signal: controller.signal,
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
          : 'Formulir berhasil dikirim. Terima kasih atas minat kamu!';
      const submissionId = data && typeof data.submissionId === 'string' ? data.submissionId : undefined;
      return {
        success: true,
        message,
        submissionId,
      };
    }

    if (response.status === 400 && data && typeof data.message === 'string' && data.message.trim() !== '') {
      return {
        success: false,
        message: data.message,
      };
    }

    if (response.status === 409) {
      return {
        success: false,
        isDuplicate: true,
        message: 'Data minat untuk program ini sudah pernah dikirimkan sebelumnya.',
      };
    }

    return {
      success: false,
      message: 'Formulir belum berhasil dikirim. Silakan periksa data dan coba kembali.',
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

export async function submitContactForm(
  payload: N8nContactPayload
): Promise<{ success: boolean; message: string; messageId?: string }> {
  return submitContactFormService(payload);
}

import { sendChatMessage } from './chat';

export async function sendChatMessageToN8n(payload: N8nChatPayload): Promise<N8nChatResponse> {
  return sendChatMessage({
    sessionId: payload.sessionId,
    message: payload.message,
    pageContext: payload.pageContext,
    timestamp: payload.timestamp,
  });
}
