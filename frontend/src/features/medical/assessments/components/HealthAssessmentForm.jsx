import { useEffect, useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button'
import Checkbox from '../../../../components/ui/Checkbox'
import Input from '../../../../components/ui/Input'
import SectionCard from '../../../../components/ui/SectionCard'
import Select from '../../../../components/ui/Select'
import TextArea from '../../../../components/ui/TextArea'
import {
  FUTURE_DATE_MESSAGE,
  REQUIRED_DATE_MESSAGE,
  isDateAfterToday,
  isDateBeforeToday,
  isValidIsoDate,
  localTodayIso,
} from '../../../booking/bookingEngine'

const emptyForm = {
  clientId: '',
  clientName: '',
  date: '',
  type: '',
  general: '',
  concerns: '',
  restrictions: '',
  allergyReview: '',
  safety: '',
  professionalNotes: '',
  followUpRequired: false,
  nextReview: '',
  alertRequired: false,
  guidanceRequired: false,
}

export default function HealthAssessmentForm({
  mode = 'create',
  initialValues,
  clients,
  onSubmit,
  onCancel,
  saving = false,
  formError = '',
}) {
  const today = localTodayIso()
  const [form, setForm] = useState(() => ({ ...emptyForm, date: today }))
  const [errors, setErrors] = useState({})
  const options = useMemo(() => (Array.isArray(clients) ? clients : []), [clients])

  useEffect(() => {
    if (!initialValues) {
      setForm({ ...emptyForm, date: localTodayIso() })
      setErrors({})
      return
    }
    const obs = initialValues.observations || {}
    setForm({
      ...emptyForm,
      clientId: initialValues.clientId || '',
      clientName: initialValues.clientName || '',
      date: initialValues.date ? String(initialValues.date).slice(0, 10) : localTodayIso(),
      type: initialValues.type || '',
      general: obs.general || '',
      concerns: obs.concerns || '',
      restrictions: obs.restrictions || '',
      allergyReview: obs.allergyReview || '',
      safety: obs.safety || '',
      professionalNotes: initialValues.professionalNotes || '',
      followUpRequired: Boolean(initialValues.followUpRequired),
      nextReview: initialValues.nextReview
        ? String(initialValues.nextReview).slice(0, 10)
        : '',
      alertRequired: Boolean(initialValues.alertRequired),
      guidanceRequired: Boolean(initialValues.guidanceRequired),
    })
    setErrors({})
  }, [initialValues])

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

  function handleAssessmentDateChange(value) {
    if (value && isDateAfterToday(value, today)) {
      setErrors((prev) => ({ ...prev, date: FUTURE_DATE_MESSAGE }))
      return
    }
    update('date', value)
  }

  function handleNextReviewChange(value) {
    if (value && isDateBeforeToday(value, today)) {
      setErrors((prev) => ({
        ...prev,
        nextReview: 'Follow-up date cannot be in the past.',
      }))
      return
    }
    update('nextReview', value)
  }

  function validate() {
    const next = {}
    if (!form.clientId) next.clientId = 'Select a client.'
    if (!form.date) next.date = REQUIRED_DATE_MESSAGE
    else if (!isValidIsoDate(form.date)) next.date = 'Please enter a valid date.'
    else if (isDateAfterToday(form.date, today)) next.date = FUTURE_DATE_MESSAGE
    if (!form.type) next.type = 'Assessment type is required.'
    if (form.followUpRequired && !form.nextReview) {
      next.nextReview = 'Follow-up date is required when follow-up is marked.'
    } else if (form.nextReview) {
      if (!isValidIsoDate(form.nextReview)) next.nextReview = 'Please enter a valid date.'
      else if (isDateBeforeToday(form.nextReview, today)) {
        next.nextReview = 'Follow-up date cannot be in the past.'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    const selected = options.find((c) => c.value === form.clientId)
    const payload = {
      clientId: form.clientId,
      clientName:
        selected?.clientName ||
        selected?.label?.split(' (')[0] ||
        form.clientName ||
        selected?.label ||
        '',
      userId: selected?.userId,
      date: form.date,
      type: form.type,
      professionalNotes: form.professionalNotes || '',
      followUpRequired: form.followUpRequired,
      alertRequired: form.alertRequired,
      guidanceRequired: form.guidanceRequired,
      status: form.followUpRequired ? 'Follow-up Required' : 'Completed',
      observations: {
        general: form.general || '',
        concerns: form.concerns || '',
        restrictions: form.restrictions || '',
        allergyReview: form.allergyReview || '',
        safety: form.safety || '',
      },
    }
    if (form.nextReview) {
      payload.nextReview = form.nextReview
    }
    await onSubmit?.(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {formError ? (
        <p
          className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]"
          role="alert"
        >
          {formError}
        </p>
      ) : null}

      <SectionCard title="Assessment details">
        <div className="grid gap-4 sm:grid-cols-3">
          {mode === 'create' ? (
            options.length === 0 ? (
              <p className="sm:col-span-3 rounded-2xl border border-[#eef2f0] bg-[#f8faf9] px-4 py-3 text-sm text-[#6b7280]">
                No attended clients available. Attend a patient from Appointments first to select a
                client.
              </p>
            ) : (
              <Select
                label="Client"
                required
                value={form.clientId}
                onChange={(e) => {
                  const next = options.find((c) => c.value === e.target.value)
                  setForm((prev) => ({
                    ...prev,
                    clientId: e.target.value,
                    clientName: next?.label?.split(' (')[0] || '',
                  }))
                }}
                options={options.map(({ value, label }) => ({ value, label }))}
                error={errors.clientId}
              />
            )
          ) : (
            <Input label="Client" value={form.clientName || form.clientId} disabled />
          )}
          <Input
            type="date"
            label="Assessment date"
            required
            value={form.date}
            max={today}
            onChange={(e) => handleAssessmentDateChange(e.target.value)}
            error={errors.date}
          />
          <Select
            label="Assessment type"
            required
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            options={[
              { value: 'Initial Health Assessment', label: 'Initial Health Assessment' },
              { value: 'Routine Health Check-up', label: 'Routine Health Check-up' },
              { value: 'Follow-up Review', label: 'Follow-up Review' },
              { value: 'Programme Health Review', label: 'Programme Health Review' },
            ]}
            error={errors.type}
          />
        </div>
      </SectionCard>

      <SectionCard title="Observations">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea
            label="General health observations"
            value={form.general}
            onChange={(e) => update('general', e.target.value)}
          />
          <TextArea
            label="Current health concerns"
            value={form.concerns}
            onChange={(e) => update('concerns', e.target.value)}
          />
          <TextArea
            label="Relevant restrictions"
            value={form.restrictions}
            onChange={(e) => update('restrictions', e.target.value)}
          />
          <TextArea
            label="Allergy review"
            value={form.allergyReview}
            onChange={(e) => update('allergyReview', e.target.value)}
          />
          <TextArea
            className="sm:col-span-2"
            label="Safety considerations"
            value={form.safety}
            onChange={(e) => update('safety', e.target.value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Review">
        <p className="mb-4 rounded-2xl border border-[#005a40]/15 bg-[#e6f5f0] px-4 py-3 text-[12px] text-[#005a40]">
          Professional notes are restricted to authorized medical workflows.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea
            className="sm:col-span-2"
            label="Professional notes"
            value={form.professionalNotes}
            onChange={(e) => update('professionalNotes', e.target.value)}
          />
          <Checkbox
            id="ha-follow-up"
            checked={form.followUpRequired}
            onChange={(e) => update('followUpRequired', e.target.checked)}
            label="Follow-up required"
          />
          <Checkbox
            id="ha-alert-required"
            checked={form.alertRequired}
            onChange={(e) => update('alertRequired', e.target.checked)}
            label="Health risk alert required"
          />
          <Checkbox
            id="ha-guidance-required"
            checked={form.guidanceRequired}
            onChange={(e) => update('guidanceRequired', e.target.checked)}
            label="Wellness guidance required"
          />
          <Input
            type="date"
            label="Follow-up date"
            value={form.nextReview}
            min={today}
            onChange={(e) => handleNextReviewChange(e.target.value)}
            error={errors.nextReview}
          />
        </div>
      </SectionCard>

      <div className="flex flex-wrap justify-between gap-2.5">
        <Button type="button" variant="outline" onClick={onCancel} className="!text-[#4b5563]">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
        >
          {saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Save Assessment'}
        </Button>
      </div>
    </form>
  )
}
