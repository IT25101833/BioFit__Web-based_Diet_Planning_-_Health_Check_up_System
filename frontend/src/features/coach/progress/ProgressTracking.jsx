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
import { formatCoachDate } from '../clients/data/clientFitnessData'
import { fetchProgressRows } from './data/progressData'

export default function ProgressTracking() {
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
      setRows(await fetchProgressRows())
    } catch {
      setError('We couldn’t load progress tracking.')
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

  const summary = useMemo(() => {
    const recorded = rows.filter((r) => r.completion != null && r.completion !== '')
    return {
      clients: rows.length,
      recorded: recorded.length,
      avgCompletion: recorded.length
        ? Math.round(recorded.reduce((sum, r) => sum + Number(r.completion), 0) / recorded.length)
        : 0,
    }
  }, [rows])

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) {
    return <ErrorState title="We couldn’t load progress tracking." onRetry={load} />
  }

  return (
    <div>
      <PageHeader
        title="Fitness Progress Tracking"
        description="Monitor workout participation and fitness progress across your assigned clients."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clients" value={summary.clients} />
        <StatCard label="Progress recorded" value={summary.recorded} />
        <StatCard label="Average completion" value={summary.recorded ? `${summary.avgCompletion}%` : '—'} />
      </div>

      <div className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 sm:grid-cols-3">
        <SearchBar
          className="sm:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search clients…"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Draft', label: 'Draft' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Archived', label: 'Archived' },
          ]}
          placeholder="Progress status"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No progress records match your filters." />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Workout Plan</th>
                  <th className="px-4 py-3">Current Week</th>
                  <th className="px-4 py-3">Workout Completion</th>
                  <th className="px-4 py-3">Session Attendance</th>
                  <th className="px-4 py-3">Last Progress Update</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.clientId} className="border-t border-[#eef2f0]">
                    <td className="px-4 py-3.5 font-semibold text-[#111827]">
                      {row.clientName}
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{row.workoutPlan}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{row.currentWeek}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {row.completion == null || row.completion === '' ? '—' : `${row.completion}%`}
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {row.attendance == null || row.attendance === '' ? '—' : `${row.attendance}%`}
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {formatCoachDate(row.lastUpdate)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        items={[
                          {
                            label: 'View Progress',
                            onClick: () => navigate(`/coach/progress/${row.clientId}`),
                          },
                          {
                            label: 'Record Progress',
                            onClick: () => navigate(`/coach/progress/${row.clientId}`),
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
