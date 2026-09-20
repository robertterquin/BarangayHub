-- Fix Complaint Attachments Storage Policies
-- Allows both anonymous citizens and logged-in admins to upload complaint attachments.

begin;

-- Ensure the bucket exists and allows images & documents up to 5MB
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'complaint-attachments',
  'complaint-attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Allow both anonymous citizens and logged-in users (e.g. testing as admin) to upload
drop policy if exists "Public can upload complaint attachments" on storage.objects;
create policy "Public can upload complaint attachments"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'complaint-attachments'
);

-- Allow authenticated active admins to read/download complaint attachments
drop policy if exists "Admin can read complaint attachments" on storage.objects;
create policy "Admin can read complaint attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'complaint-attachments'
  and (select public.is_active_admin())
);

-- Allow authenticated active admins to delete complaint attachments
drop policy if exists "Admin can delete complaint attachments" on storage.objects;
create policy "Admin can delete complaint attachments"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'complaint-attachments'
  and (select public.is_active_admin())
);

commit;
