-- ============================================================
-- MARKETPLACE — Schema Inicial
-- Roles: admin | seller | buyer
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- búsqueda fuzzy en productos


-- ─── ENUM TYPES ─────────────────────────────────────────────
create type public.user_role      as enum ('admin', 'seller', 'buyer');
create type public.product_status as enum ('draft', 'active', 'paused', 'deleted');
create type public.store_status   as enum ('pending', 'active', 'suspended');


-- ============================================================
-- 1. PROFILES
--    Extiende auth.users. Se crea automáticamente via trigger.
-- ============================================================
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  role        user_role   not null default 'buyer',
  full_name   text,
  avatar_url  text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Perfil público de cada usuario autenticado.';

-- Trigger: crear profile al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- 2. STORES (Tiendas de los Sellers)
-- ============================================================
create table public.stores (
  id            uuid          primary key default uuid_generate_v4(),
  owner_id      uuid          not null references public.profiles(id) on delete cascade,
  name          text          not null,
  slug          text          not null unique,
  description   text,
  logo_url      text,
  banner_url    text,
  status        store_status  not null default 'pending',
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now(),

  constraint stores_slug_format check (slug ~ '^[a-z0-9-]+$')
);

comment on table public.stores is 'Tienda de cada seller. Un seller puede tener una tienda.';
create index on public.stores(owner_id);
create index on public.stores(slug);

create trigger stores_updated_at
  before update on public.stores
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- 3. CATEGORIES
-- ============================================================
create table public.categories (
  id          uuid        primary key default uuid_generate_v4(),
  parent_id   uuid        references public.categories(id) on delete set null,
  name        text        not null,
  slug        text        not null unique,
  icon_url    text,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now()
);

comment on table public.categories is 'Árbol de categorías. Solo admins pueden modificarlas.';
create index on public.categories(parent_id);


-- ============================================================
-- 4. PRODUCTS
-- ============================================================
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

comment on table public.products is 'Catálogo de productos publicados por sellers.';
create index on public.products(store_id);
create index on public.products(category_id);
create index on public.products(status);
create index on public.products using gin(name gin_trgm_ops);   -- búsqueda full-text

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- 5. PRODUCT IMAGES
-- ============================================================
create table public.product_images (
  id          uuid        primary key default uuid_generate_v4(),
  product_id  uuid        not null references public.products(id) on delete cascade,
  url         text        not null,
  alt_text    text,
  sort_order  int         not null default 0,
  is_cover    boolean     not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.product_images is 'Imágenes de un producto (máx recomendado: 10).';
create index on public.product_images(product_id);
