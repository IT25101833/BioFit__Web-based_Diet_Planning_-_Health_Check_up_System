package com.biofit.backend.support;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Turns a ticket event into user-targeted notifications.
 * Writing happens after the ticket transaction commits, so a failed ticket does not leave a
 * notification, and a failed notification does not undo the ticket.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationObserver implements TicketObserver {

    private final SupportNotificationWriter writer;

    @Override
    public void update(TicketEvent event) {
        if (event.type() == TicketEventType.INTERNAL_NOTE_ADDED
                || event.type() == TicketEventType.TICKET_STARTED) {
            return;
        }
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            safeWrite(event);
                        }
                    });
        } else {
            safeWrite(event);
        }
    }

    private void safeWrite(TicketEvent event) {
        try {
            writer.write(event);
        } catch (RuntimeException ex) {
            log.error(
                    "Notification observer failed for {} on {}: {}",
                    event.type(),
                    event.ticketId(),
                    ex.getMessage());
        }
    }
}
