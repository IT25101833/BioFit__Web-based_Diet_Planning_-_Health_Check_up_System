import CoachLayout from '../../components/layout/CoachLayout'
import FitnessAssessments from '../../features/coach/assessments/FitnessAssessments'

export default function CoachAssessmentsPage() {
  return (
    <CoachLayout title="Fitness Assessments" breadcrumb="Fitness Coach / Assessments">
      <FitnessAssessments />
    </CoachLayout>
  )
}