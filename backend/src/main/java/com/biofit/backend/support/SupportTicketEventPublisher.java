package com.biofit.backend.support;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Concrete subject. Spring injects every {@link TicketObserver} bean once.
 * A failing observer is logged and skipped so it cannot roll back a saved ticket.
 */
@Component
@Slf4j
public class SupportTicketEventPublisher implements TicketSubject {

    private final List<TicketObserver> observers = new CopyOnWriteArrayList<>();

    public SupportTicketEventPublisher(List<TicketObserver> registered) {
        for (TicketObserver observer : registered) {
            addObserver(observer);
        }
    }

    @Override
    public void addObserver(TicketObserver observer) {
        if (observer != null && !observers.contains(observer)) {
            observers.add(observer);
        }
    }

    @Override
    public void removeObserver(TicketObserver observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers(TicketEvent event) {
        if (event == null) {
            return;
        }
        for (TicketObserver observer : observers) {
            try {
                observer.update(event);
            } catch (RuntimeException ex) {
                log.error(
                        "Ticket observer {} failed for {} on {}: {}",
                        observer.getClass().getSimpleName(),
                        event.type(),
                        event.ticketId(),
                        ex.getMessage());
            }
        }
    }

    public List<TicketObserver> registeredObservers() {
        return List.copyOf(observers);
    }
}
