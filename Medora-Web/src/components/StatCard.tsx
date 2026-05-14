import type { LucideIcon } from "lucide-react"

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  tone: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${tone}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
