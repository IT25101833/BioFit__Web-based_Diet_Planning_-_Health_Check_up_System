export default function Badge({ children, tone = 'green', className = '' }) {
  const tones = {
    green: 'bg-[#e6f5f0] text-[#005a40]',
    teal: 'bg-[#ccfbf1] text-[#0f766e]',
    amber: 'bg-[#fff7ed] text-[#b45309]',
    gray: 'bg-[#f4f6fb] text-[#6b7280]',
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
