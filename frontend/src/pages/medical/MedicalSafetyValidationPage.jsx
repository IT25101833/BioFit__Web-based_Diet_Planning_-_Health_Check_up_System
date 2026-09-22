import MedicalLayout from '../../components/layout/MedicalLayout'
import SafetyValidations from '../../features/medical/safety-validation/SafetyValidations'

export default function MedicalSafetyValidationPage() {
  return (
    <MedicalLayout
      title="Safety Validation"
      breadcrumb="Medical Advisor / Safety Validation"
    >
      <SafetyValidations />
    </MedicalLayout>
  )
}
