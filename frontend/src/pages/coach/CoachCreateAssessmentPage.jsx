import CoachLayout from '../../components/layout/CoachLayout'
import CreateAssessment from '../../features/coach/assessments/CreateAssessment'

export default function CoachCreateAssessmentPage() {
  return (
    <CoachLayout title="New Assessment" breadcrumb="Fitness Coach / Assessments / Create">
      <CreateAssessment />
    </CoachLayout>
  )
}