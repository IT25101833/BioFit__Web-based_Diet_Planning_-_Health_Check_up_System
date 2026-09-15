import { ShieldCheck } from 'lucide-react'

export default function PrivacyBanner({
  title = 'Protected Health Information',
  description = 'Access to health records is restricted to authorized medical workflows.',
}) {
  return (
    <div
      className="mb-5 flex gap-3 rounded-[1.25rem] border border-[#005a40]/15 bg-[#e6f5f0] px-4 py-3.5 sm:items-center"
      role="note"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#005a40]">
        <ShieldCheck className="h-5 w-5" strokeWidth={2.1} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#005a40]">{title}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-[#374151]">{description}</p>
      </div>
    </div>
  )
}
