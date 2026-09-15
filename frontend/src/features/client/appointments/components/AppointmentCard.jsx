import { CalendarDays, Clock3, UserRound } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import StatusBadge from '../../../../components/ui/StatusBadge'
import { formatAppointmentDate } from '../data/appointmentData'

export default function AppointmentCard({ appointment }) {
  return (
    <article className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-[#111827]">
            {appointment.service}
          </h3>
          <p className="mt-1 text-sm text-[#6b7280]">{appointment.professionalRole}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="mt-4 grid gap-2.5 text-sm text-[#4b5563] sm:grid-cols-3">
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#005a40]" strokeWidth={2.1} />
          {formatAppointmentDate(appointment.date)}
        </p>
        <p className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-[#005a40]" strokeWidth={2.1} />
          {appointment.time}
        </p>
        <p className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-[#005a40]" strokeWidth={2.1} />
          {appointment.professional}
        </p>
      </div>

      <div className="mt-5">
        <Button
          to={`/client/appointments/${appointment.id}`}
          variant="outline"
          size="sm"
          className="!border-[#005a40]/25 !text-[#005a40] hover:!bg-[#e6f5f0]"
        >
          View Details
        </Button>
      </div>
    </article>
  )
}
