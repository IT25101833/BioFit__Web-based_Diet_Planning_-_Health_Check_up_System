import DashboardShell from '../components/dashboard/DashboardShell'
import ClientProfile from '../features/client/profile/ClientProfile'

export default function ClientProfilePage() {
  return (
    <DashboardShell title="My Profile">
      <ClientProfile />
    </DashboardShell>
  )
}
