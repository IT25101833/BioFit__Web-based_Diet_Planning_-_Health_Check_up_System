import { BadgeCheck } from 'lucide-react'
import Badge from '../../../../components/ui/Badge'
import { formatShortDate } from '../data/clientProfileData'
import { InfoRow, ProfileSectionCard } from './ProfileSectionCard'

export default function AccountInformationCard({ profile }) {
  return (
    <ProfileSectionCard title="Account Information" icon={BadgeCheck}>
      <InfoRow label="Client ID" value={profile.id} />
      <InfoRow
        label="Account Status"
        value={profile.accountStatus}
        trailing={<Badge tone="green">{profile.accountStatus}</Badge>}
      />
      <InfoRow
        label="Member Since"
        value={formatShortDate(profile.memberSince)}
      />
      <InfoRow label="Last Login" value={profile.lastLogin} />
      <InfoRow label="Current Programme" value={profile.currentProgramme} />
    </ProfileSectionCard>
  )
}
