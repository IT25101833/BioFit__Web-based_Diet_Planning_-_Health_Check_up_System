import { useEffect, useMemo, useState } from 'react'
import { FileHeart } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import ActionMenu from '../../../components/ui/ActionMenu'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import SearchBar from '../../../components/ui/SearchBar'
import StatusBadge from '../../../components/ui/StatusBadge'
import Toast from '../../../components/ui/Toast'
import PrivacyBanner from '../shared/PrivacyBanner'
import {
  healthRecordHref,
  indexHealthRecordsByClient,
  readClientUserIdParam,
} from '../shared/medicalNav'
import { fetchHealthRecords, formatMedicalDate } from '../health-records/data/healthRecordData'
import MedicalHistoryFormModal from './components/MedicalHistoryFormModal'
import {
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

const categories = [
  { type: 'Condition', card: 'Condition', detail: 'Conditions' },
  { type: 'Allergy', card: 'Allergy', detail: 'Allergies' },
  { type: 'History', card: 'History', detail: 'Previous History' },
  { type: 'Other', card: 'Other', detail: 'Other' },
]

export default function MedicalHistory() {
  const [searchParams] = useSearchParams()
  const clientUserIdParam = readClientUserIdParam(searchParams)
  const [items, setItems] = useState([])
  const [clients, setClients] = useState([])
  const [recordIndex, setRecordIndex] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Active')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [detailKey, setDetailKey] = useState(null)
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [history, records, attendedClients] = await Promise.all([
        fetchMedicalHistory({
          status: tab === 'all' ? undefined : tab,
          clientUserId: clientUserIdParam || undefined,
        }),
        fetchHealthRecords().catch(() => []),
        fetchMedicalClients().catch(() => []),
      ])
      setItems(Array.isArray(history) ? history : [])
      setClients(Array.isArray(attendedClients) ? attendedClients : [])
      setRecordIndex(indexHealthRecordsByClient(records))
    } catch {
      setError('We couldn’t load medical history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [tab, clientUserIdParam])

  const groups = useMemo(() => {
    const grouped = groupHistory(items)
    if (tab === 'Inactive') return grouped
    const seen = new Set(grouped.map((group) => String(group.userId ?? '')))
    clients.forEach((client) => {
      const userId = client.userId ?? client.id
      if (userId == null || seen.has(String(userId))) return
      if (clientUserIdParam && String(userId) !== String(clientUserIdParam)) return
      const buckets = {}
      categories.forEach((category) => {
        buckets[category.type] = []
      })
      grouped.push({
        key: String(userId),
        userId,
        clientId: client.clientId || `BF-C${userId}`,
        clientName: client.name || client.clientName || 'Client',
        entries: [],
        buckets,
        recorded: '',
        statuses: [],
      })
    })
    return grouped.sort((a, b) => a.clientName.localeCompare(b.clientName))
  }, [items, clients, tab, clientUserIdParam])

  const visibleGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groups
    return groups.filter(
      (group) =>
        group.clientName.toLowerCase().includes(q) ||
        group.clientId.toLowerCase().includes(q) ||
        group.entries.some((item) => entrySearchText(item).includes(q)),
    )
  }, [groups, search])

  const detailGroup = visibleGroups.find((group) => group.key === detailKey) || null

  function clientRecordHref(group) {
    return healthRecordHref(recordIndex, {
      userId: group.userId,
      clientId: group.clientId,
    })
  }

  function openEdit(item) {
    setEditTarget(item)
    setFormOpen(true)
  }

  async function handleSave(payload) {
    if (!editTarget?.id) return
    await updateMedicalHistory(editTarget.id, payload)
    setToast('Medical history entry updated.')
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
      <p className="mb-3 text-[12px] text-[#8b93a1]">
        <Link to="/medical/dashboard" className="hover:text-[#005a40] hover:underline">
          Medical Advisor
        </Link>
        {' › Medical History'}
      </p>

      <PageHeader
        title="Medical History"
        description="Review client medical history recorded through their health records."
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

      {visibleGroups.length === 0 ? (
        <EmptyState
          icon={FileHeart}
          title="No medical history entries"
          description="Entries appear here after they are saved on the client’s health record."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {visibleGroups.map((group) => (
            <HistoryCard
              key={group.key}
              group={group}
              recordHref={clientRecordHref(group)}
              onView={() => setDetailKey(group.key)}
              onEdit={openEdit}
              onDeactivate={setDeactivateTarget}
            />
          ))}
        </div>
      )}

      <Modal
        open={Boolean(detailGroup)}
        onClose={() => setDetailKey(null)}
        title="Medical History"
        description={detailGroup ? `${detailGroup.clientName} · ${detailGroup.clientId}` : ''}
        size="lg"
        footer={
          <Button type="button" variant="outline" onClick={() => setDetailKey(null)}>
            Close
          </Button>
        }
      >
        {detailGroup ? (
          <HistoryDetails
            group={detailGroup}
            onEdit={openEdit}
            onDeactivate={setDeactivateTarget}
          />
        ) : null}
      </Modal>

      <MedicalHistoryFormModal
        open={formOpen}
        initial={editTarget}
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

function HistoryCard({ group, recordHref, onView, onEdit, onDeactivate }) {
  const activeEntries = group.entries.filter((item) => item.status === 'Active')
  const singleActive = activeEntries.length === 1 ? activeEntries[0] : null
  const lines = categories
    .map((category) => {
      const entries = group.buckets[category.type] || []
      if (entries.length === 0) return null
      return { label: category.card, value: compactValue(entries) }
    })
    .filter(Boolean)

  return (
    <article className="flex flex-col rounded-[1.25rem] border border-[#e8ecf1] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={recordHref} className="block truncate font-semibold text-[#005a40] hover:underline">
            {group.clientName}
          </Link>
          <p className="text-[12px] text-[#6b7280]">{group.clientId}</p>
        </div>
        <ActionMenu
          label={`Actions for ${group.clientName}`}
          items={[
            { label: 'View Details', onClick: onView },
            ...(singleActive
              ? [
                  { label: 'Edit', onClick: () => onEdit(singleActive) },
                  { label: 'Mark Inactive', onClick: () => onDeactivate(singleActive) },
                ]
              : []),
          ]}
        />
      </div>

      {lines.length === 0 ? (
        <p className="mt-2 text-sm text-[#6b7280]">None recorded</p>
      ) : (
        <dl className="mt-2 space-y-1">
          {lines.map((line) => (
            <div key={line.label} className="grid grid-cols-[5.5rem_1fr] gap-2 text-sm">
              <dt className="text-[#8b93a1]">{line.label}</dt>
              <dd className="truncate text-[#111827]">{line.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {group.statuses.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
          {group.recorded ? (
            <span className="text-[11px] text-[#8b93a1]">{formatMedicalDate(group.recorded)}</span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onView}
          className="shrink-0 text-sm font-semibold text-[#005a40] hover:underline"
        >
          View Details
        </button>
      </div>
    </article>
  )
}

function HistoryDetails({ group, onEdit, onDeactivate }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailField label="Patient" value={group.clientName} />
        <DetailField label="Client ID" value={group.clientId} />
        <DetailField label="Recorded" value={group.recorded ? formatLongDate(group.recorded) : '—'} />
        <div>
          <p className="text-[11px] font-medium text-[#8b93a1]">Status</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {group.statuses.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
        </div>
      </div>

      {categories.map((category) => {
        const entries = group.buckets[category.type] || []
        return (
          <section key={category.type}>
            <h3 className="text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
              {category.detail}
            </h3>
            {entries.length === 0 ? (
              <p className="mt-1 text-[#6b7280]">None recorded</p>
            ) : (
              <ul className="mt-1 space-y-2">
                {entries.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl bg-[#f8faf9] px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="whitespace-pre-wrap text-[#111827]">{entryLabel(item)}</p>
                      {item.status === 'Active' ? (
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            className="text-[12px] font-semibold text-[#005a40] hover:underline"
                            onClick={() => onEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-[12px] font-semibold text-[#b45309] hover:underline"
                            onClick={() => onDeactivate(item)}
                          >
                            Mark Inactive
                          </button>
                        </div>
                      ) : (
                        <StatusBadge status={item.status} />
                      )}
                    </div>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      {formatMedicalDate(item.recordedDate)}
                      {item.severity ? ` · ${item.severity}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#8b93a1]">{label}</p>
      <p className="mt-1 font-semibold text-[#111827]">{value || '—'}</p>
    </div>
  )
}

function groupHistory(items) {
  const map = new Map()
  items.forEach((item) => {
    const key = String(item.userId ?? item.clientId ?? item.clientName ?? item.id)
    if (!map.has(key)) {
      map.set(key, {
        key,
        userId: item.userId,
        clientId: item.clientId || '—',
        clientName: item.clientName || 'Client',
        entries: [],
      })
    }
    map.get(key).entries.push(item)
  })

  return Array.from(map.values())
    .map((group) => {
      const buckets = {}
      categories.forEach((category) => {
        buckets[category.type] = []
      })
      group.entries.forEach((item) => {
        const type = categories.some((category) => category.type === item.recordType)
          ? item.recordType
          : 'Other'
        buckets[type].push(item)
      })
      const dates = group.entries
        .map((item) => item.recordedDate)
        .filter(Boolean)
        .sort()
      const statuses = [...new Set(group.entries.map((item) => item.status).filter(Boolean))]
      return {
        ...group,
        buckets,
        recorded: dates.at(-1) || '',
        statuses: statuses.length ? statuses : ['Active'],
      }
    })
    .sort((a, b) => a.clientName.localeCompare(b.clientName))
}

function entryLabel(item) {
  const title = (item.conditionName || item.allergyInfo || '').trim()
  const description = (item.description || '').trim()
  if (description && description !== title) return description
  return title || description || 'Recorded entry'
}

function entrySearchText(item) {
  return [item.conditionName, item.allergyInfo, item.description, item.recordType, item.severity]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function compactValue(entries) {
  if (entries.length > 1) {
    return `${entries.length} entries`
  }
  return clip(entryLabel(entries[0]), 42)
}

function clip(text, max) {
  const value = String(text).replace(/\s+/g, ' ').trim()
  if (value.length <= max) return value
  return `${value.slice(0, max - 1).trim()}…`
}

function formatLongDate(value) {
  if (!value) return '—'
  const date = new Date(String(value).includes('T') ? value : `${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return formatMedicalDate(value)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
