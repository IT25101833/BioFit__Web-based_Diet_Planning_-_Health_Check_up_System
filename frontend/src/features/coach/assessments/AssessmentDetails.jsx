import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import { formatCoachDate } from '../clients/data/clientFitnessData'
import { fetchAssessmentById } from './data/assessmentData'

export default function AssessmentDetails() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItem(await fetchAssessmentById(id))
    } catch {
      setError('We couldn’t load this assessment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  if (loading) return <LoadingSkeleton rows={4} />
  if (error || !item) {
    return <ErrorState title="We couldn’t load this assessment." onRetry={load} />
  }

  return (
    <div>
      <PageHeader
        title={item.type}
        description={`${item.clientName} · ${formatCoachDate(item.date)} · ${item.coach}`}
        actions={<StatusBadge status={item.status} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Activity level" value={item.activityLevel} />
        <Card title="Strength" value={item.strength} />
        <Card title="Endurance" value={item.endurance} />
        <Card title="Mobility" value={item.mobility} />
        <Card title="Flexibility" value={item.flexibility} />
        <Card title="Fitness goals" value={item.goals} />
        <Card title="Safety considerations" value={item.safetyNotes || item.limitations} />
        <Card title="Coach notes" value={item.coachNotes} />
        <Card
          title="Professional review"
          value={item.reviewRequired ? 'Review required' : 'Not required'}
        />
      </div>

      <SectionCard className="mt-4" title="Previous assessment comparison">
        <p className="text-sm text-[#4b5563]">
          Compared with earlier observations, focus remains on sustainable movement quality and
          consistency rather than appearance-based targets.
        </p>
        <p className="mt-2 text-sm text-[#6b7280]">
          Meaningful change noted: session comfort and adherence guidance updated for ongoing
          planning.
        </p>
      </SectionCard>
    </div>
  )
}

function Card({ title, value }) {
  return (
    <SectionCard title={title}>
      <p className="text-sm leading-relaxed text-[#4b5563]">{value || '—'}</p>
    </SectionCard>
  )
}
