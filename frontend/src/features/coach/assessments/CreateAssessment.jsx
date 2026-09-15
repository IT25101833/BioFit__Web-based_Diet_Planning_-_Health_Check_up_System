import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Select from '../../../components/ui/Select'
import TextArea from '../../../components/ui/TextArea'
import Toast from '../../../components/ui/Toast'
import { getClientOptions } from '../workout-plans/data/workoutPlanData'
import { createAssessment } from './data/assessmentData'

export default function CreateAssessment() {
  const navigate = useNavigate()
  const clients = useMemo(() => getClientOptions(), [])
  const [form, setForm] = useState({
    clientId: '',
    date: '2026-09-09',
    type: '',
    activityLevel: '',
    experience: '',
    strength: '',
    endurance: '',
    mobility: '',
    flexibility: '',
    goals: '',
    observations: '',
    limitations: '',
    safetyNotes: '',
    reviewRequired: 'No',
    coachNotes: '',
    nextAssessment: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const next = {}
    if (!form.clientId) next.clientId = 'Select a client.'
    if (!form.date) next.date = 'Assessment date is required.'
    if (!form.type) next.type = 'Assessment type is required.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSubmitting(true)
    try {
      const client = clients.find((c) => c.value === form.clientId)?.client
      const created = await createAssessment({
        ...form,
        clientName: client?.name,
        reviewRequired: form.reviewRequired === 'Yes',
      })
      setToast('Assessment saved.')
      window.setTimeout(() => navigate(`/coach/assessments/${created.id}`), 650)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="New Fitness Assessment"
        description="Record non-diagnostic fitness observations to support safe planning."
      />
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <SectionCard title="Assessment details">
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Client"
              required
              value={form.clientId}
              onChange={(e) => update('clientId', e.target.value)}
              options={clients.map(({ value, label }) => ({ value, label }))}
              error={errors.clientId}
            />
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
                { value: 'Initial Fitness Assessment', label: 'Initial Fitness Assessment' },
                { value: 'Progress Assessment', label: 'Progress Assessment' },
                {
                  value: 'Programme Completion Assessment',
                  label: 'Programme Completion Assessment',
                },
              ]}
              error={errors.type}
            />
          </div>
        </SectionCard>

        <SectionCard title="General fitness information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Activity level"
              value={form.activityLevel}
              onChange={(e) => update('activityLevel', e.target.value)}
            />
            <Input
              label="Fitness experience"
              value={form.experience}
              onChange={(e) => update('experience', e.target.value)}
            />
            <TextArea
              label="Strength observations"
              value={form.strength}
              onChange={(e) => update('strength', e.target.value)}
            />
            <TextArea
              label="Endurance observations"
              value={form.endurance}
              onChange={(e) => update('endurance', e.target.value)}
            />
            <TextArea
              label="Mobility observations"
              value={form.mobility}
              onChange={(e) => update('mobility', e.target.value)}
            />
            <TextArea
              label="Flexibility observations"
              value={form.flexibility}
              onChange={(e) => update('flexibility', e.target.value)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Goals">
          <div className="grid gap-4">
            <TextArea
              label="Fitness goals"
              value={form.goals}
              onChange={(e) => update('goals', e.target.value)}
            />
            <TextArea
              label="Coach observations"
              value={form.observations}
              onChange={(e) => update('observations', e.target.value)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Safety">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextArea
              label="Exercise limitations"
              value={form.limitations}
              onChange={(e) => update('limitations', e.target.value)}
            />
            <TextArea
              label="Safety considerations"
              value={form.safetyNotes}
              onChange={(e) => update('safetyNotes', e.target.value)}
            />
            <Select
              label="Professional review required?"
              value={form.reviewRequired}
              onChange={(e) => update('reviewRequired', e.target.value)}
              options={[
                { value: 'No', label: 'No' },
                { value: 'Yes', label: 'Yes' },
              ]}
            />
            <Input
              type="date"
              label="Next assessment date"
              value={form.nextAssessment}
              onChange={(e) => update('nextAssessment', e.target.value)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Notes">
          <TextArea
            label="Coach notes"
            value={form.coachNotes}
            onChange={(e) => update('coachNotes', e.target.value)}
          />
        </SectionCard>

        <div className="flex flex-wrap gap-2.5">
          <Button type="button" variant="outline" to="/coach/assessments">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            {submitting ? 'Saving…' : 'Save Assessment'}
          </Button>
        </div>
      </form>
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
