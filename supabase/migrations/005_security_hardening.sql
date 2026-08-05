-- Harden RLS, function grants, search_path (Security Advisor)

-- 1) set_updated_at: fixed search_path
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Revoke PUBLIC execute on SECURITY DEFINER helpers; grant only where needed
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;
-- trigger owner (postgres) still executes it

revoke all on function public.next_order_number() from public;
revoke all on function public.next_order_number() from anon, authenticated;

revoke all on function public.set_updated_at() from public;
revoke all on function public.set_updated_at() from anon, authenticated;

revoke all on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;

revoke all on function public.update_order_status(uuid, text) from public;
grant execute on function public.update_order_status(uuid, text) to authenticated;

revoke all on function public.log_consent(text, text, text, text, jsonb) from public;
grant execute on function public.log_consent(text, text, text, text, jsonb) to anon, authenticated;

-- 3) consent_logs: no direct client INSERT (only via log_consent SECURITY DEFINER)
drop policy if exists consent_logs_insert on public.consent_logs;

-- 4) reviews: tighten insert (no open WITH CHECK true)
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews
  for insert
  with check (
    rating between 1 and 5
    and product_id is not null
    and length(coalesce(author_name, '')) <= 120
    and length(coalesce(text, '')) <= 4000
    and (author_id is null or author_id = auth.uid())
  );

-- 5) testimonials: cannot self-approve; content bounds
drop policy if exists testimonials_insert on public.testimonials;
create policy testimonials_insert on public.testimonials
  for insert
  with check (
    rating between 1 and 5
    and length(btrim(author_name)) between 1 and 120
    and length(btrim(text)) between 1 and 4000
    and approved = false
  );

-- 6) callbacks: only new status from clients; phone required
drop policy if exists callbacks_insert on public.callbacks;
create policy callbacks_insert on public.callbacks
  for insert
  with check (
    length(btrim(phone)) between 7 and 40
    and length(coalesce(name, '')) <= 120
    and length(coalesce(purpose, '')) <= 500
    and status = 'new'
  );

-- 7) Storage: public read by object path (bucket stays public for CDN URLs).
--    Listing is inherent for public buckets; keep admin write only.
drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects
  for select
  using (bucket_id = 'product-images');

-- Note (Dashboard, not SQL):
-- Authentication → Attack Protection → enable «Leaked password protection» (Have I Been Pwned).
