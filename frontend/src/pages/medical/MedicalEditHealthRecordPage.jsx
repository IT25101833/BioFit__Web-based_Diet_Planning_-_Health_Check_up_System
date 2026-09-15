import MedicalLayout from '../../components/layout/MedicalLayout'
import CreateEditMedicalRecord from '../../features/medical/health-records/CreateEditMedicalRecord'

export default function MedicalEditHealthRecordPage() {
  return (
    <MedicalLayout
      title="Edit Medical Record"
      breadcrumb="Medical Advisor / Client Health Records"
    >
      <CreateEditMedicalRecord mode="edit" />
    </MedicalLayout>
  )
}
