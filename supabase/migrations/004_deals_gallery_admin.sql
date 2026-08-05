-- Fill deals of the day, product galleries, bootstrap admin, lock role self-promotion

-- More «Акция дня» (at least 4–6)
update public.products
set is_deal_of_day = true
where is_active = true
  and old_price is not null
  and old_price > price;

-- Ensure galleries for carousel (image_url + 2 extras)
update public.products
set gallery = array[
  coalesce(image_url, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80'),
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
  'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80'
]
where coalesce(cardinality(gallery), 0) < 2
  and image_url is not null;

-- Bootstrap primary admin (runs when profile already exists)
update public.profiles
set role = 'admin'
where lower(email) = lower('shyst.evgeny@mail.ru');

-- Auto-admin on future signup for this email
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
    case
      when lower(new.email) = lower('shyst.evgeny@mail.ru') then 'admin'
      else 'user'
    end
  );
  return new;
end;
$$;

-- Prevent users from promoting themselves; only admin can change roles
drop policy if exists profiles_update_self on public.profiles;

create policy profiles_update_self on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());
