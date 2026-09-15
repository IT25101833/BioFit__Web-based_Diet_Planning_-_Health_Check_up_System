import MedicalLayout from '../../components/layout/MedicalLayout'
import CreateEditMedicalRecord from '../../features/medical/health-records/CreateEditMedicalRecord'

export default function MedicalCreateHealthRecordPage() {
  return (
    <MedicalLayout
      title="Create Medical Record"
      breadcrumb="Medical Advisor / Client Health Records"
    >
      <CreateEditMedicalRecord mode="create" />
    </MedicalLayout>
  )
}
