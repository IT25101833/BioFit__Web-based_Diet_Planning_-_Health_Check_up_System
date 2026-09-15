import ManagerLayout from '../../components/layout/ManagerLayout'
import CreateProgramme from '../../features/manager/programmes/CreateProgramme'

export default function ManagerCreateProgrammePage() {
  return (
    <ManagerLayout
      title="Create Programme"
      breadcrumb="Manager / Wellness Programmes / Create"
    >
      <CreateProgramme />
    </ManagerLayout>
  )
}
