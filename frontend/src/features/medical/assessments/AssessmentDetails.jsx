import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import PrivacyBanner from '../shared/PrivacyBanner'
import { formatMedicalDate } from '../health-records/data/healthRecordData'
import { fetchAssessmentById } from './data/healthAssessmentData'

export default function AssessmentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItem(await fetchAssessmentById(id))
    } catch {
      setError('We couldn’t load this health assessment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  if (loading) return <LoadingSkeleton rows={5} />
  if (error || !item) {
    return <ErrorState title="We couldn’t load this health assessment." onRetry={load} />
  }

  const obs = item.observations || {}

  return (
    <div>
      <p className="mb-3 text-[12px] text-[#8b93a1]">
        Medical Advisor / Health Assessments / {item.clientName}
      </p>

      <PageHeader
        title={item.type}
        description={`${item.clientName} · ${formatMedicalDate(item.date)} · ${item.advisor}`}
        actions={
          <div className="flex flex-wrap gap-2.5">
            <StatusBadge status={item.status} />
            <Button
              variant="outline"
              className="!text-[#005a40]"
              onClick={() =>
                navigate('/medical/assessments/create', { state: { editId: item.id } })
              }
            >
              Edit Assessment
            </Button>
            <Button
              to="/medical/appointments"
              variant="outline"
              className="!text-[#005a40]"
            >
              Create Follow-up
            </Button>
            <Button
              to="/medical/health-alerts/create"
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Create Risk Alert
            </Button>
          </div>
        }
      />

      <PrivacyBanner />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Meta label="Client" value={`${item.clientName} (${item.clientId})`} />
        <Meta label="Assessment date" value={formatMedicalDate(item.date)} />
        <Meta label="Medical Advisor" value={item.advisor} />
        <Meta label="Status" value={item.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Assessment Summary">
          <p className="text-sm leading-relaxed text-[#4b5563]">{obs.general || '—'}</p>
        </SectionCard>
        <SectionCard title="Health Considerations">
          <p className="text-sm leading-relaxed text-[#4b5563]">{obs.concerns || '—'}</p>
          {obs.restrictions ? (
            <p className="mt-3 text-sm text-[#4b5563]">
              <span className="font-semibold text-[#111827]">Restrictions: </span>
              {obs.restrictions}
            </p>
          ) : null}
        </SectionCard>
        <SectionCard title="Allergy Review">
          <p className="text-sm leading-relaxed text-[#4b5563]">{obs.allergyReview || '—'}</p>
        </SectionCard>
        <SectionCard title="Safety Considerations">
          <p className="text-sm leading-relaxed text-[#4b5563]">{obs.safety || '—'}</p>
        </SectionCard>
        <SectionCard title="Professional Notes">
          <p className="mb-2 text-[12px] text-[#005a40]">Restricted medical workflow notes</p>
          <p className="text-sm leading-relaxed text-[#4b5563]">
            {item.professionalNotes || '—'}
          </p>
        </SectionCard>
        <SectionCard title="Follow-up">
          <p className="text-sm text-[#4b5563]">
            {item.followUpRequired ? 'Follow-up required' : 'No follow-up required'}
          </p>
          <p className="mt-2 text-sm text-[#6b7280]">
            Next review: {formatMedicalDate(item.nextReview)}
          </p>
        </SectionCard>
        <SectionCard title="Related Health Risk Alerts">
          {item.relatedAlertId ? (
            <Button
              to={`/medical/health-alerts/${item.relatedAlertId}`}
              size="sm"
              variant="outline"
              className="!text-[#005a40]"
            >
              View {item.relatedAlertId}
            </Button>
          ) : (
            <p className="text-sm text-[#6b7280]">No related alert linked.</p>
          )}
        </SectionCard>
        <SectionCard title="Wellness Guidance">
          <p className="text-sm text-[#4b5563]">
            {item.guidanceRequired
              ? 'Wellness safety guidance required — update from the client health record.'
              : 'No additional guidance flagged from this assessment.'}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 !text-[#005a40]"
            onClick={() => navigate('/medical/health-records')}
          >
            Open Health Records
          </Button>
        </SectionCard>
      </div>
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <p className="text-[12px] text-[#8b93a1]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  )
}
