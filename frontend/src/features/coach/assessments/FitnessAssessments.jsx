import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
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
import { formatCoachDate } from '../clients/data/clientFitnessData'
import { fetchAssessments } from './data/assessmentData'

export default function FitnessAssessments() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await fetchAssessments())
    } catch {
      setError('We couldn’t load fitness assessments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (
        q &&
        !item.clientName.toLowerCase().includes(q) &&
        !item.clientId.toLowerCase().includes(q)
      )
        return false
      if (status && item.status !== status) return false
      return true
    })
  }, [items, search, status])

  const summary = useMemo(
    () => ({
      month: items.filter((i) => i.date.startsWith('2026-09')).length,
      due: items.filter((i) => i.status === 'Follow-up').length,
      completed: items.filter((i) => i.status === 'Completed').length,
      followups: items.filter((i) => i.reviewRequired).length,
    }),
    [items],
  )

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) {
    return <ErrorState title="We couldn’t load fitness assessments." onRetry={load} />
  }

  return (
    <div>
      <PageHeader
        title="Fitness Assessments"
        description="Record and review client fitness assessments to support safe and personalized fitness planning."
        actions={
          <Button
            to="/coach/assessments/create"
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            <Plus className="h-4 w-4" />
            New Assessment
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assessments This Month" value={summary.month} />
        <StatCard label="Assessments Due" value={summary.due} />
        <StatCard label="Completed" value={summary.completed} />
        <StatCard label="Follow-ups Required" value={summary.followups} />
      </div>

      <div className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 sm:grid-cols-3">
        <SearchBar
          className="sm:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search client name or ID…"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'Completed', label: 'Completed' },
            { value: 'Follow-up', label: 'Follow-up' },
          ]}
          placeholder="Assessment status"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No fitness assessments found."
          actionLabel="New Assessment"
          actionTo="/coach/assessments/create"
        />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Assessment Date</th>
                  <th className="px-4 py-3">Assessment Type</th>
                  <th className="px-4 py-3">Coach</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Next Assessment</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-[#eef2f0]">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-[#111827]">{item.clientName}</p>
                      <p className="text-[12px] text-[#8b93a1]">{item.clientId}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {formatCoachDate(item.date)}
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{item.type}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{item.coach}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {formatCoachDate(item.nextAssessment)}
                    </td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        items={[
                          {
                            label: 'View',
                            onClick: () => navigate(`/coach/assessments/${item.id}`),
                          },
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
