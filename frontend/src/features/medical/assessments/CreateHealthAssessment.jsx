import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import Toast from '../../../components/ui/Toast'
import PrivacyBanner from '../shared/PrivacyBanner'
import {
  findClientOption,
  readClientUserIdParam,
} from '../shared/medicalNav'
import { fetchClientOptions } from '../health-records/data/healthRecordData'
import HealthAssessmentForm from './components/HealthAssessmentForm'
import {
  createAssessment,
  fetchAssessmentById,
  updateAssessment,
} from './data/healthAssessmentData'

export default function CreateHealthAssessment({ mode: modeProp = 'create' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { id: paramId } = useParams()
  const editId = modeProp === 'edit' ? paramId : location.state?.editId
  const mode = editId ? 'edit' : modeProp
  const preselectedClientUserId = readClientUserIdParam(searchParams)
  const [initial, setInitial] = useState(null)
  const [clients, setClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientsError, setClientsError] = useState('')
  const [clientWarning, setClientWarning] = useState('')
  const [loading, setLoading] = useState(Boolean(editId))
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  async function loadClients() {
    setClientsLoading(true)
    setClientsError('')
    try {
      setClients(await fetchClientOptions())
    } catch {
      setClients([])
      setClientsError('Unable to load clients. Please try again.')
    } finally {
      setClientsLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  async function loadAssessment() {
    if (!editId) return
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

  useEffect(() => {
    if (editId) {
      loadAssessment()
      return
    }
    if (preselectedClientUserId && clients.length) {
      const match = findClientOption(clients, preselectedClientUserId)
      if (match) {
        setInitial({
          clientId: match.value,
          clientName: match.clientName || match.label.replace(/\s*\(.*\)$/, ''),
          userId: match.userId ?? preselectedClientUserId,
        })
        setClientWarning('')
      } else {
        setClientWarning(
          `Client user ID ${preselectedClientUserId} is not in your attended clients list. Attend them from Appointments first.`,
        )
      }
    }
  }, [editId, preselectedClientUserId, clients])

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
    } catch (err) {
      setFormError(
        err?.message
          ? `We couldn’t save this assessment: ${err.message}`
          : 'We couldn’t save this assessment. Your entries are still on the form.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading || clientsLoading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title={error} onRetry={loadAssessment} />
  if (clientsError) return <ErrorState title={clientsError} onRetry={loadClients} />

  return (
    <div>
      <p className="mb-3 text-[12px] text-[#8b93a1]">
        <Link to="/medical/assessments" className="hover:text-[#005a40] hover:underline">
          Health Assessments
        </Link>
        {mode === 'edit' ? ' › Edit' : ' › Create'}
      </p>

      <PageHeader
        title={mode === 'edit' ? 'Edit Health Assessment' : 'New Health Assessment'}
        description="Record structured wellness observations and follow-up requirements."
      />
      <PrivacyBanner description="Assessment notes are restricted to authorized medical workflows." />
      {clientWarning ? (
        <p
          className="mb-4 rounded-2xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]"
          role="status"
        >
          {clientWarning}
        </p>
      ) : null}
      <HealthAssessmentForm
        mode={mode}
        initialValues={initial}
        clients={clients}
        saving={saving}
        formError={formError}
        onCancel={() => navigate('/medical/assessments')}
        onSubmit={handleSubmit}
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
