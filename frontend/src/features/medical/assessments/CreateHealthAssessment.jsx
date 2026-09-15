import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import Toast from '../../../components/ui/Toast'
import PrivacyBanner from '../shared/PrivacyBanner'
import { clientOptions } from '../health-records/data/healthRecordData'
import HealthAssessmentForm from './components/HealthAssessmentForm'
import {
  createAssessment,
  fetchAssessmentById,
  updateAssessment,
} from './data/healthAssessmentData'

export default function CreateHealthAssessment({ mode: modeProp = 'create' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: paramId } = useParams()
  const editId = modeProp === 'edit' ? paramId : location.state?.editId
  const mode = editId ? 'edit' : modeProp
  const preselectedClientId = new URLSearchParams(location.search).get('client') || ''
  const [initial, setInitial] = useState(null)
  const [loading, setLoading] = useState(Boolean(editId))
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (editId) {
      async function load() {
        setLoading(true)
        setError('')
        try {
          setInitial(await fetchAssessmentById(editId))
        } catch {
          setError('We couldn’t load this health assessment.')
        } finally {
          setLoading(false)
        }
      }
      load()
      return
    }
    if (preselectedClientId) {
      const match = clientOptions.find((c) => c.value === preselectedClientId)
      if (match) {
        setInitial({
          clientId: match.value,
          clientName: match.label.replace(/\s*\(.*\)$/, ''),
        })
      }
    }
  }, [editId, preselectedClientId])

  async function handleSubmit(payload) {
    setSaving(true)
    setFormError('')
    try {
      const saved =
        mode === 'edit'
          ? await updateAssessment(editId, payload)
          : await createAssessment(payload)
      setToast(mode === 'edit' ? 'Assessment updated.' : 'Assessment saved.')
      window.setTimeout(() => navigate(`/medical/assessments/${saved.id}`), 650)
    } catch {
      setFormError('We couldn’t save this assessment. Your entries are still on the form.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title={error} onRetry={() => window.location.reload()} />

  return (
    <div>
      <PageHeader
        title={mode === 'edit' ? 'Edit Health Assessment' : 'New Health Assessment'}
        description="Record structured wellness observations and follow-up requirements."
      />
      <PrivacyBanner description="Assessment notes are restricted to authorized medical workflows." />
      <HealthAssessmentForm
        mode={mode}
        initialValues={initial}
        clients={clientOptions}
        saving={saving}
        formError={formError}
        onCancel={() => navigate('/medical/assessments')}
        onSubmit={handleSubmit}
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
