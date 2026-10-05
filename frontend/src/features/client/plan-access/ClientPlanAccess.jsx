import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import PageHeader from '../../../components/ui/PageHeader'
import SectionCard from '../../../components/ui/SectionCard'
import TextArea from '../../../components/ui/TextArea'
import {
  decideClientPlanAccess,
  fetchClientPlanAccessRequests,
  revokeClientPlanAccess,
} from '../../medical/plan-access/data/planAccessData'

function formatWhen(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ClientPlanAccess() {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [reasons, setReasons] = useState({})

  async function load() {
    setError('')
    try {
      const rows = await fetchClientPlanAccessRequests()
      setRequests(Array.isArray(rows) ? rows : [])
    } catch (err) {
      setError(err?.message || 'Unable to load access requests.')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function decide(id, status) {
    setBusyId(id)
    try {
      await decideClientPlanAccess(id, status, reasons[id])
      await load()
    } catch (err) {
      setError(err?.message || 'Unable to update the request.')
    } finally {
      setBusyId(null)
    }
  }

  async function revoke(id) {
    setBusyId(id)
    try {
      await revokeClientPlanAccess(id)
      await load()
    } catch (err) {
      setError(err?.message || 'Unable to revoke access.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Medical Advisor Access Requests"
        description="You decide whether a Medical Advisor can view your workout plan or nutrition plan."
      />
      {error ? (
        <p className="text-sm text-[#b91c1c]" role="alert">
          {error}
        </p>
      ) : null}
      {requests.length === 0 ? (
        <SectionCard title="Medical Advisor Access Requests">
          <p className="text-sm text-[#6b7280]">You have no access requests.</p>
        </SectionCard>
      ) : (
        requests.map((item) => (
          <SectionCard key={item.id} title="Medical Advisor Access Requests">
            <p className="text-sm font-semibold text-[#111827]">
              {item.requestedBy || 'Medical Advisor'} wants to view your:
            </p>
            <p className="mt-2 text-base font-bold text-[#005a40]">{item.resource}</p>
            <p className="mt-3 text-sm text-[#4b5563]">
              Reason:
              <span className="mt-1 block">{item.reason}</span>
            </p>
            <p className="mt-3 text-sm text-[#6b7280]">Requested: {formatWhen(item.requestedAt)}</p>
            <p className="mt-2 text-sm text-[#6b7280]">Status: {item.status}</p>
            {item.status === 'PENDING' ? (
              <div className="mt-4 space-y-3">
                <TextArea
                  label="Rejection reason (optional)"
                  value={reasons[item.id] || ''}
                  onChange={(event) =>
                    setReasons((prev) => ({ ...prev, [item.id]: event.target.value }))
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => decide(item.id, 'APPROVED')}
                    disabled={busyId === item.id}
                    className="!bg-[#005a40] !text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => decide(item.id, 'REJECTED')}
                    disabled={busyId === item.id}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : null}
            {item.status === 'APPROVED' ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => revoke(item.id)}
                disabled={busyId === item.id}
              >
                Revoke access
              </Button>
            ) : null}
          </SectionCard>
        ))
      )}
    </div>
  )
}
