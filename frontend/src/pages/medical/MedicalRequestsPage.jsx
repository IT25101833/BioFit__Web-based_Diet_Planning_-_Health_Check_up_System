import MedicalLayout from '../../components/layout/MedicalLayout'
import MedicalRequests from '../../features/medical/requests/MedicalRequests'

export default function MedicalRequestsPage() {
  return (
    <MedicalLayout title="Medical Requests" breadcrumb="Medical Advisor / Medical Requests">
      <MedicalRequests />
    </MedicalLayout>
  )
}
