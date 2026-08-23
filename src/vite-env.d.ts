/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_N8N_CHAT_WEBHOOK_URL?: string;
  readonly VITE_N8N_INTEREST_WEBHOOK_URL?: string;
  readonly VITE_N8N_CONTACT_WEBHOOK_URL?: string;
  readonly VITE_N8N_INTEREST_DECISION_WEBHOOK_URL?: string;
  readonly VITE_N8N_CONTACT_REPLY_WEBHOOK_URL?: string;
  readonly VITE_API_PROXY_ENABLED?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_BASE_URL?: string;
  readonly VITE_ENABLE_DEMO_ADMIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
