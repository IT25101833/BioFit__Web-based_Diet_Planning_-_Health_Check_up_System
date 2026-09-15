import SupportLayout from '../../components/layout/SupportLayout'
import ClientInquiries from '../../features/support/inquiries/ClientInquiries'

export default function SupportInquiriesPage() {
  return (
    <SupportLayout title="Client Inquiries" breadcrumb="Customer Experience">
      <ClientInquiries />
    </SupportLayout>
  )
}
