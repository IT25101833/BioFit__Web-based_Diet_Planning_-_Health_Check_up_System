import { useEffect, useState } from 'react'
import DashboardShell from '../components/dashboard/DashboardShell'
import ProgrammeAppointment from '../components/dashboard/ProgrammeAppointment'
import ProgressAndHealth from '../components/dashboard/ProgressAndHealth'
import QuickActions from '../components/dashboard/QuickActions'
import SummaryMetrics from '../components/dashboard/SummaryMetrics'
import SupportCard from '../components/dashboard/SupportCard'
import TodaysWellnessPlan from '../components/dashboard/TodaysWellnessPlan'
import UpcomingAndNotifications from '../components/dashboard/UpcomingAndNotifications'
import WelcomeHero from '../components/dashboard/WelcomeHero'
import ErrorState from '../components/ui/ErrorState'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import { useAuth } from '../auth/AuthContext'
import { fetchClientDashboard } from '../features/client/dashboard/data/clientDashboardData'

export default function ClientDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setData(await fetchClientDashboard())
    } catch {
      setError('We couldn’t load your dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <DashboardShell title="Dashboard">
      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState title={error} onRetry={load} />
      ) : (
        <div className="space-y-8 lg:space-y-10">
          <WelcomeHero name={user?.firstName || data.greetingName || 'there'} />
          <SummaryMetrics cards={data.summary} />
          <ProgrammeAppointment />
          <TodaysWellnessPlan />
          <ProgressAndHealth progressItems={data.progress} healthItems={data.health} />
          <QuickActions />
          <UpcomingAndNotifications />
          <SupportCard />
        </div>
      )}
    </DashboardShell>
  )
}
