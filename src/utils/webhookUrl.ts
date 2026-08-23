const PLACEHOLDER_HOSTS = [
  'example.com',
  'yourdomain.com',
  'your-n8n-domain.example',
];

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * Webhook URLs are shipped to the browser in a Vite application, so this is
 * configuration validation—not a replacement for authentication or rate
 * limiting on the n8n workflow itself.
 */
export function isValidWebhookUrl(value: string): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const isLocalDevelopmentUrl = url.protocol === 'http:' && LOCAL_HOSTS.has(hostname);

    if (url.username || url.password) return false;
    if (url.protocol !== 'https:' && !isLocalDevelopmentUrl) return false;
    if (!url.pathname.includes('/webhook/') || url.pathname.includes('/webhook-test/')) {
      return false;
    }

    return !PLACEHOLDER_HOSTS.some(
      (placeholder) => hostname === placeholder || hostname.endsWith(`.${placeholder}`)
    );
  } catch {
    return false;
  }
}
