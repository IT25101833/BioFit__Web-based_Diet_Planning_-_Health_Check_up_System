import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { decideClientPlanAccess } from '../../features/medical/plan-access/data/planAccessData'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

function formatRequestedAt(value) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isFitness(item) {
  const type = String(item?.category || item?.resourceType || item?.planType || '').toUpperCase()
  return type.includes('FITNESS') || type.includes('WORKOUT')
}

export default function PlanAccessRequestCard({ requests = [], onChange }) {
  const pending = requests.filter((item) => item?.status === 'PENDING')
  const pendingKey = pending.map((item) => item.id).join(',')
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(() => new Set())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const unseen = pending.filter((item) => !dismissed.has(String(item.id)))

  useEffect(() => {
    if (unseen.length > 0) setOpen(true)
  }, [pendingKey])

  if (pending.length === 0 && !confirmation) return null

  const current = unseen[0] || pending[0]
  const advisorName = current?.requestedBy || 'Your medical advisor'
  const advisor = /^dr\.?\s/i.test(advisorName) ? advisorName : `Dr. ${advisorName}`
  const fitness = current ? isFitness(current) : false
  const popupTitle = 'Medical Advisor Access Request'
  const planLabel = fitness ? 'Workout Plan' : 'Nutrition Plan'

  function close() {
    if (current) {
      const next = new Set(dismissed)
      next.add(String(current.id))
      setDismissed(next)
    }
    setError('')
    setOpen(false)
  }

  async function decide(status) {
    if (!current || busy) return
    setBusy(true)
    setError('')
    setConfirmation('')
    try {
      await decideClientPlanAccess(current.id, status)
      const next = requests.map((item) => (item.id === current.id ? { ...item, status } : item))
      onChange?.(next)
      setConfirmation(
        status === 'REJECTED' ? 'Access request rejected.' : 'Access request accepted successfully.',
      )
      const stillPending = next.some((item) => item.status === 'PENDING')
      if (!stillPending) setOpen(false)
    } catch (err) {
      setError(err?.message || 'This request could not be updated.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {pending.length > 0 ? (
        <section aria-label="Plan access requests">
          <article className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
                  <ShieldCheck className="h-5 w-5" strokeWidth={2.1} />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-[#6b7280]">Medical access request</p>
                  <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-[#111827]">
                    {pending.length === 1
                      ? `${advisor} is waiting for your decision.`
                      : `${pending.length} access requests are waiting for your decision.`}
                  </h2>
                  {confirmation ? (
                    <p className="mt-2 text-sm font-medium text-[#005a40]">{confirmation}</p>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
                onClick={() => {
                  setDismissed(new Set())
                  setError('')
                  setConfirmation('')
                  setOpen(true)
                }}
              >
                Review request
              </Button>
            </div>
          </article>
        </section>
      ) : confirmation ? (
        <p className="rounded-2xl border border-[#d7efe4] bg-[#f3fbf7] px-4 py-3 text-sm font-medium text-[#005a40]">
          {confirmation}
        </p>
      ) : null}

      <Modal
        open={open && Boolean(current)}
        onClose={close}
        title={popupTitle}
        description={`${advisor} requests permission to view your ${planLabel}.`}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => decide('REJECTED')} disabled={busy}>
              {busy ? 'Saving…' : 'Reject'}
            </Button>
            <Button
              type="button"
              className="!bg-[#005a40] !text-white"
              onClick={() => decide('ACCEPTED')}
              disabled={busy}
            >
              {busy ? 'Saving…' : 'Accept'}
            </Button>
          </>
        }
      >
        {current ? (
          <div className="space-y-4 text-sm text-[#374151]">
            {pending.length > 1 ? (
              <p className="text-[12px] font-medium text-[#6b7280]">
                Request 1 of {pending.length}. Each request is decided separately.
              </p>
            ) : null}
            {confirmation ? (
              <p className="rounded-xl bg-[#f3fbf7] px-3 py-2 font-medium text-[#005a40]">{confirmation}</p>
            ) : null}
            {error ? (
              <p className="rounded-xl bg-[#fef2f2] px-3 py-2 text-[#b91c1c]" role="alert">
                {error}
              </p>
            ) : null}
            <div>
              <p className="font-semibold text-[#111827]">Reason</p>
              <p className="mt-1 leading-relaxed">{current.reason || 'No reason was provided.'}</p>
            </div>
            <p>
              <span className="font-semibold text-[#111827]">Requested on: </span>
              {formatRequestedAt(current.requestedAt)}
            </p>
            <p className="font-medium text-[#111827]">Do you want to allow this access?</p>
          </div>
        ) : null}
      </Modal>
    </>
  )
}
