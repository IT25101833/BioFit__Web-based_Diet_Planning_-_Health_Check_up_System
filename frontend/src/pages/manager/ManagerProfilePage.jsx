import ManagerLayout from '../../components/layout/ManagerLayout'
import ManagerProfile from '../../features/manager/profile/ManagerProfile'

export default function ManagerProfilePage() {
  return (
    <ManagerLayout title="My Profile" breadcrumb="Manager / Profile">
      <ManagerProfile />
    </ManagerLayout>
  )
}
