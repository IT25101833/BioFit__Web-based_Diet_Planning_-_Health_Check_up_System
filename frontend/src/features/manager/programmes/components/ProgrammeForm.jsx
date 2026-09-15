import { useEffect, useState } from 'react'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import SectionCard from '../../../../components/ui/SectionCard'
import Select from '../../../../components/ui/Select'
import TextArea from '../../../../components/ui/TextArea'
import {
  programmeTypes,
  staffOptions,
  weeksBetween,
} from '../data/programmeManagementData'

const emptyForm = {
  name: '',
  type: '',
  description: '',
  status: 'Draft',
  startDate: '',
  endDate: '',
  capacity: '',
  coachId: '',
  nutritionId: '',
  medicalId: 'none',
  goals: '',
  includedServices: '',
  notes: '',
}

export default function ProgrammeForm({
  mode = 'create',
  initialValues,
  onSubmit,
  onCancel,
  onDeactivate,
  submitting = false,
}) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialValues) {
      setForm({
        ...emptyForm,
        ...initialValues,
        capacity: String(initialValues.capacity ?? ''),
        medicalId: initialValues.medicalId || 'none',
        nutritionId: initialValues.nutritionId || '',
        coachId: initialValues.coachId || '',
      })
    }
  }, [initialValues])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function resolveNames(payload) {
    const coach = staffOptions.coaches.find((item) => item.value === payload.coachId)
    const nutrition = staffOptions.nutrition.find(
      (item) => item.value === payload.nutritionId,
    )
    const medicalId = payload.medicalId === 'none' ? '' : payload.medicalId
    const medical = staffOptions.medical.find((item) => item.value === payload.medicalId)
    return {
      ...payload,
      medicalId,
      coachName: coach?.label || '',
      nutritionName: nutrition?.label || '',
      medicalName: medicalId ? medical?.label || '' : '',
      capacity: Number(payload.capacity),
      durationWeeks: weeksBetween(payload.startDate, payload.endDate) || payload.durationWeeks,
    }
  }

  function validate(nextStatus) {
    const next = {}
    if (!form.name.trim()) next.name = 'Programme name is required.'
    if (!form.type) next.type = 'Programme type is required.'
    if (!form.description.trim()) next.description = 'Description is required.'
    if (!form.startDate) next.startDate = 'Start date is required.'
    if (!form.endDate) next.endDate = 'End date is required.'
    if (!form.capacity || Number(form.capacity) <= 0)
      next.capacity = 'Enter a valid capacity.'
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      next.endDate = 'End date must be after start date.'
    }
    if (nextStatus === 'Active' && !form.coachId) {
      next.coachId = 'Assign a fitness coach before activating.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event, statusOverride) {
    event.preventDefault()
    const status = statusOverride || form.status || 'Draft'
    if (!validate(status)) return
    await onSubmit?.(resolveNames({ ...form, status }))
  }

  const duration = weeksBetween(form.startDate, form.endDate)

  return (
    <form onSubmit={(event) => handleSubmit(event)} className="space-y-4" noValidate>
      <SectionCard title="Basic information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Programme name"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
            className="sm:col-span-2"
          />
          <Select
            label="Programme type"
            required
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            options={programmeTypes.map((type) => ({ value: type, label: type }))}
            error={errors.type}
          />
          <Select
            label="Programme status"
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            options={[
              { value: 'Draft', label: 'Draft' },
              { value: 'Upcoming', label: 'Upcoming' },
              { value: 'Active', label: 'Active' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
          <TextArea
            label="Description"
            required
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            error={errors.description}
            className="sm:col-span-2"
          />
        </div>
      </SectionCard>

      <SectionCard title="Programme schedule">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            type="date"
            label="Start date"
            required
            value={form.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            error={errors.startDate}
          />
          <Input
            type="date"
            label="End date"
            required
            value={form.endDate}
            onChange={(e) => update('endDate', e.target.value)}
            error={errors.endDate}
          />
          <Input
            label="Duration"
            value={duration ? `${duration} weeks` : ''}
            readOnly
            footNote="Calculated from start and end dates"
          />
          <Input
            type="number"
            min="1"
            label="Capacity"
            required
            value={form.capacity}
            onChange={(e) => update('capacity', e.target.value)}
            error={errors.capacity}
          />
        </div>
      </SectionCard>

      <SectionCard title="Professional assignment">
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Assigned fitness coach"
            value={form.coachId}
            onChange={(e) => update('coachId', e.target.value)}
            options={staffOptions.coaches}
            error={errors.coachId}
            placeholder="Select coach"
          />
          <Select
            label="Assigned nutrition consultant"
            value={form.nutritionId}
            onChange={(e) => update('nutritionId', e.target.value)}
            options={staffOptions.nutrition}
            placeholder="Select consultant"
          />
          <Select
            label="Medical advisor"
            value={form.medicalId}
            onChange={(e) => update('medicalId', e.target.value)}
            options={staffOptions.medical}
            placeholder="Optional"
          />
        </div>
      </SectionCard>

      <SectionCard title="Programme details">
        <div className="grid gap-4">
          <TextArea
            label="Programme goals"
            value={form.goals}
            onChange={(e) => update('goals', e.target.value)}
          />
          <TextArea
            label="Included services"
            value={form.includedServices}
            onChange={(e) => update('includedServices', e.target.value)}
          />
          <TextArea
            label="Additional notes"
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </div>
      </SectionCard>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="!border-[#e8ecf1] !text-[#4b5563]"
          >
            Cancel
          </Button>
          {mode === 'edit' && onDeactivate ? (
            <Button
              type="button"
              onClick={onDeactivate}
              className="!bg-[#fff7ed] !text-[#b45309] hover:!bg-[#ffedd5]"
            >
              Deactivate Programme
            </Button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2.5">
          {mode === 'create' ? (
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={(event) => handleSubmit(event, 'Draft')}
              className="!border-[#005a40]/25 !text-[#005a40]"
            >
              Save as Draft
            </Button>
          ) : null}
          <Button
            type="submit"
            disabled={submitting}
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            {submitting
              ? 'Saving…'
              : mode === 'edit'
                ? 'Save Changes'
                : 'Create Programme'}
          </Button>
        </div>
      </div>
    </form>
  )
}
