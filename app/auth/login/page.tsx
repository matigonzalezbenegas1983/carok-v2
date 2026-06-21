import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Ingresar — CarOK",
  robots: { index: false },
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="CarOK"
              width={140}
              height={56}
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <h1 className="mb-1 text-xl font-bold text-white">Bienvenido</h1>
          <p className="mb-6 text-sm text-surface/50">
            Ingresá con tu cuenta para acceder al panel.
          </p>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-surface/30">
          <Link href="/" className="hover:text-brand transition-colors">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  )
}
