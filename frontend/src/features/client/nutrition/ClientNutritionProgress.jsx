import { useEffect, useState } from 'react'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import ProgressBar from '../../../components/ui/ProgressBar'
import ProgressRing from '../../../components/ui/ProgressRing'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchClientNutritionProgress } from './data/nutritionData'

export default function ClientNutritionProgress() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setData(await fetchClientNutritionProgress())
    } catch {
      setError('We couldn’t load your nutrition progress right now.')
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
        title="We couldn’t load your nutrition progress right now."
        onRetry={load}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Nutrition Progress"
        description="Positive trends around consistency, not restriction."
        actions={<StatusBadge status={data.planStatus} />}
      />

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <SectionCard>
          <div className="flex justify-center py-2">
            <ProgressRing
              value={data.participation}
              label="Meal-plan participation"
            />
          </div>
        </SectionCard>

        <SectionCard title="Weekly consistency" className="lg:col-span-2">
          <div className="flex h-36 items-end gap-2 pt-2">
            {data.weeklyConsistency.map((day) => (
              <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[#0f766e]/80"
                  style={{ height: `${day.value}%` }}
                  title={`${day.label}: ${day.value}%`}
                />
                <span className="text-[11px] font-medium text-[#6b7280]">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Progress trends">
          <div className="space-y-4">
            {data.trends.map((item) => (
              <ProgressBar key={item.label} value={item.value} label={item.label} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent consultant reviews">
          <ul className="space-y-3">
            {data.reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-2xl border border-[#eef2f0] bg-[#f8faf9] px-4 py-3"
              >
                <p className="text-sm font-semibold text-[#111827]">{review.title}</p>
                <p className="mt-1 text-[12px] text-[#8b93a1]">
                  {new Date(`${review.date}T00:00:00`).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="mt-2 text-sm text-[#4b5563]">{review.note}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}
