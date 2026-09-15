import MedicalLayout from '../../components/layout/MedicalLayout'
import HealthAlerts from '../../features/medical/health-alerts/HealthAlerts'

export default function MedicalHealthAlertsPage() {
  return (
    <MedicalLayout
      title="Health Risk Alerts"
      breadcrumb="Medical Advisor / Health Risk Alerts"
    >
      <HealthAlerts />
    </MedicalLayout>
  )
}
