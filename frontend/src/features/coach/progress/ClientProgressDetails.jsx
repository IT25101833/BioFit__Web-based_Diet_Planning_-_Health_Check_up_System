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
import { fetchCoachClientById } from '../clients/data/clientFitnessData'
import { fetchClientProgress, saveProgressRecord } from './data/progressData'

export default function ClientProgressDetails() {
  const { clientId } = useParams()
  const [progress, setProgress] = useState(null)
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({
    date: '2026-09-09',
    completedSessions: '',
    observation: '',
    feedback: '',
    difficulty: 'Appropriate',
    adjustmentNeeded: 'No',
    nextReview: '',
  })

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [p, c] = await Promise.all([
        fetchClientProgress(clientId),
        fetchCoachClientById(clientId),
      ])
      setProgress(p)
      setClient(c)
    } catch {
      setError('We couldn’t load this client’s progress.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [clientId])

  async function handleSave() {
    await saveProgressRecord({
      clientId,
      ...form,
      workoutPlan: progress.workoutPlan,
    })
    setOpen(false)
    setToast('Progress saved.')
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error || !progress || !client) {
    return (
      <ErrorState title="We couldn’t load this client’s progress." onRetry={load} />
    )
  }

  const maxCompletion = Math.max(...progress.weeklyCompletion, 1)
  const maxAttendance = Math.max(...progress.attendanceTrend, 1)

  return (
    <div>
      <PageHeader
        title={`${client.name} · Fitness Progress`}
        description={`${client.programme} · ${progress.workoutPlan}`}
        actions={
          <div className="flex flex-wrap gap-2.5">
            <StatusBadge status={progress.status} />
            <Button
              onClick={() => setOpen(true)}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Record Progress
            </Button>
          </div>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <SectionCard title="Plan completion">
          <ProgressBar value={progress.completion} />
        </SectionCard>
        <SectionCard title="Session attendance">
          <ProgressBar value={progress.attendance} />
        </SectionCard>
        <SectionCard title="Current week">
          <p className="text-sm font-semibold text-[#111827]">{progress.currentWeek}</p>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Workout completion by week">
          <div className="flex h-40 items-end gap-2 pt-2">
            {progress.weeklyCompletion.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[#005a40]/85"
                  style={{ height: `${(value / maxCompletion) * 100}%` }}
                />
                <span className="text-[10px] text-[#6b7280]">W{index + 1}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Session attendance trend">
          <div className="flex h-40 items-end gap-2 pt-2">
            {progress.attendanceTrend.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[#0f766e]/75"
                  style={{ height: `${(value / maxAttendance) * 100}%` }}
                />
                <span className="text-[10px] text-[#6b7280]">W{index + 1}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard className="mt-4" title="Assessment history">
        {client.recentAssessments.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No assessments yet.</p>
        ) : (
          <ul className="space-y-2">
            {client.recentAssessments.map((item) => (
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
        title="Record progress"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Save Progress
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Client" value={client.name} readOnly />
          <Input
            type="date"
            label="Date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          />
          <Input label="Workout plan" value={progress.workoutPlan} readOnly />
          <Input
            label="Completed sessions"
            value={form.completedSessions}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, completedSessions: e.target.value }))
            }
          />
          <TextArea
            className="sm:col-span-2"
            label="Coach observation"
            value={form.observation}
            onChange={(e) => setForm((prev) => ({ ...prev, observation: e.target.value }))}
          />
          <TextArea
            className="sm:col-span-2"
            label="Client feedback"
            value={form.feedback}
            onChange={(e) => setForm((prev) => ({ ...prev, feedback: e.target.value }))}
          />
          <Select
            label="Difficulty level"
            value={form.difficulty}
            onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value }))}
            options={[
              { value: 'Too easy', label: 'Too easy' },
              { value: 'Appropriate', label: 'Appropriate' },
              { value: 'Challenging', label: 'Challenging' },
            ]}
          />
          <Select
            label="Plan adjustment needed?"
            value={form.adjustmentNeeded}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, adjustmentNeeded: e.target.value }))
            }
            options={[
              { value: 'No', label: 'No' },
              { value: 'Yes', label: 'Yes' },
            ]}
          />
          <Input
            type="date"
            label="Next review date"
            value={form.nextReview}
            onChange={(e) => setForm((prev) => ({ ...prev, nextReview: e.target.value }))}
          />
        </div>
        {form.adjustmentNeeded === 'Yes' ? (
          <Button
            to={`/coach/workout-plans/${client.workoutPlanId || ''}/edit`}
            className="mt-4 !bg-[#005a40] !text-white"
          >
            Review Workout Plan
          </Button>
        ) : null}
      </Modal>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
