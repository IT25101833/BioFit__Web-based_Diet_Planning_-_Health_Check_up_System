import CoachLayout from '../../components/layout/CoachLayout'
import WorkoutPlanDetails from '../../features/coach/workout-plans/WorkoutPlanDetails'

export default function CoachWorkoutPlanDetailsPage() {
  return (
    <CoachLayout title="Workout Plan" breadcrumb="Fitness Coach / Workout Plans / Details">
      <WorkoutPlanDetails />
    </CoachLayout>
  )
}