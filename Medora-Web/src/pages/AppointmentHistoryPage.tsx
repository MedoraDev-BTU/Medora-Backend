import { History } from "lucide-react"
import { useMemo, useState } from "react"
import Badge from "../components/Badge"
import EmptyState from "../components/EmptyState"
import { ErrorState, LoadingState } from "../components/FeedbackStates"
import PageHeader from "../components/PageHeader"
import {
  appointmentStatusLabels,
  doctorName,
  formatDate,
  today,
} from "../components/utils"
import { useAppointments, useDoctors } from "../hooks/useClinicQueries"
import type { AppointmentFilters, AppointmentStatus } from "../types"

const statusOptions: AppointmentFilters["status"][] = [
  "All",
  "Pending",
  "Approved",
  "Cancelled",
  "Completed",
]

const emptyFilters: AppointmentFilters = {
  patientName: "",
  doctorName: "",
  startDate: "",
  endDate: "",
  status: "All",
}

export default function AppointmentHistoryPage() {
  const [filters, setFilters] = useState<AppointmentFilters>(emptyFilters)
  const appointmentsQuery = useAppointments()
  const doctorsQuery = useDoctors()

  const doctors = doctorsQuery.data
  const appointments = appointmentsQuery.data

  const filteredAppointments = useMemo(
    () =>
      (appointments ?? []).filter((appointment) => {
        const nameMatch = appointment.patientName
          .toLowerCase()
          .includes(filters.patientName.toLowerCase())
        const doctorMatch = doctorName(doctors ?? [], appointment.doctorId)
          .toLowerCase()
          .includes(filters.doctorName.toLowerCase())
        const startMatch = !filters.startDate || appointment.date >= filters.startDate
        const endMatch = !filters.endDate || appointment.date <= filters.endDate
        const statusMatch =
          filters.status === "All" || appointment.status === filters.status

        return nameMatch && doctorMatch && startMatch && endMatch && statusMatch
      }),
    [appointments, doctors, filters],
  )

  if (appointmentsQuery.isLoading || doctorsQuery.isLoading) {
    return <LoadingState label="Randevu geçmişi yükleniyor" />
  }

  if (appointmentsQuery.isError || doctorsQuery.isError) {
    return <ErrorState label="Geçmiş yüklenemedi" />
  }

  return (
    <>
      <PageHeader
        title="Randevu geçmişi"
        description="Geçmiş ve yaklaşan ziyaretleri hasta, doktor, tarih ve durum filtreleriyle inceleyin."
      />

      <section className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm font-semibold text-slate-700">
          Hasta adı
          <input
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-normal outline-none focus:border-cyan-500"
            value={filters.patientName}
            onChange={(event) =>
              setFilters({ ...filters, patientName: event.target.value })
            }
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Doktor adı
          <input
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-normal outline-none focus:border-cyan-500"
            value={filters.doctorName}
            onChange={(event) =>
              setFilters({ ...filters, doctorName: event.target.value })
            }
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Başlangıç tarihi
          <input
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-normal outline-none focus:border-cyan-500"
            type="date"
            value={filters.startDate}
            onChange={(event) =>
              setFilters({ ...filters, startDate: event.target.value })
            }
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Bitiş tarihi
          <input
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-normal outline-none focus:border-cyan-500"
            type="date"
            value={filters.endDate}
            onChange={(event) =>
              setFilters({ ...filters, endDate: event.target.value })
            }
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Durum
          <select
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-normal outline-none focus:border-cyan-500"
            value={filters.status}
            onChange={(event) =>
              setFilters({
                ...filters,
                status: event.target.value as "All" | AppointmentStatus,
              })
            }
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {appointmentStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      </section>

      {filteredAppointments.length === 0 ? (
        <EmptyState
          description="Seçilen filtrelerle eşleşen randevu yok."
          icon={<History className="h-6 w-6" />}
          title="Eşleşen kayıt yok"
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Hasta</th>
                  <th className="px-4 py-3">Doktor</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Saat</th>
                  <th className="px-4 py-3">Dönem</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-4 py-4 font-semibold text-slate-950">
                      {appointment.patientName}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {doctorName(doctors ?? [], appointment.doctorId)}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(appointment.date)}
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-700">
                      {appointment.time}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          appointment.date < today
                            ? "bg-slate-100 text-slate-600"
                            : "bg-cyan-50 text-cyan-700"
                        }`}
                      >
                        {appointment.date < today ? "Geçmiş" : "Yaklaşan"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge value={appointment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
