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
import { fetchDietaryRestrictionsByClient } from '../dietary-restrictions/data/dietaryRestrictionData'
import { fetchNutritionClientById, formatNutritionDate } from './data/nutritionClientData'

export default function ClientNutritionProfile() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [restrictions, setRestrictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [c, r] = await Promise.all([
        fetchNutritionClientById(id),
        fetchDietaryRestrictionsByClient(id),
      ])
      setClient(c)
      setRestrictions(r)
    } catch {
      setError('We couldn’t load this client nutrition profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  if (loading) return <LoadingSkeleton rows={6} />
  if (error || !client) {
    return <ErrorState title="We couldn’t load this client nutrition profile." onRetry={load} />
  }

  return (
    <div>
      <p className="mb-3 text-[12px] text-[#8b93a1]">
        Nutrition Consultant / My Clients / {client.name}
      </p>
      <PageHeader
        title="Client Nutrition Profile"
        description={`${client.id} · ${client.programme}`}
        actions={
          <div className="flex flex-wrap gap-2.5">
            <Button to="/nutrition/meal-plans/create" className="!bg-[#005a40] !text-white hover:!bg-[#004833]">
              Create Meal Plan
            </Button>
            <Button to="/nutrition/dietary-restrictions" variant="outline" className="!text-[#005a40]">
              Review Dietary Restrictions
            </Button>
            <Button to={`/nutrition/progress/${client.id}`} variant="outline" className="!text-[#005a40]">
              Record Progress
            </Button>
          </div>
        }
      />

      <SectionCard className="mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={client.name} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-[#111827]">{client.name}</h2>
              <StatusBadge status={client.status} />
              <StatusBadge status={client.planStatus} />
            </div>
            <p className="mt-1 text-sm text-[#6b7280]">Nutrition consultant: Maya Fernando</p>
          </div>
        </div>
      </SectionCard>

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <SectionCard title="Nutrition goals">
          <ul className="space-y-2">
            {client.goals.map((goal) => (
              <li key={goal} className="rounded-xl bg-[#f8faf9] px-3 py-2 text-sm text-[#4b5563]">{goal}</li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Dietary preferences">
          <ul className="space-y-2">
            {client.preferences.map((item) => (
              <li key={item} className="text-sm text-[#4b5563]">{item}</li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Meal pattern">
          <p className="text-sm font-semibold text-[#111827]">{client.mealPattern}</p>
        </SectionCard>
      </div>

      <SectionCard className="mb-4" icon={ShieldAlert} title="Dietary Restrictions & Allergies">
        {restrictions.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No dietary restrictions found.</p>
        ) : (
          <div className="space-y-3">
            {restrictions.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#eef2f0] px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[#111827]">{item.name}</p>
                  <StatusBadge status={item.type} />
                  <StatusBadge status={item.status} />
                  {item.protected ? <StatusBadge status="Medical Allergy" /> : null}
                </div>
                <p className="mt-2 text-sm text-[#4b5563]">{item.mealPlanImpact}</p>
                {item.protected ? (
                  <p className="mt-2 text-[12px] font-semibold text-[#b45309]">Medical Record Source · read-only reference</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard className="mb-4" icon={ShieldAlert} title="Health & Nutrition Safety Guidance">
        <p className="text-sm leading-relaxed text-[#4b5563]">{client.guidance}</p>
        {client.reviewRequired ? (
          <p className="mt-3 rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm text-[#b45309]">
            Professional review recommended before significant dietary-plan changes.
          </p>
        ) : null}
      </SectionCard>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Current meal plan">
          {client.currentPlan ? (
            <>
              <p className="font-semibold text-[#111827]">{client.currentPlan.name}</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                {formatNutritionDate(client.currentPlan.startDate)} – {formatNutritionDate(client.currentPlan.endDate)}
              </p>
              <p className="mt-1 text-sm text-[#6b7280]">Week {client.currentPlan.currentWeek}</p>
              <div className="mt-3"><ProgressBar value={client.currentPlan.progress} /></div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={client.currentPlan.status} />
                <Button to={`/nutrition/meal-plans/${client.currentPlan.id}`} size="sm" variant="outline" className="!text-[#005a40]">View Plan</Button>
                <Button to={`/nutrition/meal-plans/${client.currentPlan.id}/edit`} size="sm" variant="outline" className="!text-[#005a40]">Edit Plan</Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#6b7280]">No active meal plan assigned yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Nutrition progress summary">
          <div className="space-y-4">
            {client.progressMetrics.map((metric) => (
              <ProgressBar key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent consultations">
        {client.consultations.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No consultations recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {client.consultations.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#eef2f0] px-4 py-3">
                <p className="text-sm font-semibold text-[#111827]">{item.type}</p>
                <p className="mt-1 text-[12px] text-[#6b7280]">
                  {formatNutritionDate(item.date)} · Next review {formatNutritionDate(item.nextReview)}
                </p>
                <p className="mt-2 text-sm text-[#4b5563]">{item.summary}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
