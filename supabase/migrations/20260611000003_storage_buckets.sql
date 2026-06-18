-- ============================================================
-- STORAGE BUCKETS + POLICIES
-- ============================================================

-- ─── AVATARS ─────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,                          -- URL pública (no requiere token)
  2097152,                       -- 2 MB
  array['image/jpeg','image/png','image/webp']
);

-- Cualquiera puede leer avatares (bucket público, pero policy explícita)
create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Solo el dueño sube/actualiza su avatar
create policy "avatars: owner upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars: owner update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


-- ─── PRODUCT IMAGES ──────────────────────────────────────────
-- Path esperado: product-images/{store_id}/{product_id}/{filename}
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,                       -- 5 MB por imagen
  array['image/jpeg','image/png','image/webp','image/gif']
);

create policy "product-images: public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Solo seller dueño de esa tienda puede subir imágenes
create policy "product-images: seller upload"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.stores s
      where s.id::text = (storage.foldername(name))[1]
        and s.owner_id = auth.uid()
    )
  );

create policy "product-images: seller update"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.stores s
      where s.id::text = (storage.foldername(name))[1]
        and s.owner_id = auth.uid()
    )
  );

create policy "product-images: seller or admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (
      public.is_admin()
      or exists (
        select 1 from public.stores s
        where s.id::text = (storage.foldername(name))[1]
          and s.owner_id = auth.uid()
      )
    )
  );


-- ─── STORE ASSETS ────────────────────────────────────────────
-- Logos y banners de tiendas
-- Path esperado: store-assets/{store_id}/{filename}
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-assets',
  'store-assets',
  true,
  3145728,                       -- 3 MB
  array['image/jpeg','image/png','image/webp']
);

create policy "store-assets: public read"
  on storage.objects for select
  using (bucket_id = 'store-assets');

create policy "store-assets: seller upload"
  on storage.objects for insert
  with check (
    bucket_id = 'store-assets'
    and exists (
      select 1 from public.stores s
      where s.id::text = (storage.foldername(name))[1]
        and s.owner_id = auth.uid()
    )
  );

create policy "store-assets: seller or admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'store-assets'
    and (
      public.is_admin()
      or exists (
        select 1 from public.stores s
        where s.id::text = (storage.foldername(name))[1]
          and s.owner_id = auth.uid()
      )
    )
  );
