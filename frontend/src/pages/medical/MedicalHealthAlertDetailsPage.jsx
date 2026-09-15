import MedicalLayout from '../../components/layout/MedicalLayout'
import AlertDetails from '../../features/medical/health-alerts/AlertDetails'

export default function MedicalHealthAlertDetailsPage() {
  return (
    <MedicalLayout
      title="Alert Details"
      breadcrumb="Medical Advisor / Health Risk Alerts"
    >
      <AlertDetails />
    </MedicalLayout>
  )
}
