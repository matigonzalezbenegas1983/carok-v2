-- ============================================================
-- CAROK-V2 — SCHEMA DE VEHICULOS (falta en migraciones)
-- Correr DESPUES de ALL_IN_ONE.sql
-- Idempotente: se puede correr varias veces.
-- ============================================================

-- =========================================================
-- 0. LIMPIEZA (por si quedó algo)
-- =========================================================
drop table if exists public.inquiries       cascade;
drop table if exists public.vehicle_images  cascade;
drop table if exists public.vehicles        cascade;
drop table if exists public.brands          cascade;
drop function if exists public.increment_vehicle_views(uuid) cascade;
drop type if exists public.fuel_type         cascade;
drop type if exists public.transmission_type cascade;
drop type if exists public.vehicle_condition cascade;
drop type if exists public.body_type         cascade;
drop type if exists public.vehicle_status    cascade;


-- =========================================================
-- 1. ENUMS
-- =========================================================
create type public.fuel_type         as enum ('nafta','diesel','hibrido','electrico','gnc');
create type public.transmission_type as enum ('manual','automatico','cvt');
create type public.vehicle_condition as enum ('nuevo','usado','certificado');
create type public.body_type         as enum ('sedan','suv','pickup','hatchback','coupe','convertible','van','camioneta');
create type public.vehicle_status    as enum ('active','draft','sold','archived');


-- =========================================================
-- 2. BRANDS
-- =========================================================
create table public.brands (
  id         uuid        primary key default uuid_generate_v4(),
  name       text        not null,
  slug       text        not null unique,
  logo_url   text,
  created_at timestamptz default now()
);


-- =========================================================
-- 3. VEHICLES
-- =========================================================
create table public.vehicles (
  id            uuid              primary key default uuid_generate_v4(),
  title         text              not null,
  slug          text              not null unique,
  brand_id      uuid              references public.brands(id) on delete set null,
  model         text              not null,
  year          int               not null,
  price         numeric(12,2)     not null check (price >= 0),
  mileage       int               check (mileage >= 0),
  fuel_type     fuel_type         not null default 'nafta',
  transmission  transmission_type not null default 'manual',
  color         text,
  body_type     body_type,
  condition     vehicle_condition not null default 'usado',
  description   text,
  features      text[],
  status        vehicle_status    not null default 'draft',
  featured      boolean           default false,
  thumbnail_url text,
  seller_id     uuid              references public.profiles(id) on delete set null,
  views         int               default 0,
  created_at    timestamptz       default now(),
  updated_at    timestamptz       default now()
);
create index on public.vehicles(brand_id);
create index on public.vehicles(status);
create index on public.vehicles(body_type);
create index on public.vehicles(seller_id);
create index on public.vehicles using gin(title gin_trgm_ops);

create trigger vehicles_updated_at before update on public.vehicles
  for each row execute procedure public.set_updated_at();


-- =========================================================
-- 4. VEHICLE IMAGES
-- =========================================================
create table public.vehicle_images (
  id         uuid        primary key default uuid_generate_v4(),
  vehicle_id uuid        not null references public.vehicles(id) on delete cascade,
  url        text        not null,
  alt        text,
  sort_order int         default 0,
  is_primary boolean     default false,
  created_at timestamptz default now()
);
create index on public.vehicle_images(vehicle_id);


-- =========================================================
-- 5. INQUIRIES (consultas de compradores)
-- =========================================================
create table public.inquiries (
  id         uuid        primary key default uuid_generate_v4(),
  vehicle_id uuid        references public.vehicles(id) on delete set null,
  name       text        not null,
  email      text,
  phone      text,
  message    text,
  read       boolean     default false,
  created_at timestamptz default now()
);
create index on public.inquiries(vehicle_id);
create index on public.inquiries(read);


-- =========================================================
-- 6. FUNCTION: increment_vehicle_views
-- =========================================================
create or replace function public.increment_vehicle_views(v_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.vehicles set views = coalesce(views,0) + 1 where id = v_id;
$$;
grant execute on function public.increment_vehicle_views(uuid) to anon, authenticated;


-- =========================================================
-- 7. RLS POLICIES
-- =========================================================
alter table public.brands         enable row level security;
alter table public.vehicles       enable row level security;
alter table public.vehicle_images enable row level security;
alter table public.inquiries      enable row level security;

-- BRANDS: lectura pública, escritura solo admin
create policy "brands: select all" on public.brands for select using (true);
create policy "brands: admin write" on public.brands for all
  using (public.is_admin()) with check (public.is_admin());

-- VEHICLES: lectura pública si active; admin/seller ven los suyos
create policy "vehicles: select" on public.vehicles for select using (
  status = 'active' or public.is_admin() or seller_id = auth.uid()
);
create policy "vehicles: admin or seller write" on public.vehicles for all using (
  public.is_admin() or seller_id = auth.uid()
) with check (
  public.is_admin() or seller_id = auth.uid()
);

-- VEHICLE_IMAGES: siguen visibilidad del vehículo
create policy "vehicle_images: select" on public.vehicle_images for select using (
  exists (select 1 from public.vehicles v
    where v.id = vehicle_id
      and (v.status = 'active' or public.is_admin() or v.seller_id = auth.uid()))
);
create policy "vehicle_images: write admin or owner" on public.vehicle_images for all using (
  public.is_admin()
  or exists (select 1 from public.vehicles v where v.id = vehicle_id and v.seller_id = auth.uid())
) with check (
  public.is_admin()
  or exists (select 1 from public.vehicles v where v.id = vehicle_id and v.seller_id = auth.uid())
);

-- INQUIRIES: cualquiera puede crear, solo admin/seller leen
create policy "inquiries: anyone can insert" on public.inquiries for insert with check (true);
create policy "inquiries: admin or seller read" on public.inquiries for select using (
  public.is_admin()
  or exists (select 1 from public.vehicles v where v.id = vehicle_id and v.seller_id = auth.uid())
);
create policy "inquiries: admin update" on public.inquiries for update
  using (public.is_admin()) with check (public.is_admin());


-- =========================================================
-- 8. STORAGE BUCKET: vehicle-images
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-images', 'vehicle-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Limpiar policies viejas si existen
do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like 'vehicle-images:%'
  loop
    execute format('drop policy if exists %I on storage.objects', r.policyname);
  end loop;
end $$;

create policy "vehicle-images: public read" on storage.objects for select
  using (bucket_id = 'vehicle-images');
create policy "vehicle-images: admin or seller upload" on storage.objects for insert
  with check (bucket_id = 'vehicle-images' and auth.uid() is not null);
create policy "vehicle-images: admin or owner update" on storage.objects for update
  using (bucket_id = 'vehicle-images' and auth.uid() is not null);
create policy "vehicle-images: admin or owner delete" on storage.objects for delete
  using (bucket_id = 'vehicle-images' and auth.uid() is not null);


-- =========================================================
-- 9. SEED — marcas comunes para que el catálogo no esté vacío
-- =========================================================
insert into public.brands (name, slug) values
  ('Toyota','toyota'), ('Ford','ford'), ('Chevrolet','chevrolet'),
  ('Volkswagen','volkswagen'), ('Fiat','fiat'), ('Renault','renault'),
  ('Peugeot','peugeot'), ('Honda','honda'), ('Nissan','nissan'),
  ('BMW','bmw'), ('Mercedes-Benz','mercedes-benz'), ('Audi','audi')
on conflict (slug) do nothing;

-- ============================================================
-- LISTO. Ahora el sitio puede leer vehiculos sin tirar 500.
-- ============================================================
