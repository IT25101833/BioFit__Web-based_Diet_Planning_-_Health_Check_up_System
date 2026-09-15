import ManagerLayout from '../../components/layout/ManagerLayout'
import StaffScheduling from '../../features/manager/scheduling/StaffScheduling'

export default function ManagerStaffSchedulingPage() {
  return (
    <ManagerLayout title="Staff Scheduling" breadcrumb="Manager / Staff Scheduling">
      <StaffScheduling />
    </ManagerLayout>
  )
}
