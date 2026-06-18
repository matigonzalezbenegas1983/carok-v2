import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Solo admins" }, { status: 403 })

  const { name, slug } = await req.json()
  if (!name || !slug) return NextResponse.json({ error: "name y slug requeridos" }, { status: 400 })

  const { data, error } = await supabase.from("brands").insert({ name, slug }).select().single()
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Ya existe esa marca" }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
