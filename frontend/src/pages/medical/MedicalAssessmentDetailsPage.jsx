import MedicalLayout from '../../components/layout/MedicalLayout'
import AssessmentDetails from '../../features/medical/assessments/AssessmentDetails'

export default function MedicalAssessmentDetailsPage() {
  return (
    <MedicalLayout
      title="Assessment Details"
      breadcrumb="Medical Advisor / Health Assessments"
    >
      <AssessmentDetails />
    </MedicalLayout>
  )
}
