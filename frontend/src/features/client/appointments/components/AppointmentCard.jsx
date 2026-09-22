import { CalendarDays, Clock3, Timer, UserRound } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import StatusBadge from '../../../../components/ui/StatusBadge'
import {
  formatAppointmentDate,
  formatAppointmentTimeRange,
  formatDurationLabel,
  isAdvisorUnavailableAppointment,
} from '../data/appointmentData'

export default function AppointmentCard({
  appointment,
  onCancel,
}) {
  const advisorUnavailable = isAdvisorUnavailableAppointment(appointment)
  const statusForBadge =
    String(appointment.attendance || '').toUpperCase() === 'ATTENDED'
      ? 'Completed'
      : appointment.status
  const canModify = String(appointment.status).toLowerCase() === 'upcoming' && !advisorUnavailable
  const canReschedule = canModify || advisorUnavailable

  return (
    <article className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[#111827]">
            {appointment.service}
          </h3>
          <p className="mt-1 text-sm text-[#6b7280]">{appointment.professionalRole}</p>
        </div>
        <StatusBadge status={statusForBadge} />
      </div>

      <div className="mt-4 grid gap-2.5 text-sm text-[#4b5563] sm:grid-cols-2 lg:grid-cols-4">
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-[#005a40]" strokeWidth={2.1} />
          {formatAppointmentDate(appointment.date)}
        </p>
        <p className="flex items-center gap-2 font-semibold text-[#111827]">
          <Clock3 className="h-4 w-4 shrink-0 text-[#005a40]" strokeWidth={2.1} />
          {formatAppointmentTimeRange(appointment)}
        </p>
        <p className="flex items-center gap-2">
          <Timer className="h-4 w-4 shrink-0 text-[#005a40]" strokeWidth={2.1} />
          Duration: {formatDurationLabel(appointment.duration)}
        </p>
        <p className="flex items-center gap-2">
          <UserRound className="h-4 w-4 shrink-0 text-[#005a40]" strokeWidth={2.1} />
          {appointment.professional}
        </p>
      </div>

      {appointment.bookingReference ? (
        <p className="mt-3 text-[12px] text-[#8b93a1]">Ref {appointment.bookingReference}</p>
      ) : null}

      {advisorUnavailable ? (
        <p className="mt-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-sm text-[#b45309]">
          Advisor unavailable
          {appointment.attendanceNote ? `: ${appointment.attendanceNote}` : ''}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          to={`/client/appointments/${appointment.id}`}
          variant="outline"
          size="sm"
          className="!border-[#005a40]/25 !text-[#005a40] hover:!bg-[#e6f5f0]"
        >
          View
        </Button>
        {canReschedule ? (
          <Button
            to={`/client/appointments/${appointment.id}/reschedule`}
            variant="outline"
            size="sm"
            className="!border-[#005a40]/25 !text-[#005a40] hover:!bg-[#e6f5f0]"
          >
            Reschedule
          </Button>
        ) : null}
        {canModify ? (
          <Button
            type="button"
            size="sm"
            onClick={() => onCancel?.(appointment)}
            className="!bg-[#fff7ed] !text-[#b45309] hover:!bg-[#ffedd5]"
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </article>
  )
}
