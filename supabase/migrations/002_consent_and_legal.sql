-- Legal fields, consent journal, create_order with consent, storage bucket

alter table public.site_settings
  add column if not exists legal_name text,
  add column if not exists unp text,
  add column if not exists legal_address text,
  add column if not exists privacy_version text default '2026-08-05';

update public.site_settings
set
  legal_name = coalesce(legal_name, 'АкваМаркет'),
  legal_address = coalesce(legal_address, address),
  privacy_version = coalesce(privacy_version, '2026-08-05')
where true;

alter table public.orders
  add column if not exists consent_at timestamptz,
  add column if not exists policy_version text;

alter table public.callbacks
  add column if not exists consent_at timestamptz,
  add column if not exists policy_version text;

create table if not exists public.consent_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null check (source in (
    'checkout', 'callback', 'register', 'review', 'testimonial', 'cookie'
  )),
  policy_version text not null default '2026-08-05',
  user_id uuid references auth.users(id) on delete set null,
  email text,
  phone text,
  meta jsonb not null default '{}'::jsonb
);

alter table public.consent_logs enable row level security;

drop policy if exists consent_logs_insert on public.consent_logs;
create policy consent_logs_insert on public.consent_logs
  for insert with check (true);

drop policy if exists consent_logs_admin_read on public.consent_logs;
create policy consent_logs_admin_read on public.consent_logs
  for select using (public.is_admin());

-- Helper to log consent
create or replace function public.log_consent(
  p_source text,
  p_policy_version text default '2026-08-05',
  p_email text default null,
  p_phone text default null,
  p_meta jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.consent_logs (source, policy_version, user_id, email, phone, meta)
  values (p_source, coalesce(p_policy_version, '2026-08-05'), auth.uid(), p_email, p_phone, coalesce(p_meta, '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.log_consent(text, text, text, text, jsonb) to anon, authenticated;

-- Updated create_order with consent
create or replace function public.create_order(payload jsonb)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
  v_name text := payload->>'customer_name';
  v_phone text := payload->>'phone';
  v_policy text := coalesce(payload->>'policy_version', '2026-08-05');
  v_consent boolean := coalesce((payload->>'consent')::boolean, false);
begin
  if v_name is null or btrim(v_name) = '' or v_phone is null or btrim(v_phone) = '' then
    raise exception 'customer_name and phone are required';
  end if;
  if not v_consent then
    raise exception 'consent required';
  end if;

  insert into public.orders (
    order_number, customer_name, phone, address, comment, items, total, status,
    customer_user_id, customer_email, payment_method, delivery_method, delivery_cost,
    consent_at, policy_version
  ) values (
    public.next_order_number(),
    v_name,
    v_phone,
    payload->>'address',
    payload->>'comment',
    coalesce(payload->'items', '[]'::jsonb),
    coalesce((payload->>'total')::numeric, 0),
    'new',
    auth.uid(),
    coalesce(payload->>'customer_email', (select email from auth.users where id = auth.uid())),
    coalesce(payload->>'payment_method', 'cash'),
    coalesce(payload->>'delivery_method', 'delivery'),
    coalesce((payload->>'delivery_cost')::numeric, 0),
    now(),
    v_policy
  )
  returning * into o;

  perform public.log_consent(
    'checkout',
    v_policy,
    o.customer_email,
    o.phone,
    jsonb_build_object('order_id', o.id, 'order_number', o.order_number)
  );

  return o;
end;
$$;

grant execute on function public.create_order(jsonb) to anon, authenticated;

-- Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());
