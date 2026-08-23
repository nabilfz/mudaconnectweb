import { supabase } from './client';
import { env } from './env';
import { SiteSetting, ChatbotSettings } from '../../types';
import { DEMO_SETTINGS } from './demoData';
import { logAuditAction } from './audit';

let localSettingsCache: SiteSetting = { ...DEMO_SETTINGS };

let localChatbotCache: ChatbotSettings = {
  bot_name: 'MudaBot',
  welcome_message: 'Halo! Saya MudaBot, asisten AI Muda Movement Indonesia. Ada yang ingin kamu tanyakan mengenai program, pendaftaran, atau kegiatan kami?',
  fallback_answer: 'Terima kasih atas pertanyaanmu. Saat ini sistem kami belum menemukan jawaban spesifik. Kamu dapat menghubungi tim kami langsung melalui formulir Kontak.',
  n8n_webhook_url: env.apiProxyEnabled ? '/api/chat' : '',
  suggested_questions: [
    'Apa saja program kepemudaan yang dibuka?',
    'Bagaimana cara mendaftar program digital?',
    'Apakah seluruh program ini berbayar?',
    'Bagaimana cara menghubungi pengurus?',
  ],
  is_enabled: true,
  model_name: 'gemini-1.5-flash',
};

export interface GeneralSettingsData {
  site_name: string;
  site_tagline: string;
  announcement_text: string;
  disclaimer_text: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
}

export async function getSiteSettings(): Promise<SiteSetting> {
  if (!env.isSupabaseConfigured) {
    return localSettingsCache;
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('SITE_SETTINGS_NOT_FOUND');

    return data as SiteSetting;
  } catch (err) {
    throw err;
  }
}

export async function getGeneralSettings(): Promise<GeneralSettingsData> {
  const settings = await getSiteSettings();
  return {
    site_name: settings.site_name || env.appName,
    site_tagline: settings.tagline || 'Platform Informasi dan Partisipasi Pemuda',
    announcement_text: settings.announcement_text || '',
    disclaimer_text: settings.disclaimer || '',
    contact_email: settings.contact_email || '',
    contact_phone: settings.contact_phone || '',
    contact_address: settings.address || '',
  };
}

export async function updateGeneralSettings(data: GeneralSettingsData): Promise<boolean> {
  localSettingsCache = {
    ...localSettingsCache,
    site_name: data.site_name,
    tagline: data.site_tagline,
    announcement_text: data.announcement_text,
    disclaimer: data.disclaimer_text,
    contact_email: data.contact_email,
    contact_phone: data.contact_phone,
    address: data.contact_address,
  };

  if (!env.isSupabaseConfigured) {
    return true;
  }

  try {
    const { data: existing, error: lookupError } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (lookupError) throw lookupError;

    const payload = {
      site_name: data.site_name,
      tagline: data.site_tagline,
      announcement_text: data.announcement_text,
      disclaimer: data.disclaimer_text,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      address: data.contact_address,
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error } = await supabase.from('site_settings').update(payload).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('site_settings').insert([payload]);
      if (error) throw error;
    }

    await logAuditAction({
      action: 'UPDATE_SETTINGS',
      entityType: 'site_settings',
      summary: 'Perbarui pengaturan umum website',
    });

    return true;
  } catch (err) {
    console.error('Failed to update site_settings in Supabase:', err);
    return false;
  }
}

export async function getChatbotSettings(): Promise<ChatbotSettings> {
  return localChatbotCache;
}

export async function updateChatbotSettings(data: Partial<ChatbotSettings>): Promise<ChatbotSettings> {
  localChatbotCache = {
    ...localChatbotCache,
    ...data,
  };

  if (env.isSupabaseConfigured) {
    await logAuditAction({
      action: 'UPDATE_CHATBOT_SETTINGS',
      entityType: 'chatbot_settings',
      summary: 'Perbarui pengaturan MudaBot',
    });
  }

  return localChatbotCache;
}
