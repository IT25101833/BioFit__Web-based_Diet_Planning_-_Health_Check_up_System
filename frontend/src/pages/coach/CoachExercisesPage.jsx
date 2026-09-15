import CoachLayout from '../../components/layout/CoachLayout'
import ExerciseLibrary from '../../features/coach/exercises/ExerciseLibrary'

export default function CoachExercisesPage() {
  return (
    <CoachLayout title="Exercise Library" breadcrumb="Fitness Coach / Exercise Library">
      <ExerciseLibrary />
    </CoachLayout>
  )
}