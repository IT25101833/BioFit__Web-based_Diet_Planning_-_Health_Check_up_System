import { Lock, ShieldCheck } from 'lucide-react'
import Badge from '../../../../components/ui/Badge'
import Button from '../../../../components/ui/Button'
import { InfoRow, ProfileSectionCard } from './ProfileSectionCard'

export default function AccountSecurityCard({ profile, onChangePassword }) {
  return (
    <ProfileSectionCard title="Account Security" icon={Lock}>
      <InfoRow label="Password" value="••••••••" />
      <p className="mb-4 text-sm text-[#6b7280]">
        Keep your BioFit account secure with a strong password.
      </p>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-[#f7faf9] px-3.5 py-3">
          <p className="text-[12px] font-medium text-[#8b93a1]">
            Email Verification
          </p>
          <div className="mt-1.5">
            <Badge tone={profile.emailVerified ? 'teal' : 'amber'}>
              {profile.emailVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
        </div>
        <div className="rounded-xl bg-[#f7faf9] px-3.5 py-3">
          <p className="text-[12px] font-medium text-[#8b93a1]">
            Account Security
          </p>
          <div className="mt-1.5 inline-flex items-center gap-1.5">
            <Badge tone="green">
              <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />
              Secure
            </Badge>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl !border-[#cfd8e3] !text-[#005a40] hover:!border-[#005a40] hover:!bg-[#e6f5f0]"
        onClick={onChangePassword}
      >
        Change Password
      </Button>
    </ProfileSectionCard>
  )
}
