import ManagerLayout from '../../components/layout/ManagerLayout'
import ManagerProgrammes from '../../features/manager/programmes/ManagerProgrammes'

export default function ManagerProgrammesPage() {
  return (
    <ManagerLayout title="Wellness Programmes" breadcrumb="Manager / Wellness Programmes">
      <ManagerProgrammes />
    </ManagerLayout>
  )
}
