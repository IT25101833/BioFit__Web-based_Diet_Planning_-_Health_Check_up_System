export default function FilterTabs({
  options = [],
  value,
  onChange,
  ariaLabel = 'Filters',
  className = '',
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={[
        'inline-flex max-w-full flex-wrap gap-1 rounded-2xl border border-[#e8ecf1] bg-white p-1 shadow-[0_4px_14px_rgba(15,23,42,0.03)]',
        className,
      ].join(' ')}
    >
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange?.(option.value)}
            className={[
              'rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-colors',
              selected
                ? 'bg-[#e6f5f0] text-[#005a40]'
                : 'text-[#6b7280] hover:bg-[#f4f6fb] hover:text-[#111827]',
            ].join(' ')}
          >
            {option.label}
            {typeof option.count === 'number' ? (
              <span className="ml-1.5 text-[11px] opacity-70">({option.count})</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
