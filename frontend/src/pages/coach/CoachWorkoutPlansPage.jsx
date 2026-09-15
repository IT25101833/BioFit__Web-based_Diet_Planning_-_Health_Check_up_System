import CoachLayout from '../../components/layout/CoachLayout'
import WorkoutPlans from '../../features/coach/workout-plans/WorkoutPlans'

export default function CoachWorkoutPlansPage() {
  return (
    <CoachLayout title="Workout Plans" breadcrumb="Fitness Coach / Workout Plans">
      <WorkoutPlans />
    </CoachLayout>
  )
}