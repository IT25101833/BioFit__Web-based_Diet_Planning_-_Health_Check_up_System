import MedicalLayout from '../../components/layout/MedicalLayout'
import MedicalNotifications from '../../features/medical/notifications/MedicalNotifications'

export default function MedicalNotificationsPage() {
  return (
    <MedicalLayout title="Notifications" breadcrumb="Medical Advisor / Notifications">
      <MedicalNotifications />
    </MedicalLayout>
  )
}
