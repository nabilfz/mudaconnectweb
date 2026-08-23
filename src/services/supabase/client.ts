import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabaseUrl = env.isSupabaseConfigured ? env.supabaseUrl : fallbackUrl;
export const supabaseAnonKey = env.isSupabaseConfigured ? env.supabaseAnonKey : fallbackKey;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
