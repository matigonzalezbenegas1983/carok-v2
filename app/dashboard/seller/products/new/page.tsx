import { redirect } from "next/navigation"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/seller/product-form"

export default async function NewProductPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/auth/login")

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, status")
    .eq("owner_id", session.user.id)
    .single()

  if (!store) redirect("/dashboard/seller/onboarding")

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-void px-6 py-4">
        <Link href="/dashboard/seller/products"
          className="text-xs text-surface/50 hover:text-surface transition-colors">
          ← Mis productos
        </Link>
        <h1 className="font-bold text-white text-lg mt-0.5">Nuevo producto</h1>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {store.status !== "active" && (
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-3 flex gap-3 items-start">
            <span className="text-amber-400 shrink-0">⚠️</span>
            <p className="text-sm text-amber-800">
              Tu tienda está en revisión. El producto se creará en borrador y se publicará cuando la tienda sea activada.
            </p>
          </div>
        )}

        <div className="card p-8">
          <ProductForm storeId={store.id} />
        </div>
      </div>
    </div>
  )
}
