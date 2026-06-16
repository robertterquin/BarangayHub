begin;

drop policy if exists "Admin can read admin profiles" on public.admin_profiles;
create policy "Admin can read admin profiles"
on public.admin_profiles
for select
to authenticated
using ((select public.is_active_admin()));

drop policy if exists "Admin can update admin profiles" on public.admin_profiles;
create policy "Admin can update admin profiles"
on public.admin_profiles
for update
to authenticated
using ((select public.is_active_admin()))
with check (role = 'admin');

grant update (email, display_name, last_login_at, role, status)
  on public.admin_profiles to authenticated;

create or replace function private.audit_admin_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := (select auth.uid());
  v_admin_email text;
  v_entity_id uuid;
  v_action text;
  v_log_type public.log_type := 'edit';
  v_details jsonb := jsonb_build_object('operation', tg_op);
begin
  if v_admin_id is null or not public.is_active_admin() then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_table_name = 'admin_profiles'
     and tg_op = 'UPDATE'
     and new.email is not distinct from old.email
     and new.display_name is not distinct from old.display_name
     and new.role is not distinct from old.role
     and new.status is not distinct from old.status then
    return new;
  end if;

  select email
  into v_admin_email
  from public.admin_profiles
  where id = v_admin_id;

  if tg_table_name = 'system_settings' then
    v_entity_id := null;
  elsif tg_op = 'DELETE' then
    v_entity_id := old.id;
  else
    v_entity_id := new.id;
  end if;

  v_action := initcap(replace(tg_table_name, '_', ' ')) || ' ' || lower(tg_op);

  if tg_op = 'UPDATE' and tg_table_name = 'admin_profiles' then
    v_details := v_details || jsonb_build_object(
      'target_email', new.email,
      'previous_status', old.status,
      'new_status', new.status,
      'previous_role', old.role,
      'new_role', new.role
    );
  elsif tg_op = 'UPDATE' and tg_table_name = 'document_requests' then
    v_details := v_details || jsonb_build_object(
      'previous_status', old.status,
      'new_status', new.status
    );

    if new.status = 'rejected' then
      v_log_type := 'rejection';
    elsif new.status in ('ready_for_pickup', 'completed') then
      v_log_type := 'approval';
    end if;
  elsif tg_op = 'UPDATE' and tg_table_name = 'complaints' then
    v_log_type := 'complaint';
    v_details := v_details || jsonb_build_object(
      'previous_status', old.status,
      'new_status', new.status
    );
  end if;

  insert into public.activity_logs (
    admin_id,
    admin_email,
    action,
    entity_type,
    entity_id,
    log_type,
    details
  )
  values (
    v_admin_id,
    v_admin_email,
    v_action,
    tg_table_name,
    v_entity_id,
    v_log_type,
    v_details
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

commit;
