import SupportLayout from '../../components/layout/SupportLayout'
import SupportTicketDetails from '../../features/support/tickets/SupportTicketDetails'

export default function SupportTicketDetailsPage() {
  return (
    <SupportLayout title="Ticket Details" breadcrumb="Customer Experience · Support Tickets">
      <SupportTicketDetails />
    </SupportLayout>
  )
}
