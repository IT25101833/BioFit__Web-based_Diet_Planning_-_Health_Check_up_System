import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Checkbox from '../../../components/ui/Checkbox'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Input from '../../../components/ui/Input'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Select from '../../../components/ui/Select'
import TextArea from '../../../components/ui/TextArea'
import Toast from '../../../components/ui/Toast'
import PrivacyBanner from '../shared/PrivacyBanner'
import { clientOptions } from '../health-records/data/healthRecordData'
import {
  createHealthAlert,
  findSimilarActiveAlert,
} from './data/healthAlertData'

const emptyForm = {
  clientId: '',
  title: '',
  priority: 'Moderate',
  relatedAssessmentId: '',
  reason: '',
  followUpRequired: false,
  followUpDueDate: '',
  followUpNotes: '',
  status: 'Open',
}

export default function CreateHealthAlert() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [duplicate, setDuplicate] = useState(null)
  const [pendingPayload, setPendingPayload] = useState(null)

  const clients = useMemo(() => clientOptions, [])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    const next = {}
    if (!form.clientId) next.clientId = 'Select a client.'
    if (!form.title.trim()) next.title = 'Alert title is required.'
    if (!form.reason.trim()) next.reason = 'Reason / professional notes are required.'
    if (form.followUpRequired && !form.followUpDueDate) {
      next.followUpDueDate = 'Due date is required when follow-up is marked.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function buildPayload() {
    const selected = clients.find((c) => c.value === form.clientId)
    return {
      clientId: form.clientId,
      clientName: selected?.label?.split(' (')[0] || selected?.label || '',
      title: form.title.trim(),
      priority: form.priority,
      relatedAssessmentId: form.relatedAssessmentId || null,
      reason: form.reason.trim(),
      status: form.status || 'Open',
      followUp: {
        required: form.followUpRequired,
        dueDate: form.followUpDueDate || null,
        notes: form.followUpNotes,
        status: form.followUpRequired ? 'Pending' : 'Not Required',
      },
    }
  }

  async function save(payload) {
    setSaving(true)
    setFormError('')
    try {
      const created = await createHealthAlert(payload)
      setToast('Health risk alert created.')
      window.setTimeout(() => navigate(`/medical/health-alerts/${created.id}`), 650)
    } catch {
      setFormError('We couldn’t create this alert. Your entries are still on the form.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    const payload = buildPayload()
    const similar = findSimilarActiveAlert(payload.clientId, payload.title)
    if (similar) {
      setPendingPayload(payload)
      setDuplicate(similar)
      return
    }
    await save(payload)
  }

  return (
    <div>
      <PageHeader
        title="Create Health Risk Alert"
        description="Raise a tracked wellness safety alert for care-team awareness and follow-up."
      />
      <PrivacyBanner />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError ? (
          <p
            className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]"
            role="alert"
          >
            {formError}
          </p>
        ) : null}

        <SectionCard title="Alert details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Client"
              required
              value={form.clientId}
              onChange={(e) => update('clientId', e.target.value)}
              options={clients.map(({ value, label }) => ({ value, label }))}
              error={errors.clientId}
            />
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => update('priority', e.target.value)}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Moderate', label: 'Moderate' },
                { value: 'High', label: 'High' },
              ]}
            />
            <Input
              className="sm:col-span-2"
              label="Alert title"
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              error={errors.title}
            />
            <Input
              label="Related assessment ID"
              value={form.relatedAssessmentId}
              onChange={(e) => update('relatedAssessmentId', e.target.value)}
              footNote="Optional — e.g. ha-1"
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              options={[
                { value: 'Open', label: 'Open' },
                { value: 'Under Review', label: 'Under Review' },
              ]}
            />
            <TextArea
              className="sm:col-span-2"
              label="Reason / professional notes"
              required
              value={form.reason}
              onChange={(e) => update('reason', e.target.value)}
              error={errors.reason}
            />
          </div>
        </SectionCard>

        <SectionCard title="Follow-up">
          <div className="grid gap-4 sm:grid-cols-2">
            <Checkbox
              id="alert-follow-up"
              checked={form.followUpRequired}
              onChange={(e) => update('followUpRequired', e.target.checked)}
              label="Follow-up required"
            />
            <Input
              type="date"
              label="Follow-up due date"
              value={form.followUpDueDate}
              onChange={(e) => update('followUpDueDate', e.target.value)}
              error={errors.followUpDueDate}
            />
            <TextArea
              className="sm:col-span-2"
              label="Follow-up notes"
              value={form.followUpNotes}
              onChange={(e) => update('followUpNotes', e.target.value)}
            />
          </div>
        </SectionCard>

        <div className="flex flex-wrap justify-between gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/medical/health-alerts')}
            className="!text-[#4b5563]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            {saving ? 'Creating…' : 'Create Alert'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(duplicate)}
        onClose={() => {
          setDuplicate(null)
          setPendingPayload(null)
        }}
        title="A similar active health risk alert already exists for this client."
        description={
          duplicate
            ? `${duplicate.id} · ${duplicate.title} · ${duplicate.status}`
            : undefined
        }
        confirmLabel="View Existing Alert"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (duplicate) navigate(`/medical/health-alerts/${duplicate.id}`)
        }}
      >
        <p className="text-sm text-[#4b5563]">
          Creating a duplicate is blocked. Open the existing alert to continue review, or cancel
          and adjust the title if this is a distinct concern.
        </p>
        {pendingPayload ? (
          <p className="mt-3 text-[12px] text-[#6b7280]">
            Draft title: {pendingPayload.title}
          </p>
        ) : null}
      </ConfirmDialog>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
