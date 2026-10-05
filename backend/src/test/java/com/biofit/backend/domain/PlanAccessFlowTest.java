package com.biofit.backend.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import com.biofit.backend.audit.AuditLogRepository;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.health.HealthProfileRepository;
import com.biofit.backend.security.JwtService;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(
        properties = {
            "spring.datasource.url=jdbc:h2:mem:planaccess;DB_CLOSE_DELAY=-1",
            "biofit.seed-demo-data=true",
            "biofit.bootstrap-accounts=true"
        })
class PlanAccessFlowTest {

    @Autowired private CompletionService completionService;
    @Autowired private PlanAccessService planAccessService;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private MedicalRequestRepository medicalRequestRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private WorkoutPlanRepository workoutPlanRepository;
    @Autowired private MealPlanRepository mealPlanRepository;
    @Autowired private HealthProfileRepository healthProfileRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private JwtService jwtService;
    @Autowired private MockMvc mockMvc;

    @Test
    void clientControlsWorkoutAndNutritionPlanAccess() throws Exception {
        User client = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("client@biofit.local").orElseThrow();
        User other = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("alex.perera@biofit.demo").orElseThrow();
        User advisor = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("medical@biofit.local").orElseThrow();
        User otherAdvisor = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("medical@biofit.demo").orElseThrow();

        attended(client, advisor, "apt-plan-access");
        attended(client, otherAdvisor, "apt-plan-access-2");
        attended(other, advisor, "apt-plan-access-other");

        Map<String, Object> record = new LinkedHashMap<>();
        record.put("userId", client.getId());
        record.put("clientId", "BF-C" + client.getId());
        record.put("clientName", client.getFullName());
        record.put("advisorUserId", advisor.getId());
        record.put("medicalHistory", Map.of("conditions", List.of("Hypertension")));
        completionService.saveHealthRecord(null, record);
        String stored = healthProfileRepository.findByUserId(client.getId()).orElseThrow().getRecordJson();
        assertFalse(stored.contains("fitnessGuidance"));
        assertFalse(stored.contains("nutritionGuidance"));

        UserPrincipal advisorPrincipal = new UserPrincipal(advisor);
        UserPrincipal otherAdvisorPrincipal = new UserPrincipal(otherAdvisor);
        UserPrincipal clientPrincipal = new UserPrincipal(client);

        Map<String, Object> initial = planAccessService.statusForClient(advisorPrincipal, client.getId());
        assertEquals("NOT_REQUESTED", ((Map<?, ?>) initial.get("workout")).get("status"));
        assertEquals("NOT_REQUESTED", ((Map<?, ?>) initial.get("nutrition")).get("status"));

        WorkoutPlanEntity workout = new WorkoutPlanEntity();
        workout.setId("wp-plan-access");
        workout.setName("Return to training");
        workout.setClientUserId(client.getId());
        workout.setClientId("BF-C" + client.getId());
        workout.setClientName(client.getFullName());
        workout.setStatus("Active");
        workout.setGoal("Strength");
        workoutPlanRepository.save(workout);

        MealPlanEntity meal = new MealPlanEntity();
        meal.setId("mp-plan-access");
        meal.setName("Allergy-aware meals");
        meal.setClientUserId(client.getId());
        meal.setClientId("BF-C" + client.getId());
        meal.setClientName(client.getFullName());
        meal.setStatus("Active");
        meal.setGoal("Balanced");
        mealPlanRepository.save(meal);

        assertDenied(advisorPrincipal, client.getId(), true, "Access required");
        String advisorToken = jwtService.createAccessToken(advisor.getId(), advisor.getEmail(), List.of("MEDICAL_ADVISOR"));
        MvcResult denied =
                exchange(advisorToken, "/api/medical/plan-access/workout-plan?clientUserId=" + client.getId());
        assertEquals(HttpStatus.FORBIDDEN.value(), denied.getResponse().getStatus());
        assertTrue(denied.getResponse().getContentAsString().contains("Access required"));
        assertEquals(HttpStatus.FORBIDDEN.value(), exchange(advisorToken, "/api/coach/workout-plans").getResponse().getStatus());

        Map<String, Object> workoutRequest =
                planAccessService.requestAccess(
                        advisorPrincipal,
                        client.getId(),
                        PlanAccessRequest.WORKOUT_PLAN,
                        "Requesting access to review the client's workout plan for medical safety.");
        assertEquals("PENDING", workoutRequest.get("status"));
        assertTrue(
                planAccessService.listForClient(clientPrincipal).stream()
                        .anyMatch(row -> "Workout Plan".equals(row.get("resource")) && "PENDING".equals(row.get("status"))));
        assertDenied(advisorPrincipal, client.getId(), true, "Workout Plan access request pending.");
        assertThrows(
                ApiException.class,
                () -> planAccessService.decide(advisorPrincipal, ((Number) workoutRequest.get("id")).longValue(), "APPROVED", null));

        String clientToken = jwtService.createAccessToken(client.getId(), client.getEmail(), List.of("CLIENT"));
        mockMvc.perform(
                        post("/api/client/plan-access-requests/" + workoutRequest.get("id") + "/decide")
                                .header("Authorization", "Bearer " + advisorToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"APPROVED\"}"))
                .andExpect(result -> assertEquals(403, result.getResponse().getStatus()));

        planAccessService.decide(clientPrincipal, ((Number) workoutRequest.get("id")).longValue(), "APPROVED", null);
        Map<String, Object> viewed = planAccessService.viewWorkoutPlan(advisorPrincipal, client.getId());
        assertEquals("Return to training", viewed.get("name"));
        MvcResult allowed =
                exchange(advisorToken, "/api/medical/plan-access/workout-plan?clientUserId=" + client.getId());
        assertEquals(HttpStatus.OK.value(), allowed.getResponse().getStatus());
        assertTrue(allowed.getResponse().getContentAsString().contains("Return to training"));

        assertDenied(advisorPrincipal, other.getId(), true, "Access required");
        MvcResult otherClient =
                exchange(advisorToken, "/api/medical/plan-access/workout-plan?clientUserId=" + other.getId());
        assertEquals(HttpStatus.FORBIDDEN.value(), otherClient.getResponse().getStatus());

        Map<String, Object> otherAdvisorRequest =
                planAccessService.requestAccess(otherAdvisorPrincipal, client.getId(), "WORKOUT_PLAN", "Second advisor review.");
        assertEquals("PENDING", otherAdvisorRequest.get("status"));
        assertDenied(otherAdvisorPrincipal, client.getId(), true, "Workout Plan access request pending.");

        Map<String, Object> nutritionRequest =
                planAccessService.requestAccess(advisorPrincipal, client.getId(), PlanAccessRequest.NUTRITION_PLAN, null);
        assertTrue(
                planAccessService.listForClient(clientPrincipal).stream()
                        .anyMatch(row -> "Nutrition Plan".equals(row.get("resource")) && row.get("reason") != null));
        planAccessService.decide(clientPrincipal, ((Number) nutritionRequest.get("id")).longValue(), "REJECTED", "Not now");
        assertDenied(advisorPrincipal, client.getId(), false, "Nutrition Plan access denied by client.");

        Map<String, Object> nutritionAgain =
                planAccessService.requestAccess(advisorPrincipal, client.getId(), PlanAccessRequest.NUTRITION_PLAN, "Please review meals.");
        planAccessService.decide(clientPrincipal, ((Number) nutritionAgain.get("id")).longValue(), "APPROVED", null);
        assertEquals("Allergy-aware meals", planAccessService.viewNutritionPlan(advisorPrincipal, client.getId()).get("name"));
        planAccessService.revoke(clientPrincipal, ((Number) nutritionAgain.get("id")).longValue());
        assertDenied(advisorPrincipal, client.getId(), false, "Nutrition Plan access denied by client.");

        List<String> actions = auditLogRepository.findAll().stream().map(log -> log.getAction()).toList();
        assertTrue(actions.contains("PLAN_ACCESS_REQUEST_WORKOUT"));
        assertTrue(actions.contains("PLAN_ACCESS_APPROVE_WORKOUT"));
        assertTrue(actions.contains("PLAN_ACCESS_VIEW_WORKOUT"));
        assertTrue(actions.contains("PLAN_ACCESS_REQUEST_NUTRITION"));
        assertTrue(actions.contains("PLAN_ACCESS_REJECT_NUTRITION"));
        assertTrue(actions.contains("PLAN_ACCESS_APPROVE_NUTRITION"));
        assertTrue(actions.contains("PLAN_ACCESS_VIEW_NUTRITION"));
        assertTrue(actions.contains("PLAN_ACCESS_REVOKE_NUTRITION"));
    }

    private void attended(User client, User advisor, String id) {
        Appointment appointment = new Appointment();
        appointment.setId(id);
        appointment.setClientUserId(client.getId());
        appointment.setProfessionalUserId(advisor.getId());
        appointment.setServiceType("Medical review");
        appointment.setAppointmentDate(LocalDate.now());
        appointment.setAppointmentTime("10:00");
        appointment.setAttendance("ATTENDED");
        appointment.setStatus("Completed");
        appointment.setAudience("CLIENT");
        appointmentRepository.save(appointment);

        MedicalRequest request = new MedicalRequest();
        request.setClientId(client.getId());
        request.setClientCode("BF-C" + client.getId());
        request.setClientName(client.getFullName());
        request.setMedicalAdvisorId(advisor.getId());
        request.setAdvisorName(advisor.getFullName());
        request.setReason("Clinical access");
        request.setDescription("Accepted so the advisor can review this client.");
        request.setStatus(MedicalRequest.ACCEPTED);
        request.setRequestedAt(Instant.now());
        request.setRespondedAt(Instant.now());
        medicalRequestRepository.save(request);
    }

    private MvcResult exchange(String token, String path) throws Exception {
        return mockMvc.perform(get(path).header("Authorization", "Bearer " + token)).andReturn();
    }

    private void assertDenied(UserPrincipal advisor, Long clientUserId, boolean workout, String message) {
        ApiException denied =
                assertThrows(
                        ApiException.class,
                        () -> {
                            if (workout) planAccessService.viewWorkoutPlan(advisor, clientUserId);
                            else planAccessService.viewNutritionPlan(advisor, clientUserId);
                        });
        assertEquals(HttpStatus.FORBIDDEN, denied.getStatus());
        assertEquals(message, denied.getMessage());
    }
}
