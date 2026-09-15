import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientProgrammeDetails from '../../features/client/programmes/ClientProgrammeDetails'

export default function ClientProgrammeDetailsPage() {
  return (
    <DashboardShell title="Programme Details">
      <ClientProgrammeDetails />
    </DashboardShell>
  )
}
