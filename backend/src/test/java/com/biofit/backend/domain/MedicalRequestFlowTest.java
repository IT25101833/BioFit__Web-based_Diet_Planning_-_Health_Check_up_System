package com.biofit.backend.domain;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.biofit.backend.audit.AuditLogRepository;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.security.JwtService;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
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

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(
        properties = {
            "spring.datasource.url=jdbc:h2:mem:medicalrequest;DB_CLOSE_DELAY=-1",
            "biofit.seed-demo-data=true",
            "biofit.bootstrap-accounts=true"
        })
class MedicalRequestFlowTest {

    @Autowired private MedicalRequestService medicalRequestService;
    @Autowired private MedicalAdvisorService medicalAdvisorService;
    @Autowired private PlanAccessService planAccessService;
    @Autowired private CompletionService completionService;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtService jwtService;
    @Autowired private MockMvc mockMvc;

    @Test
    void clientRequestReplacesAppointmentAccessForTheMedicalAdvisor() throws Exception {
        User client = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("client@biofit.local").orElseThrow();
        User otherClient = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("alex.perera@biofit.demo").orElseThrow();
        User advisor = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("medical@biofit.local").orElseThrow();
        User otherAdvisor = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("medical@biofit.demo").orElseThrow();
        User coach = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("coach@biofit.demo").orElseThrow();
        User nutrition = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("nutrition@biofit.demo").orElseThrow();

        UserPrincipal clientPrincipal = new UserPrincipal(client);
        UserPrincipal otherClientPrincipal = new UserPrincipal(otherClient);
        UserPrincipal advisorPrincipal = new UserPrincipal(advisor);
        UserPrincipal otherAdvisorPrincipal = new UserPrincipal(otherAdvisor);

        String clientToken = jwtService.createAccessToken(client.getId(), client.getEmail(), List.of("CLIENT"));
        String advisorToken = jwtService.createAccessToken(advisor.getId(), advisor.getEmail(), List.of("MEDICAL_ADVISOR"));
        String coachToken = jwtService.createAccessToken(coach.getId(), coach.getEmail(), List.of("FITNESS_COACH"));
        String nutritionToken = jwtService.createAccessToken(nutrition.getId(), nutrition.getEmail(), List.of("NUTRITION_CONSULTANT"));
        LocalDate preferredDate = futureWeekday();
        String yesterday = LocalDate.now(MedicalRequestService.ZONE).minusDays(1).toString();

        mockMvc.perform(
                        post("/api/client/medical-requests")
                                .header("Authorization", "Bearer " + clientToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"medicalAdvisorId\":"
                                                + advisor.getId()
                                                + ",\"reason\":\"Medical consultation\",\"description\":\"Need a review of recent symptoms.\",\"preferredDate\":\""
                                                + yesterday
                                                + "\",\"preferredTime\":\"10:30 AM\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value("Please select today or a future date."));

        mockMvc.perform(
                        post("/api/client/medical-requests")
                                .header("Authorization", "Bearer " + clientToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"medicalAdvisorId\":"
                                                + advisor.getId()
                                                + ",\"reason\":\"Medical consultation\",\"description\":\"Need a review of recent symptoms.\",\"preferredDate\":\""
                                                + preferredDate
                                                + "\",\"preferredTime\":\"10:30 AM\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.reason").value("Medical consultation"))
                .andExpect(jsonPath("$.data.preferredDate").value(preferredDate.toString()))
                .andExpect(jsonPath("$.data.preferredTime").value("10:30 AM"));

        Map<String, Object> created =
                medicalRequestService.listForClient(clientPrincipal).stream()
                        .filter(row -> advisor.getId().equals(((Number) row.get("medicalAdvisorId")).longValue()))
                        .findFirst()
                        .orElseThrow();
        Long requestId = ((Number) created.get("id")).longValue();
        assertEquals("PENDING", created.get("status"));
        assertEquals(client.getFullName(), created.get("clientName"));

        assertTrue(
                medicalRequestService.listForAdvisor(advisorPrincipal).stream()
                        .anyMatch(row -> requestId.equals(((Number) row.get("id")).longValue())));

        ApiException deniedBeforeAccept =
                assertThrows(
                        ApiException.class,
                        () -> medicalAdvisorService.assertAdvisorCanAccessClient(advisorPrincipal, client.getId()));
        assertEquals(HttpStatus.FORBIDDEN, deniedBeforeAccept.getStatus());
        assertEquals("Attend the Medical Request first.", deniedBeforeAccept.getMessage());
        assertTrue(
                medicalAdvisorService.medicalClientsForAdvisor(advisorPrincipal).stream()
                        .noneMatch(row -> client.getId().equals(((Number) row.get("userId")).longValue())));

        Map<String, Object> opened = medicalRequestService.getForAdvisor(advisorPrincipal, requestId);
        assertEquals(client.getFullName(), opened.get("clientName"));
        assertEquals(client.getId(), ((Number) opened.get("clientId")).longValue());
        assertEquals("Medical consultation", opened.get("reason"));
        assertEquals("Need a review of recent symptoms.", opened.get("description"));
        assertEquals("PENDING", opened.get("status"));
        assertEquals(preferredDate.toString(), opened.get("preferredDate"));
        assertEquals("10:30 AM", opened.get("preferredTime"));

        ApiException otherAdvisorBlocked =
                assertThrows(
                        ApiException.class, () -> medicalRequestService.accept(otherAdvisorPrincipal, requestId));
        assertEquals(HttpStatus.FORBIDDEN, otherAdvisorBlocked.getStatus());

        Map<String, Object> accepted = medicalRequestService.accept(advisorPrincipal, requestId);
        assertEquals("ATTENDED", accepted.get("status"));
        assertTrue(
                medicalAdvisorService.medicalClientsForAdvisor(advisorPrincipal).stream()
                        .anyMatch(row -> client.getId().equals(((Number) row.get("userId")).longValue())));
        medicalAdvisorService.listMedicalHistory(null, client.getId(), advisorPrincipal);

        Map<String, Object> record = new java.util.LinkedHashMap<>();
        record.put("userId", client.getId());
        record.put("clientId", "BF-C" + client.getId());
        record.put("clientName", client.getFullName());
        record.put("advisorUserId", advisor.getId());
        record.put("medicalHistory", Map.of("conditions", List.of("Hypertension")));
        Map<String, Object> saved = completionService.saveHealthRecord(null, record);
        Map<String, Object> updated =
                completionService.saveHealthRecord(((Number) saved.get("recordId")).longValue(), record);
        assertEquals(saved.get("recordId"), updated.get("recordId"));
        assertTrue(
                medicalAdvisorService.listMedicalHistory(null, client.getId(), advisorPrincipal).stream()
                        .anyMatch(row -> "Hypertension".equalsIgnoreCase(String.valueOf(row.get("conditionName")))));

        Map<String, Object> planStatus = planAccessService.statusForClient(advisorPrincipal, client.getId());
        assertEquals("NOT_REQUESTED", ((Map<?, ?>) planStatus.get("workout")).get("status"));
        ApiException planDenied =
                assertThrows(
                        ApiException.class, () -> planAccessService.viewWorkoutPlan(advisorPrincipal, client.getId()));
        assertEquals("Access required", planDenied.getMessage());

        Map<String, Object> second =
                medicalRequestService.create(
                        clientPrincipal,
                        otherAdvisor.getId(),
                        "Health concern",
                        "Please review a separate issue.",
                        preferredDate,
                        "02:00 PM");
        Map<String, Object> rejected =
                medicalRequestService.reject(otherAdvisorPrincipal, ((Number) second.get("id")).longValue(), "Not required");
        assertEquals("REJECTED", rejected.get("status"));

        medicalRequestService.complete(advisorPrincipal, requestId);

        List<String> clientNotes =
                notificationRepository.findByUserIdOrderByCreatedAtDesc(client.getId()).stream()
                        .map(NotificationEntity::getBody)
                        .toList();
        assertTrue(clientNotes.stream().anyMatch(body -> body.contains("has been accepted.")));
        assertTrue(clientNotes.stream().anyMatch(body -> body.contains("Your medical request has been rejected.")));
        assertTrue(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(advisor.getId()).stream()
                        .map(NotificationEntity::getBody)
                        .anyMatch(body -> body.contains("New medical request received from " + client.getFullName()) && body.contains("10:30 AM")));

        List<String> actions = auditLogRepository.findAll().stream().map(log -> log.getAction()).toList();
        assertTrue(actions.contains("MEDICAL_REQUEST_CREATE"));
        assertTrue(actions.contains("MEDICAL_REQUEST_VIEW"));
        assertTrue(actions.contains("MEDICAL_REQUEST_ACCEPT"));
        assertTrue(actions.contains("MEDICAL_REQUEST_REJECT"));
        assertTrue(actions.contains("MEDICAL_REQUEST_COMPLETE"));

        ApiException foreignClient =
                assertThrows(ApiException.class, () -> medicalRequestService.getForClient(otherClientPrincipal, requestId));
        assertEquals(HttpStatus.FORBIDDEN, foreignClient.getStatus());

        mockMvc.perform(get("/api/medical/requests").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/medical/appointments").header("Authorization", "Bearer " + advisorToken))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error.message", containsString("No static resource api/medical/appointments")));
        mockMvc.perform(get("/api/staff/appointments").header("Authorization", "Bearer " + advisorToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/client/appointments").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/nutrition/appointments").header("Authorization", "Bearer " + nutritionToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/staff/appointments").header("Authorization", "Bearer " + coachToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/client/medical-requests/time-slots").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasItem("10:30 AM")))
                .andExpect(jsonPath("$.data", hasItem("09:00 AM")));
        mockMvc.perform(get("/api/client/booking/catalog").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.professionals[*].roleKey", not(hasItem("MEDICAL_ADVISOR"))))
                .andExpect(jsonPath("$.data.professionals[*].roleKey", hasItem("FITNESS_COACH")))
                .andExpect(jsonPath("$.data.professionals[*].roleKey", hasItem("NUTRITION_CONSULTANT")));

        ApiException foreignCancel =
                assertThrows(ApiException.class, () -> medicalRequestService.cancel(otherClientPrincipal, requestId));
        assertEquals(HttpStatus.FORBIDDEN, foreignCancel.getStatus());
    }

    private static LocalDate futureWeekday() {
        LocalDate date = LocalDate.now(MedicalRequestService.ZONE).plusDays(1);
        if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            date = date.plusDays(1);
        }
        return date;
    }
}
