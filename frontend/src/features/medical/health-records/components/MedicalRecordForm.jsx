import { useEffect, useMemo, useState } from 'react'
import Button from '../../../../components/ui/Button'
import Checkbox from '../../../../components/ui/Checkbox'
import Input from '../../../../components/ui/Input'
import SectionCard from '../../../../components/ui/SectionCard'
import Select from '../../../../components/ui/Select'
import TextArea from '../../../../components/ui/TextArea'
import { clientOptions } from '../data/healthRecordData'

const emptyForm = {
  clientId: '',
  clientName: '',
  programme: '',
  conditions: '',
  allergies: '',
  healthConsiderations: '',
  medicalNotes: '',
  previousHistory: '',
  professionalNotes: '',
  followUpRequired: false,
  nextReviewDate: '',
  guidanceRequired: false,
  fitnessGuidance: '',
  nutritionGuidance: '',
}

function listToText(value) {
  if (Array.isArray(value)) return value.join('\n')
  return value || ''
}

function textToList(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export default function MedicalRecordForm({
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
    const history = initialValues.medicalHistory || {}
    const guidance = initialValues.wellnessGuidance || {}
    setForm({
      ...emptyForm,
      clientId: initialValues.clientId || '',
      clientName: initialValues.clientName || '',
      programme: initialValues.programme || '',
      conditions: listToText(history.conditions ?? initialValues.conditions),
      allergies: listToText(history.allergies ?? initialValues.allergies),
      healthConsiderations: listToText(
        history.healthConsiderations ?? initialValues.healthConsiderations,
      ),
      medicalNotes: listToText(history.previousNotes ?? initialValues.medicalNotes),
      previousHistory: initialValues.previousHistory || history.summary || '',
      professionalNotes: initialValues.professionalNotes || '',
      followUpRequired: Boolean(initialValues.followUpRequired),
      nextReviewDate: initialValues.nextReviewDate || initialValues.nextCheckup || '',
      guidanceRequired: Boolean(initialValues.guidanceRequired),
      fitnessGuidance: guidance.fitness || initialValues.fitnessGuidance || '',
      nutritionGuidance: guidance.nutrition || initialValues.nutritionGuidance || '',
    })
  }, [initialValues])

  const selectedClient = options.find((c) => c.value === form.clientId)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    const next = {}
    if (mode === 'create' && !form.clientId) next.clientId = 'Select a client.'
    if (!form.conditions.trim() && !form.allergies.trim() && !form.healthConsiderations.trim()) {
      next.health = 'Add at least one health information field.'
    }
    if (form.followUpRequired && !form.nextReviewDate) {
      next.nextReviewDate = 'Next review date is required when follow-up is marked.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    await onSubmit?.({
      clientId: form.clientId,
      clientName: selectedClient?.label || form.clientName,
      programme: selectedClient?.programme || form.programme,
      medicalHistory: {
        conditions: textToList(form.conditions),
        allergies: textToList(form.allergies),
        healthConsiderations: textToList(form.healthConsiderations),
        previousNotes: textToList(form.medicalNotes),
        summary: form.previousHistory,
      },
      professionalNotes: form.professionalNotes,
      followUpRequired: form.followUpRequired,
      nextReviewDate: form.nextReviewDate,
      nextCheckup: form.nextReviewDate,
      guidanceRequired: form.guidanceRequired,
      wellnessGuidance: {
        fitness: form.fitnessGuidance,
        nutrition: form.nutritionGuidance,
        status: form.guidanceRequired ? 'Update Required' : 'Current',
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {formError ? (
        <p className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">
          {formError}
        </p>
      ) : null}

      <SectionCard title="Client">
        {mode === 'create' ? (
          <Select
            label="Select client"
            required
            value={form.clientId}
            onChange={(e) => {
              const next = options.find((c) => c.value === e.target.value)
              setForm((prev) => ({
                ...prev,
                clientId: e.target.value,
                clientName: next?.label || '',
                programme: next?.programme || '',
              }))
            }}
            options={options.map(({ value, label }) => ({ value, label }))}
            error={errors.clientId}
          />
        ) : (
          <div className="grid gap-3 rounded-2xl border border-[#eef2f0] bg-[#f8faf9] p-4 sm:grid-cols-3">
            <Info label="Name" value={form.clientName || '—'} />
            <Info label="Client ID" value={form.clientId || '—'} />
            <Info label="Programme" value={form.programme || '—'} />
          </div>
        )}
        {mode === 'create' && selectedClient ? (
          <div className="mt-4 grid gap-3 rounded-2xl border border-[#eef2f0] bg-[#f8faf9] p-4 sm:grid-cols-2">
            <Info label="Client ID" value={selectedClient.value} />
            <Info label="Programme" value={selectedClient.programme || '—'} />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="Health Information">
        {errors.health ? (
          <p className="bf-field-error mb-3" role="alert">
            {errors.health}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea
            label="Relevant conditions"
            value={form.conditions}
            onChange={(e) => update('conditions', e.target.value)}
            hint="One item per line"
          />
          <TextArea
            label="Allergies"
            value={form.allergies}
            onChange={(e) => update('allergies', e.target.value)}
            hint="One item per line"
          />
          <TextArea
            className="sm:col-span-2"
            label="Current health considerations"
            value={form.healthConsiderations}
            onChange={(e) => update('healthConsiderations', e.target.value)}
            hint="One item per line"
          />
          <TextArea
            className="sm:col-span-2"
            label="Medical notes"
            value={form.medicalNotes}
            onChange={(e) => update('medicalNotes', e.target.value)}
          />
          <TextArea
            className="sm:col-span-2"
            label="Previous medical history summary"
            value={form.previousHistory}
            onChange={(e) => update('previousHistory', e.target.value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Medical Advisor Notes">
        <p className="mb-4 rounded-2xl border border-[#005a40]/15 bg-[#e6f5f0] px-4 py-3 text-[12px] text-[#005a40]">
          Professional notes are restricted to authorized medical workflows and are not shared with
          coaches or nutrition consultants.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea
            className="sm:col-span-2"
            label="Professional review notes"
            value={form.professionalNotes}
            onChange={(e) => update('professionalNotes', e.target.value)}
          />
          <Checkbox
            id="follow-up-required"
            checked={form.followUpRequired}
            onChange={(e) => update('followUpRequired', e.target.checked)}
            label="Follow-up required"
          />
          <Checkbox
            id="guidance-required"
            checked={form.guidanceRequired}
            onChange={(e) => update('guidanceRequired', e.target.checked)}
            label="Wellness safety guidance required"
          />
          <Input
            type="date"
            label="Next review date"
            value={form.nextReviewDate}
            onChange={(e) => update('nextReviewDate', e.target.value)}
            error={errors.nextReviewDate}
          />
        </div>
      </SectionCard>

      <SectionCard title="Shared Wellness Guidance">
        <p className="mb-4 text-[12px] text-[#6b7280]">
          Only high-level safety guidance appropriate for Fitness Coach and Nutrition Consultant.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea
            label="Fitness guidance"
            value={form.fitnessGuidance}
            onChange={(e) => update('fitnessGuidance', e.target.value)}
          />
          <TextArea
            label="Nutrition guidance"
            value={form.nutritionGuidance}
            onChange={(e) => update('nutritionGuidance', e.target.value)}
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
          {saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Save Medical Record'}
        </Button>
      </div>
    </form>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#8b93a1]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  )
}
