import { useEffect, useMemo, useState } from 'react'
import { ClipboardPlus, Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import PrivacyBanner from '../shared/PrivacyBanner'
import { formatMedicalDate } from '../health-records/data/healthRecordData'
import { fetchAssessments } from './data/healthAssessmentData'

export default function HealthAssessments() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const clientFilter = searchParams.get('client') || ''

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await fetchAssessments())
    } catch {
      setError('We couldn’t load health assessments.')
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
      if (clientFilter && item.clientId !== clientFilter) return false
      if (
        q &&
        !item.clientName.toLowerCase().includes(q) &&
        !item.clientId.toLowerCase().includes(q) &&
        !(item.type || '').toLowerCase().includes(q)
      ) {
        return false
      }
      if (status && item.status !== status) return false
      if (type && item.type !== type) return false
      return true
    })
  }, [items, search, status, type, clientFilter])

  const summary = useMemo(
    () => ({
      pending: items.filter((i) => i.status === 'Pending Review').length,
      followUp: items.filter((i) => i.status === 'Follow-up Required' || i.followUpRequired).length,
      reviewed: items.filter((i) => i.status === 'Reviewed').length,
      completed: items.filter((i) => i.status === 'Completed').length,
    }),
    [items],
  )

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) {
    return <ErrorState title="We couldn’t load health assessments." onRetry={load} />
  }

  return (
    <div>
      <PageHeader
        title="Health Assessments"
        description="Review and manage health assessments for authorized BioFit clients."
        actions={
          <Button
            to="/medical/assessments/create"
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            <Plus className="h-4 w-4" />
            New Health Assessment
          </Button>
        }
      />

      <PrivacyBanner description="Assessment details contain protected health information for medical workflows only." />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending Review" value={summary.pending} />
        <StatCard label="Follow-ups Required" value={summary.followUp} />
        <StatCard label="Reviewed" value={summary.reviewed} />
        <StatCard label="Completed" value={summary.completed} />
      </div>

      <div className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <SearchBar
          className="sm:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search client name, ID or assessment type…"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'Pending Review', label: 'Pending Review' },
            { value: 'Reviewed', label: 'Reviewed' },
            { value: 'Follow-up Required', label: 'Follow-up Required' },
            { value: 'Completed', label: 'Completed' },
          ]}
          placeholder="Status"
        />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'Initial Health Assessment', label: 'Initial Health Assessment' },
            { value: 'Routine Health Check-up', label: 'Routine Health Check-up' },
            { value: 'Follow-up Review', label: 'Follow-up Review' },
            { value: 'Programme Health Review', label: 'Programme Health Review' },
          ]}
          placeholder="Assessment type"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardPlus}
          title="No health assessments found."
          actionLabel="New Health Assessment"
          actionTo="/medical/assessments/create"
        />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Assessment Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Medical Advisor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Follow-up</th>
                  <th className="px-4 py-3">Next Review</th>
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
                    <td className="px-4 py-3.5 text-[#4b5563]">{formatMedicalDate(item.date)}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{item.type}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {item.advisor || 'Elena Costa'}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {item.followUpRequired ? 'Required' : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {formatMedicalDate(item.nextReview)}
                    </td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        items={[
                          {
                            label: 'View',
                            onClick: () => navigate(`/medical/assessments/${item.id}`),
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
