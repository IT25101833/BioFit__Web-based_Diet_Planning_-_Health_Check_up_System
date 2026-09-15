package com.biofit.backend.domain;

import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DomainSeedService {

    private final UserRepository userRepository;
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
    private final DomainMapper mapper;
    private final CompletionService completionService;

    @Transactional
    public void seedIfEmpty() {
        User client =
                userRepository
                        .findByEmailIgnoreCaseAndDeletedAtIsNull("client@biofit.demo")
                        .orElse(null);
        if (client == null) {
            return;
        }
        Long clientId = client.getId();
        String clientCode = "BF-C" + clientId;
        String clientName = client.getFullName();

        if (programmeRepository.count() == 0) {
            seedCoreDomain(clientId, clientCode, clientName);
        }
        completionService.seedExtrasIfEmpty(clientId, clientCode, clientName);
    }

    private void seedCoreDomain(Long clientId, String clientCode, String clientName) {
        WellnessProgramme wm = programme("prog-wm-2026", "Weight Management Programme", "Lifestyle Wellness",
                "Balanced 12-week plan combining gentle movement, nourishing meals, and wellness check-ins.",
                "Active", LocalDate.of(2026, 7, 1), LocalDate.of(2026, 9, 30), 12, 24, 18,
                "Daniel Perera", "Maya Fernando", "Elena Costa", 78);
        WellnessProgramme energy = programme("prog-energy-2026", "Energy & Recovery Reset", "Recovery Focus",
                "Sleep quality, mobility, and steady energy through the day.",
                "Active", LocalDate.of(2026, 8, 15), LocalDate.of(2026, 10, 15), 8, 16, 10,
                "Daniel Perera", "Maya Fernando", "Elena Costa", 42);
        WellnessProgramme starter = programme("prog-starter-2025", "Wellness Starter Pathway", "Foundations",
                "Introductory pathway covering movement basics, meal rhythm, and health awareness.",
                "Completed", LocalDate.of(2026, 1, 10), LocalDate.of(2026, 4, 10), 12, 20, 20,
                "Daniel Perera", "Maya Fernando", "Elena Costa", 100);
        programmeRepository.saveAll(List.of(wm, energy, starter));

        ProgrammeEnrolment e1 = enrolment("enr-1", wm.getId(), clientId, clientCode, clientName, LocalDate.of(2026, 7, 1), "Active", 78);
        ProgrammeEnrolment e2 = enrolment("enr-2", energy.getId(), clientId, clientCode, clientName, LocalDate.of(2026, 8, 15), "Active", 42);
        enrolmentRepository.saveAll(List.of(e1, e2));

        appointmentRepository.saveAll(List.of(
                appointment("apt-1", clientId, clientCode, clientName, "Fitness Consultation", "Daniel Perera", "Fitness Coach",
                        wm.getName(), LocalDate.of(2026, 9, 12), "10:00 AM", "Upcoming"),
                appointment("apt-2", clientId, clientCode, clientName, "Nutrition Consultation", "Maya Fernando", "Nutrition Consultant",
                        wm.getName(), LocalDate.of(2026, 9, 18), "2:30 PM", "Upcoming"),
                appointment("apt-3", clientId, clientCode, clientName, "Health Check-up", "Elena Costa", "Medical Advisor",
                        wm.getName(), LocalDate.of(2026, 8, 20), "9:15 AM", "Completed")));

        String workoutJson = mapper.toJson(Map.of(
                "days", List.of(
                        Map.of("id", "mon", "day", "Monday", "focus", "Mobility & breath", "completed", true,
                                "exercises", List.of(
                                        Map.of("name", "Gentle joint mobility", "detail", "10 min", "completed", true),
                                        Map.of("name", "Breathing reset", "detail", "5 min", "completed", true))),
                        Map.of("id", "tue", "day", "Tuesday", "focus", "Strength foundations", "completed", true,
                                "exercises", List.of(
                                        Map.of("name", "Bodyweight squat", "detail", "3 × 10", "completed", true))),
                        Map.of("id", "thu", "day", "Thursday", "focus", "Steady cardio", "completed", false,
                                "exercises", List.of(
                                        Map.of("name", "Brisk walk or cycle", "detail", "25 min", "completed", false)))),
                "weeks", List.of()));

        WorkoutPlanEntity wp = new WorkoutPlanEntity();
        wp.setId("wp-2026-09");
        wp.setName("Balanced Movement Week");
        wp.setClientUserId(clientId);
        wp.setClientId(clientCode);
        wp.setClientName(clientName);
        wp.setProgramme(wm.getName());
        wp.setGoal("Sustainable movement habits");
        wp.setDifficulty("Moderate");
        wp.setStartDate(LocalDate.of(2026, 7, 1));
        wp.setEndDate(LocalDate.of(2026, 9, 30));
        wp.setSessionsPerWeek(4);
        wp.setSessionDuration("45 min");
        wp.setDescription("Gentle progressive plan");
        wp.setCurrentWeek("Week 10 · 1–7 September");
        wp.setTotalWeeks(12);
        wp.setProgress(62);
        wp.setStatus("Active");
        wp.setPlanJson(workoutJson);
        workoutPlanRepository.save(wp);

        String mealJson = mapper.toJson(Map.of(
                "consultant", "Maya Fernando",
                "considerations", List.of(
                        "Prefers warm breakfasts",
                        "Mild lactose sensitivity — dairy alternatives offered",
                        "Hydration reminder: steady water intake through the day"),
                "days", List.of(
                        Map.of("id", "today", "label", "Today", "meals", List.of(
                                Map.of("type", "Breakfast", "name", "Oat bowl with seasonal fruit",
                                        "description", "Warm oats, banana, cinnamon, and a spoon of seeds."),
                                Map.of("type", "Lunch", "name", "Herb grilled fish with greens",
                                        "description", "Lightly seasoned fish, mixed greens, and steamed vegetables."),
                                Map.of("type", "Dinner", "name", "Vegetable lentil stew",
                                        "description", "Slow-cooked lentils with root vegetables and fresh herbs."))),
                        Map.of("id", "tomorrow", "label", "Tomorrow", "meals", List.of(
                                Map.of("type", "Breakfast", "name", "Vegetable omelette wrap",
                                        "description", "Eggs with spinach and tomato in a soft wrap."),
                                Map.of("type", "Lunch", "name", "Quinoa salad bowl",
                                        "description", "Quinoa, roasted vegetables, and lemon dressing.")))),
                "history", List.of()));

        MealPlanEntity mp = new MealPlanEntity();
        mp.setId("mp-2026-09");
        mp.setName("Nourishing Daily Rhythm");
        mp.setClientUserId(clientId);
        mp.setClientId(clientCode);
        mp.setClientName(clientName);
        mp.setProgramme(wm.getName());
        mp.setGoal("Steady energy and balanced meals");
        mp.setDescription("Supportive daily meal rhythm");
        mp.setStartDate(LocalDate.of(2026, 7, 1));
        mp.setEndDate(LocalDate.of(2026, 9, 30));
        mp.setCurrentWeek("Week 10");
        mp.setStatus("Active");
        mp.setProgress(84);
        mp.setVersionNo(2);
        mp.setPlanJson(mealJson);
        mealPlanRepository.save(mp);

        DietaryRestrictionEntity dr = new DietaryRestrictionEntity();
        dr.setId("dr-1");
        dr.setClientUserId(clientId);
        dr.setClientId(clientCode);
        dr.setClientName(clientName);
        dr.setName("Mild lactose sensitivity");
        dr.setType("Intolerance");
        dr.setStatus("Active");
        dr.setDateRecorded(LocalDate.of(2026, 7, 5));
        dr.setLastReviewed(LocalDate.of(2026, 9, 2));
        dr.setMealPlan(mp.getName());
        dr.setNotes("Offer dairy alternatives at breakfast and snacks.");
        dr.setMealPlanImpact("Dairy alternatives used in snack options.");
        dr.setSource("Consultant");
        dr.setProtectedFlag(false);
        dietaryRestrictionRepository.save(dr);

        SupportTicketEntity ticket = new SupportTicketEntity();
        ticket.setId("tkt-1001");
        ticket.setClientUserId(clientId);
        ticket.setClientId(clientCode);
        ticket.setClientName(clientName);
        ticket.setSubject("Reschedule nutrition consultation");
        ticket.setCategory("Scheduling");
        ticket.setPriority("Medium");
        ticket.setStatus("Open");
        ticket.setAssignedTo("Priya Nair");
        ticket.setRelatedService("Nutrition Consultation");
        ticket.setMessagesJson(mapper.toJson(List.of(
                Map.of("id", "msg-1", "from", "client", "author", clientName,
                        "body", "Could we move my nutrition session to later in the week?",
                        "at", Instant.now().minus(2, ChronoUnit.DAYS).toString()))));
        supportTicketRepository.save(ticket);

        notificationRepository.saveAll(List.of(
                note("n-c1", clientId, "CLIENT", "appointment", "Upcoming fitness session",
                        "Your fitness consultation is on 12 Sep at 10:00 AM.", "/appointments"),
                note("n-c2", clientId, "CLIENT", "nutrition", "Meal plan tip",
                        "Keep hydration steady through the afternoon.", "/nutrition"),
                note("n-m1", null, "MANAGER", "operations", "Capacity check",
                        "Weight Management programme is near capacity.", "/manager/programmes"),
                note("n-co1", null, "COACH", "progress", "Client progress due",
                        "Review movement consistency for Alex Morgan.", "/coach/progress"),
                note("n-nu1", null, "NUTRITION", "restriction", "Restriction review",
                        "Lactose sensitivity noted for Alex Morgan.", "/nutrition/dietary-restrictions"),
                note("n-med1", null, "MEDICAL", "alert", "Follow-up reminder",
                        "Resting metrics follow-up is due.", "/medical/health-alerts"),
                note("n-s1", null, "SUPPORT", "ticket", "New scheduling ticket",
                        "Client requested a nutrition reschedule.", "/support/tickets")));

        ExerciseEntity ex = new ExerciseEntity();
        ex.setId("ex-1");
        ex.setName("Bodyweight squat");
        ex.setCategory("Strength");
        ex.setDifficulty("Beginner");
        ex.setTargetArea("Lower body");
        ex.setEquipment("None");
        ex.setInstructions("Feet shoulder-width, sit back, stand tall.");
        ex.setSafetyNotes("Stop if knees feel sharp discomfort.");
        ex.setSetsLabel("3");
        ex.setRepsLabel("10");
        ex.setDurationLabel("—");
        ex.setRestLabel("60 sec");
        exerciseRepository.save(ex);

        StaffScheduleEntity sch = new StaffScheduleEntity();
        sch.setId("sch-1");
        sch.setScheduleDate(LocalDate.of(2026, 9, 12));
        sch.setStartTime("10:00");
        sch.setEndTime("10:45");
        sch.setStaffId("st-coach");
        sch.setStaffName("Daniel Perera");
        sch.setRoleLabel("Fitness Coach");
        sch.setServiceLabel("Fitness Consultation");
        sch.setClientName(clientName);
        sch.setProgramme(wm.getName());
        sch.setStatus("Scheduled");
        staffScheduleRepository.save(sch);

        SubscriptionEntity sub = new SubscriptionEntity();
        sub.setId("sub-1");
        sub.setUserId(clientId);
        sub.setPlanName("BioFit Wellness Plus");
        sub.setStatus("Active");
        sub.setPriceLabel("LKR 12,500 / mo");
        sub.setRenewsOn(LocalDate.of(2026, 10, 1));
        subscriptionRepository.save(sub);

        PaymentEntity pay = new PaymentEntity();
        pay.setId("pay-1");
        pay.setUserId(clientId);
        pay.setAmount(new BigDecimal("12500.00"));
        pay.setCurrency("LKR");
        pay.setStatus("Paid");
        pay.setMethodLabel("Card");
        pay.setDescription("September subscription");
        pay.setPaidAt(Instant.now().minus(10, ChronoUnit.DAYS));
        paymentRepository.save(pay);

        log.info("Seeded BioFit domain demo data for client {}", clientName);
    }

    private WellnessProgramme programme(
            String id, String name, String type, String description, String status,
            LocalDate start, LocalDate end, int weeks, int capacity, int enrolled,
            String coach, String nutrition, String medical, int progress) {
        WellnessProgramme p = new WellnessProgramme();
        p.setId(id);
        p.setName(name);
        p.setType(type);
        p.setDescription(description);
        p.setStatus(status);
        p.setStartDate(start);
        p.setEndDate(end);
        p.setDurationWeeks(weeks);
        p.setCapacity(capacity);
        p.setEnrolled(enrolled);
        p.setCoachName(coach);
        p.setNutritionName(nutrition);
        p.setMedicalName(medical);
        p.setGoals("Sustainable wellness habits");
        p.setIncludedServices("Fitness, Nutrition, Medical check-ins");
        p.setProgress(progress);
        return p;
    }

    private ProgrammeEnrolment enrolment(
            String id, String programmeId, Long userId, String clientCode, String name,
            LocalDate date, String status, int progress) {
        ProgrammeEnrolment e = new ProgrammeEnrolment();
        e.setId(id);
        e.setProgrammeId(programmeId);
        e.setClientUserId(userId);
        e.setClientId(clientCode);
        e.setClientName(name);
        e.setEnrolledDate(date);
        e.setStatus(status);
        e.setCoachName("Daniel Perera");
        e.setNutritionName("Maya Fernando");
        e.setProgress(progress);
        e.setPeriodLabel("Jul–Sep 2026");
        return e;
    }

    private Appointment appointment(
            String id, Long userId, String clientCode, String name, String service, String professional,
            String role, String programme, LocalDate date, String time, String status) {
        Appointment a = new Appointment();
        a.setId(id);
        a.setClientUserId(userId);
        a.setClientId(clientCode);
        a.setClientName(name);
        a.setServiceType(service);
        a.setProfessional(professional);
        a.setProfessionalRole(role);
        a.setProgramme(programme);
        a.setAppointmentDate(date);
        a.setAppointmentTime(time);
        a.setDuration("45 min");
        a.setStatus(status);
        a.setBookingReference("BF-APT-" + id.replace("apt-", "10"));
        a.setNotes("Wear comfortable clothing.");
        a.setLocation("VitalLife Wellness Centre");
        a.setAudience("CLIENT");
        return a;
    }

    private NotificationEntity note(
            String id, Long userId, String audience, String type, String title, String body, String link) {
        NotificationEntity n = new NotificationEntity();
        n.setId(id);
        n.setUserId(userId);
        n.setAudience(audience);
        n.setType(type);
        n.setTitle(title);
        n.setBody(body);
        n.setLink(link);
        n.setReadFlag(false);
        return n;
    }
}
