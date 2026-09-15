export default function PageHeader({
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <div
      className={[
        'mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between',
        className,
      ].join(' ')}
    >
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827] sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#6b7280]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>
      ) : null}
    </div>
  )
}
