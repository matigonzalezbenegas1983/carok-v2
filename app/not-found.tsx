import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Página no encontrada | CarOK",
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-void p-8 text-center">
      <Image
        src="/logo.png"
        alt="CarOK"
        width={160}
        height={64}
        className="h-12 w-auto opacity-80"
      />
      <h1 className="text-5xl font-bold text-surface">404</h1>
      <p className="text-surface/50">Esta página no existe o fue removida.</p>
      <Link href="/" className="btn-primary mt-2">
        Volver al inicio
      </Link>
    </div>
  )
}
