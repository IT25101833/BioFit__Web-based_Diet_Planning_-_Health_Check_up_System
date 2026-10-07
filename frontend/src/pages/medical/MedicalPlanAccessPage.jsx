import MedicalLayout from '../../components/layout/MedicalLayout'
import PlanAccess from '../../features/medical/plan-access/PlanAccess'

export default function MedicalPlanAccessPage() {
  return (
    <MedicalLayout title="Request Client" breadcrumb="Medical Advisor / Request Client">
      <PlanAccess />
    </MedicalLayout>
  )
}
