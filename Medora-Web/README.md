# Medora Admin Frontend

Medora Admin, klinik randevularını yönetmek için geliştirilen React ve TypeScript tabanlı bir yönetim paneli arayüzüdür. Arayüz Vite, Tailwind CSS, React Router, TanStack Query, Axios ve lucide-react ikonları ile oluşturulmuştur.

## Frontend Özeti

Frontend, klinik personeli için responsive bir yönetim paneli sunar. Uygulamada panel, doktorlar, randevular, takvim, bildirimler, randevu geçmişi, yönetici profili, giriş ve kayıt sayfaları bulunur. Yönetici kullanıcılar günlük randevu akışını görüntüleyebilir, doktor kayıtlarını yönetebilir, randevu durumlarını güncelleyebilir, randevuları erteleyebilir ve bildirimleri takip edebilir.

Veriler şu anda `src/services/api.ts` içinde bulunan simüle edilmiş API katmanı üzerinden yerel mock verilerden sağlanmaktadır. TanStack Query, bu verileri almak ve güncellemek için kullanılır; böylece arayüz davranışı gerçek bir backend API ile çalışıyormuş gibi tasarlanmıştır.

## Kullanılan Teknolojiler

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- lucide-react

## Yerelde Çalıştırma

Bağımlılıkları yükleyin:

```bash
npm install
```

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Production build almak için:

```bash
npm run build
```
