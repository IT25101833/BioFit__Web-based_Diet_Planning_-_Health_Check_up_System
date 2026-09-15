import { Pencil } from 'lucide-react'

export function InfoRow({ label, value, trailing }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eef2f0] py-3.5 last:border-0 last:pb-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-[#8b93a1]">{label}</p>
        <p className="mt-1 text-sm font-semibold text-[#111827]">
          {value || (
            <span className="font-medium text-[#9ca3af]">Not added yet</span>
          )}
        </p>
      </div>
      {trailing || null}
    </div>
  )
}

export function ProfileSectionCard({
  title,
  icon: Icon,
  onEdit,
  editLabel = 'Edit',
  children,
}) {
  return (
    <section className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
              <Icon className="h-4 w-4" strokeWidth={2.1} />
            </span>
          ) : null}
          <h3 className="font-display text-lg font-bold tracking-tight text-[#111827]">
            {title}
          </h3>
        </div>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#005a40] transition-colors hover:bg-[#e6f5f0]"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2.2} />
            {editLabel}
          </button>
        ) : null}
      </div>
      <div>{children}</div>
    </section>
  )
}
