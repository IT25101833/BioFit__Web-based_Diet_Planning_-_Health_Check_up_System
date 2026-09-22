import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, MessageSquare, Send, Sparkles, User, Ticket } from 'lucide-react'
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
  fetchClientInquiries,
  respondToInquiry,
  convertInquiryToTicket,
} from './data/supportInquiriesData'
import { subscribeSupportMock } from '../data/supportMockStore'

const filterTabs = [
  { id: 'all', label: 'All Inquiries' },
  { id: 'New', label: 'New' },
  { id: 'Assigned', label: 'Assigned' },
  { id: 'Responded', label: 'Responded' },
  { id: 'Closed', label: 'Closed' },
]

export default function ClientInquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [toast, setToast] = useState('')

  // Selected inquiry for drawer and reply modal
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [replyModalOpen, setReplyModalOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [converting, setConverting] = useState(false)

  async function load({ quiet = false } = {}) {
    if (!quiet) setLoading(true)
    setError('')
    try {
      const data = await fetchClientInquiries()
      setInquiries(data)
    } catch {
      setError('We couldn’t load client inquiries.')
    } finally {
      if (!quiet) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    return subscribeSupportMock(() => load({ quiet: true }))
  }, [])

  const filteredInquiries = useMemo(() => {
    if (activeTab === 'all') return inquiries
    return inquiries.filter((i) => i.status === activeTab)
  }, [inquiries, activeTab])

  async function handleSendResponse(e) {
    e.preventDefault()
    if (!replyText.trim() || !selectedInquiry) return
    setReplying(true)
    try {
      const updated = await respondToInquiry(selectedInquiry.id, replyText.trim())
      setInquiries((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      setSelectedInquiry(updated)
      setReplyText('')
      setReplyModalOpen(false)
      setToast('Response sent to client.')
    } catch (err) {
      setToast(err?.message || 'Could not send the response. Please try again.')
    } finally {
      setReplying(false)
    }
  }

  async function handleConvertToTicket() {
    if (!selectedInquiry) return
    setConverting(true)
    try {
      const { ticketId, inquiry: updated } = await convertInquiryToTicket(selectedInquiry.id)
      setInquiries((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      setSelectedInquiry(updated)
      setDrawerOpen(false)
      setToast(`Inquiry converted to ticket ${ticketId}.`)
    } catch (err) {
      setToast(err?.message || 'Could not convert inquiry to a ticket.')
    } finally {
      setConverting(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={5} />
  if (error) return <ErrorState title={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Inquiries"
        description="Review and respond to general BioFit client questions and portal inquiries."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e8ecf1] pb-2">
        {filterTabs.map((tab) => {
          const isActive = activeTab === tab.id
          const count =
            tab.id === 'all'
              ? inquiries.length
              : inquiries.filter((i) => i.status === tab.id).length

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all',
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

      {/* Inquiries Table */}
      {filteredInquiries.length === 0 ? (
        <div className="rounded-3xl border border-[#e8ecf1] bg-white p-8">
          <EmptyState
            icon={MessageSquare}
            title="No inquiries found"
            description="There are currently no client inquiries in this filter category."
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
                  <th className="px-4 py-3.5">Subject &amp; Message Preview</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Received</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Assigned To</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ecf1]">
                {filteredInquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    onClick={() => {
                      setSelectedInquiry(inq)
                      setDrawerOpen(true)
                    }}
                    className="cursor-pointer hover:bg-[#f8faf9] transition-colors"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-[#111827] whitespace-nowrap">
                      {inq.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar name={inq.client} size="sm" />
                        <div>
                          <span className="font-semibold text-[#111827] block truncate">
                            {inq.client}
                          </span>
                          <span className="text-[11px] text-[#8b93a1] block">
                            {inq.clientId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-[280px]">
                      <span className="font-medium text-[#1f2937] block line-clamp-1">
                        {inq.subject}
                      </span>
                      <span className="text-[11px] text-[#6b7280] line-clamp-1 mt-0.5">
                        {inq.message}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[#4b5563]">
                      {inq.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#6b7280]">
                      {new Date(inq.receivedAt).toLocaleDateString([], { day: 'numeric', month: 'short' })},{' '}
                      {new Date(inq.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={inq.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={inq.assignedTo ? 'text-[#111827]' : 'text-amber-700 font-semibold'}>
                        {inq.assignedTo || 'Unassigned'}
                      </span>
                    </td>
                    <td
                      className="px-4 py-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInquiry(inq)
                            setReplyModalOpen(true)
                          }}
                          className="rounded-xl border border-[#e8ecf1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#005a40] hover:bg-[#f4f6fb] transition-colors"
                        >
                          Respond
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInquiry(inq)
                            setDrawerOpen(true)
                          }}
                          className="rounded-xl bg-[#f4f6fb] px-2.5 py-1.5 text-xs font-semibold text-[#4b5563] hover:bg-[#e8ecf1] transition-colors"
                        >
                          Open
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiry Details Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedInquiry?.id || 'Inquiry'}
        description={selectedInquiry?.category}
        width="md"
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleConvertToTicket}
              disabled={converting || selectedInquiry?.status === 'Closed'}
              className="!border-[#e8ecf1] !text-[#4b5563]"
            >
              <Ticket className="h-3.5 w-3.5 mr-1.5" />
              {converting ? 'Converting…' : 'Convert to Ticket'}
            </Button>
            <Button
              size="sm"
              onClick={() => setReplyModalOpen(true)}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Respond
            </Button>
          </div>
        }
      >
        {selectedInquiry ? (
          <div className="space-y-5 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={selectedInquiry.status} />
                <span className="text-slate-500">
                  Received: {new Date(selectedInquiry.receivedAt).toLocaleString()}
                </span>
              </div>
              <h3 className="font-display text-base font-bold text-[#111827]">
                {selectedInquiry.subject}
              </h3>
            </div>

            {/* Client card */}
            <div className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-3.5 space-y-1">
              <div className="flex items-center gap-2.5">
                <Avatar name={selectedInquiry.client} size="sm" />
                <div>
                  <span className="font-semibold text-[#111827] text-sm block">
                    {selectedInquiry.client}
                  </span>
                  <span className="text-[#6b7280]">
                    {selectedInquiry.email} · {selectedInquiry.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Inquiry Body */}
            <div className="space-y-1.5">
              <span className="font-semibold text-[#374151]">Client Message:</span>
              <div className="rounded-2xl border border-[#e8ecf1] bg-white p-4 text-xs leading-relaxed text-[#374151] whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Responses if any */}
            {selectedInquiry.responses && selectedInquiry.responses.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-[#e8ecf1]">
                <span className="font-semibold text-[#374151]">Previous Responses:</span>
                {selectedInquiry.responses.map((resp) => (
                  <div
                    key={resp.id}
                    className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-3.5 text-xs text-[#14532d] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{resp.author}</span>
                      <span className="text-[10px] text-[#166534]/80">
                        {new Date(resp.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{resp.text}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      {/* Reply Modal */}
      <Modal
        open={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        title="Respond to Client Inquiry"
        description={`Send response to ${selectedInquiry?.client}`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setReplyModalOpen(false)} disabled={replying}>
              Cancel
            </Button>
            <Button
              onClick={handleSendResponse}
              disabled={replying || !replyText.trim()}
              className="!bg-[#005a40] !text-white hover:!bg-[#004833]"
            >
              {replying ? 'Sending…' : 'Send Response'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSendResponse} className="space-y-4">
          <div className="rounded-xl border border-[#e8ecf1] bg-[#f8faf9] p-3 text-xs text-[#4b5563] space-y-1">
            <p className="font-semibold text-[#111827]">Inquiry: {selectedInquiry?.subject}</p>
            <p className="text-[11px] line-clamp-2 italic">&ldquo;{selectedInquiry?.message}&rdquo;</p>
          </div>

          <div>
            <TextArea
              id="inquiry-response-text"
              label="Your Response"
              placeholder="Provide a clear, professional response to the client's question…"
              rows={4}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      <Toast open={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  )
}
