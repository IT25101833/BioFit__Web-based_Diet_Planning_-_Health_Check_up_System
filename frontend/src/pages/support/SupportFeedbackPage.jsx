import SupportLayout from '../../components/layout/SupportLayout'
import SupportFeedback from '../../features/support/feedback/SupportFeedback'

export default function SupportFeedbackPage() {
  return (
    <SupportLayout title="Feedback & Complaints" breadcrumb="Customer Experience">
      <SupportFeedback />
    </SupportLayout>
  )
}
