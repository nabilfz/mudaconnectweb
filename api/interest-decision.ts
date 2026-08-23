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

    const limited = enforceRateLimit(request, 'interest-decision', 30, 60_000);
    if (limited) return limited;

    const rejectedAuth = await enforceAdminAuth(request);
    if (rejectedAuth) return rejectedAuth;

    const input = await readJsonBody(request, 4_000);
    const submissionId = cleanString(input?.submissionId, 120);
    const decision = cleanString(input?.decision, 20);

    if (!submissionId || !['accepted', 'rejected'].includes(decision)) {
      return jsonResponse({ success: false, message: 'Data keputusan tidak valid.' }, 400);
    }

    return forwardToN8n({
      envName: 'N8N_INTEREST_DECISION_WEBHOOK_URL',
      request,
      forwardAuthorization: true,
      body: { submissionId, decision },
    });
  },
};
