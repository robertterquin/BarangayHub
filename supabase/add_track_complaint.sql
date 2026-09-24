-- ============================================================================
-- Track Complaint by Reference ID (public-facing, privacy-safe)
-- ============================================================================
-- Run this script in the Supabase SQL Editor to enable complaint tracking.
-- This function returns ONLY safe, public-facing status fields.
-- Sensitive personal data (contact, address, respondent) is excluded.
-- ============================================================================

create or replace function public.track_complaint(p_reference_id text)
returns table (
  reference_id text,
  title text,
  status public.complaint_status,
  incident_date date,
  incident_location text,
  resolution_notes text,
  resolved_at timestamptz,
  submitted_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.reference_id,
    c.title,
    c.status,
    c.incident_date,
    c.incident_location,
    c.resolution_notes,
    c.resolved_at,
    c.submitted_at,
    c.updated_at
  from public.complaints c
  where c.reference_id = upper(trim(p_reference_id))
  limit 1;
$$;

-- Revoke default access and grant only to anon + authenticated
revoke all on function public.track_complaint(text) from public;
grant execute on function public.track_complaint(text) to anon, authenticated;
