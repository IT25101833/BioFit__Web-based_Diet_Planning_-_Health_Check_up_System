import ManagerLayout from '../../components/layout/ManagerLayout'
import ManagerStaff from '../../features/manager/staff/ManagerStaff'

export default function ManagerStaffPage() {
  return (
    <ManagerLayout title="Centre Staff" breadcrumb="Manager / Centre Staff">
      <ManagerStaff />
    </ManagerLayout>
  )
}
