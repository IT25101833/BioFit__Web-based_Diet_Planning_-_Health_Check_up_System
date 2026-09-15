import { useEffect, useState } from 'react'
import { AlertTriangle, HeartPulse, ShieldCheck } from 'lucide-react'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchClientHealth } from './data/healthData'

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ClientHealth() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setData(await fetchClientHealth())
    } catch {
      setError('We couldn’t load your health information right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <LoadingSkeleton rows={4} />
  if (error || !data) {
    return (
      <ErrorState
        title="We couldn’t load your health information right now."
        onRetry={load}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="My Health"
        description="Client-authorised wellness information only. Private clinical notes are not shown here."
      />

      <div className="mb-4 rounded-2xl border border-[#ccfbf1] bg-[#f0fdfa] px-4 py-3 text-sm text-[#0f766e]">
        <p className="inline-flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4" />
          Privacy-protected view
        </p>
        <p className="mt-1 text-[#115e59]">
          You are seeing high-level health information shared with you by your care team.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard icon={HeartPulse} title="Latest health check-up">
          <p className="text-sm font-semibold text-[#111827]">
            {data.latestCheckup.title}
          </p>
          <p className="mt-1 text-[12px] text-[#8b93a1]">
            {formatDate(data.latestCheckup.date)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#4b5563]">
            {data.latestCheckup.summary}
          </p>
        </SectionCard>

        <SectionCard title="Medical record status">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[#4b5563]">Your shared record status</p>
            <StatusBadge status={data.medicalRecordStatus} />
          </div>
          <div className="mt-4 rounded-2xl bg-[#f8faf9] px-4 py-3">
            <p className="text-[11px] font-medium text-[#8b93a1]">Latest assessment</p>
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              {data.latestAssessment.title}
            </p>
            <p className="mt-1 text-[12px] text-[#6b7280]">
              {formatDate(data.latestAssessment.date)}
            </p>
            <p className="mt-2 text-sm text-[#4b5563]">
              {data.latestAssessment.summary}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Upcoming review">
          <p className="text-sm font-semibold text-[#111827]">
            {data.upcomingReview.title}
          </p>
          <p className="mt-1 text-sm text-[#6b7280]">
            {formatDate(data.upcomingReview.date)}
          </p>
          <Button
            to="/client/appointments"
            variant="outline"
            size="sm"
            className="mt-4 !border-[#005a40]/25 !text-[#005a40]"
          >
            View appointments
          </Button>
        </SectionCard>

        <SectionCard
          icon={AlertTriangle}
          title="Active health alerts"
          actions={
            <Button
              to="/client/health-alerts"
              size="sm"
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              View alerts
            </Button>
          }
        >
          <p className="font-display text-3xl font-bold text-[#005a40]">
            {data.activeAlertsCount}
          </p>
          <p className="mt-2 text-sm text-[#6b7280]">
            Calm, client-facing guidance only — no private medical notes.
          </p>
        </SectionCard>

        <SectionCard title="High-level safety guidance" className="lg:col-span-2">
          <ul className="space-y-2">
            {data.safetyGuidance.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#eef2f0] bg-[#f8faf9] px-4 py-3 text-sm text-[#4b5563]"
              >
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}
