import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientSupportTickets from '../../features/client/support/ClientSupportTickets'

export default function ClientSupportPage() {
  return (
    <DashboardShell title="My Support Tickets">
      <ClientSupportTickets />
    </DashboardShell>
  )
}
