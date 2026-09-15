import SupportLayout from '../../components/layout/SupportLayout'
import SupportNotifications from '../../features/support/notifications/SupportNotifications'

export default function SupportNotificationsPage() {
  return (
    <SupportLayout title="Notifications" breadcrumb="Customer Experience">
      <SupportNotifications />
    </SupportLayout>
  )
}
