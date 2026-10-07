package com.biofit.backend.support;

import java.time.Instant;

/**
 * Snapshot of one ticket change. Observers use this instead of querying unrelated tables.
 */
public record TicketEvent(
        TicketEventType type,
        String ticketId,
        Long clientUserId,
        String clientName,
        String subject,
        Long actorUserId,
        String actorName,
        String actorRole,
        Long assignedOfficerUserId,
        String assignedOfficerName,
        String specialistRole,
        String previousStatus,
        String newStatus,
        String summary,
        Instant occurredAt) {

    public static TicketEvent of(
            TicketEventType type,
            String ticketId,
            Long clientUserId,
            String clientName,
            String subject,
            Long actorUserId,
            String actorName,
            String actorRole,
            Long assignedOfficerUserId,
            String assignedOfficerName,
            String specialistRole,
            String previousStatus,
            String newStatus,
            String summary) {
        return new TicketEvent(
                type,
                ticketId,
                clientUserId,
                clientName,
                subject,
                actorUserId,
                actorName,
                actorRole,
                assignedOfficerUserId,
                assignedOfficerName,
                specialistRole,
                previousStatus,
                newStatus,
                summary,
                Instant.now());
    }
}
