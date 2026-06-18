import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { BecomeSellerForm } from "@/components/seller/become-seller-form"

export default async function SellerOnboardingPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", session.user.id)
    .single()

  if (profile?.role === "seller" || profile?.role === "admin") {
    redirect("/dashboard/seller")
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? ""

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <StepDot n={1} label="Cuenta" done />
            <div className="flex-1 h-px bg-brand/30" />
            <StepDot n={2} label="Tienda" active />
            <div className="flex-1 h-px bg-surface-dark" />
            <StepDot n={3} label="Productos" />
          </div>

          <h1 className="text-2xl font-bold text-void tracking-tight">
            {firstName ? `Hola, ${firstName}` : "Hola"} 👋
          </h1>
          <p className="text-sm text-ink/50 mt-1">
            Completá los datos de tu tienda para empezar a vender.
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <BecomeSellerForm />
        </div>

        {/* Garantías */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Pill icon="🔒" text="Datos seguros" />
          <Pill icon="⚡" text="Revisión en 24h" />
          <Pill icon="🆓" text="Sin costo" />
        </div>
      </div>
    </main>
  )
}

function StepDot({ n, label, done, active }: {
  n: number; label: string; done?: boolean; active?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
        ${done   ? "bg-brand text-white"
        : active ? "bg-brand text-white ring-4 ring-brand/20"
                 : "bg-surface-dark text-ink/40"}`}>
        {done ? "✓" : n}
      </div>
      <span className={`text-[10px] ${active ? "text-brand font-semibold" : "text-ink/40"}`}>
        {label}
      </span>
    </div>
  )
}

function Pill({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="card px-3 py-2.5 text-center">
      <p className="text-lg">{icon}</p>
      <p className="text-[10px] text-ink/50 mt-0.5">{text}</p>
    </div>
  )
}
