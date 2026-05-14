import { X } from "lucide-react"
import { useState } from "react"
import type { DaySchedule, Doctor, DoctorFormValues } from "../types"
import Button from "./Button"
import { shortDayLabels } from "./utils"

const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const DEFAULT_SCHEDULE: DaySchedule = {
  startTime: "09:00",
  endTime: "17:00",
  breakStart: "12:00",
  breakEnd: "13:00",
}

function buildInitialSchedule(
  fallbackStart: string,
  fallbackEnd: string,
  existing?: Record<string, DaySchedule>,
): Record<string, DaySchedule> {
  const result: Record<string, DaySchedule> = {}
  for (const day of dayOptions) {
    result[day] = existing?.[day] ?? {
      startTime: fallbackStart,
      endTime: fallbackEnd,
      breakStart: "12:00",
      breakEnd: "13:00",
    }
  }
  return result
}

const emptyValues: DoctorFormValues = {
  ad_soyad: "",
  uzmanlik: "",
  telefon: "",
  eposta: "",
  workingDays: ["Monday", "Tuesday", "Wednesday"],
  workingStartTime: "09:00",
  workingEndTime: "17:00",
  daySchedule: buildInitialSchedule("09:00", "17:00"),
  status: "active",
}

interface DoctorFormModalProps {
  doctor?: Doctor | null
  isOpen: boolean
  isSaving: boolean
  onClose: () => void
  onSubmit: (values: DoctorFormValues) => void
}

export default function DoctorFormModal({
  doctor,
  isOpen,
  isSaving,
  onClose,
  onSubmit,
}: DoctorFormModalProps) {
  const [values, setValues] = useState<DoctorFormValues>(() =>
    doctor   //isimlendirmeler backend ile uyumlu olacak şekilde ayarlanmıştır.. (nermin)
      ? {
          ad_soyad: doctor.ad_soyad,
          uzmanlik: doctor.uzmanlik,
          telefon: doctor.telefon,
          eposta: doctor.eposta,
          workingDays: doctor.workingDays,
          workingStartTime: doctor.workingStartTime,
          workingEndTime: doctor.workingEndTime,
          daySchedule: buildInitialSchedule(
            doctor.workingStartTime,
            doctor.workingEndTime,
            doctor.daySchedule,
          ),
          status: doctor.status,
        }
      : emptyValues,
  )

  if (!isOpen) return null

  const toggleDay = (day: string) => {
    setValues((current) => ({
      ...current,
      workingDays: current.workingDays.includes(day)
        ? current.workingDays.filter((item) => item !== day)
        : [...current.workingDays, day],
    }))
  }

  const updateDaySchedule = (day: string, field: keyof DaySchedule, value: string) => {
    setValues((current) => ({
      ...current,
      daySchedule: {
        ...current.daySchedule,
        [day]: {
          ...(current.daySchedule?.[day] ?? DEFAULT_SCHEDULE),
          [field]: value,
        },
      },
    }))
  }

  const handleSubmit = () => {
    const firstDay = dayOptions.find((d) => values.workingDays.includes(d))
    const firstSchedule = firstDay ? (values.daySchedule?.[firstDay] ?? DEFAULT_SCHEDULE) : DEFAULT_SCHEDULE
    onSubmit({
      ...values,
      workingStartTime: firstSchedule.startTime,
      workingEndTime: firstSchedule.endTime,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <form
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-2xl shadow-slate-950/20"
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {doctor ? "Doktoru düzenle" : "Doktor ekle"}
            </h2>
            <p className="text-sm text-slate-500">Klinik uygunluğu yönetin.</p>
          </div>
          <button
            aria-label="Pencereyi kapat"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            type="button"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Doktor adı
            <input
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 font-normal text-slate-900 outline-none focus:border-cyan-500"
              value={values.ad_soyad}
              onChange={(event) =>
                setValues({ ...values, ad_soyad: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Uzmanlık
            <input
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 font-normal text-slate-900 outline-none focus:border-cyan-500"
              value={values.uzmanlik}
              onChange={(event) =>
                setValues({ ...values, uzmanlik: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Telefon
            <input
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 font-normal text-slate-900 outline-none focus:border-cyan-500"
              value={values.telefon}
              onChange={(event) =>
                setValues({ ...values, telefon: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            E-posta
            <input
              required
              type="email"
              className="w-full rounded-md border border-slate-200 px-3 py-2 font-normal text-slate-900 outline-none focus:border-cyan-500"
              value={values.eposta}
              onChange={(event) =>
                setValues({ ...values, eposta: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Durum
            <select
              className="w-full rounded-md border border-slate-200 px-3 py-2 font-normal text-slate-900 outline-none focus:border-cyan-500"
              value={values.status}
              onChange={(event) =>
                setValues({
                  ...values,
                  status: event.target.value as DoctorFormValues["status"],
                })
              }
            >
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </label>
          <div className="space-y-2 sm:col-span-2">
            <p className="text-sm font-semibold text-slate-700">Çalışma günleri</p>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((day) => (
                <button
                  key={day}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                    values.workingDays.includes(day)
                      ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                  type="button"
                  onClick={() => toggleDay(day)}
                >
                  {shortDayLabels[day] ?? day}
                </button>
              ))}
            </div>
          </div>

          {values.workingDays.length > 0 && (
            <div className="sm:col-span-2 overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-3 py-2 font-medium text-slate-500">Gün</th>
                    <th className="px-3 py-2 font-medium text-slate-500">Başlangıç</th>
                    <th className="px-3 py-2 font-medium text-slate-500">Bitiş</th>
                    <th className="px-3 py-2 font-medium text-slate-500">Mola başlangıcı</th>
                    <th className="px-3 py-2 font-medium text-slate-500">Mola bitişi</th>
                  </tr>
                </thead>
                <tbody>
                  {dayOptions
                    .filter((day) => values.workingDays.includes(day))
                    .map((day) => {
                      const schedule = values.daySchedule?.[day] ?? DEFAULT_SCHEDULE
                      return (
                        <tr key={day} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-semibold text-slate-700">
                            {shortDayLabels[day] ?? day}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="time"
                              className="w-full rounded border border-slate-200 px-2 py-1 text-slate-900 outline-none focus:border-cyan-500"
                              value={schedule.startTime}
                              onChange={(e) =>
                                updateDaySchedule(day, "startTime", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="time"
                              className="w-full rounded border border-slate-200 px-2 py-1 text-slate-900 outline-none focus:border-cyan-500"
                              value={schedule.endTime}
                              onChange={(e) =>
                                updateDaySchedule(day, "endTime", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="time"
                              className="w-full rounded border border-slate-200 px-2 py-1 text-slate-900 outline-none focus:border-cyan-500"
                              value={schedule.breakStart}
                              onChange={(e) =>
                                updateDaySchedule(day, "breakStart", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="time"
                              className="w-full rounded border border-slate-200 px-2 py-1 text-slate-900 outline-none focus:border-cyan-500"
                              value={schedule.breakEnd}
                              onChange={(e) =>
                                updateDaySchedule(day, "breakEnd", e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Vazgeç
          </Button>
          <Button disabled={isSaving || values.workingDays.length === 0} type="submit">
            {isSaving ? "Kaydediliyor..." : "Doktoru kaydet"}
          </Button>
        </div>
      </form>
    </div>
  )
}
