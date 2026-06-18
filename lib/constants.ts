export const SITE_NAME    = "CarOK"
export const SITE_TAGLINE = "Tu próximo auto, a un click"
export const WHATSAPP_DEFAULT = process.env.NEXT_PUBLIC_WHATSAPP ?? "5491100000000"
export const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? "https://carok.vercel.app"

export const FUEL_LABELS: Record<string, string> = {
  nafta:    "Nafta",
  diesel:   "Diésel",
  hibrido:  "Híbrido",
  electrico:"Eléctrico",
  gnc:      "GNC",
}

export const TRANSMISSION_LABELS: Record<string, string> = {
  manual:    "Manual",
  automatico:"Automático",
  cvt:       "CVT",
}

export const CONDITION_LABELS: Record<string, string> = {
  nuevo:      "0 km",
  usado:      "Usado",
  certificado:"Certificado",
}

export const BODY_TYPE_LABELS: Record<string, string> = {
  sedan:      "Sedán",
  suv:        "SUV",
  pickup:     "Pickup",
  hatchback:  "Hatchback",
  coupe:      "Coupé",
  convertible:"Convertible",
  van:        "Van",
  camioneta:  "Camioneta",
}

export const STATUS_LABELS: Record<string, string> = {
  active:   "Publicado",
  draft:    "Borrador",
  sold:     "Vendido",
  archived: "Archivado",
}

export const STATUS_COLORS: Record<string, string> = {
  active:   "bg-green-100 text-green-700",
  draft:    "bg-amber-100 text-amber-700",
  sold:     "bg-blue-100 text-blue-700",
  archived: "bg-gray-100 text-gray-500",
}

export const SORT_OPTIONS = [
  { value: "newest",     label: "Más recientes" },
  { value: "price_asc",  label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "year_desc",  label: "Más nuevo (año)" },
  { value: "views",      label: "Más vistos" },
] as const

export const BODY_TYPE_OPTIONS = [
  { value: "suv",        label: "SUV" },
  { value: "sedan",      label: "Sedán" },
  { value: "pickup",     label: "Pickup" },
  { value: "hatchback",  label: "Hatchback" },
  { value: "coupe",      label: "Coupé" },
  { value: "convertible",label: "Convertible" },
  { value: "van",        label: "Van" },
  { value: "camioneta",  label: "Camioneta" },
] as const

export const FUEL_OPTIONS = [
  { value: "nafta",     label: "Nafta" },
  { value: "diesel",    label: "Diésel" },
  { value: "hibrido",   label: "Híbrido" },
  { value: "electrico", label: "Eléctrico" },
  { value: "gnc",       label: "GNC" },
] as const

export const TRANSMISSION_OPTIONS = [
  { value: "manual",    label: "Manual" },
  { value: "automatico",label: "Automático" },
  { value: "cvt",       label: "CVT" },
] as const

export const CONDITION_OPTIONS = [
  { value: "nuevo",      label: "0 km" },
  { value: "usado",      label: "Usado" },
  { value: "certificado",label: "Certificado" },
] as const

export const VEHICLE_STATUS_OPTIONS = [
  { value: "draft",    label: "Borrador" },
  { value: "active",   label: "Publicado" },
  { value: "sold",     label: "Vendido" },
  { value: "archived", label: "Archivado" },
] as const
