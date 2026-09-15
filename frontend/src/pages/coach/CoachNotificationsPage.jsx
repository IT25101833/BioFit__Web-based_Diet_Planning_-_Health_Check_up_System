import CoachLayout from '../../components/layout/CoachLayout'
import CoachNotifications from '../../features/coach/notifications/CoachNotifications'

export default function CoachNotificationsPage() {
  return (
    <CoachLayout title="Notifications" breadcrumb="Fitness Coach / Notifications">
      <CoachNotifications />
    </CoachLayout>
  )
}