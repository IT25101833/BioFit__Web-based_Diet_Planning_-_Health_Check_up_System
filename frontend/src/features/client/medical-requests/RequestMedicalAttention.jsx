import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
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
  fetchMedicalRequestTimeSlots,
  formatPreferredDate,
  submitMedicalRequest,
  todayIsoDate,
} from './data/medicalRequestData'

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

  async function load() {
    const [advisorRows, requestRows, slots] = await Promise.all([
      fetchMedicalAdvisors(),
      fetchClientMedicalRequests(),
      fetchMedicalRequestTimeSlots(),
    ])
    setAdvisors(Array.isArray(advisorRows) ? advisorRows : [])
    setRequests(Array.isArray(requestRows) ? requestRows : [])
    setTimeSlots(Array.isArray(slots) ? slots : [])
  }

  useEffect(() => {
    load().catch((err) => setError(err?.message || 'Unable to load medical requests.'))
  }, [])

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
      setSubmitted(created)
      setDescription('')
      await load()
    } catch (err) {
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
            onChange={(event) => setPreferredDate(event.target.value)}
          />
          <Select
            label="Preferred Time"
            required
            value={preferredTime}
            onChange={(event) => setPreferredTime(event.target.value)}
            placeholder="Select a time"
            options={timeSlots.map((slot) => ({ value: slot, label: slot }))}
          />
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
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={busy || !advisorId || !preferredDate || !preferredTime}>
            Submit Request
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
