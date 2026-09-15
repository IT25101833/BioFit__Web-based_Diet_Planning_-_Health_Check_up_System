import MedicalLayout from '../../components/layout/MedicalLayout'
import MedicalRecordDetails from '../../features/medical/health-records/MedicalRecordDetails'

export default function MedicalHealthRecordDetailsPage() {
  return (
    <MedicalLayout
      title="Medical Record Details"
      breadcrumb="Medical Advisor / Client Health Records"
    >
      <MedicalRecordDetails />
    </MedicalLayout>
  )
}
