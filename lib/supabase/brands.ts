import { createServerSupabaseClient } from "./server"
import type { Brand } from "./types"

export async function getAllBrands(): Promise<Brand[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from("brands").select("*").order("name")
  return data ?? []
}

export async function createBrand(name: string, slug: string, logoUrl?: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("brands")
    .insert({ name, slug, logo_url: logoUrl ?? null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBrand(id: string, updates: Partial<Brand>) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("brands").update(updates).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function deleteBrand(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from("brands").delete().eq("id", id)
  if (error) throw error
}
