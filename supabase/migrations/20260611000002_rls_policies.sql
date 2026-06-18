-- ============================================================
-- RLS POLICIES — Marketplace
-- Principio: denegar todo por defecto, permitir explícitamente.
-- ============================================================

-- Helper: obtener el role del usuario actual sin join extra
create or replace function public.my_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Helper: verificar si el usuario es admin
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


-- ─── PROFILES ────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Cualquier usuario autenticado puede ver perfiles públicos
create policy "profiles: select public"
  on public.profiles for select
  using (true);

-- Cada usuario solo edita su propio perfil (admins pueden editar cualquiera)
create policy "profiles: update own or admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Solo admins pueden cambiar el role
create policy "profiles: admin set role"
  on public.profiles for update
  using (public.is_admin());


-- ─── STORES ──────────────────────────────────────────────────
alter table public.stores enable row level security;

-- Tiendas activas son visibles para todos
create policy "stores: select active"
  on public.stores for select
  using (status = 'active' or owner_id = auth.uid() or public.is_admin());

-- Solo sellers pueden crear su propia tienda
create policy "stores: insert seller"
  on public.stores for insert
  with check (
    owner_id = auth.uid()
    and public.my_role() = 'seller'
  );

-- Seller edita su tienda; admin edita cualquiera
create policy "stores: update own or admin"
  on public.stores for update
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

-- Solo admins pueden eliminar tiendas
create policy "stores: delete admin only"
  on public.stores for delete
  using (public.is_admin());


-- ─── CATEGORIES ──────────────────────────────────────────────
alter table public.categories enable row level security;

-- Todos pueden leer categorías
create policy "categories: select all"
  on public.categories for select
  using (true);

-- Solo admins gestionan categorías
create policy "categories: admin write"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());


-- ─── PRODUCTS ────────────────────────────────────────────────
alter table public.products enable row level security;

-- Productos activos son públicos; seller ve los suyos; admin ve todo
create policy "products: select"
  on public.products for select
  using (
    status = 'active'
    or public.is_admin()
    or exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

-- Seller solo crea productos en su propia tienda activa
create policy "products: insert seller"
  on public.products for insert
  with check (
    public.my_role() = 'seller'
    and exists (
      select 1 from public.stores s
      where s.id = store_id
        and s.owner_id = auth.uid()
        and s.status = 'active'
    )
  );

-- Seller edita sus productos; admin edita cualquiera
create policy "products: update own or admin"
  on public.products for update
  using (
    public.is_admin()
    or exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

-- Seller hace soft-delete (status='deleted'); admin puede DELETE real
create policy "products: delete admin"
  on public.products for delete
  using (public.is_admin());


-- ─── PRODUCT IMAGES ──────────────────────────────────────────
alter table public.product_images enable row level security;

-- Imágenes siguen visibilidad del producto
create policy "product_images: select"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (p.status = 'active' or public.is_admin()
          or exists (
            select 1 from public.stores s
            where s.id = p.store_id and s.owner_id = auth.uid()
          ))
    )
  );

-- Seller gestiona imágenes de sus productos
create policy "product_images: write seller or admin"
  on public.product_images for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_id and s.owner_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_id and s.owner_id = auth.uid()
    )
  );
