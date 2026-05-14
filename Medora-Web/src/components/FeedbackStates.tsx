import { AlertTriangle, Loader2 } from "lucide-react"

export function LoadingState({ label = "Veriler yükleniyor" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
      <Loader2 className="mr-2 h-5 w-5 animate-spin text-cyan-600" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  )
}

export function ErrorState({ label = "Veriler yüklenemedi" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700">
      <AlertTriangle className="mr-2 h-5 w-5" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  )
}
