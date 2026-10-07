package com.biofit.backend.support;

import com.biofit.backend.domain.DomainMapper;
import com.biofit.backend.domain.SupportTicketEntity;
import com.biofit.backend.domain.SupportTicketRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Writes one activity entry for each ticket event.
 * It does not send notifications. That is {@link NotificationObserver}'s job.
 * Runs in the ticket transaction by updating the managed entity. A failure is caught by the subject.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditObserver implements TicketObserver {

    private final SupportTicketRepository supportTicketRepository;
    private final DomainMapper mapper;

    @Override
    public void update(TicketEvent event) {
        supportTicketRepository
                .findById(event.ticketId())
                .ifPresent(ticket -> append(ticket, event));
    }

    @SuppressWarnings("unchecked")
    private void append(SupportTicketEntity ticket, TicketEvent event) {
        List<Object> activity =
                new ArrayList<>((List<Object>) mapper.parseJson(ticket.getActivityJson(), new ArrayList<>()));
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("id", "act-" + (activity.size() + 1));
        entry.put("action", event.type().name());
        entry.put("text", describe(event));
        entry.put("actor", event.actorName());
        entry.put("actorRole", event.actorRole());
        entry.put("fromStatus", event.previousStatus());
        entry.put("toStatus", event.newStatus());
        entry.put("at", Instant.now().toString());
        entry.put("staffOnly", staffOnly(event.type()));
        activity.add(entry);
        ticket.setActivityJson(mapper.toJson(activity));
        supportTicketRepository.save(ticket);
    }

    private static boolean staffOnly(TicketEventType type) {
        return switch (type) {
            case TICKET_ASSIGNED, TICKET_STARTED, INTERNAL_NOTE_ADDED, TICKET_ESCALATED, SPECIALIST_RESPONDED ->
                    true;
            default -> false;
        };
    }

    private static String describe(TicketEvent event) {
        String actor = event.actorName() == null || event.actorName().isBlank() ? "Support" : event.actorName();
        return switch (event.type()) {
            case TICKET_CREATED -> "Ticket created by " + actor;
            case TICKET_ASSIGNED -> "Assigned to " + event.assignedOfficerName();
            case TICKET_STARTED -> actor + " started work";
            case CLIENT_REPLIED -> "Client replied";
            case SUPPORT_REPLIED -> actor + " replied to the client";
            case INTERNAL_NOTE_ADDED -> actor + " added an internal note";
            case TICKET_ESCALATED -> "Escalated to " + event.specialistRole();
            case SPECIALIST_RESPONDED -> actor + " submitted specialist guidance";
            case TICKET_RESOLVED -> "Ticket resolved";
            case TICKET_CLOSED -> "Ticket closed";
            case TICKET_REOPENED -> "Client reopened the ticket";
        };
    }
}
