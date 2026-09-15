import ManagerLayout from '../../components/layout/ManagerLayout'
import ManagerDashboard from '../../features/manager/dashboard/ManagerDashboard'

export default function ManagerDashboardPage() {
  return (
    <ManagerLayout title="Dashboard" breadcrumb="Manager">
      <ManagerDashboard />
    </ManagerLayout>
  )
}
