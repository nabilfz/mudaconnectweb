export interface AppEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  n8nChatWebhookUrl: string;
  n8nInterestWebhookUrl: string;
  n8nContactWebhookUrl: string;
  n8nInterestDecisionWebhookUrl: string;
  n8nContactReplyWebhookUrl: string;
  appName: string;
  appBaseUrl: string;
  apiProxyEnabled: boolean;
  isSupabaseConfigured: boolean;
  isN8nChatConfigured: boolean;
  isN8nInterestConfigured: boolean;
  isN8nContactConfigured: boolean;
  isN8nInterestDecisionConfigured: boolean;
  isN8nContactReplyConfigured: boolean;
  isDemoAdminEnabled: boolean;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

const n8nChatWebhookUrl = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL?.trim() ?? '';
const n8nInterestWebhookUrl = import.meta.env.VITE_N8N_INTEREST_WEBHOOK_URL?.trim() ?? '';
const n8nContactWebhookUrl = import.meta.env.VITE_N8N_CONTACT_WEBHOOK_URL?.trim() ?? '';
const n8nInterestDecisionWebhookUrl = import.meta.env.VITE_N8N_INTEREST_DECISION_WEBHOOK_URL?.trim() ?? '';
const n8nContactReplyWebhookUrl = import.meta.env.VITE_N8N_CONTACT_REPLY_WEBHOOK_URL?.trim() ?? '';

const appNameRaw = import.meta.env.VITE_APP_NAME?.trim() ?? '';
const appBaseUrlRaw = import.meta.env.VITE_APP_BASE_URL?.trim() ?? '';

export const env: AppEnv = {
  supabaseUrl,
  supabaseAnonKey,
  n8nChatWebhookUrl,
  n8nInterestWebhookUrl,
  n8nContactWebhookUrl,
  n8nInterestDecisionWebhookUrl,
  n8nContactReplyWebhookUrl,
  get appName(): string {
    return appNameRaw && appNameRaw !== '' ? appNameRaw : 'MudaConnect';
  },
  get appBaseUrl(): string {
    if (appBaseUrlRaw && appBaseUrlRaw !== '') return appBaseUrlRaw;
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return window.location.origin;
    }
    return 'https://mudaconnect.ai';
  },
  get apiProxyEnabled(): boolean {
    const configuredValue = import.meta.env.VITE_API_PROXY_ENABLED?.trim().toLowerCase();
    if (configuredValue === 'false') {
      return false;
    }
    return true;
  },
  get isSupabaseConfigured(): boolean {
    return (
      Boolean(this.supabaseUrl) &&
      Boolean(this.supabaseAnonKey) &&
      this.supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
      !this.supabaseUrl.includes('your-supabase-project')
    );
  },
  get isN8nChatConfigured(): boolean {
    return this.apiProxyEnabled;
  },
  get isN8nInterestConfigured(): boolean {
    return this.apiProxyEnabled;
  },
  get isN8nContactConfigured(): boolean {
    return this.apiProxyEnabled;
  },
  get isN8nInterestDecisionConfigured(): boolean {
    return this.apiProxyEnabled;
  },
  get isN8nContactReplyConfigured(): boolean {
    return this.apiProxyEnabled;
  },
  get isDemoAdminEnabled(): boolean {
    return (
      import.meta.env.DEV &&
      !this.isSupabaseConfigured &&
      import.meta.env.VITE_ENABLE_DEMO_ADMIN?.trim().toLowerCase() === 'true'
    );
  },
};

export function validateEnv(): { valid: boolean; message?: string } {
  if (!env.isSupabaseConfigured) {
    return {
      valid: false,
      message: 'Konfigurasi Supabase belum tersedia. Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY.',
    };
  }
  return { valid: true };
}
