export type AppointmentStatus = "Pending" | "Approved" | "Cancelled" | "Completed"

export type DoctorStatus = "active" | "inactive"

export interface DaySchedule {
  startTime: string
  endTime: string
  breakStart: string
  breakEnd: string
}

export type NotificationType =
  | "Yeni randevu talebi"
  | "Randevu onaylandı"
  | "Randevu iptal edildi"
  | "Hasta randevuyu iptal etti"
  | "Randevu ertelendi"
  | "Randevu tamamlandı"

export interface Doctor {
  id: string
  ad_soyad: string
  uzmanlik: string
  telefon: string
  eposta: string
  workingDays: string[]
  workingStartTime: string
  workingEndTime: string
  daySchedule?: Record<string, DaySchedule>
  status: DoctorStatus
}

export interface Appointment {
  id: string
  patientName: string
  doctorId: string
  date: string
  time: string
  durationMinutes: number
  status: AppointmentStatus
  reason: string
}

export interface Notification {
  id: string
  type: NotificationType
  message: string
  appointmentId?: string
  createdAt: string
  read: boolean
}

export type DoctorFormValues = Omit<Doctor, "id">

export interface AppointmentFilters {
  patientName: string
  doctorName: string
  startDate: string
  endDate: string
  status: "All" | AppointmentStatus
}
