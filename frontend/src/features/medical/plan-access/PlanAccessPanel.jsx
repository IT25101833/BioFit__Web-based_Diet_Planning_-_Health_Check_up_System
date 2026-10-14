import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import SectionCard from '../../../components/ui/SectionCard'
import TextArea from '../../../components/ui/TextArea'
import ClientMealPlan from '../../client/nutrition/ClientMealPlan'
import ClientWorkoutPlan from '../../client/workout/ClientWorkoutPlan'
import {
  fetchApprovedNutritionPlan,
  fetchApprovedWorkoutPlan,
  fetchPlanAccessStatus,
  requestPlanAccess,
} from './data/planAccessData'

const REQUEST_COPY = {
  WORKOUT_PLAN: {
    title: 'Request Workout Plan',
    body: "You are requesting permission to view this client's workout plan and exercise schedule.",
    button: 'Request Workout Plan',
    view: 'View Workout Plan',
  },
  NUTRITION_PLAN: {
    title: 'Request Nutrition Plan',
    body: "You are requesting permission to view this client's nutrition plan, meals, and dietary recommendations.",
    button: 'Request Nutrition Plan',
    view: 'View Nutrition Plan',
  },
}

function isGranted(status) {
  return status === 'ACCEPTED' || status === 'APPROVED'
}

export default function PlanAccessPanel({ clientUserId, clientName }) {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [dialog, setDialog] = useState(null)
  const [reason, setReason] = useState('')
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [nutritionPlan, setNutritionPlan] = useState(null)

  async function load() {
    if (!clientUserId) return
    setError('')
    try {
      const next = await fetchPlanAccessStatus(clientUserId)
      setStatus(next)
      if (!isGranted(next?.workout?.status) && !isGranted(next?.fitness?.status)) setWorkoutPlan(null)
      if (!isGranted(next?.nutrition?.status)) setNutritionPlan(null)
    } catch (err) {
      setStatus(null)
      setWorkoutPlan(null)
      setNutritionPlan(null)
      setError(err?.message || 'Unable to load plan access.')
    }
  }

  useEffect(() => {
    setWorkoutPlan(null)
    setNutritionPlan(null)
    setNotice('')
    setDialog(null)
    load()
  }, [clientUserId])

  useEffect(() => {
    function refresh() {
      if (document.visibilityState === 'visible') load()
    }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [clientUserId])

  function openRequest(resourceType) {
    setDialog(resourceType)
    setReason('')
    setError('')
  }

  async function sendRequest() {
    const trimmed = reason.trim()
    setBusy(dialog)
    setError('')
    setNotice('')
    try {
      await requestPlanAccess(Number(clientUserId), dialog, trimmed)
      setDialog(null)
      setNotice('Access request sent successfully. Waiting for client approval.')
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
      setError(err?.message || 'Workout plan access has not been approved.')
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
      setError(err?.message || 'Nutrition plan access has not been approved.')
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

  const workout = status?.workout || status?.fitness || { status: 'NOT_REQUESTED' }
  const nutrition = status?.nutrition || { status: 'NOT_REQUESTED' }
  const copy = dialog ? REQUEST_COPY[dialog] : null

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#4b5563]">
        {clientName ? `${clientName}: ` : ''}
        Request access separately. A plan stays hidden until this client accepts that request.
      </p>
      {error && !dialog ? (
        <p className="text-sm text-[#b91c1c]" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-2xl border border-[#d7efe4] bg-[#f3fbf7] px-4 py-3 text-sm font-medium text-[#005a40]">
          {notice}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <AccessCard
          title="Workout Plan"
          block={workout}
          busy={busy === 'view-workout'}
          requestLabel={REQUEST_COPY.WORKOUT_PLAN.button}
          viewLabel={REQUEST_COPY.WORKOUT_PLAN.view}
          onRequest={() => openRequest('WORKOUT_PLAN')}
          onView={viewWorkout}
        />
        <AccessCard
          title="Nutrition Plan"
          block={nutrition}
          busy={busy === 'view-nutrition'}
          requestLabel={REQUEST_COPY.NUTRITION_PLAN.button}
          viewLabel={REQUEST_COPY.NUTRITION_PLAN.view}
          onRequest={() => openRequest('NUTRITION_PLAN')}
          onView={viewNutrition}
        />
      </div>
      {isGranted(workout.status) && workoutPlan ? <ClientWorkoutPlan plan={workoutPlan} embedded /> : null}
      {isGranted(nutrition.status) && nutritionPlan ? <ClientMealPlan plan={nutritionPlan} embedded /> : null}

      <Modal
        open={Boolean(dialog)}
        onClose={() => {
          if (busy) return
          setDialog(null)
          setError('')
        }}
        title={copy?.title || 'Request access'}
        description={copy?.body}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setDialog(null)} disabled={Boolean(busy)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="!bg-[#005a40] !text-white"
              onClick={sendRequest}
              disabled={Boolean(busy)}
            >
              {busy ? 'Sending…' : 'Send Request'}
            </Button>
          </>
        }
      >
        {error ? (
          <p className="mb-3 text-sm text-[#b91c1c]" role="alert">
            {error}
          </p>
        ) : null}
        <TextArea
          label="Reason for request (optional)"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
        />
      </Modal>
    </div>
  )
}

function AccessCard({ title, block, busy, requestLabel, viewLabel, onRequest, onView }) {
  const status = block?.status || 'NOT_REQUESTED'
  const pending = status === 'PENDING'
  const accepted = isGranted(status)
  const rejected = status === 'REJECTED' || status === 'REVOKED'
  const notRequested = status === 'NOT_REQUESTED' || (!pending && !accepted && !rejected)
  const statusLabel = pending
    ? 'Pending'
    : accepted
      ? 'Accepted'
      : rejected
        ? 'Rejected'
        : 'Not Requested'

  return (
    <SectionCard title={title}>
      <p className="text-sm text-[#4b5563]">
        Status: <span className="font-semibold text-[#111827]">{statusLabel}</span>
      </p>
      {pending ? <p className="mt-2 text-sm text-[#6b7280]">Waiting for client approval.</p> : null}
      <div className="mt-4">
        {notRequested ? (
          <Button type="button" onClick={onRequest} className="!bg-[#005a40] !text-white">
            {requestLabel}
          </Button>
        ) : null}
        {rejected ? (
          <Button type="button" onClick={onRequest} className="!bg-[#005a40] !text-white">
            {requestLabel}
          </Button>
        ) : null}
        {accepted ? (
          <Button type="button" onClick={onView} disabled={busy} className="!bg-[#005a40] !text-white">
            {busy ? 'Loading…' : viewLabel}
          </Button>
        ) : null}
      </div>
    </SectionCard>
  )
}
