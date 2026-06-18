"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { becomeSeller } from "@/lib/supabase/stores"

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

type Step = "info" | "confirm" | "done"

export function BecomeSellerForm() {
  const router = useRouter()
  const [step, setStep]         = useState<Step>("info")
  const [form, setForm]         = useState({ storeName: "", storeSlug: "", description: "" })
  const [slugManual, setSlugManual] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setForm((f) => ({ ...f, storeName: name, storeSlug: slugManual ? f.storeSlug : slugify(name) }))
  }

  async function handleConfirm() {
    setError(null)
    setLoading(true)

    const { storeId, error } = await becomeSeller(
      form.storeName,
      form.storeSlug,
      form.description || undefined
    )

    if (error || !storeId) {
      const isDuplicate =
        error?.includes("duplicate") ||
        error?.includes("23505") ||           // Postgres unique violation code
        error?.includes("unique constraint")
      setError(
        isDuplicate
          ? "Ese slug ya está en uso. Elegí otro nombre."
          : error ?? "Error inesperado. Intentá de nuevo."
      )
      setLoading(false)
      return
    }

    setStep("done")
    setLoading(false)
  }

  /* ── Done ── */
  if (step === "done") {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center mx-auto text-2xl">
          ✓
        </div>
        <h2 className="text-lg font-bold text-void">¡Tienda creada!</h2>
        <p className="text-sm text-ink/50 max-w-xs mx-auto">
          Está en revisión. Un administrador la activará pronto.
          Mientras tanto podés cargar tus productos.
        </p>
        <button onClick={() => router.push("/dashboard/seller")} className="btn-primary mt-2">
          Ir al dashboard →
        </button>
      </div>
    )
  }

  /* ── Confirm ── */
  if (step === "confirm") {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-bold text-void">Confirmá los datos</h2>
          <p className="text-sm text-ink/50 mt-0.5">Revisá antes de continuar.</p>
        </div>

        <div className="rounded-xl border border-surface-dark bg-surface divide-y divide-surface-dark">
          <PreviewRow label="Nombre" value={form.storeName} />
          <PreviewRow label="URL"    value={`/tienda/${form.storeSlug}`} mono />
          {form.description && <PreviewRow label="Descripción" value={form.description} />}
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex gap-2 items-start">
          <span className="shrink-0">⚠️</span>
          <span>
            Al confirmar, tu cuenta pasará a ser <strong>seller</strong> y
            tu tienda quedará pendiente de aprobación.
          </span>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button onClick={handleConfirm} disabled={loading} className="btn-primary flex-1">
            {loading ? "Creando tienda..." : "Confirmar y crear"}
          </button>
          <button onClick={() => setStep("info")} disabled={loading} className="btn-outline">
            Atrás
          </button>
        </div>
      </div>
    )
  }

  /* ── Info ── */
  return (
    <form onSubmit={(e) => { e.preventDefault(); setStep("confirm") }} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Nombre de la tienda *
        </label>
        <input type="text" required minLength={3} maxLength={60}
          value={form.storeName} onChange={handleNameChange}
          placeholder="Ej: Ropa Urbana BA"
          className="input" />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          URL de tu tienda *
          <span className="ml-2 text-[11px] font-normal text-ink/40">
            letras, números y guiones
          </span>
        </label>
        <div className="flex rounded-lg border border-surface-dark focus-within:ring-2 focus-within:ring-brand overflow-hidden">
          <span className="px-3 py-2 text-sm text-ink/40 bg-surface border-r border-surface-dark shrink-0">
            /tienda/
          </span>
          <input type="text" required minLength={3} maxLength={50}
            value={form.storeSlug}
            onChange={(e) => { setSlugManual(true); setForm((f) => ({ ...f, storeSlug: slugify(e.target.value) })) }}
            placeholder="ropa-urbana-ba"
            className="flex-1 px-3 py-2 text-sm outline-none font-mono bg-white" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Descripción
          <span className="ml-2 text-[11px] font-normal text-ink/40">opcional</span>
        </label>
        <textarea rows={3} maxLength={300}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Contá en pocas palabras qué vendés..."
          className="input resize-none" />
        <p className="text-[11px] text-ink/30 text-right mt-1">
          {form.description.length}/300
        </p>
      </div>

      <button type="submit"
        disabled={!form.storeName || !form.storeSlug}
        className="btn-primary w-full">
        Continuar →
      </button>
    </form>
  )
}

function PreviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3">
      <span className="text-sm text-ink/50 shrink-0">{label}</span>
      <span className={`text-sm text-right ${mono ? "font-mono text-brand" : "text-void"}`}>
        {value}
      </span>
    </div>
  )
}
