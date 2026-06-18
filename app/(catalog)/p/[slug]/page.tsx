import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Product, Store, Category, ProductImage } from "@/lib/supabase/types"

type FullProduct = Product & {
  stores: Pick<Store, "name" | "slug" | "description" | "logo_url"> | null
  categories: Pick<Category, "name"> | null
  product_images: Pick<ProductImage, "id" | "url" | "alt_text" | "sort_order" | "is_cover">[]
}

async function getProduct(slug: string): Promise<FullProduct | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("products")
    .select(`
      *,
      stores ( name, slug, description, logo_url ),
      categories ( name ),
      product_images ( id, url, alt_text, sort_order, is_cover )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  return data as FullProduct | null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: "Producto no encontrado" }

  const description = product.description?.slice(0, 155) ?? ""
  const image = product.product_images.find((img) => img.is_cover)?.url
    ?? product.product_images[0]?.url
    ?? undefined

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: image ? [{ url: image }] : [],
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const images = [...product.product_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt_text ?? product.name,
    }))

  const discount =
    product.compare_price && product.compare_price > product.price
      ? Math.round((1 - product.price / product.compare_price) * 100)
      : null

  return (
    <div className="mx-auto max-w-5xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink/50">
        <Link href="/" className="hover:text-brand">
          CarOK
        </Link>
        <span>/</span>
        {product.categories?.name && (
          <>
            <span>{product.categories.name}</span>
            <span>/</span>
          </>
        )}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Galería */}
        <div className="space-y-3">
          {images.length > 0 ? (
            <>
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface">
                <Image
                  src={images[0].url}
                  alt={images[0].alt ?? product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.slice(1, 6).map((img) => (
                    <div
                      key={img.id}
                      className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt ?? product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-surface text-5xl">
              📦
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {product.categories?.name && (
            <span className="badge badge-gray w-fit">{product.categories.name}</span>
          )}
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">{product.name}</h1>

          {/* Precio */}
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-brand">{formatPrice(product.price)}</p>
            {product.compare_price && product.compare_price > product.price && (
              <>
                <p className="pb-1 text-lg text-ink/40 line-through">
                  {formatPrice(product.compare_price)}
                </p>
                <span className="badge badge-green pb-1">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-ink/40">SKU: {product.sku}</p>
          )}

          {/* Descripción */}
          {product.description && (
            <div className="rounded-xl bg-surface/30 p-4">
              <p className="whitespace-pre-line text-sm text-ink/80 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Vendedor */}
          {product.stores && (
            <Link
              href={`/tienda/${product.stores.slug}`}
              className="card flex items-center gap-3 p-3 hover:border-brand/40 transition-colors"
            >
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-surface">
                {product.stores.logo_url ? (
                  <Image
                    src={product.stores.logo_url}
                    alt={product.stores.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">
                    🏪
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-ink/50">Vendido por</p>
                <p className="truncate font-medium text-ink">{product.stores.name}</p>
              </div>
              <span className="ml-auto text-ink/30">→</span>
            </Link>
          )}

          {/* CTA */}
          <div className="mt-2 rounded-xl border border-surface-dark bg-surface/20 p-4 text-center">
            <p className="text-sm text-ink/60">
              Para comprar, contactá al vendedor directamente desde su tienda.
            </p>
            {product.stores?.slug && (
              <Link
                href={`/tienda/${product.stores.slug}`}
                className="btn-primary mt-3 inline-block"
              >
                Ver tienda
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
