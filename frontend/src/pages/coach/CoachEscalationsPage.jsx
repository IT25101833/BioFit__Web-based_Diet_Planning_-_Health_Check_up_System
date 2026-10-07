import CoachLayout from '../../components/layout/CoachLayout'
import SpecialistEscalationQueue from '../../features/specialist/SpecialistEscalationQueue'

export default function CoachEscalationsPage() {
  return (
    <CoachLayout title="Escalations" breadcrumb="Fitness Coach / Escalations">
      <SpecialistEscalationQueue
        title="Fitness escalations"
        description="Cases support sent to the fitness coach."
        apiBase="/api/coach"
      />
    </CoachLayout>
  )
}
