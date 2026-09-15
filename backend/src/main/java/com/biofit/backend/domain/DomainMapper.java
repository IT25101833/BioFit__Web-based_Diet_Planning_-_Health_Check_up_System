package com.biofit.backend.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Component
public class DomainMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    public Object parseJson(String json, Object fallback) {
        if (json == null || json.isBlank()) {
            return fallback;
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Object>() {});
        } catch (Exception e) {
            return fallback;
        }
    }

    public String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "[]";
        }
    }

    public Map<String, Object> programmeCard(WellnessProgramme p, int upcoming) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("title", p.getName());
        m.put("name", p.getName());
        m.put("status", p.getStatus());
        m.put("type", p.getType());
        m.put("description", p.getDescription());
        m.put("coach", p.getCoachName());
        m.put("coachName", p.getCoachName());
        m.put("nutritionConsultant", p.getNutritionName());
        m.put("nutritionName", p.getNutritionName());
        m.put("medicalName", p.getMedicalName());
        m.put("startDate", str(p.getStartDate()));
        m.put("endDate", str(p.getEndDate()));
        m.put("durationWeeks", p.getDurationWeeks());
        m.put("capacity", p.getCapacity());
        m.put("enrolled", p.getEnrolled());
        m.put("currentWeek", p.getProgress() != null ? Math.max(1, p.getProgress() / 8) : 1);
        m.put("totalWeeks", p.getDurationWeeks());
        m.put("progress", p.getProgress());
        m.put("appointmentsUpcoming", upcoming);
        m.put("goals", p.getGoals());
        m.put("includedServices", p.getIncludedServices());
        m.put("notes", p.getNotes());
        m.put("lastUpdated", p.getLastUpdated() != null ? p.getLastUpdated().toString() : null);
        return m;
    }

    public Map<String, Object> appointmentMap(Appointment a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", a.getId());
        m.put("service", a.getServiceType());
        m.put("serviceType", a.getServiceType());
        m.put("type", a.getServiceType());
        m.put("professional", a.getProfessional());
        m.put("professionalRole", a.getProfessionalRole());
        m.put("programme", a.getProgramme());
        m.put("date", str(a.getAppointmentDate()));
        m.put("time", a.getAppointmentTime());
        m.put("duration", a.getDuration());
        m.put("status", a.getStatus());
        m.put("bookingReference", a.getBookingReference());
        m.put("notes", a.getNotes());
        m.put("location", a.getLocation());
        m.put("clientId", a.getClientId());
        m.put("client", a.getClientName());
        m.put("clientName", a.getClientName());
        return m;
    }

    public Map<String, Object> notificationMap(NotificationEntity n) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", n.getId());
        m.put("type", n.getType());
        m.put("title", n.getTitle());
        m.put("body", n.getBody());
        m.put("message", n.getBody());
        m.put("createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toString() : Instant.now().toString());
        m.put("at", n.getCreatedAt() != null ? n.getCreatedAt().toString() : Instant.now().toString());
        m.put("read", n.isReadFlag());
        m.put("link", n.getLink());
        return m;
    }

    public Map<String, Object> ticketSummary(SupportTicketEntity t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("subject", t.getSubject());
        m.put("category", t.getCategory());
        m.put("priority", t.getPriority());
        m.put("status", t.getStatus());
        m.put("assignedTo", t.getAssignedTo());
        m.put("clientId", t.getClientId());
        m.put("clientName", t.getClientName());
        m.put("createdAt", t.getCreatedAt() != null ? t.getCreatedAt().toString() : null);
        m.put("updatedAt", t.getUpdatedAt() != null ? t.getUpdatedAt().toString() : null);
        @SuppressWarnings("unchecked")
        List<Object> messages = (List<Object>) parseJson(t.getMessagesJson(), new ArrayList<>());
        m.put("messages", messages);
        Map<String, Object> client = new LinkedHashMap<>();
        client.put("id", t.getClientId());
        client.put("name", t.getClientName());
        m.put("client", client);
        Map<String, Object> related = new LinkedHashMap<>();
        related.put("name", t.getRelatedService());
        m.put("relatedService", related);
        m.put("activityTimeline", List.of());
        m.put("waitingOn", null);
        return m;
    }

    public Map<String, Object> dietaryMap(DietaryRestrictionEntity d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.getId());
        m.put("clientId", d.getClientId());
        m.put("clientName", d.getClientName());
        m.put("name", d.getName());
        m.put("type", d.getType());
        m.put("status", d.getStatus());
        m.put("dateRecorded", str(d.getDateRecorded()));
        m.put("lastReviewed", str(d.getLastReviewed()));
        m.put("mealPlan", d.getMealPlan());
        m.put("notes", d.getNotes());
        m.put("mealPlanImpact", d.getMealPlanImpact());
        m.put("source", d.getSource());
        m.put("protected", d.isProtectedFlag());
        return m;
    }

    public Map<String, Object> exerciseMap(ExerciseEntity e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", e.getId());
        m.put("name", e.getName());
        m.put("category", e.getCategory());
        m.put("difficulty", e.getDifficulty());
        m.put("targetArea", e.getTargetArea());
        m.put("equipment", e.getEquipment());
        m.put("instructions", e.getInstructions());
        m.put("safetyNotes", e.getSafetyNotes());
        m.put("sets", e.getSetsLabel());
        m.put("reps", e.getRepsLabel());
        m.put("duration", e.getDurationLabel());
        m.put("rest", e.getRestLabel());
        return m;
    }

    public Map<String, Object> workoutPlanListItem(WorkoutPlanEntity p) {
        Map<String, Object> m = basePlan(p.getId(), p.getName(), p.getClientId(), p.getClientName(), p.getProgramme(),
                p.getGoal(), p.getStartDate(), p.getEndDate(), p.getCurrentWeek(), p.getStatus(), p.getProgress());
        m.put("difficulty", p.getDifficulty());
        m.put("sessionsPerWeek", p.getSessionsPerWeek());
        m.put("sessionDuration", p.getSessionDuration());
        m.put("totalWeeks", p.getTotalWeeks());
        m.put("description", p.getDescription());
        Object weeks = parseJson(p.getPlanJson(), List.of());
        if (weeks instanceof Map<?, ?> map) {
            Object w = map.get("weeks");
            Object d = map.get("days");
            m.put("weeks", w != null ? w : List.of());
            m.put("days", d != null ? d : List.of());
        } else {
            m.put("weeks", weeks);
            m.put("days", List.of());
        }
        return m;
    }

    public Map<String, Object> mealPlanListItem(MealPlanEntity p) {
        Map<String, Object> m = basePlan(p.getId(), p.getName(), p.getClientId(), p.getClientName(), p.getProgramme(),
                p.getGoal(), p.getStartDate(), p.getEndDate(), p.getCurrentWeek(), p.getStatus(), p.getProgress());
        m.put("description", p.getDescription());
        m.put("version", p.getVersionNo());
        m.put("lastUpdated", p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : null);
        Object plan = parseJson(p.getPlanJson(), Map.of());
        if (plan instanceof Map<?, ?> map) {
            Object days = map.get("days");
            Object considerations = map.get("considerations");
            Object history = map.get("history");
            Object consultant = map.get("consultant");
            m.put("days", days != null ? days : List.of());
            m.put("considerations", considerations != null ? considerations : List.of());
            m.put("history", history != null ? history : List.of());
            m.put("consultant", consultant != null ? consultant : "Maya Fernando");
        } else {
            m.put("days", List.of());
            m.put("considerations", List.of());
            m.put("history", List.of());
        }
        return m;
    }

    private Map<String, Object> basePlan(
            String id,
            String name,
            String clientId,
            String clientName,
            String programme,
            String goal,
            LocalDate start,
            LocalDate end,
            String currentWeek,
            String status,
            Integer progress) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("name", name);
        m.put("clientId", clientId);
        m.put("clientName", clientName);
        m.put("programme", programme);
        m.put("goal", goal);
        m.put("startDate", str(start));
        m.put("endDate", str(end));
        m.put("currentWeek", currentWeek);
        m.put("status", status);
        m.put("progress", progress);
        return m;
    }

    private String str(LocalDate d) {
        return d == null ? null : ISO_DATE.format(d);
    }
}
