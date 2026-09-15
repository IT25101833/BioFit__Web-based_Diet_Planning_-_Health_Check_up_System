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
import { fetchManagerEnrolments } from './data/enrolmentData'
import { formatManagerDate } from '../programmes/data/programmeManagementData'

export default function ManagerEnrolments() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [programme, setProgramme] = useState('')
  const [status, setStatus] = useState('')
  const [coach, setCoach] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await fetchManagerEnrolments())
    } catch {
      setError('We couldn’t load enrolments.')
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
        !item.programme.toLowerCase().includes(q)
      ) {
        return false
      }
      if (programme && item.programme !== programme) return false
      if (status && item.status !== status) return false
      if (coach && item.coach !== coach) return false
      return true
    })
  }, [items, search, programme, status, coach])

  const summary = useMemo(
    () => ({
      active: items.filter((i) => i.status === 'Active').length,
      newThisMonth: items.filter((i) => i.enrolledDate.startsWith('2026-09')).length,
      nearCapacity: 2,
      completed: items.filter((i) => i.status === 'Completed').length,
    }),
    [items],
  )

  const programmeOptions = [...new Set(items.map((i) => i.programme))].map((value) => ({
    value,
    label: value,
  }))
  const coachOptions = [...new Set(items.map((i) => i.coach))].map((value) => ({
    value,
    label: value,
  }))

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title="We couldn’t load enrolments." onRetry={load} />

  return (
    <div>
      <PageHeader
        title="Client Enrolments"
        description="View and manage client participation across BioFit wellness programmes."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Active Enrolments" value={summary.active} />
        <StatCard label="New This Month" value={summary.newThisMonth} />
        <StatCard label="Programmes Near Capacity" value={summary.nearCapacity} />
        <StatCard label="Completed Enrolments" value={summary.completed} />
      </div>

      <div className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 lg:grid-cols-4">
        <SearchBar
          className="lg:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search by client or programme…"
        />
        <Select
          value={programme}
          onChange={(e) => setProgramme(e.target.value)}
          options={programmeOptions}
          placeholder="Programme"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Withdrawn', label: 'Withdrawn' },
          ]}
          placeholder="Status"
        />
        <Select
          className="lg:col-span-2"
          value={coach}
          onChange={(e) => setCoach(e.target.value)}
          options={coachOptions}
          placeholder="Assigned coach"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No enrolments match your filters."
          description="Try clearing filters or searching with a different term."
        />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">Enrolled Date</th>
                  <th className="px-4 py-3">Programme Period</th>
                  <th className="px-4 py-3">Assigned Coach</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Status</th>
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
                    <td className="px-4 py-3.5 text-[#4b5563]">{item.programme}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {formatManagerDate(item.enrolledDate)}
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{item.period}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{item.coach}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{item.progress}%</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        items={[
                          {
                            label: 'View Programme',
                            onClick: () =>
                              navigate(`/manager/programmes/${item.programmeId}`),
                          },
                          {
                            label: 'Manage Enrolment',
                            onClick: () =>
                              navigate(`/manager/programmes/${item.programmeId}`),
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
