import {
  Bell,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Stethoscope,
  X,
} from "lucide-react"
import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { useNotifications } from "../hooks/useClinicQueries"

const navItems = [
  { to: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { to: "/doctors", label: "Doktorlar", icon: Stethoscope },
  { to: "/appointments", label: "Randevular", icon: ClipboardList },
  { to: "/schedule", label: "Takvim", icon: CalendarDays },
  { to: "/notifications", label: "Bildirimler", icon: Bell },
  { to: "/history", label: "Geçmiş", icon: History },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { data: notifications = [] } = useNotifications()
  const unreadCount = notifications.filter((notification) => !notification.read).length

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-600 text-white">
          <CalendarClock className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-950">Medora</p>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
            Yönetim paneli
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-cyan-50 text-cyan-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`
            }
            to={item.to}
            onClick={() => setOpen(false)}
          >
            <span className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              {item.label}
            </span>
            {item.to === "/notifications" && unreadCount > 0 ? (
              <span className="rounded-full bg-cyan-600 px-2 py-0.5 text-xs text-white">
                {unreadCount}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <NavLink
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          to="/login"
        >
          <LogOut className="h-5 w-5" />
          Çıkış yap
        </NavLink>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Menüyü kapat"
            className="absolute inset-0 bg-slate-950/40"
            type="button"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full">
            {sidebar}
            <button
              aria-label="Menüyü kapat"
              className="absolute right-4 top-4 rounded-md p-2 text-slate-500 hover:bg-slate-100"
              type="button"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
          <button
            aria-label="Menüyü aç"
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            type="button"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden text-sm font-semibold text-slate-600 sm:block">
            Klinik randevu yönetimi
          </div>
          <NavLink
            className="flex items-center gap-3 rounded-md px-2 py-1.5 transition hover:bg-slate-100"
            to="/profile"
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-950">Yönetici</p>
              <p className="text-xs text-slate-500">Operasyon masası</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
              YK
            </div>
          </NavLink>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
