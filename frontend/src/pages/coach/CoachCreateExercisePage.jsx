import CoachLayout from '../../components/layout/CoachLayout'
import CreateEditExercise from '../../features/coach/exercises/CreateEditExercise'

export default function CoachCreateExercisePage() {
  return (
    <CoachLayout title="Add Exercise" breadcrumb="Fitness Coach / Exercise Library / Create">
      <CreateEditExercise mode="create" />
    </CoachLayout>
  )
}