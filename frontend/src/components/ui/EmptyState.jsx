import { Inbox } from 'lucide-react'
import Button from './Button'

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
  className = '',
}) {
  return (
    <div
      className={[
        'w-full rounded-[1.25rem] border border-dashed border-[#d7dee6] bg-white px-6 py-14 text-center shadow-[0_8px_24px_rgba(15,23,42,0.03)]',
        className,
      ].join(' ')}
    >
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
        <Icon className="h-5 w-5" strokeWidth={2.1} />
      </span>
      <h2 className="font-display text-lg font-bold text-[#111827]">{title}</h2>
      {description ? (
        <p
          className="mt-2 text-sm leading-relaxed text-[#6b7280]"
          style={{ whiteSpace: 'nowrap' }}
        >
          {description}
        </p>
      ) : null}
      {actionLabel && (onAction || actionTo) ? (
        <div className="mt-5">
          <Button
            to={actionTo}
            onClick={onAction}
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
