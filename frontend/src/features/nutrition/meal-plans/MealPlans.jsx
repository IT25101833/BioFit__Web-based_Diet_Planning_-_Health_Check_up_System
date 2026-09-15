import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ActionMenu from '../../../components/ui/ActionMenu'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SearchBar from '../../../components/ui/SearchBar'
import Select from '../../../components/ui/Select'
import StatCard from '../../../components/ui/StatCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import Toast from '../../../components/ui/Toast'
import { formatNutritionDate } from '../clients/data/nutritionClientData'
import {
  archiveMealPlan,
  duplicateMealPlan,
  fetchMealPlans,
} from './data/mealPlanData'

export default function MealPlans() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [archiveId, setArchiveId] = useState('')
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setPlans(await fetchMealPlans())
    } catch {
      setError('We couldn’t load your meal plans.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return plans.filter((plan) => {
      if (q && !plan.name.toLowerCase().includes(q) && !plan.clientName.toLowerCase().includes(q))
        return false
      if (status && plan.status !== status) return false
      return true
    })
  }, [plans, search, status])

  const summary = useMemo(
    () => ({
      active: plans.filter((p) => p.status === 'Active').length,
      draft: plans.filter((p) => p.status === 'Draft').length,
      review: plans.filter((p) => p.status === 'Review Due').length,
      completed: plans.filter((p) => p.status === 'Completed').length,
    }),
    [plans],
  )

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title="We couldn’t load your meal plans." onRetry={load} />

  return (
    <div>
      <PageHeader
        title="Meal Plans"
        description="Create and manage personalized meal plans for your assigned clients."
        actions={
          <Button to="/nutrition/meal-plans/create" className="!bg-[#005a40] !text-white hover:!bg-[#004833]">
            <Plus className="h-4 w-4" />
            Create Meal Plan
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Plans" value={summary.active} />
        <StatCard label="Draft Plans" value={summary.draft} />
        <StatCard label="Plans Requiring Review" value={summary.review} />
        <StatCard label="Completed Plans" value={summary.completed} />
      </div>

      <div className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 sm:grid-cols-3">
        <SearchBar className="sm:col-span-2" value={search} onChange={setSearch} placeholder="Search plan name or client…" />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'Draft', label: 'Draft' },
            { value: 'Active', label: 'Active' },
            { value: 'Review Due', label: 'Review Due' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Archived', label: 'Archived' },
          ]}
          placeholder="Status"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No meal plans have been created yet." actionLabel="Create Meal Plan" actionTo="/nutrition/meal-plans/create" />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Plan Name</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3">Current Week</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((plan) => (
                  <tr key={plan.id} className="border-t border-[#eef2f0]">
                    <td className="px-4 py-3.5 font-semibold text-[#111827]">{plan.name}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{plan.clientName}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{plan.programme}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{formatNutritionDate(plan.startDate)}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{formatNutritionDate(plan.endDate)}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">Week {plan.currentWeek}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{formatNutritionDate(plan.lastUpdated)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={plan.status} /></td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        items={[
                          { label: 'View', onClick: () => navigate(`/nutrition/meal-plans/${plan.id}`) },
                          { label: 'Edit', onClick: () => navigate(`/nutrition/meal-plans/${plan.id}/edit`) },
                          {
                            label: 'Duplicate',
                            onClick: async () => {
                              const copy = await duplicateMealPlan(plan.id)
                              setToast('Meal plan duplicated.')
                              navigate(`/nutrition/meal-plans/${copy.id}/edit`)
                            },
                          },
                          { label: 'Archive', tone: 'danger', onClick: () => setArchiveId(plan.id) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(archiveId)}
        onClose={() => setArchiveId('')}
        onConfirm={async () => {
          await archiveMealPlan(archiveId)
          setArchiveId('')
          setToast('Meal plan archived.')
          await load()
        }}
        title="Archive this meal plan?"
        description="Previous plan history remains available for reference."
        confirmLabel="Archive"
        tone="danger"
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
