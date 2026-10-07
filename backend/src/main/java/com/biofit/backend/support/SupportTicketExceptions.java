package com.biofit.backend.support;

import com.biofit.backend.common.ApiException;
import org.springframework.http.HttpStatus;

/** Ticket-specific errors. The global handler already turns {@link ApiException} into an API response. */
public final class SupportTicketExceptions {

    private SupportTicketExceptions() {}

    public static final class TicketNotFoundException extends ApiException {
        public TicketNotFoundException() {
            super("NOT_FOUND", "Ticket not found", HttpStatus.NOT_FOUND);
        }
    }

    public static final class InvalidTicketTransitionException extends ApiException {
        public InvalidTicketTransitionException(String from, String to) {
            super(
                    "INVALID_TRANSITION",
                    "Cannot change ticket from " + from + " to " + to + ".",
                    HttpStatus.CONFLICT);
        }
    }

    public static final class UnauthorizedTicketAccessException extends ApiException {
        public UnauthorizedTicketAccessException(String message) {
            super("FORBIDDEN", message, HttpStatus.FORBIDDEN);
        }
    }

    public static final class InvalidEscalationException extends ApiException {
        public InvalidEscalationException(String message) {
            super("INVALID_ESCALATION", message, HttpStatus.CONFLICT);
        }
    }

    public static final class ActiveEscalationExistsException extends ApiException {
        public ActiveEscalationExistsException() {
            super(
                    "ACTIVE_ESCALATION",
                    "This ticket already has an active specialist escalation.",
                    HttpStatus.CONFLICT);
        }
    }

    public static final class InvalidSpecialistResponseException extends ApiException {
        public InvalidSpecialistResponseException(String message, HttpStatus status) {
            super("INVALID_SPECIALIST_RESPONSE", message, status);
        }
    }

    public static final class TicketAlreadyClosedException extends ApiException {
        public TicketAlreadyClosedException(String message) {
            super("TICKET_CLOSED", message, HttpStatus.CONFLICT);
        }
    }

    public static final class InvalidResolutionException extends ApiException {
        public InvalidResolutionException(String message) {
            super("INVALID_RESOLUTION", message, HttpStatus.CONFLICT);
        }
    }
}
