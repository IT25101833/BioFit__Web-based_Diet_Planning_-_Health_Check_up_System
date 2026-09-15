import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import ProgressBar from '../../../components/ui/ProgressBar'
import SectionCard from '../../../components/ui/SectionCard'
import StatCard from '../../../components/ui/StatCard'
import Toast from '../../../components/ui/Toast'
import { fetchManagerReports } from './data/reportData'

const ranges = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'Last 3 Months' },
  { value: 'custom', label: 'Custom' },
]

export default function ManagerReports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('month')
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setData(await fetchManagerReports())
    } catch {
      setError('We couldn’t load reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <LoadingSkeleton rows={5} />
  if (error || !data) {
    return <ErrorState title="We couldn’t load reports." onRetry={load} />
  }

  const maxEnrol = Math.max(...data.enrolmentTrend.map((i) => i.value), 1)
  const maxAppt = Math.max(...data.appointmentActivity.map((i) => i.value), 1)
  const maxDist = Math.max(...data.programmeDistribution.map((i) => i.value), 1)

  return (
    <div>
      <PageHeader
        title="Reports & Insights"
        description="Understand programme participation and wellness centre operations."
        actions={
          <Button
            variant="outline"
            onClick={() => setToast('Export will be available when the backend is connected.')}
            className="!border-[#005a40]/25 !text-[#005a40]"
          >
            Export Report
          </Button>
        }
      />

      <div className="mb-5">
        <FilterTabs
          ariaLabel="Date range"
          value={range}
          onChange={setRange}
          options={ranges}
        />
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Clients" value={data.overview.activeClients} />
        <StatCard label="Programme Enrolments" value={data.overview.programmeEnrolments} />
        <StatCard
          label="Appointment Completion"
          value={`${data.overview.appointmentCompletion}%`}
        />
        <StatCard
          label="Programme Completion"
          value={`${data.overview.programmeCompletion}%`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Programme enrolment trend">
          <div className="flex h-44 items-end gap-2 pt-2">
            {data.enrolmentTrend.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[#005a40]/85"
                  style={{ height: `${(item.value / maxEnrol) * 100}%` }}
                />
                <span className="text-[11px] text-[#6b7280]">{item.label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Programme distribution">
          <div className="flex h-44 items-end gap-2 pt-2">
            {data.programmeDistribution.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[#0f766e]/75"
                  style={{ height: `${(item.value / maxDist) * 100}%` }}
                />
                <span className="text-center text-[10px] leading-tight text-[#6b7280]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Appointment activity">
          <div className="flex h-44 items-end gap-2 pt-2">
            {data.appointmentActivity.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[#005a40]/70"
                  style={{ height: `${(item.value / maxAppt) * 100}%` }}
                />
                <span className="text-[11px] text-[#6b7280]">{item.label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Programme capacity utilization">
          <div className="space-y-4">
            {data.capacityUtilization.map((item) => (
              <ProgressBar key={item.label} value={item.value} label={item.label} />
            ))}
          </div>
        </SectionCard>
      </div>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
