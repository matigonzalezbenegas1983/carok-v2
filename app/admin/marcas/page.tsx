import type { Metadata } from "next"
import { getAllBrands } from "@/lib/supabase/brands"
import { BrandsClient } from "./brands-client"

export const metadata: Metadata = {
  title: "Marcas — CarOK Admin",
  robots: { index: false },
}

export default async function MarcasPage() {
  const brands = await getAllBrands()
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Marcas</h1>
        <p className="text-ink/50 text-sm mt-1">{brands.length} marcas registradas</p>
      </div>
      <BrandsClient initialBrands={brands} />
    </div>
  )
}
