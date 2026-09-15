import CoachLayout from '../../components/layout/CoachLayout'
import CreateEditWorkoutPlan from '../../features/coach/workout-plans/CreateEditWorkoutPlan'

export default function CoachEditWorkoutPlanPage() {
  return (
    <CoachLayout title="Edit Workout Plan" breadcrumb="Fitness Coach / Workout Plans / Edit">
      <CreateEditWorkoutPlan mode="edit" />
    </CoachLayout>
  )
}