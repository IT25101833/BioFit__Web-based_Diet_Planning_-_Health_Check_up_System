import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../../components/ui/PageHeader'
import Toast from '../../../components/ui/Toast'
import ProgrammeForm from './components/ProgrammeForm'
import { createManagerProgramme } from './data/programmeManagementData'

export default function CreateProgramme() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  async function handleSubmit(payload) {
    setSubmitting(true)
    try {
      const created = await createManagerProgramme(payload)
      setToast('Programme created successfully.')
      window.setTimeout(() => navigate(`/manager/programmes/${created.id}`), 650)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Create Wellness Programme"
        description="Set up a new wellness programme for VitalLife Wellness clients."
      />
      <ProgrammeForm
        mode="create"
        submitting={submitting}
        onCancel={() => navigate('/manager/programmes')}
        onSubmit={handleSubmit}
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
