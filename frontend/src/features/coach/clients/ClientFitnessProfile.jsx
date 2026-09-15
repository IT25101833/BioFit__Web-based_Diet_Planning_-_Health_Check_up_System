import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useParams } from 'react-router-dom'
import Avatar from '../../../components/ui/Avatar'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import ProgressBar from '../../../components/ui/ProgressBar'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchCoachClientById, formatCoachDate } from './data/clientFitnessData'

export default function ClientFitnessProfile() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setClient(await fetchCoachClientById(id))
    } catch {
      setError('We couldn’t load this client fitness profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  if (loading) return <LoadingSkeleton rows={6} />
  if (error || !client) {
    return (
      <ErrorState title="We couldn’t load this client fitness profile." onRetry={load} />
    )
  }

  return (
    <div>
      <p className="mb-3 text-[12px] text-[#8b93a1]">
        Fitness Coach / My Clients / {client.name}
      </p>
      <PageHeader
        title="Client Fitness Profile"
        description={`${client.id} · ${client.programme}`}
        actions={
          <div className="flex flex-wrap gap-2.5">
            <Button
              to="/coach/workout-plans/create"
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Create Workout Plan
            </Button>
            <Button to="/coach/assessments/create" variant="outline" className="!text-[#005a40]">
              Record Assessment
            </Button>
            <Button to={`/coach/progress/${client.id}`} variant="outline" className="!text-[#005a40]">
              Record Progress
            </Button>
          </div>
        }
      />

      <SectionCard className="mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={client.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-[#111827]">{client.name}</h2>
              <StatusBadge status={client.status} />
            </div>
            <p className="mt-1 text-sm text-[#6b7280]">
              Age {client.age} · Assigned coach: Maya Fernando
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard title="Fitness goals">
          <ul className="space-y-2">
            {client.goals.map((goal) => (
              <li key={goal} className="rounded-xl bg-[#f8faf9] px-3 py-2 text-sm text-[#4b5563]">
                {goal}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Activity level">
          <p className="text-sm font-semibold text-[#111827]">{client.activityLevel}</p>
        </SectionCard>
        <SectionCard title="Fitness experience">
          <StatusBadge status={client.experience} />
        </SectionCard>
        <SectionCard title="Workout preferences">
          <ul className="space-y-2">
            {client.preferences.map((item) => (
              <li key={item} className="text-sm text-[#4b5563]">
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        className="mb-4"
        icon={ShieldAlert}
        title="Health & Safety Considerations"
        description="Only information needed for safe exercise planning is shown here."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <SafetyItem label="Medical Clearance" value={client.safety.medicalClearance} />
          <SafetyItem
            label="Exercise restrictions"
            value={
              client.safety.restrictions.length
                ? client.safety.restrictions.join('; ')
                : 'None noted for current plan'
            }
          />
          <SafetyItem
            label="Mobility notes"
            value={
              client.safety.mobilityNotes.length
                ? client.safety.mobilityNotes.join('; ')
                : 'None noted'
            }
          />
          <SafetyItem
            label="Professional review"
            value={client.safety.reviewRequired ? 'Review required before intensity changes' : 'Not required'}
          />
        </div>
        {client.safety.reviewRequired ? (
          <p className="mt-4 rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm text-[#b45309]">
            Medical review required before modifying this client’s exercise intensity.
          </p>
        ) : null}
      </SectionCard>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Current workout plan">
          {client.currentPlan ? (
            <>
              <p className="font-semibold text-[#111827]">{client.currentPlan.name}</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {formatCoachDate(client.currentPlan.startDate)} –{' '}
                {formatCoachDate(client.currentPlan.endDate)}
              </p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Week {client.currentPlan.currentWeek} of {client.currentPlan.totalWeeks}
              </p>
              <div className="mt-3">
                <ProgressBar
                  value={client.currentPlan.progress}
                  label={`${client.currentPlan.progress}% Complete`}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={client.currentPlan.status} />
                <Button
                  to={`/coach/workout-plans/${client.currentPlan.id}`}
                  size="sm"
                  variant="outline"
                  className="!text-[#005a40]"
                >
                  View Plan
                </Button>
                <Button
                  to={`/coach/workout-plans/${client.currentPlan.id}/edit`}
                  size="sm"
                  variant="outline"
                  className="!text-[#005a40]"
                >
                  Edit Plan
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#6b7280]">No active workout plan assigned yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Fitness progress">
          <div className="space-y-4">
            {client.progressMetrics.map((metric) => (
              <ProgressBar key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent assessments">
        {client.recentAssessments.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No assessments recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {client.recentAssessments.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-2xl border border-[#eef2f0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{item.type}</p>
                  <p className="mt-1 text-[12px] text-[#6b7280]">
                    {formatCoachDate(item.date)} · {item.recordedBy}
                  </p>
                  <p className="mt-1 text-sm text-[#4b5563]">{item.summary}</p>
                </div>
                <Button
                  to={`/coach/assessments/${item.id}`}
                  size="sm"
                  variant="outline"
                  className="!text-[#005a40]"
                >
                  View Assessment
                </Button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function SafetyItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#eef2f0] bg-[#f8faf9] px-4 py-3">
      <p className="text-[12px] font-medium text-[#8b93a1]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  )
}
