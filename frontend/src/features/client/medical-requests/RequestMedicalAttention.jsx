import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import Select from '../../../components/ui/Select'
import StatusBadge from '../../../components/ui/StatusBadge'
import TextArea from '../../../components/ui/TextArea'
import Input from '../../../components/ui/Input'
import {
  cancelClientMedicalRequest,
  fetchClientMedicalRequests,
  fetchMedicalAdvisors,
  buildPreferredTimeSlots,
  fetchMedicalRequestTimeSlots,
  formatPreferredDate,
  submitMedicalRequest,
  todayIsoDate,
} from './data/medicalRequestData'
import { fetchWallet, formatRs } from '../wallet/data/walletData'

const MEDICAL_FEE = 1500

export default function RequestMedicalAttention() {
  const [advisors, setAdvisors] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [requests, setRequests] = useState([])
  const [advisorId, setAdvisorId] = useState('')
  const [reason, setReason] = useState('General Health Concern')
  const [description, setDescription] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const today = todayIsoDate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [shortfall, setShortfall] = useState(null)
  const [confirmPay, setConfirmPay] = useState(null)
  const [slotRefresh, setSlotRefresh] = useState(0)

  async function load() {
    const [advisorRows, requestRows] = await Promise.all([
      fetchMedicalAdvisors(),
      fetchClientMedicalRequests(),
    ])
    setAdvisors(Array.isArray(advisorRows) ? advisorRows : [])
    setRequests(Array.isArray(requestRows) ? requestRows : [])
  }

  useEffect(() => {
    load().catch((err) => setError(err?.message || 'Unable to load medical requests.'))
    fetchWallet()
      .then(setWallet)
      .catch(() => setWallet(null))
  }, [])

  useEffect(() => {
    const localSlots = buildPreferredTimeSlots(preferredDate)
    setTimeSlots(localSlots)
    if (!preferredDate) {
      setPreferredTime('')
      return
    }
    let cancelled = false
    fetchMedicalRequestTimeSlots(preferredDate)
      .then((slots) => {
        if (cancelled || !Array.isArray(slots)) return
        setTimeSlots(slots)
        setPreferredTime((current) => (slots.includes(current) ? current : ''))
      })
      .catch(() => {
        if (!cancelled) setTimeSlots(localSlots)
      })
    return () => {
      cancelled = true
    }
  }, [preferredDate, slotRefresh])

  function openShortfall(current) {
    const balance = Number(current || 0)
    setShortfall({
      current: balance,
      required: MEDICAL_FEE,
      shortfall: Math.max(0, MEDICAL_FEE - balance),
    })
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (preferredDate && preferredDate < today) {
      setError('Please select today or a future date.')
      return
    }
    const selected = new Date(`${preferredDate}T00:00:00`)
    if (selected.getDay() === 0) {
      setError('Please select a Monday to Saturday date.')
      return
    }
    let checkedBalance = Number(wallet?.balance || 0)
    try {
      const latest = await fetchWallet()
      setWallet(latest)
      checkedBalance = Number(latest?.balance || 0)
    } catch (err) {
      setError(err?.message || 'Unable to check your wallet balance. Please try again.')
      return
    }
    if (checkedBalance < MEDICAL_FEE) {
      setConfirmPay(null)
      openShortfall(checkedBalance)
      return
    }
    setError('')
    setConfirmPay({
      balance: checkedBalance,
      required: MEDICAL_FEE,
      remaining: checkedBalance - MEDICAL_FEE,
    })
  }

  async function confirmPayment() {
    if (!confirmPay) return
    setBusy(true)
    setError('')
    try {
      const created = await submitMedicalRequest({
        medicalAdvisorId: Number(advisorId),
        reason,
        description,
        preferredDate,
        preferredTime,
      })
      setConfirmPay(null)
      setSubmitted(created)
      setDescription('')
      setPreferredTime('')
      setSlotRefresh((value) => value + 1)
      await load()
      fetchWallet().then(setWallet).catch(() => {})
    } catch (err) {
      setConfirmPay(null)
      if (err?.code === 'INSUFFICIENT_BALANCE') {
        openShortfall(confirmPay.balance)
        return
      }
      setError(err?.message || 'Unable to submit the medical request.')
    } finally {
      setBusy(false)
    }
  }

  async function cancel(id) {
    setBusy(true)
    setError('')
    try {
      await cancelClientMedicalRequest(id)
      if (submitted?.id === id) setSubmitted(null)
      setSlotRefresh((value) => value + 1)
      await load()
    } catch (err) {
      setError(err?.message || 'Unable to cancel the medical request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Request Medical Attention"
        description="Ask a Medical Advisor to review your health information."
      />

      <SectionCard title="Request Medical Attention">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Reason"
            required
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="General Health Concern"
          />
          <TextArea
            label="Description"
            required
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe your concern..."
          />
          <Input
            label="Preferred Date"
            type="date"
            required
            min={today}
            value={preferredDate}
            onChange={(event) => {
              setPreferredDate(event.target.value)
              setPreferredTime('')
            }}
          />
          <div>
            <p className="mb-1.5 text-sm font-semibold text-[#111827]">
              Preferred Time
              <span className="ml-0.5 text-red-600" aria-hidden>
                *
              </span>
            </p>
            {!preferredDate ? (
              <p className="text-sm text-[#6b7280]">Select a date to see the times.</p>
            ) : timeSlots.length === 0 ? (
              <p className="text-sm text-[#6b7280]">
                No times are left on this date. Choose a Monday to Saturday date. Hours are 9:00 AM to 5:00 PM, and a time already taken by another client is hidden.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {timeSlots.map((slot) => {
                  const selected = preferredTime === slot
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPreferredTime(slot)}
                      className={[
                        'rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors',
                        selected
                          ? 'border-[#005a40] bg-[#005a40] text-white'
                          : 'border-[#e8ecf1] bg-white text-[#111827] hover:border-[#005a40] hover:bg-[#e6f5f0]',
                      ].join(' ')}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <Select
            label="Medical Advisor"
            required
            value={advisorId}
            onChange={(event) => setAdvisorId(event.target.value)}
            placeholder="Select Medical Advisor"
            options={advisors.map((advisor) => ({
              value: String(advisor.id),
              label: advisor.name || 'Medical Advisor',
            }))}
          />
          <p className="text-sm text-[#4b5563]">
            This request costs {formatRs(MEDICAL_FEE)} and is paid from your wallet before it is submitted.
            {wallet ? ` Available balance ${formatRs(wallet.balance)}.` : ''}
          </p>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={busy || !advisorId || !preferredDate || !preferredTime}>
            {busy ? 'Submitting…' : `Pay ${formatRs(MEDICAL_FEE)} and Submit`}
          </Button>
        </form>
      </SectionCard>

      {submitted ? (
        <SectionCard title="Request submitted">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Detail label="Status" value={submitted.status} badge />
            <Detail label="Medical Advisor" value={submitted.advisorName || submitted.medicalAdvisorName} />
            <Detail label="Preferred Date" value={formatPreferredDate(submitted.preferredDate)} />
            <Detail label="Preferred Time" value={submitted.preferredTime} />
          </dl>
        </SectionCard>
      ) : null}

      <SectionCard title="Your medical requests">
        {requests.length === 0 ? (
          <p className="text-sm text-[#6b7280]">You have not requested medical attention yet.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border border-[#eef2f0] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#111827]">{request.reason}</p>
                  <StatusBadge status={request.status} />
                </div>
                <p className="mt-1 text-[12px] text-[#6b7280]">
                  {request.advisorName || 'Medical Advisor'} · Preferred Date {formatPreferredDate(request.preferredDate)} · Preferred Time {request.preferredTime || '—'}
                </p>
                {request.status === 'REJECTED' && request.rejectionReason ? (
                  <p className="mt-2 text-sm text-[#6b7280]">{request.rejectionReason}</p>
                ) : null}
                {request.status === 'PENDING' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 !text-[#005a40]"
                    disabled={busy}
                    onClick={() => cancel(request.id)}
                  >
                    Cancel request
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      <Modal
        open={Boolean(confirmPay)}
        onClose={() => {
          if (!busy) setConfirmPay(null)
        }}
        title="Confirm wallet payment"
        description="This amount will be taken from your wallet before the medical request is sent."
        footer={
          <>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => setConfirmPay(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={busy}
              onClick={confirmPayment}
              className="!bg-[#005a40] hover:!bg-[#004833]"
            >
              {busy ? 'Paying…' : `Pay ${formatRs(MEDICAL_FEE)}`}
            </Button>
          </>
        }
      >
        {confirmPay ? (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-[12px] font-medium text-[#8b93a1]">Current Balance</dt>
              <dd className="mt-1 text-sm font-semibold text-[#111827]">{formatRs(confirmPay.balance)}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#8b93a1]">Payment</dt>
              <dd className="mt-1 text-sm font-semibold text-[#111827]">{formatRs(confirmPay.required)}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#8b93a1]">Balance After Payment</dt>
              <dd className="mt-1 text-sm font-semibold text-[#111827]">{formatRs(confirmPay.remaining)}</dd>
            </div>
          </dl>
        ) : null}
      </Modal>
      <Modal
        open={Boolean(shortfall)}
        onClose={() => setShortfall(null)}
        title="Insufficient Wallet Balance"
        description="Your wallet does not have enough money to pay for this medical request. Add a cash top-up, then submit again."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShortfall(null)}>
              Close
            </Button>
            <Button size="sm" to="/client/wallet/top-up" className="!bg-[#005a40] hover:!bg-[#004833]">
              Request Top-Up
            </Button>
          </>
        }
      >
        {shortfall ? (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-[12px] font-medium text-[#8b93a1]">Current Balance</dt>
              <dd className="mt-1 text-sm font-semibold text-[#111827]">{formatRs(shortfall.current)}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#8b93a1]">Required</dt>
              <dd className="mt-1 text-sm font-semibold text-[#111827]">{formatRs(shortfall.required)}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-[#8b93a1]">Shortfall</dt>
              <dd className="mt-1 text-sm font-semibold text-[#111827]">{formatRs(shortfall.shortfall)}</dd>
            </div>
          </dl>
        ) : null}
      </Modal>
    </div>
  )
}

function Detail({ label, value, badge = false }) {
  return (
    <div>
      <dt className="text-[12px] font-medium text-[#8b93a1]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#111827]">
        {badge ? <StatusBadge status={value} /> : value || '—'}
      </dd>
    </div>
  )
}
