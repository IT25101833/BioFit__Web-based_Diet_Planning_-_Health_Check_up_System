import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import SectionCard from '../../../../components/ui/SectionCard'
import Select from '../../../../components/ui/Select'
import TextArea from '../../../../components/ui/TextArea'
import { fetchExercises } from '../../exercises/data/exerciseData'
import { getClientOptions } from '../data/workoutPlanData'

function newDay() {
  return {
    id: `d-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    day: 'Monday',
    title: 'New session',
    exercises: [],
  }
}

function newWeek(index) {
  return {
    id: `w-${Date.now()}-${index}`,
    label: `Week ${index}`,
    days: [newDay()],
  }
}

const emptyForm = {
  name: '',
  clientId: '',
  goal: '',
  difficulty: 'Beginner',
  startDate: '',
  endDate: '',
  sessionsPerWeek: '3',
  sessionDuration: '45 min',
  description: '',
  status: 'Draft',
  weeks: [newWeek(1)],
}

export default function WorkoutPlanForm({
  mode = 'create',
  initialValues,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [exercises, setExercises] = useState([])
  const clientOptions = useMemo(() => getClientOptions(), [])
  const selectedClient = clientOptions.find((c) => c.value === form.clientId)?.client

  useEffect(() => {
    fetchExercises().then(setExercises)
  }, [])

  useEffect(() => {
    if (initialValues) {
      setForm({
        ...emptyForm,
        ...initialValues,
        sessionsPerWeek: String(initialValues.sessionsPerWeek || '3'),
        weeks: initialValues.weeks?.length ? initialValues.weeks : [newWeek(1)],
      })
    }
  }, [initialValues])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate(status) {
    const next = {}
    if (!form.clientId) next.clientId = 'Select a client.'
    if (!form.name.trim()) next.name = 'Plan name is required.'
    if (!form.goal.trim()) next.goal = 'Goal is required.'
    if (!form.startDate) next.startDate = 'Start date is required.'
    if (!form.endDate) next.endDate = 'End date is required.'
    if (status === 'Active' && selectedClient?.safety?.reviewRequired) {
      next.safety =
        'This client has health considerations that may require review before assigning this workout plan.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event, statusOverride) {
    event.preventDefault()
    const status = statusOverride || form.status || 'Draft'
    if (!validate(status)) return
    const client = clientOptions.find((c) => c.value === form.clientId)?.client
    await onSubmit?.({
      ...form,
      status,
      sessionsPerWeek: Number(form.sessionsPerWeek),
      clientName: client?.name || form.clientName,
      programme: client?.programme || form.programme,
      totalWeeks: form.weeks.length,
    })
  }

  function updateWeek(weekId, updater) {
    setForm((prev) => ({
      ...prev,
      weeks: prev.weeks.map((week) => (week.id === weekId ? updater(week) : week)),
    }))
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-4" noValidate>
      <SectionCard title="Client">
        <Select
          label="Select client"
          required
          value={form.clientId}
          onChange={(e) => update('clientId', e.target.value)}
          options={clientOptions.map(({ value, label }) => ({ value, label }))}
          error={errors.clientId}
        />
        {selectedClient ? (
          <div className="mt-4 grid gap-3 rounded-2xl border border-[#eef2f0] bg-[#f8faf9] p-4 sm:grid-cols-2">
            <Info label="Fitness goal" value={selectedClient.goals?.[0] || '—'} />
            <Info label="Experience level" value={selectedClient.experience} />
            <Info
              label="Exercise restrictions"
              value={
                selectedClient.safety.restrictions.length
                  ? selectedClient.safety.restrictions.join('; ')
                  : 'None noted'
              }
            />
            <Info label="Medical clearance" value={selectedClient.safety.medicalClearance} />
          </div>
        ) : null}
      </SectionCard>

      {selectedClient ? (
        <SectionCard title="Client safety considerations">
          <div className="space-y-2 text-sm text-[#4b5563]">
            <p>Medical Clearance: {selectedClient.safety.medicalClearance}</p>
            <p>
              Restriction:{' '}
              {selectedClient.safety.restrictions[0] || 'None noted for current plan'}
            </p>
            <p>
              Mobility note:{' '}
              {selectedClient.safety.mobilityNotes[0] || 'None noted'}
            </p>
          </div>
          {selectedClient.safety.reviewRequired ? (
            <p className="mt-3 rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm text-[#b45309]">
              This client has health considerations that may require review before assigning
              this workout plan.
            </p>
          ) : null}
          {errors.safety ? (
            <p className="bf-field-error mt-2" role="alert">
              {errors.safety}
            </p>
          ) : null}
        </SectionCard>
      ) : null}

      <SectionCard title="Plan information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            className="sm:col-span-2"
            label="Workout plan name"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
          />
          <Input
            label="Goal"
            required
            value={form.goal}
            onChange={(e) => update('goal', e.target.value)}
            error={errors.goal}
          />
          <Select
            label="Difficulty"
            value={form.difficulty}
            onChange={(e) => update('difficulty', e.target.value)}
            options={[
              { value: 'Beginner', label: 'Beginner' },
              { value: 'Intermediate', label: 'Intermediate' },
              { value: 'Advanced', label: 'Advanced' },
            ]}
          />
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
            type="number"
            min="1"
            label="Sessions per week"
            value={form.sessionsPerWeek}
            onChange={(e) => update('sessionsPerWeek', e.target.value)}
          />
          <Input
            label="Estimated session duration"
            value={form.sessionDuration}
            onChange={(e) => update('sessionDuration', e.target.value)}
          />
          <TextArea
            className="sm:col-span-2"
            label="Description"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Workout builder"
        actions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="!text-[#005a40]"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                weeks: [...prev.weeks, newWeek(prev.weeks.length + 1)],
              }))
            }
          >
            <Plus className="h-4 w-4" />
            Add Week
          </Button>
        }
      >
        <div className="space-y-4">
          {form.weeks.map((week) => (
            <div key={week.id} className="rounded-2xl border border-[#eef2f0] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <Input
                  label="Week label"
                  value={week.label}
                  onChange={(e) =>
                    updateWeek(week.id, (w) => ({ ...w, label: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="!text-[#005a40]"
                  onClick={() =>
                    updateWeek(week.id, (w) => ({
                      ...w,
                      days: [...w.days, newDay()],
                    }))
                  }
                >
                  + Add Workout Day
                </Button>
              </div>

              <div className="space-y-3">
                {week.days.map((day) => (
                  <div key={day.id} className="rounded-2xl bg-[#f8faf9] p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Day"
                        value={day.day}
                        onChange={(e) =>
                          updateWeek(week.id, (w) => ({
                            ...w,
                            days: w.days.map((d) =>
                              d.id === day.id ? { ...d, day: e.target.value } : d,
                            ),
                          }))
                        }
                      />
                      <Input
                        label="Session title"
                        value={day.title}
                        onChange={(e) =>
                          updateWeek(week.id, (w) => ({
                            ...w,
                            days: w.days.map((d) =>
                              d.id === day.id ? { ...d, title: e.target.value } : d,
                            ),
                          }))
                        }
                      />
                    </div>

                    <div className="mt-3 space-y-2">
                      {day.exercises.map((ex, index) => (
                        <div
                          key={`${day.id}-${index}`}
                          className="grid gap-2 rounded-xl border border-[#e8ecf1] bg-white p-3 sm:grid-cols-6"
                        >
                          <Select
                            className="sm:col-span-2"
                            label="Exercise"
                            value={ex.exerciseId}
                            onChange={(e) => {
                              const selected = exercises.find((item) => item.id === e.target.value)
                              updateWeek(week.id, (w) => ({
                                ...w,
                                days: w.days.map((d) =>
                                  d.id === day.id
                                    ? {
                                        ...d,
                                        exercises: d.exercises.map((item, i) =>
                                          i === index
                                            ? {
                                                ...item,
                                                exerciseId: e.target.value,
                                                name: selected?.name || '',
                                              }
                                            : item,
                                        ),
                                      }
                                    : d,
                                ),
                              }))
                            }}
                            options={exercises.map((item) => ({
                              value: item.id,
                              label: item.name,
                            }))}
                          />
                          <Input
                            label="Sets"
                            value={ex.sets}
                            onChange={(e) =>
                              updateWeek(week.id, (w) => ({
                                ...w,
                                days: w.days.map((d) =>
                                  d.id === day.id
                                    ? {
                                        ...d,
                                        exercises: d.exercises.map((item, i) =>
                                          i === index ? { ...item, sets: e.target.value } : item,
                                        ),
                                      }
                                    : d,
                                ),
                              }))
                            }
                          />
                          <Input
                            label="Reps"
                            value={ex.reps}
                            onChange={(e) =>
                              updateWeek(week.id, (w) => ({
                                ...w,
                                days: w.days.map((d) =>
                                  d.id === day.id
                                    ? {
                                        ...d,
                                        exercises: d.exercises.map((item, i) =>
                                          i === index ? { ...item, reps: e.target.value } : item,
                                        ),
                                      }
                                    : d,
                                ),
                              }))
                            }
                          />
                          <Input
                            label="Duration"
                            value={ex.duration}
                            onChange={(e) =>
                              updateWeek(week.id, (w) => ({
                                ...w,
                                days: w.days.map((d) =>
                                  d.id === day.id
                                    ? {
                                        ...d,
                                        exercises: d.exercises.map((item, i) =>
                                          i === index
                                            ? { ...item, duration: e.target.value }
                                            : item,
                                        ),
                                      }
                                    : d,
                                ),
                              }))
                            }
                          />
                          <div className="flex items-end">
                            <Button
                              type="button"
                              size="sm"
                              className="!bg-[#fff7ed] !text-[#b45309]"
                              onClick={() =>
                                updateWeek(week.id, (w) => ({
                                  ...w,
                                  days: w.days.map((d) =>
                                    d.id === day.id
                                      ? {
                                          ...d,
                                          exercises: d.exercises.filter((_, i) => i !== index),
                                        }
                                      : d,
                                  ),
                                }))
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-3 !text-[#005a40]"
                      onClick={() =>
                        updateWeek(week.id, (w) => ({
                          ...w,
                          days: w.days.map((d) =>
                            d.id === day.id
                              ? {
                                  ...d,
                                  exercises: [
                                    ...d.exercises,
                                    {
                                      exerciseId: '',
                                      name: '',
                                      sets: '',
                                      reps: '',
                                      duration: '',
                                      rest: '',
                                      notes: '',
                                    },
                                  ],
                                }
                              : d,
                          ),
                        }))
                      }
                    >
                      + Add Exercise
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex flex-wrap justify-between gap-2.5">
        <Button type="button" variant="outline" onClick={onCancel} className="!text-[#4b5563]">
          Cancel
        </Button>
        <div className="flex flex-wrap gap-2.5">
          {mode === 'create' ? (
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={(e) => handleSubmit(e, 'Draft')}
              className="!text-[#005a40]"
            >
              Save as Draft
            </Button>
          ) : null}
          <Button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, mode === 'edit' ? form.status || 'Active' : 'Active')}
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            {submitting
              ? 'Saving…'
              : mode === 'edit'
                ? 'Save Changes'
                : 'Assign Plan'}
          </Button>
        </div>
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
