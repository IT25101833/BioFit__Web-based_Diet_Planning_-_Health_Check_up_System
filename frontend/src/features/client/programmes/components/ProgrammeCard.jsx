import { CalendarRange, UserRound, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../../../components/ui/Button'
import ProgressBar from '../../../../components/ui/ProgressBar'
import StatusBadge from '../../../../components/ui/StatusBadge'
import { formatProgrammeDate } from '../data/programmeData'

export default function ProgrammeCard({ programme }) {
  return (
    <article className="flex h-full flex-col rounded-[1.25rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-[#005a40] uppercase">
            {programme.type}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-[#111827]">
            {programme.title}
          </h3>
        </div>
        <StatusBadge status={programme.status} />
      </div>

      <div className="space-y-2.5 text-sm text-[#4b5563]">
        <p className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-[#005a40]" strokeWidth={2.1} />
          Coach: <span className="font-semibold text-[#111827]">{programme.coach}</span>
        </p>
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#005a40]" strokeWidth={2.1} />
          Nutrition:{' '}
          <span className="font-semibold text-[#111827]">
            {programme.nutritionConsultant}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-[#005a40]" strokeWidth={2.1} />
          {formatProgrammeDate(programme.startDate)} –{' '}
          {formatProgrammeDate(programme.endDate)}
        </p>
      </div>

      <div className="mt-5">
        <ProgressBar
          value={programme.progress}
          label={`Week ${programme.currentWeek} of ${programme.totalWeeks}`}
        />
      </div>

      <div className="mt-auto pt-5">
        <Button
          to={`/client/programmes/${programme.id}`}
          variant="outline"
          className="w-full !border-[#005a40]/25 !text-[#005a40] hover:!bg-[#e6f5f0]"
        >
          View Programme
        </Button>
      </div>
    </article>
  )
}

export function ProgrammeMetaRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eef2f0] py-3 last:border-0">
      <p className="text-[12px] font-medium text-[#8b93a1]">{label}</p>
      <p className="text-right text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  )
}

export function ProgrammeShortcutLink({ to, title, description }) {
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] px-4 py-4 transition-colors hover:border-[#005a40]/25 hover:bg-[#e6f5f0]"
    >
      <p className="text-sm font-semibold text-[#111827]">{title}</p>
      <p className="mt-1 text-[12px] text-[#6b7280]">{description}</p>
    </Link>
  )
}
