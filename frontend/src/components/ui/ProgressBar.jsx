export default function ProgressBar({
  value = 0,
  label,
  showValue = true,
  className = '',
}) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-3 text-[12px]">
          {label ? (
            <span className="font-medium text-[#6b7280]">{label}</span>
          ) : (
            <span />
          )}
          {showValue ? (
            <span className="font-semibold text-[#005a40]">{clamped}%</span>
          ) : null}
        </div>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-[#eef2f0]"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className="bf-progress-fill h-full rounded-full bg-[#005a40] transition-[width] duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
