import NutritionLayout from '../../components/layout/NutritionLayout'
import AccessRequestInbox from '../../features/plan-access/AccessRequestInbox'

export default function NutritionAccessRequestsPage() {
  return (
    <NutritionLayout title="Health Risk Alerts" breadcrumb="Nutrition / Health Risk Alerts">
      <AccessRequestInbox
        title="Health Risk Alerts"
        description="Nutrition health risk alerts raised by a Medical Advisor. Plan access is approved by the client."
        alertsPath="/api/nutrition/health-risk-alerts"
        alertHeading="Nutrition Health Risk Alerts"
      />
    </NutritionLayout>
  )
}
