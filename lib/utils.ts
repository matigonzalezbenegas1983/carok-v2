import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat("es-AR").format(km) + " km"
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("es-AR").format(n)
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "")
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

export function buildVehicleWhatsApp(
  phone: string,
  vehicleTitle: string,
  vehicleSlug: string,
  siteUrl: string,
): string {
  const msg = `Hola! Me interesa el vehículo *${vehicleTitle}* que vi en CarOK.\n${siteUrl}/autos/${vehicleSlug}`
  return buildWhatsAppUrl(phone, msg)
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "…" : str
}

export function yearRange(from = 2000): number[] {
  const current = new Date().getFullYear()
  return Array.from({ length: current - from + 2 }, (_, i) => current + 1 - i)
}
