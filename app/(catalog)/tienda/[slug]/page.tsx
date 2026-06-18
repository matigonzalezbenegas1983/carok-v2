import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Store, Product } from "@/lib/supabase/types"

type StoreWithProducts = Store & {
  whatsapp: string | null
  instagram: string | null
  products: Array<
    Pick<Product, "id" | "slug" | "name" | "price" | "compare_price"> & {
      thumbnail_url: string | null
    }
  >
}

async function getStore(slug: string): Promise<StoreWithProducts | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("stores")
    .select(`
      *,
      products (
        id, slug, name, price, compare_price, thumbnail_url
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .eq("products.status", "active")
    .single()

  return data as StoreWithProducts | null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const store = await getStore(slug)
  if (!store) return { title: "Tienda no encontrada" }

  return {
    title: store.name,
    description: store.description ?? `Explorá los productos de ${store.name}.`,
    openGraph: {
      title: store.name,
      images: store.logo_url ? [{ url: store.logo_url }] : [],
    },
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price)
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const store = await getStore(slug)
  if (!store) notFound()

  return (
    <>
      {/* Header tienda */}
      <div className="mb-8 flex items-start gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface sm:h-20 sm:w-20">
          {store.logo_url ? (
            <Image
              src={store.logo_url}
              alt={store.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">🏪</div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">{store.name}</h1>
          {store.description && (
            <p className="mt-1 text-sm text-ink/60 line-clamp-3">{store.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink/40">
            <span>{store.products.length} productos</span>
            {store.whatsapp && (
              <a
                href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                WhatsApp
              </a>
            )}
            {store.instagram && (
              <a
                href={`https://instagram.com/${store.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                @{store.instagram.replace("@", "")}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Banner */}
      {store.banner_url && (
        <div className="relative mb-8 h-40 w-full overflow-hidden rounded-xl sm:h-56">
          <Image
            src={store.banner_url}
            alt={`Banner de ${store.name}`}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Grilla productos */}
      {store.products.length === 0 ? (
        <div className="py-20 text-center text-ink/40">
          <p>Esta tienda aún no tiene productos publicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {store.products.map((product) => {
            const discount =
              product.compare_price && product.compare_price > product.price
                ? Math.round((1 - product.price / product.compare_price) * 100)
                : null

            return (
              <Link
                key={product.id}
                href={`/p/${product.slug}`}
                className="card group flex flex-col overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square bg-surface">
                  {product.thumbnail_url ? (
                    <Image
                      src={product.thumbnail_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">📦</div>
                  )}
                  {discount && (
                    <span className="absolute right-2 top-2 badge badge-green text-xs">
                      -{discount}%
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <p className="line-clamp-2 text-sm font-medium text-ink leading-snug">
                    {product.name}
                  </p>
                  <div className="mt-auto pt-2">
                    <p className="font-bold text-brand">{formatPrice(product.price)}</p>
                    {product.compare_price && product.compare_price > product.price && (
                      <p className="text-xs text-ink/40 line-through">
                        {formatPrice(product.compare_price)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
