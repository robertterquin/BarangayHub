-- BarangayHub database reset
-- WARNING: This permanently deletes all BarangayHub database records.
-- Run only when you intentionally want to rebuild the schema from scratch.
-- Auth users are preserved.

begin;

-- Remove Storage policies created by barangayhub_schema.sql.
drop policy if exists "Public can upload complaint attachments" on storage.objects;
drop policy if exists "Admin can read complaint attachments" on storage.objects;
drop policy if exists "Admin can delete complaint attachments" on storage.objects;
drop policy if exists "Admin can upload announcement images" on storage.objects;
drop policy if exists "Admin can read announcement images" on storage.objects;
drop policy if exists "Admin can update announcement images" on storage.objects;
drop policy if exists "Admin can delete announcement images" on storage.objects;
drop policy if exists "Public can read official photos" on storage.objects;
drop policy if exists "Admin can upload official photos" on storage.objects;
drop policy if exists "Admin can update official photos" on storage.objects;
drop policy if exists "Admin can delete official photos" on storage.objects;

-- Remove BarangayHub tables from the Realtime publication before dropping them.
do $$
begin
  if exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'document_requests'
  ) then
    alter publication supabase_realtime drop table public.document_requests;
  end if;

  if exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'complaints'
  ) then
    alter publication supabase_realtime drop table public.complaints;
  end if;

  if exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime drop table public.notifications;
  end if;

  if exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'activity_logs'
  ) then
    alter publication supabase_realtime drop table public.activity_logs;
  end if;
end
$$;

-- Drop public RPC and authorization functions first.
drop function if exists public.submit_document_request(
  text,
  date,
  public.gender_type,
  text,
  text,
  text,
  text,
  public.document_type,
  text,
  text
);
drop function if exists public.track_document_request(text);
drop function if exists public.submit_complaint(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  text,
  text
);
drop function if exists public.submit_feedback(
  text,
  text,
  text,
  boolean,
  public.feedback_category,
  text
);

-- Drop tables in reverse dependency order.
drop table if exists public.notifications;
drop table if exists public.activity_logs;
drop table if exists public.feedback;
drop table if exists public.announcements;
drop table if exists public.complaints;
drop table if exists public.officials;
drop table if exists public.document_requests;
drop table if exists public.residents;
drop table if exists public.system_settings;
drop table if exists public.admin_profiles;

-- Remove policy and trigger functions after their dependent tables are gone.
drop function if exists public.is_active_admin();
drop function if exists private.audit_admin_change();
drop function if exists private.prevent_activity_log_changes();
drop function if exists private.apply_feedback_status_metadata();
drop function if exists private.apply_announcement_status_metadata();
drop function if exists private.apply_complaint_status_metadata();
drop function if exists private.apply_request_status_metadata();
drop function if exists private.set_updated_at();
drop schema if exists private;

-- Drop enum types after every dependent table/function has been removed.
drop type if exists public.notification_type;
drop type if exists public.log_type;
drop type if exists public.feedback_status;
drop type if exists public.feedback_category;
drop type if exists public.official_accent;
drop type if exists public.announcement_status;
drop type if exists public.urgency_level;
drop type if exists public.complaint_status;
drop type if exists public.request_status;
drop type if exists public.document_type;
drop type if exists public.civil_status_type;
drop type if exists public.gender_type;
drop type if exists public.account_status;
drop type if exists public.admin_role;

-- Empty Storage buckets are removed. Non-empty buckets are preserved so files
-- are not silently deleted. Empty them from Supabase Storage before rerunning
-- this reset if you want the buckets removed too.
delete from storage.buckets as bucket
where bucket.id in ('complaint-attachments', 'announcement-images', 'official-photos')
  and not exists (
    select 1
    from storage.objects as object
    where object.bucket_id = bucket.id
  );

commit;
