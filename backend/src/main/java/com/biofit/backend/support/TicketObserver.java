package com.biofit.backend.support;

/**
 * Reacts to a ticket event without being called directly by ticket business methods.
 * Notification and audit are separate observers so either can change without rewriting the other.
 */
public interface TicketObserver {
    void update(TicketEvent event);
}
