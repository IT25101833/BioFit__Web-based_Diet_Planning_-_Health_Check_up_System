package com.biofit.backend.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.biofit.backend.security.JwtService;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(
        properties = {
            "spring.datasource.url=jdbc:h2:mem:workoutassign;DB_CLOSE_DELAY=-1",
            "biofit.seed-demo-data=true",
            "biofit.bootstrap-accounts=true"
        })
class WorkoutPlanAssignmentFlowTest {

    @Autowired private DomainService domainService;
    @Autowired private WorkoutPlanRepository workoutPlanRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtService jwtService;
    @Autowired private MockMvc mockMvc;

    @Test
    void clientSeesCoachScheduleAndOnlyTheirOwnSessions() throws Exception {
        User client = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("client@biofit.local").orElseThrow();
        User other = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("alex.perera@biofit.demo").orElseThrow();
        User coach = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("coach@biofit.demo").orElseThrow();
        UserPrincipal coachPrincipal = new UserPrincipal(coach);

        Appointment appointment = new Appointment();
        appointment.setId("apt-workout-assign");
        appointment.setClientUserId(client.getId());
        appointment.setClientName(client.getFullName());
        appointment.setProfessionalUserId(coach.getId());
        appointment.setProfessional(coach.getFullName());
        appointment.setProfessionalRole("Fitness Coach");
        appointment.setServiceType("Fitness session");
        appointment.setAppointmentDate(LocalDate.now());
        appointment.setAppointmentTime("09:00");
        appointment.setAttendance("ATTENDED");
        appointment.setStatus("Completed");
        appointment.setAudience("CLIENT");
        appointmentRepository.save(appointment);

        WorkoutPlanEntity existing = new WorkoutPlanEntity();
        existing.setId("wp-squart-existing");
        existing.setName("squart");
        existing.setClientUserId(client.getId());
        existing.setClientId("BF-C" + client.getId());
        existing.setClientName(client.getFullName());
        existing.setGoal("sixpacks");
        existing.setDifficulty("Beginner");
        existing.setSessionsPerWeek(4);
        existing.setStatus("Active");
        existing.setStartDate(LocalDate.of(2026, 10, 15));
        existing.setEndDate(LocalDate.of(2026, 10, 30));
        existing.setUpdatedAt(Instant.parse("2099-01-01T00:00:00Z"));
        existing.setPlanJson(
                "{\"weeks\":[{\"id\":\"w-1\",\"label\":\"Week 1\",\"days\":["
                        + "{\"id\":\"d-monday\",\"day\":\"Monday\",\"title\":\"day1\",\"exercises\":[{\"name\":\"squat\",\"sets\":\"3\",\"reps\":\"10\",\"rest\":\"60s\",\"notes\":\"Brace your core\"}]},"
                        + "{\"id\":\"d-cancel\",\"day\":\"Tuesday\",\"title\":\"skip\",\"status\":\"CANCELLED\",\"exercises\":[]}"
                        + "]}],\"days\":[]}");
        workoutPlanRepository.save(existing);

        Map<String, Object> viewed = domainService.clientWorkoutPlan(client.getId());
        assertEquals("squart", viewed.get("name"));
        assertEquals(coach.getFullName(), viewed.get("coach"));
        assertEquals(1, ((Number) viewed.get("scheduledSessions")).intValue());
        assertEquals(1, ((Number) viewed.get("cancelledSessions")).intValue());
        assertEquals(0, ((Number) viewed.get("completionPercent")).intValue());
        Map<String, Object> monday = firstDay(viewed);
        assertEquals("Monday", monday.get("day"));
        assertEquals("day1", monday.get("title"));
        assertEquals("squat", firstExercise(monday).get("name"));
        assertEquals("Brace your core", firstExercise(monday).get("instructions"));

        String clientToken = jwtService.createAccessToken(client.getId(), client.getEmail(), List.of("CLIENT"));
        String otherToken = jwtService.createAccessToken(other.getId(), other.getEmail(), List.of("CLIENT"));
        mockMvc.perform(
                        patch("/api/client/workout-plan/sessions/d-monday")
                                .header("Authorization", "Bearer " + otherToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/client/workout-plan").header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isOk())
                .andExpect(result -> assertFalse(result.getResponse().getContentAsString().contains("\"name\":\"squart\"")));

        mockMvc.perform(
                        patch("/api/client/workout-plan/sessions/d-monday")
                                .header("Authorization", "Bearer " + clientToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk())
                .andExpect(result -> assertTrue(result.getResponse().getContentAsString().contains("COMPLETED")));

        Map<String, Object> completed = domainService.clientWorkoutPlan(client.getId());
        assertEquals(100, ((Number) completed.get("completionPercent")).intValue());
        assertEquals("COMPLETED", firstDay(completed).get("status"));

        Map<String, Object> edit = new LinkedHashMap<>(domainService.workoutPlanForCoach(coachPrincipal, "wp-squart-existing"));
        edit.put("goal", "stronger core");
        Map<String, Object> updated = domainService.saveWorkoutPlanForCoach(coachPrincipal, "wp-squart-existing", edit);
        assertEquals("stronger core", updated.get("goal"));
        assertEquals("COMPLETED", firstDay(updated).get("status"));
        assertEquals("squat", firstExercise(firstDay(updated)).get("name"));

        Map<String, Object> copySource = new LinkedHashMap<>(domainService.workoutPlanForCoach(coachPrincipal, "wp-squart-existing"));
        copySource.remove("id");
        copySource.put("name", "squart copy");
        copySource.put("status", "Draft");
        copySource.put("resetSessionCompletion", true);
        Map<String, Object> copy = domainService.saveWorkoutPlanForCoach(coachPrincipal, null, copySource);
        assertNotEquals("wp-squart-existing", copy.get("id"));
        assertEquals("SCHEDULED", firstDay(copy).get("status"));
        assertEquals("COMPLETED", firstDay(domainService.workoutPlanForCoach(coachPrincipal, "wp-squart-existing")).get("status"));

        LocalDate start = LocalDate.now(ZoneId.of("Asia/Colombo")).plusDays(1);
        Map<String, Object> emptyPlan = new LinkedHashMap<>();
        emptyPlan.put("name", "No sessions yet");
        emptyPlan.put("clientId", "BF-C" + other.getId());
        emptyPlan.put("clientUserId", other.getId());
        emptyPlan.put("clientName", other.getFullName());
        emptyPlan.put("goal", "General fitness");
        emptyPlan.put("status", "Active");
        emptyPlan.put("startDate", start.toString());
        emptyPlan.put("endDate", start.plusDays(7).toString());
        emptyPlan.put("weeks", List.of(Map.of("id", "w-empty", "label", "Week 1", "days", List.of())));
        domainService.saveWorkoutPlan(null, emptyPlan);
        Map<String, Object> emptyView = domainService.clientWorkoutPlan(other.getId());
        assertEquals("No sessions yet", emptyView.get("name"));
        assertEquals(0, ((Number) emptyView.get("scheduledSessions")).intValue());
        assertTrue(((List<?>) emptyView.get("days")).isEmpty());
        assertEquals(null, emptyView.get("completionPercent"));
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> firstDay(Map<String, Object> plan) {
        List<Map<String, Object>> days = (List<Map<String, Object>>) plan.get("days");
        return days.get(0);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> firstExercise(Map<String, Object> day) {
        List<Map<String, Object>> exercises = (List<Map<String, Object>>) day.get("exercises");
        return exercises.get(0);
    }
}
