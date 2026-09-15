import DashboardShell from '../../components/dashboard/DashboardShell'
import ClientSupportTicketDetails from '../../features/client/support/ClientSupportTicketDetails'

export default function ClientSupportDetailsPage() {
  return (
    <DashboardShell title="Support Ticket">
      <ClientSupportTicketDetails />
    </DashboardShell>
  )
}
