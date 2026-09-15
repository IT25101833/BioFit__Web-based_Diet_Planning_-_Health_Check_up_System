import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import ProgressBar from '../../../components/ui/ProgressBar'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import Toast from '../../../components/ui/Toast'
import { formatNutritionDate } from '../clients/data/nutritionClientData'
import { duplicateMealPlan, fetchMealPlanById } from './data/mealPlanData'

export default function MealPlanDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dayTab, setDayTab] = useState('')
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchMealPlanById(id)
      setPlan(data)
      setDayTab(data.days?.[0]?.id || '')
    } catch {
      setError('We couldn’t load this meal plan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  if (loading) return <LoadingSkeleton rows={5} />
  if (error || !plan) {
    return <ErrorState title="We couldn’t load this meal plan." onRetry={load} />
  }

  const activeDay = plan.days?.find((day) => day.id === dayTab) || plan.days?.[0]

  return (
    <div>
      <PageHeader
        title={plan.name}
        description={`${plan.clientName} · ${formatNutritionDate(plan.startDate)} – ${formatNutritionDate(plan.endDate)}`}
        actions={
          <div className="flex flex-wrap gap-2.5">
            <StatusBadge status={plan.status} />
            <Button to={`/nutrition/meal-plans/${id}/edit`} variant="outline" className="!text-[#005a40]">
              Edit Plan
            </Button>
            <Button
              onClick={async () => {
                const copy = await duplicateMealPlan(id)
                setToast('Meal plan duplicated.')
                navigate(`/nutrition/meal-plans/${copy.id}/edit`)
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
        <Summary label="Plan duration" value={`${formatNutritionDate(plan.startDate)} – ${formatNutritionDate(plan.endDate)}`} />
        <Summary label="Last updated" value={formatNutritionDate(plan.lastUpdated)} />
        <Summary label="Review date" value={formatNutritionDate(plan.endDate)} />
        <Summary label="Participation" value={`${plan.progress}%`} />
      </div>

      <SectionCard className="mb-4" title="Plan summary">
        <ProgressBar value={plan.progress} label="Participation" />
        <p className="mt-3 text-sm text-[#4b5563]">{plan.description}</p>
        <p className="mt-2 text-sm font-semibold text-[#111827]">Goal: {plan.goal}</p>
      </SectionCard>

      <SectionCard title="Meal schedule" className="mb-4">
        {plan.days?.length ? (
          <>
            <FilterTabs
              ariaLabel="Meal plan days"
              value={dayTab || plan.days[0].id}
              onChange={setDayTab}
              options={plan.days.map((day) => ({ value: day.id, label: day.day }))}
            />
            <div className="mt-4 space-y-3">
              {activeDay?.meals?.map((meal) => (
                <div key={meal.id} className="rounded-2xl border border-[#eef2f0] px-4 py-3">
                  <p className="text-[11px] font-bold tracking-wide text-[#005a40] uppercase">
                    {meal.section}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#111827]">{meal.name}</p>
                  <p className="mt-1 text-sm text-[#4b5563]">{meal.description}</p>
                  {meal.portion ? (
                    <p className="mt-1 text-[12px] text-[#6b7280]">Portion: {meal.portion}</p>
                  ) : null}
                  {meal.alternatives ? (
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      Alternatives: {meal.alternatives}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-[#6b7280]">No meal days have been added yet.</p>
        )}
      </SectionCard>

      <SectionCard title="Plan history">
        <ul className="space-y-2">
          {(plan.history || []).map((item) => (
            <li
              key={item.version}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#f8faf9] px-4 py-3"
            >
              <span className="text-sm font-semibold text-[#111827]">
                Version {item.version} · {item.label}
              </span>
              <span className="text-[12px] text-[#6b7280]">
                Updated {formatNutritionDate(item.updated)}
              </span>
            </li>
          ))}
        </ul>
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
