-- MudaConnect production hardening
-- Apply after the base tables and storage buckets have been created.
-- Public form/chat writes are performed by n8n with the service role, never by anon.

create or replace function public.is_mudaconnect_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active = true
      and role in ('admin', 'super_admin')
  );
$$;

revoke all on function public.is_mudaconnect_admin() from public;
grant execute on function public.is_mudaconnect_admin() to authenticated, service_role;

alter table public.content_items
  add column if not exists caption_path text,
  add column if not exists transcript text;

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.faqs enable row level security;
alter table public.content_items enable row level security;
alter table public.interest_submissions enable row level security;
alter table public.contact_messages enable row level security;
alter table public.contact_reply_emails enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: an authenticated account can read its own row; admins manage all rows.
drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all
on public.profiles
for all
to authenticated
using (public.is_mudaconnect_admin())
with check (public.is_mudaconnect_admin());

-- Published editorial data is readable publicly. Draft and archived rows remain private.
drop policy if exists programs_public_read on public.programs;
create policy programs_public_read
on public.programs
for select
to anon, authenticated
using (status = 'published');

drop policy if exists programs_admin_all on public.programs;
create policy programs_admin_all
on public.programs
for all
to authenticated
using (public.is_mudaconnect_admin())
with check (public.is_mudaconnect_admin());

drop policy if exists faqs_public_read on public.faqs;
create policy faqs_public_read
on public.faqs
for select
to anon, authenticated
using (status = 'published');

drop policy if exists faqs_admin_all on public.faqs;
create policy faqs_admin_all
on public.faqs
for all
to authenticated
using (public.is_mudaconnect_admin())
with check (public.is_mudaconnect_admin());

drop policy if exists content_items_public_read on public.content_items;
create policy content_items_public_read
on public.content_items
for select
to anon, authenticated
using (status = 'published');

drop policy if exists content_items_admin_all on public.content_items;
create policy content_items_admin_all
on public.content_items
for all
to authenticated
using (public.is_mudaconnect_admin())
with check (public.is_mudaconnect_admin());

-- Operational and personal data is never exposed to anon.
drop policy if exists interest_submissions_admin_all on public.interest_submissions;
create policy interest_submissions_admin_all
on public.interest_submissions
for all
to authenticated
using (public.is_mudaconnect_admin())
with check (public.is_mudaconnect_admin());

drop policy if exists contact_messages_admin_all on public.contact_messages;
create policy contact_messages_admin_all
on public.contact_messages
for all
to authenticated
using (public.is_mudaconnect_admin())
with check (public.is_mudaconnect_admin());

drop policy if exists contact_reply_emails_admin_all on public.contact_reply_emails;
create policy contact_reply_emails_admin_all
on public.contact_reply_emails
for all
to authenticated
using (public.is_mudaconnect_admin())
with check (public.is_mudaconnect_admin());

drop policy if exists chat_sessions_admin_all on public.chat_sessions;
create policy chat_sessions_admin_all
on public.chat_sessions
for all
to authenticated
using (public.is_mudaconnect_admin())
with check (public.is_mudaconnect_admin());

drop policy if exists chat_messages_admin_all on public.chat_messages;
create policy chat_messages_admin_all
on public.chat_messages
for all
to authenticated
using (public.is_mudaconnect_admin())
with check (public.is_mudaconnect_admin());

drop policy if exists site_settings_admin_all on public.site_settings;
create policy site_settings_admin_all
on public.site_settings
for all
to authenticated
using (public.is_mudaconnect_admin())
with check (public.is_mudaconnect_admin());

drop policy if exists audit_logs_admin_all on public.audit_logs;
create policy audit_logs_admin_all
on public.audit_logs
for all
to authenticated
using (public.is_mudaconnect_admin())
with check (public.is_mudaconnect_admin());

-- Storage: public-media can be viewed publicly, but only admins can mutate files.
drop policy if exists public_media_read on storage.objects;
create policy public_media_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'public-media');

drop policy if exists mudaconnect_storage_admin_all on storage.objects;
create policy mudaconnect_storage_admin_all
on storage.objects
for all
to authenticated
using (
  bucket_id in ('public-media', 'private-exports')
  and public.is_mudaconnect_admin()
)
with check (
  bucket_id in ('public-media', 'private-exports')
  and public.is_mudaconnect_admin()
);
