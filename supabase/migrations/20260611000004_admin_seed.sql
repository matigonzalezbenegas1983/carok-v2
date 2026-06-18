-- ============================================================
-- ADMIN BOOTSTRAP
-- Ejecutar UNA VEZ después del primer registro del super-admin.
-- Reemplazar el email antes de correr.
-- ============================================================

-- Promover a admin al primer usuario registrado con ese email
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users
  where email = 'admin@tudominio.com'   -- ← cambiar
  limit 1
);

-- Verificar
select p.id, u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'admin';
