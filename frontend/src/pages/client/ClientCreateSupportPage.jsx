import DashboardShell from '../../components/dashboard/DashboardShell'
import CreateSupportTicket from '../../features/client/support/CreateSupportTicket'

export default function ClientCreateSupportPage() {
  return (
    <DashboardShell title="Create Support Ticket">
      <CreateSupportTicket />
    </DashboardShell>
  )
}
