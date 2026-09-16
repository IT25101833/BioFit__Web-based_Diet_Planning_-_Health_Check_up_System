export default function Badge({ children, tone = 'green', className = '' }) {
  const tones = {
    green: 'bg-[var(--bf-primary-soft)] text-[var(--bf-ink)]',
    teal: 'bg-[var(--bf-primary-soft)] text-[var(--bf-ink)]',
    amber: 'bg-[#fff7ed] text-[#b45309]',
    gray: 'bg-[var(--bf-surface)] text-[var(--bf-muted)]',
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase',
        tones[tone] || tones.green,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
