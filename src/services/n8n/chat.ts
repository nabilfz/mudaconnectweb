import { env } from '../supabase/env';

export const chatWebhookUrl = '/api/chat';

export function isChatbotConfigured(): boolean {
  return env.isN8nChatConfigured;
}

export function getChatSessionId(): string {
  if (typeof window === 'undefined') return 'sess-default';
  const STORAGE_KEY = 'mudaconnect_chat_session_id';
  let sessionId = localStorage.getItem(STORAGE_KEY);
  if (!sessionId) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      sessionId = crypto.randomUUID();
    } else {
      sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
    }
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  return sessionId;
}

export interface ChatWebhookRequest {
  sessionId: string;
  message: string;
  pageContext: string;
  timestamp: string;
}

export interface ChatSource {
  type: string;
  title: string;
}

export interface ChatWebhookResponse {
  success: boolean;
  answer: string;
  sources: ChatSource[];
  suggestedQuestions: string[];
  usedFallback: boolean;
  needsHumanSupport: boolean;
  knowledgeFound?: boolean;
}

export async function sendChatMessage(payload: ChatWebhookRequest): Promise<ChatWebhookResponse> {
  const isConfigured = isChatbotConfigured();

  if (!isConfigured) {
    throw new Error('Layanan MudaBot belum dikonfigurasi.');
  }

  const trimmedMessage = payload.message.trim();
  if (!trimmedMessage) {
    throw new Error('EMPTY_MESSAGE');
  }

  if (trimmedMessage.length > 500) {
    throw new Error('MESSAGE_TOO_LONG');
  }

  const sanitizedPayload: ChatWebhookRequest = {
    sessionId: payload.sessionId || getChatSessionId(),
    message: trimmedMessage,
    pageContext: payload.pageContext || (typeof window !== 'undefined' ? window.location.pathname : '/'),
    timestamp: payload.timestamp || new Date().toISOString(),
  };

  const abortController = new AbortController();
  const timeoutMs = 30000;
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const response = await fetch(chatWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(sanitizedPayload),
      signal: abortController.signal,
    });

    const rawText = await response.text();

    let parsed: unknown;
    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
      throw new Error('N8N_INVALID_JSON');
    }

    if (!response.ok) {
      if (parsed && typeof parsed === 'object' && typeof (parsed as { message?: string }).message === 'string') {
        throw new Error((parsed as { message: string }).message);
      }
      throw new Error(`N8N_HTTP_${response.status}`);
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      parsed = parsed[0];
    }

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof (parsed as { success?: unknown }).success !== 'boolean' ||
      typeof (parsed as { answer?: unknown }).answer !== 'string'
    ) {
      throw new Error('N8N_INVALID_RESPONSE');
    }

    const typedParsed = parsed as Record<string, unknown>;

    const parsedSources: ChatSource[] = Array.isArray(typedParsed.sources)
      ? typedParsed.sources.map((src: { type?: string; title?: string }) => ({
          type: String(src.type || 'info'),
          title: String(src.title || 'Sumber Informasi'),
        }))
      : [];

    const parsedSuggestedQuestions: string[] = Array.isArray(typedParsed.suggestedQuestions)
      ? typedParsed.suggestedQuestions.map((q: unknown) => String(q)).filter(Boolean)
      : [];

    const chatResponse: ChatWebhookResponse = {
      success: typedParsed.success as boolean,
      answer: typedParsed.answer as string,
      sources: parsedSources,
      suggestedQuestions: parsedSuggestedQuestions,
      usedFallback: Boolean(typedParsed.usedFallback),
      needsHumanSupport: Boolean(typedParsed.needsHumanSupport),
      knowledgeFound: typedParsed.knowledgeFound !== undefined ? Boolean(typedParsed.knowledgeFound) : undefined,
    };

    return chatResponse;
  } catch (error: unknown) {
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
