import { createClient } from "./client"
import type { Profile } from "./types"

// ── Sign up ──────────────────────────────────────────────────
export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
}

// ── Sign in ──────────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  const supabase = createClient()
  return supabase.auth.signInWithPassword({ email, password })
}

// ── Sign out ─────────────────────────────────────────────────
export async function signOut() {
  const supabase = createClient()
  return supabase.auth.signOut()
}

// ── Sesión activa + profile completo ─────────────────────────
export async function getSessionWithProfile(): Promise<{
  user: { id: string; email: string } | null
  profile: Profile | null
}> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return { user: null, profile: null }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single()

  return {
    user: { id: session.user.id, email: session.user.email ?? "" },
    profile,
  }
}

// ── Escuchar cambios de auth (para providers en el cliente) ──
export function onAuthStateChange(
  callback: (profile: Profile | null) => void
) {
  const supabase = createClient()

  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session) return callback(null)

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    callback(data)
  })
}
