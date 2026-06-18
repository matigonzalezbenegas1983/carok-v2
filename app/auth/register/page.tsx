import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Crear cuenta — Marketplace",
  description: "Registrate gratis y empezá a vender en minutos.",
  robots: { index: false },
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand mb-4">
            <span className="text-white text-xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold text-void tracking-tight">Crear cuenta</h1>
          <p className="mt-1 text-sm text-ink/50">Gratis. Sin tarjeta de crédito.</p>
        </div>

        <div className="card p-8">
          <RegisterForm />

          <p className="mt-6 text-center text-sm text-ink/50">
            ¿Ya tenés cuenta?{" "}
            <Link href="/auth/login"
              className="font-semibold text-brand hover:text-brand-dark transition-colors">
              Ingresá
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
