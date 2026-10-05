import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import SectionCard from '../../../components/ui/SectionCard'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import ClientMealPlan from '../../client/nutrition/ClientMealPlan'
import ClientWorkoutPlan from '../../client/workout/ClientWorkoutPlan'
import {
  fetchApprovedNutritionPlan,
  fetchApprovedWorkoutPlan,
  fetchPlanAccessStatus,
  requestPlanAccess,
} from './data/planAccessData'

const DEFAULT_REASONS = {
  WORKOUT_PLAN: 'Requesting access to review the client’s workout plan for medical safety.',
  NUTRITION_PLAN: 'Requesting access to review the client’s nutrition plan based on their medical history.',
}

function statusLabel(status) {
  if (status === 'PENDING') return 'Pending'
  if (status === 'APPROVED') return 'Approved'
  if (status === 'REJECTED') return 'Rejected'
  if (status === 'REVOKED') return 'Revoked'
  return 'Not Requested'
}

export default function PlanAccessPanel({ clientUserId, clientName }) {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [reasons, setReasons] = useState(DEFAULT_REASONS)
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [nutritionPlan, setNutritionPlan] = useState(null)

  async function load() {
    if (!clientUserId) return
    setError('')
    try {
      setStatus(await fetchPlanAccessStatus(clientUserId))
    } catch (err) {
      setError(err?.message || 'Unable to load plan access.')
    }
  }

  useEffect(() => {
    setWorkoutPlan(null)
    setNutritionPlan(null)
    load()
  }, [clientUserId])

  async function request(resourceType) {
    setBusy(resourceType)
    setWorkoutPlan(null)
    setNutritionPlan(null)
    try {
      await requestPlanAccess(Number(clientUserId), resourceType, reasons[resourceType])
      await load()
    } catch (err) {
      setError(err?.message || 'Unable to send the access request.')
    } finally {
      setBusy('')
    }
  }

  async function viewWorkout() {
    setBusy('view-workout')
    setError('')
    try {
      setWorkoutPlan(await fetchApprovedWorkoutPlan(clientUserId))
    } catch (err) {
      setWorkoutPlan(null)
      setError(err?.message || 'Access required')
    } finally {
      setBusy('')
    }
  }

  async function viewNutrition() {
    setBusy('view-nutrition')
    setError('')
    try {
      setNutritionPlan(await fetchApprovedNutritionPlan(clientUserId))
    } catch (err) {
      setNutritionPlan(null)
      setError(err?.message || 'Access required')
    } finally {
      setBusy('')
    }
  }

  if (!clientUserId) {
    return (
      <SectionCard title="Plan access">
        <p className="text-sm text-[#6b7280]">Select a client to request workout or nutrition plan access.</p>
      </SectionCard>
    )
  }

  const workout = status?.workout || status?.fitness || { status: 'NOT_REQUESTED', message: 'Access required' }
  const nutrition = status?.nutrition || { status: 'NOT_REQUESTED', message: 'Access required' }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#4b5563]">
        {clientName ? `${clientName}: ` : ''}
        The client decides whether a Medical Advisor can view their workout or nutrition plan.
      </p>
      {error ? (
        <p className="text-sm text-[#b91c1c]" role="alert">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <AccessCard
          title="Workout Plan"
          block={workout}
          busy={busy === 'WORKOUT_PLAN' || busy === 'view-workout'}
          reason={reasons.WORKOUT_PLAN}
          onReason={(value) => setReasons((prev) => ({ ...prev, WORKOUT_PLAN: value }))}
          requestLabel="Request Workout Plan"
          againLabel="Request Again"
          viewLabel="View Workout Plan"
          onRequest={() => request('WORKOUT_PLAN')}
          onView={viewWorkout}
        />
        <AccessCard
          title="Nutrition Plan"
          block={nutrition}
          busy={busy === 'NUTRITION_PLAN' || busy === 'view-nutrition'}
          reason={reasons.NUTRITION_PLAN}
          onReason={(value) => setReasons((prev) => ({ ...prev, NUTRITION_PLAN: value }))}
          requestLabel="Request Nutrition Plan"
          againLabel="Request Again"
          viewLabel="View Nutrition Plan"
          onRequest={() => request('NUTRITION_PLAN')}
          onView={viewNutrition}
        />
      </div>
      {workoutPlan ? <ClientWorkoutPlan plan={workoutPlan} embedded /> : null}
      {nutritionPlan ? <ClientMealPlan plan={nutritionPlan} embedded /> : null}
    </div>
  )
}

function AccessCard({
  title,
  block,
  busy,
  reason,
  onReason,
  requestLabel,
  againLabel,
  viewLabel,
  onRequest,
  onView,
}) {
  const status = block.status || 'NOT_REQUESTED'
  const waiting = status === 'PENDING'
  const approved = status === 'APPROVED'
  const closed = status === 'REJECTED' || status === 'REVOKED' || status === 'NOT_REQUESTED'
  return (
    <SectionCard title={title}>
      <p className="text-sm text-[#4b5563]">
        Access: <StatusBadge status={statusLabel(status)} />
      </p>
      {waiting ? <p className="mt-2 text-sm text-[#6b7280]">Waiting for client approval.</p> : null}
      {block.message && status !== 'APPROVED' ? (
        <p className="mt-2 text-sm text-[#6b7280]">{block.message}</p>
      ) : null}
      {!approved ? (
        <p className="mt-3 text-sm font-medium text-[#111827]">
          {waiting ? 'Waiting for client approval.' : 'Access required'}
        </p>
      ) : null}
      {closed ? (
        <TextArea
          className="mt-3"
          label="Reason"
          value={reason}
          onChange={(event) => onReason(event.target.value)}
        />
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {status === 'NOT_REQUESTED' ? (
          <Button type="button" onClick={onRequest} disabled={busy} className="!bg-[#005a40] !text-white">
            {requestLabel}
          </Button>
        ) : null}
        {waiting ? (
          <Button type="button" disabled className="!bg-[#005a40] !text-white">
            Request Sent
          </Button>
        ) : null}
        {status === 'REJECTED' || status === 'REVOKED' ? (
          <Button type="button" onClick={onRequest} disabled={busy} className="!bg-[#005a40] !text-white">
            {againLabel}
          </Button>
        ) : null}
        {approved ? (
          <Button type="button" onClick={onView} disabled={busy} className="!bg-[#005a40] !text-white">
            {viewLabel}
          </Button>
        ) : null}
      </div>
    </SectionCard>
  )
}
