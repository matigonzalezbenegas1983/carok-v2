import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function matchesPath(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(p + "/"))
}

const ADMIN_PATHS  = ["/admin", "/dashboard/admin"]
const AUTH_PATHS   = ["/admin", "/dashboard"]

const rateMap = new Map<string, { count: number; ts: number }>()
const RATE_LIMIT  = 30
const RATE_WINDOW = 60

function isRateLimited(ip: string) {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now - entry.ts > RATE_WINDOW * 1000) {
    rateMap.set(ip, { count: 1, ts: now })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Rate limit API routes
  if (path.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown"
    if (isRateLimited(ip)) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "60" },
      })
    }
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Redirect unauthenticated users
  if (matchesPath(path, AUTH_PATHS) && !session) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Check admin role
  if (session && matchesPath(path, ADMIN_PATHS)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profile?.role !== "admin" && profile?.role !== "seller") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Admin-only sub-paths
    const adminOnlyPaths = ["/admin/vendedores", "/admin/marcas", "/dashboard/admin/stores"]
    if (profile?.role !== "admin" && matchesPath(path, adminOnlyPaths)) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|og-image.png).*)"],
}
