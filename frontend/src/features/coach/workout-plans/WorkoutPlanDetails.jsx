import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import ProgressBar from '../../../components/ui/ProgressBar'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import Toast from '../../../components/ui/Toast'
import { formatCoachDate } from '../clients/data/clientFitnessData'
import { duplicateWorkoutPlan, fetchWorkoutPlanById } from './data/workoutPlanData'

export default function WorkoutPlanDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState({})
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setPlan(await fetchWorkoutPlanById(id))
    } catch {
      setError('We couldn’t load this workout plan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  if (loading) return <LoadingSkeleton rows={5} />
  if (error || !plan) {
    return <ErrorState title="We couldn’t load this workout plan." onRetry={load} />
  }

  return (
    <div>
      <PageHeader
        title={plan.name}
        description={`${plan.clientName} · ${formatCoachDate(plan.startDate)} – ${formatCoachDate(plan.endDate)}`}
        actions={
          <div className="flex flex-wrap gap-2.5">
            <StatusBadge status={plan.status} />
            <Button
              to={`/coach/workout-plans/${id}/edit`}
              variant="outline"
              className="!text-[#005a40]"
            >
              Edit Plan
            </Button>
            <Button
              onClick={async () => {
                const copy = await duplicateWorkoutPlan(id)
                setToast('Plan duplicated.')
                navigate(`/coach/workout-plans/${copy.id}/edit`)
              }}
              className="!bg-[#005a40] !text-white"
            >
              Duplicate Plan
            </Button>
          </div>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Summary label="Current week" value={`Week ${plan.currentWeek}`} />
        <Summary label="Completion" value={`${plan.progress}%`} />
        <Summary label="Sessions / week" value={plan.sessionsPerWeek} />
        <Summary label="Difficulty" value={plan.difficulty} />
        <Summary label="Goal" value={plan.goal} />
      </div>

      <SectionCard title="Plan summary" className="mb-4">
        <ProgressBar value={plan.progress} label="Overall completion" />
        <p className="mt-3 text-sm text-[#4b5563]">{plan.description}</p>
      </SectionCard>

      <SectionCard title="Workout schedule">
        {plan.weeks?.length ? (
          <div className="space-y-3">
            {plan.weeks.map((week) => (
              <div key={week.id} className="rounded-2xl border border-[#eef2f0] p-4">
                <h3 className="font-display text-base font-bold text-[#111827]">{week.label}</h3>
                <div className="mt-3 space-y-2">
                  {week.days.map((day) => {
                    const key = `${week.id}-${day.id}`
                    const open = expanded[key]
                    return (
                      <div key={day.id} className="rounded-xl bg-[#f8faf9]">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between px-4 py-3 text-left"
                          onClick={() =>
                            setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
                          }
                        >
                          <span className="text-sm font-semibold text-[#111827]">
                            {day.day} · {day.title}
                          </span>
                          <span className="text-[12px] text-[#005a40]">
                            {open ? 'Hide' : 'Expand'}
                          </span>
                        </button>
                        {open ? (
                          <ul className="space-y-2 border-t border-[#eef2f0] px-4 py-3">
                            {day.exercises.map((ex, index) => (
                              <li key={`${ex.exerciseId}-${index}`} className="text-sm text-[#4b5563]">
                                <span className="font-semibold text-[#111827]">{ex.name}</span>
                                {' · '}
                                {[
                                  ex.sets && `${ex.sets} sets`,
                                  ex.reps && `${ex.reps} reps`,
                                  ex.duration,
                                  ex.rest && `Rest ${ex.rest}`,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6b7280]">No schedule days added yet.</p>
        )}
      </SectionCard>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}

function Summary({ label, value }) {
  return (
    <div className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <p className="text-[12px] text-[#8b93a1]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  )
}
