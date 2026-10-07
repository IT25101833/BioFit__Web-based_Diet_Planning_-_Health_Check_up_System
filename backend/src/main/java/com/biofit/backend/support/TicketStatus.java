package com.biofit.backend.support;

import com.biofit.backend.common.ApiException;
import java.util.Locale;
import org.springframework.http.HttpStatus;

/** Stored status labels match the values already used by the API and the database. */
public enum TicketStatus {
    OPEN("Open"),
    ASSIGNED("Assigned"),
    IN_PROGRESS("In Progress"),
    PENDING_CLIENT_REPLY("Pending Client Reply"),
    ESCALATED("Escalated"),
    RESOLVED("Resolved"),
    CLOSED("Closed");

    private final String label;

    TicketStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static TicketStatus parse(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Ticket status is required.", HttpStatus.BAD_REQUEST);
        }
        String normalized = raw.trim().toLowerCase(Locale.ROOT).replace('-', ' ').replace('_', ' ');
        return switch (normalized) {
            case "open" -> OPEN;
            case "assigned" -> ASSIGNED;
            case "in progress", "started" -> IN_PROGRESS;
            case "pending client reply", "pending reply", "pending" -> PENDING_CLIENT_REPLY;
            case "escalated" -> ESCALATED;
            case "resolved" -> RESOLVED;
            case "closed" -> CLOSED;
            default ->
                    throw new ApiException(
                            "VALIDATION_ERROR",
                            "Unknown ticket status \"" + raw.trim() + "\".",
                            HttpStatus.BAD_REQUEST);
        };
    }
}
