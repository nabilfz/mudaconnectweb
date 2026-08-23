-- Batch 1 security hardening: tighten role management and make audit history immutable.
-- Apply after 202607260001_harden_public_access.sql.

create or replace function public.is_mudaconnect_super_admin()
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
      and role = 'super_admin'
  );
$$;

revoke all on function public.is_mudaconnect_super_admin() from public;
grant execute on function public.is_mudaconnect_super_admin() to authenticated, service_role;

-- Replace the overly broad profile policy. Admins may inspect profiles, while only
-- active super-admins may create, modify, or remove profile rows through the client.
drop policy if exists profiles_admin_all on public.profiles;
drop policy if exists profiles_admin_read_all on public.profiles;
drop policy if exists profiles_super_admin_insert on public.profiles;
drop policy if exists profiles_super_admin_update on public.profiles;
drop policy if exists profiles_super_admin_delete on public.profiles;

create policy profiles_admin_read_all
on public.profiles
for select
to authenticated
using (public.is_mudaconnect_admin());

create policy profiles_super_admin_insert
on public.profiles
for insert
to authenticated
with check (public.is_mudaconnect_super_admin());

create policy profiles_super_admin_update
on public.profiles
for update
to authenticated
using (public.is_mudaconnect_super_admin())
with check (public.is_mudaconnect_super_admin());

create policy profiles_super_admin_delete
on public.profiles
for delete
to authenticated
using (public.is_mudaconnect_super_admin());

-- Audit history must not be mutable by dashboard users. Active admins may read it
-- and append entries for themselves, but UPDATE/DELETE is intentionally unavailable.
drop policy if exists audit_logs_admin_all on public.audit_logs;
drop policy if exists audit_logs_admin_read on public.audit_logs;
drop policy if exists audit_logs_admin_insert on public.audit_logs;

create policy audit_logs_admin_read
on public.audit_logs
for select
to authenticated
using (public.is_mudaconnect_admin());

create policy audit_logs_admin_insert
on public.audit_logs
for insert
to authenticated
with check (
  public.is_mudaconnect_admin()
  and user_id = auth.uid()
);
