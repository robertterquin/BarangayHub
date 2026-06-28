
begin;

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;


do $$
begin
  create type public.admin_role as enum ('admin');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.account_status as enum ('active', 'inactive');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.gender_type as enum ('male', 'female');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.civil_status_type as enum (
    'single',
    'married',
    'widow',
    'widower',
    'separated'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.document_type as enum (
    'barangay_clearance',
    'certificate_of_residency',
    'certificate_of_indigency',
    'business_clearance',
    'other'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.request_status as enum (
    'pending',
    'processing',
    'ready_for_pickup',
    'completed',
    'rejected'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.complaint_status as enum (
    'open',
    'under_review',
    'resolved',
    'dismissed'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.urgency_level as enum ('low', 'medium', 'high');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.announcement_status as enum (
    'draft',
    'scheduled',
    'published',
    'archived'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.official_accent as enum ('gold', 'blue');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.feedback_category as enum (
    'suggestion',
    'commendation',
    'bug_report',
    'feature_request',
    'other'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.feedback_status as enum (
    'pending',
    'under_review',
    'reviewed'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.log_type as enum (
    'login',
    'approval',
    'rejection',
    'edit',
    'complaint',
    'system'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.notification_type as enum (
    'document_request',
    'complaint',
    'feedback',
    'system'
  );
exception
  when duplicate_object then null;
end
$$;


create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default 'Admin',
  role public.admin_role not null default 'admin',
  status public.account_status not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_profiles_email_not_blank check (length(trim(email)) > 3)
);

create unique index if not exists admin_profiles_email_lower_uidx
  on public.admin_profiles (lower(email));

create table if not exists public.system_settings (
  id smallint primary key default 1,
  barangay_name text not null default 'Daine II',
  municipality text not null default 'Indang',
  province text not null default 'Cavite',
  complete_address text not null default 'Barangay Daine II, Indang, Cavite',
  contact_number text,
  public_email text,
  system_version text not null default 'MIS v1.0',
  service_since smallint not null default 2009,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint system_settings_single_row check (id = 1),
  constraint system_settings_service_year check (
    service_since between 1900 and extract(year from current_date)::smallint
  )
);

create table if not exists public.residents (
  id uuid primary key default gen_random_uuid(),
  reference_id text not null unique,
  full_name text not null,
  gender public.gender_type not null,
  birthdate date not null,
  civil_status public.civil_status_type not null,
  address text not null,
  purok text not null,
  contact_number text,
  citizenship text not null default 'Filipino',
  is_voter boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint residents_reference_format check (
    reference_id ~ '^BD2-[0-9]{4}-[0-9]{4}$'
  ),
  constraint residents_full_name_not_blank check (length(trim(full_name)) >= 2),
  constraint residents_address_not_blank check (length(trim(address)) >= 5),
  constraint residents_purok_not_blank check (length(trim(purok)) >= 1),
  constraint residents_birthdate_not_future check (birthdate <= current_date),
  constraint residents_name_birthdate_unique unique (full_name, birthdate)
);

create index if not exists residents_full_name_trgm_idx
  on public.residents using gin (full_name gin_trgm_ops);
create index if not exists residents_purok_idx
  on public.residents (purok);
create index if not exists residents_gender_idx
  on public.residents (gender);
create index if not exists residents_voter_idx
  on public.residents (is_voter);
create index if not exists residents_created_at_idx
  on public.residents (created_at desc);

create table if not exists public.document_requests (
  id uuid primary key default gen_random_uuid(),
  tracking_code text not null unique,
  resident_id uuid references public.residents(id) on delete set null,
  requester_name text not null,
  birthdate date not null,
  gender public.gender_type not null,
  address text not null,
  purok text not null,
  contact_number text not null,
  email text,
  document_type public.document_type not null,
  other_document_type text,
  purpose text not null,
  status public.request_status not null default 'pending',
  admin_notes text,
  public_status_note text,
  rejection_reason text,
  processed_by uuid references auth.users(id) on delete set null,
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ready_at timestamptz,
  completed_at timestamptz,
  picked_up_at timestamptz,
  constraint document_requests_tracking_format check (
    tracking_code ~ '^BD2-[0-9]{4}-[0-9]{4}$'
  ),
  constraint document_requests_name_not_blank check (
    length(trim(requester_name)) >= 2
  ),
  constraint document_requests_address_not_blank check (
    length(trim(address)) >= 5
  ),
  constraint document_requests_contact_not_blank check (
    length(trim(contact_number)) >= 7
  ),
  constraint document_requests_purpose_not_blank check (
    length(trim(purpose)) >= 2
  ),
  constraint document_requests_birthdate_not_future check (
    birthdate <= current_date
  ),
  constraint document_requests_other_type check (
    document_type <> 'other'
    or length(trim(coalesce(other_document_type, ''))) >= 2
  )
);

create index if not exists document_requests_resident_id_idx
  on public.document_requests (resident_id);
create index if not exists document_requests_status_requested_idx
  on public.document_requests (status, requested_at desc);
create index if not exists document_requests_type_idx
  on public.document_requests (document_type);
create index if not exists document_requests_name_trgm_idx
  on public.document_requests using gin (requester_name gin_trgm_ops);
create index if not exists document_requests_processed_by_idx
  on public.document_requests (processed_by);

create table if not exists public.officials (
  id uuid primary key default gen_random_uuid(),
  initials varchar(4) not null,
  full_name text not null,
  position text not null,
  accent public.official_accent not null default 'blue',
  photo_url text,
  display_order smallint not null default 0,
  is_active boolean not null default true,
  term_start date,
  term_end date,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint officials_initials_not_blank check (length(trim(initials)) between 1 and 4),
  constraint officials_name_not_blank check (length(trim(full_name)) >= 2),
  constraint officials_position_not_blank check (length(trim(position)) >= 2),
  constraint officials_term_dates check (
    term_end is null or term_start is null or term_end >= term_start
  )
);

create index if not exists officials_active_order_idx
  on public.officials (is_active, display_order, created_at);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  reference_id text not null unique,
  title text not null,
  description text not null,
  complainant_name text not null,
  respondent_name text,
  complainant_contact text not null,
  complainant_address text not null,
  purok text not null,
  incident_date date,
  incident_location text,
  attachment_url text,
  status public.complaint_status not null default 'open',
  urgency public.urgency_level not null default 'medium',
  assigned_official_id uuid references public.officials(id) on delete set null,
  resolution_notes text,
  resolved_at timestamptz,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint complaints_reference_format check (
    reference_id ~ '^BLOTTER-[0-9]{4}-[0-9]{4}$'
  ),
  constraint complaints_title_not_blank check (length(trim(title)) >= 3),
  constraint complaints_description_not_blank check (
    length(trim(description)) >= 10
  ),
  constraint complaints_complainant_not_blank check (
    length(trim(complainant_name)) >= 2
  ),
  constraint complaints_contact_not_blank check (
    length(trim(complainant_contact)) >= 7
  ),
  constraint complaints_address_not_blank check (
    length(trim(complainant_address)) >= 5
  ),
  constraint complaints_incident_date_not_future check (
    incident_date is null or incident_date <= current_date
  )
);

create index if not exists complaints_status_submitted_idx
  on public.complaints (status, submitted_at desc);
create index if not exists complaints_urgency_idx
  on public.complaints (urgency);
create index if not exists complaints_assigned_official_idx
  on public.complaints (assigned_official_id);
create index if not exists complaints_title_trgm_idx
  on public.complaints using gin (title gin_trgm_ops);
create index if not exists complaints_complainant_trgm_idx
  on public.complaints using gin (complainant_name gin_trgm_ops);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  body text not null,
  image_url text,
  status public.announcement_status not null default 'draft',
  scheduled_for timestamptz,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_title_not_blank check (length(trim(title)) >= 3),
  constraint announcements_category_not_blank check (length(trim(category)) >= 2),
  constraint announcements_body_not_blank check (length(trim(body)) >= 10),
  constraint announcements_schedule_required check (
    status <> 'scheduled' or scheduled_for is not null
  ),
  constraint announcements_publish_date_required check (
    status <> 'published' or published_at is not null
  )
);

create index if not exists announcements_status_published_idx
  on public.announcements (status, published_at desc);
create index if not exists announcements_scheduled_idx
  on public.announcements (scheduled_for)
  where status = 'scheduled';
create index if not exists announcements_title_trgm_idx
  on public.announcements using gin (title gin_trgm_ops);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  resident_name text,
  contact_number text,
  email text,
  is_anonymous boolean not null default false,
  category public.feedback_category not null default 'suggestion',
  message text not null,
  status public.feedback_status not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feedback_message_not_blank check (length(trim(message)) >= 5),
  constraint feedback_name_when_identified check (
    is_anonymous
    or length(trim(coalesce(resident_name, ''))) >= 2
  )
);

create index if not exists feedback_status_submitted_idx
  on public.feedback (status, submitted_at desc);
create index if not exists feedback_category_idx
  on public.feedback (category);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  admin_email text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  log_type public.log_type not null default 'system',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint activity_logs_action_not_blank check (length(trim(action)) >= 3),
  constraint activity_logs_entity_not_blank check (length(trim(entity_type)) >= 2),
  constraint activity_logs_details_object check (jsonb_typeof(details) = 'object')
);

create index if not exists activity_logs_created_at_idx
  on public.activity_logs (created_at desc);
create index if not exists activity_logs_admin_id_idx
  on public.activity_logs (admin_id);
create index if not exists activity_logs_entity_idx
  on public.activity_logs (entity_type, entity_id);
create index if not exists activity_logs_log_type_idx
  on public.activity_logs (log_type);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type public.notification_type not null,
  title text not null,
  message text not null,
  entity_type text,
  entity_id uuid,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_title_not_blank check (length(trim(title)) >= 2),
  constraint notifications_message_not_blank check (length(trim(message)) >= 2),
  constraint notifications_read_date check (
    (not is_read and read_at is null) or is_read
  )
);

create index if not exists notifications_unread_created_idx
  on public.notifications (is_read, created_at desc);
create index if not exists notifications_entity_idx
  on public.notifications (entity_type, entity_id);


create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_admin_profiles_updated_at on public.admin_profiles;
create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function private.set_updated_at();

drop trigger if exists set_system_settings_updated_at on public.system_settings;
create trigger set_system_settings_updated_at
before update on public.system_settings
for each row execute function private.set_updated_at();

drop trigger if exists set_residents_updated_at on public.residents;
create trigger set_residents_updated_at
before update on public.residents
for each row execute function private.set_updated_at();

drop trigger if exists set_document_requests_updated_at on public.document_requests;
create trigger set_document_requests_updated_at
before update on public.document_requests
for each row execute function private.set_updated_at();

drop trigger if exists set_officials_updated_at on public.officials;
create trigger set_officials_updated_at
before update on public.officials
for each row execute function private.set_updated_at();

drop trigger if exists set_complaints_updated_at on public.complaints;
create trigger set_complaints_updated_at
before update on public.complaints
for each row execute function private.set_updated_at();

drop trigger if exists set_announcements_updated_at on public.announcements;
create trigger set_announcements_updated_at
before update on public.announcements
for each row execute function private.set_updated_at();

drop trigger if exists set_feedback_updated_at on public.feedback;
create trigger set_feedback_updated_at
before update on public.feedback
for each row execute function private.set_updated_at();

create or replace function private.apply_request_status_metadata()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    new.processed_by = coalesce(new.processed_by, (select auth.uid()));

    if new.status in ('pending', 'processing') then
      new.ready_at = null;
      new.completed_at = null;
      new.picked_up_at = null;
    elsif new.status = 'ready_for_pickup' and new.ready_at is null then
      new.ready_at = now();
      new.completed_at = null;
      new.picked_up_at = null;
    elsif new.status = 'completed' and new.completed_at is null then
      new.completed_at = now();
    elsif new.status = 'rejected' then
      new.ready_at = null;
      new.completed_at = null;
      new.picked_up_at = null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists apply_request_status_metadata on public.document_requests;
create trigger apply_request_status_metadata
before insert or update of status on public.document_requests
for each row execute function private.apply_request_status_metadata();

create or replace function private.apply_complaint_status_metadata()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'resolved' and new.resolved_at is null then
    new.resolved_at = now();
  elsif new.status <> 'resolved' then
    new.resolved_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists apply_complaint_status_metadata on public.complaints;
create trigger apply_complaint_status_metadata
before insert or update of status on public.complaints
for each row execute function private.apply_complaint_status_metadata();

create or replace function private.apply_announcement_status_metadata()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists apply_announcement_status_metadata on public.announcements;
create trigger apply_announcement_status_metadata
before insert or update of status on public.announcements
for each row execute function private.apply_announcement_status_metadata();

create or replace function private.apply_feedback_status_metadata()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'reviewed' then
    new.reviewed_at = coalesce(new.reviewed_at, now());
    new.reviewed_by = coalesce(new.reviewed_by, (select auth.uid()));
  elsif new.status <> 'reviewed' then
    new.reviewed_at = null;
    new.reviewed_by = null;
  end if;

  return new;
end;
$$;

drop trigger if exists apply_feedback_status_metadata on public.feedback;
create trigger apply_feedback_status_metadata
before insert or update of status on public.feedback
for each row execute function private.apply_feedback_status_metadata();

create or replace function private.prevent_activity_log_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Activity logs are immutable and cannot be updated or deleted.';
end;
$$;

drop trigger if exists prevent_activity_log_update on public.activity_logs;
create trigger prevent_activity_log_update
before update on public.activity_logs
for each row execute function private.prevent_activity_log_changes();

drop trigger if exists prevent_activity_log_delete on public.activity_logs;
create trigger prevent_activity_log_delete
before delete on public.activity_logs
for each row execute function private.prevent_activity_log_changes();


create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = (select auth.uid())
      and role = 'admin'
      and status = 'active'
  );
$$;

revoke all on function public.is_active_admin() from public, anon;
grant execute on function public.is_active_admin() to authenticated;

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

  if tg_table_name = 'admin_profiles' then
    if tg_op = 'UPDATE'
       and new.email is not distinct from old.email
       and new.display_name is not distinct from old.display_name
       and new.role is not distinct from old.role
       and new.status is not distinct from old.status then
      return new;
    end if;
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

  if tg_op = 'UPDATE' then
    if tg_table_name = 'admin_profiles' then
      v_details := v_details || jsonb_build_object(
        'target_email', new.email,
        'previous_status', old.status,
        'new_status', new.status,
        'previous_role', old.role,
        'new_role', new.role
      );
    elsif tg_table_name = 'document_requests' then
      v_details := v_details || jsonb_build_object(
        'previous_status', old.status,
        'new_status', new.status
      );

      if new.status = 'rejected' then
        v_log_type := 'rejection';
      elsif new.status in ('ready_for_pickup', 'completed') then
        v_log_type := 'approval';
      end if;
    elsif tg_table_name = 'complaints' then
      v_log_type := 'complaint';
      v_details := v_details || jsonb_build_object(
        'previous_status', old.status,
        'new_status', new.status
      );
    end if;
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

drop trigger if exists audit_admin_profiles on public.admin_profiles;
create trigger audit_admin_profiles
after update on public.admin_profiles
for each row execute function private.audit_admin_change();

drop trigger if exists audit_residents on public.residents;
create trigger audit_residents
after insert or update or delete on public.residents
for each row execute function private.audit_admin_change();

drop trigger if exists audit_system_settings on public.system_settings;
create trigger audit_system_settings
after insert or update or delete on public.system_settings
for each row execute function private.audit_admin_change();

drop trigger if exists audit_document_requests on public.document_requests;
create trigger audit_document_requests
after insert or update or delete on public.document_requests
for each row execute function private.audit_admin_change();

drop trigger if exists audit_officials on public.officials;
create trigger audit_officials
after insert or update or delete on public.officials
for each row execute function private.audit_admin_change();

drop trigger if exists audit_complaints on public.complaints;
create trigger audit_complaints
after insert or update or delete on public.complaints
for each row execute function private.audit_admin_change();

drop trigger if exists audit_announcements on public.announcements;
create trigger audit_announcements
after insert or update or delete on public.announcements
for each row execute function private.audit_admin_change();

drop trigger if exists audit_feedback on public.feedback;
create trigger audit_feedback
after update or delete on public.feedback
for each row execute function private.audit_admin_change();


create or replace function public.submit_document_request(
  p_requester_name text,
  p_birthdate date,
  p_gender public.gender_type,
  p_address text,
  p_purok text,
  p_contact_number text,
  p_email text,
  p_document_type public.document_type,
  p_other_document_type text,
  p_purpose text
)
returns table (id uuid, tracking_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_tracking_code text;
  v_attempt integer;
begin
  if length(trim(coalesce(p_requester_name, ''))) < 2 then
    raise exception 'Requester name is required.' using errcode = '22023';
  end if;
  if p_birthdate is null or p_birthdate > current_date then
    raise exception 'A valid birthdate is required.' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_address, ''))) < 5 then
    raise exception 'Complete address is required.' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_purok, ''))) < 1 then
    raise exception 'Purok is required.' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_contact_number, ''))) < 7 then
    raise exception 'A valid contact number is required.' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_purpose, ''))) < 2 then
    raise exception 'Purpose is required.' using errcode = '22023';
  end if;
  if p_document_type = 'other'
     and length(trim(coalesce(p_other_document_type, ''))) < 2 then
    raise exception 'Specify the requested document type.' using errcode = '22023';
  end if;

  for v_attempt in 1..25 loop
    v_tracking_code :=
      'BD2-' || extract(year from current_date)::integer::text || '-' ||
      lpad((floor(random() * 9000)::integer + 1000)::text, 4, '0');
    v_id := gen_random_uuid();

    begin
      insert into public.document_requests (
        id,
        tracking_code,
        requester_name,
        birthdate,
        gender,
        address,
        purok,
        contact_number,
        email,
        document_type,
        other_document_type,
        purpose
      )
      values (
        v_id,
        v_tracking_code,
        trim(p_requester_name),
        p_birthdate,
        p_gender,
        trim(p_address),
        trim(p_purok),
        trim(p_contact_number),
        nullif(trim(coalesce(p_email, '')), ''),
        p_document_type,
        nullif(trim(coalesce(p_other_document_type, '')), ''),
        trim(p_purpose)
      );

      insert into public.notifications (
        type,
        title,
        message,
        entity_type,
        entity_id
      )
      values (
        'document_request',
        'New document request',
        v_tracking_code || ' was submitted by ' || trim(p_requester_name) || '.',
        'document_requests',
        v_id
      );

      return query select v_id, v_tracking_code;
      return;
    exception
      when unique_violation then
        null;
    end;
  end loop;

  raise exception 'Unable to generate a unique tracking code. Please try again.';
end;
$$;

create or replace function public.track_document_request(p_tracking_code text)
returns table (
  tracking_code text,
  document_type public.document_type,
  other_document_type text,
  status public.request_status,
  public_status_note text,
  requested_at timestamptz,
  updated_at timestamptz,
  ready_at timestamptz,
  completed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    dr.tracking_code,
    dr.document_type,
    dr.other_document_type,
    dr.status,
    dr.public_status_note,
    dr.requested_at,
    dr.updated_at,
    dr.ready_at,
    dr.completed_at
  from public.document_requests dr
  where dr.tracking_code = upper(trim(p_tracking_code))
  limit 1;
$$;

create or replace function public.submit_complaint(
  p_title text,
  p_description text,
  p_complainant_name text,
  p_respondent_name text,
  p_complainant_contact text,
  p_complainant_address text,
  p_purok text,
  p_incident_date date,
  p_incident_location text,
  p_attachment_url text
)
returns table (id uuid, reference_id text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_reference_id text;
  v_attempt integer;
begin
  if length(trim(coalesce(p_title, ''))) < 3 then
    raise exception 'Complaint title is required.' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_description, ''))) < 10 then
    raise exception 'Complaint description must contain at least 10 characters.'
      using errcode = '22023';
  end if;
  if length(trim(coalesce(p_complainant_name, ''))) < 2 then
    raise exception 'Complainant name is required.' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_complainant_contact, ''))) < 7 then
    raise exception 'A valid contact number is required.' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_complainant_address, ''))) < 5 then
    raise exception 'Complainant address is required.' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_purok, ''))) < 1 then
    raise exception 'Purok is required.' using errcode = '22023';
  end if;
  if p_incident_date is not null and p_incident_date > current_date then
    raise exception 'Incident date cannot be in the future.' using errcode = '22023';
  end if;

  for v_attempt in 1..25 loop
    v_reference_id :=
      'BLOTTER-' || extract(year from current_date)::integer::text || '-' ||
      lpad((floor(random() * 9000)::integer + 1000)::text, 4, '0');
    v_id := gen_random_uuid();

    begin
      insert into public.complaints (
        id,
        reference_id,
        title,
        description,
        complainant_name,
        respondent_name,
        complainant_contact,
        complainant_address,
        purok,
        incident_date,
        incident_location,
        attachment_url
      )
      values (
        v_id,
        v_reference_id,
        trim(p_title),
        trim(p_description),
        trim(p_complainant_name),
        nullif(trim(coalesce(p_respondent_name, '')), ''),
        trim(p_complainant_contact),
        trim(p_complainant_address),
        trim(p_purok),
        p_incident_date,
        nullif(trim(coalesce(p_incident_location, '')), ''),
        nullif(trim(coalesce(p_attachment_url, '')), '')
      );

      insert into public.notifications (
        type,
        title,
        message,
        entity_type,
        entity_id
      )
      values (
        'complaint',
        'New complaint filed',
        v_reference_id || ' was submitted by ' || trim(p_complainant_name) || '.',
        'complaints',
        v_id
      );

      return query select v_id, v_reference_id;
      return;
    exception
      when unique_violation then
        null;
    end;
  end loop;

  raise exception 'Unable to generate a unique complaint reference. Please try again.';
end;
$$;

create or replace function public.submit_feedback(
  p_resident_name text,
  p_contact_number text,
  p_email text,
  p_is_anonymous boolean,
  p_category public.feedback_category,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := gen_random_uuid();
  v_display_name text;
begin
  if length(trim(coalesce(p_message, ''))) < 5 then
    raise exception 'Feedback must contain at least 5 characters.'
      using errcode = '22023';
  end if;
  if not coalesce(p_is_anonymous, false)
     and length(trim(coalesce(p_resident_name, ''))) < 2 then
    raise exception 'Resident name is required unless submitting anonymously.'
      using errcode = '22023';
  end if;

  v_display_name := case
    when coalesce(p_is_anonymous, false) then 'Anonymous'
    else trim(p_resident_name)
  end;

  insert into public.feedback (
    id,
    resident_name,
    contact_number,
    email,
    is_anonymous,
    category,
    message
  )
  values (
    v_id,
    case when coalesce(p_is_anonymous, false) then null else trim(p_resident_name) end,
    nullif(trim(coalesce(p_contact_number, '')), ''),
    nullif(trim(coalesce(p_email, '')), ''),
    coalesce(p_is_anonymous, false),
    p_category,
    trim(p_message)
  );

  insert into public.notifications (
    type,
    title,
    message,
    entity_type,
    entity_id
  )
  values (
    'feedback',
    'New resident feedback',
    v_display_name || ' submitted ' || replace(p_category::text, '_', ' ') || '.',
    'feedback',
    v_id
  );

  return v_id;
end;
$$;

create or replace function public.get_public_dashboard_summary()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with current_year as (
    select extract(year from current_date)::integer as year
  ),
  residents_by_purok as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'purok', purok,
          'residents', resident_count
        )
        order by purok
      ),
      '[]'::jsonb
    ) as data
    from (
      select
        r.purok,
        count(*)::integer as resident_count
      from public.residents r
      group by r.purok
    ) grouped_residents
  ),
  month_series as (
    select
      month_number,
      to_char(make_date((select year from current_year), month_number, 1), 'Mon') as month_label
    from generate_series(1, 12) as series(month_number)
  ),
  monthly_document_requests as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'month', ms.month_label,
          'requests', coalesce(monthly_counts.request_count, 0)
        )
        order by ms.month_number
      ),
      '[]'::jsonb
    ) as data
    from month_series ms
    left join (
      select
        extract(month from dr.requested_at)::integer as month_number,
        count(*)::integer as request_count
      from public.document_requests dr
      where extract(year from dr.requested_at)::integer = (select year from current_year)
      group by extract(month from dr.requested_at)::integer
    ) monthly_counts
      on monthly_counts.month_number = ms.month_number
  )
  select jsonb_build_object(
    'total_residents', (
      select count(*)::integer from public.residents
    ),
    'documents_issued', (
      select count(*)::integer
      from public.document_requests dr
      where dr.status = 'completed'
        and extract(year from coalesce(dr.completed_at, dr.updated_at))::integer =
          (select year from current_year)
    ),
    'published_announcements', (
      select count(*)::integer
      from public.announcements a
      where a.status = 'published'
        and a.published_at <= now()
    ),
    'online_services', 6,
    'year', (select year from current_year),
    'residents_by_purok', (select data from residents_by_purok),
    'monthly_document_requests', (select data from monthly_document_requests),
    'generated_at', now()
  );
$$;

revoke all on function public.submit_document_request(
  text, date, public.gender_type, text, text, text, text,
  public.document_type, text, text
) from public;
revoke all on function public.track_document_request(text) from public;
revoke all on function public.submit_complaint(
  text, text, text, text, text, text, text, date, text, text
) from public;
revoke all on function public.submit_feedback(
  text, text, text, boolean, public.feedback_category, text
) from public;
revoke all on function public.get_public_dashboard_summary() from public;

grant execute on function public.submit_document_request(
  text, date, public.gender_type, text, text, text, text,
  public.document_type, text, text
) to anon, authenticated;
grant execute on function public.track_document_request(text)
  to anon, authenticated;
grant execute on function public.submit_complaint(
  text, text, text, text, text, text, text, date, text, text
) to anon, authenticated;
grant execute on function public.submit_feedback(
  text, text, text, boolean, public.feedback_category, text
) to anon, authenticated;
grant execute on function public.get_public_dashboard_summary()
  to anon, authenticated;


alter table public.admin_profiles enable row level security;
alter table public.system_settings enable row level security;
alter table public.residents enable row level security;
alter table public.document_requests enable row level security;
alter table public.officials enable row level security;
alter table public.complaints enable row level security;
alter table public.announcements enable row level security;
alter table public.feedback enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Admin profiles readable by owner" on public.admin_profiles;
create policy "Admin profiles readable by owner"
on public.admin_profiles
for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists "Active admin can update own profile" on public.admin_profiles;
create policy "Active admin can update own profile"
on public.admin_profiles
for update
to authenticated
using (id = (select auth.uid()) and (select public.is_active_admin()))
with check (id = (select auth.uid()) and role = 'admin');

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

drop policy if exists "Public can read barangay settings" on public.system_settings;
create policy "Public can read barangay settings"
on public.system_settings
for select
to anon
using (id = 1);

drop policy if exists "Admin can manage barangay settings" on public.system_settings;
create policy "Admin can manage barangay settings"
on public.system_settings
for all
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

drop policy if exists "Admin can manage residents" on public.residents;
create policy "Admin can manage residents"
on public.residents
for all
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

drop policy if exists "Admin can manage document requests" on public.document_requests;
create policy "Admin can manage document requests"
on public.document_requests
for all
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

drop policy if exists "Public can read active officials" on public.officials;
create policy "Public can read active officials"
on public.officials
for select
to anon
using (is_active);

drop policy if exists "Admin can manage officials" on public.officials;
create policy "Admin can manage officials"
on public.officials
for all
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

drop policy if exists "Admin can manage complaints" on public.complaints;
create policy "Admin can manage complaints"
on public.complaints
for all
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

drop policy if exists "Public can read published announcements" on public.announcements;
create policy "Public can read published announcements"
on public.announcements
for select
to anon
using (status = 'published' and published_at <= now());

drop policy if exists "Admin can manage announcements" on public.announcements;
create policy "Admin can manage announcements"
on public.announcements
for all
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

drop policy if exists "Admin can manage feedback" on public.feedback;
create policy "Admin can manage feedback"
on public.feedback
for all
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

drop policy if exists "Admin can read activity logs" on public.activity_logs;
create policy "Admin can read activity logs"
on public.activity_logs
for select
to authenticated
using ((select public.is_active_admin()));

drop policy if exists "Admin can insert activity logs" on public.activity_logs;
create policy "Admin can insert activity logs"
on public.activity_logs
for insert
to authenticated
with check (
  (select public.is_active_admin())
  and admin_id = (select auth.uid())
);

drop policy if exists "Admin can manage notifications" on public.notifications;
create policy "Admin can manage notifications"
on public.notifications
for all
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));


revoke all on all tables in schema public from anon;

grant select on public.system_settings to anon;
grant select on public.officials to anon;
grant select on public.announcements to anon;

grant select on public.admin_profiles to authenticated;
grant update (email, display_name, last_login_at, role, status)
  on public.admin_profiles to authenticated;
grant select, insert, update on public.system_settings to authenticated;
grant select, insert, update, delete on public.residents to authenticated;
grant select, insert, update, delete on public.document_requests to authenticated;
grant select, insert, update, delete on public.officials to authenticated;
grant select, insert, update, delete on public.complaints to authenticated;
grant select, insert, update, delete on public.announcements to authenticated;
grant select, insert, update, delete on public.feedback to authenticated;
grant select, insert on public.activity_logs to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;

revoke update, delete on public.activity_logs from authenticated;


insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'complaint-attachments',
    'complaint-attachments',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'announcement-images',
    'announcement-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'official-photos',
    'official-photos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can upload complaint attachments" on storage.objects;
create policy "Public can upload complaint attachments"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'complaint-attachments'
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'pdf')
);

drop policy if exists "Admin can read complaint attachments" on storage.objects;
create policy "Admin can read complaint attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'complaint-attachments'
  and (select public.is_active_admin())
);

drop policy if exists "Admin can delete complaint attachments" on storage.objects;
create policy "Admin can delete complaint attachments"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'complaint-attachments'
  and (select public.is_active_admin())
);

drop policy if exists "Admin can upload announcement images" on storage.objects;
create policy "Admin can upload announcement images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'announcement-images'
  and (select public.is_active_admin())
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

drop policy if exists "Admin can read announcement images" on storage.objects;
create policy "Admin can read announcement images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'announcement-images'
  and (select public.is_active_admin())
);

drop policy if exists "Admin can update announcement images" on storage.objects;
create policy "Admin can update announcement images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'announcement-images'
  and (select public.is_active_admin())
)
with check (
  bucket_id = 'announcement-images'
  and (select public.is_active_admin())
);

drop policy if exists "Admin can delete announcement images" on storage.objects;
create policy "Admin can delete announcement images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'announcement-images'
  and (select public.is_active_admin())
);

drop policy if exists "Public can read official photos" on storage.objects;
create policy "Public can read official photos"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'official-photos');

drop policy if exists "Admin can upload official photos" on storage.objects;
create policy "Admin can upload official photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'official-photos'
  and (select public.is_active_admin())
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

drop policy if exists "Admin can update official photos" on storage.objects;
create policy "Admin can update official photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'official-photos'
  and (select public.is_active_admin())
)
with check (
  bucket_id = 'official-photos'
  and (select public.is_active_admin())
);

drop policy if exists "Admin can delete official photos" on storage.objects;
create policy "Admin can delete official photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'official-photos'
  and (select public.is_active_admin())
);


do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'document_requests'
  ) then
    alter publication supabase_realtime add table public.document_requests;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'complaints'
  ) then
    alter publication supabase_realtime add table public.complaints;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'activity_logs'
  ) then
    alter publication supabase_realtime add table public.activity_logs;
  end if;
end
$$;


insert into public.system_settings (
  id,
  barangay_name,
  municipality,
  province,
  complete_address,
  public_email,
  system_version,
  service_since
)
values (
  1,
  'Daine II',
  'Indang',
  'Cavite',
  'Barangay Daine II, Indang, Cavite',
  'barangayhub.admin@gmail.com',
  'MIS v1.0',
  2009
)
on conflict (id) do nothing;

do $$
declare
  v_user_count integer;
begin
  select count(*) into v_user_count from auth.users;

  if v_user_count = 1 and not exists (select 1 from public.admin_profiles) then
    insert into public.admin_profiles (id, email, display_name, role, status)
    select
      id,
      coalesce(email, 'barangayhub.admin@gmail.com'),
      coalesce(
        nullif(raw_user_meta_data ->> 'display_name', ''),
        'Admin'
      ),
      'admin',
      'active'
    from auth.users
    limit 1;
  end if;
end
$$;

commit;

