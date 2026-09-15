import { useEffect, useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ActionMenu from '../../../components/ui/ActionMenu'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchHealthRecords, formatMedicalDate } from '../health-records/data/healthRecordData'
import { fetchMedicalAppointments } from './data/medicalAppointmentData'

const tabs = [
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const TODAY = '2026-09-09'

export default function MedicalAppointments() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [recordByClient, setRecordByClient] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('today')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [appointments, records] = await Promise.all([
        fetchMedicalAppointments(),
        fetchHealthRecords(),
      ])
      setItems(appointments)
      const map = {}
      records.forEach((record) => {
        map[record.clientId] = record.id
      })
      setRecordByClient(map)
    } catch {
      setError('We couldn’t load medical appointments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (tab === 'today') {
      return items.filter((item) => item.date === TODAY && item.status !== 'Cancelled')
    }
    if (tab === 'upcoming') {
      return items.filter((item) => item.status === 'Upcoming')
    }
    if (tab === 'completed') {
      return items.filter((item) => item.status === 'Completed')
    }
    return items.filter((item) => item.status === 'Cancelled')
  }, [items, tab])

  function openRecord(clientId) {
    const recordId = recordByClient[clientId]
    if (recordId) navigate(`/medical/health-records/${recordId}`)
    else navigate('/medical/health-records')
  }

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) {
    return <ErrorState title="We couldn’t load medical appointments." onRetry={load} />
  }

  return (
    <div>
      <PageHeader
        title="Medical Appointments"
        description="Review health check-ups and follow-up reviews scheduled with assigned clients."
      />

      <div className="mb-5">
        <FilterTabs ariaLabel="Appointment filters" value={tab} onChange={setTab} options={tabs} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={`No ${tab} appointments`}
          description="Medical appointments will appear here when scheduled."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:block">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                  <tr>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Appointment Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Programme</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-t border-[#eef2f0]">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-[#111827]">{item.client}</p>
                        <p className="mt-0.5 text-[12px] text-[#6b7280]">{item.clientId}</p>
                      </td>
                      <td className="px-4 py-3.5 text-[#4b5563]">{item.type}</td>
                      <td className="px-4 py-3.5 text-[#4b5563]">
                        {formatMedicalDate(item.date)}
                      </td>
                      <td className="px-4 py-3.5 text-[#4b5563]">
                        {item.time}
                        {item.duration ? ` · ${item.duration}` : ''}
                      </td>
                      <td className="px-4 py-3.5 text-[#4b5563]">{item.programme}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <ActionMenu
                          items={[
                            {
                              label: 'View Appointment',
                              onClick: () => openRecord(item.clientId),
                            },
                            {
                              label: 'View Health Record',
                              onClick: () => openRecord(item.clientId),
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

          <div className="space-y-3 md:hidden">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-[#111827]">
                      {item.client}
                    </h2>
                    <p className="mt-1 text-sm text-[#4b5563]">{item.type}</p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      {formatMedicalDate(item.date)} · {item.time}
                      {item.duration ? ` · ${item.duration}` : ''}
                    </p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">{item.programme}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-[#e8ecf1] px-3 py-2 text-sm font-semibold text-[#005a40]"
                    onClick={() => openRecord(item.clientId)}
                  >
                    View Health Record
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
