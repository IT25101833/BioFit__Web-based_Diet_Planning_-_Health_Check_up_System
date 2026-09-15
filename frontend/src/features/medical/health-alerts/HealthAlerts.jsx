import { useEffect, useMemo, useState } from 'react'
import { Plus, ShieldAlert } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ActionMenu from '../../../components/ui/ActionMenu'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SearchBar from '../../../components/ui/SearchBar'
import Select from '../../../components/ui/Select'
import StatCard from '../../../components/ui/StatCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import PrivacyBanner from '../shared/PrivacyBanner'
import { clientOptions, formatMedicalDate } from '../health-records/data/healthRecordData'
import { fetchHealthAlerts } from './data/healthAlertData'

const tabs = [
  { value: 'all', label: 'All Alerts' },
  { value: 'Open', label: 'Open' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Follow-up Required', label: 'Follow-up Required' },
  { value: 'Resolved', label: 'Resolved' },
]

const priorityRank = { High: 3, Moderate: 2, Low: 1 }

export default function HealthAlerts() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState(searchParams.get('client') || '')
  const [priority, setPriority] = useState('')
  const [programme, setProgramme] = useState('')
  const [followUpStatus, setFollowUpStatus] = useState('')
  const [sort, setSort] = useState('recent')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await fetchHealthAlerts())
    } catch {
      setError('We couldn’t load health risk alerts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const programmeByClient = useMemo(() => {
    const map = {}
    clientOptions.forEach((c) => {
      map[c.value] = c.programme
    })
    return map
  }, [])

  const summary = useMemo(
    () => ({
      open: items.filter((i) => i.status === 'Open').length,
      underReview: items.filter((i) => i.status === 'Under Review').length,
      followUps: items.filter((i) => i.status === 'Follow-up Required').length,
      resolvedMonth: items.filter(
        (i) => i.status === 'Resolved' && String(i.resolvedDate || '').startsWith('2026-09'),
      ).length,
    }),
    [items],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = items.filter((item) => {
      if (tab !== 'all' && item.status !== tab) return false
      if (
        q &&
        !item.clientName.toLowerCase().includes(q) &&
        !item.clientId.toLowerCase().includes(q) &&
        !item.id.toLowerCase().includes(q) &&
        !item.title.toLowerCase().includes(q)
      ) {
        return false
      }
      if (priority && item.priority !== priority) return false
      if (programme && programmeByClient[item.clientId] !== programme) return false
      if (followUpStatus && item.followUp?.status !== followUpStatus) return false
      return true
    })

    list = [...list].sort((a, b) => {
      if (sort === 'oldest') return String(a.dateRaised).localeCompare(String(b.dateRaised))
      if (sort === 'priority') {
        return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0)
      }
      if (sort === 'client') return a.clientName.localeCompare(b.clientName)
      return String(b.dateRaised).localeCompare(String(a.dateRaised))
    })

    return list
  }, [items, tab, search, priority, programme, followUpStatus, sort, programmeByClient])

  const programmes = useMemo(
    () => [...new Set(clientOptions.map((c) => c.programme))].filter(Boolean),
    [],
  )

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) {
    return <ErrorState title="We couldn’t load health risk alerts." onRetry={load} />
  }

  return (
    <div>
      <PageHeader
        title="Health Risk Alert Management"
        description="Review, monitor and manage client health risk alerts and follow-up actions."
        actions={
          <Button
            to="/medical/health-alerts/create"
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            <Plus className="h-4 w-4" />
            Create Alert
          </Button>
        }
      />

      <PrivacyBanner />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Alerts" value={summary.open} />
        <StatCard label="Under Review" value={summary.underReview} />
        <StatCard label="Follow-ups Required" value={summary.followUps} />
        <StatCard label="Resolved This Month" value={summary.resolvedMonth} />
      </div>

      <div className="mb-4 overflow-x-auto">
        <FilterTabs ariaLabel="Alert status filters" value={tab} onChange={setTab} options={tabs} />
      </div>

      <div className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 lg:grid-cols-3 xl:grid-cols-6">
        <SearchBar
          className="lg:col-span-3 xl:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search client, alert ID or title…"
        />
        <Select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          options={[
            { value: 'Low', label: 'Low' },
            { value: 'Moderate', label: 'Moderate' },
            { value: 'High', label: 'High' },
          ]}
          placeholder="Priority"
        />
        <Select
          value={programme}
          onChange={(e) => setProgramme(e.target.value)}
          options={programmes.map((p) => ({ value: p, label: p }))}
          placeholder="Programme"
        />
        <Select
          value={followUpStatus}
          onChange={(e) => setFollowUpStatus(e.target.value)}
          options={[
            { value: 'Pending', label: 'Pending' },
            { value: 'Due', label: 'Due' },
            { value: 'Scheduled', label: 'Scheduled' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Not Required', label: 'Not Required' },
          ]}
          placeholder="Follow-up status"
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          options={[
            { value: 'recent', label: 'Most recent' },
            { value: 'oldest', label: 'Oldest' },
            { value: 'priority', label: 'Priority' },
            { value: 'client', label: 'Client name' },
          ]}
          placeholder="Sort"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No health risk alerts found."
          description="Try adjusting filters or create a new alert."
          actionLabel="Create Alert"
          actionTo="/medical/health-alerts/create"
        />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Alert</th>
                  <th className="px-4 py-3">Date Raised</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Follow-up</th>
                  <th className="px-4 py-3">Assigned Medical Advisor</th>
                  <th className="px-4 py-3">Last Updated</th>
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
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-[#111827]">{item.title}</p>
                      <p className="text-[12px] text-[#8b93a1]">{item.id}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {formatMedicalDate(item.dateRaised)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {item.followUp?.status || (item.followUp?.required ? 'Required' : '—')}
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{item.assignedAdvisor}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {formatMedicalDate(item.guidance?.lastUpdated || item.dateRaised)}
                    </td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        items={[
                          {
                            label: 'View',
                            onClick: () => navigate(`/medical/health-alerts/${item.id}`),
                          },
                          {
                            label: item.status === 'Open' ? 'Review' : 'Continue Review',
                            onClick: () => navigate(`/medical/health-alerts/${item.id}`),
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
