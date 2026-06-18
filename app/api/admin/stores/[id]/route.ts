import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// PATCH /api/admin/stores/[id] — cambiar status de tienda
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

  const { status } = await request.json()

  if (!["pending", "active", "suspended"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 })
  }

  const { error } = await supabase.rpc("set_store_status", {
    p_store_id: id,
    p_status: status,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
