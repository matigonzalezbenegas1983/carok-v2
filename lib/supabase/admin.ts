import { createServerSupabaseClient } from "./server"
import type { Profile, Store, StoreStatus, TablesInsert } from "./types"

// Todas las funciones de este archivo fallan silenciosamente
// si el usuario no es admin (la DB rechaza la operación via RLS).

// ── Listar todos los usuarios ────────────────────────────────
export async function adminListProfiles(): Promise<Profile[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

// ── Cambiar rol de un usuario ────────────────────────────────
export async function adminSetUserRole(
  userId: string,
  role: Profile["role"]
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
  return { error: error?.message ?? null }
}

// ── Listar todas las tiendas ─────────────────────────────────
export async function adminListStores(
  status?: StoreStatus
): Promise<Store[]> {
  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from("stores")
    .select("*, profiles(full_name, avatar_url, phone)")
    .order("created_at", { ascending: false })

  if (status) query = query.eq("status", status)

  const { data } = await query
  return (data as Store[]) ?? []
}

// ── Activar / suspender tienda ───────────────────────────────
export async function adminSetStoreStatus(
  storeId: string,
  status: StoreStatus
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.rpc("set_store_status", {
    p_store_id: storeId,
    p_status: status,
  })
  return { error: error?.message ?? null }
}

// ── Crear categoría ──────────────────────────────────────────
export async function adminCreateCategory(
  category: TablesInsert<"categories">
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from("categories").insert(category)
  return { error: error?.message ?? null }
}

// ── Eliminar categoría ───────────────────────────────────────
export async function adminDeleteCategory(
  categoryId: string
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
  return { error: error?.message ?? null }
}
