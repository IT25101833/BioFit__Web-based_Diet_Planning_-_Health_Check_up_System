import { useEffect, useState } from 'react'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import ProgressBar from '../../../components/ui/ProgressBar'
import ProgressRing from '../../../components/ui/ProgressRing'
import SectionCard from '../../../components/ui/SectionCard'
import { fetchClientFitnessProgress } from './data/workoutData'

export default function ClientFitnessProgress() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setData(await fetchClientFitnessProgress())
    } catch {
      setError('We couldn’t load your fitness progress right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <LoadingSkeleton rows={3} />
  if (error || !data) {
    return (
      <ErrorState
        title="We couldn’t load your fitness progress right now."
        onRetry={load}
      />
    )
  }

  const maxMonthly = Math.max(...data.monthly.map((m) => m.value), 1)

  return (
    <div>
      <PageHeader
        title="Fitness Progress"
        description="A gentle view of how consistently you are showing up for movement."
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <SectionCard>
          <div className="flex justify-center py-2">
            <ProgressRing value={data.participation} label="Participation" />
          </div>
        </SectionCard>
        <SectionCard title="Completed sessions">
          <p className="font-display text-3xl font-bold text-[#005a40]">
            {data.completedSessions}
            <span className="text-base font-semibold text-[#8b93a1]">
              {' '}
              / {data.plannedSessions}
            </span>
          </p>
          <p className="mt-2 text-sm text-[#6b7280]">
            Sessions completed in your current programme.
          </p>
        </SectionCard>
        <SectionCard title="Programme progress">
          <ProgressBar value={data.programmeProgress} />
          <p className="mt-3 text-sm text-[#6b7280]">
            Steady progress across your wellness pathway.
          </p>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Monthly progress">
          <div className="flex h-44 items-end gap-3 pt-4">
            {data.monthly.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-[#005a40]/85"
                  style={{ height: `${(item.value / maxMonthly) * 100}%` }}
                  title={`${item.label}: ${item.value}%`}
                />
                <span className="text-[11px] font-medium text-[#6b7280]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent fitness assessments">
          <ul className="space-y-3">
            {data.assessments.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-[#eef2f0] bg-[#f8faf9] px-4 py-3"
              >
                <p className="text-sm font-semibold text-[#111827]">{item.type}</p>
                <p className="mt-1 text-[12px] text-[#8b93a1]">
                  {new Date(`${item.date}T00:00:00`).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="mt-2 text-sm text-[#4b5563]">{item.summary}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}
