import ManagerLayout from '../../components/layout/ManagerLayout'
import SpecialistEscalationQueue from '../../features/specialist/SpecialistEscalationQueue'

export default function ManagerEscalationsPage() {
  return (
    <ManagerLayout title="Escalations" breadcrumb="Manager / Escalations">
      <SpecialistEscalationQueue
        title="Manager escalations"
        description="Cases support sent to the wellness centre manager."
        apiBase="/api/manager"
      />
    </ManagerLayout>
  )
}
