import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/supabase/types"

export const metadata: Metadata = {
  title: "Mis productos — Dashboard",
  robots: { index: false },
}

const STATUS_LABEL: Record<Product["status"], string> = {
  active:  "Activo",
  draft:   "Borrador",
  paused:  "Pausado",
  deleted: "Eliminado",
}

const STATUS_CLASS: Record<Product["status"], string> = {
  active:  "badge-green",
  draft:   "badge-gray",
  paused:  "badge-amber",
  deleted: "badge-red",
}

export default async function SellerProductsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/auth/login")

  const { data: store } = await supabase
    .from("stores")
    .select("id, name")
    .eq("owner_id", session.user.id)
    .single()

  if (!store) redirect("/dashboard/seller/onboarding")

  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(url, is_cover)")
    .eq("store_id", store.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-void px-6 py-4 flex items-center justify-between">
        <div>
          <Link href="/dashboard/seller"
            className="text-xs text-surface/50 hover:text-surface transition-colors">
            ← Dashboard
          </Link>
          <h1 className="font-bold text-white text-lg mt-0.5">
            Productos — {store.name}
          </h1>
        </div>
        <Link href="/dashboard/seller/products/new" className="btn-primary text-xs px-4 py-1.5">
          + Nuevo
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {!products?.length ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📦</div>
            <p className="font-semibold text-ink">Sin productos todavía</p>
            <p className="text-sm text-ink/50 mt-1">
              Creá tu primer producto para empezar a vender.
            </p>
            <Link href="/dashboard/seller/products/new" className="btn-primary mt-5 inline-flex">
              Crear producto
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product) => {
              const productImages = Array.isArray(product.product_images)
                ? product.product_images
                : []
              const cover = productImages.find((i: { is_cover?: boolean; url?: string }) => i.is_cover)
              return (
                <div key={product.id}
                  className="card flex items-center gap-4 px-4 py-3 hover:border-surface-dark transition-colors">

                  {/* Imagen */}
                  <div className="relative w-12 h-12 rounded-lg bg-surface shrink-0 overflow-hidden">
                    {cover && (
                      <Image src={cover.url} alt={product.name} fill
                        sizes="48px" className="object-cover" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-void truncate">{product.name}</p>
                    <p className="text-xs text-ink/40 font-mono">{product.slug}</p>
                  </div>

                  {/* Precio */}
                  <p className="text-sm font-bold text-ink shrink-0">
                    ${product.price.toLocaleString("es-AR")}
                  </p>

                  {/* Stock */}
                  <p className="text-xs text-ink/50 w-14 text-right shrink-0">
                    {product.stock} u.
                  </p>

                  {/* Badge */}
                  <span className={STATUS_CLASS[product.status]}>
                    {STATUS_LABEL[product.status]}
                  </span>

                  <Link href={`/dashboard/seller/products/${product.id}`}
                    className="text-xs text-brand hover:text-brand-dark font-medium shrink-0">
                    Editar →
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
