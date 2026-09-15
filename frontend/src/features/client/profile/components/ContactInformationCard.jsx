import { Mail } from 'lucide-react'
import Badge from '../../../../components/ui/Badge'
import { InfoRow, ProfileSectionCard } from './ProfileSectionCard'

export default function ContactInformationCard({ profile, onEdit }) {
  return (
    <ProfileSectionCard
      title="Contact Information"
      icon={Mail}
      onEdit={onEdit}
    >
      <InfoRow
        label="Email Address"
        value={profile.email}
        trailing={
          profile.emailVerified ? (
            <Badge tone="teal">Verified</Badge>
          ) : (
            <Badge tone="amber">Unverified</Badge>
          )
        }
      />
      <InfoRow label="Contact Number" value={profile.contactNumber} />
      <InfoRow label="Address" value={profile.address} />
    </ProfileSectionCard>
  )
}
