import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import Toast from '../../../components/ui/Toast'
import ExerciseForm from './components/ExerciseForm'
import {
  createExercise,
  fetchExerciseById,
  updateExercise,
} from './data/exerciseData'

export default function CreateEditExercise({ mode = 'create' }) {
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
        setInitial(await fetchExerciseById(id))
      } catch {
        setError('We couldn’t load this exercise.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mode, id])

  async function handleSubmit(payload) {
    setSubmitting(true)
    try {
      if (mode === 'edit') await updateExercise(id, payload)
      else await createExercise(payload)
      setToast(mode === 'edit' ? 'Exercise updated.' : 'Exercise saved.')
      window.setTimeout(() => navigate('/coach/exercises'), 650)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) return <ErrorState title={error} onRetry={() => window.location.reload()} />

  return (
    <div>
      <PageHeader
        title={mode === 'edit' ? 'Edit Exercise' : 'Add Exercise'}
        description="Create clear, wellness-focused exercise guidance for workout plans."
      />
      <ExerciseForm
        mode={mode}
        initialValues={initial}
        submitting={submitting}
        onCancel={() => navigate('/coach/exercises')}
        onSubmit={handleSubmit}
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
