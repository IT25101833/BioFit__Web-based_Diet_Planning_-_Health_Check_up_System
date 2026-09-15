import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ActionMenu from '../../../components/ui/ActionMenu'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SearchBar from '../../../components/ui/SearchBar'
import Select from '../../../components/ui/Select'
import StatCard from '../../../components/ui/StatCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { formatNutritionDate } from '../clients/data/nutritionClientData'
import { fetchNutritionProgressRows } from './data/nutritionProgressData'

export default function NutritionProgress() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setRows(await fetchNutritionProgressRows())
    } catch {
      setError('We couldn’t load nutrition progress.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (q && !row.clientName.toLowerCase().includes(q)) return false
      if (status && row.status !== status) return false
      return true
    })
  }, [rows, search, status])

  const summary = useMemo(
    () => ({
      onTrack: rows.filter((r) => r.status === 'On Track').length,
      reviewDue: rows.filter((r) => r.status === 'Review Due' || r.status === 'Needs Follow-up').length,
      activePlans: rows.length,
      consultations: 4,
    }),
    [rows],
  )

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) return <ErrorState title="We couldn’t load nutrition progress." onRetry={load} />

  return (
    <div>
      <PageHeader
        title="Nutrition Progress"
        description="Monitor meal-plan participation and nutrition follow-up across your assigned clients."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clients On Track" value={summary.onTrack} />
        <StatCard label="Reviews Due" value={summary.reviewDue} />
        <StatCard label="Active Meal Plans" value={summary.activePlans} />
        <StatCard label="Consultations This Week" value={summary.consultations} />
      </div>

      <div className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 sm:grid-cols-3">
        <SearchBar className="sm:col-span-2" value={search} onChange={setSearch} placeholder="Search clients…" />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'On Track', label: 'On Track' },
            { value: 'Review Due', label: 'Review Due' },
            { value: 'Needs Follow-up', label: 'Needs Follow-up' },
            { value: 'Plan Completed', label: 'Plan Completed' },
          ]}
          placeholder="Progress status"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No nutrition progress updates are available yet." />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Meal Plan</th>
                  <th className="px-4 py-3">Current Week</th>
                  <th className="px-4 py-3">Participation</th>
                  <th className="px-4 py-3">Last Progress Update</th>
                  <th className="px-4 py-3">Last Consultation</th>
                  <th className="px-4 py-3">Next Review</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.clientId} className="border-t border-[#eef2f0]">
                    <td className="px-4 py-3.5 font-semibold text-[#111827]">{row.clientName}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{row.mealPlan}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{row.currentWeek}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{row.participation}%</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{formatNutritionDate(row.lastUpdate)}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{formatNutritionDate(row.lastConsultation)}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{formatNutritionDate(row.nextReview)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        items={[
                          { label: 'View Progress', onClick: () => navigate(`/nutrition/progress/${row.clientId}`) },
                          { label: 'Record Progress', onClick: () => navigate(`/nutrition/progress/${row.clientId}`) },
                          { label: 'Review Meal Plan', onClick: () => navigate(`/nutrition/meal-plans/${row.mealPlanId}`) },
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
    </div>
  )
}
