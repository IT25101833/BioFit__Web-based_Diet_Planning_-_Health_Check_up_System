import { useEffect, useMemo, useState } from 'react'
import ActionMenu from '../../components/ui/ActionMenu'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'
import PageHeader from '../../components/ui/PageHeader'
import SearchBar from '../../components/ui/SearchBar'
import Select from '../../components/ui/Select'
import StatusBadge from '../../components/ui/StatusBadge'
import Toast from '../../components/ui/Toast'
import { localTodayIso } from '../booking/bookingEngine'
import {
  canHardDeleteAdminAppointment,
  fetchAdminAppointments,
  hardDeleteAdminAppointment,
} from './data/adminData'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminAppointments() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [deleteId, setDeleteId] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const today = localTodayIso()

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await fetchAdminAppointments())
    } catch (err) {
      setError(err?.message || 'We couldn’t load appointments.')
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
        !String(item.clientName || item.client || '').toLowerCase().includes(q) &&
        !String(item.service || item.serviceType || '').toLowerCase().includes(q) &&
        !String(item.professional || '').toLowerCase().includes(q) &&
        !String(item.bookingReference || '').toLowerCase().includes(q)
      ) {
        return false
      }
      if (status && String(item.status || '') !== status) return false
      return true
    })
  }, [items, search, status])

  const deleteTarget = items.find((i) => i.id === deleteId)

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointment Records"
        description="Review all appointments. Permanent deletion is limited to future erroneous or duplicate entries."
      />

      <div className="grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 sm:grid-cols-3">
        <SearchBar
          className="sm:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search client, service, professional, or booking ref…"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'Upcoming', label: 'Upcoming' },
            { value: 'Confirmed', label: 'Confirmed' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
          placeholder="Status"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No appointments match your filters." />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1040px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Professional</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const eligible = canHardDeleteAdminAppointment(item, today)
                  return (
                    <tr key={item.id} className="border-t border-[#eef2f0]">
                      <td className="px-4 py-3.5 font-semibold text-[#111827]">
                        {item.clientName || item.client || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-[#4b5563]">
                        {item.service || item.serviceType || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-[#4b5563]">{item.professional || '—'}</td>
                      <td className="px-4 py-3.5 text-[#4b5563]">{formatDate(item.date)}</td>
                      <td className="px-4 py-3.5 text-[#4b5563]">{item.time || '—'}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3.5 text-[#4b5563]">{item.bookingReference || '—'}</td>
                      <td className="px-4 py-3.5">
                        <ActionMenu
                          items={[
                            {
                              label: 'Delete permanently',
                              tone: 'danger',
                              disabled: !eligible,
                              onClick: () => setDeleteId(item.id),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => !busy && setDeleteId('')}
        onConfirm={async () => {
          setBusy(true)
          try {
            await hardDeleteAdminAppointment(deleteId)
            setDeleteId('')
            setToast('Appointment permanently deleted.')
            await load()
          } catch (err) {
            setToast(err?.message || 'Unable to permanently delete this appointment.')
          } finally {
            setBusy(false)
          }
        }}
        title="Permanently delete this appointment?"
        description="This action permanently deletes this record and cannot be undone. Only use for erroneous or duplicate future bookings."
        confirmLabel={busy ? 'Deleting…' : 'Delete permanently'}
        tone="danger"
      />
      {deleteTarget ? (
        <p className="sr-only">
          Deleting {deleteTarget.clientName || deleteTarget.client} on {deleteTarget.date}
        </p>
      ) : null}
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
