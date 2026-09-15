import { Check } from 'lucide-react'
import { getProfileCompletion } from '../data/clientProfileData'

export default function ProfileCompletionCard({ profile }) {
  const { percent, complete } = getProfileCompletion(profile)

  return (
    <section className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-[#111827]">
            Profile Completion
          </h3>
          <p className="mt-1 text-sm text-[#6b7280]">
            {complete
              ? 'Your profile is complete and ready for a smoother wellness experience.'
              : 'Complete your profile to help BioFit provide a smoother wellness experience.'}
          </p>
        </div>
        {complete ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f5f0] px-2.5 py-1 text-[11px] font-bold text-[#005a40]">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Profile Complete
          </span>
        ) : (
          <span className="font-display text-2xl font-bold text-[#005a40]">
            {percent}%
          </span>
        )}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eef2f0]">
        <div
          className="bf-progress-fill h-full rounded-full bg-[#005a40]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  )
}
