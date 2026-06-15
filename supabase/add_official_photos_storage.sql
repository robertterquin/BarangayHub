begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
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

commit;
