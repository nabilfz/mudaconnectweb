import {
  cleanString,
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

    const limited = enforceRateLimit(request, 'chat', 15, 60_000);
    if (limited) return limited;

    const input = await readJsonBody(request, 8_000);
    const message = cleanString(input?.message, 500);
    const sessionId = cleanString(input?.sessionId, 100);

    if (!input || !message || !sessionId) {
      return jsonResponse({ success: false, message: 'Pesan tidak valid.' }, 400);
    }

    return forwardToN8n({
      envName: 'N8N_CHAT_WEBHOOK_URL',
      request,
      body: {
        sessionId,
        message,
        pageContext: cleanString(input.pageContext, 200) || '/',
        timestamp: new Date().toISOString(),
      },
    });
  },
};
