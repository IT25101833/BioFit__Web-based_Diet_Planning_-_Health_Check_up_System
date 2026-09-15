import MedicalLayout from '../../components/layout/MedicalLayout'
import MedicalProfile from '../../features/medical/profile/MedicalProfile'

export default function MedicalProfilePage() {
  return (
    <MedicalLayout title="My Profile" breadcrumb="Medical Advisor / Profile">
      <MedicalProfile />
    </MedicalLayout>
  )
}
