import type { AppointmentStatus, DoctorStatus } from "../types"

type BadgeValue = AppointmentStatus | DoctorStatus | "read" | "unread"

const styles: Record<BadgeValue, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Approved: "border-blue-200 bg-blue-50 text-blue-700",
  Cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-600",
  read: "border-slate-200 bg-slate-100 text-slate-600",
  unread: "border-cyan-200 bg-cyan-50 text-cyan-700",
}

const labels: Record<BadgeValue, string> = {
  Pending: "Beklemede",
  Approved: "Onaylandı",
  Cancelled: "İptal edildi",
  Completed: "Tamamlandı",
  active: "Aktif",
  inactive: "Pasif",
  read: "Okundu",
  unread: "Okunmadı",
}

export default function Badge({ value }: { value: BadgeValue }) {
  return (
    <span
      className={`inline-flex min-w-24 items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[value]}`}
    >
      {labels[value]}
    </span>
  )
}
