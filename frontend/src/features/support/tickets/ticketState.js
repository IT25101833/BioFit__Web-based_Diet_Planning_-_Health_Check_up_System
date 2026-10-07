export function allowedStatusTargets(status) {
  switch (status) {
    case 'Open':
      return ['Assigned', 'In Progress']
    case 'Assigned':
      return ['Open', 'In Progress']
    case 'In Progress':
      return ['Pending Client Reply']
    case 'Pending Client Reply':
      return ['In Progress']
    default:
      return []
  }
}

export function ticketCapabilities(ticket) {
  const status = ticket?.status
  const escalation = ticket?.escalation
  const guidanceReceived =
    escalation?.status === 'Responded' || Boolean(escalation?.specialistResponse)
  return {
    closed: status === 'Closed',
    resolved: status === 'Resolved',
    escalated: status === 'Escalated',
    guidanceReceived,
    canReply: status !== 'Closed' && status !== 'Resolved' && status !== 'Escalated',
    canEscalate:
      status === 'Assigned' || status === 'In Progress' || status === 'Pending Client Reply',
    canResolve:
      status === 'Assigned' || status === 'In Progress' || status === 'Pending Client Reply',
    canClose: status === 'Resolved',
    canStart: status === 'Open' || status === 'Assigned',
    canAssign: status !== 'Closed' && status !== 'Resolved',
    canEditPriority: status !== 'Closed',
    canEditCategory: status !== 'Closed',
    statusTargets: allowedStatusTargets(status),
  }
}
