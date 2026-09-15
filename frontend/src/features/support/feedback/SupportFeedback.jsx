import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Edit2,
  HeartHandshake,
  Lightbulb,
  MessageSquare,
  ShieldAlert,
  ThumbsUp,
  User,
} from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'
import ErrorState from '../../../components/ui/ErrorState'
import StatusBadge from '../../../components/ui/StatusBadge'
import Drawer from '../../../components/ui/Drawer'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import TextArea from '../../../components/ui/TextArea'
import Toast from '../../../components/ui/Toast'
import Avatar from '../../../components/ui/Avatar'
import EmptyState from '../../../components/ui/EmptyState'
import {
  fetchSupportFeedback,
  updateFeedbackStatus,
  addFeedbackNote,
  resolveFeedback,
} from './data/supportFeedbackData'

const feedbackTabs = [
  { id: 'all', label: 'All Entries' },
  { id: 'Positive Feedback', label: 'Positive Feedback' },
  { id: 'Complaint', label: 'Complaints' },
  { id: 'Suggestion', label: 'Suggestions' },
  { id: 'Under Review', label: 'Under Review' },
  { id: 'Resolved', label: 'Resolved' },
]

export default function SupportFeedback() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [toast, setToast] = useState('')

  // Drawer and action modals
  const [selectedItem, setSelectedItem] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [resolutionNote, setResolutionNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchSupportFeedback()
      setItems(data)
    } catch {
      setError('We couldn’t load feedback and complaints.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return items
    if (activeTab === 'Under Review' || activeTab === 'Resolved') {
      return items.filter((i) => i.status === activeTab)
    }
    return items.filter((i) => i.type === activeTab)
  }, [items, activeTab])

  async function handleAcknowledge() {
    if (!selectedItem) return
    setSubmitting(true)
    try {
      const updated = await updateFeedbackStatus(selectedItem.id, 'Acknowledged')
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      setSelectedItem(updated)
      setToast('Feedback marked as Acknowledged.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!noteText.trim() || !selectedItem) return
    setSubmitting(true)
    try {
      const updated = await addFeedbackNote(selectedItem.id, noteText.trim())
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      setSelectedItem(updated)
      setNoteText('')
      setNoteModalOpen(false)
      setToast('Internal note recorded.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResolve(e) {
    e.preventDefault()
    if (!selectedItem) return
    setSubmitting(true)
    try {
      const updated = await resolveFeedback(selectedItem.id, resolutionNote.trim())
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      setSelectedItem(updated)
      setResolutionNote('')
      setResolveModalOpen(false)
      setToast('Complaint marked as Resolved.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback & Complaints"
        description="Review client testimonials, constructive suggestions, and manage complaint resolution workflows."
      />

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#e8ecf1] pb-2 overflow-x-auto scrollbar-none">
        {feedbackTabs.map((tab) => {
          const isActive = activeTab === tab.id
          const count =
            tab.id === 'all'
              ? items.length
              : tab.id === 'Under Review' || tab.id === 'Resolved'
              ? items.filter((i) => i.status === tab.id).length
              : items.filter((i) => i.type === tab.id).length

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all',
                isActive
                  ? 'bg-[#005a40] text-white shadow-xs'
                  : 'text-[#6b7280] hover:bg-[#f4f6fb] hover:text-[#111827]',
              ].join(' ')}
            >
              <span>{tab.label}</span>
              <span
                className={[
                  'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                  isActive ? 'bg-white/25 text-white' : 'bg-[#e8ecf1] text-[#4b5563]',
                ].join(' ')}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Items List / Table */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-[#e8ecf1] bg-white p-8">
          <EmptyState
            icon={ClipboardList}
            title="No feedback entries found"
            description="There are currently no items matching this category filter."
          />
        </div>
      ) : (
        <div className="rounded-3xl border border-[#e8ecf1] bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#4b5563]">
              <thead className="border-b border-[#e8ecf1] bg-[#f8faf9] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Client</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Subject &amp; Snippet</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Assigned To</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ecf1]">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item)
                      setDrawerOpen(true)
                    }}
                    className="cursor-pointer hover:bg-[#f8faf9] transition-colors"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-[#111827] whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar name={item.client} size="sm" />
                        <div>
                          <span className="font-semibold text-[#111827] block truncate">
                            {item.client}
                          </span>
                          <span className="text-[11px] text-[#8b93a1] block">
                            {item.clientId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={item.type} />
                    </td>
                    <td className="px-4 py-4 max-w-[280px]">
                      <span className="font-medium text-[#1f2937] block line-clamp-1">
                        {item.subject}
                      </span>
                      <span className="text-[11px] text-[#6b7280] line-clamp-1 mt-0.5">
                        {item.message}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#6b7280]">
                      {new Date(item.date).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-[#111827] font-medium">
                        {item.assignedTo || 'Unassigned'}
                      </span>
                    </td>
                    <td
                      className="px-4 py-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItem(item)
                          setDrawerOpen(true)
                        }}
                        className="rounded-xl border border-[#e8ecf1] bg-white px-3 py-1.5 text-xs font-semibold text-[#005a40] hover:bg-[#f4f6fb] transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedItem?.id || 'Feedback Details'}
        description={selectedItem?.type}
        width="md"
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            {selectedItem?.type === 'Complaint' && selectedItem.status !== 'Resolved' ? (
              <Button
                size="sm"
                onClick={() => setResolveModalOpen(true)}
                className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Resolve Complaint
              </Button>
            ) : selectedItem?.status !== 'Acknowledged' && selectedItem?.status !== 'Resolved' ? (
              <Button
                size="sm"
                onClick={handleAcknowledge}
                disabled={submitting}
                className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
              >
                Acknowledge
              </Button>
            ) : (
              <span className="text-xs text-[#005a40] font-semibold">
                Status: {selectedItem?.status}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNoteModalOpen(true)}
              className="!border-[#e8ecf1] !text-[#4b5563]"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Add Note
            </Button>
          </div>
        }
      >
        {selectedItem ? (
          <div className="space-y-5 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={selectedItem.type} />
                <StatusBadge status={selectedItem.status} />
              </div>
              <h3 className="font-display text-base font-bold text-[#111827] leading-snug">
                {selectedItem.subject}
              </h3>
            </div>

            {/* Complaint Lifecycle if applicable */}
            {selectedItem.complaintLifecycle ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-700" />
                  <span className="font-bold text-amber-950">Complaint Resolution Workflow</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-amber-900 border-t border-amber-200/60 pt-2">
                  {selectedItem.complaintLifecycle.steps.map((step, idx) => {
                    const isDone =
                      step === 'Received' ||
                      (step === 'Under Review' && (selectedItem.status === 'Under Review' || selectedItem.status === 'Resolved')) ||
                      (step === 'Resolved' && selectedItem.status === 'Resolved')

                    return (
                      <div key={step} className="flex flex-col items-center text-center">
                        <span
                          className={[
                            'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1',
                            isDone ? 'bg-[#005a40] text-white' : 'bg-amber-200 text-amber-900',
                          ].join(' ')}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-medium max-w-[50px] leading-tight">
                          {step}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {/* Client Card */}
            <div className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-3.5">
              <div className="flex items-center gap-2.5">
                <Avatar name={selectedItem.client} size="sm" />
                <div>
                  <span className="font-semibold text-[#111827] block">{selectedItem.client}</span>
                  <span className="text-[#6b7280]">
                    Client ID: {selectedItem.clientId} · {selectedItem.relatedService || 'General Care'}
                  </span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <span className="font-semibold text-[#374151]">Client Feedback:</span>
              <div className="rounded-2xl border border-[#e8ecf1] bg-white p-4 leading-relaxed text-[#374151]">
                &ldquo;{selectedItem.message}&rdquo;
              </div>
            </div>

            {/* Notes history */}
            {selectedItem.notes && selectedItem.notes.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-[#e8ecf1]">
                <span className="font-semibold text-[#374151]">Internal Care &amp; Review Notes:</span>
                <div className="space-y-1.5">
                  {selectedItem.notes.map((note, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-[#e8ecf1] bg-[#f8faf9] p-2.5 text-xs text-[#4b5563]"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      {/* Add Note Modal */}
      <Modal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Add Review Note"
        description={`Add internal note for ${selectedItem?.id}`}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setNoteModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={submitting || !noteText.trim()}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              {submitting ? 'Saving…' : 'Save Note'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddNote} className="space-y-3">
          <TextArea
            id="feedback-note"
            label="Internal Note"
            placeholder="Record review findings or manager follow-up actions…"
            rows={3}
            required
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        </form>
      </Modal>

      {/* Resolve Complaint Modal */}
      <Modal
        open={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Client Complaint"
        description={`Record resolution details for ${selectedItem?.id}`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setResolveModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={submitting}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              {submitting ? 'Resolving…' : 'Mark as Resolved'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleResolve} className="space-y-3">
          <TextArea
            id="complaint-resolution-note"
            label="Resolution Summary"
            placeholder="Document corrective actions communicated to the client and clinic management…"
            rows={3}
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
          />
        </form>
      </Modal>

      <Toast open={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
