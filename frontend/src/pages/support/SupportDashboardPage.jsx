import SupportLayout from '../../components/layout/SupportLayout'
import SupportDashboard from '../../features/support/dashboard/SupportDashboard'

export default function SupportDashboardPage() {
  return (
    <SupportLayout title="Dashboard" breadcrumb="Customer Experience">
      <SupportDashboard />
    </SupportLayout>
  )
}
