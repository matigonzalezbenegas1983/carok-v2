import { createServerSupabaseClient } from "./server"
import type { VehicleCard, VehicleFull, VehicleInsert, VehicleUpdate, VehicleFilters, VehicleImage, BodyType } from "./types"

const PAGE_SIZE = 18

export async function listVehicles(filters: VehicleFilters = {}): Promise<{
  vehicles: VehicleCard[]
  total: number
  page: number
  pages: number
}> {
  const supabase = await createServerSupabaseClient()
  const page = filters.page ?? 1

  let query = supabase
    .from("vehicles")
    .select("*, brands(name, slug, logo_url)", { count: "exact" })
    .eq("status", "active")

  if (filters.q)            query = query.ilike("title", `%${filters.q}%`)
  if (filters.brand)        query = query.eq("brands.slug", filters.brand)
  if (filters.body_type)    query = query.eq("body_type", filters.body_type)
  if (filters.condition)    query = query.eq("condition", filters.condition)
  if (filters.fuel_type)    query = query.eq("fuel_type", filters.fuel_type)
  if (filters.transmission) query = query.eq("transmission", filters.transmission)
  if (filters.year_min)     query = query.gte("year", filters.year_min)
  if (filters.year_max)     query = query.lte("year", filters.year_max)
  if (filters.price_min)    query = query.gte("price", filters.price_min)
  if (filters.price_max)    query = query.lte("price", filters.price_max)

  switch (filters.sort) {
    case "price_asc":  query = query.order("price", { ascending: true });  break
    case "price_desc": query = query.order("price", { ascending: false }); break
    case "year_desc":  query = query.order("year",  { ascending: false }); break
    case "views":      query = query.order("views", { ascending: false }); break
    default:           query = query.order("created_at", { ascending: false })
  }

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const { data, count, error } = await query
  if (error) throw error

  return {
    vehicles: (data ?? []) as VehicleCard[],
    total:    count ?? 0,
    page,
    pages:    Math.ceil((count ?? 0) / PAGE_SIZE),
  }
}

export async function getFeaturedVehicles(limit = 6): Promise<VehicleCard[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("vehicles")
    .select("*, brands(name, slug, logo_url)")
    .eq("status", "active")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit)
  return (data ?? []) as VehicleCard[]
}

export async function getVehicleBySlug(slug: string): Promise<VehicleFull | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("vehicles")
    .select("*, brands(name,slug,logo_url), vehicle_images(*), profiles(full_name,phone)")
    .eq("slug", slug)
    .eq("status", "active")
    .single()
  return data as VehicleFull | null
}

export async function getRelatedVehicles(
  brandId: string | null,
  currentId: string,
  limit = 4,
): Promise<VehicleCard[]> {
  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from("vehicles")
    .select("*, brands(name,slug,logo_url)")
    .eq("status", "active")
    .neq("id", currentId)
    .limit(limit)

  if (brandId) query = query.eq("brand_id", brandId)

  const { data } = await query
  return (data ?? []) as VehicleCard[]
}

// ── Admin ────────────────────────────────────────────────────

export async function adminListVehicles() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, brands(name,slug)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function adminGetVehicle(id: string): Promise<VehicleFull | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("vehicles")
    .select("*, brands(name,slug,logo_url), vehicle_images(*), profiles(full_name,phone)")
    .eq("id", id)
    .single()
  return data as VehicleFull | null
}

export async function adminCreateVehicle(payload: VehicleInsert) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from("vehicles").insert(payload).select().single()
  if (error) throw error
  return data
}

export async function adminUpdateVehicle(id: string, payload: VehicleUpdate) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("vehicles").update(payload).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function getVehiclesByBodyType(
  bodyType: BodyType | null,
  limit = 4,
): Promise<VehicleCard[]> {
  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from("vehicles")
    .select("*, brands(name,slug,logo_url)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (bodyType) query = query.eq("body_type", bodyType)
  const { data } = await query
  return (data ?? []) as VehicleCard[]
}

export async function adminDeleteVehicle(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from("vehicles").delete().eq("id", id)
  if (error) throw error
}

export async function addVehicleImage(
  vehicleId: string,
  url: string,
  isPrimary = false,
  sortOrder = 0,
) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from("vehicle_images").insert({
    vehicle_id: vehicleId, url, is_primary: isPrimary, sort_order: sortOrder,
  })
  if (error) throw error
}

export async function deleteVehicleImage(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from("vehicle_images").delete().eq("id", id)
  if (error) throw error
}

export async function setPrimaryImage(vehicleId: string, imageId: string) {
  const supabase = await createServerSupabaseClient()
  await supabase.from("vehicle_images").update({ is_primary: false }).eq("vehicle_id", vehicleId)
  await supabase.from("vehicle_images").update({ is_primary: true }).eq("id", imageId)
  const { data } = await supabase.from("vehicle_images").select("url").eq("id", imageId).single()
  if (data?.url) {
    await supabase.from("vehicles").update({ thumbnail_url: data.url }).eq("id", vehicleId)
  }
}

export async function uploadVehicleImage(
  vehicleId: string,
  file: File,
): Promise<string> {
  const { createClient } = await import("./client")
  const supabase = createClient()

  const allowedTypes: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png":  "png",
    "image/webp": "webp",
  }
  const ext = allowedTypes[file.type]
  if (!ext) throw new Error("Formato no permitido. Usá JPG, PNG o WebP.")

  const path = `${vehicleId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from("vehicle-images").upload(path, file)
  if (error) throw error

  const { data } = supabase.storage.from("vehicle-images").getPublicUrl(path)
  return data.publicUrl
}
