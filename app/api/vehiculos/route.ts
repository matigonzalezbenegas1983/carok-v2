import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils"

const VALID_FUEL         = ["nafta","diesel","hibrido","electrico","gnc"]
const VALID_TRANSMISSION = ["manual","automatico","cvt"]
const VALID_CONDITION    = ["nuevo","usado","certificado"]
const VALID_BODY_TYPE    = ["sedan","suv","pickup","hatchback","coupe","convertible","van","camioneta"]
const VALID_STATUS       = ["active","draft","sold","archived"]

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, brands(name,slug)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Body inválido" }, { status: 400 })

  // Validaciones
  if (!body.title || typeof body.title !== "string" || body.title.trim().length < 3)
    return NextResponse.json({ error: "Título inválido (mín. 3 caracteres)" }, { status: 422 })
  if (!body.model || typeof body.model !== "string")
    return NextResponse.json({ error: "Modelo requerido" }, { status: 422 })
  if (!isFinite(body.year) || body.year < 1980 || body.year > new Date().getFullYear() + 1)
    return NextResponse.json({ error: "Año inválido" }, { status: 422 })
  if (!isFinite(body.price) || body.price < 0)
    return NextResponse.json({ error: "Precio inválido" }, { status: 422 })
  if (!VALID_FUEL.includes(body.fuel_type))
    return NextResponse.json({ error: "Combustible inválido" }, { status: 422 })
  if (!VALID_TRANSMISSION.includes(body.transmission))
    return NextResponse.json({ error: "Transmisión inválida" }, { status: 422 })
  if (!VALID_CONDITION.includes(body.condition))
    return NextResponse.json({ error: "Condición inválida" }, { status: 422 })
  if (body.body_type && !VALID_BODY_TYPE.includes(body.body_type))
    return NextResponse.json({ error: "Carrocería inválida" }, { status: 422 })
  if (body.status && !VALID_STATUS.includes(body.status))
    return NextResponse.json({ error: "Estado inválido" }, { status: 422 })

  const slug = body.slug
    ? String(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, "-")
    : slugify(`${body.title} ${body.year}`)

  const payload = {
    title:        body.title.trim(),
    slug,
    brand_id:     body.brand_id || null,
    model:        body.model.trim(),
    year:         Number(body.year),
    price:        Number(body.price),
    mileage:      isFinite(body.mileage) ? Number(body.mileage) : 0,
    fuel_type:    body.fuel_type,
    transmission: body.transmission,
    color:        body.color || null,
    body_type:    body.body_type || null,
    condition:    body.condition,
    description:  body.description || null,
    features:     Array.isArray(body.features) ? body.features.filter((f: unknown) => typeof f === "string") : [],
    status:       body.status ?? "draft",
    featured:     Boolean(body.featured),
    seller_id:    session.user.id,
  }

  const { data, error } = await supabase
    .from("vehicles")
    .insert(payload)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ya existe un vehículo con ese slug. Cambiá el título." }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
