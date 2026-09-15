import ManagerLayout from '../../components/layout/ManagerLayout'
import ManagerEnrolments from '../../features/manager/enrolments/ManagerEnrolments'

export default function ManagerEnrolmentsPage() {
  return (
    <ManagerLayout title="Enrolments" breadcrumb="Manager / Enrolments">
      <ManagerEnrolments />
    </ManagerLayout>
  )
}
