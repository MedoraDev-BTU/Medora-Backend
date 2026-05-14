import { CalendarX, Check, CheckCircle2, Clock3, MoveRight } from "lucide-react"
import Badge from "../components/Badge"
import Button from "../components/Button"
import EmptyState from "../components/EmptyState"
import { ErrorState, LoadingState } from "../components/FeedbackStates"
import PageHeader from "../components/PageHeader"
import { doctorName, formatDate } from "../components/utils"
import {
  useAppointmentAction,
  useAppointments,
  useDoctors,
} from "../hooks/useClinicQueries"
import type { AppointmentStatus } from "../types"

export default function AppointmentsPage() {
  const appointmentsQuery = useAppointments()
  const doctorsQuery = useDoctors()
  const action = useAppointmentAction()

  if (appointmentsQuery.isLoading || doctorsQuery.isLoading) {
    return <LoadingState label="Randevular yükleniyor" />
  }

  if (appointmentsQuery.isError || doctorsQuery.isError) {
    return <ErrorState label="Randevular yüklenemedi" />
  }

  const appointments = appointmentsQuery.data ?? []
  const doctors = doctorsQuery.data ?? []

  const updateStatus = (id: string, status: AppointmentStatus) =>
    action.mutate({ id, status })

  return (
    <>
      <PageHeader
        title="Randevular"
        description="Randevu taleplerini onaylayın, iptal edin, erteleyin ve tamamlayın."
      />

      {appointments.length === 0 ? (
        <EmptyState
          description="Hastalar ziyaret oluşturduğunda randevu talepleri burada görünür."
          icon={<Clock3 className="h-6 w-6" />}
          title="Randevu yok"
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Hasta adı</th>
                  <th className="px-4 py-3">Doktor adı</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Saat</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="align-middle">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">
                        {appointment.patientName}
                      </p>
                      <p className="text-xs text-slate-500">{appointment.reason}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {doctorName(doctors, appointment.doctorId)}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(appointment.date)}
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-700">
                      {appointment.time}
                    </td>
                    <td className="px-4 py-4">
                      <Badge value={appointment.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex min-w-max justify-end gap-2">
                        <Button
                          className="h-9 px-3"
                          disabled={action.isPending}
                          icon={<Check className="h-4 w-4" />}
                          title="Onayla"
                          variant="secondary"
                          onClick={() => updateStatus(appointment.id, "Approved")}
                        />
                        <Button
                          className="h-9 px-3"
                          disabled={action.isPending}
                          icon={<CalendarX className="h-4 w-4" />}
                          title="İptal et"
                          variant="danger"
                          onClick={() => updateStatus(appointment.id, "Cancelled")}
                        />
                        <Button
                          className="h-9 px-3"
                          disabled={action.isPending}
                          icon={<MoveRight className="h-4 w-4" />}
                          title="Ertele"
                          variant="secondary"
                          onClick={() => action.mutate({ id: appointment.id })}
                        />
                        <Button
                          className="h-9 px-3"
                          disabled={action.isPending}
                          icon={<CheckCircle2 className="h-4 w-4" />}
                          title="Tamamlandı olarak işaretle"
                          variant="secondary"
                          onClick={() => updateStatus(appointment.id, "Completed")}
                        />
                      </div>
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
