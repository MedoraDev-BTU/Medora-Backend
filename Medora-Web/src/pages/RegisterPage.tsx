import {
  Building2,
  CalendarClock,
  FileUp,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import Button from "../components/Button"

export default function RegisterPage() {
  const navigate = useNavigate()

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async  (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError("")
    setLoading(true)

    const formData = new FormData(event.currentTarget)


    const data = {
      ad_soyad: formData.get("ad_soyad"),
      eposta: formData.get("eposta"),
      sifre_hash: formData.get("sifre_hash"),
      telefon: formData.get("telefon"),
      adres: formData.get("adres"),
      sehir: formData.get("sehir"),
      ilce: formData.get("ilce")
    }

    try {
      const response = await fetch("http://localhost:5000/api/klinik/kayit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

     

      const result = await response.json()
      localStorage.setItem("token", result.access_token)

      if (!response.ok) {
        throw new Error(result.message)
      }

      navigate("/profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-8 shadow-xl shadow-slate-950/10"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-600 text-white">
            <CalendarClock className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Klinik Hesabı Oluştur
            </h1>
            <p className="text-sm text-slate-500">
              Medora klinik yönetici hesabınızı oluşturun.
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Ad Soyad
            <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
              <User className="h-5 w-5 text-slate-400" />
              <input name="ad_soyad" required className="w-full outline-none" />
            </div>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Klinik Adı
            <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
              <Building2 className="h-5 w-5 text-slate-400" />
              <input name="name"  className="w-full outline-none" />
            </div>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            E-posta
            <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
              <Mail className="h-5 w-5 text-slate-400" />
              <input name="eposta" required type="email" className="w-full outline-none" />
            </div>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Telefon
            <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
              <Phone className="h-5 w-5 text-slate-400" />
              <input name="telefon" required type="tel" className="w-full outline-none" />
            </div>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Şehir
            <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
              <MapPin className="h-5 w-5 text-slate-400" />
              <input name="sehir" required className="w-full outline-none" />
            </div>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            İlçe
            <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
              <MapPin className="h-5 w-5 text-slate-400" />
              <input name="ilce" required className="w-full outline-none" />
            </div>
          </label>

          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Açık Adres
            <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
              <MapPin className="h-5 w-5 text-slate-400" />
              <input name="adres" required className="w-full outline-none" />
            </div>
          </label>

          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Belge Yükleme
            <div className="mt-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
              <div className="flex flex-col items-center justify-center text-center">
                <FileUp className="h-8 w-8 text-cyan-600" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Klinik ruhsatı veya yetki belgesi yükleyin
                </p>
                <input
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="mt-4 w-full max-w-sm rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  type="file"
                />
              </div>
            </div>
          </label>

          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Parola
            <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
              <Lock className="h-5 w-5 text-slate-400" />
              <input
                name="sifre_hash"
                required
                type="password"
                minLength={8}
                className="w-full outline-none"
              />
            </div>
          </label>
        </div>

        <Button className="mt-6 w-full" type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : "Kaydol"}
        </Button>

        <p className="mt-5 text-center text-sm text-slate-500">
          Zaten kayıtlı mısınız?{" "}
          <Link className="font-semibold text-cyan-700" to="/login">
            Giriş yap
          </Link>
        </p>
      </form>
    </main>
  )
}
