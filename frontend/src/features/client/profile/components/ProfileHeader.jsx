import { Camera, Pencil } from 'lucide-react'
import Avatar from '../../../../components/ui/Avatar'
import Badge from '../../../../components/ui/Badge'
import Button from '../../../../components/ui/Button'
import { getFullName } from '../data/clientProfileData'

export default function ProfileHeader({ profile, onEdit }) {
  const fullName = getFullName(profile)

  return (
    <section className="relative overflow-hidden rounded-[1.25rem] border border-[#e8ecf1] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-7">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 55% 80% at 100% 0%, rgba(204,251,241,0.45) 0%, transparent 55%), linear-gradient(135deg, #ffffff 0%, #f7faf9 100%)',
        }}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative mx-auto w-fit sm:mx-0">
            <Avatar name={fullName} src={profile.avatarUrl || undefined} size="xl" />
            <span className="absolute right-0 bottom-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white bg-[#e6f5f0] text-[#005a40]">
              <Camera className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#111827]">
                {fullName}
              </h2>
              <Badge tone="green">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                {profile.accountStatus}
              </Badge>
            </div>
            <p className="mt-1 text-sm font-medium text-[#005a40]">BioFit Client</p>
            <dl className="mt-3 space-y-1 text-sm text-[#5b6577]">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 sm:justify-start">
                <dt className="text-[#8b93a1]">Client ID:</dt>
                <dd className="font-semibold text-[#111827]">{profile.id}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 sm:justify-start">
                <dt className="text-[#8b93a1]">Email:</dt>
                <dd className="font-medium text-[#111827]">{profile.email}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[12px] text-[#9ca3af]">
              Profile photo upload coming soon
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={onEdit}
          className="rounded-xl !bg-[#005a40] hover:!bg-[#004833] sm:self-start lg:self-center"
        >
          <Pencil className="h-4 w-4" strokeWidth={2.1} />
          Edit Profile
        </Button>
      </div>
    </section>
  )
}
