import { useEffect, useState } from 'react'

import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../../auth/AuthContext'

import LoadingSkeleton from '../../../components/ui/LoadingSkeleton'

import ErrorState from '../../../components/ui/ErrorState'

import Toast from '../../../components/ui/Toast'

import TicketHeader from './components/TicketHeader'

import TicketLifecycle from './components/TicketLifecycle'

import EscalatedTicketState from './components/EscalatedTicketState'

import ConversationThread from './components/ConversationThread'

import ReplyComposer from './components/ReplyComposer'

import TicketInfoPanel from './components/TicketInfoPanel'

import ClientSupportContext from './components/ClientSupportContext'

import RelatedBioFitService from './components/RelatedBioFitService'

import TicketActivityTimeline from './components/TicketActivityTimeline'

import AssignTicketModal from './components/AssignTicketModal'

import EscalateTicketModal from './components/EscalateTicketModal'

import ClientSupportHistoryModal from './components/ClientSupportHistoryModal'

import {

  fetchSupportTicketById,

  assignSupportTicket,

  startTicketProgress,

  updateSupportTicketStatus,

  updateSupportTicketPriority,

  updateSupportTicketCategory,

  sendTicketReply,

  addTicketInternalNote,

  escalateSupportTicket,

  closeSupportTicket,

} from './data/supportTicketsData'



export default function SupportTicketDetails() {

  const { id } = useParams()

  const navigate = useNavigate()

  const location = useLocation()

  const { user } = useAuth()

  const officerName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    'Support'



  const [ticket, setTicket] = useState(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [toast, setToast] = useState('')



  const [assignModalOpen, setAssignModalOpen] = useState(false)

  const [escalateModalOpen, setEscalateModalOpen] = useState(false)

  const [historyModalOpen, setHistoryModalOpen] = useState(false)



  async function loadTicket() {

    setLoading(true)

    setError('')

    try {

      const data = await fetchSupportTicketById(id)

      setTicket(data)

    } catch {

      setError(`We couldn't find or load support ticket ${id}.`)

    } finally {

      setLoading(false)

    }

  }



  useEffect(() => {

    loadTicket()

  }, [id])



  useEffect(() => {

    if (location.state?.toast) {

      setToast(location.state.toast)

      navigate(location.pathname, { replace: true, state: {} })

    }

  }, [location.state, location.pathname, navigate])



  async function handleAssign(officer) {

    try {

      const updated = await assignSupportTicket(ticket.id, officer)

      setTicket(updated)

      setToast(`Ticket ${ticket.id} assigned to ${officer}.`)

    } catch {

      setToast('Could not assign ticket. Please try again.')

    }

  }



  async function handleAssignToMe() {

    if (!officerName) {

      setToast('Could not determine your officer profile. Please sign in again.')

      return

    }

    try {

      const updated = await assignSupportTicket(ticket.id, officerName)

      setTicket(updated)

      setToast(`Ticket ${ticket.id} assigned to you.`)

    } catch {

      setToast('Could not assign ticket. Please try again.')

    }

  }



  async function handleStartProgress() {

    try {

      const updated = await startTicketProgress(ticket.id)

      setTicket(updated)

      setToast(`Ticket ${ticket.id} marked as In Progress.`)

      handleScrollToReply()

    } catch {

      setToast('Could not update ticket status. Please try again.')

    }

  }



  async function handleStatusChange(status) {

    try {

      const updated = await updateSupportTicketStatus(ticket.id, status)

      setTicket(updated)

      setToast(`Status updated to ${status}.`)

    } catch {

      setToast('Could not update status. Please try again.')

    }

  }



  async function handlePriorityChange(priority) {

    try {

      const updated = await updateSupportTicketPriority(ticket.id, priority)

      setTicket(updated)

      setToast(`Priority updated to ${priority}.`)

    } catch {

      setToast('Could not update priority. Please try again.')

    }

  }



  async function handleCategoryChange(category) {

    try {

      const updated = await updateSupportTicketCategory(ticket.id, category)

      setTicket(updated)

      setToast(`Category updated to ${category}.`)

    } catch {

      setToast('Could not update category. Please try again.')

    }

  }



  async function handleSendReply(messageText) {

    try {

      const updated = await sendTicketReply(ticket.id, messageText)

      setTicket(updated)

      setToast('Response sent to client.')

    } catch (err) {

      setToast('Could not send reply. Please try again.')

      throw err

    }

  }



  async function handleAddInternalNote(noteText) {

    try {

      const updated = await addTicketInternalNote(ticket.id, noteText)

      setTicket(updated)

      setToast('Internal note recorded for staff.')

    } catch (err) {

      setToast('Could not save internal note. Please try again.')

      throw err

    }

  }



  async function handleEscalate(payload) {

    try {

      const updated = await escalateSupportTicket(ticket.id, payload)

      setTicket(updated)

      setToast(`Ticket escalated to ${payload.escalateTo}.`)

    } catch {

      setToast('Could not escalate ticket. Please try again.')

    }

  }



  async function handleCloseTicket() {

    try {

      const updated = await closeSupportTicket(ticket.id)

      setTicket(updated)

      setToast(`Ticket ${ticket.id} closed.`)

    } catch {

      setToast('Could not close ticket. Please try again.')

    }

  }



  function handleScrollToReply() {

    const el = document.getElementById('reply-composer')

    if (el) {

      el.scrollIntoView({ behavior: 'smooth' })

      const textarea = el.querySelector('textarea')

      if (textarea) textarea.focus()

    }

  }



  const relatedService = ticket?.relatedService

  const showRelatedService = relatedService && (

    relatedService.reference || relatedService.title || relatedService.name

  )



  if (loading) return <LoadingSkeleton rows={5} />

  if (error || !ticket) {

    return <ErrorState title={error || 'Ticket not found'} onRetry={loadTicket} />

  }



  return (

    <div className="space-y-6">

      <TicketHeader

        ticket={ticket}

        onAssignToMe={handleAssignToMe}

        onStartProgress={handleStartProgress}

        onOpenEscalate={() => setEscalateModalOpen(true)}

        onOpenResolve={() => navigate(`/support/tickets/${ticket.id}/resolve`)}

        onCloseTicket={handleCloseTicket}

        onScrollToReply={handleScrollToReply}

      />



      <TicketLifecycle status={ticket.status} />



      <div className="grid gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px]">

        <div className="min-w-0 space-y-6">

          {ticket.escalation ? (

            <EscalatedTicketState escalation={ticket.escalation} />

          ) : null}



          <ConversationThread messages={ticket.messages} />



          {ticket.status !== 'Closed' ? (

            <ReplyComposer

              ticketId={ticket.id}

              onSendReply={handleSendReply}

              onAddInternalNote={handleAddInternalNote}

              onDraftSaved={() => setToast('Draft preserved.')}

            />

          ) : (

            <div className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-4 text-center text-xs text-[#6b7280]">

              This ticket has concluded its support lifecycle and is closed for further client replies.

            </div>

          )}

        </div>



        <div className="space-y-6">

          <TicketInfoPanel

            ticket={ticket}

            onUpdateStatus={handleStatusChange}

            onUpdatePriority={handlePriorityChange}

            onUpdateCategory={handleCategoryChange}

            onOpenAssignModal={() => setAssignModalOpen(true)}

          />



          <ClientSupportContext

            client={ticket.client}

            onOpenHistory={() => setHistoryModalOpen(true)}

          />



          {showRelatedService ? (

            <RelatedBioFitService service={relatedService} />

          ) : null}



          <TicketActivityTimeline events={ticket.activityTimeline} />

        </div>

      </div>



      <AssignTicketModal

        open={assignModalOpen}

        onClose={() => setAssignModalOpen(false)}

        ticket={ticket}

        onAssign={handleAssign}

        officerName={officerName}

      />



      <EscalateTicketModal

        open={escalateModalOpen}

        onClose={() => setEscalateModalOpen(false)}

        ticket={ticket}

        onEscalate={handleEscalate}

      />



      <ClientSupportHistoryModal

        open={historyModalOpen}

        onClose={() => setHistoryModalOpen(false)}

        client={ticket.client}

        currentTicketId={ticket.id}

      />



      <Toast open={!!toast} message={toast} onClose={() => setToast('')} />

    </div>

  )

}

