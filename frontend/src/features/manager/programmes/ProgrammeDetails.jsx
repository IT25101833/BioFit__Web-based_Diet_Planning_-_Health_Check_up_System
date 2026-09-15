import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Avatar from '../../../components/ui/Avatar'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import ProgressBar from '../../../components/ui/ProgressBar'
import SearchBar from '../../../components/ui/SearchBar'
import SectionCard from '../../../components/ui/SectionCard'
import StatCard from '../../../components/ui/StatCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import Toast from '../../../components/ui/Toast'
import {
  addProgrammeEnrolment,
  fetchEligibleClients,
  fetchManagerProgrammeById,
  formatManagerDate,
  removeProgrammeEnrolment,
} from './data/programmeManagementData'

export default function ProgrammeDetails() {
  const { id } = useParams()
  const [programme, setProgramme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [eligible, setEligible] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [removeId, setRemoveId] = useState('')
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setProgramme(await fetchManagerProgrammeById(id))
    } catch {
      setError('We couldn’t load programme information.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const enrolments = useMemo(() => {
    const list = programme?.enrolments || []
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (item) =>
        item.clientName.toLowerCase().includes(q) ||
        item.clientId.toLowerCase().includes(q),
    )
  }, [programme, search])

  async function openAdd() {
    setAddOpen(true)
    setSelectedClient(null)
    setEligible(await fetchEligibleClients())
  }

  async function handleAdd() {
    if (!selectedClient) return
    await addProgrammeEnrolment(id, selectedClient)
    setAddOpen(false)
    setToast('Client added to programme.')
    await load()
  }

  async function handleRemove() {
    await removeProgrammeEnrolment(id, removeId)
    setRemoveId('')
    setToast('Client removed from programme.')
    await load()
  }

  if (loading) return <LoadingSkeleton rows={6} />
  if (error || !programme) {
    return (
      <ErrorState title="We couldn’t load programme information." onRetry={load} />
    )
  }

  const remainingWeeks = Math.max(
    0,
    programme.durationWeeks - Math.round((programme.progress / 100) * programme.durationWeeks),
  )

  return (
    <div>
      <p className="mb-3 text-[12px] text-[#8b93a1]">
        Manager / Wellness Programmes / {programme.name}
      </p>
      <PageHeader
        title={programme.name}
        description={`${programme.type} · ${formatManagerDate(programme.startDate)} – ${formatManagerDate(programme.endDate)}`}
        actions={
          <div className="flex flex-wrap gap-2.5">
            <StatusBadge status={programme.status} />
            <Button
              to={`/manager/programmes/${id}/edit`}
              variant="outline"
              className="!border-[#005a40]/25 !text-[#005a40]"
            >
              Edit Programme
            </Button>
            <Button
              onClick={openAdd}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Manage Enrolments
            </Button>
          </div>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enrolled Clients" value={programme.enrolled} />
        <StatCard label="Capacity" value={programme.capacity} />
        <StatCard label="Programme Progress" value={`${programme.progress}%`} />
        <StatCard label="Remaining Duration" value={`${remainingWeeks} wks`} />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Programme information" className="lg:col-span-2">
          <Info label="Description" value={programme.description} />
          <Info label="Goals" value={programme.goals || '—'} />
          <Info label="Included services" value={programme.includedServices || '—'} />
          <Info
            label="Schedule"
            value={`${formatManagerDate(programme.startDate)} – ${formatManagerDate(programme.endDate)} (${programme.durationWeeks} weeks)`}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[12px] font-medium text-[#8b93a1]">Status</p>
            <StatusBadge status={programme.status} />
          </div>
        </SectionCard>

        <SectionCard title="Assigned professionals">
          <ProfessionalCard role="Fitness Coach" name={programme.coachName} />
          <ProfessionalCard role="Nutrition Consultant" name={programme.nutritionName} />
          {programme.medicalName ? (
            <ProfessionalCard role="Medical Advisor" name={programme.medicalName} />
          ) : null}
        </SectionCard>
      </div>

      <SectionCard
        title="Enrolment capacity"
        className="mb-5"
        actions={
          <Button
            onClick={openAdd}
            size="sm"
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            + Add Client
          </Button>
        }
      >
        <ProgressBar
          value={Math.round((programme.enrolled / programme.capacity) * 100)}
          label={`${programme.enrolled} of ${programme.capacity} clients enrolled`}
        />
      </SectionCard>

      <SectionCard title="Enrolled clients">
        <SearchBar
          className="mb-4 max-w-md"
          value={search}
          onChange={setSearch}
          placeholder="Search enrolled clients…"
        />
        {enrolments.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No enrolments match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-left text-sm">
              <thead className="text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Client ID</th>
                  <th className="py-2 pr-3">Enrolled Date</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Progress</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrolments.map((item) => (
                  <tr key={item.id} className="border-t border-[#eef2f0]">
                    <td className="py-3 pr-3 font-semibold text-[#111827]">
                      {item.clientName}
                    </td>
                    <td className="py-3 pr-3 text-[#4b5563]">{item.clientId}</td>
                    <td className="py-3 pr-3 text-[#4b5563]">
                      {formatManagerDate(item.enrolledDate)}
                    </td>
                    <td className="py-3 pr-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 pr-3 text-[#4b5563]">{item.progress}%</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="!text-[#005a40]">
                          View Progress
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setRemoveId(item.id)}
                          className="!bg-[#fff7ed] !text-[#b45309]"
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add client to programme"
        description="Search eligible clients and add them to this programme."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selectedClient}
              onClick={handleAdd}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Add to Programme
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          {eligible.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => setSelectedClient(client)}
              className={[
                'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left',
                selectedClient?.id === client.id
                  ? 'border-[#005a40] bg-[#e6f5f0]'
                  : 'border-[#e8ecf1] hover:bg-[#f8faf9]',
              ].join(' ')}
            >
              <span>
                <span className="block text-sm font-semibold text-[#111827]">
                  {client.name}
                </span>
                <span className="block text-[12px] text-[#6b7280]">{client.id}</span>
              </span>
              <StatusBadge status={client.status === 'Eligible' ? 'Active' : 'Pending'} />
            </button>
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(removeId)}
        onClose={() => setRemoveId('')}
        onConfirm={handleRemove}
        title="Remove from programme?"
        description="This removes the programme enrolment only. The client account remains available."
        confirmLabel="Remove enrolment"
        tone="danger"
      />

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="border-b border-[#eef2f0] py-3 last:border-0">
      <p className="text-[12px] font-medium text-[#8b93a1]">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-[#374151]">{value}</p>
    </div>
  )
}

function ProfessionalCard({ role, name }) {
  if (!name) return null
  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-[#eef2f0] bg-[#f8faf9] px-3 py-3 last:mb-0">
      <Avatar name={name} size="sm" />
      <div>
        <p className="text-[11px] font-semibold tracking-wide text-[#8b93a1] uppercase">
          {role}
        </p>
        <p className="text-sm font-semibold text-[#111827]">{name}</p>
      </div>
    </div>
  )
}
