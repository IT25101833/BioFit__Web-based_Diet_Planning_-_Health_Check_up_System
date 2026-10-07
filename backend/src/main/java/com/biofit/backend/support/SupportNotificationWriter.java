package com.biofit.backend.support;

import com.biofit.backend.domain.NotificationEntity;
import com.biofit.backend.domain.NotificationRepository;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import com.biofit.backend.user.UserStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates one notification per recipient. Shared "mark all as read" is avoided by setting userId.
 */
@Service
@RequiredArgsConstructor
public class SupportNotificationWriter {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void write(TicketEvent event) {
        switch (event.type()) {
            case TICKET_CREATED ->
                    notifyRole(
                            RoleName.CUSTOMER_EXPERIENCE_OFFICER,
                            "SUPPORT",
                            event,
                            "tickets",
                            "New support ticket " + event.ticketId(),
                            (event.clientName() == null ? "A client" : event.clientName())
                                    + " opened \""
                                    + event.subject()
                                    + "\".",
                            "/support/tickets/" + event.ticketId());
            case TICKET_ASSIGNED -> notifyAssignee(event);
            case CLIENT_REPLIED ->
                    notifyAssigneeOrQueue(
                            event,
                            "Client replied on " + event.ticketId(),
                            (event.clientName() == null ? "The client" : event.clientName())
                                    + " sent a follow-up on \""
                                    + event.subject()
                                    + "\".");
            case TICKET_REOPENED ->
                    notifyAssigneeOrQueue(
                            event,
                            "Ticket reopened " + event.ticketId(),
                            (event.clientName() == null ? "The client" : event.clientName())
                                    + " asked to keep \""
                                    + event.subject()
                                    + "\" open.");
            case TICKET_ESCALATED -> notifySpecialist(event);
            case SPECIALIST_RESPONDED ->
                    notifyAssigneeOrQueue(
                            event,
                            "Specialist responded: " + event.ticketId(),
                            (event.actorName() == null ? "A specialist" : event.actorName())
                                    + " sent guidance on \""
                                    + event.subject()
                                    + "\".");
            case SUPPORT_REPLIED ->
                    notifyClient(
                            event,
                            "Support replied to your ticket",
                            "Support replied on \"" + event.subject() + "\". Please review and respond if needed.");
            case TICKET_RESOLVED ->
                    notifyClient(
                            event,
                            "Support ticket resolved",
                            "Your ticket \""
                                    + event.subject()
                                    + "\" was marked resolved. You can reopen it if something is still outstanding.");
            case TICKET_CLOSED ->
                    notifyClient(
                            event,
                            "Support ticket closed",
                            "Your ticket \"" + event.subject() + "\" has been closed.");
            default -> {
                // Internal notes and start-work do not notify anyone.
            }
        }
    }

    private void notifyAssignee(TicketEvent event) {
        if (event.assignedOfficerUserId() != null) {
            save(
                    event.assignedOfficerUserId(),
                    "SUPPORT",
                    "tickets",
                    event,
                    "Ticket assigned: " + event.ticketId(),
                    "Ticket \"" + event.subject() + "\" was assigned to you.",
                    "/support/tickets/" + event.ticketId());
            return;
        }
        notifyRole(
                RoleName.CUSTOMER_EXPERIENCE_OFFICER,
                "SUPPORT",
                event,
                "tickets",
                "Ticket assigned: " + event.ticketId(),
                "Ticket \"" + event.subject() + "\" assigned to " + event.assignedOfficerName() + ".",
                "/support/tickets/" + event.ticketId());
    }

    private void notifyAssigneeOrQueue(TicketEvent event, String title, String body) {
        if (event.assignedOfficerUserId() != null) {
            save(
                    event.assignedOfficerUserId(),
                    "SUPPORT",
                    event.type() == TicketEventType.SPECIALIST_RESPONDED ? "escalations" : "tickets",
                    event,
                    title,
                    body,
                    "/support/tickets/" + event.ticketId());
            return;
        }
        notifyRole(
                RoleName.CUSTOMER_EXPERIENCE_OFFICER,
                "SUPPORT",
                event,
                event.type() == TicketEventType.SPECIALIST_RESPONDED ? "escalations" : "tickets",
                title,
                body,
                "/support/tickets/" + event.ticketId());
    }

    private void notifySpecialist(TicketEvent event) {
        SpecialistTarget target = SpecialistTarget.fromLabel(event.specialistRole());
        if (target == null) {
            return;
        }
        String title = "Ticket escalated: " + event.ticketId();
        String body =
                "Support escalated \""
                        + event.subject()
                        + "\" to "
                        + target.label()
                        + ". Ticket: "
                        + event.ticketId();
        notifyRole(target.role(), target.audience(), event, "escalations", title, body, target.link());
    }

    private void notifyClient(TicketEvent event, String title, String body) {
        if (event.clientUserId() == null) {
            return;
        }
        save(
                event.clientUserId(),
                "CLIENT",
                "support",
                event,
                title,
                body,
                "/client/support/" + event.ticketId());
    }

    private void notifyRole(
            RoleName role,
            String audience,
            TicketEvent event,
            String type,
            String title,
            String body,
            String link) {
        List<User> users = userRepository.findActiveByRole(role, UserStatus.ACTIVE);
        if (users.isEmpty()) {
            save(null, audience, type, event, title, body, link);
            return;
        }
        for (User user : users) {
            save(user.getId(), audience, type, event, title, body, link);
        }
    }

    private void save(
            Long userId,
            String audience,
            String type,
            TicketEvent event,
            String title,
            String body,
            String link) {
        NotificationEntity n = new NotificationEntity();
        n.setId("ntf-" + UUID.randomUUID().toString().substring(0, 8));
        n.setUserId(userId);
        n.setAudience(audience);
        n.setType(type);
        n.setEventType(event.type().name());
        n.setTicketId(event.ticketId());
        n.setTitle(title);
        n.setBody(body);
        n.setLink(link);
        n.setReadFlag(false);
        n.setCreatedAt(event.occurredAt() == null ? Instant.now() : event.occurredAt());
        notificationRepository.save(n);
    }
}
