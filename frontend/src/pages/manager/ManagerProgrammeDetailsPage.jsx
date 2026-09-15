import ManagerLayout from '../../components/layout/ManagerLayout'
import ProgrammeDetails from '../../features/manager/programmes/ProgrammeDetails'

export default function ManagerProgrammeDetailsPage() {
  return (
    <ManagerLayout
      title="Programme Details"
      breadcrumb="Manager / Wellness Programmes / Details"
    >
      <ProgrammeDetails />
    </ManagerLayout>
  )
}
