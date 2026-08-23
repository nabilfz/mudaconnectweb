import {
  cleanString,
  enforceAdminAuth,
  enforceRateLimit,
  enforceSameOrigin,
  forwardToN8n,
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

    const limited = enforceRateLimit(request, 'contact-reply', 30, 60_000);
    if (limited) return limited;

    const rejectedAuth = await enforceAdminAuth(request);
    if (rejectedAuth) return rejectedAuth;

    const input = await readJsonBody(request, 12_000);
    const contactMessageId = cleanString(input?.contactMessageId, 120);
    const replySubject = cleanString(input?.replySubject, 180);
    const replyBody = cleanString(input?.replyBody, 6_000);

    if (!contactMessageId || !replySubject || !replyBody) {
      return jsonResponse({ success: false, message: 'Data balasan tidak valid.' }, 400);
    }

    return forwardToN8n({
      envName: 'N8N_CONTACT_REPLY_WEBHOOK_URL',
      request,
      forwardAuthorization: true,
      body: { contactMessageId, replySubject, replyBody },
    });
  },
};
