package com.biofit.backend.support;

/**
 * Business events published when a support ticket changes. Observers react to these.
 * Database housekeeping is not an event.
 */
public enum TicketEventType {
    TICKET_CREATED,
    TICKET_ASSIGNED,
    TICKET_STARTED,
    CLIENT_REPLIED,
    SUPPORT_REPLIED,
    INTERNAL_NOTE_ADDED,
    TICKET_ESCALATED,
    SPECIALIST_RESPONDED,
    TICKET_RESOLVED,
    TICKET_CLOSED,
    TICKET_REOPENED
}
