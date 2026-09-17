import { useEffect, useMemo, useState } from 'react'
import { FileHeart, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ActionMenu from '../../../components/ui/ActionMenu'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SearchBar from '../../../components/ui/SearchBar'
import Select from '../../../components/ui/Select'
import StatCard from '../../../components/ui/StatCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import Toast from '../../../components/ui/Toast'
import PrivacyBanner from '../shared/PrivacyBanner'
import { deactivateHealthRecord, fetchHealthRecords, formatMedicalDate } from './data/healthRecordData'

export default function HealthRecords() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [programme, setProgramme] = useState('')
  const [recordStatus, setRecordStatus] = useState('')
  const [reviewStatus, setReviewStatus] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [followUpFilter, setFollowUpFilter] = useState('')
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setRecords(await fetchHealthRecords())
    } catch {
      setError('We couldn’t load client health records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return records.filter((record) => {
      if (
        q &&
        !record.clientName.toLowerCase().includes(q) &&
        !record.clientId.toLowerCase().includes(q) &&
        !record.programme.toLowerCase().includes(q)
      ) {
        return false
      }
      if (programme && record.programme !== programme) return false
      if (recordStatus && record.recordStatus !== recordStatus) return false
      if (reviewStatus && record.reviewStatus !== reviewStatus) return false
      if (riskFilter === 'active' && !(record.activeRiskAlerts > 0)) return false
      if (riskFilter === 'none' && record.activeRiskAlerts > 0) return false
      if (followUpFilter === 'required' && record.reviewStatus !== 'Follow-up Required') {
        return false
      }
      if (followUpFilter === 'clear' && record.reviewStatus === 'Follow-up Required') {
        return false
      }
      return true
    })
  }, [records, search, programme, recordStatus, reviewStatus, riskFilter, followUpFilter])

  const summary = useMemo(
    () => ({
      active: records.length,
      pending: records.filter((r) => r.reviewStatus === 'Review Required').length,
      alerts: records.reduce((sum, r) => sum + (r.activeRiskAlerts || 0), 0),
      followUps: records.filter((r) => r.reviewStatus === 'Follow-up Required').length,
    }),
    [records],
  )

  const programmes = useMemo(
    () => [...new Set(records.map((r) => r.programme))].filter(Boolean),
    [records],
  )

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) {
    return <ErrorState title="We couldn’t load client health records." onRetry={load} />
  }

  return (
    <div>
      <PageHeader
        title="Client Health Records"
        description="Review authorized client health information, assessments and follow-up requirements."
        actions={
          <Button
            to="/medical/health-records/create"
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            <Plus className="h-4 w-4" />
            Add Medical Record
          </Button>
        }
      />

      <PrivacyBanner />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Client Records" value={summary.active} />
        <StatCard label="Assessments Pending" value={summary.pending} />
        <StatCard label="Active Risk Alerts" value={summary.alerts} />
        <StatCard label="Follow-ups Due" value={summary.followUps} />
      </div>

      <div className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 lg:grid-cols-3 xl:grid-cols-6">
        <SearchBar
          className="lg:col-span-3 xl:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search by client name, client ID or programme…"
        />
        <Select
          value={programme}
          onChange={(e) => setProgramme(e.target.value)}
          options={programmes.map((p) => ({ value: p, label: p }))}
          placeholder="Programme"
        />
        <Select
          value={recordStatus}
          onChange={(e) => setRecordStatus(e.target.value)}
          options={[
            { value: 'Up to Date', label: 'Up to Date' },
            { value: 'Update Required', label: 'Update Required' },
          ]}
          placeholder="Record status"
        />
        <Select
          value={reviewStatus}
          onChange={(e) => setReviewStatus(e.target.value)}
          options={[
            { value: 'Review Required', label: 'Review Required' },
            { value: 'Up to Date', label: 'Up to Date' },
            { value: 'Follow-up Required', label: 'Follow-up Required' },
          ]}
          placeholder="Review status"
        />
        <Select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          options={[
            { value: 'active', label: 'Has risk alerts' },
            { value: 'none', label: 'No risk alerts' },
          ]}
          placeholder="Risk alerts"
        />
        <Select
          value={followUpFilter}
          onChange={(e) => setFollowUpFilter(e.target.value)}
          options={[
            { value: 'required', label: 'Follow-up required' },
            { value: 'clear', label: 'No follow-up' },
          ]}
          placeholder="Follow-up"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileHeart}
          title="No client health records found."
          description="Try adjusting filters or create a new medical record."
          actionLabel="Add Medical Record"
          actionTo="/medical/health-records/create"
        />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-[#f8faf9] text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Client ID</th>
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">Medical Record Status</th>
                  <th className="px-4 py-3">Latest Assessment</th>
                  <th className="px-4 py-3">Active Risk Alerts</th>
                  <th className="px-4 py-3">Next Check-up</th>
                  <th className="px-4 py-3">Review Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id} className="border-t border-[#eef2f0]">
                    <td className="px-4 py-3.5 font-semibold text-[#111827]">
                      {record.clientName}
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{record.clientId}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{record.programme}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={record.recordStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {formatMedicalDate(record.latestAssessment)}
                    </td>
                    <td className="px-4 py-3.5 text-[#4b5563]">{record.activeRiskAlerts}</td>
                    <td className="px-4 py-3.5 text-[#4b5563]">
                      {formatMedicalDate(record.nextCheckup)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={record.reviewStatus} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        items={[
                          {
                            label: 'View Record',
                            onClick: () => navigate(`/medical/health-records/${record.id}`),
                          },
                          {
                            label: 'View Assessment',
                            onClick: () =>
                              navigate(
                                record.latestAssessmentId
                                  ? `/medical/assessments/${record.latestAssessmentId}`
                                  : `/medical/assessments?client=${record.clientId}`,
                              ),
                          },
                          {
                            label: 'View Alerts',
                            onClick: () =>
                              navigate(`/medical/health-alerts?client=${record.clientId}`),
                          },
                          {
                            label: 'Mark Inactive',
                            onClick: () => setDeactivateTarget(record),
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

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        title="Mark health record inactive?"
        description="This soft-deletes the client health record. Data remains in the database and is hidden from the active list."
        confirmLabel="Mark Inactive"
        tone="danger"
        onConfirm={async () => {
          await deactivateHealthRecord(deactivateTarget.id)
          setDeactivateTarget(null)
          setToast('Health record marked inactive.')
          await load()
        }}
      />

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
