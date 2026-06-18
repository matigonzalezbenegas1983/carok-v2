-- ============================================================
-- SELLER ONBOARDING FLOW
-- Función segura para que un buyer se convierta en seller
-- y cree su tienda en una sola transacción.
-- ============================================================

create or replace function public.become_seller(
  p_store_name text,
  p_store_slug text,
  p_description text default null
)
returns uuid   -- devuelve el store_id creado
language plpgsql security definer set search_path = public
as $$
declare
  v_store_id uuid;
begin
  -- Validar que el usuario no sea ya seller o admin
  if (select role from public.profiles where id = auth.uid()) != 'buyer' then
    raise exception 'El usuario ya es seller o admin.';
  end if;

  -- Actualizar role
  update public.profiles set role = 'seller' where id = auth.uid();

  -- Crear tienda en estado 'pending' (admin la activa)
  insert into public.stores (owner_id, name, slug, description)
  values (auth.uid(), p_store_name, p_store_slug, p_description)
  returning id into v_store_id;

  return v_store_id;
end;
$$;

-- Solo usuarios autenticados pueden llamar esta función
revoke all on function public.become_seller from anon;
grant execute on function public.become_seller to authenticated;


-- ============================================================
-- FUNCIÓN: activar/suspender tienda (solo admin)
-- ============================================================
create or replace function public.set_store_status(
  p_store_id uuid,
  p_status   store_status
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Permiso denegado.';
  end if;

  update public.stores set status = p_status where id = p_store_id;
end;
$$;

revoke all on function public.set_store_status from anon, authenticated;
grant execute on function public.set_store_status to authenticated;
