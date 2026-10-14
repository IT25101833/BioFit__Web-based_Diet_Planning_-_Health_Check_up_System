import { useEffect, useState } from 'react'
import { Check, Dumbbell } from 'lucide-react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import ProgressBar from '../../../components/ui/ProgressBar'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { completeClientWorkoutSession, fetchClientWorkoutPlan } from './data/workoutData'

function hasAssignedPlan(plan) {
  if (!plan || typeof plan !== 'object') return false
  if (plan.assigned === false || plan.empty === true) return false
  return Boolean(plan.id || plan.name || scheduledWeeks(plan).length > 0)
}

function scheduledWeeks(plan) {
  if (Array.isArray(plan?.weeks) && plan.weeks.some((week) => Array.isArray(week?.days) && week.days.length > 0)) {
    return plan.weeks
  }
  if (Array.isArray(plan?.days) && plan.days.length > 0) {
    return [{ id: 'schedule', label: plan.weekLabel || 'Schedule', days: plan.days }]
  }
  return []
}

function formatPlanDate(iso) {
  if (!iso) return ''
  const date = new Date(`${String(iso).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return String(iso)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function shown(value, fallback = 'Not recorded') {
  if (value == null) return fallback
  const text = String(value).trim()
  return text ? text : fallback
}

function exerciseSummary(exercise) {
  const reps = exercise.reps || exercise.repetitions
  const rest = exercise.rest || (exercise.restSeconds ? `${exercise.restSeconds} sec` : '')
  return [
    exercise.sets && `${exercise.sets} sets`,
    reps && `${reps} reps`,
    exercise.duration,
    rest && (String(rest).toLowerCase().includes('rest') ? rest : `Rest ${rest}`),
  ]
    .filter(Boolean)
    .join(' · ')
}

export default function ClientWorkoutPlan({ plan: externalPlan, embedded = false }) {
  const [plan, setPlan] = useState(embedded ? externalPlan : null)
  const [loading, setLoading] = useState(!embedded)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState({})
  const [completingId, setCompletingId] = useState('')
  const [actionError, setActionError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setPlan(await fetchClientWorkoutPlan())
    } catch {
      setPlan(null)
      setError('We couldn’t load your workout plan right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (embedded) {
      setPlan(externalPlan)
      setLoading(false)
      setError('')
      return
    }
    load()
  }, [embedded, externalPlan])

  async function markCompleted(sessionId) {
    setCompletingId(sessionId)
    setActionError('')
    try {
      setPlan(await completeClientWorkoutSession(sessionId))
    } catch (err) {
      setActionError(err?.message || 'This session could not be marked completed.')
    } finally {
      setCompletingId('')
    }
  }

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) {
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
  if (!hasAssignedPlan(plan)) {
    return (
      <div>
        <PageHeader
          title={embedded ? 'Workout Plan' : 'My Workout Plan'}
          description={
            embedded
              ? 'Client workout plan, shown after the client approved access.'
              : 'A calm weekly movement rhythm designed with your coach.'
          }
        />
        <EmptyState title="No workout plan has been assigned yet." />
      </div>
    )
  }

  const weeks = scheduledWeeks(plan)
  const sessionCount = weeks.reduce((count, week) => count + (week.days?.length || 0), 0)
  const scheduledSessions = Number(plan.scheduledSessions ?? sessionCount)
  const completion = plan.completionPercent ?? plan.progress
  const dateRange = [formatPlanDate(plan.startDate), formatPlanDate(plan.endDate)].filter(Boolean).join(' – ')

  return (
    <div>
      <PageHeader
        title={embedded ? 'Workout Plan' : 'My Workout Plan'}
        description={
          embedded
            ? 'Client workout plan, shown after the client approved access.'
            : 'A calm weekly movement rhythm designed with your coach.'
        }
      />

      <SectionCard className="mb-4" icon={Dumbbell} title={plan.name || 'Workout plan'}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={plan.status || 'Active'} />
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <Meta label="Coach" value={shown(plan.coachName || plan.coach)} />
          <Meta label="Programme" value={shown(plan.programme, 'Not assigned')} />
          <Meta label="Dates" value={shown(dateRange)} />
          <Meta label="Difficulty" value={shown(plan.difficulty)} />
          <Meta label="Goal" value={shown(plan.goal)} />
          <Meta label="Sessions per week" value={shown(plan.sessionsPerWeek)} />
          <Meta label="Schedule" value={shown(plan.weekLabel || weeks[0]?.label)} />
          <Meta
            label="Sessions scheduled"
            value={scheduledSessions > 0 ? String(scheduledSessions) : 'None yet'}
          />
        </div>
        {plan.description ? (
          <p className="mt-4 text-sm leading-relaxed text-[#4b5563]">{plan.description}</p>
        ) : null}
        <div className="mt-5">
          {scheduledSessions === 0 || completion == null ? (
            <p className="text-sm text-[#6b7280]">Completion has not been recorded.</p>
          ) : (
            <ProgressBar value={Number(completion) || 0} label="Plan completion" />
          )}
        </div>
      </SectionCard>

      {actionError ? (
        <p className="mb-3 text-sm text-[#b45309]" role="alert">
          {actionError}
        </p>
      ) : null}

      {sessionCount === 0 ? (
        <EmptyState
          title="No workout sessions have been scheduled yet."
          description="Your coach has assigned this plan, but no weekly sessions are saved on it."
        />
      ) : (
        <div className="space-y-4">
          {weeks.map((week) => (
            <SectionCard key={week.id || week.label} title={week.label || `Week ${week.weekNumber || ''}`}>
              {(week.days || []).length === 0 ? (
                <p className="text-sm text-[#6b7280]">No sessions are scheduled in this week.</p>
              ) : (
                <div className="space-y-2">
                  {week.days.map((session, index) => {
                    const key = session.id || `${week.id}-${index}`
                    const open = expanded[key] ?? index === 0
                    const status = session.status || (session.completed ? 'COMPLETED' : 'SCHEDULED')
                    const canComplete =
                      !embedded && (status === 'SCHEDULED' || status === 'IN_PROGRESS')
                    return (
                      <div key={key} className="rounded-xl bg-[#f8faf9]">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                          onClick={() => setExpanded((prev) => ({ ...prev, [key]: !open }))}
                        >
                          <span className="text-sm font-semibold text-[#111827]">
                            {[session.day, session.sessionName || session.title || session.focus]
                              .filter(Boolean)
                              .join(' · ') || 'Session'}
                          </span>
                          <span className="flex items-center gap-2">
                            <StatusBadge status={status} />
                            <span className="text-[12px] text-[#005a40]">{open ? 'Hide' : 'Expand'}</span>
                          </span>
                        </button>
                        {open ? (
                          <div className="border-t border-[#eef2f0] px-4 py-3">
                            {(session.exercises || []).length === 0 ? (
                              <p className="text-sm text-[#6b7280]">
                                No exercises have been added to this session.
                              </p>
                            ) : (
                              <ul className="space-y-2.5">
                                {session.exercises.map((exercise, exerciseIndex) => (
                                  <li
                                    key={exercise.exerciseId || exercise.name || exerciseIndex}
                                    className="flex items-start gap-2.5 rounded-xl bg-white px-3 py-2.5"
                                  >
                                    <span
                                      className={[
                                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                                        status === 'COMPLETED'
                                          ? 'bg-[#005a40] text-white'
                                          : 'bg-white text-[#9ca3af] ring-1 ring-[#e8ecf1]',
                                      ].join(' ')}
                                    >
                                      {status === 'COMPLETED' ? (
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                      ) : null}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-[#111827]">
                                        {exercise.name || 'Exercise'}
                                      </p>
                                      <p className="text-[12px] text-[#6b7280]">
                                        {exercise.detail || exerciseSummary(exercise) || 'Details not recorded'}
                                      </p>
                                      {exercise.instructions || exercise.notes ? (
                                        <p className="mt-1 text-[12px] leading-relaxed text-[#4b5563]">
                                          {exercise.instructions || exercise.notes}
                                        </p>
                                      ) : null}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {canComplete && session.id ? (
                              <Button
                                type="button"
                                size="sm"
                                className="mt-3 !bg-[#005a40] !text-white"
                                disabled={completingId === session.id}
                                onClick={() => markCompleted(session.id)}
                              >
                                {completingId === session.id ? 'Saving…' : 'Mark completed'}
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
            </SectionCard>
          ))}
        </div>
      )}
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
