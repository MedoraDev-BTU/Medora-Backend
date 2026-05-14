import { Edit, Plus, Search, Trash2, UserRoundPlus } from "lucide-react"
import { useMemo, useState } from "react"
import Badge from "../components/Badge"
import Button from "../components/Button"
import DoctorFormModal from "../components/DoctorFormModal"
import EmptyState from "../components/EmptyState"
import { ErrorState, LoadingState } from "../components/FeedbackStates"
import PageHeader from "../components/PageHeader"
import { dayLabels } from "../components/utils"
import {
  useCreateDoctor,
  useDeleteDoctor,
  useDoctors,
  useUpdateDoctor,
} from "../hooks/useClinicQueries"
import type { Doctor, DoctorFormValues } from "../types"

export default function DoctorsPage() {
  const [query, setQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  const doctorsQuery = useDoctors()
  const createDoctor = useCreateDoctor()
  const updateDoctor = useUpdateDoctor()
  const deleteDoctor = useDeleteDoctor()

  const doctors = doctorsQuery.data

  const filteredDoctors = useMemo(
    () =>
      (doctors ?? []).filter((doctor) =>
        [
          doctor.ad_soyad,
          doctor.uzmanlik,
          doctor.eposta,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [doctors, query],
  )

  const openAdd = () => {
    setSelectedDoctor(null)
    setModalOpen(true)
  }

  const handleSubmit = (values: DoctorFormValues) => {
    if (selectedDoctor) {
      updateDoctor.mutate(
        { id: selectedDoctor.id, values },
        { onSuccess: () => setModalOpen(false) },
      )
    } else {
      createDoctor.mutate(values, {
        onSuccess: () => setModalOpen(false),
      })
    }
  }

  if (doctorsQuery.isLoading)
    return <LoadingState label="Doktorlar yükleniyor" />

  if (doctorsQuery.isError)
    return <ErrorState label="Doktorlar yüklenemedi" />

  return (
    <>
      <PageHeader
        title="Doktorlar"
        description="Doktor profillerini, iletişim bilgilerini ve uygunluk durumlarını yönetin."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openAdd}>
            Doktor ekle
          </Button>
        }
      />

      <div className="mb-4 flex max-w-md items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
        <Search className="h-5 w-5 text-slate-400" />

        <input
          className="w-full bg-transparent text-sm outline-none"
          placeholder="Doktor ara"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filteredDoctors.length === 0 ? (
        <EmptyState
          description="Bir doktor ekleyin veya arama filtresini değiştirin."
          icon={<UserRoundPlus className="h-6 w-6" />}
          title="Doktor bulunamadı"
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Doktor</th>
                  <th className="px-4 py-3">Uzmanlık</th>
                  <th className="px-4 py-3">İletişim</th>
                  <th className="px-4 py-3">Çalışma Saatleri</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="align-top">
                    <td className="px-4 py-4 font-semibold text-slate-950">
                      {doctor.ad_soyad}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {doctor.uzmanlik}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      <p>{doctor.telefon}</p>
                      <p className="text-xs text-slate-500">
                        {doctor.eposta}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
  <div className="flex flex-wrap gap-2">
    {doctor.workingDays.map((day) => (
      <span key={day} className="text-xs bg-slate-100 px-2 py-1 rounded">
        {dayLabels[day] ?? day}: {doctor.workingStartTime}-{doctor.workingEndTime}
      </span>
    ))}
  </div>
</td>

                    <td className="px-4 py-4">
                      <Badge value={doctor.status} />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          aria-label={`${doctor.ad_soyad} düzenle`}
                          className="h-9 px-3"
                          icon={<Edit className="h-4 w-4" />}
                          variant="secondary"
                          type="submit"
                          onClick={() => {
                            setSelectedDoctor(doctor)
                            
                            setModalOpen(true)
                          }}
                        />

                        <Button
                          aria-label={`${doctor.ad_soyad} sil`}
                          className="h-9 px-3"
                          disabled={deleteDoctor.isPending}
                          icon={<Trash2 className="h-4 w-4" />}
                          variant="danger"
                          onClick={() =>
                            deleteDoctor.mutate(doctor.id)
                          }
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

      {modalOpen ? (
        <DoctorFormModal
          key={selectedDoctor?.id ?? "new-doctor"}
          doctor={selectedDoctor}
          isOpen={modalOpen}
          isSaving={
            createDoctor.isPending || updateDoctor.isPending
          }
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </>
  )
}