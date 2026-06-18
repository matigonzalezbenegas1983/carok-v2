import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// GET /api/admin/stores?status=pending
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 })
  }

  let query = supabase
    .from("stores")
    .select("*, profiles(full_name, avatar_url)")
    .order("created_at", { ascending: false })

  const VALID_STATUSES = ["pending", "active", "suspended"] as const
  type StoreStatusParam = (typeof VALID_STATUSES)[number]

  const rawStatus = searchParams.get("status")
  const status = VALID_STATUSES.includes(rawStatus as StoreStatusParam)
    ? (rawStatus as StoreStatusParam)
    : null

  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
