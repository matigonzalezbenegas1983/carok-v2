import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { adminGetVehicle } from "@/lib/supabase/vehicles"
import { getAllBrands } from "@/lib/supabase/brands"
import { VehicleForm } from "@/components/admin/vehicle-form"

type Props = { params: Promise<{ id: string }> }

export const metadata: Metadata = {
  title: "Editar vehículo — CarOK Admin",
  robots: { index: false },
}

export default async function EditVehiculoPage({ params }: Props) {
  const { id } = await params
  const [vehicle, brands] = await Promise.all([
    adminGetVehicle(id),
    getAllBrands(),
  ])

  if (!vehicle) notFound()

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/vehiculos" className="flex items-center gap-1 text-sm text-ink/50 hover:text-brand mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Volver a vehículos
        </Link>
        <h1 className="text-2xl font-bold text-ink">Editar vehículo</h1>
        <p className="text-sm text-ink/50 mt-1">{vehicle.title}</p>
      </div>
      <VehicleForm brands={brands} vehicle={vehicle} mode="edit" />
    </div>
  )
}
