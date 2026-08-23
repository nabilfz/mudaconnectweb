import {
  cleanString,
  enforceRateLimit,
  enforceSameOrigin,
  forwardToN8n,
  hasValidFormTiming,
  isValidEmail,
  jsonResponse,
  readJsonBody,
} from '../src/server/n8nProxy.js';

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return jsonResponse({ success: false, message: 'Metode tidak diizinkan.' }, 405, {
        Allow: 'POST',
      });
    }

    const rejectedOrigin = enforceSameOrigin(request);
    if (rejectedOrigin) return rejectedOrigin;

    const limited = enforceRateLimit(request, 'contact', 5, 10 * 60_000);
    if (limited) return limited;

    const input = await readJsonBody(request);
    if (!input) {
      return jsonResponse({ success: false, message: 'Data formulir tidak valid.' }, 400);
    }

    if (cleanString(input.website, 120) || !hasValidFormTiming(input.formStartedAt)) {
      return jsonResponse({
        success: true,
        message: 'Pesan berhasil dikirim. Tim MudaConnect akan meninjaunya.',
      });
    }

    const body = {
      fullName: cleanString(input.fullName, 100),
      email: cleanString(input.email, 160).toLowerCase(),
      subject: cleanString(input.subject, 160),
      message: cleanString(input.message, 2_000),
      consentPrivacy: input.consentPrivacy === true,
      website: '',
      formStartedAt: cleanString(input.formStartedAt, 40),
      source: 'website',
    };

    if (
      !body.fullName ||
      !isValidEmail(body.email) ||
      !body.subject ||
      !body.message ||
      !body.consentPrivacy
    ) {
      return jsonResponse({ success: false, message: 'Lengkapi seluruh data wajib.' }, 400);
    }

    return forwardToN8n({
      envName: 'N8N_CONTACT_WEBHOOK_URL',
      request,
      body,
    });
  },
};
