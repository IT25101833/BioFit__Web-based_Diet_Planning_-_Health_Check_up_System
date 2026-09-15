import { useEffect, useMemo, useState } from 'react'
import { Dumbbell, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SearchBar from '../../../components/ui/SearchBar'
import Select from '../../../components/ui/Select'
import StatusBadge from '../../../components/ui/StatusBadge'
import Toast from '../../../components/ui/Toast'
import {
  difficulties,
  exerciseCategories,
  fetchExercises,
  removeExercise,
  targetAreas,
} from './data/exerciseData'

export default function ExerciseLibrary() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [equipment, setEquipment] = useState('')
  const [target, setTarget] = useState('')
  const [removeId, setRemoveId] = useState('')
  const [toast, setToast] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await fetchExercises())
    } catch {
      setError('We couldn’t load the exercise library.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q)) return false
      if (category && item.category !== category) return false
      if (difficulty && item.difficulty !== difficulty) return false
      if (equipment && !(item.equipment || '').toLowerCase().includes(equipment.toLowerCase()))
        return false
      if (target && item.targetArea !== target) return false
      return true
    })
  }, [items, search, category, difficulty, equipment, target])

  if (loading) return <LoadingSkeleton rows={4} />
  if (error) {
    return <ErrorState title="We couldn’t load the exercise library." onRetry={load} />
  }

  return (
    <div>
      <PageHeader
        title="Exercise Library"
        description="Browse and manage exercises used in BioFit workout plans."
        actions={
          <Button
            to="/coach/exercises/create"
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            <Plus className="h-4 w-4" />
            Add Exercise
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 lg:grid-cols-5">
        <SearchBar
          className="lg:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search exercises…"
        />
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={exerciseCategories.map((v) => ({ value: v, label: v }))}
          placeholder="Category"
        />
        <Select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          options={difficulties.map((v) => ({ value: v, label: v }))}
          placeholder="Difficulty"
        />
        <Select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          options={targetAreas.map((v) => ({ value: v, label: v }))}
          placeholder="Target area"
        />
        <SearchBar
          className="lg:col-span-2"
          value={equipment}
          onChange={setEquipment}
          placeholder="Filter by equipment…"
          id="equipment-search"
          label="Equipment"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No exercises match your filters."
          description="Try clearing filters or add a new exercise."
          actionLabel="Add Exercise"
          actionTo="/coach/exercises/create"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((exercise) => (
            <article
              key={exercise.id}
              className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
                <Dumbbell className="h-5 w-5" strokeWidth={2.1} />
              </div>
              <h3 className="font-display text-lg font-bold text-[#111827]">{exercise.name}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge status={exercise.category} />
                <StatusBadge status={exercise.difficulty} />
              </div>
              <p className="mt-3 text-sm text-[#4b5563]">{exercise.targetArea}</p>
              <p className="mt-1 text-[12px] text-[#6b7280]">{exercise.equipment || 'No equipment'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="!text-[#005a40]"
                  onClick={() => navigate(`/coach/exercises/${exercise.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="!text-[#005a40]"
                  to="/coach/workout-plans/create"
                >
                  Add to Workout
                </Button>
                <Button
                  size="sm"
                  className="!bg-[#fff7ed] !text-[#b45309]"
                  onClick={() => setRemoveId(exercise.id)}
                >
                  Remove
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(removeId)}
        onClose={() => setRemoveId('')}
        onConfirm={async () => {
          await removeExercise(removeId)
          setRemoveId('')
          setToast('Exercise removed.')
          await load()
        }}
        title="Remove this exercise?"
        description="It will no longer appear in the library for new workout plans."
        confirmLabel="Remove"
        tone="danger"
      />
      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
