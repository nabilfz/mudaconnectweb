import {
  cleanString,
  enforceRateLimit,
  enforceSameOrigin,
  forwardToN8n,
  hasValidFormTiming,
  isValidEmail,
  isValidPhone,
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

    const limited = enforceRateLimit(request, 'interest', 5, 10 * 60_000);
    if (limited) return limited;

    const input = await readJsonBody(request);
    if (!input) {
      return jsonResponse({ success: false, message: 'Data formulir tidak valid.' }, 400);
    }

    if (cleanString(input.website, 120) || !hasValidFormTiming(input.formStartedAt)) {
      return jsonResponse({
        success: true,
        message: 'Formulir berhasil dikirim. Terima kasih atas minat kamu!',
      });
    }

    const body = {
      fullName: cleanString(input.fullName, 100),
      email: cleanString(input.email, 160).toLowerCase(),
      phone: cleanString(input.phone, 30),
      domicile: cleanString(input.domicile, 100),
      ageRange: cleanString(input.ageRange, 30),
      programId: cleanString(input.programId, 100),
      motivation: cleanString(input.motivation, 1_000),
      consentPrivacy: input.consentPrivacy === true,
      website: '',
      formStartedAt: cleanString(input.formStartedAt, 40),
      source: 'website',
    };

    if (
      !body.fullName ||
      !isValidEmail(body.email) ||
      !isValidPhone(body.phone) ||
      !body.domicile ||
      !body.ageRange ||
      !body.programId ||
      !body.motivation ||
      !body.consentPrivacy
    ) {
      return jsonResponse({ success: false, message: 'Lengkapi seluruh data wajib.' }, 400);
    }

    return forwardToN8n({
      envName: 'N8N_INTEREST_WEBHOOK_URL',
      request,
      body,
    });
  },
};
