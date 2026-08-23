export type UserRole = 'admin' | 'super_admin' | 'user';

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
}

export type ProgramCategory =
  | 'Pendidikan'
  | 'Keterampilan Digital'
  | 'Kepemudaan'
  | 'Sosial'
  | 'Kewirausahaan'
  | 'Pengembangan Diri';

export type ProgramDeliveryMode = 'online' | 'offline' | 'hybrid' | string;

export type ProgramRegistrationStatus =
  | 'interest_open'
  | 'coming_soon'
  | 'ongoing'
  | 'completed'
  | 'closed'
  | string;

export type ContentType = 'article' | 'campaign' | 'image' | 'audio' | 'video' | 'activity';

export interface Program {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: ProgramCategory;
  target_audience: string;
  objectives: string[];
  benefits: string[];
  requirements: string[];
  delivery_mode: ProgramDeliveryMode;
  location: string;
  start_date: string;
  end_date: string;
  registration_status: ProgramRegistrationStatus;
  fee_information: string;
  contact_information: string;
  cover_image_path: string;
  is_featured: boolean;
  is_published?: boolean;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export type FaqCategory =
  | 'Umum'
  | 'Program'
  | 'Pendaftaran'
  | 'Persyaratan'
  | 'Jadwal'
  | 'Biaya'
  | 'Sertifikat'
  | 'Kontak';

export interface FAQ {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  keywords: string[];
  sort_order: number;
  is_popular: boolean;
  is_published?: boolean;
  status: 'published' | 'draft';
  program_id?: string;
  created_at: string;
}

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  content_type: string;
  media_path: string | null;
  thumbnail_path: string | null;
  caption_path?: string | null;
  transcript?: string | null;
  alt_text: string | null;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export type SubmissionStatus = 'baru' | 'ditinjau' | 'dihubungi' | 'ditolak' | 'new' | 'reviewed' | 'contacted' | 'closed' | 'archived';

export type DecisionStatus = 'pending' | 'accepted' | 'rejected';

export type NotificationStatus = 'not_sent' | 'pending' | 'sending' | 'sent' | 'failed';

export interface Submission {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  domicile: string;
  age_range: string;
  program_id: string;
  program_title?: string;
  program_title_snapshot?: string;
  motivation: string;
  status: SubmissionStatus;
  admin_notes?: string;
  decision_status?: DecisionStatus;
  decision_at?: string | null;
  decision_by?: string | null;
  notification_status?: NotificationStatus;
  notification_sent_at?: string | null;
  notification_error?: string | null;
  created_at: string;
}

export type InterestSubmission = Submission;

export type MessageStatus = 'baru' | 'dibaca' | 'dibalas' | 'diarsipkan' | 'unread' | 'read' | 'replied' | 'archived';

export type ReplyStatus = 'not_sent' | 'pending' | 'sending' | 'sent' | 'failed';

export interface Message {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  admin_notes?: string;
  reply_status?: ReplyStatus;
  last_replied_at?: string | null;
  last_replied_by?: string | null;
  reply_error?: string | null;
  created_at: string;
}

export type ContactMessage = Message;

export interface ContactReplyEmail {
  id: string;
  contact_message_id: string;
  reply_subject: string;
  reply_body: string;
  delivery_status: ReplyStatus | string;
  sent_at?: string | null;
  sent_by?: string | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  session_id: string;
  created_at: string;
  message_count: number;
  used_fallback_count: number;
  page_context?: string;
}

export interface ChatSource {
  type: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'bot' | 'assistant';
  content: string;
  sources?: ChatSource[];
  used_fallback?: boolean;
  needs_human_support?: boolean;
  knowledge_found?: boolean;
  created_at: string;
}

export interface ChatbotSettings {
  bot_name: string;
  welcome_message: string;
  fallback_answer: string;
  n8n_webhook_url: string;
  suggested_questions: string[];
  is_enabled: boolean;
  model_name: string;
}

export interface SiteSetting {
  id: string;
  site_name: string;
  tagline: string;
  announcement_text?: string;
  hero_title: string;
  hero_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  social_instagram: string;
  social_linkedin: string;
  social_youtube: string;
  disclaimer: string;
  prototype_mode: boolean;
  chatbot_enabled: boolean;
  maintenance_mode: boolean;
}

// N8N Webhook payload & response interfaces
export interface N8nInterestPayload {
  fullName: string;
  email: string;
  phone: string;
  domicile: string;
  ageRange: string;
  programId: string;
  motivation: string;
  consentPrivacy: boolean;
  website?: string;
  formStartedAt: string;
  source: 'website';
}

export interface N8nContactPayload {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  consentPrivacy: boolean;
  website?: string;
  formStartedAt: string;
  source: 'website';
}

export interface N8nChatPayload {
  sessionId: string;
  message: string;
  pageContext: string;
  timestamp: string;
}

export interface N8nChatResponse {
  success: boolean;
  answer: string;
  sources?: ChatSource[];
  suggestedQuestions?: string[];
  usedFallback?: boolean;
  needsHumanSupport?: boolean;
  error?: string;
}
