package com.biofit.backend.domain;

import com.biofit.backend.common.ApiException;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
    private final WorkoutPlanRepository workoutPlanRepository;
    private final MealPlanRepository mealPlanRepository;
    private final DietaryRestrictionRepository dietaryRestrictionRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final NotificationRepository notificationRepository;
    private final ExerciseRepository exerciseRepository;
    private final StaffScheduleRepository staffScheduleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final DomainMapper mapper;

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
        Appointment a = new Appointment();
        a.setId("apt-" + UUID.randomUUID().toString().substring(0, 8));
        a.setClientUserId(userId);
        a.setClientId("BF-C" + userId);
        a.setClientName(user.getFirstName() + " " + user.getLastName());
        a.setServiceType(str(payload.getOrDefault("service", payload.get("serviceType"))));
        a.setProfessional(str(payload.get("professional")));
        a.setProfessionalRole(str(payload.get("professionalRole")));
        a.setProgramme(str(payload.get("programme")));
        a.setAppointmentDate(LocalDate.parse(str(payload.get("date"))));
        a.setAppointmentTime(str(payload.get("time")));
        a.setDuration(str(payload.getOrDefault("duration", "45 min")));
        a.setStatus("Upcoming");
        a.setBookingReference("BF-APT-" + (10000 + (int) (Math.random() * 90000)));
        a.setNotes(str(payload.get("notes")));
        a.setLocation(str(payload.getOrDefault("location", "VitalLife Wellness Centre")));
        a.setAudience("CLIENT");
        appointmentRepository.save(a);
        return mapper.appointmentMap(a);
    }

    @Transactional
    public Map<String, Object> cancelClientAppointment(Long userId, String id) {
        Appointment a =
                appointmentRepository
                        .findByIdAndClientUserId(id, userId)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Appointment not found", HttpStatus.NOT_FOUND));
        a.setStatus("Cancelled");
        a.setUpdatedAt(Instant.now());
        appointmentRepository.save(a);
        return Map.of("id", id, "status", "Cancelled");
    }

    public Map<String, Object> clientWorkoutPlan(Long userId) {
        WorkoutPlanEntity plan =
                workoutPlanRepository
                        .findFirstByClientUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(userId, "Active")
                        .or(() -> workoutPlanRepository.findByClientUserId(userId).stream().findFirst())
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Workout plan not found", HttpStatus.NOT_FOUND));
        Map<String, Object> m = mapper.workoutPlanListItem(plan);
        m.put("coach", "Daniel Perera");
        m.put("weekLabel", plan.getCurrentWeek());
        m.put("completionPercent", plan.getProgress());
        Object parsed = mapper.parseJson(plan.getPlanJson(), Map.of());
        if (parsed instanceof Map<?, ?> map) {
            Object days = map.get("days");
            m.put("days", days != null ? days : List.of());
        }
        return m;
    }

    public Map<String, Object> clientFitnessProgress(Long userId) {
        WorkoutPlanEntity plan =
                workoutPlanRepository
                        .findFirstByClientUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(userId, "Active")
                        .orElse(null);
        int progress = plan != null && plan.getProgress() != null ? plan.getProgress() : 70;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("participation", progress);
        m.put("completedSessions", Math.round(progress * 0.32));
        m.put("plannedSessions", 32);
        m.put("programmeProgress", progress);
        m.put(
                "monthly",
                List.of(
                        Map.of("label", "May", "value", 55),
                        Map.of("label", "Jun", "value", 62),
                        Map.of("label", "Jul", "value", 70),
                        Map.of("label", "Aug", "value", Math.max(60, progress - 4)),
                        Map.of("label", "Sep", "value", progress)));
        m.put(
                "assessments",
                List.of(
                        Map.of(
                                "id",
                                "fa-1",
                                "date",
                                "2026-08-28",
                                "type",
                                "Movement comfort review",
                                "summary",
                                "Steady improvement in mobility and session consistency.")));
        return m;
    }

    public Map<String, Object> clientMealPlan(Long userId) {
        MealPlanEntity plan =
                mealPlanRepository
                        .findFirstByClientUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(userId, "Active")
                        .or(() -> mealPlanRepository.findByClientUserId(userId).stream().findFirst())
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Meal plan not found", HttpStatus.NOT_FOUND));
        return mapper.mealPlanListItem(plan);
    }

    public Map<String, Object> clientNutritionProgress(Long userId) {
        MealPlanEntity plan =
                mealPlanRepository
                        .findFirstByClientUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(userId, "Active")
                        .orElse(null);
        int progress = plan != null && plan.getProgress() != null ? plan.getProgress() : 80;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("participation", progress);
        m.put(
                "weeklyConsistency",
                List.of(
                        Map.of("label", "Mon", "value", 100),
                        Map.of("label", "Tue", "value", 100),
                        Map.of("label", "Wed", "value", 75),
                        Map.of("label", "Thu", "value", 100),
                        Map.of("label", "Fri", "value", 50),
                        Map.of("label", "Sat", "value", 75),
                        Map.of("label", "Sun", "value", 100)));
        m.put("planStatus", "On track");
        m.put(
                "reviews",
                List.of(
                        Map.of(
                                "id",
                                "nr-1",
                                "date",
                                "2026-09-02",
                                "title",
                                "Consultant check-in",
                                "note",
                                "Meal rhythm looks sustainable.")));
        m.put(
                "trends",
                List.of(
                        Map.of("label", "Meal-plan participation", "value", progress),
                        Map.of("label", "Hydration habit", "value", 72),
                        Map.of("label", "Evening meal timing", "value", 68)));
        return m;
    }

    public List<Map<String, Object>> clientNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(mapper::notificationMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> markNotificationRead(String id) {
        NotificationEntity n =
                notificationRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Notification not found", HttpStatus.NOT_FOUND));
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
                .map(mapper::ticketSummary)
                .toList();
    }

    public Map<String, Object> clientTicket(Long userId, String id) {
        return mapper.ticketSummary(
                supportTicketRepository
                        .findByIdAndClientUserId(id, userId)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Ticket not found", HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public Map<String, Object> createClientTicket(Long userId, Map<String, Object> payload) {
        User user = userRepository.findById(userId).orElseThrow();
        SupportTicketEntity t = new SupportTicketEntity();
        t.setId("tkt-" + UUID.randomUUID().toString().substring(0, 8));
        t.setClientUserId(userId);
        t.setClientId("BF-C" + userId);
        t.setClientName(user.getFirstName() + " " + user.getLastName());
        t.setSubject(str(payload.get("subject")));
        t.setCategory(str(payload.getOrDefault("category", "General")));
        t.setPriority(str(payload.getOrDefault("priority", "Medium")));
        t.setStatus("Open");
        t.setAssignedTo("Support Desk");
        t.setRelatedService(str(payload.getOrDefault("relatedService", "General")));
        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(
                Map.of(
                        "id",
                        "msg-1",
                        "from",
                        "client",
                        "author",
                        t.getClientName(),
                        "body",
                        str(payload.getOrDefault("message", payload.get("body"))),
                        "at",
                        Instant.now().toString()));
        t.setMessagesJson(mapper.toJson(messages));
        supportTicketRepository.save(t);
        return mapper.ticketSummary(t);
    }

    @Transactional
    public Map<String, Object> replyClientTicket(Long userId, String id, Map<String, Object> payload) {
        SupportTicketEntity t =
                supportTicketRepository
                        .findByIdAndClientUserId(id, userId)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Ticket not found", HttpStatus.NOT_FOUND));
        @SuppressWarnings("unchecked")
        List<Object> messages = new ArrayList<>((List<Object>) mapper.parseJson(t.getMessagesJson(), new ArrayList<>()));
        messages.add(
                Map.of(
                        "id",
                        "msg-" + (messages.size() + 1),
                        "from",
                        "client",
                        "author",
                        t.getClientName(),
                        "body",
                        str(payload.getOrDefault("message", payload.get("body"))),
                        "at",
                        Instant.now().toString()));
        t.setMessagesJson(mapper.toJson(messages));
        t.setUpdatedAt(Instant.now());
        supportTicketRepository.save(t);
        return mapper.ticketSummary(t);
    }

    public Map<String, Object> clientProfile(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", "BF-C" + userId);
        m.put("firstName", user.getFirstName());
        m.put("lastName", user.getLastName());
        m.put("email", user.getEmail());
        m.put("contactNumber", user.getContactNumber() != null ? user.getContactNumber() : "+94 77 000 0000");
        m.put("dateOfBirth", "1994-05-12");
        m.put("gender", "Prefer not to say");
        m.put("accountStatus", "Active");
        m.put(
                "emergencyContact",
                Map.of("name", "Emergency Contact", "relationship", "Family", "phone", "+94 77 111 1111"));
        return m;
    }

    @Transactional
    public Map<String, Object> updateClientProfile(Long userId, Map<String, Object> payload) {
        User user = userRepository.findById(userId).orElseThrow();
        if (payload.get("firstName") != null) user.setFirstName(str(payload.get("firstName")));
        if (payload.get("lastName") != null) user.setLastName(str(payload.get("lastName")));
        if (payload.get("contactNumber") != null) user.setContactNumber(str(payload.get("contactNumber")));
        userRepository.save(user);
        return clientProfile(userId);
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
        StaffScheduleEntity s = new StaffScheduleEntity();
        s.setId(str(payload.getOrDefault("id", "sch-" + UUID.randomUUID().toString().substring(0, 8))));
        s.setScheduleDate(LocalDate.parse(str(payload.get("date"))));
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

    @Transactional
    public Map<String, Object> markAudienceNotificationsRead(String audience) {
        List<NotificationEntity> list =
                notificationRepository.findByAudienceIgnoreCaseOrderByCreatedAtDesc(audience);
        list.forEach(n -> n.setReadFlag(true));
        notificationRepository.saveAll(list);
        return Map.of("updated", list.size());
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
        return mapper.workoutPlanListItem(p);
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
                                payload.getOrDefault("consultant", "Maya Fernando"))));
        p.setUpdatedAt(Instant.now());
        mealPlanRepository.save(p);
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
        return mapper.mealPlanListItem(p);
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
        return mapper.dietaryMap(d);
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

    public List<Map<String, Object>> allTickets() {
        return supportTicketRepository.findAll().stream().map(mapper::ticketSummary).toList();
    }

    public Map<String, Object> ticket(String id) {
        return mapper.ticketSummary(
                supportTicketRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Ticket not found", HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public Map<String, Object> updateTicket(String id, Map<String, Object> payload) {
        SupportTicketEntity t =
                supportTicketRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Ticket not found", HttpStatus.NOT_FOUND));
        if (payload.get("status") != null) t.setStatus(str(payload.get("status")));
        if (payload.get("priority") != null) t.setPriority(str(payload.get("priority")));
        if (payload.get("category") != null) t.setCategory(str(payload.get("category")));
        if (payload.get("assignedTo") != null) t.setAssignedTo(str(payload.get("assignedTo")));
        if (payload.get("message") != null || payload.get("body") != null) {
            @SuppressWarnings("unchecked")
            List<Object> messages =
                    new ArrayList<>((List<Object>) mapper.parseJson(t.getMessagesJson(), new ArrayList<>()));
            messages.add(
                    Map.of(
                            "id",
                            "msg-" + (messages.size() + 1),
                            "from",
                            "support",
                            "author",
                            str(payload.getOrDefault("author", "Support")),
                            "body",
                            str(payload.getOrDefault("message", payload.get("body"))),
                            "at",
                            Instant.now().toString()));
            t.setMessagesJson(mapper.toJson(messages));
        }
        t.setUpdatedAt(Instant.now());
        supportTicketRepository.save(t);
        return mapper.ticketSummary(t);
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
                        Map.of("value", Math.max(1, Math.min(5, (int) plans)), "hint", "Review soon")));
        m.put("todaysSchedule", schedule);
        m.put(
                "attention",
                List.of(
                        Map.of(
                                "id",
                                "att1",
                                "clientId",
                                "BF-C1024",
                                "client",
                                "Alex Morgan",
                                "reason",
                                "Fitness assessment due",
                                "due",
                                "Due this week"),
                        Map.of(
                                "id",
                                "att2",
                                "clientId",
                                "BF-C1088",
                                "client",
                                "Sahan De Silva",
                                "reason",
                                "Workout plan ending soon",
                                "due",
                                "Review progress")));
        m.put(
                "progressTrend",
                List.of(
                        Map.of("label", "Mon", "value", 72),
                        Map.of("label", "Tue", "value", 78),
                        Map.of("label", "Wed", "value", 70),
                        Map.of("label", "Thu", "value", 82),
                        Map.of("label", "Fri", "value", 76),
                        Map.of("label", "Sat", "value", 68),
                        Map.of("label", "Sun", "value", 64)));
        m.put("activePlans", plansList);
        m.put(
                "recentActivity",
                List.of(
                        Map.of(
                                "id",
                                "ra1",
                                "text",
                                "Client workout plan progress updated",
                                "at",
                                "Today"),
                        Map.of(
                                "id",
                                "ra2",
                                "text",
                                plans + " active workout plan(s) tracked",
                                "at",
                                "Just now"),
                        Map.of(
                                "id",
                                "ra3",
                                "text",
                                schedule.size() + " coach session(s) on the schedule",
                                "at",
                                "Today")));
        return m;
    }

    public Map<String, Object> nutritionDashboard(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        long mealPlans = mealPlanRepository.count();
        long restrictions = dietaryRestrictionRepository.count();
        long clients = enrolmentRepository.count();
        List<Map<String, Object>> appointments =
                appointmentsForRole("Nutrition").stream()
                        .limit(5)
                        .map(
                                a -> {
                                    Map<String, Object> row = new LinkedHashMap<>(a);
                                    row.putIfAbsent("type", a.getOrDefault("serviceType", a.get("service")));
                                    if (row.get("duration") == null) row.put("duration", "30 min");
                                    return row;
                                })
                        .toList();
        List<Map<String, Object>> plans = mealPlans();
        List<Map<String, Object>> mealPlanAttention =
                plans.stream()
                        .limit(3)
                        .map(
                                p -> {
                                    Map<String, Object> row = new LinkedHashMap<>();
                                    row.put("id", "att-" + p.get("id"));
                                    row.put("planId", p.get("id"));
                                    row.put("clientId", p.get("clientId"));
                                    row.put("client", p.getOrDefault("clientName", p.get("client")));
                                    row.put("reason", "Meal plan review due");
                                    row.put(
                                            "detail",
                                            p.get("currentWeek") != null
                                                    ? String.valueOf(p.get("currentWeek"))
                                                    : "Review meal alternatives");
                                    return row;
                                })
                        .toList();
        List<Map<String, Object>> dietaryUpdates =
                dietaryRestrictions().stream()
                        .limit(3)
                        .map(
                                d -> {
                                    Map<String, Object> row = new LinkedHashMap<>();
                                    row.put("id", d.get("id"));
                                    row.put("clientId", d.get("clientId"));
                                    row.put("client", d.getOrDefault("clientName", d.get("client")));
                                    row.put(
                                            "update",
                                            d.get("name") != null
                                                    ? d.get("name") + " recorded"
                                                    : "Dietary preference updated");
                                    row.put(
                                            "date",
                                            d.getOrDefault(
                                                    "lastReviewed",
                                                    d.getOrDefault("dateRecorded", "2026-09-08")));
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
                        "plansRequiringReview",
                        Map.of("value", Math.max(1, mealPlanAttention.size()), "hint", "Needs follow-up"),
                        "todaysAppointments",
                        Map.of("value", appointments.size(), "hint", "Scheduled today"),
                        "dietaryUpdates",
                        Map.of("value", restrictions, "hint", "Tracked restrictions")));
        m.put("todaysAppointments", appointments);
        m.put("mealPlanAttention", mealPlanAttention);
        m.put("dietaryUpdates", dietaryUpdates);
        m.put(
                "progressTrend",
                List.of(
                        Map.of("label", "Mon", "value", 78),
                        Map.of("label", "Tue", "value", 82),
                        Map.of("label", "Wed", "value", 74),
                        Map.of("label", "Thu", "value", 86),
                        Map.of("label", "Fri", "value", 80),
                        Map.of("label", "Sat", "value", 70),
                        Map.of("label", "Sun", "value", 68)));
        m.put(
                "recentActivity",
                List.of(
                        Map.of(
                                "id",
                                "ra1",
                                "text",
                                "Dietary restriction list reviewed",
                                "at",
                                "Today"),
                        Map.of(
                                "id",
                                "ra2",
                                "text",
                                mealPlans + " meal plan(s) currently active",
                                "at",
                                "Just now"),
                        Map.of(
                                "id",
                                "ra3",
                                "text",
                                appointments.size() + " nutrition appointment(s) on the schedule",
                                "at",
                                "Today")));
        return m;
    }

    public Map<String, Object> medicalDashboard(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        long clients = enrolmentRepository.count();
        List<Map<String, Object>> appointments =
                appointmentsForRole("Medical").stream()
                        .limit(5)
                        .map(
                                a -> {
                                    Map<String, Object> row = new LinkedHashMap<>(a);
                                    row.putIfAbsent("type", a.getOrDefault("serviceType", a.get("service")));
                                    if (row.get("duration") == null) row.put("duration", "30 min");
                                    return row;
                                })
                        .toList();

        List<Map<String, Object>> clientsRequiringReview =
                List.of(
                        Map.of(
                                "id",
                                "crr-1",
                                "clientId",
                                "BF-C1024",
                                "client",
                                "Alex Morgan",
                                "reason",
                                "Assessment pending review",
                                "detail",
                                "Routine wellness review needs sign-off",
                                "actionTo",
                                "assessment",
                                "actionId",
                                "ha-1"),
                        Map.of(
                                "id",
                                "crr-2",
                                "clientId",
                                "BF-C1102",
                                "client",
                                "Taylor Kim",
                                "reason",
                                "Active health alert",
                                "detail",
                                "Follow resting metrics guidance",
                                "actionTo",
                                "alert",
                                "actionId",
                                "alert-1"));

        List<Map<String, Object>> alertOverview =
                List.of(
                        Map.of(
                                "id",
                                "alert-1",
                                "client",
                                "Alex Morgan",
                                "clientId",
                                "BF-C1024",
                                "title",
                                "Follow resting metrics",
                                "priority",
                                "Moderate",
                                "status",
                                "Open",
                                "dateRaised",
                                "2026-09-05"),
                        Map.of(
                                "id",
                                "alert-2",
                                "client",
                                "Taylor Kim",
                                "clientId",
                                "BF-C1102",
                                "title",
                                "Joint comfort during activity",
                                "priority",
                                "Low",
                                "status",
                                "Under Review",
                                "dateRaised",
                                "2026-09-02"));

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("greetingName", user.getFirstName());
        m.put(
                "stats",
                Map.of(
                        "clientsUnderReview",
                        Map.of("value", Math.max(clients, clientsRequiringReview.size()), "hint", "Needs attention"),
                        "assessmentsPending",
                        Map.of("value", 2, "hint", "Pending review"),
                        "activeAlerts",
                        Map.of("value", alertOverview.size(), "hint", "Open alerts"),
                        "todaysAppointments",
                        Map.of("value", appointments.size(), "hint", "Scheduled today")));
        m.put("todaysAppointments", appointments);
        m.put("clientsRequiringReview", clientsRequiringReview);
        m.put("alertOverview", alertOverview);
        m.put(
                "assessmentTrend",
                List.of(
                        Map.of("label", "Wk 31", "completed", 4, "pending", 2, "followUp", 1),
                        Map.of("label", "Wk 32", "completed", 5, "pending", 3, "followUp", 1),
                        Map.of("label", "Wk 33", "completed", 6, "pending", 2, "followUp", 2),
                        Map.of("label", "Wk 34", "completed", 4, "pending", 4, "followUp", 1),
                        Map.of("label", "Wk 35", "completed", 7, "pending", 3, "followUp", 2),
                        Map.of("label", "Wk 36", "completed", 5, "pending", Math.max(1, (int) appointments.size()), "followUp", 2)));
        m.put(
                "recentActivity",
                List.of(
                        Map.of(
                                "id",
                                "ra1",
                                "text",
                                "Routine wellness assessment logged",
                                "at",
                                "Today"),
                        Map.of(
                                "id",
                                "ra2",
                                "text",
                                alertOverview.size() + " health alert(s) currently open",
                                "at",
                                "Just now"),
                        Map.of(
                                "id",
                                "ra3",
                                "text",
                                appointments.size() + " medical appointment(s) on the schedule",
                                "at",
                                "Today")));
        return m;
    }

    public Map<String, Object> supportDashboard(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<Map<String, Object>> tickets = allTickets();
        long open =
                tickets.stream()
                        .filter(t -> "Open".equalsIgnoreCase(String.valueOf(t.get("status"))))
                        .count();
        long inProgress =
                tickets.stream()
                        .filter(t -> {
                            String s = String.valueOf(t.get("status"));
                            return s.equalsIgnoreCase("In Progress") || s.equalsIgnoreCase("Assigned");
                        })
                        .count();
        long pendingReply =
                tickets.stream()
                        .filter(t -> String.valueOf(t.get("status")).toLowerCase().contains("pending"))
                        .count();
        long resolved =
                tickets.stream()
                        .filter(t -> {
                            String s = String.valueOf(t.get("status"));
                            return s.equalsIgnoreCase("Resolved") || s.equalsIgnoreCase("Closed");
                        })
                        .count();

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
                                            "Open".equalsIgnoreCase(String.valueOf(t.get("status")))
                                                    ? "Awaiting triage"
                                                    : "In queue");
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
        int categoryTotal = Math.max(1, tickets.size());
        String[] colors = {"#005a40", "#00a67e", "#0d9488", "#14b8a6", "#64748b", "#94a3b8", "#cbd5e1"};
        List<Map<String, Object>> categoryBreakdown = new java.util.ArrayList<>();
        int colorIdx = 0;
        for (Map.Entry<String, Integer> e : categoryCounts.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("category", e.getKey());
            row.put("count", e.getValue());
            row.put("percentage", Math.round((e.getValue() * 100.0) / categoryTotal));
            row.put("color", colors[colorIdx % colors.length]);
            categoryBreakdown.add(row);
            colorIdx++;
        }
        if (categoryBreakdown.isEmpty()) {
            categoryBreakdown.add(
                    Map.of("category", "General Support", "count", 1, "percentage", 100, "color", "#005a40"));
        }

        List<Map<String, Object>> statusOverview =
                List.of(
                        Map.of("status", "Open", "count", open, "color", "#f59e0b", "hint", "Requires triage"),
                        Map.of(
                                "status",
                                "In Progress",
                                "count",
                                Math.max(inProgress, 0),
                                "color",
                                "#0d9488",
                                "hint",
                                "Being worked on"),
                        Map.of(
                                "status",
                                "Pending Client Reply",
                                "count",
                                pendingReply,
                                "color",
                                "#f59e0b",
                                "hint",
                                "Client action needed"),
                        Map.of(
                                "status",
                                "Resolved",
                                "count",
                                resolved,
                                "color",
                                "#005a40",
                                "hint",
                                "Handled successfully"));

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("officerName", user.getFirstName());
        m.put(
                "stats",
                Map.of(
                        "openTickets",
                        Map.of("value", open, "hint", "Awaiting action"),
                        "inProgress",
                        Map.of("value", Math.max(inProgress, tickets.isEmpty() ? 0 : 1), "hint", "Currently being handled"),
                        "resolvedToday",
                        Map.of("value", Math.max(resolved, 1), "hint", "Successfully completed"),
                        "pendingReply",
                        Map.of("value", pendingReply, "hint", "Awaiting response")));
        m.put("attentionTickets", attention);
        m.put("recentInquiries", List.of());
        m.put("categoryBreakdown", categoryBreakdown);
        m.put("statusOverview", statusOverview);
        m.put(
                "recentActivity",
                List.of(
                        Map.of(
                                "id",
                                "act-1",
                                "text",
                                open + " open ticket(s) in the support queue",
                                "at",
                                "Just now"),
                        Map.of(
                                "id",
                                "act-2",
                                "text",
                                "Support dashboard refreshed for " + user.getFirstName(),
                                "at",
                                "Today"),
                        Map.of(
                                "id",
                                "act-3",
                                "text",
                                tickets.size() + " ticket(s) tracked overall",
                                "at",
                                "Today")));
        m.put("recentFeedback", List.of());
        m.put(
                "performance",
                Map.of(
                        "resolvedThisWeek",
                        Math.max(resolved, tickets.size()),
                        "avgFirstResponseMinutes",
                        14,
                        "avgResolutionHours",
                        3.4,
                        "positiveFeedbackPercentage",
                        98,
                        "slaCompliancePercentage",
                        96));
        return m;
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
                                            .orElse("Programme"));
                            MealPlanEntity plan =
                                    mealPlanRepository.findByClientUserId(e.getClientUserId()).stream()
                                            .findFirst()
                                            .orElse(null);
                            m.put("mealPlanId", plan == null ? null : plan.getId());
                            m.put("mealPlan", plan == null ? "â€”" : plan.getName());
                            m.put("planStatus", plan == null ? "None" : plan.getStatus());
                            m.put("dietaryStatus", "Reviewed");
                            m.put("reviewStatus", "Current");
                            m.put("lastReview", "2026-09-02");
                            m.put("nextConsultation", "2026-09-18");
                            m.put("status", e.getStatus());
                            m.put("goals", List.of("Balanced meals", "Hydration"));
                            m.put("preferences", List.of("Warm breakfasts"));
                            m.put("currentPlan", plan == null ? Map.of() : mapper.mealPlanListItem(plan));
                            m.put("progressMetrics", List.of(Map.of("label", "Participation", "value", plan == null || plan.getProgress() == null ? 0 : plan.getProgress())));
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
                            m.put("participation", p.getProgress());
                            m.put("lastUpdate", p.getUpdatedAt() == null ? null : p.getUpdatedAt().toString());
                            m.put("lastConsultation", "2026-09-02");
                            m.put("nextReview", "2026-09-18");
                            m.put("status", "On track");
                            m.put(
                                    "weeklyParticipation",
                                    List.of(
                                            Map.of("label", "Mon", "value", 100),
                                            Map.of("label", "Wed", "value", 75),
                                            Map.of("label", "Fri", "value", p.getProgress())));
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

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private static String nullTo(String v, String fallback) {
        return v == null || v.isBlank() ? fallback : v;
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
}
