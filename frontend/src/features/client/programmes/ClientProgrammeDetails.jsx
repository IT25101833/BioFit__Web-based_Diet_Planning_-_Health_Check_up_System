import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import ProgressBar from '../../../components/ui/ProgressBar'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import {
  ProgrammeMetaRow,
  ProgrammeShortcutLink,
} from './components/ProgrammeCard'
import {
  fetchClientProgrammeById,
  formatProgrammeDate,
} from './data/programmeData'

export default function ClientProgrammeDetails() {
  const { id } = useParams()
  const [programme, setProgramme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchClientProgrammeById(id)
      setProgramme(data)
    } catch {
      setError('We couldn’t load this programme.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  if (loading) return <LoadingSkeleton rows={4} />
  if (error || !programme) {
    return (
      <ErrorState
        title="We couldn’t load this programme."
        description="Please go back and try again."
        onRetry={load}
      />
    )
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/client/programmes"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#005a40] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
          Back to programmes
        </Link>
      </div>

      <PageHeader
        title={programme.title}
        description={programme.description}
        actions={<StatusBadge status={programme.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Overview" className="lg:col-span-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <ProgrammeMetaRow
              label="Duration"
              value={`${programme.totalWeeks} weeks`}
            />
            <ProgrammeMetaRow
              label="Current week"
              value={`Week ${programme.currentWeek}`}
            />
            <ProgrammeMetaRow
              label="Start date"
              value={formatProgrammeDate(programme.startDate)}
            />
            <ProgrammeMetaRow
              label="End date"
              value={formatProgrammeDate(programme.endDate)}
            />
          </div>
          <div className="mt-5">
            <ProgressBar value={programme.progress} label="Overall progress" />
          </div>
        </SectionCard>

        <SectionCard title="Assigned professionals">
          <ul className="space-y-3">
            {programme.professionals.map((person) => (
              <li
                key={person.role}
                className="rounded-2xl border border-[#eef2f0] bg-[#f8faf9] px-4 py-3"
              >
                <p className="text-[11px] font-semibold tracking-wide text-[#8b93a1] uppercase">
                  {person.role}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#111827]">
                  {person.name}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Shortcuts" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <ProgrammeShortcutLink
              to="/client/workout-plan"
              title="Workout plan"
              description="View this week’s gentle movement schedule."
            />
            <ProgrammeShortcutLink
              to="/client/meal-plan"
              title="Meal plan"
              description="See your nourishing daily meal rhythm."
            />
            <ProgrammeShortcutLink
              to="/client/appointments"
              title="Appointments"
              description="Review upcoming wellness sessions."
            />
            <ProgrammeShortcutLink
              to="/client/fitness-progress"
              title="Progress overview"
              description="Track participation and wellness trends."
            />
          </div>
        </SectionCard>

        <SectionCard title="Progress overview">
          <div className="space-y-4">
            {programme.progressOverview.map((item) => (
              <ProgressBar
                key={item.label}
                value={item.value}
                label={item.label}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Appointments"
          icon={CalendarDays}
          className="lg:col-span-3"
          actions={
            <Button
              to="/client/appointments/book"
              size="sm"
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Book Appointment
            </Button>
          }
        >
          {programme.upcomingAppointments.length === 0 ? (
            <p className="text-sm text-[#6b7280]">
              No upcoming appointments linked to this programme.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {programme.upcomingAppointments.map((apt) => (
                <Link
                  key={apt.id}
                  to={`/client/appointments/${apt.id}`}
                  className="rounded-2xl border border-[#e8ecf1] px-4 py-3 transition-colors hover:bg-[#f8faf9]"
                >
                  <p className="text-sm font-semibold text-[#111827]">{apt.title}</p>
                  <p className="mt-1 text-[12px] text-[#6b7280]">
                    {formatProgrammeDate(apt.date)} · {apt.time}
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-[#005a40]">
                    {apt.professional}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
