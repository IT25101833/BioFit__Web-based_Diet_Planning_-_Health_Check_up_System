import CoachLayout from '../../components/layout/CoachLayout'
import ClientProgressDetails from '../../features/coach/progress/ClientProgressDetails'

export default function CoachClientProgressPage() {
  return (
    <CoachLayout title="Client Progress" breadcrumb="Fitness Coach / Progress">
      <ClientProgressDetails />
    </CoachLayout>
  )
}