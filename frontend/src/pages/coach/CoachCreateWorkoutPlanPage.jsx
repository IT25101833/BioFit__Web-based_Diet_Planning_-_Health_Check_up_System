import CoachLayout from '../../components/layout/CoachLayout'
import CreateEditWorkoutPlan from '../../features/coach/workout-plans/CreateEditWorkoutPlan'

export default function CoachCreateWorkoutPlanPage() {
  return (
    <CoachLayout title="Create Workout Plan" breadcrumb="Fitness Coach / Workout Plans / Create">
      <CreateEditWorkoutPlan mode="create" />
    </CoachLayout>
  )
}