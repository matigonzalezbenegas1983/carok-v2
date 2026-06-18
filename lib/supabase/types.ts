// Auto-generado + extendido para la plataforma CarOK

export type Json =
  | string | number | boolean | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" }
  public: {
    Tables: {
      brands: {
        Row:    { id: string; name: string; slug: string; logo_url: string | null; created_at: string | null }
        Insert: { id?: string; name: string; slug: string; logo_url?: string | null; created_at?: string | null }
        Update: { id?: string; name?: string; slug?: string; logo_url?: string | null; created_at?: string | null }
        Relationships: []
      }
      vehicles: {
        Row: {
          id: string; title: string; slug: string
          brand_id: string | null; model: string; year: number
          price: number; mileage: number | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          transmission: Database["public"]["Enums"]["transmission_type"]
          color: string | null
          body_type: Database["public"]["Enums"]["body_type"] | null
          condition: Database["public"]["Enums"]["vehicle_condition"]
          description: string | null; features: string[] | null
          status: Database["public"]["Enums"]["vehicle_status"]
          featured: boolean | null; thumbnail_url: string | null
          seller_id: string | null; views: number | null
          created_at: string | null; updated_at: string | null
        }
        Insert: {
          id?: string; title: string; slug: string
          brand_id?: string | null; model: string; year: number
          price: number; mileage?: number | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          transmission?: Database["public"]["Enums"]["transmission_type"]
          color?: string | null
          body_type?: Database["public"]["Enums"]["body_type"] | null
          condition?: Database["public"]["Enums"]["vehicle_condition"]
          description?: string | null; features?: string[] | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          featured?: boolean | null; thumbnail_url?: string | null
          seller_id?: string | null; views?: number | null
          created_at?: string | null; updated_at?: string | null
        }
        Update: {
          id?: string; title?: string; slug?: string
          brand_id?: string | null; model?: string; year?: number
          price?: number; mileage?: number | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          transmission?: Database["public"]["Enums"]["transmission_type"]
          color?: string | null
          body_type?: Database["public"]["Enums"]["body_type"] | null
          condition?: Database["public"]["Enums"]["vehicle_condition"]
          description?: string | null; features?: string[] | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          featured?: boolean | null; thumbnail_url?: string | null
          seller_id?: string | null; views?: number | null
          created_at?: string | null; updated_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "vehicles_brand_id_fkey"; columns: ["brand_id"]; isOneToOne: false; referencedRelation: "brands"; referencedColumns: ["id"] },
          { foreignKeyName: "vehicles_seller_id_fkey"; columns: ["seller_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      vehicle_images: {
        Row:    { id: string; vehicle_id: string; url: string; alt: string | null; sort_order: number | null; is_primary: boolean | null; created_at: string | null }
        Insert: { id?: string; vehicle_id: string; url: string; alt?: string | null; sort_order?: number | null; is_primary?: boolean | null; created_at?: string | null }
        Update: { id?: string; vehicle_id?: string; url?: string; alt?: string | null; sort_order?: number | null; is_primary?: boolean | null; created_at?: string | null }
        Relationships: [{ foreignKeyName: "vehicle_images_vehicle_id_fkey"; columns: ["vehicle_id"]; isOneToOne: false; referencedRelation: "vehicles"; referencedColumns: ["id"] }]
      }
      inquiries: {
        Row:    { id: string; vehicle_id: string | null; name: string; email: string | null; phone: string | null; message: string | null; read: boolean | null; created_at: string | null }
        Insert: { id?: string; vehicle_id?: string | null; name: string; email?: string | null; phone?: string | null; message?: string | null; read?: boolean | null; created_at?: string | null }
        Update: { id?: string; vehicle_id?: string | null; name?: string; email?: string | null; phone?: string | null; message?: string | null; read?: boolean | null; created_at?: string | null }
        Relationships: [{ foreignKeyName: "inquiries_vehicle_id_fkey"; columns: ["vehicle_id"]; isOneToOne: false; referencedRelation: "vehicles"; referencedColumns: ["id"] }]
      }
      profiles: {
        Row:    { id: string; full_name: string | null; role: Database["public"]["Enums"]["user_role"]; avatar_url: string | null; phone: string | null; created_at: string; updated_at: string }
        Insert: { id: string; full_name?: string | null; role?: Database["public"]["Enums"]["user_role"]; avatar_url?: string | null; phone?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; full_name?: string | null; role?: Database["public"]["Enums"]["user_role"]; avatar_url?: string | null; phone?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      // Legacy tables (marketplace) — kept for backward compatibility
      stores: { Row: { id: string; name: string; slug: string; owner_id: string; status: string; logo_url: string | null; banner_url: string | null; description: string | null; created_at: string; updated_at: string }; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
      categories: { Row: { id: string; name: string; slug: string; sort_order: number; icon_url: string | null; parent_id: string | null; created_at: string }; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
      products: { Row: { id: string; name: string; slug: string; price: number; store_id: string; status: string; created_at: string; updated_at: string; description: string | null; category_id: string | null; compare_price: number | null; sku: string | null; stock: number; metadata: Json }; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
      product_images: { Row: { id: string; product_id: string; url: string; sort_order: number; is_cover: boolean; alt_text: string | null; created_at: string }; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }
    }
    Views: { [_ in never]: never }
    Functions: {
      is_admin:               { Args: never; Returns: boolean }
      my_role:                { Args: never; Returns: Database["public"]["Enums"]["user_role"] }
      increment_vehicle_views: { Args: { v_id: string }; Returns: undefined }
      become_seller:          { Args: { p_store_name: string; p_store_slug: string; p_description?: string }; Returns: string }
      set_store_status:       { Args: { p_store_id: string; p_status: string }; Returns: undefined }
    }
    Enums: {
      user_role:         "admin" | "seller" | "buyer"
      fuel_type:         "nafta" | "diesel" | "hibrido" | "electrico" | "gnc"
      transmission_type: "manual" | "automatico" | "cvt"
      vehicle_condition: "nuevo" | "usado" | "certificado"
      body_type:         "sedan" | "suv" | "pickup" | "hatchback" | "coupe" | "convertible" | "van" | "camioneta"
      vehicle_status:    "active" | "draft" | "sold" | "archived"
      product_status:    "draft" | "active" | "paused" | "deleted"
      store_status:      "pending" | "active" | "suspended"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

// ── Generic helpers ──────────────────────────────────────────
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

// ── Enum types ───────────────────────────────────────────────
export type UserRole         = Enums<"user_role">
export type FuelType         = Enums<"fuel_type">
export type TransmissionType = Enums<"transmission_type">
export type VehicleCondition = Enums<"vehicle_condition">
export type BodyType         = Enums<"body_type">
export type VehicleStatus    = Enums<"vehicle_status">
export type StoreStatus      = Enums<"store_status">
export type ProductStatus    = Enums<"product_status">

// ── Row aliases ──────────────────────────────────────────────
export type Profile      = Tables<"profiles">
export type Brand        = Tables<"brands">
export type Vehicle      = Tables<"vehicles">
export type VehicleImage = Tables<"vehicle_images">
export type Inquiry      = Tables<"inquiries">
export type Store        = Tables<"stores">
export type Category     = Tables<"categories">
export type Product      = Tables<"products">
export type ProductImage = Tables<"product_images">
export type VehicleInsert = TablesInsert<"vehicles">
export type VehicleUpdate = TablesUpdate<"vehicles">

// ── Composed types ───────────────────────────────────────────
export type VehicleCard = Vehicle & {
  brands: Pick<Brand, "name" | "slug" | "logo_url"> | null
}

export type VehicleFull = Vehicle & {
  brands: Pick<Brand, "name" | "slug" | "logo_url"> | null
  vehicle_images: VehicleImage[]
  profiles: Pick<Profile, "full_name" | "phone"> | null
}

// ── Filter params ────────────────────────────────────────────
export type VehicleFilters = {
  q?:            string
  brand?:        string          // brand slug
  body_type?:    BodyType
  condition?:    VehicleCondition
  fuel_type?:    FuelType
  transmission?: TransmissionType
  year_min?:     number
  year_max?:     number
  price_min?:    number
  price_max?:    number
  sort?:         "price_asc" | "price_desc" | "year_desc" | "newest" | "views"
  page?:         number
}
