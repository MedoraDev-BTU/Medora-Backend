import { BellRing } from "lucide-react"
import Badge from "../components/Badge"
import Button from "../components/Button"
import EmptyState from "../components/EmptyState"
import { ErrorState, LoadingState } from "../components/FeedbackStates"
import PageHeader from "../components/PageHeader"
import { useNotifications, useToggleNotification } from "../hooks/useClinicQueries"

export default function NotificationsPage() {
  const notificationsQuery = useNotifications()
  const toggleNotification = useToggleNotification()

  if (notificationsQuery.isLoading) {
    return <LoadingState label="Bildirimler yükleniyor" />
  }

  if (notificationsQuery.isError) {
    return <ErrorState label="Bildirimler yüklenemedi" />
  }

  const notifications = notificationsQuery.data ?? []

  return (
    <>
      <PageHeader
        title="Bildirimler"
        description="Randevu taleplerini, iptalleri, ertelemeleri ve tamamlanan işlemleri takip edin."
      />

      {notifications.length === 0 ? (
        <EmptyState
          description="Operasyon güncellemeleri burada görünür."
          icon={<BellRing className="h-6 w-6" />}
          title="Bildirim yok"
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-bold text-slate-950">{notification.type}</h2>
                    <Badge value={notification.read ? "read" : "unread"} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    {new Date(notification.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
                <Button
                  disabled={toggleNotification.isPending}
                  variant="secondary"
                  onClick={() => toggleNotification.mutate(notification.id)}
                >
                  {notification.read ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
