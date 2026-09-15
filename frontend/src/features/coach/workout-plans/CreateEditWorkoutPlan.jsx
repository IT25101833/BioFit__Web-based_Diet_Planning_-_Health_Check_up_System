import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import Toast from '../../../components/ui/Toast'
import WorkoutPlanForm from './components/WorkoutPlanForm'
import {
  createWorkoutPlan,
  fetchWorkoutPlanById,
  updateWorkoutPlan,
} from './data/workoutPlanData'

export default function CreateEditWorkoutPlan({ mode = 'create' }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [initial, setInitial] = useState(null)
  const [loading, setLoading] = useState(mode === 'edit')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (mode !== 'edit') return
    async function load() {
      setLoading(true)
      try {
        setInitial(await fetchWorkoutPlanById(id))
      } catch {
        setError('We couldn’t load this workout plan.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mode, id])

  async function handleSubmit(payload) {
    setSubmitting(true)
    try {
      const saved =
        mode === 'edit'
          ? await updateWorkoutPlan(id, payload)
          : await createWorkoutPlan(payload)
      setToast(mode === 'edit' ? 'Changes saved.' : 'Workout plan saved.')
      window.setTimeout(() => navigate(`/coach/workout-plans/${saved.id}`), 650)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title={error} onRetry={() => window.location.reload()} />

  return (
    <div>
      <PageHeader
        title={mode === 'edit' ? 'Edit Workout Plan' : 'Create Workout Plan'}
        description="Build a personalized fitness plan based on the client’s goals and safety considerations."
      />
      <WorkoutPlanForm
        mode={mode}
        initialValues={initial}
        submitting={submitting}
        onCancel={() => navigate('/coach/workout-plans')}
        onSubmit={handleSubmit}
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
