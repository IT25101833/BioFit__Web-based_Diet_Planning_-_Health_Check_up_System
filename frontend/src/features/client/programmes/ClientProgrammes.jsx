import { useEffect, useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import ProgrammeCard from './components/ProgrammeCard'
import { fetchClientProgrammes } from './data/programmeData'

const filters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export default function ClientProgrammes() {
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchClientProgrammes()
      setProgrammes(data)
    } catch {
      setError('We couldn’t load your programmes right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const counts = useMemo(() => {
    const active = programmes.filter((p) => p.status === 'Active').length
    const completed = programmes.filter((p) => p.status === 'Completed').length
    return {
      all: programmes.length,
      active,
      completed,
    }
  }, [programmes])

  const filtered = useMemo(() => {
    if (filter === 'active') return programmes.filter((p) => p.status === 'Active')
    if (filter === 'completed')
      return programmes.filter((p) => p.status === 'Completed')
    return programmes
  }, [programmes, filter])

  if (loading) return <LoadingSkeleton rows={3} />
  if (error) {
    return (
      <ErrorState
        title="We couldn’t load your programmes right now."
        description={error}
        onRetry={load}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="My Programmes"
        description="Follow your current wellness pathways and revisit completed journeys."
      />

      <div className="mb-5">
        <FilterTabs
          ariaLabel="Programme filters"
          value={filter}
          onChange={setFilter}
          options={filters.map((item) => ({
            ...item,
            count: counts[item.value],
          }))}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No programmes in this view"
          description="Your enrolled wellness programmes will show up here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((programme) => (
            <ProgrammeCard key={programme.id} programme={programme} />
          ))}
        </div>
      )}
    </div>
  )
}
