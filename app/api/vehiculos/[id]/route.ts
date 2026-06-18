import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const IMMUTABLE = ["id", "created_at", "seller_id", "views"]
const VALID_STATUS = ["active", "draft", "sold", "archived"] as const

type Params = { params: Promise<{ id: string }> }

async function getAuthedVehicle(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { supabase, session: null, vehicle: null, isAdmin: false }

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", session.user.id).single()
  const isAdmin = profile?.role === "admin"

  const { data: vehicle } = await supabase
    .from("vehicles").select("id, seller_id").eq("id", id).single()

  return { supabase, session, vehicle, isAdmin }
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const { supabase, session, vehicle, isAdmin } = await getAuthedVehicle(id)

  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  if (!vehicle)  return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const isOwner = vehicle.seller_id === session.user.id
  if (!isOwner && !isAdmin)
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body)  return NextResponse.json({ error: "Body inválido" }, { status: 400 })

  // Strip immutable fields
  const update: Partial<{
    title: string
    slug: string
    brand_id: string | null
    model: string
    year: number
    price: number
    mileage: number | null
    fuel_type: string
    transmission: string
    color: string | null
    body_type: string | null
    condition: string
    description: string | null
    features: string[] | null
    status: string
    featured: boolean | null
    thumbnail_url: string | null
  }> = {}
  for (const [k, v] of Object.entries(body)) {
    if (IMMUTABLE.includes(k)) continue
    if (k in update) {
      update[k as keyof typeof update] = v as never
    }
  }

  // Validate status enum
  if (update.status && !VALID_STATUS.includes(update.status as typeof VALID_STATUS[number])) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 422 })
  }

  // Validate numeric fields
  if (update.price !== undefined && (!isFinite(Number(update.price)) || Number(update.price) < 0))
    return NextResponse.json({ error: "Precio inválido" }, { status: 422 })
  if (update.year !== undefined && (!isFinite(Number(update.year)) || Number(update.year) < 1980))
    return NextResponse.json({ error: "Año inválido" }, { status: 422 })

  const { data, error } = await supabase
    .from("vehicles")
    .update(update as any)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const { supabase, session, vehicle, isAdmin } = await getAuthedVehicle(id)

  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  if (!vehicle)  return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (!isAdmin)  return NextResponse.json({ error: "Solo admins pueden eliminar" }, { status: 403 })

  const { error } = await supabase.from("vehicles").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
