import CoachLayout from '../../components/layout/CoachLayout'
import CreateEditExercise from '../../features/coach/exercises/CreateEditExercise'

export default function CoachEditExercisePage() {
  return (
    <CoachLayout title="Edit Exercise" breadcrumb="Fitness Coach / Exercise Library / Edit">
      <CreateEditExercise mode="edit" />
    </CoachLayout>
  )
}