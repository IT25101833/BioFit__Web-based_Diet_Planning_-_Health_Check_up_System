import SupportLayout from '../../components/layout/SupportLayout'
import ResolveTicketPage from '../../features/support/tickets/ResolveTicketPage'

export default function SupportResolveTicketPage() {
  return (
    <SupportLayout title="Resolve Ticket" breadcrumb="Customer Experience · Support Tickets">
      <ResolveTicketPage />
    </SupportLayout>
  )
}
