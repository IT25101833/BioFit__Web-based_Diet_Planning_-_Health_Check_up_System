import { useEffect, useState } from 'react'
import {
  CalendarDays,
  ChartColumn,
  ClipboardList,
  Plus,
  ShieldAlert,
  Users,
  Utensils,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import SectionCard from '../../../components/ui/SectionCard'
import StatCard from '../../../components/ui/StatCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchNutritionDashboard } from './data/nutritionDashboardData'
import { formatNutritionDate } from '../clients/data/nutritionClientData'

export default function NutritionDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setData(await fetchNutritionDashboard())
    } catch {
      setError('We couldn’t load your nutrition dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <LoadingSkeleton rows={6} />
  if (error || !data) {
    return (
      <div className="w-full">
        <ErrorState title="We couldn’t load your nutrition dashboard." onRetry={load} />
      </div>
    )
  }

  const stats = data.stats || {}
  const todaysAppointments = Array.isArray(data.todaysAppointments) ? data.todaysAppointments : []
  const mealPlanAttention = Array.isArray(data.mealPlanAttention) ? data.mealPlanAttention : []
  const dietaryUpdates = Array.isArray(data.dietaryUpdates) ? data.dietaryUpdates : []
  const progressTrend = Array.isArray(data.progressTrend) ? data.progressTrend : []
  const recentActivity = Array.isArray(data.recentActivity) ? data.recentActivity : []
  const max = Math.max(...progressTrend.map((i) => Number(i.value) || 0), 1)
  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const stat = (key) => stats[key] || { value: '—', hint: '' }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <p className="text-[12px] font-semibold tracking-wide text-[#005a40] uppercase">
          {todayLabel}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#111827] sm:text-[1.75rem]">
          Good morning, {data.greetingName}
        </h1>
        <p className="mt-1.5 text-sm text-[#6b7280]">
          Here’s an overview of your clients, meal plans and nutrition appointments today.
        </p>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Assigned Clients"
          value={stat('assignedClients').value}
          hint={stat('assignedClients').hint}
        />
        <StatCard
          icon={Utensils}
          label="Meal Plans Requiring Review"
          value={stat('plansRequiringReview').value}
          hint={stat('plansRequiringReview').hint}
        />
        <StatCard
          icon={CalendarDays}
          label="Today’s Appointments"
          value={stat('todaysAppointments').value}
          hint={stat('todaysAppointments').hint}
        />
        <StatCard
          icon={ShieldAlert}
          label="Dietary Updates"
          value={stat('dietaryUpdates').value}
          hint={stat('dietaryUpdates').hint}
        />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Today’s Appointments" className="lg:col-span-2">
          <div className="space-y-3">
            {todaysAppointments.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-[#eef2f0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    {item.time} · {item.client || item.clientName}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6b7280]">
                    {item.type || item.serviceType || item.service} · {item.programme || '—'} ·{' '}
                    {item.duration || '30 min'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={item.status} />
                  <Button
                    to={`/nutrition/clients/${item.clientId || 'BF-C1024'}`}
                    size="sm"
                    variant="outline"
                    className="!text-[#005a40]"
                  >
                    View Client
                  </Button>
                  <Button
                    to="/nutrition/appointments"
                    size="sm"
                    variant="outline"
                    className="!text-[#005a40]"
                  >
                    View Appointment
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Meal plans requiring attention">
          <ul className="space-y-3">
            {mealPlanAttention.map((item) => (
              <li key={item.id || item.planId} className="rounded-2xl bg-[#fff7ed] px-3 py-3">
                <p className="text-sm font-semibold text-[#111827]">
                  {item.client || item.clientName || item.name}
                </p>
                <p className="mt-1 text-[12px] text-[#b45309]">
                  {item.reason || 'Meal plan review due'}
                </p>
                <p className="mt-1 text-[11px] text-[#6b7280]">
                  {item.detail || item.currentWeek || item.goal || ''}
                </p>
                <Button
                  to={`/nutrition/meal-plans/${item.planId || item.id}`}
                  size="sm"
                  variant="outline"
                  className="mt-2 !text-[#005a40]"
                >
                  Review Plan
                </Button>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Recent dietary updates" className="lg:col-span-2">
          <div className="space-y-3">
            {dietaryUpdates.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-2xl border border-[#eef2f0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    {item.client || item.clientName}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6b7280]">
                    {item.update || item.name || 'Dietary preference updated'} ·{' '}
                    {formatNutritionDate(item.date || item.lastReviewed || item.dateRecorded)}
                  </p>
                </div>
                <Button
                  to={`/nutrition/clients/${item.clientId || 'BF-C1024'}`}
                  size="sm"
                  variant="outline"
                  className="!text-[#005a40]"
                >
                  View Client
                </Button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Client nutrition progress">
          <div className="flex h-44 items-end gap-2 pt-2">
            {progressTrend.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[#005a40]/85"
                  style={{ height: `${((Number(item.value) || 0) / max) * 100}%` }}
                />
                <span className="text-[11px] text-[#6b7280]">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-[#6b7280]">Weekly meal-plan participation %</p>
        </SectionCard>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Create Meal Plan', to: '/nutrition/meal-plans/create', icon: Plus },
          { label: 'Review Dietary Restrictions', to: '/nutrition/dietary-restrictions', icon: ShieldAlert },
          { label: 'Record Nutrition Progress', to: '/nutrition/progress', icon: ChartColumn },
          { label: 'View Clients', to: '/nutrition/clients', icon: ClipboardList },
        ].map(({ label, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex items-center gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#005a40]/25 hover:bg-[#e6f5f0]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
              <Icon className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <span className="text-sm font-semibold text-[#111827]">{label}</span>
          </Link>
        ))}
      </div>

      <SectionCard title="Recent client activity">
        <ul className="space-y-3">
          {recentActivity.map((item) => (
            <li
              key={item.id || item.text || item.title}
              className="flex flex-col gap-1 border-b border-[#eef2f0] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-[#374151]">{item.text || item.detail || item.title}</p>
              <p className="text-[12px] whitespace-nowrap text-[#8b93a1]">{item.at}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}
