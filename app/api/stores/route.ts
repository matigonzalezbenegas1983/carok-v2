import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// POST /api/stores — buyer se convierte en seller
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const { storeName, storeSlug, description } = body

  if (!storeName || !storeSlug) {
    return NextResponse.json(
      { error: "storeName y storeSlug son requeridos" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase.rpc("become_seller", {
    p_store_name: storeName,
    p_store_slug: storeSlug,
    p_description: description ?? null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ storeId: data }, { status: 201 })
}
