import { useState, useEffect } from 'react'
import { UserCheck, Users } from 'lucide-react'
import Modal from '../../../../components/ui/Modal'
import Button from '../../../../components/ui/Button'
import { supportOfficers } from '../data/supportTicketsData'

export default function AssignTicketModal({ open, onClose, ticket, onAssign }) {
  const [selectedOfficer, setSelectedOfficer] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (ticket) {
      setSelectedOfficer(ticket.assignedTo || '')
    }
  }, [ticket])

  if (!ticket) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedOfficer) return
    setSubmitting(true)
    try {
      await onAssign(selectedOfficer)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  function handleAssignToMe() {
    setSelectedOfficer('Priya Nair')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign Support Ticket"
      description={`Update case ownership for ${ticket.id}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedOfficer || submitting}
            className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
          >
            {submitting ? 'Assigning…' : 'Assign Ticket'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-[#e8ecf1] bg-[#f8faf9] p-4 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[#6b7280]">Ticket:</span>
            <span className="font-semibold text-[#111827]">{ticket.id} — {ticket.subject}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6b7280]">Client:</span>
            <span className="font-medium text-[#111827]">{ticket.client?.name} ({ticket.client?.id})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6b7280]">Current Assignment:</span>
            <span className="font-medium text-[#005a40]">
              {ticket.assignedTo || 'Unassigned'}
            </span>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="officer-select" className="text-xs font-semibold text-[#374151]">
              Assign To Specialist / Officer
            </label>
            <button
              type="button"
              onClick={handleAssignToMe}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#005a40] hover:underline"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Assign to Me
            </button>
          </div>

          <div className="relative">
            <select
              id="officer-select"
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="w-full rounded-xl border border-[#e8ecf1] bg-white px-3.5 py-2.5 text-sm text-[#111827] shadow-sm focus:border-[#005a40] focus:outline-none focus:ring-1 focus:ring-[#005a40]"
            >
              <option value="">Select an officer…</option>
              {supportOfficers.map((off) => (
                <option key={off.id} value={off.name}>
                  {off.name} ({off.role})
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1.5 text-[11px] text-[#6b7280]">
            The assigned officer receives a direct notification in their queue.
          </p>
        </div>
      </form>
    </Modal>
  )
}
