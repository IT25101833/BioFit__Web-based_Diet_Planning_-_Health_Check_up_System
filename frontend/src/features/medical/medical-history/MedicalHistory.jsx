import { useEffect, useMemo, useState } from 'react'
import { FileHeart, Plus } from 'lucide-react'
import ActionMenu from '../../../components/ui/ActionMenu'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SearchBar from '../../../components/ui/SearchBar'
import StatusBadge from '../../../components/ui/StatusBadge'
import Toast from '../../../components/ui/Toast'
import PrivacyBanner from '../shared/PrivacyBanner'
import { formatMedicalDate } from '../health-records/data/healthRecordData'
import MedicalHistoryFormModal from './components/MedicalHistoryFormModal'
import {
  createMedicalHistory,
  deactivateMedicalHistory,
  fetchMedicalClients,
  fetchMedicalHistory,
  updateMedicalHistory,
} from './data/medicalHistoryData'

const tabs = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'all', label: 'All' },
]

export default function MedicalHistory() {
  const [items, setItems] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Active')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [history, clientList] = await Promise.all([
        fetchMedicalHistory({ status: tab === 'all' ? undefined : tab }),
        fetchMedicalClients(),
      ])
      setItems(history)
      setClients(clientList)
    } catch {
      setError('We couldn’t load medical history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [tab])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) =>
        item.clientName?.toLowerCase().includes(q) ||
        item.clientId?.toLowerCase().includes(q) ||
        item.conditionName?.toLowerCase().includes(q) ||
        item.allergyInfo?.toLowerCase().includes(q) ||
        item.recordType?.toLowerCase().includes(q),
    )
  }, [items, search])

  async function handleSave(payload) {
    if (editTarget?.id) {
      await updateMedicalHistory(editTarget.id, payload)
      setToast('Medical history entry updated.')
    } else {
      await createMedicalHistory(payload)
      setToast('Medical history entry created.')
    }
    await load()
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return
    await deactivateMedicalHistory(deactivateTarget.id)
    setDeactivateTarget(null)
    setToast('Record marked inactive (soft delete).')
    await load()
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title={error} onRetry={load} />

  return (
    <div>
      <PageHeader
        title="Medical History"
        description="Add, review, update, and deactivate client condition and allergy records."
        actions={
          <Button
            type="button"
            onClick={() => {
              setEditTarget(null)
              setFormOpen(true)
            }}
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            <Plus className="h-4 w-4" />
            Add Medical History
          </Button>
        }
      />

      <PrivacyBanner className="mb-5" />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs ariaLabel="History status" value={tab} onChange={setTab} options={tabs} />
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search client, condition, allergy…"
          className="sm:max-w-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileHeart}
          title="No medical history entries"
          description="Add a condition or allergy record for a client to get started."
        />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Recorded</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-[#eef2f0]">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-[#111827]">{item.clientName}</p>
                      <p className="text-[12px] text-[#6b7280]">{item.clientId}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{item.recordType}</td>
                    <td className="max-w-[280px] px-4 py-3.5 text-[#4b5563]">
                      <p className="font-medium text-[#111827]">
                        {item.conditionName || item.allergyInfo || '—'}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[12px]">{item.description}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {item.severity ? <StatusBadge status={item.severity} /> : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {formatMedicalDate(item.recordedDate)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        items={[
                          ...(item.status === 'Active'
                            ? [
                                {
                                  label: 'Edit',
                                  onClick: () => {
                                    setEditTarget(item)
                                    setFormOpen(true)
                                  },
                                },
                                {
                                  label: 'Mark Inactive',
                                  onClick: () => setDeactivateTarget(item),
                                },
                              ]
                            : []),
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

      <MedicalHistoryFormModal
        open={formOpen}
        initial={editTarget}
        clients={clients}
        onClose={() => {
          setFormOpen(false)
          setEditTarget(null)
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Mark record inactive?"
        description="This soft-deletes the medical history entry. The record stays in the database and can be reviewed under Inactive."
        confirmLabel="Mark Inactive"
        tone="danger"
      />

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
