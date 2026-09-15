import MedicalLayout from '../../components/layout/MedicalLayout'
import HealthAssessments from '../../features/medical/assessments/HealthAssessments'

export default function MedicalAssessmentsPage() {
  return (
    <MedicalLayout
      title="Health Assessments"
      breadcrumb="Medical Advisor / Health Assessments"
    >
      <HealthAssessments />
    </MedicalLayout>
  )
}
