import type { Appointment, Doctor } from "../types"

export const today = "2026-04-30"

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`))

export const doctorName = (doctors: Doctor[], doctorId: string) =>
  doctors.find((doctor) => doctor.id === doctorId)?.name ?? "Atanmamış"

export const dayLabels: Record<string, string> = {
  Monday: "Pazartesi",
  Tuesday: "Salı",
  Wednesday: "Çarşamba",
  Thursday: "Perşembe",
  Friday: "Cuma",
  Saturday: "Cumartesi",
  Sunday: "Pazar",
}

export const shortDayLabels: Record<string, string> = {
  Monday: "Pzt",
  Tuesday: "Sal",
  Wednesday: "Çar",
  Thursday: "Per",
  Friday: "Cum",
  Saturday: "Cmt",
  Sunday: "Paz",
}

export const appointmentStatusLabels: Record<Appointment["status"] | "All", string> = {
  All: "Tümü",
  Pending: "Beklemede",
  Approved: "Onaylandı",
  Cancelled: "İptal edildi",
  Completed: "Tamamlandı",
}

export const byTime = (first: Appointment, second: Appointment) =>
  first.time.localeCompare(second.time)

export const groupByDoctor = (appointments: Appointment[]) =>
  appointments.reduce<Record<string, Appointment[]>>((groups, appointment) => {
    groups[appointment.doctorId] = groups[appointment.doctorId] ?? []
    groups[appointment.doctorId].push(appointment)
    return groups
  }, {})
