import {
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserCircle,
} from "lucide-react"

import { useEffect, useState } from "react"

import Button from "../components/Button"
import PageHeader from "../components/PageHeader"

export default function AdminProfilePage() {

  type ProfileType = {
  ad_soyad: string
  eposta: string
  telefon: string
  sehir: string
  ilce: string
  adres: string
}

const [profile, setProfile] = useState<ProfileType | null>(null)
  const [saved, setSaved] = useState(false)

  // input değişimi
  const updateProfile = (field: keyof ProfileType, value: string) => {

  setSaved(false)

  setProfile((current) => ({
    ...current!,
    [field]: value
  }))
}

const handleUpdate = async (event:React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()

  try {
    const response = await fetch("http://localhost:5000/api/klinik/klinik_guncelle", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(profile)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message)
    }

    // ✅ BURASI DOĞRU YER
    setProfile(result.data)

    setSaved(true)

  } catch (error) {
    console.log(error)
  }
}

  // profile bilgilerini çek
  useEffect(() => {

    const getProfile = async () => {

      try {

        const token = localStorage.getItem("token")

        const response = await fetch(
          "http://localhost:5000/api/klinik/profile",
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        console.log(`${token}`)

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message)
        }

        // backendden gelen data
        setProfile(result.data)

        console.log(result.data)

      } catch (err) {

        console.log(err)

      }
    }

    getProfile()

  }, [])

  // veri gelmeden sayfa render olmasın
  if (!profile) {
    return <p className="p-10 text-center">Yükleniyor...</p>
  }

 

  return (
    <>
      <PageHeader
        title="Profil"
        description="Yönetici hesabı ve klinik bilgilerinizi görüntüleyin ve güncelleyin."
      />

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">

        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col items-center text-center">

            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-100 text-2xl font-bold text-cyan-700">
              {profile.ad_soyad?.charAt(0)}
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-950">
              {profile.ad_soyad}
            </h2>

            <p className="text-sm text-slate-500">
              Klinik Yöneticisi
            </p>

          </div>

          <div className="mt-6 space-y-3 rounded-lg bg-slate-50 p-4 text-sm">

            <div className="flex items-center gap-3 text-slate-600">
              <ShieldCheck className="h-5 w-5 text-cyan-600" />
              <span>Aktif yönetici hesabı</span>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <Building2 className="h-5 w-5 text-cyan-600" />
              <span></span>
            </div>

          </div>

        </aside>

        <form
          className="space-y-6"
           
          onSubmit={handleUpdate}
        >

          {/* hesap bilgileri */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
                <UserCircle className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Hesap bilgileri
                </h2>

                <p className="text-sm text-slate-500">
                  Giriş yapan yöneticinin temel iletişim bilgileri.
                </p>
              </div>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <label className="text-sm font-semibold text-slate-700">

                Ad Soyad

                <input
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2"
                  value={profile.ad_soyad || ""}
                  onChange={(event) =>
                    updateProfile("ad_soyad", event.target.value)
                  }
                />

              </label>

              <label className="text-sm font-semibold text-slate-700">

                E-posta

                <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">

                  <Mail className="h-5 w-5 text-slate-400" />

                  <input
                    className="w-full outline-none"
                    type="email"
                    value={profile.eposta || ""}
                    onChange={(event) =>
                      updateProfile("eposta", event.target.value)
                    }
                  />

                </div>

              </label>

              <label className="text-sm font-semibold text-slate-700">

                Telefon

                <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">

                  <Phone className="h-5 w-5 text-slate-400" />

                  <input
                    className="w-full outline-none"
                    type="tel"
                    value={profile.telefon || ""}
                    onChange={(event) =>
                      updateProfile("telefon", event.target.value)
                    }
                  />

                </div>

              </label>

            </div>

          </section>

          {/* klinik bilgileri */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Klinik bilgileri
                </h2>

                <p className="text-sm text-slate-500">
                  Panelde kullanılan klinik bilgileri.
                </p>
              </div>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <label className="text-sm font-semibold text-slate-700">

                Klinik Adı

                <input
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2"
                  value={profile.ad_soyad || ""}
                  onChange={(event) =>
                    updateProfile("ad_soyad", event.target.value)
                  }
                />

              </label>

              <label className="text-sm font-semibold text-slate-700">

                Şehir

                <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">

                  <MapPin className="h-5 w-5 text-slate-400" />

                  <input
                    className="w-full outline-none"
                    value={profile.sehir || ""}
                    onChange={(event) =>
                      updateProfile("sehir", event.target.value)
                    }
                  />

                </div>

              </label>

              <label className="text-sm font-semibold text-slate-700">

                İlçe

                <input
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2"
                  value={profile.ilce || ""}
                  onChange={(event) =>
                    updateProfile("ilce", event.target.value)
                  }
                />

              </label>

              <label className="text-sm font-semibold text-slate-700 md:col-span-2">

                Adres

                <input
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2"
                  value={profile.adres || ""}
                  onChange={(event) =>
                    updateProfile("adres", event.target.value)
                  }
                />

              </label>

            </div>

          </section>

          <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">

            <div className="min-h-6">

              {saved ? (

                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">

                  <CheckCircle2 className="h-5 w-5" />

                  Profil bilgileri güncellendi.

                </p>

              ) : (

                <p className="text-sm text-slate-500">
                  Değişiklikleri kaydetmek için bilgileri kontrol edin.
                </p>

              )}

            </div>

            <Button
              icon={<Save className="h-4 w-4" />}
              type="submit"
            >
              Bilgileri Kaydet
            </Button>

          </div>

        </form>

      </div>
    </>
  )
}
