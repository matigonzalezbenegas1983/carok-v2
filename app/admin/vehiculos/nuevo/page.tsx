import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getAllBrands } from "@/lib/supabase/brands"
import { VehicleForm } from "@/components/admin/vehicle-form"

export const metadata: Metadata = {
  title: "Nuevo vehículo — CarOK Admin",
  robots: { index: false },
}

export default async function NuevoVehiculoPage() {
  const brands = await getAllBrands()

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/vehiculos" className="flex items-center gap-1 text-sm text-ink/50 hover:text-brand mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Volver a vehículos
        </Link>
        <h1 className="text-2xl font-bold text-ink">Nuevo vehículo</h1>
        <p className="text-sm text-ink/50 mt-1">Completá los datos para publicar el vehículo</p>
      </div>
      <VehicleForm brands={brands} mode="create" />
    </div>
  )
}
