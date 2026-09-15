import { useEffect, useState } from 'react'
import { Leaf, Utensils } from 'lucide-react'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import { fetchClientMealPlan } from './data/nutritionData'

export default function ClientMealPlan() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
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
    load()
  }, [])

  if (loading) return <LoadingSkeleton rows={4} />
  if (error || !plan) {
    return (
      <ErrorState
        title="We couldn’t load your meal plan right now."
        onRetry={load}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="My Meal Plan"
        description="A nourishing daily rhythm shaped with your nutrition consultant."
      />

      <SectionCard className="mb-4" icon={Utensils} title={plan.name}>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium text-[#8b93a1]">Nutrition consultant</p>
            <p className="mt-1 font-semibold text-[#111827]">{plan.consultant}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#8b93a1]">Programme</p>
            <p className="mt-1 font-semibold text-[#111827]">{plan.programme}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="mb-4" icon={Leaf} title="Dietary considerations">
        <ul className="space-y-2">
          {plan.considerations.map((item) => (
            <li
              key={item}
              className="rounded-xl bg-[#f8faf9] px-3 py-2.5 text-sm text-[#4b5563]"
            >
              {item}
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="space-y-4">
        {plan.days.map((day) => (
          <SectionCard key={day.id} title={day.label}>
            <div className="grid gap-3 md:grid-cols-2">
              {day.meals.map((meal) => (
                <div
                  key={`${day.id}-${meal.type}`}
                  className="rounded-2xl border border-[#eef2f0] px-4 py-3"
                >
                  <p className="text-[11px] font-bold tracking-wide text-[#005a40] uppercase">
                    {meal.type}
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
    </div>
  )
}
