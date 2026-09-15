import { UserRound } from 'lucide-react'
import { formatDisplayDate } from '../data/clientProfileData'
import { InfoRow, ProfileSectionCard } from './ProfileSectionCard'

export default function PersonalInformationCard({ profile, onEdit }) {
  return (
    <ProfileSectionCard
      title="Personal Information"
      icon={UserRound}
      onEdit={onEdit}
    >
      <InfoRow label="First Name" value={profile.firstName} />
      <InfoRow label="Last Name" value={profile.lastName} />
      <InfoRow
        label="Date of Birth"
        value={formatDisplayDate(profile.dateOfBirth)}
      />
      <InfoRow label="Gender" value={profile.gender} />
    </ProfileSectionCard>
  )
}
