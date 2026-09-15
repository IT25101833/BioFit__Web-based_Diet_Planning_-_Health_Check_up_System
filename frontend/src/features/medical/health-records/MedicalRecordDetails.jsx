import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Avatar from '../../../components/ui/Avatar'
import Button from '../../../components/ui/Button'
import ErrorState from '../../../components/ui/ErrorState'
import FilterTabs from '../../../components/ui/FilterTabs'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import PrivacyBanner from '../shared/PrivacyBanner'
import { fetchHealthRecordById, formatMedicalDate } from './data/healthRecordData'

const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'history', label: 'Medical History' },
  { value: 'assessments', label: 'Health Assessments' },
  { value: 'alerts', label: 'Health Risk Alerts' },
  { value: 'guidance', label: 'Wellness Safety Guidance' },
  { value: 'appointments', label: 'Appointments' },
  { value: 'record-history', label: 'Record History' },
]

export default function MedicalRecordDetails() {
  const { id } = useParams()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setRecord(await fetchHealthRecordById(id))
    } catch {
      setError('We couldn’t load this medical record.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  if (loading) return <LoadingSkeleton rows={6} />
  if (error || !record) {
    return <ErrorState title="We couldn’t load this medical record." onRetry={load} />
  }

  const history = record.medicalHistory || {}
  const guidance = record.wellnessGuidance || {}
  const assessments = record.assessments || []
  const alerts = record.alerts || []
  const appointments = record.appointments || []
  const timeline = record.history || []

  return (
    <div>
      <p className="mb-3 text-[12px] text-[#8b93a1]">
        Medical Advisor / Client Health Records / {record.clientName}
      </p>

      <PrivacyBanner />

      <PageHeader
        title={record.clientName}
        description={`${record.clientId} · ${record.programme}`}
        actions={
          <div className="flex flex-wrap gap-2.5">
            <Button
              to={`/medical/health-records/${record.id}/edit`}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Edit Medical Record
            </Button>
            <Button
              to={`/medical/assessments/create?client=${record.clientId}`}
              variant="outline"
              className="!text-[#005a40]"
            >
              Add Health Assessment
            </Button>
            <Button
              to={`/medical/health-alerts/create?client=${record.clientId}`}
              variant="outline"
              className="!text-[#005a40]"
            >
              Create Health Risk Alert
            </Button>
          </div>
        }
      />

      <SectionCard className="mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={record.clientName} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-[#111827]">{record.clientName}</h2>
              <StatusBadge status={record.recordStatus} />
              <StatusBadge status={record.reviewStatus} />
            </div>
            <p className="mt-1 text-sm text-[#6b7280]">
              {record.clientId} · {record.programme}
            </p>
            <p className="mt-1 text-[12px] text-[#8b93a1]">
              Last updated {formatMedicalDate(record.lastUpdated)}
              {record.assignedCoach ? ` · Coach ${record.assignedCoach}` : ''}
              {record.assignedNutrition ? ` · Nutrition ${record.assignedNutrition}` : ''}
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="mb-5">
        <FilterTabs ariaLabel="Medical record sections" value={tab} onChange={setTab} options={tabs} />
      </div>

      {tab === 'overview' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SectionCard title="Latest Health Assessment">
            <p className="text-sm font-semibold text-[#111827]">
              {formatMedicalDate(record.latestAssessment) || '—'}
            </p>
            <p className="mt-1 text-[12px] text-[#6b7280]">Most recent assessment date</p>
          </SectionCard>
          <SectionCard title="Active Risk Alerts">
            <p className="text-sm font-semibold text-[#111827]">{record.activeRiskAlerts ?? 0}</p>
            <p className="mt-1 text-[12px] text-[#6b7280]">Open or under review</p>
          </SectionCard>
          <SectionCard title="Next Medical Review">
            <p className="text-sm font-semibold text-[#111827]">
              {formatMedicalDate(record.nextCheckup) || '—'}
            </p>
            <p className="mt-1 text-[12px] text-[#6b7280]">Scheduled check-up</p>
          </SectionCard>
          <SectionCard title="Health Record Status">
            <StatusBadge status={record.recordStatus} />
            <p className="mt-2 text-[12px] text-[#6b7280]">{record.reviewStatus}</p>
          </SectionCard>
        </div>
      ) : null}

      {tab === 'history' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              to={`/medical/health-records/${record.id}/edit`}
              size="sm"
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              Edit
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ListCard title="Conditions" items={history.conditions} />
            <ListCard title="Allergies" items={history.allergies} />
            <ListCard title="Health Considerations" items={history.healthConsiderations} />
            <ListCard title="Previous Notes" items={history.previousNotes} />
          </div>
          {history.emergencyContact ? (
            <SectionCard title="Emergency Contact">
              <p className="text-sm font-semibold text-[#111827]">{history.emergencyContact.name}</p>
              <p className="mt-1 text-sm text-[#4b5563]">
                {history.emergencyContact.relation} · {history.emergencyContact.phone}
              </p>
            </SectionCard>
          ) : null}
          {history.summary ? (
            <SectionCard title="History Summary">
              <p className="text-sm leading-relaxed text-[#4b5563]">{history.summary}</p>
            </SectionCard>
          ) : null}
        </div>
      ) : null}

      {tab === 'assessments' ? (
        <SectionCard title="Health Assessment History">
          {assessments.length === 0 ? (
            <p className="text-sm text-[#6b7280]">No assessments linked to this record yet.</p>
          ) : (
            <div className="space-y-3">
              {assessments.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-2xl border border-[#eef2f0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{item.type}</p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      {formatMedicalDate(item.date)} · {item.advisor || 'Elena Costa'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge status={item.status} />
                      {item.followUpRequired ? <StatusBadge status="Follow-up Required" /> : null}
                    </div>
                  </div>
                  <Button
                    to={`/medical/assessments/${item.id}`}
                    size="sm"
                    variant="outline"
                    className="!text-[#005a40]"
                  >
                    View Assessment
                  </Button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ) : null}

      {tab === 'alerts' ? (
        <SectionCard title="Health Risk Alerts">
          {alerts.length === 0 ? (
            <p className="text-sm text-[#6b7280]">No health risk alerts for this client.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-2xl border border-[#eef2f0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {item.id} · {item.title}
                    </p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      Raised {formatMedicalDate(item.dateRaised)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge status={item.priority} />
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                  <Button
                    to={`/medical/health-alerts/${item.id}`}
                    size="sm"
                    variant="outline"
                    className="!text-[#005a40]"
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ) : null}

      {tab === 'guidance' ? (
        <SectionCard
          title="Shared Wellness Safety Guidance"
          actions={
            <Button
              to={`/medical/health-records/${record.id}/edit`}
              size="sm"
              variant="outline"
              className="!text-[#005a40]"
            >
              Update Guidance
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#eef2f0] bg-[#f8faf9] p-4">
              <p className="text-[11px] font-medium text-[#8b93a1]">Fitness Guidance</p>
              <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                {guidance.fitness || 'No fitness guidance recorded.'}
              </p>
            </div>
            <div className="rounded-2xl border border-[#eef2f0] bg-[#f8faf9] p-4">
              <p className="text-[11px] font-medium text-[#8b93a1]">Nutrition Guidance</p>
              <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                {guidance.nutrition || 'No nutrition guidance recorded.'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-[12px] text-[#6b7280]">
            {guidance.status ? <StatusBadge status={guidance.status} /> : null}
            <span>Last updated {formatMedicalDate(guidance.lastUpdated) || '—'}</span>
            {guidance.updatedBy ? <span>Updated by {guidance.updatedBy}</span> : null}
            {guidance.sharedWith?.length ? (
              <span>Shared with {guidance.sharedWith.join(', ')}</span>
            ) : null}
          </div>
        </SectionCard>
      ) : null}

      {tab === 'appointments' ? (
        <SectionCard title="Medical Appointments">
          {appointments.length === 0 ? (
            <p className="text-sm text-[#6b7280]">No appointments linked to this record.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-2xl border border-[#eef2f0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{item.type}</p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      {formatMedicalDate(item.date)} · {item.time} · {item.professional || 'Elena Costa'}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ) : null}

      {tab === 'record-history' ? (
        <SectionCard title="Record History">
          {timeline.length === 0 ? (
            <p className="text-sm text-[#6b7280]">No history entries yet.</p>
          ) : (
            <ol className="space-y-4">
              {timeline.map((item) => (
                <li key={item.id} className="relative border-l-2 border-[#e6f5f0] pl-4">
                  <span className="absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full bg-[#005a40]" />
                  <p className="text-sm text-[#374151]">{item.text}</p>
                  <p className="mt-1 text-[12px] text-[#8b93a1]">{item.at}</p>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>
      ) : null}
    </div>
  )
}

function ListCard({ title, items }) {
  const list = Array.isArray(items) ? items : items ? [items] : []
  return (
    <SectionCard title={title}>
      {list.length === 0 ? (
        <p className="text-sm text-[#6b7280]">None recorded.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((item) => (
            <li key={item} className="rounded-xl bg-[#f8faf9] px-3 py-2 text-sm text-[#4b5563]">
              {item}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
