import MedicalLayout from '../../components/layout/MedicalLayout'
import HealthRecords from '../../features/medical/health-records/HealthRecords'

export default function MedicalHealthRecordsPage() {
  return (
    <MedicalLayout
      title="Client Health Records"
      breadcrumb="Medical Advisor / Client Health Records"
    >
      <HealthRecords />
    </MedicalLayout>
  )
}
