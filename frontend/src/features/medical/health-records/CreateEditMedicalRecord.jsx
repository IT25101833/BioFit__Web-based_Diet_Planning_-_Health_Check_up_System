import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { USE_MOCK, shouldUseMockData } from '../../../api/client'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import Toast from '../../../components/ui/Toast'
import PrivacyBanner from '../shared/PrivacyBanner'
import MedicalRecordForm from './components/MedicalRecordForm'
import {
  clientOptions,
  createHealthRecord,
  fetchHealthRecordById,
  fetchHealthRecords,
  updateHealthRecord,
} from './data/healthRecordData'

export default function CreateEditMedicalRecord({ mode = 'create' }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [initial, setInitial] = useState(null)
  const [clients, setClients] = useState(clientOptions)
  const [loading, setLoading] = useState(mode === 'edit')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    async function loadClients() {
      if (shouldUseMockData()) {
        setClients(clientOptions)
        return
      }
      try {
        const records = await fetchHealthRecords()
        const fromRecords = (Array.isArray(records) ? records : [])
          .map((r) => ({
            value: r.clientId,
            label: `${r.clientName || 'Client'} (${r.clientId})`,
            programme: r.programme || '',
          }))
          .filter((c) => c.value)
        const merged = [...fromRecords]
        for (const option of clientOptions) {
          if (!merged.some((c) => c.value === option.value)) merged.push(option)
        }
        setClients(merged.length ? merged : clientOptions)
      } catch {
        setClients(clientOptions)
      }
    }
    loadClients()
  }, [])

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
      const saved =
        mode === 'edit'
          ? await updateHealthRecord(id, payload)
          : await createHealthRecord(payload)
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

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title={error} onRetry={() => window.location.reload()} />

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
        saving={saving}
        formError={formError}
        onCancel={() => navigate('/medical/health-records')}
        onSubmit={handleSubmit}
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
