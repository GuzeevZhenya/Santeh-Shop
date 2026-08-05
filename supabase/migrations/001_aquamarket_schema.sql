-- AquaMarket schema + RLS (Supabase / Postgres)

create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text not null default 'droplet',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(12,2) not null,
  old_price numeric(12,2),
  description text,
  image_url text,
  brand text,
  specs text,
  rating numeric(3,2) not null default 5,
  is_deal_of_day boolean not null default false,
  in_carousel boolean not null default false,
  is_active boolean not null default true,
  gallery text[] not null default '{}',
  variants jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  customer_name text not null,
  phone text not null,
  address text,
  comment text,
  items jsonb not null default '[]'::jsonb,
  total numeric(12,2) not null default 0,
  status text not null default 'new'
    check (status in ('new', 'processing', 'completed', 'cancelled')),
  admin_comment text,
  customer_user_id uuid references auth.users(id) on delete set null,
  customer_email text,
  payment_method text not null default 'cash'
    check (payment_method in ('cash', 'card')),
  delivery_method text not null default 'delivery'
    check (delivery_method in ('delivery', 'pickup')),
  delivery_cost numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  author_name text,
  author_id uuid references auth.users(id) on delete set null,
  rating int not null default 5 check (rating between 1 and 5),
  text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  text text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.callbacks (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text not null,
  purpose text,
  status text not null default 'new' check (status in ('new', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  badge text,
  product_id uuid references public.products(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_notes (
  id uuid primary key default gen_random_uuid(),
  note_date date not null,
  note text not null,
  remind_days int not null default 1,
  done boolean not null default false,
  order_number text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  phone text,
  email text,
  address text,
  hours text,
  announcement text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'user'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger categories_updated before update on public.categories
  for each row execute function public.set_updated_at();
create trigger products_updated before update on public.products
  for each row execute function public.set_updated_at();
create trigger orders_updated before update on public.orders
  for each row execute function public.set_updated_at();
create trigger banners_updated before update on public.banners
  for each row execute function public.set_updated_at();
create trigger site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Order number sequence helper
create or replace function public.next_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  select coalesce(count(*), 0) + 1001 into n from public.orders;
  return 'AM-' || n::text;
end;
$$;

-- create_order RPC
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
begin
  if v_name is null or btrim(v_name) = '' or v_phone is null or btrim(v_phone) = '' then
    raise exception 'customer_name and phone are required';
  end if;

  insert into public.orders (
    order_number, customer_name, phone, address, comment, items, total, status,
    customer_user_id, customer_email, payment_method, delivery_method, delivery_cost
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
    coalesce((payload->>'delivery_cost')::numeric, 0)
  )
  returning * into o;

  return o;
end;
$$;

-- update_order_status RPC (admin only)
create or replace function public.update_order_status(p_order_id uuid, p_new_status text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  if p_new_status not in ('new', 'processing', 'completed', 'cancelled') then
    raise exception 'invalid status';
  end if;

  update public.orders
  set status = p_new_status, updated_at = now()
  where id = p_order_id
  returning * into o;

  if o.id is null then
    raise exception 'order not found';
  end if;

  return o;
end;
$$;

grant execute on function public.create_order(jsonb) to anon, authenticated;
grant execute on function public.update_order_status(uuid, text) to authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.testimonials enable row level security;
alter table public.callbacks enable row level security;
alter table public.banners enable row level security;
alter table public.calendar_notes enable row level security;
alter table public.site_settings enable row level security;

-- Profiles
create policy profiles_select on public.profiles for select using (
  auth.uid() = id or public.is_admin()
);
create policy profiles_update_self on public.profiles for update using (
  auth.uid() = id or public.is_admin()
);

-- Categories: public read, admin write
create policy categories_read on public.categories for select using (true);
create policy categories_admin_ins on public.categories for insert with check (public.is_admin());
create policy categories_admin_upd on public.categories for update using (public.is_admin());
create policy categories_admin_del on public.categories for delete using (public.is_admin());

-- Products: active OR admin read; admin write
create policy products_read on public.products for select using (is_active = true or public.is_admin());
create policy products_admin_ins on public.products for insert with check (public.is_admin());
create policy products_admin_upd on public.products for update using (public.is_admin());
create policy products_admin_del on public.products for delete using (public.is_admin());

-- Orders: own or admin read; insert via RPC (security definer); admin update/delete
create policy orders_read on public.orders for select using (
  customer_user_id = auth.uid() or public.is_admin()
);
create policy orders_admin_upd on public.orders for update using (public.is_admin());
create policy orders_admin_del on public.orders for delete using (public.is_admin());

-- Reviews
create policy reviews_read on public.reviews for select using (true);
create policy reviews_insert on public.reviews for insert with check (true);
create policy reviews_upd on public.reviews for update using (
  author_id = auth.uid() or public.is_admin()
);
create policy reviews_del on public.reviews for delete using (
  author_id = auth.uid() or public.is_admin()
);

-- Favorites: owner only
create policy favorites_select on public.favorites for select using (user_id = auth.uid());
create policy favorites_insert on public.favorites for insert with check (user_id = auth.uid());
create policy favorites_update on public.favorites for update using (user_id = auth.uid());
create policy favorites_delete on public.favorites for delete using (user_id = auth.uid());

-- Testimonials
create policy testimonials_read on public.testimonials for select using (
  approved = true or public.is_admin()
);
create policy testimonials_insert on public.testimonials for insert with check (true);
create policy testimonials_admin_upd on public.testimonials for update using (public.is_admin());
create policy testimonials_admin_del on public.testimonials for delete using (public.is_admin());

-- Callbacks
create policy callbacks_insert on public.callbacks for insert with check (true);
create policy callbacks_admin_read on public.callbacks for select using (public.is_admin());
create policy callbacks_admin_upd on public.callbacks for update using (public.is_admin());
create policy callbacks_admin_del on public.callbacks for delete using (public.is_admin());

-- Banners
create policy banners_read on public.banners for select using (is_active = true or public.is_admin());
create policy banners_admin_ins on public.banners for insert with check (public.is_admin());
create policy banners_admin_upd on public.banners for update using (public.is_admin());
create policy banners_admin_del on public.banners for delete using (public.is_admin());

-- Calendar notes: admin only
create policy calendar_admin_all on public.calendar_notes for all using (public.is_admin()) with check (public.is_admin());

-- Site settings
create policy site_settings_read on public.site_settings for select using (true);
create policy site_settings_admin_ins on public.site_settings for insert with check (public.is_admin());
create policy site_settings_admin_upd on public.site_settings for update using (public.is_admin());
create policy site_settings_admin_del on public.site_settings for delete using (public.is_admin());

-- Seed defaults
insert into public.site_settings (phone, email, address, hours, announcement)
select
  '+375 (29) 602-01-10',
  'info@aquamarket.by',
  'ул. Барташова 1, Жлобин, Гомельская область',
  'Пн–Пт: 9:00 — 20:00 · Сб–Вс: 10:00 — 18:00',
  'Сезонная распродажа сантехники — скидки до 40%'
where not exists (select 1 from public.site_settings);

insert into public.categories (name, slug, icon, sort_order) values
  ('Ванны', 'vanny', 'bath', 1),
  ('Раковины', 'rakoviny', 'droplets', 2),
  ('Смесители', 'smesiteli', 'shower-head', 3),
  ('Душевые системы', 'dushevye', 'shower', 4),
  ('Унитазы', 'unitazy', 'toilet', 5),
  ('Мебель для ванной', 'mebel', 'cabinet', 6),
  ('Водонагреватели', 'vodonagrevateli', 'flame', 7),
  ('Полотенцесушители', 'polotentsesushiteli', 'heater', 8)
on conflict (slug) do nothing;
