import CoachLayout from '../../components/layout/CoachLayout'
import AccessRequestInbox from '../../features/plan-access/AccessRequestInbox'

export default function CoachAccessRequestsPage() {
  return (
    <CoachLayout title="Health Risk Alerts" breadcrumb="Fitness Coach / Health Risk Alerts">
      <AccessRequestInbox
        title="Health Risk Alerts"
        description="Fitness health risk alerts raised by a Medical Advisor. Plan access is approved by the client."
        alertsPath="/api/coach/health-risk-alerts"
        alertHeading="Fitness Health Risk Alerts"
      />
    </CoachLayout>
  )
}
