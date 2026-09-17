import MedicalLayout from '../../components/layout/MedicalLayout'
import MedicalHistory from '../../features/medical/medical-history/MedicalHistory'

export default function MedicalHistoryPage() {
  return (
    <MedicalLayout title="Medical History" breadcrumb="Medical Advisor / Medical History">
      <MedicalHistory />
    </MedicalLayout>
  )
}
