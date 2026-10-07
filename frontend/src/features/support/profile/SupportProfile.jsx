import { useEffect, useState } from 'react'
import { Award, Clock, Mail, Phone, ShieldCheck, User } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import ErrorState from '../../../components/ui/ErrorState'
import SectionCard from '../../../components/ui/SectionCard'
import Avatar from '../../../components/ui/Avatar'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Toast from '../../../components/ui/Toast'
import {
  fetchSupportProfile,
  updateSupportProfile,
} from './data/supportProfileData'

export default function SupportProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchSupportProfile()
      setProfile(data)
      setForm(data)
    } catch {
      setError('We couldn’t load your profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const next = await updateSupportProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        contactNumber: form.contactNumber,
        specialization: form.specialization,
      })
      setProfile(next)
      setForm(next)
      setEditing(false)
      setToast('Support officer profile updated successfully.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={4} />
  if (error || !profile) {
    return <ErrorState title={error || 'Profile not found'} onRetry={load} />
  }

  const fullName = `${profile.firstName} ${profile.lastName}`

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your Customer Experience Officer account details, desk availability, and contact information."
        actions={
          !editing ? (
            <Button
              onClick={() => setEditing(true)}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Edit Profile
            </Button>
          ) : null
        }
      />

      {/* Main Profile Card */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#eef2f0]">
          <div className="flex items-center gap-4">
            <Avatar name={fullName} size="xl" />
            <div>
              <h2 className="font-display text-xl font-bold text-[#111827] sm:text-2xl">
                {fullName}
              </h2>
              <p className="text-sm font-semibold text-[#005a40]">{profile.role}</p>
              <p className="text-xs text-[#6b7280]">{profile.specialization || 'Customer Experience'}</p>
            </div>
          </div>
          <span className="rounded-full bg-[#e6f5f0] px-3 py-1 text-xs font-semibold text-[#005a40]">
            Staff ID: {profile.id}
          </span>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="profile-first-name"
                label="First Name"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
              <Input
                id="profile-last-name"
                label="Last Name"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="profile-email"
                label="Work Email Address"
                type="email"
                disabled
                value={profile.email}
                footNote="Managed by VitalLife Identity & Access Administration"
              />
              <Input
                id="profile-phone"
                label="Contact Number"
                required
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="profile-specialization"
                label="Focus"
                value={form.specialization || ''}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eef2f0]">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm(profile)
                  setEditing(false)
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              <div className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-4 space-y-1">
                <span className="text-[#6b7280] flex items-center gap-1.5 font-medium">
                  <Mail className="h-3.5 w-3.5 text-[#005a40]" />
                  Work Email
                </span>
                <p className="font-semibold text-[#111827] text-sm truncate">{profile.email}</p>
              </div>

              <div className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-4 space-y-1">
                <span className="text-[#6b7280] flex items-center gap-1.5 font-medium">
                  <Phone className="h-3.5 w-3.5 text-[#005a40]" />
                  Direct Hotline / Desk
                </span>
                <p className="font-semibold text-[#111827] text-sm">{profile.contactNumber}</p>
              </div>

              <div className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-4 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[#6b7280] flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5 text-[#005a40]" />
                  Focus
                </span>
                <p className="font-semibold text-[#111827] text-sm">{profile.specialization || 'Customer experience'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e8ecf1] bg-white p-5 space-y-2 text-xs">
              <h3 className="font-display font-bold text-[#111827] text-sm">
                Role
              </h3>
              <p className="text-[#4b5563] leading-relaxed text-sm">
                {profile.role}. Account status: {profile.accountStatus || 'Active'}.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6b7280] pt-4 border-t border-[#eef2f0]">
              <ShieldCheck className="h-4 w-4 text-[#005a40] shrink-0" />
              <span>BioFit Level 2 Support Officer Security Credentials Verified.</span>
            </div>
          </div>
        )}
      </SectionCard>

      <Toast open={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
