import ManagerLayout from '../../components/layout/ManagerLayout'
import ManagerNotifications from '../../features/manager/notifications/ManagerNotifications'

export default function ManagerNotificationsPage() {
  return (
    <ManagerLayout title="Notifications" breadcrumb="Manager / Notifications">
      <ManagerNotifications />
    </ManagerLayout>
  )
}
