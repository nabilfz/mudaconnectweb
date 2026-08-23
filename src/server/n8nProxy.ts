import { createClient } from '@supabase/supabase-js';

export interface ProxyOptions {
  envName:
    | 'N8N_CHAT_WEBHOOK_URL'
    | 'N8N_INTEREST_WEBHOOK_URL'
    | 'N8N_CONTACT_WEBHOOK_URL'
    | 'N8N_INTEREST_DECISION_WEBHOOK_URL'
    | 'N8N_CONTACT_REPLY_WEBHOOK_URL';
  request: Request;
  body: Record<string, unknown>;
  forwardAuthorization?: boolean;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function getSecureWebhookUrl(envName: ProxyOptions['envName']): string | null {
  const viteFallbackName = `VITE_${envName}`;

  const rawValue = (process.env[envName] ?? process.env[viteFallbackName])?.trim();

  if (!rawValue) return null;

  try {
    const url = new URL(rawValue);
    if (url.protocol !== 'https:') {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function enforceSameOrigin(request: Request): Response | null {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) {
    return null;
  }

  try {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      return jsonResponse({ success: false, message: 'Permintaan tidak sah.' }, 403);
    }
  } catch {
    return jsonResponse({ success: false, message: 'Permintaan tidak sah.' }, 403);
  }

  return null;
}

export function enforceRateLimit(
  request: Request,
  actionKey: string,
  limit: number,
  windowMs: number
): Response | null {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    '127.0.0.1';

  const key = `${actionKey}:${ip}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= limit) {
    return jsonResponse(
      { success: false, message: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.' },
      429,
      { 'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)) }
    );
  }

  entry.count += 1;
  return null;
}

export async function readJsonBody(
  request: Request,
  maxBytes = 16_000
): Promise<Record<string, any> | null> {
  const contentLength = Number(request.headers.get('content-length') || '0');
  if (contentLength > maxBytes) {
    return null;
  }

  try {
    const text = await request.text();
    if (!text) return null;
    if (text.length > maxBytes) return null;
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, any>;
  } catch {
    return null;
  }
}

export async function enforceAdminAuth(request: Request): Promise<Response | null> {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return jsonResponse({ success: false, message: 'Sesi admin tidak valid.' }, 401);
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return jsonResponse({ success: false, message: 'Sesi admin tidak valid.' }, 401);
  }

  const supabaseUrl = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.trim();
  const supabaseKey = (process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY)?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({ success: false, message: 'Layanan otentikasi belum dikonfigurasi.' }, 503);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return jsonResponse({ success: false, message: 'Sesi admin tidak valid atau telah berakhir.' }, 401);
    }

    return null;
  } catch {
    return jsonResponse({ success: false, message: 'Gagal memverifikasi sesi admin.' }, 500);
  }
}

export async function forwardToN8n(options: ProxyOptions): Promise<Response> {
  const webhookUrl = getSecureWebhookUrl(options.envName);
  if (!webhookUrl) {
    return jsonResponse(
      { success: false, message: 'Layanan integrasi belum dikonfigurasi pada server.' },
      503
    );
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });

  const sharedSecret = process.env.N8N_SHARED_SECRET?.trim();
  if (sharedSecret) {
    headers.set('X-MudaConnect-Secret', sharedSecret);
  }

  if (options.forwardAuthorization) {
    const authHeader = options.request.headers.get('authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(options.body),
      signal: controller.signal,
    });

    const rawText = await n8nResponse.text();
    let data: unknown = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = { rawText };
    }

    if (Array.isArray(data) && data.length > 0) {
      data = data[0];
    }

    const isSuccessStatus = n8nResponse.ok;
    const isObject = data && typeof data === 'object' && !Array.isArray(data);
    const responsePayload = isObject ? (data as Record<string, unknown>) : { data };

    return jsonResponse(responsePayload, isSuccessStatus ? 200 : n8nResponse.status);
  } catch {
    return jsonResponse(
      { success: false, message: 'Gagal terhubung ke layanan integrasi.' },
      502
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export function cleanString(val: unknown, maxLen = 500): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[0-9+\s()-]{8,20}$/.test(phone);
}

export function hasValidFormTiming(startedAtRaw: unknown, minSeconds = 2): boolean {
  if (typeof startedAtRaw !== 'string') return false;
  const startedAt = Date.parse(startedAtRaw);
  if (Number.isNaN(startedAt)) return false;
  const elapsed = Date.now() - startedAt;
  return elapsed >= minSeconds * 1000 && elapsed <= 24 * 60 * 60 * 1000;
}
