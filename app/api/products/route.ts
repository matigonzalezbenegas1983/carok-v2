import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// GET /api/products?categoryId=&storeId=&search=&limit=
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(Number(searchParams.get("limit") ?? 20))

  const categoryId = searchParams.get("categoryId")
  const storeId = searchParams.get("storeId")
  const search = searchParams.get("search")

  if (categoryId) query = query.eq("category_id", categoryId)
  if (storeId)    query = query.eq("store_id", storeId)
  if (search)     query = query.ilike("name", `%${search}%`)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/products — crear producto (seller)
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const { name, slug, price, storeId, ...rest } = body

  if (!name || !slug || price === undefined || !storeId) {
    return NextResponse.json(
      { error: "name, slug, price y storeId son requeridos" },
      { status: 400 }
    )
  }

  // Verificar que la tienda pertenezca al usuario autenticado
  const { data: store } = await supabase
    .from("stores")
    .select("owner_id")
    .eq("id", storeId)
    .single()

  if (!store || store.owner_id !== session.user.id) {
    return NextResponse.json({ error: "Sin permiso sobre esta tienda" }, { status: 403 })
  }

  const parsedPrice = parseFloat(price)
  if (!isFinite(parsedPrice) || parsedPrice < 0) {
    return NextResponse.json({ error: "Precio inválido" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("products")
    .insert({ name, slug, price: parsedPrice, store_id: storeId, ...rest })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
