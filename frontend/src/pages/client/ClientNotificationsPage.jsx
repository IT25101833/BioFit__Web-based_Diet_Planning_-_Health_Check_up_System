import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientNotifications from '../../features/client/notifications/ClientNotifications'

export default function ClientNotificationsPage() {
  return (
    <DashboardShell title="Notifications">
      <ClientNotifications />
    </DashboardShell>
  )
}
