import { CalendarDays } from "lucide-react"
import EmptyState from "../components/EmptyState"
import { ErrorState, LoadingState } from "../components/FeedbackStates"
import PageHeader from "../components/PageHeader"
import { doctorName } from "../components/utils"
import { useAppointments, useDoctors } from "../hooks/useClinicQueries"

const week = [
  { label: "Pzt", date: "2026-04-27", name: "Monday" },
  { label: "Sal", date: "2026-04-28", name: "Tuesday" },
  { label: "Çar", date: "2026-04-29", name: "Wednesday" },
  { label: "Per", date: "2026-04-30", name: "Thursday" },
  { label: "Cum", date: "2026-05-01", name: "Friday" },
  { label: "Cmt", date: "2026-05-02", name: "Saturday" },
  { label: "Paz", date: "2026-05-03", name: "Sunday" },
]

const timeSlots = ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "12:00", "13:30", "14:00", "15:00", "16:00", "17:00"]

export default function SchedulePage() {
  const doctorsQuery = useDoctors()
  const appointmentsQuery = useAppointments()

  if (doctorsQuery.isLoading || appointmentsQuery.isLoading) {
    return <LoadingState label="Haftalık takvim yükleniyor" />
  }

  if (doctorsQuery.isError || appointmentsQuery.isError) {
    return <ErrorState label="Takvim yüklenemedi" />
  }

  const doctors = doctorsQuery.data ?? []
  const appointments = appointmentsQuery.data ?? []
  const activeDoctors = doctors.filter((doctor) => doctor.status === "active")

  return (
    <>
      <PageHeader
        title="Takvim"
        description="Doktor ve saate göre ayrılmış haftalık uygunluk ve dolu randevu saatleri."
      />

      {activeDoctors.length === 0 ? (
        <EmptyState
          description="Haftalık çalışma takvimlerini görmek için doktorları aktif hale getirin."
          icon={<CalendarDays className="h-6 w-6" />}
          title="Aktif takvim yok"
        />
      ) : (
        <div className="space-y-5">
          {activeDoctors.map((doctor) => (
            <section
              key={doctor.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-bold text-slate-950">{doctor.name}</h2>
                  <p className="text-sm text-slate-500">{doctor.specialty}</p>
                </div>
                <p className="font-mono text-sm font-semibold text-cyan-700">
                  {doctor.workingStartTime} - {doctor.workingEndTime}
                </p>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[1200px]">
                  <div className="grid grid-cols-[92px_repeat(7,1fr)] border-b border-slate-200 bg-white text-xs font-bold uppercase tracking-wide text-slate-500">
                    <div className="px-3 py-3">Saat</div>
                    {week.map((day) => (
                      <div key={day.date} className="border-l border-slate-200 px-3 py-3">
                        {day.label}
                      </div>
                    ))}
                  </div>
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="grid grid-cols-[92px_repeat(7,1fr)] border-b border-slate-100 last:border-b-0"
                    >
                      <div className="px-3 py-3 font-mono text-xs font-semibold text-slate-500">
                        {time}
                      </div>
                      {week.map((day) => {
                        const isWorking =
                          doctor.workingDays.includes(day.name) &&
                          time >= doctor.workingStartTime &&
                          time < doctor.workingEndTime
                        const slotAppointments = appointments.filter(
                          (appointment) =>
                            appointment.doctorId === doctor.id &&
                            appointment.date === day.date &&
                            appointment.time === time &&
                            appointment.status !== "Cancelled",
                        )

                        return (
                          <div
                            key={`${day.date}-${time}`}
                            className={`min-h-16 border-l border-slate-100 p-2 ${
                              isWorking ? "bg-white" : "bg-slate-50"
                            }`}
                          >
                            {slotAppointments.length > 0 ? (
                              <div className="space-y-1">
                                {slotAppointments.map((appointment, index) => (
                                  <div
                                    key={appointment.id}
                                    className={`rounded-md border px-2 py-1 text-xs ${
                                      index > 0
                                        ? "border-amber-300 bg-amber-50 text-amber-800"
                                        : "border-cyan-200 bg-cyan-50 text-cyan-800"
                                    }`}
                                  >
                                    <p className="truncate font-bold">
                                      {appointment.patientName}
                                    </p>
                                    <p className="truncate">
                                      {doctorName(doctors, appointment.doctorId)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-300">
                                {isWorking ? "Uygun" : "Kapalı"}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
