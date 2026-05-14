import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { clinicApi } from "../services/api"
import type { AppointmentStatus, DoctorFormValues ,Doctor} from "../types"

export const queryKeys = {
  doctors: ["doctors"] as const,
  appointments: ["appointments"] as const,
  notifications: ["notifications"] as const,
}

export const useDoctors = () => {
  return useQuery<Doctor[]>({
    queryKey: ["doctors"],

    queryFn: async () => {
      const token = localStorage.getItem("token")

      const response = await fetch(
        "http://localhost:5000/api/doktor/doktorlar",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      console.log(result)

      if (!response.ok) {
        throw new Error(
          result.message || "Doktorlar alınamadı"
        )
      }

      return result.data
    },
  })
}

export const useAppointments = () =>
  useQuery({
    queryKey: queryKeys.appointments,
    queryFn: clinicApi.getAppointments,
  })

export const useNotifications = () =>
  useQuery({
    queryKey: queryKeys.notifications,
    queryFn: clinicApi.getNotifications,
  })


export const useCreateDoctor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: DoctorFormValues) => {
      const token = localStorage.getItem("token")

      const response = await fetch(
        "http://localhost:5000/api/doktor/doktor_ekle",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Doktor eklenemedi")
      }

      return result.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["doctors"],
      })
    },
  })
}

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string
      values: DoctorFormValues
    }) => {
      const token = localStorage.getItem("token")

      console.log(`${values}`)

      console.log(`${id}`)

      const response = await fetch(
        `http://localhost:5000/api/doktor/doktor_guncelle/${id}`,
        {
          method: "PUT", 
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Doktor güncellenemedi")
      }

      return result.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["doctors"],
      })
    },
  })
}

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clinicApi.deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors })
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments })
    },
  })
}

export const useAppointmentAction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status?: AppointmentStatus }) =>
      status
        ? clinicApi.updateAppointmentStatus(id, status)
        : clinicApi.postponeAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })
}

export const useToggleNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clinicApi.toggleNotificationRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  })
}
