import SupportLayout from '../../components/layout/SupportLayout'
import SupportTicketQueue from '../../features/support/tickets/SupportTicketQueue'

export default function SupportTicketQueuePage() {
  return (
    <SupportLayout title="Support Ticket Queue" breadcrumb="Customer Experience">
      <SupportTicketQueue />
    </SupportLayout>
  )
}
