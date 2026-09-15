import SupportLayout from '../../components/layout/SupportLayout'
import SupportProfile from '../../features/support/profile/SupportProfile'

export default function SupportProfilePage() {
  return (
    <SupportLayout title="My Profile" breadcrumb="Customer Experience">
      <SupportProfile />
    </SupportLayout>
  )
}
