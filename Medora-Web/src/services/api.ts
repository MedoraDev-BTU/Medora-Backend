import axios from "axios"
import { appointments, doctors, notifications } from "../data/mockData"
import type {
  AppointmentStatus,
  Doctor,
  DoctorFormValues,
  Notification,
} from "../types"

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 8000,
})

let doctorsStore = [...doctors]
let appointmentsStore = [...appointments]
let notificationsStore = [...notifications]

const wait = async <T,>(data: T, shouldFail = false): Promise<T> => {
  await new Promise((resolve) => window.setTimeout(resolve, 350))

  if (shouldFail) {
    throw new Error("Simüle API hatası. Lütfen tekrar deneyin.")
  }

  return structuredClone(data)
}

const addNotification = (
  type: Notification["type"],
  message: string,
  appointmentId?: string,
) => {
  notificationsStore = [
    {
      id: crypto.randomUUID(),
      type,
      message,
      appointmentId,
      createdAt: new Date().toISOString(),
      read: false,
    },
    ...notificationsStore,
  ]
}

export const clinicApi = {
  getDoctors: () => wait(doctorsStore),
  createDoctor: (doctor: DoctorFormValues) => {
    const created: Doctor = { id: crypto.randomUUID(), ...doctor }
    doctorsStore = [created, ...doctorsStore]
    return wait(created)
  },
  updateDoctor: (id: string, doctor: DoctorFormValues) => {
    doctorsStore = doctorsStore.map((item) =>
      item.id === id ? { id, ...doctor } : item,
    )
    return wait(doctorsStore.find((item) => item.id === id)!)
  },
  deleteDoctor: (id: string) => {
    doctorsStore = doctorsStore.filter((doctor) => doctor.id !== id)
    appointmentsStore = appointmentsStore.map((appointment) =>
      appointment.doctorId === id
        ? { ...appointment, status: "Cancelled" as AppointmentStatus }
        : appointment,
    )
    return wait({ id })
  },
  getAppointments: () => wait(appointmentsStore),
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => {
    appointmentsStore = appointmentsStore.map((appointment) =>
      appointment.id === id ? { ...appointment, status } : appointment,
    )
    const appointment = appointmentsStore.find((item) => item.id === id)
    if (appointment) {
      const type =
        status === "Cancelled"
          ? "Randevu iptal edildi"
          : status === "Completed"
            ? "Randevu tamamlandı"
            : status === "Approved"
              ? "Randevu onaylandı"
              : "Yeni randevu talebi"
      const statusLabel =
        status === "Cancelled"
          ? "iptal edildi"
          : status === "Completed"
            ? "tamamlandı"
            : status === "Approved"
              ? "onaylandı"
              : "beklemeye alındı"
      addNotification(
        type,
        `${appointment.patientName} adlı hastanın randevusu ${statusLabel}.`,
        id,
      )
    }
    return wait(appointment!)
  },
  postponeAppointment: (id: string) => {
    appointmentsStore = appointmentsStore.map((appointment) => {
      if (appointment.id !== id) return appointment

      const [hour, minute] = appointment.time.split(":").map(Number)
      const nextTime = `${String(Math.min(hour + 1, 18)).padStart(2, "0")}:${String(
        minute,
      ).padStart(2, "0")}`
      return { ...appointment, time: nextTime, status: "Approved" }
    })
    const appointment = appointmentsStore.find((item) => item.id === id)
    if (appointment) {
      addNotification(
        "Randevu ertelendi",
        `${appointment.patientName} adlı hastanın ziyareti ${appointment.time} saatine ertelendi.`,
        id,
      )
    }
    return wait(appointment!)
  },
  getNotifications: () => wait(notificationsStore),
  toggleNotificationRead: (id: string) => {
    notificationsStore = notificationsStore.map((notification) =>
      notification.id === id
        ? { ...notification, read: !notification.read }
        : notification,
    )
    return wait(notificationsStore.find((item) => item.id === id)!)
  },
}
