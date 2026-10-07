package com.biofit.backend.domain;

import com.biofit.backend.audit.AuditLog;
import com.biofit.backend.audit.AuditLogRepository;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.health.HealthAssessment;
import com.biofit.backend.health.HealthAssessmentRepository;
import com.biofit.backend.health.HealthRiskAlert;
import com.biofit.backend.health.HealthRiskAlertRepository;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.support.SupportTicketPresenter;
import com.biofit.backend.support.SupportTicketWorkflow;
import com.biofit.backend.support.TicketAudience;
import com.biofit.backend.support.TicketStatus;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DomainService {

    private final WellnessProgrammeRepository programmeRepository;
    private final ProgrammeEnrolmentRepository enrolmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRequestRepository medicalRequestRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final MealPlanRepository mealPlanRepository;
    private final DietaryRestrictionRepository dietaryRestrictionRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final SupportTicketWorkflow supportTicketWorkflow;
    private final SupportTicketPresenter supportTicketPresenter;
    private final NotificationRepository notificationRepository;
    private final ExerciseRepository exerciseRepository;
    private final StaffScheduleRepository staffScheduleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final DomainMapper mapper;
    private final BookingAvailabilityService bookingAvailabilityService;
    private final HealthAssessmentRepository healthAssessmentRepository;
    private final HealthRiskAlertRepository healthRiskAlertRepository;
    private final AuditLogRepository auditLogRepository;

    /* ---------- Client ---------- */

    public List<Map<String, Object>> clientProgrammes(Long userId) {
        return enrolmentRepository.findByClientUserId(userId).stream()
                .map(e -> programmeRepository.findById(e.getProgrammeId()).orElse(null))
                .filter(p -> p != null)
                .map(p -> mapper.programmeCard(p, countUpcoming(userId)))
                .toList();
    }

    public Map<String, Object> clientProgramme(Long userId, String id) {
        ProgrammeEnrolment enrolment =
                enrolmentRepository.findByClientUserId(userId).stream()
                        .filter(e -> e.getProgrammeId().equals(id))
                        .findFirst()
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Programme not found", HttpStatus.NOT_FOUND));
        WellnessProgramme p =
                programmeRepository
                        .findById(enrolment.getProgrammeId())
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Programme not found", HttpStatus.NOT_FOUND));
        Map<String, Object> card = mapper.programmeCard(p, countUpcoming(userId));
        card.put(
                "professionals",
                List.of(
                        Map.of("role", "Fitness Coach", "name", nullTo(p.getCoachName(), "Coach")),
                        Map.of("role", "Nutrition Consultant", "name", nullTo(p.getNutritionName(), "Consultant"))));
        card.put(
                "progressOverview",
                List.of(
                        Map.of("label", "Workout participation", "value", Math.min(100, (p.getProgress() == null ? 0 : p.getProgress()) + 4)),
                        Map.of("label", "Meal-plan consistency", "value", Math.max(40, (p.getProgress() == null ? 0 : p.getProgress()) - 8)),
                        Map.of("label", "Appointment attendance", "value", 90)));
        card.put(
                "upcomingAppointments",
                appointmentRepository.findByClientUserIdOrderByAppointmentDateAsc(userId).stream()
                        .filter(a -> "Upcoming".equalsIgnoreCase(a.getStatus()))
                        .limit(3)
                        .map(
                                a ->
                                        Map.of(
                                                "id", a.getId(),
                                                "title", a.getServiceType(),
                                                "date", a.getAppointmentDate().toString(),
                                                "time", a.getAppointmentTime(),
                                                "professional", nullTo(a.getProfessional(), "")))
                        .toList());
        return card;
    }

    public List<Map<String, Object>> clientAppointments(Long userId) {
        return appointmentRepository.findByClientUserIdOrderByAppointmentDateAsc(userId).stream()
                .map(mapper::appointmentMap)
                .toList();
    }

    public Map<String, Object> clientAppointment(Long userId, String id) {
        return mapper.appointmentMap(
                appointmentRepository
                        .findByIdAndClientUserId(id, userId)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Appointment not found", HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public Map<String, Object> createClientAppointment(Long userId, Map<String, Object> payload) {
        User user = userRepository.findById(userId).orElseThrow();
        String professionalId = str(payload.get("professionalId"));
        LocalDate date = LocalDate.parse(str(payload.get("date")));
        String time = str(payload.get("time"));
        String duration = str(payload.getOrDefault("duration", "45 min"));

        assertAppointmentDateNotPast(date);

        if (professionalId != null && !professionalId.isBlank()) {
            bookingAvailabilityService.assertSlotAvailable(professionalId, date, time, duration);
        }

        Appointment a = new Appointment();
        a.setId("apt-" + UUID.randomUUID().toString().substring(0, 8));
        a.setClientUserId(userId);
        a.setClientId("BF-C" + userId);
        a.setClientName(user.getFirstName() + " " + user.getLastName());
        a.setServiceType(str(payload.getOrDefault("service", payload.get("serviceType"))));
        a.setProfessional(str(payload.get("professional")));
        Long professionalUserId = null;
        if (payload.get("professionalUserId") != null) {
            professionalUserId = asLong(payload.get("professionalUserId"));
        } else if (professionalId != null && professionalId.startsWith("user-")) {
            professionalUserId = asLong(professionalId.substring(5));
        }
        if (isMedicalAdvisorUser(professionalUserId)
                || "MEDICAL_ADVISOR".equalsIgnoreCase(str(payload.get("professionalRole")))) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "Medical Advisors are not available for appointment booking.",
                    HttpStatus.BAD_REQUEST);
        }
        a.setProfessionalUserId(professionalUserId);
        a.setProfessionalRole(str(payload.get("professionalRole")));
        a.setProgramme(str(payload.get("programme")));
        a.setAppointmentDate(date);
        a.setAppointmentTime(time);
        a.setDuration(duration);
        a.setStatus("Upcoming");
        a.setBookingReference("BF-APT-" + (10000 + (int) (Math.random() * 90000)));
        a.setNotes(str(payload.get("notes")));
        a.setLocation(str(payload.getOrDefault("location", "VitalLife Wellness Centre")));
        a.setAudience(nullTo(str(payload.get("audience")), "CLIENT"));
        appointmentRepository.save(a);

        String typeLabel = firstNonBlank(a.getServiceType(), "appointment");
        String clientDateLabel =
                a.getAppointmentDate() == null
                        ? ""
                        : a.getAppointmentDate()
                                .format(java.time.format.DateTimeFormatter.ofPattern("d MMM", Locale.ENGLISH));
        createNotification(
                userId,
                "CLIENT",
                "appointment",
                "Appointment Booked",
                "Your "
                        + typeLabel
                        + " appointment has been booked for "
                        + clientDateLabel
                        + " at "
                        + firstNonBlank(a.getAppointmentTime(), "")
                        + ".",
                "/client/appointments");

        if (isMedicalAdvisorUser(professionalUserId)) {
            return mapper.appointmentMap(a);
        }
        bookingAvailabilityService.notifyProfessional(
                professionalUserId,
                "New appointment booked",
                a.getClientName()
                        + " booked "
                        + a.getServiceType()
                        + " on "
                        + a.getAppointmentDate()
                        + " at "
                        + a.getAppointmentTime()
                        + ".",
                "/notifications");

        return mapper.appointmentMap(a);
    }

    @Transactional
    public Map<String, Object> cancelClientAppointment(Long userId, String id) {
        Appointment a =
                appointmentRepository
                        .findByIdAndClientUserId(id, userId)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Appointment not found", HttpStatus.NOT_FOUND));
        if ("Cancelled".equalsIgnoreCase(a.getStatus())
                || (a.getStatus() != null
                        && a.getStatus().toLowerCase(Locale.ROOT).startsWith("cancelled "))) {
            return Map.of("id", id, "status", "Cancelled");
        }
        if ("Completed".equalsIgnoreCase(a.getStatus())
                || "ATTENDED".equalsIgnoreCase(a.getAttendance())) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "Completed appointments cannot be cancelled.",
                    HttpStatus.BAD_REQUEST);
        }
        a.setStatus("Cancelled");
        a.setUpdatedAt(Instant.now());
        appointmentRepository.save(a);
        writeAudit(userId, "APPOINTMENT_CANCELLED", "Appointment", id, "Appointment cancelled");

        return Map.of("id", id, "status", "Cancelled");
    }

    public List<Map<String, Object>> adminAppointments() {
        return appointmentRepository.findAll().stream()
                .sorted(
                        Comparator.comparing(
                                        Appointment::getAppointmentDate,
                                        Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(
                                        Appointment::getAppointmentTime,
                                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(mapper::appointmentMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> hardDeleteAppointment(Long adminUserId, String id) {
        Appointment a =
                appointmentRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Appointment not found", HttpStatus.NOT_FOUND));
        if (!isAppointmentInFuture(a)) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "Only future appointments can be permanently deleted. Past appointments must be kept for history.",
                    HttpStatus.BAD_REQUEST);
        }
        appointmentRepository.delete(a);
        writeAudit(
                adminUserId,
                "APPOINTMENT_HARD_DELETED",
                "Appointment",
                id,
                "Permanently deleted future appointment "
                        + firstNonBlank(a.getServiceType(), "")
                        + " on "
                        + a.getAppointmentDate());
        return Map.of("id", id, "deleted", true);
    }

    private static boolean isAppointmentInFuture(Appointment a) {
        if (a.getAppointmentDate() == null) return false;
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        if (a.getAppointmentDate().isAfter(today)) return true;
        if (a.getAppointmentDate().isBefore(today)) return false;
        Integer startMins = parseAppointmentTimeMinutes(a.getAppointmentTime());
        if (startMins == null) return true;
        int nowMins = LocalTime.now(zone).toSecondOfDay() / 60;
        return startMins > nowMins;
    }

    private static Integer parseAppointmentTimeMinutes(String label) {
        if (label == null || label.isBlank()) return null;
        String t = label.trim().toUpperCase(Locale.ROOT);
        try {
            if (t.endsWith("AM") || t.endsWith("PM")) {
                boolean pm = t.endsWith("PM");
                String core = t.replace("AM", "").replace("PM", "").trim();
                String[] parts = core.split(":");
                int h = Integer.parseInt(parts[0].trim());
                int m = parts.length > 1 ? Integer.parseInt(parts[1].trim()) : 0;
                if (h == 12) h = 0;
                if (pm) h += 12;
                return h * 60 + m;
            }
            String[] parts = t.split(":");
            return Integer.parseInt(parts[0].trim()) * 60
                    + (parts.length > 1 ? Integer.parseInt(parts[1].trim()) : 0);
        } catch (Exception ignored) {
            return null;
        }
    }

    @Transactional
    public Map<String, Object> rescheduleClientAppointment(Long userId, String id, Map<String, Object> payload) {
        Appointment a =
                appointmentRepository
                        .findByIdAndClientUserId(id, userId)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Appointment not found", HttpStatus.NOT_FOUND));
        boolean advisorUnavailable =
                "ADVISOR_UNAVAILABLE".equalsIgnoreCase(a.getAttendance())
                        || "Cancelled by Advisor".equalsIgnoreCase(a.getStatus());
        if (isCancelledAppointmentStatus(a.getStatus()) && !advisorUnavailable) {
            throw new ApiException(
                    "VALIDATION_ERROR", "Cancelled appointments cannot be rescheduled", HttpStatus.BAD_REQUEST);
        }
        if ("Completed".equalsIgnoreCase(a.getStatus())
                || "ATTENDED".equalsIgnoreCase(a.getAttendance())) {
            throw new ApiException(
                    "VALIDATION_ERROR", "Completed appointments cannot be rescheduled", HttpStatus.BAD_REQUEST);
        }

        String dateStr = str(payload.get("date"));
        String time = str(payload.get("time"));
        if (isBlank(dateStr) || isBlank(time)) {
            throw new ApiException("VALIDATION_ERROR", "New date and time are required", HttpStatus.BAD_REQUEST);
        }
        LocalDate date = LocalDate.parse(dateStr);
        assertAppointmentDateNotPast(date);
        String duration = nullTo(str(payload.get("duration")), a.getDuration());
        if (isBlank(duration)) duration = "45 min";

        String professionalId = str(payload.get("professionalId"));
        if (isBlank(professionalId) && a.getProfessionalUserId() != null) {
            professionalId = "user-" + a.getProfessionalUserId();
        }
        if (isBlank(professionalId) && !isBlank(a.getProfessional())) {
            Long matched =
                    userRepository.findAll().stream()
                            .filter(u -> u.getDeletedAt() == null)
                            .filter(
                                    u ->
                                            (u.getFirstName() + " " + u.getLastName())
                                                    .equalsIgnoreCase(a.getProfessional()))
                            .map(User::getId)
                            .findFirst()
                            .orElse(null);
            if (matched != null) {
                professionalId = "user-" + matched;
                a.setProfessionalUserId(matched);
            }
        }
        if (isBlank(professionalId)) {
            throw new ApiException(
                    "VALIDATION_ERROR", "Professional is required to reschedule", HttpStatus.BAD_REQUEST);
        }

        bookingAvailabilityService.assertSlotAvailable(professionalId, date, time, duration, a.getId());

        a.setAppointmentDate(date);
        a.setAppointmentTime(time);
        a.setDuration(duration);
        a.setStatus("Upcoming");
        a.setAttendance(null);
        a.setAttendanceNote(null);
        a.setAttendanceMarkedAt(null);
        a.setUpdatedAt(Instant.now());
        appointmentRepository.save(a);

        if (!isMedicalAdvisorUser(a.getProfessionalUserId())) {
            bookingAvailabilityService.notifyProfessional(
                    a.getProfessionalUserId(),
                    "Appointment rescheduled",
                    (a.getClientName() == null ? "A client" : a.getClientName())
                            + " rescheduled "
                            + a.getServiceType()
                            + " to "
                            + a.getAppointmentDate()
                            + " at "
                            + a.getAppointmentTime()
                            + ".",
                    "/notifications");
        }

        return mapper.appointmentMap(a);
    }

    public Map<String, Object> clientWorkoutPlan(Long userId) {
        WorkoutPlanEntity plan =
                workoutPlanRepository
                        .findFirstByClientUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(userId, "Active")
                        .or(() -> workoutPlanRepository.findByClientUserId(userId).stream().findFirst())
                        .orElse(null);
        if (plan == null) {
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("assigned", false);
            empty.put("empty", true);
            empty.put("days", List.of());
            return empty;
        }
        Map<String, Object> m = mapper.workoutPlanListItem(plan);
        m.put("assigned", true);
        m.put("coach", "");
        m.put("weekLabel", plan.getCurrentWeek());
        m.put("completionPercent", plan.getProgress() == null ? 0 : plan.getProgress());
        Object parsed = mapper.parseJson(plan.getPlanJson(), Map.of());
        if (parsed instanceof Map<?, ?> map) {
            Object days = map.get("days");
            Object weeks = map.get("weeks");
            if (days != null) {
                m.put("days", days);
            } else if (weeks instanceof List<?> weekList && !weekList.isEmpty()) {
                Object first = weekList.get(0);
                if (first instanceof Map<?, ?> weekMap && weekMap.get("days") != null) {
                    m.put("days", weekMap.get("days"));
                } else {
                    m.put("days", List.of());
                }
            } else {
                m.put("days", List.of());
            }
        } else {
            m.put("days", List.of());
        }
        return m;
    }

    public Map<String, Object> clientFitnessProgress(Long userId) {
        WorkoutPlanEntity plan =
                workoutPlanRepository
                        .findFirstByClientUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(userId, "Active")
                        .orElse(null);
        int progress = plan != null && plan.getProgress() != null ? plan.getProgress() : 0;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("participation", progress);
        m.put("completedSessions", 0);
        m.put("plannedSessions", plan != null && plan.getTotalWeeks() != null ? plan.getTotalWeeks() * 3 : 0);
        m.put("programmeProgress", progress);
        m.put("monthly", List.of());
        m.put("assessments", List.of());
        m.put("assigned", plan != null);
        return m;
    }

    public Map<String, Object> clientMealPlan(Long userId) {
        MealPlanEntity plan =
                mealPlanRepository
                        .findFirstByClientUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(userId, "Active")
                        .or(() -> mealPlanRepository.findByClientUserId(userId).stream().findFirst())
                        .orElse(null);
        if (plan == null) {
            Map<String, Object> empty = new LinkedHashMap<>();
            empty.put("assigned", false);
            empty.put("empty", true);
            empty.put("days", List.of());
            empty.put("considerations", List.of());
            return empty;
        }
        Map<String, Object> m = mapper.mealPlanListItem(plan);
        m.put("assigned", true);
        List<Map<String, Object>> restrictions =
                dietaryRestrictionRepository.findByClientUserId(userId).stream()
                        .filter(d -> d.getStatus() == null || "Active".equalsIgnoreCase(d.getStatus()))
                        .map(mapper::dietaryMap)
                        .toList();
        if (!m.containsKey("considerations") || m.get("considerations") == null) {
            m.put(
                    "considerations",
                    restrictions.stream()
                            .map(r -> String.valueOf(r.getOrDefault("name", "")))
                            .filter(s -> !s.isBlank())
                            .toList());
        }
        return m;
    }

    public Map<String, Object> clientNutritionProgress(Long userId) {
        MealPlanEntity plan =
                mealPlanRepository
                        .findFirstByClientUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(userId, "Active")
                        .orElse(null);
        int progress = plan != null && plan.getProgress() != null ? plan.getProgress() : 0;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("participation", progress);
        m.put("weeklyConsistency", List.of());
        m.put("planStatus", plan == null ? "Not assigned" : firstNonBlank(plan.getStatus(), "Active"));
        m.put("reviews", List.of());
        m.put(
                "trends",
                plan == null
                        ? List.of()
                        : List.of(Map.of("label", "Meal-plan participation", "value", progress)));
        m.put("assigned", plan != null);
        return m;
    }

    public List<Map<String, Object>> clientNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(mapper::notificationMap)
                .toList();
    }

    public long clientUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFlagFalse(userId);
    }

    @Transactional
    public Map<String, Object> markNotificationRead(String id) {
        return markNotificationRead(null, id);
    }

    @Transactional
    public Map<String, Object> markNotificationRead(Long userId, String id) {
        NotificationEntity n =
                notificationRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Notification not found", HttpStatus.NOT_FOUND));
        if (userId != null && n.getUserId() != null && !Objects.equals(n.getUserId(), userId)) {
            throw new ApiException("FORBIDDEN", "Notification not found", HttpStatus.NOT_FOUND);
        }
        n.setReadFlag(true);
        notificationRepository.save(n);
        return mapper.notificationMap(n);
    }

    @Transactional
    public Map<String, Object> markAllNotificationsRead(Long userId) {
        List<NotificationEntity> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        list.forEach(n -> n.setReadFlag(true));
        notificationRepository.saveAll(list);
        return Map.of("updated", list.size());
    }

    public List<Map<String, Object>> clientTickets(Long userId) {
        return supportTicketRepository.findByClientUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(ticket -> supportTicketPresenter.present(ticket, TicketAudience.CLIENT))
                .toList();
    }

    public Map<String, Object> clientTicket(Long userId, String id) {
        return supportTicketPresenter.present(
                supportTicketRepository
                        .findByIdAndClientUserId(id, userId)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Ticket not found", HttpStatus.NOT_FOUND)),
                TicketAudience.CLIENT);
    }

    @Transactional
    public Map<String, Object> createClientTicket(Long userId, Map<String, Object> payload) {
        return supportTicketWorkflow.createFromClient(userId, payload);
    }

    @Transactional
    public Map<String, Object> replyClientTicket(Long userId, String id, Map<String, Object> payload) {
        return supportTicketWorkflow.replyAsClient(userId, id, payload);
    }

    @Transactional
    public Map<String, Object> reopenClientTicket(Long userId, String id, Map<String, Object> payload) {
        return supportTicketWorkflow.reopenAsClient(userId, id, payload == null ? Map.of() : payload);
    }

    @Transactional
    public Map<String, Object> deleteClientTicket(Long userId, String id) {
        SupportTicketEntity t =
                supportTicketRepository
                        .findByIdAndClientUserId(id, userId)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Ticket not found", HttpStatus.NOT_FOUND));
        String status = t.getStatus() == null ? "" : t.getStatus();
        if ("Resolved".equalsIgnoreCase(status) || "Closed".equalsIgnoreCase(status)) {
            throw new ApiException(
                    "CONFLICT", "Resolved or closed tickets cannot be deleted", HttpStatus.CONFLICT);
        }
        if (!"Open".equalsIgnoreCase(status)) {
            throw new ApiException(
                    "CONFLICT",
                    "Only open tickets that were sent by mistake can be deleted. Once support is handling the ticket it must stay on record.",
                    HttpStatus.CONFLICT);
        }
        if (ticketHasSupportReply(t.getMessagesJson())) {
            throw new ApiException(
                    "CONFLICT",
                    "This ticket already has a support response and cannot be deleted",
                    HttpStatus.CONFLICT);
        }
        String ticketId = t.getId();
        supportTicketRepository.delete(t);
        supportTicketRepository.flush();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", ticketId);
        result.put("deleted", Boolean.TRUE);
        return result;
    }

    private boolean ticketHasSupportReply(String messagesJson) {
        Object parsed = mapper.parseJson(messagesJson, List.of());
        if (!(parsed instanceof List<?> messages)) {
            return false;
        }
        for (Object raw : messages) {
            if (!(raw instanceof Map<?, ?> map)) {
                continue;
            }
            String roleText = map.get("role") == null ? "" : String.valueOf(map.get("role"));
            String fromText = map.get("from") == null ? "" : String.valueOf(map.get("from"));
            String visibility = map.get("visibility") == null ? "" : String.valueOf(map.get("visibility"));
            if ("support".equalsIgnoreCase(roleText)
                    || "internal".equalsIgnoreCase(roleText)
                    || "internal_note".equalsIgnoreCase(roleText)
                    || "specialist".equalsIgnoreCase(roleText)
                    || "support".equalsIgnoreCase(fromText)
                    || "SUPPORT".equalsIgnoreCase(visibility)
                    || "INTERNAL_NOTE".equalsIgnoreCase(visibility)
                    || "SPECIALIST_INTERNAL".equalsIgnoreCase(visibility)) {
                return true;
            }
        }
        return false;
    }

    public Map<String, Object> clientProfile(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", "BF-C" + userId);
        m.put("firstName", user.getFirstName());
        m.put("lastName", user.getLastName());
        m.put("email", user.getEmail());
        m.put("contactNumber", user.getContactNumber() != null ? user.getContactNumber() : "");
        m.put("specialization", user.getSpecialization() != null ? user.getSpecialization() : "");
        String roleLabel = "";
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            roleLabel = user.getRoles().iterator().next().getName().name().replace('_', ' ');
        }
        m.put("role", roleLabel);
        m.put("accountStatus", user.getDeletedAt() == null ? "Active" : "Inactive");
        return m;
    }

    @Transactional
    public Map<String, Object> updateClientProfile(Long userId, Map<String, Object> payload) {
        User user = userRepository.findById(userId).orElseThrow();
        if (payload.get("firstName") != null) user.setFirstName(str(payload.get("firstName")));
        if (payload.get("lastName") != null) user.setLastName(str(payload.get("lastName")));
        if (payload.get("contactNumber") != null) user.setContactNumber(str(payload.get("contactNumber")));
        if (payload.get("specialization") != null) user.setSpecialization(str(payload.get("specialization")));
        userRepository.save(user);
        return clientProfile(userId);
    }

    public Map<String, Object> supportOfficerProfile(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", "BF-S" + userId);
        profile.put("firstName", user.getFirstName());
        profile.put("lastName", user.getLastName());
        profile.put("email", user.getEmail());
        profile.put("contactNumber", user.getContactNumber() == null ? "" : user.getContactNumber());
        profile.put("role", "Customer Experience Officer");
        profile.put("specialization", user.getSpecialization() == null ? "" : user.getSpecialization());
        profile.put("accountStatus", user.getDeletedAt() == null ? "Active" : "Inactive");
        return profile;
    }

    @Transactional
    public Map<String, Object> updateSupportOfficerProfile(Long userId, Map<String, Object> payload) {
        updateClientProfile(userId, payload);
        return supportOfficerProfile(userId);
    }

    /* ---------- Manager ---------- */

    public Map<String, Object> managerDashboard(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        long programmes = programmeRepository.count();
        long enrolments = enrolmentRepository.count();
        long schedules = staffScheduleRepository.count();
        long appointments = appointmentRepository.count();

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("greetingName", user.getFirstName());
        m.put(
                "stats",
                Map.of(
                        "activeProgrammes",
                        Map.of("value", programmes, "hint", "Across the centre"),
                        "activeClients",
                        Map.of("value", enrolments, "hint", "Active enrolments"),
                        "staffAvailableToday",
                        Map.of("value", 3, "hint", "Ready for sessions"),
                        "todaysAppointments",
                        Map.of("value", appointments, "hint", "Booked appointments")));
        m.put(
                "todaysOperations",
                staffScheduleRepository.findAll().stream()
                        .limit(5)
                        .map(
                                s -> {
                                    Map<String, Object> row = new LinkedHashMap<>();
                                    row.put("id", s.getId());
                                    row.put("time", s.getStartTime() == null ? "—" : s.getStartTime());
                                    row.put("service", s.getServiceLabel());
                                    row.put("professional", s.getStaffName());
                                    row.put("client", s.getClientName());
                                    row.put("programme", s.getProgramme());
                                    row.put("status", s.getStatus());
                                    return row;
                                })
                        .toList());
        m.put(
                "enrolmentTrend",
                List.of(
                        Map.of("label", "May", "value", 12),
                        Map.of("label", "Jun", "value", 15),
                        Map.of("label", "Jul", "value", 18),
                        Map.of("label", "Aug", "value", 21),
                        Map.of("label", "Sep", "value", Math.max(2, enrolments))));
        m.put(
                "activeProgrammes",
                programmeRepository.findAll().stream()
                        .map(
                                p -> {
                                    Map<String, Object> card = mapper.programmeCard(p, 0);
                                    card.put(
                                            "staff",
                                            String.join(
                                                    " / ",
                                                    java.util.stream.Stream.of(
                                                                    p.getCoachName(), p.getNutritionName())
                                                            .filter(n -> n != null && !n.isBlank())
                                                            .toList()));
                                    return card;
                                })
                        .toList());
        m.put(
                "staffAvailability",
                List.of(
                        Map.of(
                                "id",
                                "s1",
                                "name",
                                "Daniel Perera",
                                "role",
                                "Fitness Coach",
                                "status",
                                "Available"),
                        Map.of(
                                "id",
                                "s2",
                                "name",
                                "Maya Fernando",
                                "role",
                                "Nutrition Consultant",
                                "status",
                                "In Session"),
                        Map.of(
                                "id",
                                "s3",
                                "name",
                                "Elena Costa",
                                "role",
                                "Medical Advisor",
                                "status",
                                "Available")));
        m.put(
                "recentActivity",
                List.of(
                        Map.of(
                                "id",
                                "a1",
                                "text",
                                "Programme capacity reviewed for Weight Management",
                                "at",
                                "Today"),
                        Map.of(
                                "id",
                                "a2",
                                "text",
                                "Staff schedule updated for Studio sessions",
                                "at",
                                "Today"),
                        Map.of(
                                "id",
                                "a3",
                                "text",
                                schedules + " schedule block(s) currently tracked",
                                "at",
                                "Just now")));
        return m;
    }

    public List<Map<String, Object>> managerProgrammes() {
        return programmeRepository.findAll().stream().map(p -> mapper.programmeCard(p, 0)).toList();
    }

    public Map<String, Object> managerProgramme(String id) {
        WellnessProgramme p =
                programmeRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Programme not found", HttpStatus.NOT_FOUND));
        Map<String, Object> card = mapper.programmeCard(p, 0);
        card.put(
                "enrolments",
                enrolmentRepository.findByProgrammeId(id).stream()
                        .map(
                                e ->
                                        Map.of(
                                                "id", e.getId(),
                                                "clientId", nullTo(e.getClientId(), ""),
                                                "clientName", e.getClientName(),
                                                "status", e.getStatus(),
                                                "progress", e.getProgress() == null ? 0 : e.getProgress(),
                                                "enrolledDate", e.getEnrolledDate() == null ? "" : e.getEnrolledDate().toString()))
                        .toList());
        return card;
    }

    @Transactional
    public Map<String, Object> createProgramme(Map<String, Object> payload) {
        WellnessProgramme p = new WellnessProgramme();
        p.setId("prog-" + UUID.randomUUID().toString().substring(0, 8));
        applyProgramme(p, payload);
        p.setStatus(str(payload.getOrDefault("status", "Active")));
        p.setEnrolled(0);
        p.setProgress(0);
        programmeRepository.save(p);
        return mapper.programmeCard(p, 0);
    }

    @Transactional
    public Map<String, Object> updateProgramme(String id, Map<String, Object> payload) {
        WellnessProgramme p =
                programmeRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Programme not found", HttpStatus.NOT_FOUND));
        applyProgramme(p, payload);
        p.setLastUpdated(Instant.now());
        programmeRepository.save(p);
        return mapper.programmeCard(p, 0);
    }

    @Transactional
    public Map<String, Object> deactivateProgramme(String id) {
        WellnessProgramme p =
                programmeRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Programme not found", HttpStatus.NOT_FOUND));
        p.setStatus("Inactive");
        p.setLastUpdated(Instant.now());
        programmeRepository.save(p);
        return mapper.programmeCard(p, 0);
    }

    public List<Map<String, Object>> managerEnrolments() {
        return enrolmentRepository.findAll().stream()
                .map(
                        e -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", e.getId());
                            m.put("clientName", e.getClientName());
                            m.put("clientId", e.getClientId());
                            m.put("programmeId", e.getProgrammeId());
                            m.put(
                                    "programme",
                                    programmeRepository
                                            .findById(e.getProgrammeId())
                                            .map(WellnessProgramme::getName)
                                            .orElse("Programme"));
                            m.put("enrolledDate", e.getEnrolledDate() == null ? null : e.getEnrolledDate().toString());
                            m.put("period", e.getPeriodLabel());
                            m.put("coach", e.getCoachName());
                            m.put("progress", e.getProgress());
                            m.put("status", e.getStatus());
                            return m;
                        })
                .toList();
    }

    public Map<String, Object> managerSchedules() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put(
                "staff",
                List.of(
                        Map.of("id", "st-coach", "name", "Daniel Perera", "role", "Fitness Coach", "status", "Available"),
                        Map.of("id", "st-nutri", "name", "Maya Fernando", "role", "Nutrition Consultant", "status", "Available"),
                        Map.of("id", "st-med", "name", "Elena Costa", "role", "Medical Advisor", "status", "Available")));
        m.put("events", staffScheduleRepository.findAll().stream().map(this::scheduleEvent).toList());
        return m;
    }

    @Transactional
    public Map<String, Object> saveSchedule(Map<String, Object> payload) {
        LocalDate scheduleDate = LocalDate.parse(str(payload.get("date")));
        assertAppointmentDateNotPast(scheduleDate);
        StaffScheduleEntity s = new StaffScheduleEntity();
        s.setId(str(payload.getOrDefault("id", "sch-" + UUID.randomUUID().toString().substring(0, 8))));
        s.setScheduleDate(scheduleDate);
        s.setStartTime(str(payload.get("startTime")));
        s.setEndTime(str(payload.get("endTime")));
        s.setStaffId(str(payload.get("staffId")));
        s.setStaffName(str(payload.get("staffName")));
        s.setRoleLabel(str(payload.get("role")));
        s.setServiceLabel(str(payload.get("service")));
        s.setClientName(str(payload.get("client")));
        s.setProgramme(str(payload.get("programme")));
        s.setStatus(str(payload.getOrDefault("status", "Scheduled")));
        s.setNotes(str(payload.get("notes")));
        staffScheduleRepository.save(s);
        return scheduleEvent(s);
    }

    @Transactional
    public Map<String, Object> cancelSchedule(String id) {
        StaffScheduleEntity s =
                staffScheduleRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Schedule not found", HttpStatus.NOT_FOUND));
        s.setStatus("Cancelled");
        staffScheduleRepository.save(s);
        return scheduleEvent(s);
    }

    public Map<String, Object> managerReports() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put(
                "overview",
                Map.of(
                        "programmes", programmeRepository.count(),
                        "enrolments", enrolmentRepository.count(),
                        "appointments", appointmentRepository.count(),
                        "tickets", supportTicketRepository.count()));
        m.put(
                "enrolmentTrend",
                List.of(
                        Map.of("label", "May", "value", 12),
                        Map.of("label", "Jun", "value", 15),
                        Map.of("label", "Jul", "value", 18),
                        Map.of("label", "Aug", "value", 21),
                        Map.of("label", "Sep", "value", enrolmentRepository.count())));
        m.put(
                "programmeDistribution",
                programmeRepository.findAll().stream()
                        .map(p -> Map.of("name", p.getName(), "value", p.getEnrolled() == null ? 0 : p.getEnrolled()))
                        .toList());
        m.put("appointmentActivity", List.of(Map.of("label", "This week", "value", appointmentRepository.count())));
        m.put("capacityUtilization", programmeRepository.findAll().stream()
                .map(p -> Map.of(
                        "name", p.getName(),
                        "value", p.getCapacity() == null || p.getCapacity() == 0
                                ? 0
                                : Math.round(100.0 * (p.getEnrolled() == null ? 0 : p.getEnrolled()) / p.getCapacity())))
                .toList());
        return m;
    }

    public List<Map<String, Object>> notificationsByAudience(String audience) {
        return notificationRepository.findByAudienceIgnoreCaseOrderByCreatedAtDesc(audience).stream()
                .map(mapper::notificationMap)
                .toList();
    }

    public List<Map<String, Object>> notificationsForAudienceUser(String audience, Long userId) {
        return notificationRepository.findForAudienceUserOrBroadcast(audience, userId).stream()
                .map(mapper::notificationMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> markMyAudienceNotificationsRead(Long userId, String audience) {
        List<NotificationEntity> list =
                notificationRepository.findByUserIdAndAudienceIgnoreCaseOrderByCreatedAtDesc(userId, audience);
        list.forEach(notification -> notification.setReadFlag(true));
        notificationRepository.saveAll(list);
        return Map.of("updated", list.size());
    }

    public List<Map<String, Object>> medicalNotificationsForAdvisor(Long advisorUserId) {
        return notificationRepository
                .findForAudienceUserOrBroadcast("MEDICAL", advisorUserId)
                .stream()
                .map(mapper::notificationMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> markAudienceNotificationsRead(String audience) {
        List<NotificationEntity> list =
                notificationRepository.findByAudienceIgnoreCaseOrderByCreatedAtDesc(audience);
        list.forEach(n -> n.setReadFlag(true));
        notificationRepository.saveAll(list);
        return Map.of("updated", list.size());
    }

    @Transactional
    public Map<String, Object> markMedicalNotificationsRead(Long advisorUserId) {
        List<NotificationEntity> list =
                notificationRepository.findByUserIdAndAudienceIgnoreCaseOrderByCreatedAtDesc(
                        advisorUserId, "MEDICAL");
        list.forEach(n -> n.setReadFlag(true));
        notificationRepository.saveAll(list);
        return Map.of("updated", list.size());
    }

    @Transactional
    public Map<String, Object> markMedicalNotificationRead(Long advisorUserId, String id) {
        NotificationEntity n =
                notificationRepository
                        .findByIdAndAudienceIgnoreCase(id, "MEDICAL")
                        .orElseThrow(
                                () ->
                                        new ApiException(
                                                "NOT_FOUND", "Notification not found", HttpStatus.NOT_FOUND));
        boolean owned = advisorUserId != null && advisorUserId.equals(n.getUserId());
        boolean general = n.getUserId() == null;
        if (!owned && !general) {
            throw new ApiException(
                    "FORBIDDEN", "You cannot update this notification", HttpStatus.FORBIDDEN);
        }
        n.setReadFlag(true);
        notificationRepository.save(n);
        return mapper.notificationMap(n);
    }

    /* ---------- Coach / Nutrition / Medical / Support shared lists ---------- */

    public List<Map<String, Object>> workoutPlans() {
        return workoutPlanRepository.findAll().stream().map(mapper::workoutPlanListItem).toList();
    }

    public Map<String, Object> workoutPlan(String id) {
        return mapper.workoutPlanListItem(
                workoutPlanRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Plan not found", HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public Map<String, Object> saveWorkoutPlan(String id, Map<String, Object> payload) {
        WorkoutPlanEntity p =
                id == null
                        ? new WorkoutPlanEntity()
                        : workoutPlanRepository.findById(id).orElse(new WorkoutPlanEntity());
        if (p.getId() == null) p.setId("wp-" + UUID.randomUUID().toString().substring(0, 8));
        p.setName(str(payload.getOrDefault("name", "Workout plan")));
        p.setClientId(str(payload.get("clientId")));
        p.setClientName(str(payload.get("clientName")));
        Long clientUserId = resolveLinkedClientUserId(payload);
        if (clientUserId != null) {
            p.setClientUserId(clientUserId);
            if (isBlank(p.getClientId())) {
                p.setClientId("BF-C" + clientUserId);
            }
            if (isBlank(p.getClientName())) {
                p.setClientName(clientDisplayName(clientUserId));
            }
        }
        p.setProgramme(str(payload.get("programme")));
        p.setGoal(str(payload.get("goal")));
        p.setDifficulty(str(payload.getOrDefault("difficulty", "Moderate")));
        if (payload.get("startDate") != null) p.setStartDate(LocalDate.parse(str(payload.get("startDate"))));
        if (payload.get("endDate") != null) p.setEndDate(LocalDate.parse(str(payload.get("endDate"))));
        p.setSessionsPerWeek(asInt(payload.get("sessionsPerWeek"), 3));
        p.setSessionDuration(str(payload.getOrDefault("sessionDuration", "45 min")));
        p.setDescription(str(payload.get("description")));
        p.setCurrentWeek(str(payload.getOrDefault("currentWeek", "Week 1")));
        p.setTotalWeeks(asInt(payload.get("totalWeeks"), 8));
        p.setProgress(asInt(payload.get("progress"), 0));
        p.setStatus(str(payload.getOrDefault("status", "Active")));
        Object weeks = payload.getOrDefault("weeks", payload.get("days"));
        p.setPlanJson(mapper.toJson(Map.of("weeks", weeks == null ? List.of() : weeks, "days", payload.getOrDefault("days", List.of()))));
        p.setUpdatedAt(Instant.now());
        workoutPlanRepository.save(p);
        writeAudit(null, id == null ? "WORKOUT_PLAN_CREATED" : "WORKOUT_PLAN_UPDATED", "WorkoutPlan", p.getId(), p.getName());
        return mapper.workoutPlanListItem(p);
    }

    @Transactional
    public Map<String, Object> archiveWorkoutPlan(String id) {
        WorkoutPlanEntity p =
                workoutPlanRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Plan not found", HttpStatus.NOT_FOUND));
        p.setStatus("Archived");
        p.setUpdatedAt(Instant.now());
        workoutPlanRepository.save(p);
        writeAudit(null, "WORKOUT_PLAN_ARCHIVED", "WorkoutPlan", id, p.getName());
        return mapper.workoutPlanListItem(p);
    }

    @Transactional
    public Map<String, Object> hardDeleteUnusedDraftWorkoutPlan(Long actorUserId, String id) {
        WorkoutPlanEntity p =
                workoutPlanRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Plan not found", HttpStatus.NOT_FOUND));
        assertUnusedDraftPlan(
                p.getStatus(),
                p.getClientUserId(),
                p.getClientId(),
                p.getClientName(),
                p.getProgress());
        workoutPlanRepository.delete(p);
        writeAudit(actorUserId, "WORKOUT_PLAN_HARD_DELETED", "WorkoutPlan", id, "Deleted unused draft");
        return Map.of("id", id, "deleted", true);
    }

    public List<Map<String, Object>> mealPlans() {
        return mealPlanRepository.findAll().stream().map(mapper::mealPlanListItem).toList();
    }

    public Map<String, Object> mealPlan(String id) {
        return mapper.mealPlanListItem(
                mealPlanRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Plan not found", HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public Map<String, Object> saveMealPlan(String id, Map<String, Object> payload) {
        MealPlanEntity p =
                id == null ? new MealPlanEntity() : mealPlanRepository.findById(id).orElse(new MealPlanEntity());
        if (p.getId() == null) p.setId("mp-" + UUID.randomUUID().toString().substring(0, 8));
        p.setName(str(payload.getOrDefault("name", "Meal plan")));
        p.setClientId(str(payload.get("clientId")));
        p.setClientName(str(payload.get("clientName")));
        Long clientUserId = resolveLinkedClientUserId(payload);
        if (clientUserId != null) {
            p.setClientUserId(clientUserId);
            if (isBlank(p.getClientId())) {
                p.setClientId("BF-C" + clientUserId);
            }
            if (isBlank(p.getClientName())) {
                p.setClientName(clientDisplayName(clientUserId));
            }
        }
        p.setProgramme(str(payload.get("programme")));
        p.setGoal(str(payload.get("goal")));
        p.setDescription(str(payload.get("description")));
        if (payload.get("startDate") != null) p.setStartDate(LocalDate.parse(str(payload.get("startDate"))));
        if (payload.get("endDate") != null) p.setEndDate(LocalDate.parse(str(payload.get("endDate"))));
        p.setCurrentWeek(str(payload.getOrDefault("currentWeek", "Week 1")));
        p.setStatus(str(payload.getOrDefault("status", "Active")));
        p.setProgress(asInt(payload.get("progress"), 0));
        p.setVersionNo(asInt(payload.get("version"), p.getVersionNo() == null ? 1 : p.getVersionNo() + 1));
        p.setPlanJson(
                mapper.toJson(
                        Map.of(
                                "days",
                                payload.getOrDefault("days", List.of()),
                                "considerations",
                                payload.getOrDefault("considerations", List.of()),
                                "history",
                                payload.getOrDefault("history", List.of()),
                                "consultant",
                                payload.getOrDefault("consultant", ""))));
        p.setUpdatedAt(Instant.now());
        mealPlanRepository.save(p);
        writeAudit(null, id == null ? "MEAL_PLAN_CREATED" : "MEAL_PLAN_UPDATED", "MealPlan", p.getId(), p.getName());
        return mapper.mealPlanListItem(p);
    }

    @Transactional
    public Map<String, Object> archiveMealPlan(String id) {
        MealPlanEntity p =
                mealPlanRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Plan not found", HttpStatus.NOT_FOUND));
        p.setStatus("Archived");
        p.setUpdatedAt(Instant.now());
        mealPlanRepository.save(p);
        writeAudit(null, "MEAL_PLAN_ARCHIVED", "MealPlan", id, p.getName());
        return mapper.mealPlanListItem(p);
    }

    @Transactional
    public Map<String, Object> hardDeleteUnusedDraftMealPlan(Long actorUserId, String id) {
        MealPlanEntity p =
                mealPlanRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Plan not found", HttpStatus.NOT_FOUND));
        assertUnusedDraftPlan(
                p.getStatus(),
                p.getClientUserId(),
                p.getClientId(),
                p.getClientName(),
                p.getProgress());
        mealPlanRepository.delete(p);
        writeAudit(actorUserId, "MEAL_PLAN_HARD_DELETED", "MealPlan", id, "Deleted unused draft");
        return Map.of("id", id, "deleted", true);
    }

    public List<Map<String, Object>> dietaryRestrictions() {
        return dietaryRestrictionRepository.findAll().stream().map(mapper::dietaryMap).toList();
    }

    public List<Map<String, Object>> dietaryByClient(String clientId) {
        return dietaryRestrictionRepository.findByClientId(clientId).stream().map(mapper::dietaryMap).toList();
    }

    @Transactional
    public Map<String, Object> saveDietary(String id, Map<String, Object> payload) {
        DietaryRestrictionEntity d =
                id == null
                        ? new DietaryRestrictionEntity()
                        : dietaryRestrictionRepository.findById(id).orElse(new DietaryRestrictionEntity());
        if (d.getId() == null) d.setId("dr-" + UUID.randomUUID().toString().substring(0, 8));
        d.setClientId(str(payload.get("clientId")));
        d.setClientName(str(payload.get("clientName")));
        Long clientUserId = resolveLinkedClientUserId(payload);
        if (clientUserId != null) {
            d.setClientUserId(clientUserId);
            if (isBlank(d.getClientId())) {
                d.setClientId("BF-C" + clientUserId);
            }
            if (isBlank(d.getClientName())) {
                d.setClientName(clientDisplayName(clientUserId));
            }
        }
        d.setName(str(payload.get("name")));
        d.setType(str(payload.get("type")));
        d.setStatus(str(payload.getOrDefault("status", "Active")));
        d.setDateRecorded(LocalDate.now());
        d.setLastReviewed(LocalDate.now());
        d.setMealPlan(str(payload.get("mealPlan")));
        d.setNotes(str(payload.get("notes")));
        d.setMealPlanImpact(str(payload.get("mealPlanImpact")));
        d.setSource(str(payload.getOrDefault("source", "Consultant")));
        d.setProtectedFlag(Boolean.TRUE.equals(payload.get("protected")));
        dietaryRestrictionRepository.save(d);
        writeAudit(
                null,
                id == null ? "DIETARY_RESTRICTION_CREATED" : "DIETARY_RESTRICTION_UPDATED",
                "DietaryRestriction",
                d.getId(),
                d.getName());
        return mapper.dietaryMap(d);
    }

    @Transactional
    public Map<String, Object> deactivateDietary(String id) {
        DietaryRestrictionEntity d =
                dietaryRestrictionRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Restriction not found", HttpStatus.NOT_FOUND));
        d.setStatus("Inactive");
        dietaryRestrictionRepository.save(d);
        writeAudit(null, "DIETARY_RESTRICTION_DEACTIVATED", "DietaryRestriction", id, d.getName());
        return mapper.dietaryMap(d);
    }

    @Transactional
    public Map<String, Object> hardDeleteInactiveDietary(Long adminUserId, String id) {
        DietaryRestrictionEntity d =
                dietaryRestrictionRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Restriction not found", HttpStatus.NOT_FOUND));
        if (d.isProtectedFlag()) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "Protected medical allergy/restriction records cannot be permanently deleted.",
                    HttpStatus.BAD_REQUEST);
        }
        if (d.getStatus() == null || !d.getStatus().equalsIgnoreCase("Inactive")) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "Only inactive test/junk dietary records can be permanently deleted. Deactivate first.",
                    HttpStatus.BAD_REQUEST);
        }
        dietaryRestrictionRepository.delete(d);
        writeAudit(
                adminUserId,
                "DIETARY_RESTRICTION_HARD_DELETED",
                "DietaryRestriction",
                id,
                "Permanently deleted inactive dietary record " + firstNonBlank(d.getName(), id));
        return Map.of("id", id, "deleted", true);
    }

    public List<Map<String, Object>> exercises() {
        return exerciseRepository.findAll().stream().map(mapper::exerciseMap).toList();
    }

    public Map<String, Object> exercise(String id) {
        return mapper.exerciseMap(
                exerciseRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Exercise not found", HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public Map<String, Object> saveExercise(String id, Map<String, Object> payload) {
        ExerciseEntity e =
                id == null ? new ExerciseEntity() : exerciseRepository.findById(id).orElse(new ExerciseEntity());
        if (e.getId() == null) e.setId("ex-" + UUID.randomUUID().toString().substring(0, 8));
        e.setName(str(payload.get("name")));
        e.setCategory(str(payload.get("category")));
        e.setDifficulty(str(payload.get("difficulty")));
        e.setTargetArea(str(payload.get("targetArea")));
        e.setEquipment(str(payload.get("equipment")));
        e.setInstructions(str(payload.get("instructions")));
        e.setSafetyNotes(str(payload.get("safetyNotes")));
        e.setSetsLabel(str(payload.get("sets")));
        e.setRepsLabel(str(payload.get("reps")));
        e.setDurationLabel(str(payload.get("duration")));
        e.setRestLabel(str(payload.get("rest")));
        exerciseRepository.save(e);
        return mapper.exerciseMap(e);
    }

    @Transactional
    public void deleteExercise(String id) {
        exerciseRepository.deleteById(id);
    }

    public List<Map<String, Object>> appointmentsForRole(String roleFragment) {
        return appointmentRepository
                .findByProfessionalRoleContainingIgnoreCaseOrderByAppointmentDateAsc(roleFragment)
                .stream()
                .map(mapper::appointmentMap)
                .toList();
    }

    public List<Map<String, Object>> appointmentsForProfessional(Long professionalUserId) {
        return appointmentRepository
                .findByProfessionalUserIdOrderByAppointmentDateDesc(professionalUserId)
                .stream()
                .map(mapper::appointmentMap)
                .toList();
    }

    public List<Map<String, Object>> nutritionAppointmentsForProfessional(Long nutritionistUserId) {
        User user = userRepository.findById(nutritionistUserId).orElseThrow();
        String nutritionistName = staffDisplayName(user);
        return appointmentRepository.findAll().stream()
                .filter(a -> isNutritionAppointmentForProfessional(a, nutritionistUserId, nutritionistName))
                .sorted(
                        Comparator.comparing(
                                        Appointment::getAppointmentDate, Comparator.nullsLast(Comparator.naturalOrder()))
                                .thenComparing(
                                        Appointment::getAppointmentTime, Comparator.nullsLast(String::compareTo)))
                .map(mapper::appointmentMap)
                .toList();
    }

    /**
     * Clients available in Nutrition Select Client after Attend.
     * Same source of truth as Medical: attendance == ATTENDED for this nutritionist.
     */
    public List<Map<String, Object>> nutritionClientsForConsultant(UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException("UNAUTHORIZED", "Authentication required", HttpStatus.UNAUTHORIZED);
        }
        List<Appointment> appointments =
                principal.hasRole(RoleName.ADMIN)
                        ? appointmentRepository
                                .findByProfessionalRoleContainingIgnoreCaseOrderByAppointmentDateAsc("Nutrition")
                        : appointmentRepository.findAll().stream()
                                .filter(
                                        a ->
                                                isNutritionAppointmentForProfessional(
                                                        a,
                                                        principal.getId(),
                                                        staffDisplayName(
                                                                userRepository
                                                                        .findById(principal.getId())
                                                                        .orElse(null))))
                                .toList();

        LinkedHashMap<Long, Map<String, Object>> byClient = new LinkedHashMap<>();
        for (Appointment appointment : appointments) {
            if (appointment.getClientUserId() == null) continue;
            if (!"ATTENDED".equalsIgnoreCase(appointment.getAttendance())) continue;
            Long clientUserId = appointment.getClientUserId();
            if (byClient.containsKey(clientUserId)) continue;

            User client = userRepository.findById(clientUserId).orElse(null);
            if (client == null || client.getDeletedAt() != null) continue;

            String clientCode = firstNonBlank(appointment.getClientId(), "BF-C" + clientUserId);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", clientCode);
            row.put("userId", clientUserId);
            row.put("clientId", clientCode);
            row.put(
                    "name",
                    firstNonBlank(
                            appointment.getClientName(),
                            (client.getFirstName() + " " + client.getLastName()).trim()));
            row.put("clientName", row.get("name"));
            row.put("email", client.getEmail());
            row.put("programme", appointment.getProgramme());
            row.put("appointmentId", appointment.getId());
            row.put("attendance", appointment.getAttendance());
            row.put("mealPlan", "");
            row.put("planStatus", "None");
            row.put("dietaryStatus", "None");
            row.put("reviewStatus", "Current");
            row.put("status", "Active");
            byClient.put(clientUserId, row);
        }
        return new ArrayList<>(byClient.values());
    }

    public Map<String, Object> nutritionClientForConsultant(UserPrincipal principal, String id) {
        return nutritionClientsForConsultant(principal).stream()
                .filter(
                        c ->
                                id.equals(String.valueOf(c.get("id")))
                                        || id.equals(String.valueOf(c.get("clientId")))
                                        || id.equals(String.valueOf(c.get("userId"))))
                .findFirst()
                .orElseThrow(
                        () ->
                                new ApiException(
                                        "NOT_FOUND",
                                        "Client not found. Attend this client from Appointment Lobby first.",
                                        HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Map<String, Object> markNutritionAppointmentAttendance(
            UserPrincipal principal, String appointmentId, Map<String, Object> body) {
        if (principal == null) {
            throw new ApiException("UNAUTHORIZED", "Authentication required", HttpStatus.UNAUTHORIZED);
        }
        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElseThrow(
                                () -> new ApiException("NOT_FOUND", "Appointment not found", HttpStatus.NOT_FOUND));

        User actor = userRepository.findById(principal.getId()).orElse(null);
        String nutritionistName = staffDisplayName(actor);
        boolean admin = principal.hasRole(RoleName.ADMIN);
        boolean owner =
                isNutritionAppointmentForProfessional(appointment, principal.getId(), nutritionistName);
        if (!admin && !owner) {
            throw new ApiException(
                    "FORBIDDEN",
                    "You can only mark attendance for your own nutrition appointments",
                    HttpStatus.FORBIDDEN);
        }

        String status = appointment.getStatus() == null ? "" : appointment.getStatus().trim();
        if (status.equalsIgnoreCase("Cancelled")
                || status.toLowerCase(Locale.ROOT).startsWith("cancelled ")
                || status.equalsIgnoreCase("Completed")) {
            throw new ApiException(
                    "CONFLICT",
                    "This appointment is already cancelled or completed.",
                    HttpStatus.CONFLICT);
        }
        if (appointment.getAttendance() != null && !appointment.getAttendance().isBlank()) {
            throw new ApiException(
                    "CONFLICT",
                    "Attendance has already been marked for this appointment.",
                    HttpStatus.CONFLICT);
        }

        String attendance = str(body.get("attendance"));
        if (attendance == null) {
            throw new ApiException("VALIDATION_ERROR", "attendance is required", HttpStatus.BAD_REQUEST);
        }
        String attendanceNorm = attendance.trim().toUpperCase(Locale.ROOT);
        String note = str(body.get("note"));
        Instant now = Instant.now();

        // Backfill professionalUserId so subsequent ownership checks stay consistent.
        if (appointment.getProfessionalUserId() == null && !admin) {
            appointment.setProfessionalUserId(principal.getId());
        }

        if ("ATTENDED".equals(attendanceNorm)) {
            appointment.setAttendance("ATTENDED");
            appointment.setAttendanceNote(isBlank(note) ? null : note.trim());
            appointment.setAttendanceMarkedAt(now);
            appointment.setStatus("Completed");
            appointment.setUpdatedAt(now);
            appointmentRepository.save(appointment);

            if (appointment.getClientUserId() != null) {
                String typeLabel = firstNonBlank(appointment.getServiceType(), "Nutrition Consultation");
                NotificationEntity n = new NotificationEntity();
                n.setId("ntf-" + UUID.randomUUID().toString().substring(0, 8));
                n.setUserId(appointment.getClientUserId());
                n.setAudience("CLIENT");
                n.setType("appointment");
                n.setTitle("Appointment Completed");
                n.setBody("Your " + typeLabel + " appointment has been completed.");
                n.setLink("/client/appointments");
                n.setReadFlag(false);
                n.setCreatedAt(now);
                notificationRepository.save(n);
            }

            writeAudit(
                    principal.getId(),
                    "NUTRITION_APPOINTMENT_ATTENDED",
                    "Appointment",
                    appointment.getId(),
                    "Marked attended for " + firstNonBlank(appointment.getClientName(), "client"));
            return mapper.appointmentMap(appointment);
        }

        if ("ADVISOR_UNAVAILABLE".equals(attendanceNorm)) {
            if (isBlank(note)) {
                throw new ApiException(
                        "VALIDATION_ERROR",
                        "A reason is required when marking unavailable.",
                        HttpStatus.BAD_REQUEST);
            }
            String reason = note.trim();
            if (reason.length() > 500) {
                reason = reason.substring(0, 500);
            }
            appointment.setAttendance("ADVISOR_UNAVAILABLE");
            appointment.setAttendanceNote(reason);
            appointment.setAttendanceMarkedAt(now);
            appointment.setStatus("Cancelled by Advisor");
            appointment.setUpdatedAt(now);
            appointmentRepository.save(appointment);

            String dateLabel =
                    appointment.getAppointmentDate() == null
                            ? "the scheduled date"
                            : appointment.getAppointmentDate().toString();
            String timeLabel =
                    isBlank(appointment.getAppointmentTime())
                            ? "the scheduled time"
                            : appointment.getAppointmentTime();
            String bodyText =
                    "Your nutrition consultation on "
                            + dateLabel
                            + " at "
                            + timeLabel
                            + " could not go ahead because the consultant was unavailable. Please reschedule. Reason: "
                            + reason;

            if (appointment.getClientUserId() != null) {
                NotificationEntity n = new NotificationEntity();
                n.setId("ntf-" + UUID.randomUUID().toString().substring(0, 8));
                n.setUserId(appointment.getClientUserId());
                n.setAudience("CLIENT");
                n.setType("appointments");
                n.setTitle("Nutrition appointment unavailable");
                n.setBody(bodyText);
                n.setLink("/client/appointments/" + appointment.getId() + "/reschedule");
                n.setReadFlag(false);
                n.setCreatedAt(now);
                notificationRepository.save(n);
            }

            writeAudit(
                    principal.getId(),
                    "NUTRITION_APPOINTMENT_CONSULTANT_UNAVAILABLE",
                    "Appointment",
                    appointment.getId(),
                    "Consultant unavailable: " + reason);
            return mapper.appointmentMap(appointment);
        }

        throw new ApiException(
                "VALIDATION_ERROR",
                "attendance must be ATTENDED or ADVISOR_UNAVAILABLE",
                HttpStatus.BAD_REQUEST);
    }

    public List<Map<String, Object>> allTickets() {
        return supportTicketRepository.findAll().stream().map(mapper::ticketSummary).toList();
    }

    public Map<String, Object> coachDashboard(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        long plans = workoutPlanRepository.count();
        long clients = enrolmentRepository.count();
        List<Map<String, Object>> schedule =
                appointmentsForRole("Coach").stream()
                        .limit(5)
                        .map(
                                a -> {
                                    Map<String, Object> row = new LinkedHashMap<>(a);
                                    row.putIfAbsent("sessionType", a.getOrDefault("serviceType", a.get("service")));
                                    row.putIfAbsent(
                                            "workout",
                                            a.get("programme") != null ? a.get("programme") : "Fitness session");
                                    if (row.get("duration") == null) row.put("duration", "45 min");
                                    return row;
                                })
                        .toList();
        List<Map<String, Object>> plansList =
                workoutPlans().stream()
                        .limit(5)
                        .map(
                                p -> {
                                    Map<String, Object> row = new LinkedHashMap<>(p);
                                    row.putIfAbsent("client", p.get("clientName"));
                                    Object week = p.get("currentWeek");
                                    Object total = p.get("totalWeeks");
                                    if (week != null && String.valueOf(week).toLowerCase().startsWith("week")) {
                                        row.put("weekLabel", week);
                                    } else {
                                        row.put(
                                                "weekLabel",
                                                "Week "
                                                        + (week == null ? "1" : week)
                                                        + (total == null ? "" : " of " + total));
                                    }
                                    return row;
                                })
                        .toList();

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("greetingName", user.getFirstName());
        m.put(
                "stats",
                Map.of(
                        "assignedClients",
                        Map.of("value", clients, "hint", "On programmes"),
                        "todaysSessions",
                        Map.of("value", schedule.size(), "hint", "Scheduled today"),
                        "activePlans",
                        Map.of("value", plans, "hint", "Assigned plans"),
                        "assessmentsDue",
                        Map.of("value", 0, "hint", "Review soon")));
        m.put("todaysSchedule", schedule);
        m.put(
                "attention",
                plansList.stream()
                        .filter(
                                p -> {
                                    String status = String.valueOf(p.getOrDefault("status", ""));
                                    int prog = p.get("progress") instanceof Number n ? n.intValue() : 0;
                                    return "Draft".equalsIgnoreCase(status) || prog >= 70;
                                })
                        .limit(5)
                        .map(
                                p -> {
                                    Map<String, Object> row = new LinkedHashMap<>();
                                    row.put("id", "att-" + p.get("id"));
                                    row.put("clientId", p.get("clientId"));
                                    row.put("client", p.getOrDefault("clientName", p.get("client")));
                                    row.put(
                                            "reason",
                                            "Draft".equalsIgnoreCase(String.valueOf(p.get("status")))
                                                    ? "Draft plan awaiting assignment"
                                                    : "Workout plan progressing — review soon");
                                    row.put("due", p.getOrDefault("weekLabel", "Review"));
                                    return row;
                                })
                        .toList());
        m.put("progressTrend", List.of());
        m.put("activePlans", plansList);
        m.put(
                "recentActivity",
                List.of(
                        Map.of(
                                "id",
                                "ra1",
                                "text",
                                plans + " workout plan(s) in the system",
                                "at",
                                "Just now"),
                        Map.of(
                                "id",
                                "ra2",
                                "text",
                                schedule.size() + " coach session(s) on the schedule",
                                "at",
                                "Today")));
        return m;
    }

    public Map<String, Object> nutritionDashboard(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        String nutritionistName = staffDisplayName(user);

        Set<Long> assignedClientUserIds = nutritionAssignedClientUserIds(user);
        Set<String> assignedClientCodes = nutritionAssignedClientCodes(user, assignedClientUserIds);

        List<Appointment> nutritionistAppointments =
                appointmentRepository.findAll().stream()
                        .filter(a -> isNutritionAppointmentForProfessional(a, userId, nutritionistName))
                        .filter(a -> !isCancelledAppointmentStatus(a.getStatus()))
                        .toList();

        List<Map<String, Object>> todaysAppointments =
                nutritionistAppointments.stream()
                        .filter(a -> today.equals(a.getAppointmentDate()))
                        .filter(DomainService::isEligibleForTodayReminder)
                        .sorted(
                                Comparator.comparing(
                                        Appointment::getAppointmentTime, Comparator.nullsLast(String::compareTo)))
                        .map(
                                a -> {
                                    Map<String, Object> row = new LinkedHashMap<>(mapper.appointmentMap(a));
                                    row.putIfAbsent("type", a.getServiceType());
                                    return row;
                                })
                        .toList();

        List<MealPlanEntity> assignedMealPlans =
                mealPlanRepository.findAll().stream()
                        .filter(p -> mealPlanBelongsToAssignedClients(p, assignedClientUserIds, assignedClientCodes))
                        .toList();

        List<Map<String, Object>> mealPlanAttention =
                assignedMealPlans.stream()
                        .filter(
                                p -> {
                                    String status = p.getStatus() == null ? "" : p.getStatus();
                                    return "Review Due".equalsIgnoreCase(status)
                                            || "Draft".equalsIgnoreCase(status);
                                })
                        .sorted(Comparator.comparing(MealPlanEntity::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                        .limit(5)
                        .map(
                                p -> {
                                    Map<String, Object> row = new LinkedHashMap<>();
                                    row.put("id", "att-" + p.getId());
                                    row.put("planId", p.getId());
                                    row.put("clientId", p.getClientId());
                                    row.put("client", p.getClientName());
                                    row.put(
                                            "reason",
                                            "Draft".equalsIgnoreCase(p.getStatus())
                                                    ? "Draft meal plan awaiting assignment"
                                                    : "Meal plan review due");
                                    row.put(
                                            "detail",
                                            firstNonBlank(p.getCurrentWeek(), p.getGoal(), p.getStatus()));
                                    return row;
                                })
                        .toList();

        List<DietaryRestrictionEntity> assignedRestrictions =
                dietaryRestrictionRepository.findAll().stream()
                        .filter(d -> dietaryBelongsToAssignedClients(d, assignedClientUserIds, assignedClientCodes))
                        .filter(this::isTrackedDietaryRestriction)
                        .toList();

        List<Map<String, Object>> dietaryUpdates =
                assignedRestrictions.stream()
                        .sorted(
                                Comparator.comparing(
                                                DietaryRestrictionEntity::getLastReviewed,
                                                Comparator.nullsLast(Comparator.reverseOrder()))
                                        .thenComparing(
                                                DietaryRestrictionEntity::getDateRecorded,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                        .limit(5)
                        .map(
                                d -> {
                                    Map<String, Object> row = new LinkedHashMap<>();
                                    row.put("id", d.getId());
                                    row.put("clientId", d.getClientId());
                                    row.put("client", d.getClientName());
                                    row.put(
                                            "update",
                                            d.getName() != null
                                                    ? d.getName() + " recorded"
                                                    : "Dietary preference updated");
                                    row.put(
                                            "date",
                                            d.getLastReviewed() != null
                                                    ? d.getLastReviewed().toString()
                                                    : d.getDateRecorded() == null
                                                            ? null
                                                            : d.getDateRecorded().toString());
                                    return row;
                                })
                        .toList();

        List<Map<String, Object>> recentActivity = buildNutritionRecentActivity(assignedMealPlans, assignedRestrictions);

        String greetingName =
                user.getFirstName() == null || user.getFirstName().isBlank() ? null : user.getFirstName().trim();

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("greetingName", greetingName);
        m.put(
                "stats",
                Map.of(
                        "assignedClients",
                        Map.of("value", assignedClientUserIds.size(), "hint", "On programmes"),
                        "plansRequiringReview",
                        Map.of("value", mealPlanAttention.size(), "hint", "Needs follow-up"),
                        "todaysAppointments",
                        Map.of("value", todaysAppointments.size(), "hint", "Scheduled today"),
                        "dietaryUpdates",
                        Map.of("value", assignedRestrictions.size(), "hint", "Tracked restrictions")));
        m.put("todaysAppointments", todaysAppointments);
        m.put("mealPlanAttention", mealPlanAttention);
        m.put("dietaryUpdates", dietaryUpdates);
        m.put("progressTrend", List.of());
        m.put("recentActivity", recentActivity);
        return m;
    }

    private String staffDisplayName(User user) {
        if (user == null) return "";
        return ((user.getFirstName() == null ? "" : user.getFirstName())
                        + " "
                        + (user.getLastName() == null ? "" : user.getLastName()))
                .trim();
    }

    private Set<Long> nutritionAssignedClientUserIds(User nutritionist) {
        String nutritionistName = staffDisplayName(nutritionist);
        Set<Long> ids = new LinkedHashSet<>();
        if (isBlank(nutritionistName)) return ids;

        for (ProgrammeEnrolment enrolment : enrolmentRepository.findAll()) {
            if (!isActiveProgrammeEnrolment(enrolment)) continue;
            String assignedNutrition = enrolment.getNutritionName();
            if (isBlank(assignedNutrition) && enrolment.getProgrammeId() != null) {
                assignedNutrition =
                        programmeRepository
                                .findById(enrolment.getProgrammeId())
                                .map(WellnessProgramme::getNutritionName)
                                .orElse(null);
            }
            if (!equalsIgnoreCase(assignedNutrition, nutritionistName)) continue;
            if (enrolment.getClientUserId() != null) {
                ids.add(enrolment.getClientUserId());
            }
        }
        return ids;
    }

    private Set<String> nutritionAssignedClientCodes(User nutritionist, Set<Long> assignedClientUserIds) {
        String nutritionistName = staffDisplayName(nutritionist);
        Set<String> codes = new LinkedHashSet<>();
        for (ProgrammeEnrolment enrolment : enrolmentRepository.findAll()) {
            if (!isActiveProgrammeEnrolment(enrolment)) continue;
            String assignedNutrition = enrolment.getNutritionName();
            if (isBlank(assignedNutrition) && enrolment.getProgrammeId() != null) {
                assignedNutrition =
                        programmeRepository
                                .findById(enrolment.getProgrammeId())
                                .map(WellnessProgramme::getNutritionName)
                                .orElse(null);
            }
            if (!equalsIgnoreCase(assignedNutrition, nutritionistName)) continue;
            if (!isBlank(enrolment.getClientId())) {
                codes.add(enrolment.getClientId());
            }
        }
        for (Long clientUserId : assignedClientUserIds) {
            codes.add("BF-C" + clientUserId);
        }
        return codes;
    }

    private static boolean isActiveProgrammeEnrolment(ProgrammeEnrolment enrolment) {
        if (enrolment == null) return false;
        String status = enrolment.getStatus();
        if (isBlank(status)) return true;
        return !"Cancelled".equalsIgnoreCase(status)
                && !"Withdrawn".equalsIgnoreCase(status)
                && !"Completed".equalsIgnoreCase(status);
    }

    private boolean isNutritionAppointmentForProfessional(
            Appointment appointment, Long nutritionistUserId, String nutritionistName) {
        if (appointment == null) return false;
        String role = appointment.getProfessionalRole();
        if (!containsIgnoreCase(role, "Nutrition")) return false;
        if (nutritionistUserId != null
                && appointment.getProfessionalUserId() != null
                && nutritionistUserId.equals(appointment.getProfessionalUserId())) {
            return true;
        }
        return !isBlank(nutritionistName) && equalsIgnoreCase(appointment.getProfessional(), nutritionistName);
    }

    private static boolean mealPlanBelongsToAssignedClients(
            MealPlanEntity plan, Set<Long> clientUserIds, Set<String> clientCodes) {
        if (plan == null) return false;
        if (plan.getClientUserId() != null && clientUserIds.contains(plan.getClientUserId())) return true;
        return !isBlank(plan.getClientId()) && clientCodes.contains(plan.getClientId());
    }

    private static boolean dietaryBelongsToAssignedClients(
            DietaryRestrictionEntity restriction, Set<Long> clientUserIds, Set<String> clientCodes) {
        if (restriction == null) return false;
        if (restriction.getClientUserId() != null && clientUserIds.contains(restriction.getClientUserId())) {
            return true;
        }
        return !isBlank(restriction.getClientId()) && clientCodes.contains(restriction.getClientId());
    }

    private boolean isTrackedDietaryRestriction(DietaryRestrictionEntity restriction) {
        if (restriction == null) return false;
        String status = restriction.getStatus();
        if (isBlank(status)) return true;
        return "Active".equalsIgnoreCase(status) || "Under Review".equalsIgnoreCase(status);
    }

    private List<Map<String, Object>> buildNutritionRecentActivity(
            List<MealPlanEntity> mealPlans, List<DietaryRestrictionEntity> restrictions) {
        List<Map<String, Object>> activity = new ArrayList<>();
        mealPlans.stream()
                .filter(p -> p.getUpdatedAt() != null)
                .sorted(Comparator.comparing(MealPlanEntity::getUpdatedAt).reversed())
                .limit(3)
                .forEach(
                        p -> {
                            Map<String, Object> row = new LinkedHashMap<>();
                            row.put("id", "mp-" + p.getId());
                            row.put(
                                    "text",
                                    firstNonBlank(p.getName(), "Meal plan")
                                            + " updated for "
                                            + firstNonBlank(p.getClientName(), "client"));
                            row.put("at", p.getUpdatedAt().toString());
                            activity.add(row);
                        });
        restrictions.stream()
                .sorted(
                        Comparator.comparing(
                                        DietaryRestrictionEntity::getLastReviewed,
                                        Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(
                                        DietaryRestrictionEntity::getDateRecorded,
                                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(3)
                .forEach(
                        d -> {
                            Map<String, Object> row = new LinkedHashMap<>();
                            row.put("id", "dr-" + d.getId());
                            row.put(
                                    "text",
                                    firstNonBlank(d.getName(), "Dietary restriction")
                                            + " tracked for "
                                            + firstNonBlank(d.getClientName(), "client"));
                            row.put(
                                    "at",
                                    d.getLastReviewed() != null
                                            ? d.getLastReviewed().toString()
                                            : d.getDateRecorded() == null
                                                    ? ""
                                                    : d.getDateRecorded().toString());
                            activity.add(row);
                        });
        return activity.stream().limit(6).toList();
    }

    public Map<String, Object> medicalDashboard(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();

        Set<Long> clientIds =
                medicalRequestRepository
                        .findByMedicalAdvisorIdAndStatusInOrderByRequestedAtDesc(
                                userId, MedicalRequest.CLINICAL_ACCESS)
                        .stream()
                        .map(MedicalRequest::getClientId)
                        .filter(id -> id != null)
                        .collect(Collectors.toCollection(LinkedHashSet::new));

        List<Map<String, Object>> todaysAppointments = List.of();

        List<HealthAssessment> clientAssessments =
                clientIds.isEmpty()
                        ? List.of()
                        : healthAssessmentRepository.findByUserIdInOrderByAssessedAtDesc(clientIds);

        List<HealthAssessment> pendingAssessments =
                clientAssessments.stream().filter(this::isPendingMedicalAssessment).toList();

        List<HealthRiskAlert> activeAlertEntities =
                clientIds.isEmpty()
                        ? List.of()
                        : healthRiskAlertRepository.findByUserIdInAndActiveTrueOrderByDateRaisedDesc(clientIds).stream()
                                .filter(a -> !isResolvedAlertStatus(a.getStatus()))
                                .toList();

        List<Map<String, Object>> alertOverview =
                activeAlertEntities.stream().map(this::mapMedicalDashboardAlert).toList();

        List<Map<String, Object>> clientsRequiringReview = new ArrayList<>();
        for (HealthAssessment assessment : pendingAssessments) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", "crr-assess-" + assessment.getId());
            row.put("clientId", firstNonBlank(assessment.getClientCode(), "BF-C" + assessment.getUserId()));
            row.put("client", clientDisplayName(assessment.getUserId()));
            row.put("reason", "Assessment pending review");
            row.put(
                    "detail",
                    firstNonBlank(assessment.getTitle(), assessment.getAssessmentType(), "Health assessment"));
            row.put("actionTo", "assessment");
            row.put("actionId", String.valueOf(assessment.getId()));
            clientsRequiringReview.add(row);
        }
        for (HealthRiskAlert alert : activeAlertEntities) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", "crr-alert-" + alert.getId());
            row.put("clientId", firstNonBlank(alert.getClientCode(), "BF-C" + alert.getUserId()));
            row.put("client", firstNonBlank(alert.getClientName(), clientDisplayName(alert.getUserId())));
            row.put("reason", "Active health alert");
            row.put("detail", firstNonBlank(alert.getTitle(), alert.getReason(), "Health alert"));
            row.put("actionTo", "alert");
            row.put("actionId", String.valueOf(alert.getId()));
            clientsRequiringReview.add(row);
        }

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("greetingName", user.getFirstName());
        m.put(
                "stats",
                Map.of(
                        "clientsUnderReview",
                        Map.of("value", clientIds.size()),
                        "assessmentsPending",
                        Map.of("value", pendingAssessments.size()),
                        "activeAlerts",
                        Map.of("value", activeAlertEntities.size()),
                        "todaysAppointments",
                        Map.of("value", todaysAppointments.size())));
        m.put("todaysAppointments", todaysAppointments);
        m.put("clientsRequiringReview", clientsRequiringReview);
        m.put("alertOverview", alertOverview);
        m.put("assessmentTrend", buildMedicalAssessmentTrend(clientAssessments));
        m.put("recentActivity", buildMedicalRecentActivity(userId));
        return m;
    }

    private List<Map<String, Object>> buildMedicalAssessmentTrend(List<HealthAssessment> assessments) {
        if (assessments == null || assessments.isEmpty()) {
            return List.of();
        }
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        LinkedHashMap<Integer, int[]> byWeek = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate weekDate = today.minusWeeks(i);
            int weekNumber = weekDate.get(weekFields.weekOfWeekBasedYear());
            byWeek.putIfAbsent(weekNumber, new int[] {0, 0, 0});
        }
        for (HealthAssessment assessment : assessments) {
            if (assessment.getAssessedAt() == null) continue;
            LocalDate assessedOn = assessment.getAssessedAt().atZone(ZoneId.systemDefault()).toLocalDate();
            int weekNumber = assessedOn.get(weekFields.weekOfWeekBasedYear());
            if (!byWeek.containsKey(weekNumber)) continue;
            int[] counts = byWeek.get(weekNumber);
            if (isPendingMedicalAssessment(assessment)) {
                counts[1] += 1;
            } else {
                counts[0] += 1;
            }
            if (Boolean.TRUE.equals(assessment.getFollowUpRequired())
                    || containsIgnoreCase(assessment.getStatus(), "follow")) {
                counts[2] += 1;
            }
        }
        List<Map<String, Object>> trend = new ArrayList<>();
        for (Map.Entry<Integer, int[]> entry : byWeek.entrySet()) {
            int[] counts = entry.getValue();
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("label", "Wk " + entry.getKey());
            point.put("completed", counts[0]);
            point.put("pending", counts[1]);
            point.put("followUp", counts[2]);
            trend.add(point);
        }
        boolean anyData = trend.stream().anyMatch(p ->
                ((Number) p.get("completed")).intValue()
                                + ((Number) p.get("pending")).intValue()
                                + ((Number) p.get("followUp")).intValue()
                        > 0);
        return anyData ? trend : List.of();
    }

    private List<Map<String, Object>> buildMedicalRecentActivity(Long advisorUserId) {
        List<AuditLog> logs = auditLogRepository.findByUserIdOrderByCreatedAtDesc(advisorUserId);
        if (logs == null || logs.isEmpty()) {
            return List.of();
        }
        return logs.stream()
                .filter(this::isMedicalAuditAction)
                .limit(8)
                .map(
                        log -> {
                            Map<String, Object> row = new LinkedHashMap<>();
                            row.put("id", "audit-" + log.getId());
                            row.put(
                                    "text",
                                    firstNonBlank(
                                            log.getDetails(),
                                            log.getAction()
                                                    + (log.getEntityType() == null
                                                            ? ""
                                                            : " · " + log.getEntityType())));
                            row.put(
                                    "at",
                                    log.getCreatedAt() == null ? Instant.now().toString() : log.getCreatedAt().toString());
                            return row;
                        })
                .toList();
    }

    private boolean isMedicalAuditAction(AuditLog log) {
        if (log == null || log.getAction() == null) return false;
        String action = log.getAction().toUpperCase(Locale.ROOT);
        return action.startsWith("MEDICAL_")
                || action.startsWith("RISK_ALERT_")
                || action.startsWith("HEALTH_")
                || action.startsWith("SAFETY_");
    }

    private Map<String, Object> mapMedicalDashboardAlert(HealthRiskAlert alert) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", String.valueOf(alert.getId()));
        m.put("client", firstNonBlank(alert.getClientName(), clientDisplayName(alert.getUserId())));
        m.put("clientId", firstNonBlank(alert.getClientCode(), "BF-C" + alert.getUserId()));
        m.put("title", alert.getTitle());
        m.put("priority", alert.getPriority());
        m.put("status", alert.getStatus());
        m.put(
                "dateRaised",
                alert.getDateRaised() == null
                        ? null
                        : alert.getDateRaised().atZone(ZoneId.systemDefault()).toLocalDate().toString());
        return m;
    }

    private boolean isPendingMedicalAssessment(HealthAssessment assessment) {
        if (assessment == null) return false;
        if (Boolean.TRUE.equals(assessment.getFollowUpRequired())) return true;
        String status = assessment.getStatus();
        if (isBlank(status)) return true;
        if (containsIgnoreCase(status, "pending") || containsIgnoreCase(status, "follow")) return true;
        return !(equalsIgnoreCase(status, "Completed") || equalsIgnoreCase(status, "COMPLETED"));
    }

    private static boolean isResolvedAlertStatus(String status) {
        return equalsIgnoreCase(status, "Resolved") || equalsIgnoreCase(status, "Closed");
    }

    private static boolean isCancelledAppointmentStatus(String status) {
        if (status == null || status.isBlank()) return false;
        String normalized = status.trim().toLowerCase(Locale.ROOT);
        return normalized.equals("cancelled") || normalized.startsWith("cancelled ");
    }

    private String clientDisplayName(Long clientUserId) {
        if (clientUserId == null) return "Client";
        return userRepository
                .findById(clientUserId)
                .map(u -> (u.getFirstName() + " " + u.getLastName()).trim())
                .filter(n -> !n.isBlank())
                .orElse("Client");
    }

    private static boolean containsIgnoreCase(String value, String fragment) {
        return value != null && fragment != null && value.toLowerCase(Locale.ROOT).contains(fragment.toLowerCase(Locale.ROOT));
    }

    private static boolean equalsIgnoreCase(String a, String b) {
        return a != null && b != null && a.equalsIgnoreCase(b);
    }

    public Map<String, Object> supportDashboard(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<SupportTicketEntity> ticketEntities = supportTicketRepository.findAll();
        List<Map<String, Object>> tickets = ticketEntities.stream().map(mapper::ticketSummary).toList();
        long open = countTicketStatus(ticketEntities, TicketStatus.OPEN);
        long assigned = countTicketStatus(ticketEntities, TicketStatus.ASSIGNED);
        long inProgress = countTicketStatus(ticketEntities, TicketStatus.IN_PROGRESS);
        long pendingReply = countTicketStatus(ticketEntities, TicketStatus.PENDING_CLIENT_REPLY);
        long escalated = countTicketStatus(ticketEntities, TicketStatus.ESCALATED);
        long resolvedOnly = countTicketStatus(ticketEntities, TicketStatus.RESOLVED);
        long closed = countTicketStatus(ticketEntities, TicketStatus.CLOSED);
        Instant startOfToday = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant weekAgo = Instant.now().minus(Duration.ofDays(7));
        long resolvedToday =
                ticketEntities.stream()
                        .filter(ticket -> isResolvedOrClosed(ticket) && ticket.getUpdatedAt() != null)
                        .filter(ticket -> !ticket.getUpdatedAt().isBefore(startOfToday))
                        .count();
        long resolvedThisWeek =
                ticketEntities.stream()
                        .filter(ticket -> isResolvedOrClosed(ticket) && ticket.getUpdatedAt() != null)
                        .filter(ticket -> !ticket.getUpdatedAt().isBefore(weekAgo))
                        .count();
        long slaBreaches = ticketEntities.stream().filter(this::isSlaBreach).count();
        long averageWaitingMinutes = averageActiveWaitingMinutes(ticketEntities);

        List<Map<String, Object>> attention =
                tickets.stream()
                        .limit(5)
                        .map(
                                t -> {
                                    Map<String, Object> row = new LinkedHashMap<>();
                                    row.put("id", t.get("id"));
                                    row.put("subject", t.get("subject"));
                                    Object client = t.get("client");
                                    if (client instanceof Map<?, ?> clientMap) {
                                        row.put(
                                                "client",
                                                clientMap.get("name") != null
                                                        ? clientMap.get("name")
                                                        : t.get("clientName"));
                                    } else {
                                        row.put(
                                                "client",
                                                client != null ? client : t.get("clientName"));
                                    }
                                    row.put("clientId", t.get("clientId"));
                                    row.put("status", t.get("status"));
                                    row.put("priority", t.getOrDefault("priority", "Normal"));
                                    row.put("category", t.get("category"));
                                    row.put(
                                            "waitingTime",
                                            formatWaiting(t.get("waitingTimeMinutes")));
                                    row.put(
                                            "reason",
                                            t.get("priority")
                                                    + " · "
                                                    + t.getOrDefault("category", "Support")
                                                    + " · "
                                                    + t.get("status"));
                                    return row;
                                })
                        .toList();

        Map<String, Integer> categoryCounts = new LinkedHashMap<>();
        for (Map<String, Object> t : tickets) {
            String cat = String.valueOf(t.getOrDefault("category", "Other"));
            categoryCounts.merge(cat, 1, Integer::sum);
        }
        int categoryTotal = tickets.size();
        String[] colors = {"#005a40", "#00a67e", "#0d9488", "#14b8a6", "#64748b", "#94a3b8", "#cbd5e1"};
        List<Map<String, Object>> categoryBreakdown = new java.util.ArrayList<>();
        int colorIdx = 0;
        if (categoryTotal > 0) {
            for (Map.Entry<String, Integer> e : categoryCounts.entrySet()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("category", e.getKey());
                row.put("count", e.getValue());
                row.put("percentage", Math.round((e.getValue() * 100.0) / categoryTotal));
                row.put("color", colors[colorIdx % colors.length]);
                categoryBreakdown.add(row);
                colorIdx++;
            }
        }

        List<Map<String, Object>> statusOverview =
                List.of(
                        Map.of("status", "Open", "count", open, "color", "#f59e0b", "hint", "Requires triage"),
                        Map.of("status", "Assigned", "count", assigned, "color", "#0284c7", "hint", "Owned by an officer"),
                        Map.of("status", "In Progress", "count", inProgress, "color", "#0d9488", "hint", "Being worked on"),
                        Map.of(
                                "status",
                                "Pending Client Reply",
                                "count",
                                pendingReply,
                                "color",
                                "#f59e0b",
                                "hint",
                                "Client action needed"),
                        Map.of("status", "Escalated", "count", escalated, "color", "#7c3aed", "hint", "With a specialist"),
                        Map.of("status", "Resolved", "count", resolvedOnly, "color", "#005a40", "hint", "Handled successfully"),
                        Map.of("status", "Closed", "count", closed, "color", "#64748b", "hint", "Finished"));

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("openTickets", Map.of("value", open, "hint", "Awaiting action"));
        stats.put("assigned", Map.of("value", assigned, "hint", "Assigned to an officer"));
        stats.put("inProgress", Map.of("value", inProgress, "hint", "Currently being handled"));
        stats.put("resolvedToday", Map.of("value", resolvedToday, "hint", "Resolved or closed today"));
        stats.put("pendingReply", Map.of("value", pendingReply, "hint", "Awaiting the client"));
        stats.put("escalated", Map.of("value", escalated, "hint", "Waiting on a specialist"));
        stats.put("closed", Map.of("value", closed, "hint", "Closed tickets"));
        stats.put("slaBreaches", Map.of("value", slaBreaches, "hint", "Past the waiting target"));

        List<Map<String, Object>> recentActivity = new ArrayList<>();
        ticketEntities.stream()
                .sorted(Comparator.comparing(SupportTicketEntity::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .forEach(
                        ticket -> {
                            Map<String, Object> row = new LinkedHashMap<>();
                            row.put("id", ticket.getId());
                            row.put("text", ticket.getStatus() + " · " + ticket.getSubject());
                            row.put("at", ticket.getUpdatedAt() == null ? null : ticket.getUpdatedAt().toString());
                            recentActivity.add(row);
                        });

        Map<String, Object> performance = new LinkedHashMap<>();
        performance.put("resolvedThisWeek", resolvedThisWeek);
        performance.put("avgWaitingMinutes", averageWaitingMinutes);
        performance.put("slaBreaches", slaBreaches);
        performance.put("slaCompliancePercentage", slaCompliance(ticketEntities, slaBreaches));

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("officerName", user.getFirstName());
        m.put("stats", stats);
        m.put("attentionTickets", attention);
        m.put("recentInquiries", List.of());
        m.put("categoryBreakdown", categoryBreakdown);
        m.put("statusOverview", statusOverview);
        m.put("recentActivity", recentActivity);
        m.put("recentFeedback", List.of());
        m.put("performance", performance);
        return m;
    }

    private static String formatWaiting(Object minutes) {
        long value = 0;
        if (minutes instanceof Number number) {
            value = number.longValue();
        }
        if (value < 60) {
            return value + " min";
        }
        return (value / 60) + " h " + (value % 60) + " min";
    }

    private long countTicketStatus(List<SupportTicketEntity> tickets, TicketStatus status) {
        return tickets.stream().filter(ticket -> status.label().equalsIgnoreCase(ticket.getStatus())).count();
    }

    private boolean isResolvedOrClosed(SupportTicketEntity ticket) {
        return TicketStatus.RESOLVED.label().equalsIgnoreCase(ticket.getStatus())
                || TicketStatus.CLOSED.label().equalsIgnoreCase(ticket.getStatus());
    }

    private boolean isSlaBreach(SupportTicketEntity ticket) {
        if (isResolvedOrClosed(ticket)) {
            return false;
        }
        String waitingOn = ticket.getWaitingOn() == null ? "" : ticket.getWaitingOn();
        if (!waitingOn.equalsIgnoreCase("Support") && !waitingOn.equalsIgnoreCase("Specialist")) {
            return false;
        }
        Instant since = ticket.getWaitingSince() != null ? ticket.getWaitingSince() : ticket.getCreatedAt();
        if (since == null) {
            return false;
        }
        long minutes = Duration.between(since, Instant.now()).toMinutes();
        String priority = ticket.getPriority() == null ? "" : ticket.getPriority();
        long limit = priority.equalsIgnoreCase("High") || priority.equalsIgnoreCase("Urgent") ? 240 : 1440;
        return minutes > limit;
    }

    private long averageActiveWaitingMinutes(List<SupportTicketEntity> tickets) {
        List<Long> minutes =
                tickets.stream()
                        .filter(ticket -> !isResolvedOrClosed(ticket))
                        .map(
                                ticket -> {
                                    Instant since =
                                            ticket.getWaitingSince() != null
                                                    ? ticket.getWaitingSince()
                                                    : ticket.getCreatedAt();
                                    if (since == null) {
                                        return 0L;
                                    }
                                    return Math.max(0, Duration.between(since, Instant.now()).toMinutes());
                                })
                        .toList();
        if (minutes.isEmpty()) {
            return 0;
        }
        long total = 0;
        for (Long value : minutes) {
            total += value;
        }
        return total / minutes.size();
    }

    private Long slaCompliance(List<SupportTicketEntity> tickets, long breaches) {
        long active =
                tickets.stream()
                        .filter(ticket -> !isResolvedOrClosed(ticket))
                        .filter(
                                ticket -> {
                                    String waitingOn = ticket.getWaitingOn() == null ? "" : ticket.getWaitingOn();
                                    return waitingOn.equalsIgnoreCase("Support")
                                            || waitingOn.equalsIgnoreCase("Specialist");
                                })
                        .count();
        if (active == 0) {
            return null;
        }
        return Math.round(100.0 * (active - breaches) / active);
    }

    public Map<String, Object> adminOverview() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put(
                "stats",
                Map.of(
                        "users", userRepository.count(),
                        "programmes", programmeRepository.count(),
                        "subscriptions", subscriptionRepository.count(),
                        "payments", paymentRepository.count()));
        m.put(
                "users",
                userRepository.findAll().stream()
                        .map(
                                u ->
                                        Map.of(
                                                "id",
                                                u.getId(),
                                                "email",
                                                u.getEmail(),
                                                "name",
                                                u.getFirstName() + " " + u.getLastName(),
                                                "status",
                                                u.getStatus() == null ? "ACTIVE" : u.getStatus().name()))
                        .toList());
        m.put(
                "payments",
                paymentRepository.findAll().stream()
                        .map(
                                p ->
                                        Map.of(
                                                "id",
                                                p.getId(),
                                                "amount",
                                                p.getAmount(),
                                                "currency",
                                                p.getCurrency(),
                                                "status",
                                                p.getStatus(),
                                                "description",
                                                nullTo(p.getDescription(), "")))
                        .toList());
        m.put(
                "subscriptions",
                subscriptionRepository.findAll().stream()
                        .map(
                                s ->
                                        Map.of(
                                                "id",
                                                s.getId(),
                                                "planName",
                                                s.getPlanName(),
                                                "status",
                                                s.getStatus(),
                                                "priceLabel",
                                                nullTo(s.getPriceLabel(), "")))
                        .toList());
        return m;
    }

    public List<Map<String, Object>> coachClients() {
        return enrolmentRepository.findAll().stream()
                .map(
                        e -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", e.getClientId());
                            m.put("name", e.getClientName());
                            m.put("age", 32);
                            m.put(
                                    "programme",
                                    programmeRepository
                                            .findById(e.getProgrammeId())
                                            .map(WellnessProgramme::getName)
                                            .orElse("Programme"));
                            WorkoutPlanEntity plan =
                                    workoutPlanRepository.findByClientUserId(e.getClientUserId()).stream()
                                            .findFirst()
                                            .orElse(null);
                            m.put("workoutPlanId", plan == null ? null : plan.getId());
                            m.put("workoutPlan", plan == null ? "â€”" : plan.getName());
                            m.put("planProgress", plan == null || plan.getProgress() == null ? e.getProgress() : plan.getProgress());
                            m.put("lastAssessment", "2026-08-28");
                            m.put("nextSession", "2026-09-12");
                            m.put("status", e.getStatus());
                            m.put("planStatus", plan == null ? "None" : plan.getStatus());
                            m.put("assessmentStatus", "Current");
                            m.put("progressStatus", "On track");
                            m.put("goals", List.of("Steady energy", "Consistent movement"));
                            m.put("safety", Map.of("notes", "No high-risk flags"));
                            m.put("currentPlan", plan == null ? Map.of() : mapper.workoutPlanListItem(plan));
                            m.put("progressMetrics", List.of(Map.of("label", "Completion", "value", e.getProgress() == null ? 0 : e.getProgress())));
                            return m;
                        })
                .toList();
    }

    public List<Map<String, Object>> nutritionClients() {
        return enrolmentRepository.findAll().stream()
                .map(
                        e -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", e.getClientId());
                            m.put("name", e.getClientName());
                            m.put(
                                    "programme",
                                    programmeRepository
                                            .findById(e.getProgrammeId())
                                            .map(WellnessProgramme::getName)
                                            .orElse(""));
                            MealPlanEntity plan =
                                    mealPlanRepository.findByClientUserId(e.getClientUserId()).stream()
                                            .findFirst()
                                            .orElse(null);
                            List<DietaryRestrictionEntity> restrictions =
                                    e.getClientUserId() == null
                                            ? List.of()
                                            : dietaryRestrictionRepository.findByClientUserId(e.getClientUserId());
                            long activeRestrictions =
                                    restrictions.stream()
                                            .filter(
                                                    d ->
                                                            d.getStatus() == null
                                                                    || "Active".equalsIgnoreCase(d.getStatus())
                                                                    || "Under Review"
                                                                            .equalsIgnoreCase(d.getStatus()))
                                            .count();
                            boolean reviewDue =
                                    plan != null
                                            && ("Review Due".equalsIgnoreCase(plan.getStatus())
                                                    || "Draft".equalsIgnoreCase(plan.getStatus()));
                            m.put("mealPlanId", plan == null ? null : plan.getId());
                            m.put("mealPlan", plan == null ? "" : plan.getName());
                            m.put("planStatus", plan == null ? "None" : plan.getStatus());
                            m.put(
                                    "dietaryStatus",
                                    activeRestrictions == 0
                                            ? "None"
                                            : restrictions.stream()
                                                            .anyMatch(
                                                                    d ->
                                                                            "Under Review"
                                                                                    .equalsIgnoreCase(
                                                                                            d.getStatus()))
                                                    ? "Under Review"
                                                    : "Active");
                            m.put("reviewStatus", reviewDue ? "Review Due" : "Current");
                            m.put(
                                    "lastReview",
                                    plan == null || plan.getUpdatedAt() == null
                                            ? null
                                            : plan.getUpdatedAt().toString());
                            m.put("nextConsultation", null);
                            m.put("status", e.getStatus());
                            m.put("goals", List.of());
                            m.put("preferences", List.of());
                            m.put("mealPattern", "");
                            m.put("guidance", "");
                            m.put("reviewRequired", activeRestrictions > 0 && reviewDue);
                            m.put("consultations", List.of());
                            m.put("currentPlan", plan == null ? null : mapper.mealPlanListItem(plan));
                            m.put(
                                    "progressMetrics",
                                    List.of(
                                            Map.of(
                                                    "label",
                                                    "Participation",
                                                    "value",
                                                    plan == null || plan.getProgress() == null
                                                            ? 0
                                                            : plan.getProgress())));
                            return m;
                        })
                .toList();
    }

    public List<Map<String, Object>> progressRows() {
        return workoutPlanRepository.findAll().stream()
                .map(
                        p -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("clientId", p.getClientId());
                            m.put("clientName", p.getClientName());
                            m.put("workoutPlan", p.getName());
                            m.put("currentWeek", p.getCurrentWeek());
                            m.put("completion", p.getProgress());
                            m.put("attendance", Math.min(100, (p.getProgress() == null ? 0 : p.getProgress()) + 5));
                            m.put("lastUpdate", p.getUpdatedAt() == null ? null : p.getUpdatedAt().toString());
                            m.put("status", "On track");
                            m.put("weeklyCompletion", List.of(Map.of("label", "W1", "value", 40), Map.of("label", "W2", "value", 55), Map.of("label", "W3", "value", p.getProgress())));
                            m.put("attendanceTrend", List.of(Map.of("label", "W1", "value", 70), Map.of("label", "W2", "value", 80)));
                            return m;
                        })
                .toList();
    }

    public List<Map<String, Object>> nutritionProgressRows() {
        return mealPlanRepository.findAll().stream()
                .map(
                        p -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("clientId", p.getClientId());
                            m.put("clientName", p.getClientName());
                            m.put("mealPlan", p.getName());
                            m.put("mealPlanId", p.getId());
                            m.put("currentWeek", p.getCurrentWeek());
                            m.put("participation", p.getProgress() == null ? 0 : p.getProgress());
                            m.put(
                                    "lastUpdate",
                                    p.getUpdatedAt() == null ? null : p.getUpdatedAt().toString());
                            m.put("lastConsultation", null);
                            m.put("nextReview", p.getEndDate() == null ? null : p.getEndDate().toString());
                            m.put("status", p.getStatus() == null ? "" : p.getStatus());
                            m.put("weeklyParticipation", List.of());
                            return m;
                        })
                .toList();
    }

    private void applyProgramme(WellnessProgramme p, Map<String, Object> payload) {
        if (payload.get("name") != null) p.setName(str(payload.get("name")));
        if (payload.get("title") != null) p.setName(str(payload.get("title")));
        if (payload.get("type") != null) p.setType(str(payload.get("type")));
        if (payload.get("description") != null) p.setDescription(str(payload.get("description")));
        if (payload.get("startDate") != null) p.setStartDate(LocalDate.parse(str(payload.get("startDate"))));
        if (payload.get("endDate") != null) p.setEndDate(LocalDate.parse(str(payload.get("endDate"))));
        if (payload.get("durationWeeks") != null) p.setDurationWeeks(asInt(payload.get("durationWeeks"), 12));
        if (payload.get("capacity") != null) p.setCapacity(asInt(payload.get("capacity"), 20));
        if (payload.get("coachName") != null) p.setCoachName(str(payload.get("coachName")));
        if (payload.get("nutritionName") != null) p.setNutritionName(str(payload.get("nutritionName")));
        if (payload.get("medicalName") != null) p.setMedicalName(str(payload.get("medicalName")));
        if (payload.get("goals") != null) p.setGoals(str(payload.get("goals")));
        if (payload.get("includedServices") != null) p.setIncludedServices(str(payload.get("includedServices")));
        if (payload.get("notes") != null) p.setNotes(str(payload.get("notes")));
    }

    private Map<String, Object> scheduleEvent(StaffScheduleEntity s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("date", s.getScheduleDate() == null ? null : s.getScheduleDate().toString());
        m.put("startTime", s.getStartTime());
        m.put("endTime", s.getEndTime());
        m.put("staffId", s.getStaffId());
        m.put("staffName", s.getStaffName());
        m.put("role", s.getRoleLabel());
        m.put("service", s.getServiceLabel());
        m.put("client", s.getClientName());
        m.put("programme", s.getProgramme());
        m.put("status", s.getStatus());
        m.put("notes", s.getNotes());
        return m;
    }

    private int countUpcoming(Long userId) {
        return (int)
                appointmentRepository.findByClientUserIdOrderByAppointmentDateAsc(userId).stream()
                        .filter(a -> "Upcoming".equalsIgnoreCase(a.getStatus()))
                        .count();
    }

    private static void assertAppointmentDateNotPast(LocalDate date) {
        LocalDate today = LocalDate.now(java.time.ZoneId.systemDefault());
        if (date.isBefore(today)) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "Appointment date cannot be in the past.",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void writeAudit(
            Long userId, String action, String entityType, String entityId, String details) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setResultStatus("SUCCESS");
        log.setDetails(details == null ? null : details.length() > 1000 ? details.substring(0, 1000) : details);
        auditLogRepository.save(log);
    }

    private Long resolveLinkedClientUserId(Map<String, Object> payload) {
        Long fromPayload = asLong(payload.get("clientUserId"));
        if (fromPayload != null && userRepository.existsById(fromPayload)) {
            return fromPayload;
        }
        String clientId = str(payload.get("clientId"));
        if (!isBlank(clientId)) {
            String digits = clientId.replaceAll("\\D+", "");
            Long fromCode = asLong(digits);
            if (fromCode != null && userRepository.existsById(fromCode)) {
                return fromCode;
            }
        }
        return null;
    }

    private static void assertUnusedDraftPlan(
            String status, Long clientUserId, String clientId, String clientName, Integer progress) {
        if (status == null || !status.equalsIgnoreCase("Draft")) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "Only unused Draft plans can be permanently deleted. Archive assigned or used plans instead.",
                    HttpStatus.BAD_REQUEST);
        }
        boolean assigned = clientUserId != null || !isBlank(clientId);
        if (assigned) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "This plan is assigned to a client and cannot be permanently deleted. Archive it instead.",
                    HttpStatus.BAD_REQUEST);
        }
        if (progress != null && progress > 0) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "This plan has progress history and cannot be permanently deleted.",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void createNotification(
            Long userId, String audience, String type, String title, String body, String link) {
        NotificationEntity n = new NotificationEntity();
        n.setId("ntf-" + UUID.randomUUID().toString().substring(0, 8));
        n.setUserId(userId);
        n.setAudience(audience);
        n.setType(type);
        n.setTitle(title);
        n.setBody(body);
        n.setLink(link);
        n.setReadFlag(false);
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }

    @SuppressWarnings("unchecked")
    private void appendTicketActivity(SupportTicketEntity t, String text) {
        List<Object> activity =
                new ArrayList<>((List<Object>) mapper.parseJson(t.getActivityJson(), new ArrayList<>()));
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("id", "act-" + (activity.size() + 1));
        entry.put("text", text);
        entry.put("at", Instant.now().toString());
        activity.add(entry);
        t.setActivityJson(mapper.toJson(activity));
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private static boolean isBlank(String v) {
        return v == null || v.isBlank();
    }

    private static String nullTo(String v, String fallback) {
        return v == null || v.isBlank() ? fallback : v;
    }

    private static String firstNonBlank(String... values) {
        if (values == null) return null;
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }
        return null;
    }

    private boolean isMedicalAdvisorUser(Long userId) {
        if (userId == null) return false;
        return userRepository
                .findById(userId)
                .map(
                        u ->
                                u.getRoles() != null
                                        && u.getRoles().stream()
                                                .anyMatch(r -> r.getName() == RoleName.MEDICAL_ADVISOR))
                .orElse(false);
    }

    /**
     * Medical Advisors no longer manage appointments, so this reminder is not sent.
     * Coach, nutrition, support, and client appointment flows are unchanged.
     */
    @Transactional
    public int sendTodayMedicalAppointmentReminders() {
        return 0;
    }

    private static boolean isEligibleForTodayReminder(Appointment a) {
        if (a == null) return false;
        if ("ADVISOR_UNAVAILABLE".equalsIgnoreCase(a.getAttendance())) return false;
        if ("ATTENDED".equalsIgnoreCase(a.getAttendance())) return false;
        String status = a.getStatus() == null ? "" : a.getStatus().trim();
        if (status.equalsIgnoreCase("Completed")) return false;
        if (status.equalsIgnoreCase("Cancelled")
                || status.toLowerCase(Locale.ROOT).startsWith("cancelled ")) {
            return false;
        }
        return status.equalsIgnoreCase("Upcoming") || status.equalsIgnoreCase("Confirmed");
    }

    private static int asInt(Object o, int fallback) {
        if (o == null) return fallback;
        if (o instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(String.valueOf(o));
        } catch (Exception e) {
            return fallback;
        }
    }

    private static Long asLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue();
        try {
            return Long.parseLong(String.valueOf(o));
        } catch (Exception e) {
            return null;
        }
    }
}
