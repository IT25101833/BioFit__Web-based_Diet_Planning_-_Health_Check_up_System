import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import Toast from '../../../components/ui/Toast'
import ProgrammeForm from './components/ProgrammeForm'
import {
  deactivateManagerProgramme,
  fetchManagerProgrammeById,
  formatManagerDate,
  updateManagerProgramme,
} from './data/programmeManagementData'

export default function EditProgramme() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [programme, setProgramme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setProgramme(await fetchManagerProgrammeById(id))
    } catch {
      setError('We couldn’t load this programme.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function handleSubmit(payload) {
    setSubmitting(true)
    try {
      await updateManagerProgramme(id, payload)
      setToast('Changes saved.')
      window.setTimeout(() => navigate(`/manager/programmes/${id}`), 650)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeactivate() {
    await deactivateManagerProgramme(id)
    setDeactivateOpen(false)
    setToast('Programme deactivated.')
    window.setTimeout(() => navigate('/manager/programmes'), 650)
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error || !programme) {
    return <ErrorState title="We couldn’t load this programme." onRetry={load} />
  }

  return (
    <div>
      <PageHeader
        title="Edit Wellness Programme"
        description={`Last updated ${formatManagerDate(programme.lastUpdated)}`}
      />
      <ProgrammeForm
        mode="edit"
        initialValues={programme}
        submitting={submitting}
        onCancel={() => navigate(`/manager/programmes/${id}`)}
        onSubmit={handleSubmit}
        onDeactivate={() => setDeactivateOpen(true)}
      />
      <ConfirmDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        title="Deactivate this programme?"
        description="Clients and historical programme information will remain available."
        confirmLabel="Deactivate"
        tone="danger"
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
