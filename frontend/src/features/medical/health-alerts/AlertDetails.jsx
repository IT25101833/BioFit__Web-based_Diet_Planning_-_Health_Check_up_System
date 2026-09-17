import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import ErrorState from '../../../components/ui/ErrorState'
import Input from '../../../components/ui/Input'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import Toast from '../../../components/ui/Toast'
import PrivacyBanner from '../shared/PrivacyBanner'
import { formatMedicalDate } from '../health-records/data/healthRecordData'
import {
  addFollowUp,
  completeFollowUp,
  deactivateHealthAlert,
  fetchHealthAlertById,
  resolveAlert,
  startAlertReview,
  updateAlertStatus,
  updateGuidance,
  updateHealthAlert,
} from './data/healthAlertData'

export default function AlertDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [startReviewOpen, setStartReviewOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [followUpOpen, setFollowUpOpen] = useState(false)
  const [guidanceOpen, setGuidanceOpen] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [followUpForm, setFollowUpForm] = useState({
    dueDate: '',
    notes: '',
    relatedAppointmentId: '',
  })
  const [guidanceForm, setGuidanceForm] = useState({
    fitness: '',
    nutrition: '',
    status: 'Shared',
  })

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchHealthAlertById(id)
      setAlert(data)
      setReviewNotes(data.reviewNotes || '')
      setGuidanceForm({
        fitness: data.guidance?.fitness || '',
        nutrition: data.guidance?.nutrition || '',
        status: data.guidance?.status || 'Shared',
      })
      setFollowUpForm({
        dueDate: data.followUp?.dueDate || '',
        notes: data.followUp?.notes || '',
        relatedAppointmentId: data.followUp?.relatedAppointmentId || '',
      })
    } catch {
      setError('We couldn’t load this health risk alert.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  if (loading) return <LoadingSkeleton rows={6} />
  if (error || !alert) {
    return <ErrorState title="We couldn’t load this health risk alert." onRetry={load} />
  }

  const followUp = alert.followUp || {}
  const guidance = alert.guidance || {}
  const impact = alert.wellnessImpact || {}

  return (
    <div>
      <p className="mb-3 text-[12px] text-[#8b93a1]">
        Medical Advisor / Health Risk Alerts / {alert.id}
      </p>

      <PageHeader
        title={alert.title}
        description={`${alert.id} · ${alert.clientName} · Raised ${formatMedicalDate(alert.dateRaised)}`}
        actions={
          <div className="flex flex-wrap gap-2.5">
            <StatusBadge status={alert.priority} />
            <StatusBadge status={alert.status} />
            {alert.status === 'Open' ? (
              <Button
                onClick={() => setStartReviewOpen(true)}
                className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
              >
                Start Review
              </Button>
            ) : null}
            {alert.status !== 'Resolved' ? (
              <>
                <Button
                  variant="outline"
                  className="!text-[#005a40]"
                  onClick={() => setFollowUpOpen(true)}
                >
                  Add Follow-up
                </Button>
                <Button
                  variant="outline"
                  className="!text-[#005a40]"
                  onClick={() => setGuidanceOpen(true)}
                >
                  Update Guidance
                </Button>
                <Button
                  variant="outline"
                  className="!border-[#b45309]/30 !text-[#b45309]"
                  onClick={() => setResolveOpen(true)}
                >
                  Resolve Alert
                </Button>
              </>
            ) : null}
            {alert.active !== false ? (
              <Button
                variant="outline"
                className="!border-[#b45309]/30 !text-[#b45309]"
                onClick={() => setDeactivateOpen(true)}
              >
                Mark Inactive
              </Button>
            ) : null}
          </div>
        }
      />

      <PrivacyBanner />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Meta label="Client" value={`${alert.clientName} (${alert.clientId})`} />
        <Meta label="Assigned Advisor" value={alert.assignedAdvisor} />
        <Meta label="Follow-up status" value={followUp.status || '—'} />
        <Meta
          label="Related assessment"
          value={alert.relatedAssessmentId || 'None linked'}
        />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Reason for Alert">
          <p className="text-sm leading-relaxed text-[#4b5563]">{alert.reason || '—'}</p>
        </SectionCard>

        <SectionCard title="Medical Advisor Review">
          <p className="mb-3 text-[12px] text-[#005a40]">
            These notes remain restricted to authorized medical workflows.
          </p>
          <p className="mb-3 text-sm text-[#6b7280]">Review status: {alert.status}</p>
          {alert.status !== 'Resolved' ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {['Open', 'Under Review', 'Resolved'].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={alert.status === status ? 'primary' : 'outline'}
                  className={
                    alert.status === status
                      ? '!bg-[#005a40] !text-white'
                      : '!text-[#005a40]'
                  }
                  onClick={async () => {
                    const updated = await updateAlertStatus(alert.id, status)
                    setAlert((prev) => ({ ...prev, ...updated, status }))
                    setToast(`Alert status updated to ${status}.`)
                    await load()
                  }}
                >
                  {status}
                </Button>
              ))}
            </div>
          ) : null}
          <TextArea
            label="Professional notes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            disabled={alert.status === 'Resolved'}
          />
          {alert.status !== 'Resolved' ? (
            <Button
              className="mt-3 !bg-[#005a40] !text-white hover:!bg-[#004833]"
              disabled={savingNotes}
              onClick={async () => {
                setSavingNotes(true)
                try {
                  const updated = await updateHealthAlert(alert.id, {
                    reviewNotes,
                  })
                  setAlert(updated)
                  setToast('Review notes saved.')
                } finally {
                  setSavingNotes(false)
                }
              }}
            >
              {savingNotes ? 'Saving…' : 'Save Review Notes'}
            </Button>
          ) : null}
        </SectionCard>

        <SectionCard title="Follow-up">
          <div className="space-y-2 text-sm text-[#4b5563]">
            <p>
              Required:{' '}
              <span className="font-semibold text-[#111827]">
                {followUp.required ? 'Yes' : 'No'}
              </span>
            </p>
            <p>Due date: {formatMedicalDate(followUp.dueDate)}</p>
            <p>Status: {followUp.status || '—'}</p>
            <p>Notes: {followUp.notes || '—'}</p>
            {followUp.relatedAppointmentId ? (
              <p>Related appointment: {followUp.relatedAppointmentId}</p>
            ) : null}
          </div>
          {followUp.required && followUp.status !== 'Completed' && alert.status !== 'Resolved' ? (
            <Button
              className="mt-3 !bg-[#005a40] !text-white hover:!bg-[#004833]"
              onClick={async () => {
                const updated = await completeFollowUp(alert.id)
                setAlert(updated)
                setToast('Follow-up marked completed.')
              }}
            >
              Mark Follow-up Completed
            </Button>
          ) : null}
        </SectionCard>

        <SectionCard title="Client Health Context">
          <p className="text-sm text-[#4b5563]">
            Review the authorized health record for programme context and shared safety guidance.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 !text-[#005a40]"
            onClick={() => navigate(`/medical/health-records?client=${alert.clientId}`)}
          >
            Open Health Records
          </Button>
        </SectionCard>

        <SectionCard title="Related Assessment">
          {alert.relatedAssessmentId ? (
            <Button
              to={`/medical/assessments/${alert.relatedAssessmentId}`}
              size="sm"
              variant="outline"
              className="!text-[#005a40]"
            >
              View {alert.relatedAssessmentId}
            </Button>
          ) : (
            <p className="text-sm text-[#6b7280]">No related assessment linked.</p>
          )}
        </SectionCard>

        <SectionCard title="Wellness Plan Impact">
          <div className="grid gap-3 sm:grid-cols-2">
            <Impact label="Fitness Plan" value={impact.fitness || 'No Change'} />
            <Impact label="Nutrition Plan" value={impact.nutrition || 'No Change'} />
          </div>
          <p className="mt-3 text-[12px] text-[#6b7280]">
            High-level guidance only — coaches and nutrition consultants review their own plans.
          </p>
        </SectionCard>
      </div>

      <SectionCard className="mb-4" title="Shared Wellness Safety Guidance">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={guidance.status || 'Draft'} />
          <p className="text-[12px] text-[#6b7280]">
            Updated {formatMedicalDate(guidance.lastUpdated)}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#eef2f0] bg-[#f8faf9] px-4 py-3">
            <p className="text-[11px] font-bold tracking-wide text-[#005a40] uppercase">
              Fitness Guidance
            </p>
            <p className="mt-2 text-sm text-[#4b5563]">{guidance.fitness || '—'}</p>
          </div>
          <div className="rounded-2xl border border-[#eef2f0] bg-[#f8faf9] px-4 py-3">
            <p className="text-[11px] font-bold tracking-wide text-[#005a40] uppercase">
              Nutrition Guidance
            </p>
            <p className="mt-2 text-sm text-[#4b5563]">{guidance.nutrition || '—'}</p>
          </div>
        </div>
        {(guidance.sharedWith || []).length > 0 ? (
          <p className="mt-3 text-[12px] text-[#6b7280]">
            Shared with: {guidance.sharedWith.join(', ')}
          </p>
        ) : null}
      </SectionCard>

      {alert.status === 'Resolved' ? (
        <SectionCard className="mb-4" title="Resolution">
          <div className="grid gap-3 sm:grid-cols-3">
            <Meta label="Resolved date" value={formatMedicalDate(alert.resolvedDate)} />
            <Meta label="Resolved by" value={alert.resolvedBy || '—'} />
            <Meta label="Notes" value={alert.resolutionNotes || '—'} />
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Alert Activity">
        <ul className="space-y-3">
          {(alert.activity || []).map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-1 border-b border-[#eef2f0] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-[#374151]">{item.text}</p>
              <p className="text-[12px] whitespace-nowrap text-[#8b93a1]">
                {formatActivity(item.at)}
              </p>
            </li>
          ))}
        </ul>
      </SectionCard>

      <ConfirmDialog
        open={startReviewOpen}
        onClose={() => setStartReviewOpen(false)}
        title="Start Medical Review?"
        description="This alert will be marked as Under Review."
        confirmLabel="Start Review"
        cancelLabel="Cancel"
        onConfirm={async () => {
          const updated = await startAlertReview(alert.id, reviewNotes)
          setAlert(updated)
          setStartReviewOpen(false)
          setToast('Review started.')
        }}
      />

      <ConfirmDialog
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title="Resolve Health Risk Alert?"
        description="Confirm resolution notes before closing this alert."
        confirmLabel="Resolve Alert"
        cancelLabel="Continue Review"
        tone="danger"
        onConfirm={async () => {
          const updated = await resolveAlert(alert.id, {
            resolutionNotes: resolutionNotes || 'Alert resolved after medical review.',
          })
          setAlert(updated)
          setResolveOpen(false)
          setToast('Alert resolved.')
        }}
      >
        <TextArea
          label="Resolution notes"
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title="Mark alert inactive?"
        description="This soft-deletes the health risk alert. The record stays in the database and is hidden from the active alert list."
        confirmLabel="Mark Inactive"
        tone="danger"
        onConfirm={async () => {
          const updated = await deactivateHealthAlert(alert.id)
          setAlert(updated)
          setDeactivateOpen(false)
          setToast('Alert marked inactive (soft delete).')
        }}
      />

      <Modal
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        title="Add Follow-up"
        description="Schedule or document follow-up actions for this alert."
        footer={
          <div className="flex flex-wrap justify-end gap-2.5">
            <Button variant="outline" onClick={() => setFollowUpOpen(false)}>
              Cancel
            </Button>
            <Button
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
              onClick={async () => {
                const updated = await addFollowUp(alert.id, {
                  dueDate: followUpForm.dueDate,
                  notes: followUpForm.notes,
                  relatedAppointmentId: followUpForm.relatedAppointmentId || null,
                  status: 'Pending',
                })
                setAlert(updated)
                setFollowUpOpen(false)
                setToast('Follow-up added.')
              }}
            >
              Save Follow-up
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <Input
            type="date"
            label="Due date"
            value={followUpForm.dueDate}
            onChange={(e) =>
              setFollowUpForm((prev) => ({ ...prev, dueDate: e.target.value }))
            }
          />
          <Input
            label="Related appointment ID"
            value={followUpForm.relatedAppointmentId}
            onChange={(e) =>
              setFollowUpForm((prev) => ({
                ...prev,
                relatedAppointmentId: e.target.value,
              }))
            }
          />
          <TextArea
            label="Follow-up notes"
            value={followUpForm.notes}
            onChange={(e) => setFollowUpForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </Modal>

      <Modal
        open={guidanceOpen}
        onClose={() => setGuidanceOpen(false)}
        title="Update Wellness Guidance"
        description="Share high-level fitness and nutrition safety guidance only."
        footer={
          <div className="flex flex-wrap justify-end gap-2.5">
            <Button variant="outline" onClick={() => setGuidanceOpen(false)}>
              Cancel
            </Button>
            <Button
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
              onClick={async () => {
                const updated = await updateGuidance(alert.id, {
                  ...guidanceForm,
                  sharedWith: guidance.sharedWith?.length
                    ? guidance.sharedWith
                    : ['Maya Fernando', 'Maya Fernando'],
                  status: guidanceForm.status || 'Shared',
                })
                setAlert(updated)
                setGuidanceOpen(false)
                setToast('Wellness guidance updated.')
              }}
            >
              Save Guidance
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <TextArea
            label="Fitness guidance"
            value={guidanceForm.fitness}
            onChange={(e) =>
              setGuidanceForm((prev) => ({ ...prev, fitness: e.target.value }))
            }
          />
          <TextArea
            label="Nutrition guidance"
            value={guidanceForm.nutrition}
            onChange={(e) =>
              setGuidanceForm((prev) => ({ ...prev, nutrition: e.target.value }))
            }
          />
        </div>
      </Modal>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
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

function Impact({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#eef2f0] bg-[#f8faf9] px-4 py-3">
      <p className="text-[11px] font-medium text-[#8b93a1]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  )
}

function formatActivity(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
