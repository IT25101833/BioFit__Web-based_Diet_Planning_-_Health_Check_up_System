import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchClientHealthAlerts } from './data/healthData'

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ClientHealthAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setAlerts(await fetchClientHealthAlerts())
    } catch {
      setError('We couldn’t load your health alerts right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <LoadingSkeleton rows={3} />
  if (error) {
    return (
      <ErrorState
        title="We couldn’t load your health alerts right now."
        onRetry={load}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Health Risk Alerts"
        description="Clear, calm guidance shared with you by your care team."
      />

      {alerts.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No health alerts"
          description="When your care team shares a client-facing alert, it will appear here."
        />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-[#111827]">
                  {alert.title}
                </h2>
                <StatusBadge status={alert.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-[#8b93a1]">
                <span>Raised {formatDate(alert.dateRaised)}</span>
                <span>Follow-up {formatDate(alert.followUpDate)}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#4b5563]">
                {alert.guidance}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
