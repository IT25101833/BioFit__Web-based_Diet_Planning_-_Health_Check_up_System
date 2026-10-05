import { useEffect, useState } from 'react'
import { Leaf, Utensils } from 'lucide-react'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import { fetchClientMealPlan } from './data/nutritionData'

function hasAssignedPlan(plan) {
  if (!plan || typeof plan !== 'object') return false
  if (plan.assigned === false || plan.empty === true) return false
  return Boolean(plan.id || plan.name || (Array.isArray(plan.days) && plan.days.length > 0))
}

export default function ClientMealPlan({ plan: externalPlan, embedded = false }) {
  const [plan, setPlan] = useState(embedded ? externalPlan : null)
  const [loading, setLoading] = useState(!embedded)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setPlan(await fetchClientMealPlan())
    } catch {
      setError('We couldn’t load your meal plan right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (embedded) {
      setPlan(externalPlan)
      setLoading(false)
      return
    }
    load()
  }, [embedded, externalPlan])

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) {
    return <ErrorState title="We couldn’t load your meal plan right now." onRetry={load} />
  }
  if (!hasAssignedPlan(plan)) {
    return (
      <div>
        <PageHeader
          title={embedded ? 'Nutrition Plan' : 'My Meal Plan'}
          description={
            embedded
              ? 'Client nutrition plan, shown after the client approved access.'
              : 'A nourishing daily rhythm shaped with your nutrition consultant.'
          }
        />
        <EmptyState title="No meal plan has been assigned yet." />
      </div>
    )
  }

  const considerations = Array.isArray(plan.considerations) ? plan.considerations : []
  const days = Array.isArray(plan.days) ? plan.days : []

  return (
    <div>
      <PageHeader
        title={embedded ? 'Nutrition Plan' : 'My Meal Plan'}
        description={
          embedded
            ? 'Client nutrition plan, shown after the client approved access.'
            : 'A nourishing daily rhythm shaped with your nutrition consultant.'
        }
      />

      <SectionCard className="mb-4" icon={Utensils} title={plan.name || 'Meal plan'}>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium text-[#8b93a1]">Nutrition consultant</p>
            <p className="mt-1 font-semibold text-[#111827]">{plan.consultant || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#8b93a1]">Programme</p>
            <p className="mt-1 font-semibold text-[#111827]">{plan.programme || '—'}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="mb-4" icon={Leaf} title="Dietary considerations">
        {considerations.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No dietary restrictions recorded.</p>
        ) : (
          <ul className="space-y-2">
            {considerations.map((item) => (
              <li
                key={typeof item === 'string' ? item : item.id || item.name}
                className="rounded-xl bg-[#f8faf9] px-3 py-2.5 text-sm text-[#4b5563]"
              >
                {typeof item === 'string' ? item : item.name || item.label}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {days.length === 0 ? (
        <EmptyState title="No meals have been planned yet." />
      ) : (
        <div className="space-y-4">
          {days.map((day) => (
            <SectionCard key={day.id || day.label || day.day} title={day.label || day.day}>
              <div className="grid gap-3 md:grid-cols-2">
                {(day.meals || []).map((meal, idx) => (
                  <div
                    key={meal.id || `${day.id}-${meal.type || meal.section}-${idx}`}
                    className="rounded-2xl border border-[#eef2f0] px-4 py-3"
                  >
                    <p className="text-[11px] font-bold tracking-wide text-[#005a40] uppercase">
                      {meal.type || meal.section}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#111827]">
                      {meal.name}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#6b7280]">
                      {meal.description}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  )
}
