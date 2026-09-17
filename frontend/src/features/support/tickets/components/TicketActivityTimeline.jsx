import { formatWhen } from '../utils/formatWhen'

function eventSortKey(at) {
  const date = new Date(at)
  if (Number.isNaN(date.getTime())) return Number.MAX_SAFE_INTEGER
  return date.getTime()
}

export default function TicketActivityTimeline({ events = [] }) {
  if (events.length === 0) return null

  const sortedEvents = [...events].sort((a, b) => eventSortKey(b.at) - eventSortKey(a.at))

  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#eef2f0] pb-3">
        <h3 className="font-display text-sm font-bold text-[#111827]">
          Activity Timeline
        </h3>
        <span className="text-xs text-[#8b93a1]">{sortedEvents.length} events</span>
      </div>

      <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e8ecf1]">
        {sortedEvents.map((evt, idx) => (
          <div key={evt.id || idx} className="relative text-xs">
            <span
              className={[
                'absolute -left-4 top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white',
                idx === 0 ? 'bg-[#005a40]' : 'bg-[#cbd5e1]',
              ].join(' ')}
            />
            <p className="font-medium text-[#111827] leading-tight">{evt.text}</p>
            <span className="text-[11px] text-[#8b93a1] mt-0.5 block">{formatWhen(evt.at)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
