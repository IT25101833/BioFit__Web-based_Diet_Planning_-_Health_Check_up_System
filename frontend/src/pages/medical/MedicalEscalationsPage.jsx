import MedicalLayout from '../../components/layout/MedicalLayout'
import SpecialistEscalationQueue from '../../features/specialist/SpecialistEscalationQueue'

export default function MedicalEscalationsPage() {
  return (
    <MedicalLayout title="Escalations" breadcrumb="Medical Advisor / Escalations">
      <SpecialistEscalationQueue
        title="Medical escalations"
        description="Cases support sent to the medical advisor. Other specialist queues are not shown here."
        apiBase="/api/medical"
      />
    </MedicalLayout>
  )
}
