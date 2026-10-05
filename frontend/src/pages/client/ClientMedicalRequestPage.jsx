import DashboardShell from '../../components/dashboard/DashboardShell'
import RequestMedicalAttention from '../../features/client/medical-requests/RequestMedicalAttention'

export default function ClientMedicalRequestPage() {
  return (
    <DashboardShell title="Request Medical Attention">
      <RequestMedicalAttention />
    </DashboardShell>
  )
}
