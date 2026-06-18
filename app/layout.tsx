import type { Metadata, Viewport } from "next"
import "./globals.css"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://carok.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:  "CarOK — Tu próximo auto",
    template: "%s | CarOK",
  },
  description:
    "Concesionaria premium. Más de 500 vehículos: sedanes, SUVs, pickups, 0 km y usados. Financiación y entrega a todo el país.",
  openGraph: {
    type:        "website",
    siteName:    "CarOK",
    title:       "CarOK — Tu próximo auto",
    description: "Más de 500 vehículos con financiación y entrega a todo el país.",
    images:      [{ url: "/og-image.png", width: 1200, height: 630, alt: "CarOK" }],
  },
  twitter: {
    card:  "summary_large_image",
    title: "CarOK — Tu próximo auto",
    images:["/og-image.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  themeColor:   "#1f6d53",
  width:        "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
