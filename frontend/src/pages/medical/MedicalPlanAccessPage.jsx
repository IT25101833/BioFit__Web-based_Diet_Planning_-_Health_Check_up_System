import MedicalLayout from '../../components/layout/MedicalLayout'
import PlanAccess from '../../features/medical/plan-access/PlanAccess'

export default function MedicalPlanAccessPage() {
  return (
    <MedicalLayout title="Plan Access" breadcrumb="Medical Advisor / Plan Access">
      <PlanAccess />
    </MedicalLayout>
  )
}
