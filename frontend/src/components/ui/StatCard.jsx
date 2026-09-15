export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  className = '',
}) {
  return (
    <article
      className={[
        'rounded-[1.25rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]',
        className,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#8b93a1]">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-[#111827]">
            {value}
          </p>
          {hint ? (
            <p className="mt-2 text-[12px] leading-relaxed text-[#6b7280]">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
            <Icon className="h-4.5 w-4.5" strokeWidth={2.1} />
          </span>
        ) : null}
      </div>
    </article>
  )
}
