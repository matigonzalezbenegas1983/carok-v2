import type { Metadata } from "next"
import { Hero }            from "@/components/landing/hero"
import { AboutSection }    from "@/components/landing/about-section"
import { VehicleGallery }  from "@/components/landing/vehicle-gallery"
import { getVehiclesByBodyType } from "@/lib/supabase/vehicles"

export const metadata: Metadata = {
  title:       "CarOK — Vehículos Premium en Córdoba",
  description: "Agencia de autos usados premium en Córdoba Capital. Garantía, financiación y más de 500 vehículos disponibles.",
  openGraph: {
    title:       "CarOK — Vehículos Premium en Córdoba",
    description: "Agencia de autos usados premium en Córdoba Capital.",
    images:      ["/og-image.png"],
  },
}

export default async function HomePage() {
  const [all, camionetas, sedan, hatchback, suv] = await Promise.all([
    getVehiclesByBodyType(null, 4),
    getVehiclesByBodyType("camioneta", 4),
    getVehiclesByBodyType("sedan", 4),
    getVehiclesByBodyType("hatchback", 4),
    getVehiclesByBodyType("suv", 4),
  ])

  return (
    <>
      <Hero />
      <AboutSection />
      <VehicleGallery
        all={all}
        camionetas={camionetas}
        sedan={sedan}
        hatchback={hatchback}
        suv={suv}
      />
    </>
  )
}
