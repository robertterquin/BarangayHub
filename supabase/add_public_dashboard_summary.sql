begin;

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

revoke all on function public.get_public_dashboard_summary() from public;
grant execute on function public.get_public_dashboard_summary() to anon, authenticated;

commit;
