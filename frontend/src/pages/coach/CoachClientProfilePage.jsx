import CoachLayout from '../../components/layout/CoachLayout'
import ClientFitnessProfile from '../../features/coach/clients/ClientFitnessProfile'

export default function CoachClientProfilePage() {
  return (
    <CoachLayout title="Client Fitness Profile" breadcrumb="Fitness Coach / My Clients">
      <ClientFitnessProfile />
    </CoachLayout>
  )
}