import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Instagram, Facebook } from "lucide-react"
import { WHATSAPP_DEFAULT } from "@/lib/constants"
import { buildWhatsAppUrl } from "@/lib/utils"

export function PublicFooter() {
  const waUrl = buildWhatsAppUrl(WHATSAPP_DEFAULT, "Hola! Necesito información sobre CarOK.")
  const igUrl = process.env.NEXT_PUBLIC_INSTAGRAM
  const fbUrl = process.env.NEXT_PUBLIC_FACEBOOK

  return (
    <footer className="bg-void border-t border-white/8">
      <div className="container-xl py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <Image
              src="/logo.svg"
              alt="CarOK"
              width={120}
              height={40}
              className="h-9 w-auto object-contain mb-4"
            />
            <p className="text-sm text-surface/50 max-w-xs leading-relaxed">
              Tu concesionaria de confianza. Más de 500 vehículos disponibles con financiación y garantía.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-surface/60 hover:border-brand hover:text-brand transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              {igUrl && (
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-surface/60 hover:border-brand hover:text-brand transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {fbUrl && (
                <a
                  href={fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-surface/60 hover:border-brand hover:text-brand transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Catálogo */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-surface/40 mb-4">
              Catálogo
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Todos los autos",   href: "/catalogo" },
                { label: "0 km",              href: "/catalogo?condition=nuevo" },
                { label: "Usados",            href: "/catalogo?condition=usado" },
                { label: "SUVs",              href: "/catalogo?body_type=suv" },
                { label: "Pickups",           href: "/catalogo?body_type=pickup" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-surface/50 hover:text-brand transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-surface/40 mb-4">
              Contacto
            </h3>
            <ul className="space-y-2.5">
              <li className="text-sm text-surface/50">Lunes a Sábado, 9 a 18 hs</li>
              <li>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand hover:underline"
                >
                  WhatsApp disponible
                </a>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm text-surface/50 hover:text-brand transition-colors">
                  Acceso administrador
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-8 text-center sm:flex-row">
          <p className="text-xs text-surface/30">
            © {new Date().getFullYear()} CarOK. Todos los derechos reservados.
          </p>
          <p className="text-xs text-surface/20">
            Powered by Next.js + Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}
