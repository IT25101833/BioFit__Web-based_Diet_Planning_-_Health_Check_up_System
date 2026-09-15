import CoachLayout from '../../components/layout/CoachLayout'
import CoachProfile from '../../features/coach/profile/CoachProfile'

export default function CoachProfilePage() {
  return (
    <CoachLayout title="My Profile" breadcrumb="Fitness Coach / Profile">
      <CoachProfile />
    </CoachLayout>
  )
}