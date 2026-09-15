import CoachLayout from '../../components/layout/CoachLayout'
import ProgressTracking from '../../features/coach/progress/ProgressTracking'

export default function CoachProgressPage() {
  return (
    <CoachLayout title="Progress Tracking" breadcrumb="Fitness Coach / Progress">
      <ProgressTracking />
    </CoachLayout>
  )
}