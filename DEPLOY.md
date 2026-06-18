# CarOK — Instrucciones de despliegue en Vercel

## 1. Dependencias a instalar

```bash
npm install framer-motion lucide-react clsx tailwind-merge
npm install @supabase/supabase-js @supabase/ssr
```

## 2. Variables de entorno (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://oydtdqmubpjnnrdfnxsk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
NEXT_PUBLIC_WHATSAPP=5491100000000   # sin + ni espacios
```

## 3. Primer admin

Después de registrar el usuario que será administrador, ejecutá en Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'tu@email.com');
```

## 4. Despliegue en Vercel

### Opción A — Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### Opción B — GitHub
1. Subir el proyecto a un repo de GitHub
2. Ir a [vercel.com](https://vercel.com) → New Project → Importar repo
3. Configurar las variables de entorno en Settings → Environment Variables
4. Click en Deploy

### Variables en Vercel (Settings → Environment Variables):
| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key del proyecto |
| `NEXT_PUBLIC_SITE_URL` | URL de producción (ej: https://carok.vercel.app) |
| `NEXT_PUBLIC_WHATSAPP` | Número de WhatsApp sin + (ej: 5491100000000) |

## 5. Supabase — configurar Auth

En el dashboard de Supabase → Authentication → URL Configuration:
- **Site URL**: `https://tu-dominio.vercel.app`
- **Redirect URLs**: `https://tu-dominio.vercel.app/auth/callback`

## 6. Verificación post-deploy

- [ ] `/` → Landing carga con animaciones
- [ ] `/catalogo` → Muestra vehículos (o mensaje de vacío)
- [ ] `/auth/login` → Login funciona
- [ ] `/admin` → Redirige a login si no autenticado
- [ ] `/admin` (autenticado como admin) → Dashboard visible
- [ ] `/admin/vehiculos/nuevo` → Formulario funciona y sube imágenes
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1

## 7. Logo

Guardá el archivo del logo como `/public/logo.png` (fondo negro, formato PNG).

## 8. Imágenes OG

Guardá una imagen 1200×630px como `/public/og-image.png`.

## Estructura de rutas

```
/                          → Landing (público)
/catalogo                  → Catálogo con filtros (público)
/autos/[slug]             → Detalle de vehículo (público)
/auth/login               → Login
/auth/callback            → Callback OAuth
/admin                    → Dashboard admin (protegido)
/admin/vehiculos          → Lista vehículos (protegido)
/admin/vehiculos/nuevo    → Crear vehículo (protegido)
/admin/vehiculos/[id]     → Editar vehículo (protegido)
/admin/marcas             → Gestión de marcas (solo admin)
/admin/vendedores         → Lista de vendedores (solo admin)
/api/vehiculos            → GET list / POST create
/api/vehiculos/[id]       → PATCH update / DELETE
/api/upload               → POST subida de imágenes
/api/admin/marcas         → POST crear marca
/api/admin/marcas/[id]    → DELETE marca
```
