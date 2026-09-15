import { useEffect, useState } from 'react'
import { Check, Dumbbell } from 'lucide-react'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import ProgressBar from '../../../components/ui/ProgressBar'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchClientWorkoutPlan } from './data/workoutData'

export default function ClientWorkoutPlan() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setPlan(await fetchClientWorkoutPlan())
    } catch {
      setError('We couldn’t load your workout plan right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <LoadingSkeleton rows={4} />
  if (error || !plan) {
    return (
      <div className="w-full">
        <ErrorState
          title="We couldn’t load your workout plan right now."
          description="Please try again in a moment."
          onRetry={load}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="My Workout Plan"
        description="A calm weekly movement rhythm designed with your coach."
      />

      <SectionCard className="mb-4" icon={Dumbbell} title={plan.name}>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <Meta label="Coach" value={plan.coach} />
          <Meta label="Programme" value={plan.programme} />
          <Meta label="Schedule" value={plan.weekLabel} />
        </div>
        <div className="mt-5">
          <ProgressBar value={plan.completionPercent} label="Week completion" />
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2">
        {plan.days.map((day) => (
          <article
            key={day.id}
            className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-[#111827]">
                  {day.day}
                </h3>
                <p className="mt-0.5 text-[12px] text-[#6b7280]">{day.focus}</p>
              </div>
              <StatusBadge status={day.completed ? 'Completed' : 'Upcoming'} />
            </div>
            <ul className="space-y-2.5">
              {day.exercises.map((exercise) => (
                <li
                  key={exercise.name}
                  className="flex items-start gap-2.5 rounded-xl bg-[#f8faf9] px-3 py-2.5"
                >
                  <span
                    className={[
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                      exercise.completed
                        ? 'bg-[#005a40] text-white'
                        : 'bg-white text-[#9ca3af] ring-1 ring-[#e8ecf1]',
                    ].join(' ')}
                  >
                    {exercise.completed ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : null}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111827]">
                      {exercise.name}
                    </p>
                    <p className="text-[12px] text-[#6b7280]">{exercise.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#8b93a1]">{label}</p>
      <p className="mt-1 font-semibold text-[#111827]">{value}</p>
    </div>
  )
}
