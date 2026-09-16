export default function SectionCard({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className = '',
}) {
  return (
    <section
      className={[
        'rounded-[1.25rem] border border-[var(--bf-border)] bg-[var(--bf-surface-raised)] p-5 shadow-[var(--bf-shadow-out)] sm:p-6',
        className,
      ].join(' ')}
    >
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              {Icon ? (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bf-primary-soft)] text-[var(--bf-ink)]">
                  <Icon className="h-4 w-4" strokeWidth={2.1} />
                </span>
              ) : null}
              {title ? (
                <h2 className="font-display text-lg font-bold tracking-tight text-[var(--bf-ink)]">
                  {title}
                </h2>
              ) : null}
            </div>
            {description ? (
              <p className="mt-1.5 text-sm text-[var(--bf-muted)]">{description}</p>
            ) : null}
          </div>
          {actions || null}
        </div>
      )}
      {children}
    </section>
  )
}
