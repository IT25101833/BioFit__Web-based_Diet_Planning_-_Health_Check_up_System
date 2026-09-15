import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import Input from '../../../components/ui/Input'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import ProgressBar from '../../../components/ui/ProgressBar'
import SectionCard from '../../../components/ui/SectionCard'
import Select from '../../../components/ui/Select'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import Toast from '../../../components/ui/Toast'
import { fetchNutritionClientById } from '../clients/data/nutritionClientData'
import { fetchDietaryRestrictionsByClient } from '../dietary-restrictions/data/dietaryRestrictionData'
import {
  fetchNutritionClientProgress,
  saveNutritionProgress,
} from './data/nutritionProgressData'

export default function ClientNutritionProgressDetails() {
  const { clientId } = useParams()
  const [progress, setProgress] = useState(null)
  const [client, setClient] = useState(null)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({
    date: '2026-09-09',
    participation: '',
    feedback: '',
    observation: '',
    dietaryIssue: 'No',
    adjustmentNeeded: 'No',
    nextReview: '',
    notes: '',
  })

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [p, c, d] = await Promise.all([
        fetchNutritionClientProgress(clientId),
        fetchNutritionClientById(clientId),
        fetchDietaryRestrictionsByClient(clientId),
      ])
      setProgress(p)
      setClient(c)
      setUpdates(d)
    } catch {
      setError('We couldn’t load this client’s nutrition progress.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [clientId])

  async function handleSave() {
    await saveNutritionProgress({ clientId, mealPlan: progress.mealPlan, ...form })
    setOpen(false)
    setToast('Progress saved.')
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error || !progress || !client) {
    return (
      <ErrorState title="We couldn’t load this client’s nutrition progress." onRetry={load} />
    )
  }

  const max = Math.max(...progress.weeklyParticipation, 1)

  return (
    <div>
      <PageHeader
        title={`${client.name} · Nutrition Progress`}
        description={`${client.programme} · ${progress.mealPlan}`}
        actions={
          <div className="flex flex-wrap gap-2.5">
            <StatusBadge status={progress.status} />
            <Button onClick={() => setOpen(true)} className="!bg-[#005a40] !text-white hover:!bg-[#004833]">
              Record Progress
            </Button>
          </div>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <SectionCard title="Meal-plan participation">
          <ProgressBar value={progress.participation} />
        </SectionCard>
        <SectionCard title="Current week">
          <p className="text-sm font-semibold text-[#111827]">{progress.currentWeek}</p>
        </SectionCard>
        <SectionCard title="Next review">
          <p className="text-sm font-semibold text-[#111827]">{progress.nextReview}</p>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Weekly participation">
          <div className="flex h-40 items-end gap-2 pt-2">
            {progress.weeklyParticipation.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-[#005a40]/85" style={{ height: `${(value / max) * 100}%` }} />
                <span className="text-[10px] text-[#6b7280]">W{index + 1}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Dietary update history">
          {updates.length === 0 ? (
            <p className="text-sm text-[#6b7280]">No dietary updates yet.</p>
          ) : (
            <ul className="space-y-2">
              {updates.map((item) => (
                <li key={item.id} className="rounded-xl bg-[#f8faf9] px-4 py-3 text-sm">
                  <p className="font-semibold text-[#111827]">{item.name}</p>
                  <p className="mt-1 text-[#6b7280]">{item.type} · {item.status}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard className="mt-4" title="Consultation history">
        {client.consultations.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No consultations yet.</p>
        ) : (
          <ul className="space-y-2">
            {client.consultations.map((item) => (
              <li key={item.id} className="rounded-xl bg-[#f8faf9] px-4 py-3 text-sm">
                <p className="font-semibold text-[#111827]">{item.type}</p>
                <p className="mt-1 text-[#6b7280]">{item.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Record nutrition progress"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="!bg-[#005a40] !text-white hover:!bg-[#004833]">
              Save Progress
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Client" value={client.name} readOnly />
          <Input type="date" label="Date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          <Input label="Meal plan" value={progress.mealPlan} readOnly />
          <Input label="Meal plan participation" value={form.participation} onChange={(e) => setForm((p) => ({ ...p, participation: e.target.value }))} />
          <TextArea className="sm:col-span-2" label="Client feedback" value={form.feedback} onChange={(e) => setForm((p) => ({ ...p, feedback: e.target.value }))} />
          <TextArea className="sm:col-span-2" label="Consultant observation" value={form.observation} onChange={(e) => setForm((p) => ({ ...p, observation: e.target.value }))} />
          <Select label="Dietary issue reported?" value={form.dietaryIssue} onChange={(e) => setForm((p) => ({ ...p, dietaryIssue: e.target.value }))} options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]} />
          <Select label="Plan adjustment needed?" value={form.adjustmentNeeded} onChange={(e) => setForm((p) => ({ ...p, adjustmentNeeded: e.target.value }))} options={[{ value: 'No', label: 'No' }, { value: 'Yes', label: 'Yes' }]} />
          <Input type="date" label="Next review date" value={form.nextReview} onChange={(e) => setForm((p) => ({ ...p, nextReview: e.target.value }))} />
          <TextArea className="sm:col-span-2" label="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
        </div>
        {form.adjustmentNeeded === 'Yes' ? (
          <Button to={`/nutrition/meal-plans/${progress.mealPlanId}/edit`} className="mt-4 !bg-[#005a40] !text-white">
            Review Meal Plan
          </Button>
        ) : null}
      </Modal>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
