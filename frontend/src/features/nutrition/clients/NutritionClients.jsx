import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ActionMenu from '../../../components/ui/ActionMenu'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SearchBar from '../../../components/ui/SearchBar'
import Select from '../../../components/ui/Select'
import StatCard from '../../../components/ui/StatCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchNutritionClients, formatNutritionDate } from './data/nutritionClientData'

export default function NutritionClients() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [programme, setProgramme] = useState('')
  const [planStatus, setPlanStatus] = useState('')
  const [dietaryStatus, setDietaryStatus] = useState('')
  const [reviewStatus, setReviewStatus] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setClients(await fetchNutritionClients())
    } catch {
      setError('We couldn’t load your nutrition clients.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clients.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false
      if (programme && c.programme !== programme) return false
      if (planStatus && c.planStatus !== planStatus) return false
      if (dietaryStatus && c.dietaryStatus !== dietaryStatus) return false
      if (reviewStatus && c.reviewStatus !== reviewStatus) return false
      return true
    })
  }, [clients, search, programme, planStatus, dietaryStatus, reviewStatus])

  const summary = useMemo(
    () => ({
      total: clients.length,
      activePlans: clients.filter((c) => c.planStatus === 'Active' || c.planStatus === 'Review Due').length,
      review: clients.filter((c) => c.reviewStatus === 'Review Due' || c.planStatus === 'Review Due').length,
      dietary: clients.filter((c) => c.dietaryStatus === 'Under Review' || c.dietaryStatus === 'Active').length,
    }),
    [clients],
  )

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title="We couldn’t load your nutrition clients." onRetry={load} />

  return (
    <div>
      <PageHeader
        title="My Nutrition Clients"
        description="View clients assigned to you for nutrition planning and follow-up."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Clients" value={summary.total} />
        <StatCard label="Active Meal Plans" value={summary.activePlans} />
        <StatCard label="Plans Requiring Review" value={summary.review} />
        <StatCard label="Dietary Updates" value={summary.dietary} />
      </div>

      <div className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 lg:grid-cols-5">
        <SearchBar className="lg:col-span-2" value={search} onChange={setSearch} placeholder="Search clients by name or ID…" />
        <Select value={programme} onChange={(e) => setProgramme(e.target.value)} options={[...new Set(clients.map((c) => c.programme))].map((v) => ({ value: v, label: v }))} placeholder="Programme" />
        <Select value={planStatus} onChange={(e) => setPlanStatus(e.target.value)} options={[{ value: 'Active', label: 'Active' }, { value: 'Review Due', label: 'Review Due' }, { value: 'Draft', label: 'Draft' }]} placeholder="Meal plan status" />
        <Select value={dietaryStatus} onChange={(e) => setDietaryStatus(e.target.value)} options={[{ value: 'Active', label: 'Active' }, { value: 'Under Review', label: 'Under Review' }]} placeholder="Dietary restriction status" />
        <Select className="lg:col-span-2" value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)} options={[{ value: 'On Track', label: 'On Track' }, { value: 'Review Due', label: 'Review Due' }, { value: 'Needs Follow-up', label: 'Needs Follow-up' }]} placeholder="Review status" />
        <Button variant="outline" className="!text-[#4b5563]" onClick={() => { setSearch(''); setProgramme(''); setPlanStatus(''); setDietaryStatus(''); setReviewStatus('') }}>Clear Filters</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="You don’t have any assigned nutrition clients yet." />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1080px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Client ID</th>
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">Current Meal Plan</th>
                  <th className="px-4 py-3">Plan Status</th>
                  <th className="px-4 py-3">Dietary Restrictions</th>
                  <th className="px-4 py-3">Last Review</th>
                  <th className="px-4 py-3">Next Consultation</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id} className="border-t border-[#eef2f0]">
                    <td className="px-4 py-3.5 font-semibold text-[#111827]">{client.name}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{client.id}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{client.programme}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{client.mealPlan}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={client.planStatus} /></td>
                    <td className="px-4 py-3.5"><StatusBadge status={client.dietaryStatus} /></td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{formatNutritionDate(client.lastReview)}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{formatNutritionDate(client.nextConsultation)}</td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        items={[
                          { label: 'View Nutrition Profile', onClick: () => navigate(`/nutrition/clients/${client.id}`) },
                          { label: 'View Meal Plan', disabled: !client.mealPlanId, onClick: () => navigate(`/nutrition/meal-plans/${client.mealPlanId}`) },
                          { label: 'Record Progress', onClick: () => navigate(`/nutrition/progress/${client.id}`) },
                          { label: 'Review Restrictions', onClick: () => navigate('/nutrition/dietary-restrictions') },
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
