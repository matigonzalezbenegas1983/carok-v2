"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/use-session"
import { signOut } from "@/lib/supabase/auth"

export function Navbar() {
  const { email, isAdmin, isSeller, loading } = useSession()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="animate-fade-in-down sticky top-0 z-50 border-b border-white/10 bg-void/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">

        {/* Logo */}
          <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="CarOK"
            width={120}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Nav derecha */}
        <nav className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-white/10" />
          ) : email ? (
            <>
              {(isSeller || isAdmin) && (
                <Link
                  href="/dashboard/seller"
                  className="hidden text-sm text-surface/70 hover:text-surface transition-colors sm:block"
                >
                  Mi tienda
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/dashboard/admin/stores"
                  className="hidden text-sm text-surface/70 hover:text-surface transition-colors sm:block"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-white/20 px-4 py-1.5 text-sm text-surface/80 hover:bg-white/10 transition-all"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-surface/70 hover:text-surface transition-colors"
              >
                Entrar
              </Link>
              <Link href="/auth/register" className="btn-primary py-1.5 text-sm">
                Publicar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
