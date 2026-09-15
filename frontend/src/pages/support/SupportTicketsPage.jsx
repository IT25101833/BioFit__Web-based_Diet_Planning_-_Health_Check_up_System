import SupportLayout from '../../components/layout/SupportLayout'
import SupportTickets from '../../features/support/tickets/SupportTickets'

export default function SupportTicketsPage() {
  return (
    <SupportLayout title="Support Tickets" breadcrumb="Customer Experience">
      <SupportTickets />
    </SupportLayout>
  )
}
