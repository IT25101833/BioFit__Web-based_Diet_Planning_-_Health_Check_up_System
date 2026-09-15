import MedicalLayout from '../../components/layout/MedicalLayout'
import CreateHealthAssessment from '../../features/medical/assessments/CreateHealthAssessment'

export default function MedicalCreateAssessmentPage() {
  return (
    <MedicalLayout
      title="New Health Assessment"
      breadcrumb="Medical Advisor / Health Assessments"
    >
      <CreateHealthAssessment mode="create" />
    </MedicalLayout>
  )
}
