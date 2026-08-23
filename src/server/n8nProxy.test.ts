import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getSecureWebhookUrl,
  cleanString,
  isValidEmail,
  isValidPhone,
  hasValidFormTiming,
  forwardToN8n,
} from './n8nProxy';

describe('n8nProxy unit tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('getSecureWebhookUrl only reads server-side webhook environment variables', () => {
    process.env.N8N_CHAT_WEBHOOK_URL = 'https://n8n.example.com/webhook/chat';
    expect(getSecureWebhookUrl('N8N_CHAT_WEBHOOK_URL')).toBe('https://n8n.example.com/webhook/chat');

    delete process.env.N8N_CHAT_WEBHOOK_URL;
    process.env.VITE_N8N_CHAT_WEBHOOK_URL = 'https://n8n.example.com/webhook/vite-chat';
    expect(getSecureWebhookUrl('N8N_CHAT_WEBHOOK_URL')).toBeNull();
  });

  it('getSecureWebhookUrl rejects non-HTTPS URLs', () => {
    process.env.N8N_CHAT_WEBHOOK_URL = 'http://n8n.example.com/webhook/chat';
    expect(getSecureWebhookUrl('N8N_CHAT_WEBHOOK_URL')).toBeNull();
  });

  it('cleanString trims and truncates correctly', () => {
    expect(cleanString('  hello world  ', 5)).toBe('hello');
    expect(cleanString(123)).toBe('');
  });

  it('isValidEmail validates emails correctly', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  it('isValidPhone validates phone numbers correctly', () => {
    expect(isValidPhone('08123456789')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
  });

  it('hasValidFormTiming validates form start time', () => {
    const startedAt = new Date(Date.now() - 5000).toISOString();
    expect(hasValidFormTiming(startedAt)).toBe(true);

    const tooFast = new Date().toISOString();
    expect(hasValidFormTiming(tooFast)).toBe(false);
  });

  it('forwardToN8n fails closed when N8N_SHARED_SECRET is missing', async () => {
    process.env.N8N_CHAT_WEBHOOK_URL = 'https://n8n.example.com/webhook/chat';
    delete process.env.N8N_SHARED_SECRET;

    const req = new Request('http://localhost:3000/api/chat', { method: 'POST' });
    const res = await forwardToN8n({
      envName: 'N8N_CHAT_WEBHOOK_URL',
      request: req,
      body: { message: 'hi' },
    });

    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.message).toContain('Layanan integrasi belum dikonfigurasi');
  });

  it('forwardToN8n fails closed when webhook URL is missing even if secret exists', async () => {
    delete process.env.N8N_CHAT_WEBHOOK_URL;
    process.env.N8N_SHARED_SECRET = 'test-secret';

    const req = new Request('http://localhost:3000/api/chat', { method: 'POST' });
    const res = await forwardToN8n({
      envName: 'N8N_CHAT_WEBHOOK_URL',
      request: req,
      body: { message: 'hi' },
    });

    expect(res.status).toBe(503);
  });
});
