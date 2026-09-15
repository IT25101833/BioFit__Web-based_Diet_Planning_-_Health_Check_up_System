import ManagerLayout from '../../components/layout/ManagerLayout'
import ManagerReports from '../../features/manager/reports/ManagerReports'

export default function ManagerReportsPage() {
  return (
    <ManagerLayout title="Reports" breadcrumb="Manager / Reports">
      <ManagerReports />
    </ManagerLayout>
  )
}
