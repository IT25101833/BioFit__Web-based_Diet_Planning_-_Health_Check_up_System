import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import Toast from '../../../components/ui/Toast'
import { fetchMedicalClients } from '../medical-history/data/medicalHistoryData'
import PrivacyBanner from '../shared/PrivacyBanner'
import MedicalRecordForm from './components/MedicalRecordForm'
import {
  createHealthRecord,
  fetchHealthRecordById,
  updateHealthRecord,
} from './data/healthRecordData'

function toSelectOptions(clients) {
  return (Array.isArray(clients) ? clients : [])
    .map((c) => ({
      value: String(c.id ?? c.userId ?? ''),
      label: c.name || c.clientName || 'Client',
      programme: c.programme || '',
      userId: c.id ?? c.userId,
      clientCode: c.clientId || (c.id || c.userId ? `BF-C${c.id ?? c.userId}` : ''),
    }))
    .filter((c) => c.value)
}

export default function CreateEditMedicalRecord({ mode = 'create' }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [initial, setInitial] = useState(null)
  const [clients, setClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(mode === 'create')
  const [clientsError, setClientsError] = useState('')
  const [loading, setLoading] = useState(mode === 'edit')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  async function loadClients() {
    if (mode !== 'create') return
    setClientsLoading(true)
    setClientsError('')
    try {
      const data = await fetchMedicalClients()
      setClients(toSelectOptions(data))
    } catch {
      setClients([])
      setClientsError('Unable to load clients. Please try again.')
    } finally {
      setClientsLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [mode])

  useEffect(() => {
    if (mode !== 'edit') return
    async function load() {
      setLoading(true)
      setError('')
      try {
        setInitial(await fetchHealthRecordById(id))
      } catch {
        setError('We couldn’t load this medical record.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mode, id])

  async function handleSubmit(payload) {
    setSaving(true)
    setFormError('')
    try {
      const selected = clients.find((c) => c.value === String(payload.userId || payload.clientId))
      const userId = Number(payload.userId || selected?.userId || payload.clientId)
      const body = {
        ...payload,
        userId: Number.isFinite(userId) ? userId : undefined,
        clientId: selected?.clientCode || (Number.isFinite(userId) ? `BF-C${userId}` : payload.clientId),
        clientName: selected?.label || payload.clientName,
      }
      const saved =
        mode === 'edit'
          ? await updateHealthRecord(id, body)
          : await createHealthRecord(body)
      setToast(mode === 'edit' ? 'Medical record updated.' : 'Medical record saved.')
      window.setTimeout(() => navigate(`/medical/health-records/${saved.id}`), 650)
    } catch (err) {
      setFormError(
        err?.message
          ? `We couldn’t save this medical record: ${err.message}`
          : 'We couldn’t save this medical record. Your entries are still on the form.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading || (mode === 'create' && clientsLoading)) {
    return <LoadingSkeleton rows={5} />
  }
  if (error) return <ErrorState title={error} onRetry={() => window.location.reload()} />
  if (mode === 'create' && clientsError) {
    return <ErrorState title={clientsError} onRetry={loadClients} />
  }

  return (
    <div>
      <PageHeader
        title={mode === 'edit' ? 'Edit Medical Record' : 'Create Medical Record'}
        description="Record authorized wellness health information and shared safety guidance."
      />
      <PrivacyBanner
        description="Professional notes remain restricted. Only shared wellness guidance is visible to other care roles."
      />
      <MedicalRecordForm
        mode={mode}
        initialValues={initial}
        clients={clients}
        clientsEmptyMessage={
          mode === 'create'
            ? 'No clients with appointments are currently available.'
            : undefined
        }
        saving={saving}
        formError={formError}
        onCancel={() => navigate('/medical/health-records')}
        onSubmit={handleSubmit}
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
