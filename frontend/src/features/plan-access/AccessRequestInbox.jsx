import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import SectionCard from '../../components/ui/SectionCard'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiRequest } from '../../api/client'

function formatWhen(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AccessRequestInbox({
  title,
  description,
  requestsPath,
  alertsPath,
  alertHeading,
}) {
  const [requests, setRequests] = useState([])
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setError('')
    try {
      const [requestRows, alertRows] = await Promise.all([
        requestsPath ? apiRequest(requestsPath) : Promise.resolve([]),
        apiRequest(alertsPath),
      ])
      setRequests(Array.isArray(requestRows) ? requestRows : [])
      setAlerts(Array.isArray(alertRows) ? alertRows : [])
    } catch (err) {
      setError(err?.message || 'Unable to load access requests.')
    }
  }

  useEffect(() => {
    load()
  }, [requestsPath, alertsPath])

  async function decide(id, status) {
    setBusyId(id)
    try {
      await apiRequest(`${requestsPath}/${id}/decide`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })
      await load()
    } catch (err) {
      setError(err?.message || 'Unable to update the request.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title={title} description={description} />
      {error ? (
        <p className="text-sm text-[#b91c1c]" role="alert">
          {error}
        </p>
      ) : null}

      <SectionCard title={alertHeading}>
        {alerts.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No health risk alerts in this category.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-[#eef2f0] px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[#111827]">{alert.title}</p>
                  <StatusBadge status={alert.priority || 'Medium'} />
                  <StatusBadge status={alert.category || 'General'} />
                </div>
                <p className="mt-1 text-[12px] text-[#6b7280]">
                  {alert.clientName || 'Client'} · {formatWhen(alert.dateRaised)}
                </p>
                {alert.reason ? <p className="mt-2 text-sm text-[#4b5563]">{alert.reason}</p> : null}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {requestsPath ? (
      <SectionCard title="Access Requests">
        {requests.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No access requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="text-[11px] font-bold tracking-wide text-[#8b93a1] uppercase">
                <tr>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Requested By</th>
                  <th className="px-3 py-2">Requested Date</th>
                  <th className="px-3 py-2">Resource</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((item) => (
                  <tr key={item.id} className="border-t border-[#eef2f0]">
                    <td className="px-3 py-3 font-semibold text-[#111827]">{item.clientName}</td>
                    <td className="px-3 py-3 text-[#4b5563]">{item.requestedBy}</td>
                    <td className="px-3 py-3 text-[#4b5563]">{formatWhen(item.requestedAt)}</td>
                    <td className="px-3 py-3 text-[#4b5563]">{item.resource}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-3 py-3">
                      {item.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => decide(item.id, 'APPROVED')}
                            disabled={busyId === item.id}
                            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
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
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
      ) : null}
    </div>
  )
}
