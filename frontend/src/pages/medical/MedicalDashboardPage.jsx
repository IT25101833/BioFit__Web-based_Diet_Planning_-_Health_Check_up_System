import MedicalLayout from '../../components/layout/MedicalLayout'
import MedicalDashboard from '../../features/medical/dashboard/MedicalDashboard'

export default function MedicalDashboardPage() {
  return (
    <MedicalLayout title="Dashboard" breadcrumb="Medical Advisor">
      <MedicalDashboard />
    </MedicalLayout>
  )
}
