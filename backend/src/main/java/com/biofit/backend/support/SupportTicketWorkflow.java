package com.biofit.backend.support;

import com.biofit.backend.common.ApiException;
import com.biofit.backend.domain.DomainMapper;
import com.biofit.backend.domain.SupportTicketEntity;
import com.biofit.backend.domain.SupportTicketRepository;
import com.biofit.backend.support.SupportTicketExceptions.ActiveEscalationExistsException;
import com.biofit.backend.support.SupportTicketExceptions.InvalidEscalationException;
import com.biofit.backend.support.SupportTicketExceptions.InvalidTicketTransitionException;
import com.biofit.backend.support.SupportTicketExceptions.InvalidResolutionException;
import com.biofit.backend.support.SupportTicketExceptions.InvalidSpecialistResponseException;
import com.biofit.backend.support.SupportTicketExceptions.TicketAlreadyClosedException;
import com.biofit.backend.support.SupportTicketExceptions.TicketNotFoundException;
import com.biofit.backend.support.SupportTicketExceptions.UnauthorizedTicketAccessException;
import com.biofit.backend.support.TicketStateMachine.Cause;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import com.biofit.backend.user.UserStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Support ticket lifecycle. After each saved change it publishes one {@link TicketEvent}.
 * Notifications and audit records are produced by observers, not by direct calls here.
 */
@Service
@RequiredArgsConstructor
public class SupportTicketWorkflow {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;
    private final DomainMapper mapper;
    private final TicketSubject ticketSubject;
    private final SupportTicketPresenter presenter;

    @Transactional
    public Map<String, Object> createFromClient(Long userId, Map<String, Object> payload) {
        User user = userRepository.findById(userId).orElseThrow(TicketNotFoundException::new);
        String subject = requiredText(payload.get("subject"), "Subject is required.");
        String description =
                firstNonBlank(str(payload.get("description")), str(payload.get("message")), str(payload.get("body")));
        if (description == null) {
            throw new ApiException("VALIDATION_ERROR", "Please describe the issue.", HttpStatus.BAD_REQUEST);
        }
        SupportTicketEntity ticket = new SupportTicketEntity();
        ticket.setId("tkt-" + UUID.randomUUID().toString().substring(0, 8));
        ticket.setClientUserId(userId);
        ticket.setClientId("BF-C" + userId);
        ticket.setClientName(user.getFullName());
        ticket.setSubject(subject);
        ticket.setCategory(blankTo(str(payload.get("category")), "General"));
        ticket.setPriority(TicketPriority.parse(blankTo(str(payload.get("priority")), "Medium")).label());
        ticket.setStatus(TicketStatus.OPEN.label());
        ticket.setAssignedTo(null);
        alignWaiting(ticket);
        ticket.setRelatedService(blankTo(str(payload.get("relatedService")), "General"));
        ticket.setActivityJson("[]");
        ticket.setMessagesJson(
                mapper.toJson(
                        List.of(
                                clientMessage(
                                        "msg-1",
                                        "You",
                                        description,
                                        str(payload.get("attachmentName"))))));
        ticket.setCreatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        publish(
                event(
                        TicketEventType.TICKET_CREATED,
                        ticket,
                        user.getId(),
                        user.getFullName(),
                        roleOf(user),
                        null,
                        null,
                        TicketStatus.OPEN.label(),
                        "Ticket created"));
        return presenter.present(ticket, TicketAudience.CLIENT);
    }

    @Transactional
    public Map<String, Object> adoptConvertedTicket(SupportTicketEntity ticket) {
        if (ticket.getStatus() == null) {
            ticket.setStatus(TicketStatus.OPEN.label());
        }
        if (ticket.getPriority() == null) {
            ticket.setPriority(TicketPriority.MEDIUM.label());
        }
        alignWaiting(ticket);
        if (ticket.getActivityJson() == null) {
            ticket.setActivityJson("[]");
        }
        ticket.setCreatedAt(ticket.getCreatedAt() == null ? Instant.now() : ticket.getCreatedAt());
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        publish(
                event(
                        TicketEventType.TICKET_CREATED,
                        ticket,
                        ticket.getClientUserId(),
                        ticket.getClientName(),
                        "CLIENT",
                        null,
                        null,
                        ticket.getStatus(),
                        "Inquiry converted to a ticket"));
        return presenter.present(ticket, TicketAudience.SUPPORT);
    }

    @Transactional
    public Map<String, Object> replyAsClient(Long userId, String ticketId, Map<String, Object> payload) {
        SupportTicketEntity ticket = ownedTicket(userId, ticketId);
        TicketStatus from = TicketStatus.parse(ticket.getStatus());
        if (from == TicketStatus.CLOSED) {
            throw new TicketAlreadyClosedException("Closed tickets cannot accept replies. Please open a new ticket.");
        }
        String body = requiredText(firstNonBlank(str(payload.get("message")), str(payload.get("body"))), "Reply cannot be empty.");
        addMessage(ticket, clientMessage(nextMessageId(ticket), ticket.getClientName(), body, null));
        TicketEventType type = TicketEventType.CLIENT_REPLIED;
        Cause cause = Cause.CLIENT_REPLY;
        if (from == TicketStatus.RESOLVED) {
            type = TicketEventType.TICKET_REOPENED;
            cause = Cause.CLIENT_REPLY;
            ticket.setResolutionJson(null);
        }
        // An active escalation stays with the specialist. The client may add information,
        // but that does not reopen, resolve, or move waitingOn away from Specialist.
        if (from == TicketStatus.ESCALATED) {
            alignWaiting(ticket);
        } else if (from == TicketStatus.PENDING_CLIENT_REPLY
                || from == TicketStatus.RESOLVED
                || from == TicketStatus.OPEN
                || from == TicketStatus.ASSIGNED) {
            move(ticket, from, TicketStatus.IN_PROGRESS, cause);
        } else {
            alignWaiting(ticket);
        }
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        publish(
                event(
                        type,
                        ticket,
                        userId,
                        ticket.getClientName(),
                        "CLIENT",
                        null,
                        from.label(),
                        ticket.getStatus(),
                        "Client reply"));
        return presenter.present(ticket, TicketAudience.CLIENT);
    }

    @Transactional
    public Map<String, Object> reopenAsClient(Long userId, String ticketId, Map<String, Object> payload) {
        SupportTicketEntity ticket = ownedTicket(userId, ticketId);
        TicketStatus from = TicketStatus.parse(ticket.getStatus());
        if (from == TicketStatus.CLOSED) {
            throw new TicketAlreadyClosedException("Closed tickets cannot be reopened. Please open a new ticket.");
        }
        if (from != TicketStatus.RESOLVED) {
            throw new InvalidResolutionException("Only a resolved ticket can be reopened.");
        }
        String note = firstNonBlank(str(payload.get("message")), str(payload.get("body")), str(payload.get("reason")));
        if (note != null) {
            addMessage(ticket, clientMessage(nextMessageId(ticket), ticket.getClientName(), note, null));
        }
        move(ticket, from, TicketStatus.IN_PROGRESS, Cause.CLIENT_REOPEN);
        ticket.setResolutionJson(null);
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        publish(
                event(
                        TicketEventType.TICKET_REOPENED,
                        ticket,
                        userId,
                        ticket.getClientName(),
                        "CLIENT",
                        null,
                        from.label(),
                        ticket.getStatus(),
                        "Client reopened the ticket"));
        return presenter.present(ticket, TicketAudience.CLIENT);
    }

    @Transactional
    public Map<String, Object> applySupportPatch(String ticketId, Long actorUserId, Map<String, Object> body) {
        SupportTicketEntity ticket = requiredTicket(ticketId);
        User actor = actorUserId == null ? null : userRepository.findById(actorUserId).orElse(null);
        String actorName = actor == null ? blankTo(str(body.get("author")), "Support") : actor.getFullName();
        String actorRole = actor == null ? "CUSTOMER_EXPERIENCE_OFFICER" : roleOf(actor);
        TicketStatus from = TicketStatus.parse(ticket.getStatus());
        if (from == TicketStatus.CLOSED) {
            throw new TicketAlreadyClosedException("Closed tickets cannot be changed.");
        }

        if (body.get("escalation") != null) {
            return escalate(ticket, from, actor, actorName, actorRole, body);
        }
        if (body.get("resolution") != null || "Resolved".equalsIgnoreCase(str(body.get("status")))) {
            return resolve(ticket, from, actor, actorName, actorRole, body);
        }
        if ("Closed".equalsIgnoreCase(str(body.get("status")))) {
            return close(ticket, from, actor, actorName, actorRole);
        }
        if (Boolean.TRUE.equals(body.get("internal"))) {
            return addInternalNote(ticket, from, actor, actorName, actorRole, body);
        }
        if (body.get("message") != null || body.get("body") != null || body.get("note") != null) {
            return supportReply(ticket, from, actor, actorName, actorRole, body);
        }
        if (body.get("assignedTo") != null) {
            return assign(ticket, from, actor, actorName, actorRole, str(body.get("assignedTo")));
        }
        if (body.get("status") != null) {
            return changeStatus(ticket, from, actor, actorName, actorRole, str(body.get("status")));
        }
        if (body.get("priority") != null || body.get("category") != null) {
            return updateMetadata(ticket, from, actor, actorName, actorRole, body);
        }
        throw new ApiException("VALIDATION_ERROR", "Nothing to update on this ticket.", HttpStatus.BAD_REQUEST);
    }

    @Transactional
    public Map<String, Object> specialistRespond(
            String ticketId, Long actorUserId, String expectedDestination, Map<String, Object> body) {
        SupportTicketEntity ticket = requiredTicket(ticketId);
        User actor = userRepository.findById(actorUserId).orElseThrow(TicketNotFoundException::new);
        SpecialistTarget expected = SpecialistTarget.fromLabel(expectedDestination);
        if (expected == null) {
            throw new InvalidSpecialistResponseException("Unknown specialist queue.", HttpStatus.BAD_REQUEST);
        }
        boolean allowed =
                hasRole(actor, expected.role()) || hasRole(actor, RoleName.ADMIN);
        if (!allowed) {
            throw new UnauthorizedTicketAccessException("You cannot respond to this specialist queue.");
        }
        Map<String, Object> escalation = escalationMap(ticket);
        if (escalation.isEmpty()) {
            throw new InvalidSpecialistResponseException(
                    "This ticket does not have an active escalation.", HttpStatus.CONFLICT);
        }
        String escalatedTo = str(escalation.get("escalatedTo"));
        if (!expected.matches(escalatedTo)) {
            throw new InvalidSpecialistResponseException(
                    "This escalation is for " + escalatedTo + ", not " + expected.label() + ".",
                    HttpStatus.FORBIDDEN);
        }
        String escalationStatus = str(escalation.get("status"));
        if ("Responded".equalsIgnoreCase(escalationStatus)) {
            throw new InvalidSpecialistResponseException(
                    "This escalation has already been answered.", HttpStatus.CONFLICT);
        }
        String response = requiredText(firstNonBlank(str(body.get("message")), str(body.get("body"))), "Specialist response cannot be empty.");
        TicketStatus from = TicketStatus.parse(ticket.getStatus());
        if (from != TicketStatus.ESCALATED) {
            throw new InvalidSpecialistResponseException(
                    "Specialist guidance can only be added while the ticket is escalated.", HttpStatus.CONFLICT);
        }
        escalation.put("specialistResponse", response);
        escalation.put("status", "Responded");
        escalation.put("respondedAt", Instant.now().toString());
        escalation.put("respondedBy", actor.getFullName());
        ticket.setEscalationJson(mapper.toJson(escalation));
        addMessage(
                ticket,
                message(
                        nextMessageId(ticket),
                        "specialist",
                        MessageVisibility.SPECIALIST_INTERNAL,
                        actor.getFullName(),
                        response,
                        null));
        move(ticket, from, TicketStatus.IN_PROGRESS, Cause.SPECIALIST_RESPONSE);
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        publish(
                event(
                        TicketEventType.SPECIALIST_RESPONDED,
                        ticket,
                        actor.getId(),
                        actor.getFullName(),
                        expected.role().name(),
                        expected.label(),
                        from.label(),
                        ticket.getStatus(),
                        "Specialist guidance submitted"));
        return presenter.present(ticket, TicketAudience.SPECIALIST);
    }

    public List<Map<String, Object>> queueFor(String destination) {
        SpecialistTarget target = SpecialistTarget.fromLabel(destination);
        return supportTicketRepository.findAll().stream()
                .filter(ticket -> belongsToQueue(ticket, target == null ? destination : target.label()))
                .map(ticket -> presenter.present(ticket, TicketAudience.SPECIALIST))
                .toList();
    }

    private Map<String, Object> escalate(
            SupportTicketEntity ticket,
            TicketStatus from,
            User actor,
            String actorName,
            String actorRole,
            Map<String, Object> body) {
        if (from == TicketStatus.OPEN || from == TicketStatus.RESOLVED || from == TicketStatus.ESCALATED) {
            throw new InvalidEscalationException(
                    "Start the ticket before escalating, and do not escalate a resolved or already escalated ticket.");
        }
        if (hasActiveEscalation(ticket)) {
            throw new ActiveEscalationExistsException();
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> incoming =
                body.get("escalation") instanceof Map<?, ?> map
                        ? new LinkedHashMap<>((Map<String, Object>) map)
                        : new LinkedHashMap<>();
        String destination = str(incoming.getOrDefault("escalatedTo", incoming.get("destination")));
        SpecialistTarget target = SpecialistTarget.fromLabel(destination);
        if (target == null) {
            throw new InvalidEscalationException("Choose a valid specialist: medical, nutrition, fitness, or manager.");
        }
        String reason = str(incoming.get("reason"));
        if (reason == null || reason.isBlank()) {
            throw new InvalidEscalationException("An escalation reason is required.");
        }
        Map<String, Object> escalation = new LinkedHashMap<>();
        escalation.put("escalatedTo", target.label());
        escalation.put("reason", reason.trim());
        escalation.put("additionalContext", str(incoming.get("additionalContext")));
        escalation.put("escalatedBy", actorName);
        escalation.put("escalatedAt", Instant.now().toString());
        escalation.put("status", "Under Review");
        escalation.put("specialistResponse", null);
        ticket.setEscalationJson(mapper.toJson(escalation));
        move(ticket, from, TicketStatus.ESCALATED, Cause.WORKFLOW);
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        publish(
                event(
                        TicketEventType.TICKET_ESCALATED,
                        ticket,
                        actor == null ? null : actor.getId(),
                        actorName,
                        actorRole,
                        target.label(),
                        from.label(),
                        ticket.getStatus(),
                        reason.trim()));
        return presenter.present(ticket, TicketAudience.SUPPORT);
    }

    private Map<String, Object> resolve(
            SupportTicketEntity ticket,
            TicketStatus from,
            User actor,
            String actorName,
            String actorRole,
            Map<String, Object> body) {
        if (hasActiveEscalation(ticket) || from == TicketStatus.ESCALATED) {
            throw new InvalidResolutionException(
                    "Resolve the specialist escalation before closing the case with the client.");
        }
        if (from != TicketStatus.IN_PROGRESS
                && from != TicketStatus.PENDING_CLIENT_REPLY
                && from != TicketStatus.ASSIGNED) {
            throw new InvalidResolutionException("This ticket cannot be resolved from " + from.label() + ".");
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> incoming =
                body.get("resolution") instanceof Map<?, ?> map
                        ? new LinkedHashMap<>((Map<String, Object>) map)
                        : new LinkedHashMap<>();
        String summary = firstNonBlank(str(incoming.get("summary")), str(body.get("summary")));
        if (summary == null) {
            throw new InvalidResolutionException("A resolution summary is required.");
        }
        Map<String, Object> resolution = new LinkedHashMap<>();
        resolution.put("summary", summary);
        resolution.put("category", blankTo(str(incoming.get("category")), "General Resolution"));
        resolution.put("resolvedBy", actorName);
        resolution.put("resolvedAt", Instant.now().toString());
        ticket.setResolutionJson(mapper.toJson(resolution));
        move(ticket, from, TicketStatus.RESOLVED, Cause.WORKFLOW);
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        publish(
                event(
                        TicketEventType.TICKET_RESOLVED,
                        ticket,
                        actor == null ? null : actor.getId(),
                        actorName,
                        actorRole,
                        null,
                        from.label(),
                        ticket.getStatus(),
                        summary));
        return presenter.present(ticket, TicketAudience.SUPPORT);
    }

    private Map<String, Object> close(
            SupportTicketEntity ticket, TicketStatus from, User actor, String actorName, String actorRole) {
        if (from != TicketStatus.RESOLVED) {
            throw new InvalidTicketTransitionException(from.label(), TicketStatus.CLOSED.label());
        }
        move(ticket, from, TicketStatus.CLOSED, Cause.WORKFLOW);
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        publish(
                event(
                        TicketEventType.TICKET_CLOSED,
                        ticket,
                        actor == null ? null : actor.getId(),
                        actorName,
                        actorRole,
                        null,
                        from.label(),
                        ticket.getStatus(),
                        "Ticket closed"));
        return presenter.present(ticket, TicketAudience.SUPPORT);
    }

    private Map<String, Object> addInternalNote(
            SupportTicketEntity ticket,
            TicketStatus from,
            User actor,
            String actorName,
            String actorRole,
            Map<String, Object> body) {
        String note =
                requiredText(
                        firstNonBlank(str(body.get("note")), str(body.get("message")), str(body.get("body"))),
                        "Internal note cannot be empty.");
        addMessage(
                ticket,
                message(nextMessageId(ticket), "internal_note", MessageVisibility.INTERNAL_NOTE, actorName, note, null));
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        publish(
                event(
                        TicketEventType.INTERNAL_NOTE_ADDED,
                        ticket,
                        actor == null ? null : actor.getId(),
                        actorName,
                        actorRole,
                        null,
                        from.label(),
                        ticket.getStatus(),
                        "Internal note added"));
        return presenter.present(ticket, TicketAudience.SUPPORT);
    }

    private Map<String, Object> supportReply(
            SupportTicketEntity ticket,
            TicketStatus from,
            User actor,
            String actorName,
            String actorRole,
            Map<String, Object> body) {
        if (from == TicketStatus.ESCALATED || from == TicketStatus.RESOLVED) {
            throw new InvalidTicketTransitionException(from.label(), TicketStatus.PENDING_CLIENT_REPLY.label());
        }
        String text =
                requiredText(
                        firstNonBlank(str(body.get("message")), str(body.get("body"))),
                        "Reply cannot be empty.");
        addMessage(
                ticket,
                message(nextMessageId(ticket), "support", MessageVisibility.SUPPORT, actorName, text, null));
        if (from != TicketStatus.PENDING_CLIENT_REPLY) {
            move(ticket, from, TicketStatus.PENDING_CLIENT_REPLY, Cause.WORKFLOW);
        } else {
            alignWaiting(ticket);
        }
        ticket.setResolutionJson(null);
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        publish(
                event(
                        TicketEventType.SUPPORT_REPLIED,
                        ticket,
                        actor == null ? null : actor.getId(),
                        actorName,
                        actorRole,
                        null,
                        from.label(),
                        ticket.getStatus(),
                        "Support reply"));
        return presenter.present(ticket, TicketAudience.SUPPORT);
    }

    private Map<String, Object> assign(
            SupportTicketEntity ticket,
            TicketStatus from,
            User actor,
            String actorName,
            String actorRole,
            String assignee) {
        User officer = requireActiveOfficer(assignee);
        String name = officer.getFullName();
        ticket.setAssignedTo(name);
        if (from == TicketStatus.OPEN) {
            move(ticket, from, TicketStatus.ASSIGNED, Cause.WORKFLOW);
        } else {
            alignWaiting(ticket);
        }
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        publish(
                assignedEvent(
                        ticket, actor, actorName, actorRole, officer.getId(), name, from.label(), ticket.getStatus()));
        return presenter.present(ticket, TicketAudience.SUPPORT);
    }

    private Map<String, Object> changeStatus(
            SupportTicketEntity ticket,
            TicketStatus from,
            User actor,
            String actorName,
            String actorRole,
            String requested) {
        TicketStatus to = TicketStatus.parse(requested);
        if (to == TicketStatus.ESCALATED || to == TicketStatus.RESOLVED || to == TicketStatus.CLOSED) {
            throw new InvalidTicketTransitionException(from.label(), to.label());
        }
        if (to == TicketStatus.IN_PROGRESS && (from == TicketStatus.OPEN || from == TicketStatus.ASSIGNED)) {
            move(ticket, from, to, Cause.WORKFLOW);
            ticket.setUpdatedAt(Instant.now());
            supportTicketRepository.save(ticket);
            publish(
                    event(
                            TicketEventType.TICKET_STARTED,
                            ticket,
                            actor == null ? null : actor.getId(),
                            actorName,
                            actorRole,
                            null,
                            from.label(),
                            ticket.getStatus(),
                            "Work started"));
            return presenter.present(ticket, TicketAudience.SUPPORT);
        }
        move(ticket, from, to, Cause.WORKFLOW);
        if (to == TicketStatus.OPEN && from == TicketStatus.ASSIGNED) {
            ticket.setAssignedTo(null);
        }
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        return presenter.present(ticket, TicketAudience.SUPPORT);
    }

    private Map<String, Object> updateMetadata(
            SupportTicketEntity ticket,
            TicketStatus from,
            User actor,
            String actorName,
            String actorRole,
            Map<String, Object> body) {
        List<String> changes = new ArrayList<>();
        if (body.get("priority") != null) {
            String next = TicketPriority.parse(str(body.get("priority"))).label();
            if (!next.equals(ticket.getPriority())) {
                changes.add("Priority " + ticket.getPriority() + " → " + next);
                ticket.setPriority(next);
            }
        }
        if (body.get("category") != null) {
            String category = str(body.get("category"));
            if (category == null || category.isBlank()) {
                throw new ApiException("VALIDATION_ERROR", "Category cannot be empty.", HttpStatus.BAD_REQUEST);
            }
            category = category.trim();
            if (!category.equals(ticket.getCategory())) {
                changes.add("Category " + blankTo(ticket.getCategory(), "none") + " → " + category);
                ticket.setCategory(category);
            }
        }
        if (changes.isEmpty()) {
            return presenter.present(ticket, TicketAudience.SUPPORT);
        }
        ticket.setUpdatedAt(Instant.now());
        supportTicketRepository.save(ticket);
        publish(
                event(
                        TicketEventType.TICKET_METADATA_UPDATED,
                        ticket,
                        actor == null ? null : actor.getId(),
                        actorName,
                        actorRole,
                        null,
                        from.label(),
                        ticket.getStatus(),
                        String.join(". ", changes)));
        return presenter.present(ticket, TicketAudience.SUPPORT);
    }

    private void move(SupportTicketEntity ticket, TicketStatus from, TicketStatus to, Cause cause) {
        TicketStateMachine.assertTransition(from, to, cause);
        ticket.setStatus(to.label());
        alignWaiting(ticket);
    }

    /**
     * Waiting party is derived from status so every transition uses the same rule.
     * Closed keeps the party it already had. waitingSince moves only when the party changes.
     */
    private void alignWaiting(SupportTicketEntity ticket) {
        TicketStatus status = TicketStatus.parse(ticket.getStatus());
        if (status == TicketStatus.CLOSED) {
            return;
        }
        setWaiting(ticket, waitingParty(status));
    }

    private static String waitingParty(TicketStatus status) {
        return switch (status) {
            case OPEN, ASSIGNED, IN_PROGRESS -> "Support";
            case PENDING_CLIENT_REPLY, RESOLVED -> "Client";
            case ESCALATED -> "Specialist";
            case CLOSED -> null;
        };
    }

    private void setWaiting(SupportTicketEntity ticket, String party) {
        if (party == null) {
            return;
        }
        if (ticket.getWaitingOn() == null || !ticket.getWaitingOn().equalsIgnoreCase(party)) {
            ticket.setWaitingOn(party);
            ticket.setWaitingSince(Instant.now());
        } else if (ticket.getWaitingSince() == null) {
            ticket.setWaitingSince(Instant.now());
        }
    }

    private void publish(TicketEvent event) {
        ticketSubject.notifyObservers(event);
    }

    private TicketEvent event(
            TicketEventType type,
            SupportTicketEntity ticket,
            Long actorUserId,
            String actorName,
            String actorRole,
            String specialistRole,
            String previousStatus,
            String newStatus,
            String summary) {
        return TicketEvent.of(
                type,
                ticket.getId(),
                ticket.getClientUserId(),
                ticket.getClientName(),
                ticket.getSubject(),
                actorUserId,
                actorName,
                actorRole,
                findOfficerId(ticket.getAssignedTo()),
                ticket.getAssignedTo(),
                specialistRole,
                previousStatus,
                newStatus,
                summary);
    }

    private TicketEvent assignedEvent(
            SupportTicketEntity ticket,
            User actor,
            String actorName,
            String actorRole,
            Long officerId,
            String officerName,
            String previousStatus,
            String newStatus) {
        return TicketEvent.of(
                TicketEventType.TICKET_ASSIGNED,
                ticket.getId(),
                ticket.getClientUserId(),
                ticket.getClientName(),
                ticket.getSubject(),
                actor == null ? null : actor.getId(),
                actorName,
                actorRole,
                officerId,
                officerName,
                null,
                previousStatus,
                newStatus,
                "Assigned to " + officerName);
    }

    private boolean belongsToQueue(SupportTicketEntity ticket, String destinationLabel) {
        TicketStatus status = safeStatus(ticket.getStatus());
        if (status == TicketStatus.CLOSED || status == TicketStatus.RESOLVED || status == null) {
            return false;
        }
        Map<String, Object> escalation = escalationMap(ticket);
        String escalatedTo = str(escalation.get("escalatedTo"));
        String escalationStatus = str(escalation.get("status"));
        return escalatedTo != null
                && escalatedTo.equalsIgnoreCase(destinationLabel)
                && "Under Review".equalsIgnoreCase(escalationStatus);
    }

    private boolean hasActiveEscalation(SupportTicketEntity ticket) {
        if (safeStatus(ticket.getStatus()) == TicketStatus.ESCALATED) {
            return true;
        }
        String status = str(escalationMap(ticket).get("status"));
        return status != null && "Under Review".equalsIgnoreCase(status);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> escalationMap(SupportTicketEntity ticket) {
        Object parsed = mapper.parseJson(ticket.getEscalationJson(), new LinkedHashMap<>());
        if (parsed instanceof Map<?, ?> map) {
            return new LinkedHashMap<>((Map<String, Object>) map);
        }
        return new LinkedHashMap<>();
    }

    @SuppressWarnings("unchecked")
    private void addMessage(SupportTicketEntity ticket, Map<String, Object> message) {
        List<Object> messages =
                new ArrayList<>((List<Object>) mapper.parseJson(ticket.getMessagesJson(), new ArrayList<>()));
        messages.add(message);
        ticket.setMessagesJson(mapper.toJson(messages));
    }

    @SuppressWarnings("unchecked")
    private String nextMessageId(SupportTicketEntity ticket) {
        List<Object> messages =
                new ArrayList<>((List<Object>) mapper.parseJson(ticket.getMessagesJson(), new ArrayList<>()));
        return "msg-" + (messages.size() + 1);
    }

    private Map<String, Object> clientMessage(String id, String author, String body, String attachmentName) {
        return message(id, "client", MessageVisibility.CLIENT, author == null ? "You" : author, body, attachmentName);
    }

    private Map<String, Object> message(
            String id,
            String role,
            MessageVisibility visibility,
            String author,
            String body,
            String attachmentName) {
        Map<String, Object> message = new LinkedHashMap<>();
        message.put("id", id);
        message.put("from", role);
        message.put("role", role);
        message.put("visibility", visibility.name());
        message.put("author", author);
        message.put("body", body);
        message.put("at", Instant.now().toString());
        if (attachmentName != null && !attachmentName.isBlank()) {
            message.put("attachments", List.of(Map.of("name", attachmentName.trim())));
        } else {
            message.put("attachments", List.of());
        }
        return message;
    }

    private SupportTicketEntity requiredTicket(String ticketId) {
        if (ticketId == null || ticketId.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Ticket id is required.", HttpStatus.BAD_REQUEST);
        }
        return supportTicketRepository.findById(ticketId.trim()).orElseThrow(TicketNotFoundException::new);
    }

    private SupportTicketEntity ownedTicket(Long userId, String ticketId) {
        if (userId == null) {
            throw new UnauthorizedTicketAccessException("Sign in to view this ticket.");
        }
        return supportTicketRepository
                .findByIdAndClientUserId(ticketId, userId)
                .orElseThrow(TicketNotFoundException::new);
    }

    private User requireActiveOfficer(String assignee) {
        if (assignee == null || assignee.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Choose an officer to assign.", HttpStatus.BAD_REQUEST);
        }
        String name = assignee.trim();
        return userRepository.findActiveByRole(RoleName.CUSTOMER_EXPERIENCE_OFFICER, UserStatus.ACTIVE).stream()
                .filter(
                        user ->
                                user.getFullName().equalsIgnoreCase(name)
                                        || user.getEmail().equalsIgnoreCase(name))
                .findFirst()
                .orElseThrow(
                        () ->
                                new ApiException(
                                        "ASSIGNEE_NOT_FOUND",
                                        "No active Customer Experience Officer matches \"" + name + "\".",
                                        HttpStatus.BAD_REQUEST));
    }

    private Long findOfficerId(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        return userRepository.findActiveByRole(RoleName.CUSTOMER_EXPERIENCE_OFFICER, UserStatus.ACTIVE).stream()
                .filter(user -> user.getFullName().equalsIgnoreCase(name.trim()))
                .map(User::getId)
                .findFirst()
                .orElse(null);
    }

    private static boolean hasRole(User user, RoleName role) {
        return user.getRoles() != null && user.getRoles().stream().anyMatch(item -> item.getName() == role);
    }

    private static String roleOf(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return "";
        }
        return user.getRoles().iterator().next().getName().name();
    }

    private static TicketStatus safeStatus(String raw) {
        try {
            return TicketStatus.parse(raw);
        } catch (ApiException ex) {
            return null;
        }
    }

    private static String requiredText(Object value, String message) {
        String text = str(value);
        if (text == null || text.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", message, HttpStatus.BAD_REQUEST);
        }
        return text.trim();
    }

    private static String str(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }
}
