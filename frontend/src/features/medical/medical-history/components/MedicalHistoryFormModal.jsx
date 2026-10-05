import { useEffect, useState } from 'react'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import Modal from '../../../../components/ui/Modal'
import Select from '../../../../components/ui/Select'
import TextArea from '../../../../components/ui/TextArea'
import {
  FUTURE_DATE_MESSAGE,
  REQUIRED_DATE_MESSAGE,
  isDateAfterToday,
  isValidIsoDate,
  localTodayIso,
} from '../../../booking/bookingEngine'

const recordTypes = [
  { value: 'Condition', label: 'Condition' },
  { value: 'Allergy', label: 'Allergy' },
  { value: 'History', label: 'History' },
  { value: 'Other', label: 'Other' },
]

const severities = [
  { value: '', label: 'Not specified' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Severe', label: 'Severe' },
]

export default function MedicalHistoryFormModal({
  open,
  onClose,
  onSave,
  initial = null,
}) {
  const editing = Boolean(initial?.id)
  const synced = Boolean(initial?.syncedFromRecord || initial?.sourceHealthRecordId)
  const today = localTodayIso()
  const [form, setForm] = useState({
    clientId: '',
    clientName: '',
    userId: '',
    recordType: 'Condition',
    conditionName: '',
    allergyInfo: '',
    description: '',
    severity: '',
    recordedDate: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        clientId: initial.clientId || '',
        clientName: initial.clientName || '',
        userId: initial.userId || '',
        recordType: initial.recordType || 'Condition',
        conditionName: initial.conditionName || '',
        allergyInfo: initial.allergyInfo || '',
        description: initial.description || '',
        severity: initial.severity || '',
        recordedDate: initial.recordedDate ? String(initial.recordedDate).slice(0, 10) : '',
      })
    } else {
      setForm({
        clientId: '',
        clientName: '',
        userId: '',
        recordType: 'Condition',
        conditionName: '',
        allergyInfo: '',
        description: '',
        severity: '',
        recordedDate: today,
      })
    }
    setErrors({})
  }, [open, initial, today])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function handleRecordedDateChange(value) {
    if (value && isDateAfterToday(value, today)) {
      setErrors((prev) => ({ ...prev, recordedDate: FUTURE_DATE_MESSAGE }))
      return
    }
    update('recordedDate', value)
  }

  function validate() {
    const next = {}
    if (!editing) return false
    if (!form.recordType) next.recordType = 'Record type is required.'
    if (form.recordType === 'Condition' && !form.conditionName.trim()) {
      next.conditionName = 'Condition name is required.'
    }
    if (form.recordType === 'Allergy' && !form.allergyInfo.trim() && !form.conditionName.trim()) {
      next.allergyInfo = 'Allergy information is required.'
    }
    if (!form.description.trim() && !form.conditionName.trim() && !form.allergyInfo.trim()) {
      next.description = 'Please add a description or details.'
    }
    if (!form.recordedDate) {
      next.recordedDate = REQUIRED_DATE_MESSAGE
    } else if (!isValidIsoDate(form.recordedDate)) {
      next.recordedDate = 'Please enter a valid date.'
    } else if (isDateAfterToday(form.recordedDate, today)) {
      next.recordedDate = FUTURE_DATE_MESSAGE
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSave({
        ...form,
        clientId: form.clientId,
        clientName: form.clientName,
        userId: form.userId || undefined,
        recordedDate: form.recordedDate,
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update Medical History"
      description={
        synced
          ? 'Condition, allergy, and history details come from the client’s medical record. You can update severity and the recorded date.'
          : 'Update condition or allergy details. Patient ownership and created fields stay protected.'
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="rounded-xl border border-[#e8ecf1] bg-[#f8faf9] px-4 py-3 text-sm">
          <p className="text-[12px] text-[#6b7280]">Client</p>
          <p className="font-semibold text-[#111827]">
            {form.clientName} · {form.clientId}
          </p>
        </div>

        <Select
          label="Record type"
          required
          value={form.recordType}
          onChange={(e) => update('recordType', e.target.value)}
          options={recordTypes}
          error={errors.recordType}
          disabled={synced}
        />

        {form.recordType === 'Allergy' ? (
          <Input
            label="Allergy information"
            required
            value={form.allergyInfo}
            onChange={(e) => update('allergyInfo', e.target.value)}
            error={errors.allergyInfo}
            placeholder="e.g. Peanuts"
            disabled={synced}
          />
        ) : (
          <Input
            label="Condition name"
            required={form.recordType === 'Condition'}
            value={form.conditionName}
            onChange={(e) => update('conditionName', e.target.value)}
            error={errors.conditionName}
            placeholder="e.g. Hypertension"
            disabled={synced}
          />
        )}

        <TextArea
          label="Description / notes"
          required
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          error={errors.description}
          placeholder="Clinical notes relevant to this entry"
          disabled={synced}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Severity"
            value={form.severity}
            onChange={(e) => update('severity', e.target.value)}
            options={severities}
          />
          <Input
            label="Recorded date"
            type="date"
            required
            value={form.recordedDate}
            max={today}
            onChange={(e) => handleRecordedDateChange(e.target.value)}
            error={errors.recordedDate}
          />
        </div>
      </form>
    </Modal>
  )
}
