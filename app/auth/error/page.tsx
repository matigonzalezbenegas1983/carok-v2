import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-2xl font-bold text-void">Link inválido</p>
        <p className="mt-2 text-sm text-ink/50">El link expiró o ya fue utilizado.</p>
        <Link href="/auth/login" className="btn-primary mt-6 inline-flex">
          Volver al login
        </Link>
      </div>
    </main>
  )
}
