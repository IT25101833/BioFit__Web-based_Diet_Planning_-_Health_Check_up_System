package com.biofit.backend.support;

import com.biofit.backend.common.ApiException;
import java.util.Locale;
import org.springframework.http.HttpStatus;

public enum TicketPriority {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High"),
    URGENT("Urgent");

    private final String label;

    TicketPriority(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static TicketPriority parse(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Ticket priority is required.", HttpStatus.BAD_REQUEST);
        }
        String normalized = raw.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "low" -> LOW;
            case "medium", "normal" -> MEDIUM;
            case "high" -> HIGH;
            case "urgent" -> URGENT;
            default ->
                    throw new ApiException(
                            "VALIDATION_ERROR",
                            "Unknown ticket priority \"" + raw.trim() + "\".",
                            HttpStatus.BAD_REQUEST);
        };
    }
}
