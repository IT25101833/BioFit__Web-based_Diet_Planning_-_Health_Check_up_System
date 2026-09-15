import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientProgrammes from '../../features/client/programmes/ClientProgrammes'

export default function ClientProgrammesPage() {
  return (
    <DashboardShell title="My Programmes">
      <ClientProgrammes />
    </DashboardShell>
  )
}
