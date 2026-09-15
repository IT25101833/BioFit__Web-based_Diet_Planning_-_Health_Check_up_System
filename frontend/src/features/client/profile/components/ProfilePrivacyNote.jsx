import { Shield } from 'lucide-react'

export default function ProfilePrivacyNote() {
  return (
    <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[#6b7280]">
      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#005a40]" strokeWidth={2.1} />
      Your personal information is protected and only accessible according to
      BioFit&apos;s role-based permissions.
    </p>
  )
}
