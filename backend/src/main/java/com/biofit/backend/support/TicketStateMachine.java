package com.biofit.backend.support;

import com.biofit.backend.support.SupportTicketExceptions.InvalidTicketTransitionException;

/**
 * Explicit ticket transitions. Callers cannot assign an arbitrary status string.
 *
 * <pre>
 * OPEN → ASSIGNED → IN_PROGRESS → PENDING_CLIENT_REPLY → IN_PROGRESS → RESOLVED → CLOSED
 * IN_PROGRESS → ESCALATED → IN_PROGRESS (specialist response only)
 * RESOLVED → IN_PROGRESS (client reopen or client reply only)
 * </pre>
 */
public final class TicketStateMachine {

    public enum Cause {
        WORKFLOW,
        SPECIALIST_RESPONSE,
        CLIENT_REOPEN,
        CLIENT_REPLY
    }

    private TicketStateMachine() {}

    public static void assertTransition(TicketStatus from, TicketStatus to, Cause cause) {
        if (from == to) {
            return;
        }
        if (!allowed(from, to, cause)) {
            throw new InvalidTicketTransitionException(from.label(), to.label());
        }
    }

    private static boolean allowed(TicketStatus from, TicketStatus to, Cause cause) {
        return switch (from) {
            case OPEN ->
                    to == TicketStatus.ASSIGNED
                            || to == TicketStatus.IN_PROGRESS
                            || to == TicketStatus.PENDING_CLIENT_REPLY;
            case ASSIGNED ->
                    to == TicketStatus.OPEN
                            || to == TicketStatus.IN_PROGRESS
                            || to == TicketStatus.PENDING_CLIENT_REPLY
                            || to == TicketStatus.ESCALATED
                            || to == TicketStatus.RESOLVED;
            case IN_PROGRESS ->
                    to == TicketStatus.PENDING_CLIENT_REPLY
                            || to == TicketStatus.ESCALATED
                            || to == TicketStatus.RESOLVED
                            || to == TicketStatus.ASSIGNED;
            case PENDING_CLIENT_REPLY ->
                    to == TicketStatus.IN_PROGRESS
                            || to == TicketStatus.ESCALATED
                            || to == TicketStatus.RESOLVED;
            case ESCALATED -> to == TicketStatus.IN_PROGRESS && cause == Cause.SPECIALIST_RESPONSE;
            case RESOLVED ->
                    to == TicketStatus.CLOSED
                            || (to == TicketStatus.IN_PROGRESS
                                    && (cause == Cause.CLIENT_REOPEN || cause == Cause.CLIENT_REPLY));
            case CLOSED -> false;
        };
    }
}
