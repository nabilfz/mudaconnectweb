-- Reproducible base schema for MudaConnect.
-- Safe for a new Supabase project. Existing tables are never dropped.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin', 'super_admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null default '',
  description text not null default '',
  category text not null default 'Kepemudaan',
  target_audience text not null default '',
  objectives text[] not null default '{}',
  benefits text[] not null default '{}',
  requirements text[] not null default '{}',
  delivery_mode text not null default 'online',
  location text not null default '',
  start_date date,
  end_date date,
  registration_status text not null default 'coming_soon',
  fee_information text not null default '',
  contact_information text not null default '',
  cover_image_path text,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('published', 'draft', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programs(id) on delete set null,
  category text not null default 'Umum',
  question text not null,
  answer text not null,
  keywords text[] not null default '{}',
  sort_order integer not null default 0,
  is_popular boolean not null default false,
  status text not null default 'draft' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  content_type text not null default 'article'
    check (content_type in ('article', 'campaign', 'image', 'audio', 'video', 'activity')),
  media_path text,
  thumbnail_path text,
  caption_path text,
  transcript text,
  alt_text text,
  status text not null default 'draft' check (status in ('published', 'draft', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interest_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  domicile text not null,
  age_range text not null,
  program_id uuid references public.programs(id) on delete set null,
  program_title_snapshot text,
  motivation text not null,
  consent_privacy boolean not null default false,
  source text not null default 'website',
  submission_status text not null default 'new'
    check (submission_status in ('new', 'reviewed', 'contacted', 'closed', 'archived')),
  admin_notes text,
  decision_status text not null default 'pending'
    check (decision_status in ('pending', 'accepted', 'rejected')),
  decision_at timestamptz,
  decision_by uuid references public.profiles(id) on delete set null,
  notification_status text not null default 'not_sent'
    check (notification_status in ('not_sent', 'pending', 'sending', 'sent', 'failed')),
  notification_sent_at timestamptz,
  notification_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  consent_privacy boolean not null default false,
  source text not null default 'website',
  message_status text not null default 'unread'
    check (message_status in ('unread', 'read', 'replied', 'archived')),
  admin_notes text,
  reply_status text not null default 'not_sent'
    check (reply_status in ('not_sent', 'pending', 'sending', 'sent', 'failed')),
  last_replied_at timestamptz,
  last_replied_by uuid references public.profiles(id) on delete set null,
  reply_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_reply_emails (
  id uuid primary key default gen_random_uuid(),
  contact_message_id uuid not null references public.contact_messages(id) on delete cascade,
  reply_subject text not null,
  reply_body text not null,
  delivery_status text not null default 'pending'
    check (delivery_status in ('not_sent', 'pending', 'sending', 'sent', 'failed')),
  sent_at timestamptz,
  sent_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  page_context text,
  message_count integer not null default 0,
  used_fallback_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.chat_sessions(session_id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'bot')),
  content text not null,
  sources jsonb not null default '[]'::jsonb,
  used_fallback boolean not null default false,
  needs_human_support boolean not null default false,
  knowledge_found boolean,
  response_time_ms integer,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'MudaConnect',
  tagline text not null default 'Platform Informasi dan Partisipasi Pemuda',
  announcement_text text not null default '',
  hero_title text not null default '',
  hero_description text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  address text not null default '',
  social_instagram text not null default '',
  social_linkedin text not null default '',
  social_youtube text not null default '',
  disclaimer text not null default '',
  prototype_mode boolean not null default false,
  chatbot_enabled boolean not null default true,
  maintenance_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists programs_public_list_idx
  on public.programs (status, is_featured, created_at desc);
create index if not exists faqs_public_list_idx
  on public.faqs (status, sort_order);
create index if not exists content_items_public_list_idx
  on public.content_items (status, created_at desc);
create index if not exists interest_submissions_admin_list_idx
  on public.interest_submissions (submission_status, created_at desc);
create index if not exists contact_messages_admin_list_idx
  on public.contact_messages (message_status, created_at desc);
create index if not exists chat_messages_session_idx
  on public.chat_messages (session_id, created_at);
create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists programs_set_updated_at on public.programs;
create trigger programs_set_updated_at
before update on public.programs
for each row execute function public.set_updated_at();

drop trigger if exists faqs_set_updated_at on public.faqs;
create trigger faqs_set_updated_at
before update on public.faqs
for each row execute function public.set_updated_at();

drop trigger if exists content_items_set_updated_at on public.content_items;
create trigger content_items_set_updated_at
before update on public.content_items
for each row execute function public.set_updated_at();

drop trigger if exists interest_submissions_set_updated_at on public.interest_submissions;
create trigger interest_submissions_set_updated_at
before update on public.interest_submissions
for each row execute function public.set_updated_at();

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

drop trigger if exists chat_sessions_set_updated_at on public.chat_sessions;
create trigger chat_sessions_set_updated_at
before update on public.chat_sessions
for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.site_settings (site_name, tagline)
select 'MudaConnect', 'Platform Informasi dan Partisipasi Pemuda'
where not exists (select 1 from public.site_settings);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'public-media',
    'public-media',
    true,
    104857600,
    array[
      'image/jpeg', 'image/png', 'image/webp',
      'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4',
      'video/mp4', 'video/webm',
      'text/vtt'
    ]
  ),
  (
    'private-exports',
    'private-exports',
    false,
    52428800,
    array['text/csv', 'application/pdf', 'application/zip']
  )
on conflict (id) do nothing;
