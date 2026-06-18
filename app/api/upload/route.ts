import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
}
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: "FormData inválido" }, { status: 400 })

  const file      = form.get("file") as File | null
  const vehicleId = form.get("vehicleId") as string | null

  if (!file || !vehicleId)
    return NextResponse.json({ error: "file y vehicleId son requeridos" }, { status: 400 })

  // Validate type via MIME (not extension)
  const ext = ALLOWED_TYPES[file.type]
  if (!ext)
    return NextResponse.json({ error: "Formato no permitido. Usá JPG, PNG o WebP." }, { status: 415 })

  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "El archivo excede los 10 MB." }, { status: 413 })

  // Verify vehicle ownership
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, seller_id")
    .eq("id", vehicleId)
    .single()

  if (!vehicle) return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", session.user.id).single()
  const isAdmin = profile?.role === "admin"

  if (vehicle.seller_id !== session.user.id && !isAdmin)
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })

  // Upload to Storage
  const path     = `${vehicleId}/${Date.now()}.${ext}`
  const bytes    = await file.arrayBuffer()
  const buffer   = new Uint8Array(bytes)

  const { error: uploadError } = await supabase.storage
    .from("vehicle-images")
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from("vehicle-images")
    .getPublicUrl(path)

  // Count existing images to set sort_order + is_primary for first
  const { count } = await supabase
    .from("vehicle_images")
    .select("*", { count: "exact", head: true })
    .eq("vehicle_id", vehicleId)

  const isPrimary = (count ?? 0) === 0

  const { error: insertError } = await supabase
    .from("vehicle_images")
    .insert({
      vehicle_id: vehicleId,
      url:        publicUrl,
      is_primary: isPrimary,
      sort_order: count ?? 0,
    })

  if (insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 })

  // Update thumbnail if first image
  if (isPrimary) {
    await supabase
      .from("vehicles")
      .update({ thumbnail_url: publicUrl })
      .eq("id", vehicleId)
  }

  return NextResponse.json({ url: publicUrl, isPrimary }, { status: 201 })
}
