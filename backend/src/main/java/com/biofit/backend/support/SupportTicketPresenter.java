package com.biofit.backend.support;

import com.biofit.backend.domain.DomainMapper;
import com.biofit.backend.domain.SupportTicketEntity;
import com.biofit.backend.domain.SupportTicketRepository;
import com.biofit.backend.health.HealthProfileRepository;
import com.biofit.backend.user.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Builds ticket API maps and removes staff-only fields for clients and specialists. */
@Component
@RequiredArgsConstructor
public class SupportTicketPresenter {

    private final DomainMapper mapper;
    private final UserRepository userRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final SupportTicketRepository supportTicketRepository;

    public Map<String, Object> present(SupportTicketEntity ticket, TicketAudience audience) {
        Map<String, Object> view = mapper.ticketSummary(ticket);
        view.put("messages", visibleMessages(view.get("messages"), audience));
        view.put("activityTimeline", visibleActivity(view.get("activityTimeline"), audience));
        if (audience == TicketAudience.CLIENT) {
            view.remove("escalation");
            Object related = view.get("relatedService");
            if (related instanceof Map<?, ?> map && map.get("name") != null) {
                view.put("relatedService", String.valueOf(map.get("name")));
            }
        }
        if (audience == TicketAudience.SUPPORT) {
            enrichClient(ticket, view);
        }
        return view;
    }

    @SuppressWarnings("unchecked")
    private List<Object> visibleMessages(Object raw, TicketAudience audience) {
        if (!(raw instanceof List<?> messages)) {
            return List.of();
        }
        List<Object> kept = new ArrayList<>();
        for (Object item : messages) {
            if (item instanceof Map<?, ?> map && visibleTo(new LinkedHashMap<>((Map<String, Object>) map), audience)) {
                kept.add(item);
            }
        }
        return kept;
    }

    @SuppressWarnings("unchecked")
    private List<Object> visibleActivity(Object raw, TicketAudience audience) {
        if (!(raw instanceof List<?> events)) {
            return List.of();
        }
        if (audience != TicketAudience.CLIENT) {
            return new ArrayList<>(events);
        }
        List<Object> kept = new ArrayList<>();
        for (Object item : events) {
            if (!(item instanceof Map<?, ?> map)) {
                continue;
            }
            if (isStaffOnlyActivity(map)) {
                continue;
            }
            kept.add(item);
        }
        return kept;
    }

    private static boolean isStaffOnlyActivity(Map<?, ?> event) {
        if (Boolean.TRUE.equals(event.get("staffOnly"))) {
            return true;
        }
        String text = event.get("text") == null ? "" : String.valueOf(event.get("text")).toLowerCase(Locale.ROOT);
        return text.contains("internal note") || text.contains("escalat");
    }

    @SuppressWarnings("unchecked")
    private void enrichClient(SupportTicketEntity ticket, Map<String, Object> view) {
        Object existing = view.get("client");
        Map<String, Object> client =
                existing instanceof Map<?, ?> map
                        ? new LinkedHashMap<>((Map<String, Object>) map)
                        : new LinkedHashMap<>();
        view.put("client", client);
        if (ticket.getClientUserId() != null) {
            userRepository
                    .findById(ticket.getClientUserId())
                    .ifPresent(
                            user -> {
                                client.put("email", user.getEmail());
                                client.put("phone", user.getContactNumber());
                            });
            healthProfileRepository
                    .findByUserId(ticket.getClientUserId())
                    .ifPresent(
                            profile -> {
                                if (profile.getProgrammeLabel() != null) {
                                    client.put("programme", profile.getProgrammeLabel());
                                }
                            });
        }
        if (ticket.getClientId() != null) {
            long ticketCount = supportTicketRepository.countByClientId(ticket.getClientId());
            client.put("previousTicketCount", Math.max(0, ticketCount - 1));
        }
    }

    static boolean visibleTo(Map<String, Object> message, TicketAudience audience) {
        String visibility = classify(message);
        return switch (audience) {
            case SUPPORT -> true;
            case CLIENT ->
                    MessageVisibility.CLIENT.name().equals(visibility)
                            || MessageVisibility.SUPPORT.name().equals(visibility);
            case SPECIALIST -> !MessageVisibility.INTERNAL_NOTE.name().equals(visibility);
        };
    }

    static String classify(Map<String, Object> message) {
        Object explicit = message.get("visibility");
        if (explicit != null && !String.valueOf(explicit).isBlank()) {
            String value = String.valueOf(explicit).trim().toUpperCase(Locale.ROOT);
            if (value.equals("INTERNAL") || value.equals("INTERNAL_NOTE")) {
                return MessageVisibility.INTERNAL_NOTE.name();
            }
            try {
                return MessageVisibility.valueOf(value).name();
            } catch (IllegalArgumentException ignored) {
                return MessageVisibility.INTERNAL_NOTE.name();
            }
        }
        String role = firstText(message.get("role"), message.get("from"));
        if (role.equals("internal") || role.equals("internal_note") || role.equals("internal note")) {
            return MessageVisibility.INTERNAL_NOTE.name();
        }
        if (role.equals("specialist")) {
            return MessageVisibility.SPECIALIST_INTERNAL.name();
        }
        if (role.equals("support")) {
            return MessageVisibility.SUPPORT.name();
        }
        return MessageVisibility.CLIENT.name();
    }

    private static String firstText(Object... values) {
        for (Object value : values) {
            if (value != null && !String.valueOf(value).isBlank()) {
                return String.valueOf(value).trim().toLowerCase(Locale.ROOT);
            }
        }
        return "";
    }

    public static long waitingMinutes(Instant waitingSince, Instant createdAt) {
        Instant start = waitingSince != null ? waitingSince : createdAt;
        if (start == null) {
            return 0;
        }
        return Math.max(0, Duration.between(start, Instant.now()).toMinutes());
    }
}
