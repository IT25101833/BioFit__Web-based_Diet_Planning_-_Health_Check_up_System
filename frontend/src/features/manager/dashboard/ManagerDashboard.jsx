import { useEffect, useState } from 'react'
import {
  Activity,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  FileBarChart,
  Plus,
  Users,
  UserCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '../../../components/ui/Avatar'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import ProgressBar from '../../../components/ui/ProgressBar'
import SectionCard from '../../../components/ui/SectionCard'
import StatCard from '../../../components/ui/StatCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { fetchManagerDashboard } from './data/managerDashboardData'

export default function ManagerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setData(await fetchManagerDashboard())
    } catch {
      setError('We couldn’t load the manager dashboard.')
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
        <ErrorState title="We couldn’t load the manager dashboard." onRetry={load} />
      </div>
    )
  }

  const stats = data.stats || {}
  const enrolmentTrend = Array.isArray(data.enrolmentTrend) ? data.enrolmentTrend : []
  const todaysOperations = Array.isArray(data.todaysOperations) ? data.todaysOperations : []
  const activeProgrammes = Array.isArray(data.activeProgrammes) ? data.activeProgrammes : []
  const staffAvailability = Array.isArray(data.staffAvailability) ? data.staffAvailability : []
  const recentActivity = Array.isArray(data.recentActivity) ? data.recentActivity : []
  const maxEnrol = Math.max(...enrolmentTrend.map((item) => Number(item.value) || 0), 1)
  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const stat = (key) => stats[key] || { value: '—', hint: '' }

  const staffGroups = {
    'Fitness Coaches': staffAvailability.filter((s) => String(s.role || '').includes('Fitness')),
    'Nutrition Consultants': staffAvailability.filter((s) => String(s.role || '').includes('Nutrition')),
    'Medical Advisors': staffAvailability.filter((s) => String(s.role || '').includes('Medical')),
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <p className="text-[12px] font-semibold tracking-wide text-[#005a40] uppercase">
          {todayLabel}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#111827] sm:text-[1.75rem]">
          Good morning, {data.greetingName}
        </h1>
        <p className="mt-1.5 text-sm text-[#6b7280]">
          Here’s what’s happening across VitalLife Wellness today.
        </p>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Activity}
          label="Active Programmes"
          value={stat('activeProgrammes').value}
          hint={stat('activeProgrammes').hint}
        />
        <StatCard
          icon={Users}
          label="Active Clients"
          value={stat('activeClients').value}
          hint={stat('activeClients').hint}
        />
        <StatCard
          icon={UserCheck}
          label="Staff Available Today"
          value={stat('staffAvailableToday').value}
          hint={stat('staffAvailableToday').hint}
        />
        <StatCard
          icon={CalendarDays}
          label="Today’s Appointments"
          value={stat('todaysAppointments').value}
          hint={stat('todaysAppointments').hint}
        />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Today’s operations" className="lg:col-span-2">
          <div className="space-y-3">
            {todaysOperations.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-2xl border border-[#eef2f0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#111827]">
                    {item.time} · {item.service}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6b7280]">
                    {item.professional} · {item.client} · {item.programme}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Programme enrolment overview">
          <div className="flex h-48 items-end gap-2 pt-2">
            {enrolmentTrend.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[#005a40]/85"
                  style={{ height: `${(item.value / maxEnrol) * 100}%` }}
                  title={`${item.label}: ${item.value}`}
                />
                <span className="text-[11px] font-medium text-[#6b7280]">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-[#6b7280]">Monthly programme enrolments</p>
        </SectionCard>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Active programmes"
          className="lg:col-span-2"
          actions={
            <Button to="/manager/programmes" size="sm" variant="outline" className="!text-[#005a40]">
              View all
            </Button>
          }
        >
          <div className="space-y-3">
            {activeProgrammes.map((programme) => {
              const enrolled = Number(programme.enrolled) || 0
              const capacity = Number(programme.capacity) || 1
              return (
              <div
                key={programme.id}
                className="rounded-2xl border border-[#eef2f0] px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#111827]">{programme.title}</p>
                    <p className="mt-0.5 text-[12px] text-[#6b7280]">
                      {programme.type} · {programme.staff || programme.coachName || '—'}
                    </p>
                  </div>
                  <StatusBadge status={programme.status} />
                </div>
                <div className="mt-3">
                  <ProgressBar
                    value={Math.round((enrolled / capacity) * 100)}
                    label={`${enrolled} / ${capacity} enrolled`}
                  />
                </div>
                <Button
                  to={`/manager/programmes/${programme.id}`}
                  size="sm"
                  variant="outline"
                  className="mt-3 !border-[#005a40]/25 !text-[#005a40]"
                >
                  View Programme
                </Button>
              </div>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard title="Staff availability today">
          <div className="space-y-4">
            {Object.entries(staffGroups).map(([group, people]) => (
              <div key={group}>
                <p className="mb-2 text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                  {group}
                </p>
                <ul className="space-y-2">
                  {people.map((person) => (
                    <li
                      key={person.id || person.name}
                      className="flex items-center justify-between gap-2 rounded-xl bg-[#f8faf9] px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar name={person.name} size="sm" />
                        <span className="truncate text-sm font-semibold text-[#111827]">
                          {person.name}
                        </span>
                      </div>
                      <StatusBadge status={person.status} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Create Programme',
            to: '/manager/programmes/create',
            icon: Plus,
          },
          {
            label: 'Manage Staff Schedule',
            to: '/manager/staff-scheduling',
            icon: CalendarPlus,
          },
          {
            label: 'View Enrolments',
            to: '/manager/enrolments',
            icon: ClipboardList,
          },
          {
            label: 'View Reports',
            to: '/manager/reports',
            icon: FileBarChart,
          },
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

      <SectionCard title="Recent activity">
        <ul className="space-y-3">
          {recentActivity.map((item) => (
            <li
              key={item.id || item.text}
              className="flex flex-col gap-1 border-b border-[#eef2f0] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-[#374151]">{item.text || item.detail || item.title}</p>
              <p className="text-[12px] whitespace-nowrap text-[#8b93a1]">{item.at}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}
