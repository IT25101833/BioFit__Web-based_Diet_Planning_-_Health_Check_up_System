import { useEffect, useState } from 'react'
import { Pencil, RefreshCw } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Toast from '../../../components/ui/Toast'
import AccountInformationCard from './components/AccountInformationCard'
import AccountSecurityCard from './components/AccountSecurityCard'
import ChangePasswordModal from './components/ChangePasswordModal'
import ContactInformationCard from './components/ContactInformationCard'
import DiscardChangesModal from './components/DiscardChangesModal'
import EditProfileModal from './components/EditProfileModal'
import EmergencyContactCard from './components/EmergencyContactCard'
import PersonalInformationCard from './components/PersonalInformationCard'
import ProfileCompletionCard from './components/ProfileCompletionCard'
import ProfileHeader from './components/ProfileHeader'
import ProfilePrivacyNote from './components/ProfilePrivacyNote'
import ProfileSkeleton from './components/ProfileSkeleton'
import {
  changeClientPassword,
  fetchClientProfile,
  updateClientProfile,
} from './data/clientProfileData'

export default function ClientProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [toast, setToast] = useState('')

  async function loadProfile() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchClientProfile()
      setProfile(data)
    } catch {
      setError('We couldn’t load your profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function handleSave(form) {
    const next = await updateClientProfile({
      ...profile,
      ...form,
      emergencyContact: { ...form.emergencyContact },
    })
    setProfile(next)
    setEditOpen(false)
    setDiscardOpen(false)
    setToast('Profile updated successfully.')
  }

  async function handlePasswordChange() {
    await changeClientPassword()
    setToast('Password updated successfully.')
  }

  if (loading) return <ProfileSkeleton />

  if (error || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="w-full max-w-md rounded-[1.25rem] border border-[#e8ecf1] bg-white p-8 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <h2 className="font-display text-xl font-bold text-[#111827]">
            We couldn&apos;t load your profile.
          </h2>
          <p className="mt-2 text-sm text-[#6b7280]">Please try again.</p>
          <Button
            type="button"
            className="mt-6 rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
            onClick={loadProfile}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 lg:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="whitespace-nowrap font-display text-[1.75rem] font-bold tracking-tight text-[#111827] sm:text-[2rem]">
              My Profile
            </h1>
            <p className="mt-1 text-sm text-[#6b7280] sm:whitespace-nowrap">
              Manage your personal details and BioFit account information.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl !border-[#cfd8e3] !text-[#005a40] hover:!border-[#005a40] hover:!bg-[#e6f5f0]"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <ProfileHeader profile={profile} onEdit={() => setEditOpen(true)} />
        <ProfileCompletionCard profile={profile} />

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <div className="space-y-4 lg:space-y-5">
            <PersonalInformationCard
              profile={profile}
              onEdit={() => setEditOpen(true)}
            />
            <ContactInformationCard
              profile={profile}
              onEdit={() => setEditOpen(true)}
            />
          </div>
          <div className="space-y-4 lg:space-y-5">
            <AccountInformationCard profile={profile} />
            <EmergencyContactCard
              profile={profile}
              onEdit={() => setEditOpen(true)}
            />
            <AccountSecurityCard
              profile={profile}
              onChangePassword={() => setPasswordOpen(true)}
            />
          </div>
        </div>

        <ProfilePrivacyNote />
      </div>

      <EditProfileModal
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onRequestClose={() => setDiscardOpen(true)}
        onSave={handleSave}
      />

      <DiscardChangesModal
        open={discardOpen}
        onContinue={() => setDiscardOpen(false)}
        onDiscard={() => {
          setDiscardOpen(false)
          setEditOpen(false)
        }}
      />

      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSubmit={handlePasswordChange}
      />

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </>
  )
}
