import { useEffect, useState } from 'react'
import {
  CalendarDays,
  ClipboardPlus,
  FileHeart,
  Plus,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import SectionCard from '../../../components/ui/SectionCard'
import StatCard from '../../../components/ui/StatCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchHealthRecords, formatMedicalDate } from '../health-records/data/healthRecordData'
import {
  healthRecordHref,
  indexHealthRecordsByClient,
  reviewItemHref,
} from '../shared/medicalNav'
import { fetchMedicalDashboard } from './data/medicalDashboardData'

function ViewAllLink({ to }) {
  return (
    <Link to={to} className="text-sm font-semibold text-[#005a40] hover:underline">
      View all
    </Link>
  )
}

function EmptySectionMessage({ message }) {
  return <p className="text-sm text-[#6b7280]">{message}</p>
}

export default function MedicalDashboard() {
  const [data, setData] = useState(null)
  const [recordIndex, setRecordIndex] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [dashboard, records] = await Promise.all([
        fetchMedicalDashboard(),
        fetchHealthRecords().catch(() => []),
      ])
      setData(dashboard)
      setRecordIndex(indexHealthRecordsByClient(records))
    } catch {
      setError('We couldn’t load your medical dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <LoadingSkeleton rows={6} />
  if (error || !data) {
    return (
      <div className="w-full">
        <ErrorState title="We couldn’t load your medical dashboard." onRetry={load} />
      </div>
    )
  }

  const stats = data.stats || {}
  const todaysAppointments = Array.isArray(data.todaysAppointments) ? data.todaysAppointments : []
  const clientsRequiringReview = Array.isArray(data.clientsRequiringReview)
    ? data.clientsRequiringReview
    : []
  const alertOverview = Array.isArray(data.alertOverview) ? data.alertOverview : []
  const recentAssessments = Array.isArray(data.recentAssessments) ? data.recentAssessments : []
  const assessmentTrend = Array.isArray(data.assessmentTrend) ? data.assessmentTrend : []
  const recentActivity = Array.isArray(data.recentActivity) ? data.recentActivity : []
  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const stat = (key) => stats[key] || { value: '—', hint: '' }
  const maxTrend = Math.max(
    ...assessmentTrend.flatMap((i) => [
      Number(i.completed) || 0,
      Number(i.pending) || 0,
      Number(i.followUp) || 0,
    ]),
    1,
  )

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <p className="text-[12px] font-semibold tracking-wide text-[#005a40] uppercase">
          {todayLabel}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#111827] sm:text-[1.75rem]">
          {data.greetingName ? `Good morning, ${data.greetingName}` : 'Good morning'}
        </h1>
        <p className="mt-1.5 text-sm text-[#6b7280]">
          Here’s an overview of client reviews, appointments and health alerts requiring attention.
        </p>
      </div>

      {todaysAppointments.length > 0 ? (
        <Link
          to="/medical/appointments"
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-[#005a40]/20 bg-[#f0faf6] px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.03)] transition-colors hover:border-[#005a40]/40"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f5f0] text-[#005a40]">
              <CalendarDays className="h-5 w-5" strokeWidth={2.1} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                Today · {todaysAppointments.length} appointment
                {todaysAppointments.length === 1 ? '' : 's'}
              </p>
              <p className="text-[12px] text-[#6b7280]">
                {todaysAppointments
                  .slice(0, 2)
                  .map(
                    (a) =>
                      `${a.time || '—'} ${a.client || a.clientName || 'Client'}`,
                  )
                  .join(' · ')}
                {todaysAppointments.length > 2
                  ? ` · +${todaysAppointments.length - 2} more`
                  : ''}
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-[#005a40]">View appointments</span>
        </Link>
      ) : null}

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/medical/health-records" className="block transition-opacity hover:opacity-90">
          <StatCard
            icon={Users}
            label="Clients Under Review"
            value={stat('clientsUnderReview').value}
            hint={stat('clientsUnderReview').hint || undefined}
          />
        </Link>
        <Link
          to="/medical/assessments?status=pending"
          className="block transition-opacity hover:opacity-90"
        >
          <StatCard
            icon={ClipboardPlus}
            label="Health Assessments Pending Review"
            value={stat('assessmentsPending').value}
            hint={stat('assessmentsPending').hint || undefined}
          />
        </Link>
        <Link to="/medical/health-alerts" className="block transition-opacity hover:opacity-90">
          <StatCard
            icon={ShieldAlert}
            label="Active Health Risk Alerts"
            value={stat('activeAlerts').value}
            hint={stat('activeAlerts').hint || undefined}
          />
        </Link>
        <Link to="/medical/appointments" className="block transition-opacity hover:opacity-90">
          <StatCard
            icon={CalendarDays}
            label="Today’s Medical Appointments"
            value={stat('todaysAppointments').value}
            hint={stat('todaysAppointments').hint || undefined}
          />
        </Link>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Today’s Appointments"
          className="lg:col-span-2"
          actions={<ViewAllLink to="/medical/appointments" />}
        >
          {todaysAppointments.length === 0 ? (
            <EmptySectionMessage message="No appointments scheduled for today." />
          ) : (
            <div className="space-y-3">
              {todaysAppointments.map((item) => {
                const typeLabel = item.type || item.serviceType || item.service
                const metaParts = [typeLabel, item.programme, item.duration].filter(Boolean)
                const clientUserId =
                  item.clientUserId ??
                  (item.clientId ? String(item.clientId).replace(/\D+/g, '') : null)
                const recordTarget = healthRecordHref(recordIndex, {
                  userId: clientUserId,
                  clientId: item.clientId,
                })
                const clientLabel = item.client || item.clientName
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[#eef2f0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        {[item.time].filter(Boolean).join(' · ')}
                        {item.time && clientLabel ? ' · ' : ''}
                        {clientLabel ? (
                          <Link
                            to={recordTarget}
                            className="text-[#005a40] hover:underline"
                          >
                            {clientLabel}
                          </Link>
                        ) : null}
                      </p>
                      {metaParts.length ? (
                        <p className="mt-1 text-[12px] text-[#6b7280]">{metaParts.join(' · ')}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.status ? <StatusBadge status={item.status} /> : null}
                      <Button
                        to="/medical/appointments"
                        size="sm"
                        variant="outline"
                        className="!text-[#005a40]"
                      >
                        View Appointment
                      </Button>
                      <Button
                        to={recordTarget}
                        size="sm"
                        variant="outline"
                        className="!text-[#005a40]"
                      >
                        View Health Record
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Clients Requiring Review"
          actions={<ViewAllLink to="/medical/health-records" />}
        >
          {clientsRequiringReview.length === 0 ? (
            <EmptySectionMessage message="No clients currently require review." />
          ) : (
            <ul className="space-y-3">
              {clientsRequiringReview.map((item) => {
                const href = reviewItemHref(item)
                return (
                  <li key={item.id || item.client} className="rounded-2xl bg-[#fff7ed] px-3 py-3">
                    <p className="text-sm font-semibold text-[#111827]">
                      {item.client || item.title}
                    </p>
                    {item.reason || item.detail ? (
                      <p className="mt-1 text-[12px] text-[#b45309]">
                        {item.reason || item.detail}
                      </p>
                    ) : null}
                    {item.reason && item.detail ? (
                      <p className="mt-1 text-[11px] text-[#6b7280]">{item.detail}</p>
                    ) : null}
                    {href ? (
                      <Button
                        to={href}
                        size="sm"
                        variant="outline"
                        className="mt-2 !text-[#005a40]"
                      >
                        Review
                      </Button>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Health Risk Alerts"
          className="lg:col-span-2"
          actions={<ViewAllLink to="/medical/health-alerts" />}
        >
          {alertOverview.length === 0 ? (
            <EmptySectionMessage message="No active health risk alerts." />
          ) : (
            <div className="space-y-3">
              {alertOverview.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-2xl border border-[#eef2f0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {item.client || item.clientName}
                    </p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      {[item.title, item.dateRaised ? `Raised ${item.dateRaised}` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.priority ? <StatusBadge status={item.priority} /> : null}
                      {item.status ? <StatusBadge status={item.status} /> : null}
                    </div>
                  </div>
                  <Button
                    to={`/medical/health-alerts/${item.id}`}
                    size="sm"
                    variant="outline"
                    className="!text-[#005a40]"
                  >
                    Review Alert
                  </Button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Health Assessments — Last 30 Days"
          actions={<ViewAllLink to="/medical/assessments" />}
        >
          {recentAssessments.length > 0 ? (
            <ul className="mb-4 space-y-2">
              {recentAssessments.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/medical/assessments/${item.id}`}
                    className="block rounded-xl border border-[#eef2f0] px-3 py-2 text-sm font-semibold text-[#005a40] hover:bg-[#f8faf9] hover:underline"
                  >
                    {item.clientName || item.client || item.type || `Assessment ${item.id}`}
                    {item.date ? (
                      <span className="mt-0.5 block text-[11px] font-normal text-[#6b7280]">
                        {formatMedicalDate(item.date)}
                        {item.type ? ` · ${item.type}` : ''}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {assessmentTrend.length === 0 ? (
            recentAssessments.length === 0 ? (
              <EmptySectionMessage message="No assessment trend data for the last 30 days." />
            ) : null
          ) : (
            <>
              <div className="flex h-44 items-end gap-2 pt-2">
                {assessmentTrend.map((item) => {
                  const completed = Number(item.completed) || 0
                  const pending = Number(item.pending) || 0
                  const followUp = Number(item.followUp) || 0
                  const total = completed + pending + followUp
                  const height = `${(total / (maxTrend * 3 || 1)) * 100}%`
                  return (
                    <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="flex w-full flex-col justify-end overflow-hidden rounded-t-md"
                        style={{ height }}
                      >
                        <div
                          className="w-full bg-[#005a40]"
                          style={{ height: `${(completed / (total || 1)) * 100}%` }}
                          title={`Completed ${completed}`}
                        />
                        <div
                          className="w-full bg-[#005a40]/45"
                          style={{ height: `${(pending / (total || 1)) * 100}%` }}
                          title={`Pending ${pending}`}
                        />
                        <div
                          className="w-full bg-[#f59e0b]/70"
                          style={{ height: `${(followUp / (total || 1)) * 100}%` }}
                          title={`Follow-up ${followUp}`}
                        />
                      </div>
                      <span className="text-[11px] text-[#6b7280]">{item.label}</span>
                    </div>
                  )
                })}
              </div>
              <p className="mt-3 text-[12px] text-[#6b7280]">
                Completed · Pending review · Follow-up required
              </p>
            </>
          )}
        </SectionCard>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Review Health Records', to: '/medical/health-records', icon: FileHeart },
          { label: 'Review Assessments', to: '/medical/assessments', icon: ClipboardPlus },
          { label: 'Open Health Risk Alerts', to: '/medical/health-alerts', icon: ShieldAlert },
          { label: 'View Today’s Appointments', to: '/medical/appointments', icon: CalendarDays },
        ].map(({ label, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex items-center gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#005a40]/25 hover:bg-[#e6f5f0]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
              <Icon className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <span className="text-sm font-semibold text-[#111827]">{label}</span>
          </Link>
        ))}
      </div>

      <div className="mb-5">
        <Link
          to="/medical/health-records/create"
          className="inline-flex items-center gap-2 rounded-[1.25rem] border border-[#005a40]/20 bg-[#e6f5f0] px-4 py-3 text-sm font-semibold text-[#005a40] transition-colors hover:bg-white"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Add Medical Record
        </Link>
      </div>

      <SectionCard
        title="Recent Medical Activity"
        actions={<ViewAllLink to="/medical/notifications" />}
      >
        {recentActivity.length === 0 ? (
          <EmptyState
            title="No recent medical activity"
            description="Activity will appear here as you review records, assessments and alerts."
          />
        ) : (
          <ul className="space-y-3">
            {recentActivity.map((item) => (
              <li
                key={item.id || item.text || item.title}
                className="flex flex-col gap-1 border-b border-[#eef2f0] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm text-[#374151]">{item.text || item.detail || item.title}</p>
                <p className="text-[12px] whitespace-nowrap text-[#8b93a1]">{item.at}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}
