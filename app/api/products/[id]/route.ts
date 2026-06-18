import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// PATCH /api/products/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  // Verificar ownership antes de actualizar
  const { data: product } = await supabase
    .from("products")
    .select("store_id, stores!inner(owner_id)")
    .eq("id", id)
    .single()

  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })

  const owner = (product.stores as any)?.owner_id
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", session.user.id).single()

  if (owner !== session.user.id && profile?.role !== "admin") {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })
  }

  // Solo permitir campos seguros — nunca store_id
  const body = await request.json()
  const { store_id: _dropped, id: _id, created_at: _ca, ...safeFields } = body

  const { data, error } = await supabase
    .from("products")
    .update(safeFields)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

// DELETE /api/products/[id] — soft-delete
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: product } = await supabase
    .from("products")
    .select("store_id, stores!inner(owner_id)")
    .eq("id", id)
    .single()

  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })

  const owner = (product.stores as any)?.owner_id
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", session.user.id).single()

  if (owner !== session.user.id && profile?.role !== "admin") {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })
  }

  const { error } = await supabase
    .from("products")
    .update({ status: "deleted" })
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return new NextResponse(null, { status: 204 })
}
