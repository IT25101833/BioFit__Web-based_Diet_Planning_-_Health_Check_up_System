import CoachLayout from '../../components/layout/CoachLayout'
import AssessmentDetails from '../../features/coach/assessments/AssessmentDetails'

export default function CoachAssessmentDetailsPage() {
  return (
    <CoachLayout title="Assessment Details" breadcrumb="Fitness Coach / Assessments / Details">
      <AssessmentDetails />
    </CoachLayout>
  )
}