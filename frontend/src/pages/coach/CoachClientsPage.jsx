import CoachLayout from '../../components/layout/CoachLayout'
import CoachClients from '../../features/coach/clients/CoachClients'

export default function CoachClientsPage() {
  return (
    <CoachLayout title="My Clients" breadcrumb="Fitness Coach / My Clients">
      <CoachClients />
    </CoachLayout>
  )
}