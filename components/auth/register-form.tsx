"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/supabase/auth"

export function RegisterForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password, fullName)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="rounded-xl bg-brand/10 border border-brand/20 p-5 text-sm text-brand">
        <p className="font-semibold">Revisá tu email</p>
        <p className="mt-1 opacity-80">
          Enviamos un link de confirmación a <strong>{email}</strong>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink mb-1">
          Nombre completo
        </label>
        <input id="name" type="text" required value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input" placeholder="Juan García" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
          Email
        </label>
        <input id="email" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input" placeholder="tu@email.com" />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
          Contraseña
        </label>
        <input id="password" type="password" required minLength={8} value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input" placeholder="Mínimo 8 caracteres" />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  )
}
