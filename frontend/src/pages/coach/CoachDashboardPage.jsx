import CoachLayout from '../../components/layout/CoachLayout'
import CoachDashboard from '../../features/coach/dashboard/CoachDashboard'

export default function CoachDashboardPage() {
  return (
    <CoachLayout title="Dashboard" breadcrumb="Fitness Coach">
      <CoachDashboard />
    </CoachLayout>
  )
}