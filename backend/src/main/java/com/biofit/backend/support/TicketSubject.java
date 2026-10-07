package com.biofit.backend.support;

/**
 * Publishes support-ticket events to registered observers.
 * The ticket workflow depends on this interface, not on each notification or audit class.
 */
public interface TicketSubject {
    void addObserver(TicketObserver observer);

    void removeObserver(TicketObserver observer);

    void notifyObservers(TicketEvent event);
}
