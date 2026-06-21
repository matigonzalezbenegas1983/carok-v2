-- ============================================================
-- CAROK-V2 — SETUP COMPLETO (Migraciones 1+2+3+5)
-- Pegar TODO esto en Supabase SQL Editor y darle Run.
-- IDEMPOTENTE: se puede correr varias veces sin romper.
-- ============================================================

-- =========================================================
-- 0. LIMPIEZA (por si quedó algo de un intento anterior)
-- =========================================================
drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.product_images cascade;
drop table if exists public.products       cascade;
drop table if exists public.categories     cascade;
drop table if exists public.stores         cascade;
drop table if exists public.profiles       cascade;

drop function if exists public.handle_new_user()                cascade;
drop function if exists public.set_updated_at()                 cascade;
drop function if exists public.my_role()                        cascade;
drop function if exists public.is_admin()                       cascade;
drop function if exists public.become_seller(text,text,text)    cascade;
drop function if exists public.set_store_status(uuid,store_status) cascade;

drop type if exists public.user_role      cascade;
drop type if exists public.product_status cascade;
drop type if exists public.store_status   cascade;

-- (Los buckets se gestionan más abajo con ON CONFLICT — no se pueden borrar por SQL)

-- Limpiar policies de storage de un intento anterior
do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like ANY(ARRAY['avatars:%','product-images:%','store-assets:%'])
  loop
    execute format('drop policy if exists %I on storage.objects', r.policyname);
  end loop;
end $$;


-- =========================================================
-- 1. SCHEMA INICIAL
-- =========================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

create type public.user_role      as enum ('admin', 'seller', 'buyer');
create type public.product_status as enum ('draft', 'active', 'paused', 'deleted');
create type public.store_status   as enum ('pending', 'active', 'suspended');

-- PROFILES
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  role        user_role   not null default 'buyer',
  full_name   text,
  avatar_url  text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- STORES
create table public.stores (
  id          uuid          primary key default uuid_generate_v4(),
  owner_id    uuid          not null references public.profiles(id) on delete cascade,
  name        text          not null,
  slug        text          not null unique,
  description text,
  logo_url    text,
  banner_url  text,
  status      store_status  not null default 'pending',
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now(),
  constraint stores_slug_format check (slug ~ '^[a-z0-9-]+$')
);
create index on public.stores(owner_id);
create index on public.stores(slug);
create trigger stores_updated_at before update on public.stores
  for each row execute procedure public.set_updated_at();

-- CATEGORIES
create table public.categories (
  id         uuid        primary key default uuid_generate_v4(),
  parent_id  uuid        references public.categories(id) on delete set null,
  name       text        not null,
  slug       text        not null unique,
  icon_url   text,
  sort_order int         not null default 0,
  created_at timestamptz not null default now()
);
create index on public.categories(parent_id);

-- PRODUCTS
create table public.products (
  id            uuid            primary key default uuid_generate_v4(),
  store_id      uuid            not null references public.stores(id) on delete cascade,
  category_id   uuid            references public.categories(id) on delete set null,
  name          text            not null,
  slug          text            not null unique,
  description   text,
  price         numeric(12, 2)  not null check (price >= 0),
  compare_price numeric(12, 2)  check (compare_price >= 0),
  stock         int             not null default 0 check (stock >= 0),
  sku           text,
  status        product_status  not null default 'draft',
  metadata      jsonb           not null default '{}',
  created_at    timestamptz     not null default now(),
  updated_at    timestamptz     not null default now()
);
create index on public.products(store_id);
create index on public.products(category_id);
create index on public.products(status);
create index on public.products using gin(name gin_trgm_ops);
create trigger products_updated_at before update on public.products
  for each row execute procedure public.set_updated_at();

-- PRODUCT IMAGES
create table public.product_images (
  id         uuid        primary key default uuid_generate_v4(),
  product_id uuid        not null references public.products(id) on delete cascade,
  url        text        not null,
  alt_text   text,
  sort_order int         not null default 0,
  is_cover   boolean     not null default false,
  created_at timestamptz not null default now()
);
create index on public.product_images(product_id);


-- =========================================================
-- 2. RLS POLICIES
-- =========================================================
create or replace function public.my_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- PROFILES
alter table public.profiles enable row level security;
create policy "profiles: select public" on public.profiles for select using (true);
create policy "profiles: update own or admin" on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- STORES
alter table public.stores enable row level security;
create policy "stores: select active" on public.stores for select
  using (status = 'active' or owner_id = auth.uid() or public.is_admin());
create policy "stores: insert seller" on public.stores for insert
  with check (owner_id = auth.uid() and public.my_role() = 'seller');
create policy "stores: update own or admin" on public.stores for update
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy "stores: delete admin only" on public.stores for delete
  using (public.is_admin());

-- CATEGORIES
alter table public.categories enable row level security;
create policy "categories: select all" on public.categories for select using (true);
create policy "categories: admin write" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- PRODUCTS
alter table public.products enable row level security;
create policy "products: select" on public.products for select using (
  status = 'active' or public.is_admin()
  or exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid())
);
create policy "products: insert seller" on public.products for insert with check (
  public.my_role() = 'seller'
  and exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid() and s.status = 'active')
);
create policy "products: update own or admin" on public.products for update using (
  public.is_admin()
  or exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid())
) with check (
  public.is_admin()
  or exists (select 1 from public.stores s where s.id = store_id and s.owner_id = auth.uid())
);
create policy "products: delete admin" on public.products for delete using (public.is_admin());

-- PRODUCT IMAGES
alter table public.product_images enable row level security;
create policy "product_images: select" on public.product_images for select using (
  exists (
    select 1 from public.products p where p.id = product_id
      and (p.status = 'active' or public.is_admin()
        or exists (select 1 from public.stores s where s.id = p.store_id and s.owner_id = auth.uid()))
  )
);
create policy "product_images: write seller or admin" on public.product_images for all using (
  public.is_admin()
  or exists (select 1 from public.products p join public.stores s on s.id = p.store_id
    where p.id = product_id and s.owner_id = auth.uid())
) with check (
  public.is_admin()
  or exists (select 1 from public.products p join public.stores s on s.id = p.store_id
    where p.id = product_id and s.owner_id = auth.uid())
);


-- =========================================================
-- 3. STORAGE BUCKETS
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('store-assets', 'store-assets', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "avatars: public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars: owner upload" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars: owner update" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars: owner delete" on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "product-images: public read" on storage.objects for select using (bucket_id = 'product-images');
create policy "product-images: seller upload" on storage.objects for insert with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.stores s
    where s.id::text = (storage.foldername(name))[1] and s.owner_id = auth.uid())
);
create policy "product-images: seller update" on storage.objects for update using (
  bucket_id = 'product-images'
  and exists (select 1 from public.stores s
    where s.id::text = (storage.foldername(name))[1] and s.owner_id = auth.uid())
);
create policy "product-images: seller or admin delete" on storage.objects for delete using (
  bucket_id = 'product-images' and (public.is_admin()
    or exists (select 1 from public.stores s
      where s.id::text = (storage.foldername(name))[1] and s.owner_id = auth.uid()))
);

create policy "store-assets: public read" on storage.objects for select using (bucket_id = 'store-assets');
create policy "store-assets: seller upload" on storage.objects for insert with check (
  bucket_id = 'store-assets'
  and exists (select 1 from public.stores s
    where s.id::text = (storage.foldername(name))[1] and s.owner_id = auth.uid())
);
create policy "store-assets: seller or admin delete" on storage.objects for delete using (
  bucket_id = 'store-assets' and (public.is_admin()
    or exists (select 1 from public.stores s
      where s.id::text = (storage.foldername(name))[1] and s.owner_id = auth.uid()))
);


-- =========================================================
-- 5. SELLER ONBOARDING FLOW
-- =========================================================
create or replace function public.become_seller(
  p_store_name text, p_store_slug text, p_description text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_store_id uuid;
begin
  if (select role from public.profiles where id = auth.uid()) != 'buyer' then
    raise exception 'El usuario ya es seller o admin.';
  end if;
  update public.profiles set role = 'seller' where id = auth.uid();
  insert into public.stores (owner_id, name, slug, description)
  values (auth.uid(), p_store_name, p_store_slug, p_description)
  returning id into v_store_id;
  return v_store_id;
end;
$$;
revoke all on function public.become_seller from anon;
grant execute on function public.become_seller to authenticated;

create or replace function public.set_store_status(
  p_store_id uuid, p_status store_status
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Permiso denegado.'; end if;
  update public.stores set status = p_status where id = p_store_id;
end;
$$;
revoke all on function public.set_store_status from anon, authenticated;
grant execute on function public.set_store_status to authenticated;

-- ============================================================
-- LISTO. Ahora andá a Auth y registrate. Después corrés el SQL
-- de admin_seed para promoverte a admin.
-- ============================================================
