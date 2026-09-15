import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import SectionCard from '../../../../components/ui/SectionCard'
import Select from '../../../../components/ui/Select'
import TextArea from '../../../../components/ui/TextArea'
import { fetchDietaryRestrictionsByClient } from '../../dietary-restrictions/data/dietaryRestrictionData'
import { getMealPlanClientOptions } from '../data/mealPlanData'

const mealSections = ['Breakfast', 'Mid-morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner']

function newMeal(section = 'Breakfast') {
  return {
    id: `meal-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    section,
    name: '',
    description: '',
    portion: '1 serving',
    notes: '',
    alternatives: '',
  }
}

function newDay(label = 'Monday') {
  return {
    id: `day-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    day: label,
    meals: [newMeal('Breakfast')],
  }
}

const emptyForm = {
  name: '',
  clientId: '',
  goal: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'Draft',
  days: [newDay('Monday')],
}

export default function MealPlanForm({
  mode = 'create',
  initialValues,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [restrictions, setRestrictions] = useState([])
  const clients = useMemo(() => getMealPlanClientOptions(), [])
  const selectedClient = clients.find((c) => c.value === form.clientId)?.client

  useEffect(() => {
    if (initialValues) {
      setForm({
        ...emptyForm,
        ...initialValues,
        days: initialValues.days?.length ? initialValues.days : [newDay('Monday')],
      })
    }
  }, [initialValues])

  useEffect(() => {
    if (!form.clientId) {
      setRestrictions([])
      return
    }
    fetchDietaryRestrictionsByClient(form.clientId).then(setRestrictions)
  }, [form.clientId])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate(status) {
    const next = {}
    if (!form.clientId) next.clientId = 'Select a client.'
    if (!form.name.trim()) next.name = 'Meal plan name is required.'
    if (!form.startDate) next.startDate = 'Start date is required.'
    if (!form.endDate) next.endDate = 'End date is required.'
    if (!form.goal.trim()) next.goal = 'Plan goal is required.'
    if (!form.days.length) next.days = 'Add at least one day.'
    if (!form.days.some((day) => day.meals?.length)) next.meals = 'Add at least one meal.'
    if (status === 'Active' && selectedClient?.reviewRequired) {
      next.safety = 'Review the client’s dietary restrictions before assigning this plan.'
    }
    const allergyNames = restrictions
      .filter((r) => r.type === 'Medical Allergy' && r.status === 'Active')
      .map((r) => r.name.toLowerCase())
    const conflict = form.days.some((day) =>
      day.meals.some((meal) =>
        allergyNames.some(
          (name) =>
            meal.name.toLowerCase().includes(name.split(' ')[0]) ||
            meal.description.toLowerCase().includes(name.split(' ')[0]),
        ),
      ),
    )
    if (conflict) {
      next.conflict =
        'Review required: this meal may conflict with a recorded dietary restriction.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event, statusOverride) {
    event.preventDefault()
    const status = statusOverride || form.status || 'Draft'
    if (!validate(status)) return
    await onSubmit?.({
      ...form,
      status,
      clientName: selectedClient?.name || form.clientName,
      programme: selectedClient?.programme || form.programme,
    })
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-4" noValidate>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="Client">
            <Select
              label="Select client"
              required
              value={form.clientId}
              onChange={(e) => update('clientId', e.target.value)}
              options={clients.map(({ value, label }) => ({ value, label }))}
              error={errors.clientId}
            />
            {selectedClient ? (
              <div className="mt-4 grid gap-3 rounded-2xl border border-[#eef2f0] bg-[#f8faf9] p-4 sm:grid-cols-2">
                <Info label="Programme" value={selectedClient.programme} />
                <Info label="Nutrition goals" value={selectedClient.goals?.[0] || '—'} />
                <Info label="Meal pattern" value={selectedClient.mealPattern} />
                <Info label="Preferences" value={selectedClient.preferences?.join('; ') || '—'} />
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="Plan information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input className="sm:col-span-2" label="Meal plan name" required value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} />
              <Input type="date" label="Start date" required value={form.startDate} onChange={(e) => update('startDate', e.target.value)} error={errors.startDate} />
              <Input type="date" label="End date" required value={form.endDate} onChange={(e) => update('endDate', e.target.value)} error={errors.endDate} />
              <Input className="sm:col-span-2" label="Plan goal" required value={form.goal} onChange={(e) => update('goal', e.target.value)} error={errors.goal} />
              <TextArea className="sm:col-span-2" label="Description" value={form.description} onChange={(e) => update('description', e.target.value)} />
            </div>
          </SectionCard>

          <SectionCard
            title="Meal plan builder"
            actions={
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="!text-[#005a40]"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    days: [...prev.days, newDay(`Day ${prev.days.length + 1}`)],
                  }))
                }
              >
                <Plus className="h-4 w-4" />
                Add Day
              </Button>
            }
          >
            {(errors.days || errors.meals || errors.conflict) && (
              <p className="bf-field-error mb-3" role="alert">
                {errors.conflict || errors.days || errors.meals}
              </p>
            )}
            <div className="space-y-4">
              {form.days.map((day, dayIndex) => (
                <div key={day.id} className="rounded-2xl border border-[#eef2f0] p-4">
                  <div className="mb-3 flex flex-wrap items-end gap-3">
                    <Input
                      label="Day"
                      value={day.day}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          days: prev.days.map((d) =>
                            d.id === day.id ? { ...d, day: e.target.value } : d,
                          ),
                        }))
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="!text-[#005a40]"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          days: [
                            ...prev.days.slice(0, dayIndex + 1),
                            {
                              ...structuredClone(day),
                              id: `day-${Date.now()}`,
                              day: `${day.day} (copy)`,
                            },
                            ...prev.days.slice(dayIndex + 1),
                          ],
                        }))
                      }
                    >
                      Copy Day
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {day.meals.map((meal) => (
                      <div key={meal.id} className="grid gap-3 rounded-xl bg-[#f8faf9] p-3 sm:grid-cols-2">
                        <Select
                          label="Meal section"
                          value={meal.section}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              days: prev.days.map((d) =>
                                d.id === day.id
                                  ? {
                                      ...d,
                                      meals: d.meals.map((m) =>
                                        m.id === meal.id ? { ...m, section: e.target.value } : m,
                                      ),
                                    }
                                  : d,
                              ),
                            }))
                          }
                          options={mealSections.map((s) => ({ value: s, label: s }))}
                        />
                        <Input
                          label="Meal name"
                          value={meal.name}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              days: prev.days.map((d) =>
                                d.id === day.id
                                  ? {
                                      ...d,
                                      meals: d.meals.map((m) =>
                                        m.id === meal.id ? { ...m, name: e.target.value } : m,
                                      ),
                                    }
                                  : d,
                              ),
                            }))
                          }
                        />
                        <TextArea
                          className="sm:col-span-2"
                          label="Description"
                          value={meal.description}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              days: prev.days.map((d) =>
                                d.id === day.id
                                  ? {
                                      ...d,
                                      meals: d.meals.map((m) =>
                                        m.id === meal.id
                                          ? { ...m, description: e.target.value }
                                          : m,
                                      ),
                                    }
                                  : d,
                              ),
                            }))
                          }
                        />
                        <Input
                          label="Portion guidance"
                          value={meal.portion}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              days: prev.days.map((d) =>
                                d.id === day.id
                                  ? {
                                      ...d,
                                      meals: d.meals.map((m) =>
                                        m.id === meal.id ? { ...m, portion: e.target.value } : m,
                                      ),
                                    }
                                  : d,
                              ),
                            }))
                          }
                        />
                        <Input
                          label="Alternatives"
                          value={meal.alternatives}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              days: prev.days.map((d) =>
                                d.id === day.id
                                  ? {
                                      ...d,
                                      meals: d.meals.map((m) =>
                                        m.id === meal.id
                                          ? { ...m, alternatives: e.target.value }
                                          : m,
                                      ),
                                    }
                                  : d,
                              ),
                            }))
                          }
                        />
                        <div className="sm:col-span-2 flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            className="!bg-[#fff7ed] !text-[#b45309]"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                days: prev.days.map((d) =>
                                  d.id === day.id
                                    ? { ...d, meals: d.meals.filter((m) => m.id !== meal.id) }
                                    : d,
                                ),
                              }))
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove meal
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
                      setForm((prev) => ({
                        ...prev,
                        days: prev.days.map((d) =>
                          d.id === day.id
                            ? { ...d, meals: [...d.meals, newMeal('Snack')] }
                            : d,
                        ),
                      }))
                    }
                  >
                    + Add Meal
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionCard title="Dietary safety considerations">
            {restrictions.length === 0 ? (
              <p className="text-sm text-[#6b7280]">Select a client to view dietary considerations.</p>
            ) : (
              <ul className="space-y-3">
                {restrictions.map((item) => (
                  <li key={item.id} className="rounded-2xl bg-[#f8faf9] px-3 py-3">
                    <p className="text-sm font-semibold text-[#111827]">{item.name}</p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">{item.type}</p>
                    <p className="mt-1 text-sm text-[#4b5563]">{item.mealPlanImpact}</p>
                  </li>
                ))}
              </ul>
            )}
            {selectedClient?.guidance ? (
              <p className="mt-4 rounded-2xl border border-[#ccfbf1] bg-[#f0fdfa] px-3 py-3 text-sm text-[#0f766e]">
                {selectedClient.guidance}
              </p>
            ) : null}
            {errors.safety ? (
              <p className="bf-field-error mt-3" role="alert">{errors.safety}</p>
            ) : null}
          </SectionCard>
        </div>
      </div>

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
            {submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Assign Meal Plan'}
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
