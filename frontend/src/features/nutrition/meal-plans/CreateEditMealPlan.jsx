import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import Toast from '../../../components/ui/Toast'
import MealPlanForm from './components/MealPlanForm'
import { createMealPlan, fetchMealPlanById, updateMealPlan } from './data/mealPlanData'

export default function CreateEditMealPlan({ mode = 'create' }) {
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
        setInitial(await fetchMealPlanById(id))
      } catch {
        setError('We couldn’t load this meal plan.')
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
        mode === 'edit' ? await updateMealPlan(id, payload) : await createMealPlan(payload)
      setToast(mode === 'edit' ? 'Changes saved.' : 'Meal plan saved.')
      window.setTimeout(() => navigate(`/nutrition/meal-plans/${saved.id}`), 650)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title={error} onRetry={() => window.location.reload()} />

  return (
    <div>
      <PageHeader
        title={mode === 'edit' ? 'Edit Meal Plan' : 'Create Meal Plan'}
        description="Build a personalized meal plan based on the client’s goals, preferences and dietary considerations."
      />
      <MealPlanForm
        mode={mode}
        initialValues={initial}
        submitting={submitting}
        onCancel={() => navigate('/nutrition/meal-plans')}
        onSubmit={handleSubmit}
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
