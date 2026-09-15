import ManagerLayout from '../../components/layout/ManagerLayout'
import EditProgramme from '../../features/manager/programmes/EditProgramme'

export default function ManagerEditProgrammePage() {
  return (
    <ManagerLayout
      title="Edit Programme"
      breadcrumb="Manager / Wellness Programmes / Edit"
    >
      <EditProgramme />
    </ManagerLayout>
  )
}
