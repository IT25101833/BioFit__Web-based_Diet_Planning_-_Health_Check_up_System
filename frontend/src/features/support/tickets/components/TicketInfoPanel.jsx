import { useState } from 'react'
import { Calendar, Clock, Edit2, ShieldAlert, Tag, User, UserCheck } from 'lucide-react'
import StatusBadge from '../../../../components/ui/StatusBadge'
import Button from '../../../../components/ui/Button'
import { supportCategories, supportPriorities } from '../data/supportTicketsData'
import { ticketCapabilities } from '../ticketState'

export default function TicketInfoPanel({
  ticket,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateCategory,
  onOpenAssignModal,
}) {
  const caps = ticketCapabilities(ticket)
  const [editingStatus, setEditingStatus] = useState(false)
  const [editingPriority, setEditingPriority] = useState(false)
  const [editingCategory, setEditingCategory] = useState(false)

  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-[#eef2f0] pb-3">
        <h3 className="font-display text-sm font-bold text-[#111827]">
          Ticket Details
        </h3>
        <span className="font-mono text-xs font-semibold text-[#6b7280]">
          {ticket.id}
        </span>
      </div>

      <div className="space-y-4 text-xs">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-[#6b7280]">Status:</span>
          {editingStatus && caps.statusTargets.length > 0 ? (
            <select
              value={ticket.status}
              onChange={(e) => {
                onUpdateStatus(e.target.value)
                setEditingStatus(false)
              }}
              className="rounded-lg border border-[#e8ecf1] bg-white px-2 py-1 text-xs text-[#111827] focus:outline-none"
            >
              <option value={ticket.status}>{ticket.status}</option>
              {caps.statusTargets
                .filter((status) => status !== ticket.status)
                .map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5">
              <StatusBadge status={ticket.status} />
              {caps.statusTargets.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setEditingStatus(true)}
                  className="text-[#9ca3af] hover:text-[#005a40]"
                  aria-label="Edit Status"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="flex items-center justify-between">
          <span className="text-[#6b7280]">Priority:</span>
          {editingPriority ? (
            <select
              value={ticket.priority}
              onChange={(e) => {
                onUpdatePriority(e.target.value)
                setEditingPriority(false)
              }}
              className="rounded-lg border border-[#e8ecf1] bg-white px-2 py-1 text-xs text-[#111827] focus:outline-none"
            >
              {supportPriorities.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5">
              <span
                className={[
                  'rounded-md px-2 py-0.5 text-xs font-medium',
                  ticket.priority === 'High'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700',
                ].join(' ')}
              >
                {ticket.priority}
              </span>
              {caps.canEditPriority ? (
                <button
                  type="button"
                  onClick={() => setEditingPriority(true)}
                  className="text-[#9ca3af] hover:text-[#005a40]"
                  aria-label="Edit Priority"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-[#6b7280]">Category:</span>
          {editingCategory ? (
            <select
              value={ticket.category}
              onChange={(e) => {
                onUpdateCategory(e.target.value)
                setEditingCategory(false)
              }}
              className="rounded-lg border border-[#e8ecf1] bg-white px-2 py-1 text-xs text-[#111827] focus:outline-none"
            >
              {supportCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-[#111827] truncate max-w-[140px]">
                {ticket.category}
              </span>
              {caps.canEditCategory ? (
                <button
                  type="button"
                  onClick={() => setEditingCategory(true)}
                  className="text-[#9ca3af] hover:text-[#005a40]"
                  aria-label="Edit Category"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Assigned Officer */}
        <div className="flex items-center justify-between">
          <span className="text-[#6b7280]">Assigned Officer:</span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#005a40]">
              {!ticket.assignedTo || ticket.assignedTo === 'Support Desk' || ticket.assignedTo === 'Unassigned'
                ? 'Unassigned'
                : ticket.assignedTo}
            </span>
            {caps.canAssign ? (
              <button
                type="button"
                onClick={onOpenAssignModal}
                className="text-[#9ca3af] hover:text-[#005a40]"
                aria-label="Change Assignment"
              >
                <UserCheck className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Waiting On */}
        <div className="flex items-center justify-between border-t border-[#eef2f0] pt-3">
          <span className="text-[#6b7280]">Waiting On:</span>
          <span
            className={[
              'rounded-full px-2.5 py-0.5 font-semibold text-xs',
              ticket.waitingOn === 'Support'
                ? 'bg-emerald-50 text-emerald-800'
                : ticket.waitingOn === 'Client'
                ? 'bg-amber-50 text-amber-800'
                : 'bg-purple-50 text-purple-800',
            ].join(' ')}
          >
            {ticket.waitingOn || '—'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6b7280]">Waiting Since:</span>
          <span className="font-medium text-[#111827]">
            {ticket.waitingSince
              ? new Date(ticket.waitingSince).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6b7280]">Waiting Time:</span>
          <span className="font-medium text-[#111827]">
            {ticket.waitingTimeMinutes == null ? '—' : `${ticket.waitingTimeMinutes} min`}
          </span>
        </div>

        {ticket.resolution?.summary ? (
          <div className="rounded-2xl border border-[#e6f5f0] bg-[#f4fbf8] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#005a40]">Resolution</p>
            <p className="mt-1 text-xs leading-relaxed text-[#374151]">{ticket.resolution.summary}</p>
          </div>
        ) : null}

        {/* Timestamps */}
        <div className="space-y-1.5 border-t border-[#eef2f0] pt-3 text-[11px] text-[#6b7280]">
          <div className="flex items-center justify-between">
            <span>Created:</span>
            <span className="font-medium text-[#111827]">
              {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })},{' '}
              {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last Updated:</span>
            <span className="font-medium text-[#111827]">
              {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
