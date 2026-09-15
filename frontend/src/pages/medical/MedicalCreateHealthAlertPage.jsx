import MedicalLayout from '../../components/layout/MedicalLayout'
import CreateHealthAlert from '../../features/medical/health-alerts/CreateHealthAlert'

export default function MedicalCreateHealthAlertPage() {
  return (
    <MedicalLayout
      title="Create Health Risk Alert"
      breadcrumb="Medical Advisor / Health Risk Alerts"
    >
      <CreateHealthAlert />
    </MedicalLayout>
  )
}
