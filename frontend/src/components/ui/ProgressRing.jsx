export default function ProgressRing({
  value = 0,
  size = 88,
  stroke = 8,
  label,
  className = '',
}) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={['inline-flex flex-col items-center gap-2', className].join(' ')}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={label ? `${label}: ${clamped}%` : `${clamped}% complete`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#eef2f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#005a40"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="fill-[#111827] font-display text-[14px] font-bold"
        >
          {clamped}%
        </text>
      </svg>
      {label ? (
        <p className="text-center text-[12px] font-medium text-[#6b7280]">{label}</p>
      ) : null}
    </div>
  )
}
