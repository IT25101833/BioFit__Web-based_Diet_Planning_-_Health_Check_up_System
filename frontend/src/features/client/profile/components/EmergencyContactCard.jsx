import { Shield } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import { InfoRow, ProfileSectionCard } from './ProfileSectionCard'

export default function EmergencyContactCard({ profile, onEdit }) {
  const contact = profile.emergencyContact
  const hasContact = Boolean(contact?.name?.trim() || contact?.contactNumber?.trim())

  return (
    <ProfileSectionCard
      title="Emergency Contact"
      icon={Shield}
      onEdit={onEdit}
      editLabel={hasContact ? 'Edit' : 'Add Contact'}
    >
      {hasContact ? (
        <>
          <InfoRow label="Name" value={contact.name} />
          <InfoRow label="Relationship" value={contact.relationship} />
          <InfoRow label="Contact Number" value={contact.contactNumber} />
        </>
      ) : (
        <div className="rounded-xl bg-[#f7faf9] px-4 py-5 text-center">
          <p className="text-sm font-medium text-[#9ca3af]">Not added yet</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 rounded-xl !border-[#cfd8e3] !text-[#005a40]"
            onClick={onEdit}
          >
            Add Contact
          </Button>
        </div>
      )}
    </ProfileSectionCard>
  )
}
