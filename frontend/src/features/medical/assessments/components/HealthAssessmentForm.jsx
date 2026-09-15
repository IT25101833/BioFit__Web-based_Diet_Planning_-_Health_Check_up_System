import { useEffect, useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button'
import Checkbox from '../../../../components/ui/Checkbox'
import Input from '../../../../components/ui/Input'
import SectionCard from '../../../../components/ui/SectionCard'
import Select from '../../../../components/ui/Select'
import TextArea from '../../../../components/ui/TextArea'
import { clientOptions } from '../../health-records/data/healthRecordData'

const emptyForm = {
  clientId: '',
  clientName: '',
  date: '2026-09-09',
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
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const options = useMemo(() => clients || clientOptions || [], [clients])

  useEffect(() => {
    if (!initialValues) return
    const obs = initialValues.observations || {}
    setForm({
      ...emptyForm,
      clientId: initialValues.clientId || '',
      clientName: initialValues.clientName || '',
      date: initialValues.date || emptyForm.date,
      type: initialValues.type || '',
      general: obs.general || '',
      concerns: obs.concerns || '',
      restrictions: obs.restrictions || '',
      allergyReview: obs.allergyReview || '',
      safety: obs.safety || '',
      professionalNotes: initialValues.professionalNotes || '',
      followUpRequired: Boolean(initialValues.followUpRequired),
      nextReview: initialValues.nextReview || '',
      alertRequired: Boolean(initialValues.alertRequired),
      guidanceRequired: Boolean(initialValues.guidanceRequired),
    })
  }, [initialValues])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    const next = {}
    if (!form.clientId) next.clientId = 'Select a client.'
    if (!form.date) next.date = 'Assessment date is required.'
    if (!form.type) next.type = 'Assessment type is required.'
    if (form.followUpRequired && !form.nextReview) {
      next.nextReview = 'Follow-up date is required when follow-up is marked.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    const selected = options.find((c) => c.value === form.clientId)
    await onSubmit?.({
      clientId: form.clientId,
      clientName:
        selected?.label?.split(' (')[0] || form.clientName || selected?.label || '',
      date: form.date,
      type: form.type,
      professionalNotes: form.professionalNotes,
      followUpRequired: form.followUpRequired,
      nextReview: form.nextReview,
      alertRequired: form.alertRequired,
      guidanceRequired: form.guidanceRequired,
      observations: {
        general: form.general,
        concerns: form.concerns,
        restrictions: form.restrictions,
        allergyReview: form.allergyReview,
        safety: form.safety,
      },
    })
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
          ) : (
            <Input label="Client" value={form.clientName || form.clientId} disabled />
          )}
          <Input
            type="date"
            label="Assessment date"
            required
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
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
            onChange={(e) => update('nextReview', e.target.value)}
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
