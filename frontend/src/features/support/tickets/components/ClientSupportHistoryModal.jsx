import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, History, ShieldCheck } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import StatusBadge from '../../../../components/ui/StatusBadge'
import LoadingSkeleton from '../../../../components/ui/LoadingSkeleton'
import EmptyState from '../../../../components/ui/EmptyState'
import { fetchClientSupportHistory } from '../data/supportTicketsData'

export default function ClientSupportHistoryModal({ open, onClose, client }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && client?.id) {
      setLoading(true)
      fetchClientSupportHistory(client.id)
        .then((res) => setTickets(res))
        .finally(() => setLoading(false))
    }
  }, [open, client])

  if (!client) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Client Support History"
      description={`Past support tickets for ${client.name} (${client.id})`}
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Privacy Note */}
        <div className="flex items-center gap-2 rounded-xl bg-[#f4f6fb] px-3.5 py-2.5 text-xs text-[#4b5563]">
          <ShieldCheck className="h-4 w-4 text-[#005a40] shrink-0" />
          <span>Support history only. Medical consults and clinical diagnostics are restricted.</span>
        </div>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={History}
            title="No past support tickets"
            description="This client has no previously logged service requests."
          />
        ) : (
          <div className="divide-y divide-[#e8ecf1] rounded-2xl border border-[#e8ecf1] overflow-hidden">
            {tickets.map((t) => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-[#f8faf9] gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-[#111827]">{t.id}</span>
                    <StatusBadge status={t.status} />
                    <span className="text-[11px] text-[#6b7280]">· {t.category}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[#1f2937] truncate">{t.subject}</p>
                  <p className="mt-0.5 text-xs text-[#6b7280]">
                    Created: {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {t.assignedTo ? ` · Assigned to ${t.assignedTo}` : ' · Unassigned'}
                  </p>
                </div>
                <Link
                  to={`/support/tickets/${t.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#005a40] hover:underline shrink-0"
                >
                  <span>View Details</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
