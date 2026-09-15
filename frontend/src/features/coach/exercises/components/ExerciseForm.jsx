import { useEffect, useState } from 'react'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import SectionCard from '../../../../components/ui/SectionCard'
import Select from '../../../../components/ui/Select'
import TextArea from '../../../../components/ui/TextArea'
import {
  difficulties,
  exerciseCategories,
  targetAreas,
} from '../data/exerciseData'

const empty = {
  name: '',
  category: '',
  difficulty: '',
  targetArea: '',
  equipment: '',
  instructions: '',
  startingPosition: '',
  movement: '',
  completion: '',
  safetyNotes: '',
  sets: '',
  reps: '',
  duration: '',
  rest: '',
}

export default function ExerciseForm({
  mode = 'create',
  initialValues,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialValues) setForm({ ...empty, ...initialValues })
  }, [initialValues])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Exercise name is required.'
    if (!form.category) next.category = 'Category is required.'
    if (!form.difficulty) next.difficulty = 'Difficulty is required.'
    if (!form.targetArea) next.targetArea = 'Target area is required.'
    if (!form.instructions.trim()) next.instructions = 'Instructions are required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    await onSubmit?.(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <SectionCard title="Exercise details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            className="sm:col-span-2"
            label="Exercise name"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
          />
          <Select
            label="Category"
            required
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            options={exerciseCategories.map((v) => ({ value: v, label: v }))}
            error={errors.category}
          />
          <Select
            label="Difficulty"
            required
            value={form.difficulty}
            onChange={(e) => update('difficulty', e.target.value)}
            options={difficulties.map((v) => ({ value: v, label: v }))}
            error={errors.difficulty}
          />
          <Select
            label="Target area"
            required
            value={form.targetArea}
            onChange={(e) => update('targetArea', e.target.value)}
            options={targetAreas.map((v) => ({ value: v, label: v }))}
            error={errors.targetArea}
          />
          <Input
            label="Equipment"
            value={form.equipment}
            onChange={(e) => update('equipment', e.target.value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Instructions">
        <div className="grid gap-4">
          <TextArea
            label="Instructions"
            required
            value={form.instructions}
            onChange={(e) => update('instructions', e.target.value)}
            error={errors.instructions}
          />
          <TextArea
            label="Starting position"
            value={form.startingPosition}
            onChange={(e) => update('startingPosition', e.target.value)}
          />
          <TextArea
            label="Movement"
            value={form.movement}
            onChange={(e) => update('movement', e.target.value)}
          />
          <TextArea
            label="Completion"
            value={form.completion}
            onChange={(e) => update('completion', e.target.value)}
          />
          <TextArea
            label="Safety notes"
            value={form.safetyNotes}
            onChange={(e) => update('safetyNotes', e.target.value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Recommended defaults">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Sets" value={form.sets} onChange={(e) => update('sets', e.target.value)} />
          <Input label="Repetitions" value={form.reps} onChange={(e) => update('reps', e.target.value)} />
          <Input
            label="Duration"
            value={form.duration}
            onChange={(e) => update('duration', e.target.value)}
          />
          <Input
            label="Rest period"
            value={form.rest}
            onChange={(e) => update('rest', e.target.value)}
          />
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-2.5">
        <Button type="button" variant="outline" onClick={onCancel} className="!text-[#4b5563]">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
        >
          {submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Save Exercise'}
        </Button>
      </div>
    </form>
  )
}
