import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { getVehicleBySlug, getRelatedVehicles } from "@/lib/supabase/vehicles"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ImageGallery } from "@/components/vehicle/image-gallery"
import { SpecsGrid } from "@/components/vehicle/specs-grid"
import { WhatsAppCta } from "@/components/vehicle/whatsapp-cta"
import { VehicleCard } from "@/components/catalog/vehicle-card"
import { CONDITION_LABELS, SITE_URL } from "@/lib/constants"
import { formatPrice } from "@/lib/utils"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const vehicle = await getVehicleBySlug(slug)
  if (!vehicle) return { title: "Vehículo no encontrado | CarOK" }

  const description = vehicle.description
    ? vehicle.description.slice(0, 155)
    : `${vehicle.title} ${vehicle.year} — ${formatPrice(vehicle.price)}. Disponible en CarOK.`

  return {
    title:       `${vehicle.title} ${vehicle.year} | CarOK`,
    description,
    openGraph: {
      title:       `${vehicle.title} ${vehicle.year}`,
      description,
      images:      vehicle.thumbnail_url ? [{ url: vehicle.thumbnail_url }] : ["/og-image.png"],
      type:        "website",
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${vehicle.title} ${vehicle.year}`,
      description,
      images:      vehicle.thumbnail_url ? [vehicle.thumbnail_url] : ["/og-image.png"],
    },
  }
}

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params
  const vehicle = await getVehicleBySlug(slug)
  if (!vehicle) notFound()

  // Incrementar vistas (fire-and-forget)
  const supabase = await createServerSupabaseClient()
  supabase.rpc("increment_vehicle_views", { v_id: vehicle.id })

  const related = await getRelatedVehicles(vehicle.brand_id, vehicle.id, 3)

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name:        vehicle.title,
    description: vehicle.description ?? undefined,
    image:       vehicle.thumbnail_url ?? undefined,
    offers: {
      "@type": "Offer",
      price:         vehicle.price,
      priceCurrency: "ARS",
      availability: vehicle.status === "active"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/autos/${vehicle.slug}`,
    },
    brand: vehicle.brands ? { "@type": "Brand", name: vehicle.brands.name } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-xl py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-ink/40">
          <Link href="/" className="hover:text-brand transition-colors">Inicio</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/catalogo" className="hover:text-brand transition-colors">Catálogo</Link>
          {vehicle.brands && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/catalogo?brand=${vehicle.brands.slug}`}
                className="hover:text-brand transition-colors"
              >
                {vehicle.brands.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink truncate max-w-[200px]">{vehicle.title}</span>
        </nav>

        {/* Grid principal */}
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Columna izquierda */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {vehicle.brands && (
                <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-1">
                  {vehicle.brands.name}
                </p>
              )}
              <h1 className="text-2xl font-bold text-ink sm:text-3xl">{vehicle.title}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-ink/50">
                <span>{vehicle.year}</span>
                <span>·</span>
                <span>{CONDITION_LABELS[vehicle.condition]}</span>
                {vehicle.mileage != null && vehicle.mileage > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      {new Intl.NumberFormat("es-AR").format(vehicle.mileage)} km
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Galería */}
            <ImageGallery
              images={vehicle.vehicle_images}
              title={vehicle.title}
              thumbnail={vehicle.thumbnail_url}
            />

            {/* Descripción */}
            {vehicle.description && (
              <div className="card p-5">
                <h2 className="font-semibold text-ink mb-3">Descripción</h2>
                <p className="text-sm text-ink/70 leading-relaxed whitespace-pre-line">
                  {vehicle.description}
                </p>
              </div>
            )}

            {/* Specs */}
            <SpecsGrid vehicle={vehicle} />
          </div>

          {/* Columna derecha — sticky CTA */}
          <div>
            <WhatsAppCta vehicle={vehicle} />
          </div>
        </div>

        {/* Relacionados */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-ink mb-6">También te puede interesar</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
