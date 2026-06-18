import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// PATCH /api/admin/users/[id] — cambiar rol de usuario
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 })
  }

  const { role } = await request.json()

  if (!["admin", "seller", "buyer"].includes(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
