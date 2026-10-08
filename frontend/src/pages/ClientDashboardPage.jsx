import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import CareRecommendationCard from '../components/dashboard/CareRecommendationCard'
import DashboardShell from '../components/dashboard/DashboardShell'
import MedicalReviewRequestCard from '../components/dashboard/MedicalReviewRequestCard'
import PlanAccessRequestCard from '../components/dashboard/PlanAccessRequestCard'
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
import { fetchClientPlanAccessRequests } from '../features/medical/plan-access/data/planAccessData'

export default function ClientDashboardPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [data, setData] = useState(null)
  const [planRequests, setPlanRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [dashboard, access] = await Promise.all([
        fetchClientDashboard(),
        fetchClientPlanAccessRequests().catch(() => []),
      ])
      setData(dashboard)
      setPlanRequests(Array.isArray(access) ? access : [])
    } catch {
      setError('We couldn’t load your dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [location.key])

  return (
    <DashboardShell title="Dashboard">
      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : error ? (
        <ErrorState title={error} onRetry={load} />
      ) : (
        <div className="space-y-8 lg:space-y-10">
          <WelcomeHero name={user?.firstName || data.greetingName || 'there'} />
          {data.pendingReview ? (
            <MedicalReviewRequestCard review={data.pendingReview} />
          ) : null}
          <CareRecommendationCard recommendation={data.recommendation} />
          <PlanAccessRequestCard requests={planRequests} />
          <SummaryMetrics cards={data.summary} />
          <ProgrammeAppointment
            programme={data.programme}
            appointment={data.appointment}
          />
          <TodaysWellnessPlan todayFocus={data.todayFocus} />
          <ProgressAndHealth progressItems={data.progress} healthItems={data.health} />
          <QuickActions />
          <UpcomingAndNotifications
            upcoming={data.upcoming}
            notifications={data.notifications}
          />
          <SupportCard />
        </div>
      )}
    </DashboardShell>
  )
}
