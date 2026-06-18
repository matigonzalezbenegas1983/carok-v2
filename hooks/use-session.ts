"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types"

type SessionState = {
  userId:   string | null
  email:    string | null
  profile:  Profile | null
  role:     Profile["role"] | null
  isAdmin:  boolean
  isSeller: boolean
  loading:  boolean
}

const INITIAL: SessionState = {
  userId: null, email: null, profile: null,
  role: null, isAdmin: false, isSeller: false, loading: true,
}

// Singleton: un solo fetch compartido entre todos los componentes del árbol.
// Evita N queries a profiles cuando useSession se usa en múltiples lugares.
let cachedState: SessionState | null = null
let listeners: Array<(s: SessionState) => void> = []
let fetchPromise: Promise<void> | null = null

function notify(state: SessionState) {
  cachedState = state
  listeners.forEach((fn) => fn(state))
}

async function fetchSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    notify({ ...INITIAL, loading: false })
    return
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single()

  notify({
    userId:   session.user.id,
    email:    session.user.email ?? null,
    profile,
    role:     profile?.role ?? null,
    isAdmin:  profile?.role === "admin",
    isSeller: profile?.role === "seller",
    loading:  false,
  })
}

export function useSession() {
  const [state, setState] = useState<SessionState>(
    cachedState ?? INITIAL
  )

  useEffect(() => {
    // Suscribir este componente a updates
    listeners.push(setState)

    // Si ya hay caché, no re-fetchar
    if (cachedState && !cachedState.loading) {
      setState(cachedState)
    } else if (!fetchPromise) {
      fetchPromise = fetchSession().finally(() => { fetchPromise = null })
    }

    // Escuchar cambios de auth para invalidar caché
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_OUT") {
          cachedState = { ...INITIAL, loading: false }
          notify(cachedState)
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          cachedState = null
          fetchPromise = fetchSession().finally(() => { fetchPromise = null })
        }
      }
    )

    return () => {
      listeners = listeners.filter((fn) => fn !== setState)
      subscription.unsubscribe()
    }
  }, [])

  return state
}
