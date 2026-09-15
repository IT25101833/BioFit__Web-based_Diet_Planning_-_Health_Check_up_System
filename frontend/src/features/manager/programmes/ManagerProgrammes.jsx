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
import Pagination from '../../../components/ui/Pagination'
import SearchBar from '../../../components/ui/SearchBar'
import Select from '../../../components/ui/Select'
import StatCard from '../../../components/ui/StatCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import Toast from '../../../components/ui/Toast'
import {
  deactivateManagerProgramme,
  fetchManagerProgrammes,
  formatManagerDate,
  programmeTypes,
  staffOptions,
} from './data/programmeManagementData'

const PAGE_SIZE = 6

export default function ManagerProgrammes() {
  const navigate = useNavigate()
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [coach, setCoach] = useState('')
  const [nutrition, setNutrition] = useState('')
  const [page, setPage] = useState(1)
  const [deactivateId, setDeactivateId] = useState('')
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setProgrammes(await fetchManagerProgrammes())
    } catch {
      setError('We couldn’t load programme information.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return programmes.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q)) return false
      if (status && item.status !== status) return false
      if (type && item.type !== type) return false
      if (coach && item.coachId !== coach) return false
      if (nutrition && item.nutritionId !== nutrition) return false
      return true
    })
  }, [programmes, search, status, type, coach, nutrition])

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const summary = useMemo(
    () => ({
      total: programmes.length,
      active: programmes.filter((p) => p.status === 'Active').length,
      upcoming: programmes.filter((p) => p.status === 'Upcoming').length,
      completed: programmes.filter((p) => p.status === 'Completed').length,
    }),
    [programmes],
  )

  function clearFilters() {
    setSearch('')
    setStatus('')
    setType('')
    setCoach('')
    setNutrition('')
    setPage(1)
  }

  async function confirmDeactivate() {
    await deactivateManagerProgramme(deactivateId)
    setDeactivateId('')
    setToast('Programme deactivated.')
    await load()
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) {
    return <ErrorState title="We couldn’t load programme information." onRetry={load} />
  }

  return (
    <div>
      <PageHeader
        title="Wellness Programmes"
        description="Create, organize and monitor wellness programmes offered by VitalLife Wellness."
        actions={
          <Button
            to="/manager/programmes/create"
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            <Plus className="h-4 w-4" />
            Create Programme
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Programmes" value={summary.total} />
        <StatCard label="Active" value={summary.active} />
        <StatCard label="Upcoming" value={summary.upcoming} />
        <StatCard label="Completed" value={summary.completed} />
      </div>

      <div className="mb-4 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="grid gap-3 lg:grid-cols-5">
          <SearchBar
            className="lg:col-span-2"
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Search programmes…"
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Upcoming', label: 'Upcoming' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            placeholder="Status"
          />
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              setPage(1)
            }}
            options={programmeTypes.map((item) => ({ value: item, label: item }))}
            placeholder="Programme type"
          />
          <Select
            value={coach}
            onChange={(e) => {
              setCoach(e.target.value)
              setPage(1)
            }}
            options={staffOptions.coaches}
            placeholder="Assigned coach"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Select
            className="w-full sm:w-64"
            value={nutrition}
            onChange={(e) => {
              setNutrition(e.target.value)
              setPage(1)
            }}
            options={staffOptions.nutrition}
            placeholder="Nutrition consultant"
          />
          <Button variant="outline" onClick={clearFilters} className="!text-[#4b5563]">
            Clear Filters
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No wellness programmes found."
          description="Try adjusting filters or create a new programme."
          actionLabel="Create Programme"
          actionTo="/manager/programmes/create"
        />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Enrolments</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Assigned Staff</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((programme) => (
                  <tr key={programme.id} className="border-t border-[#eef2f0]">
                    <td className="px-4 py-3.5 font-semibold text-[#111827]">
                      {programme.name}
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{programme.type}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {programme.durationWeeks} weeks
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{programme.enrolled}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{programme.capacity}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {[programme.coachName, programme.nutritionName]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {formatManagerDate(programme.startDate)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={programme.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        items={[
                          {
                            label: 'View',
                            onClick: () => navigate(`/manager/programmes/${programme.id}`),
                          },
                          {
                            label: 'Edit',
                            onClick: () =>
                              navigate(`/manager/programmes/${programme.id}/edit`),
                          },
                          {
                            label: 'Manage Enrolments',
                            onClick: () =>
                              navigate(`/manager/programmes/${programme.id}`),
                          },
                          {
                            label: 'Deactivate',
                            tone: 'danger',
                            disabled: programme.status === 'Inactive',
                            onClick: () => setDeactivateId(programme.id),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onChange={setPage}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deactivateId)}
        onClose={() => setDeactivateId('')}
        onConfirm={confirmDeactivate}
        title="Deactivate this programme?"
        description="Clients and historical programme information will remain available. This does not hard-delete operational history."
        confirmLabel="Deactivate"
        tone="danger"
      />

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
