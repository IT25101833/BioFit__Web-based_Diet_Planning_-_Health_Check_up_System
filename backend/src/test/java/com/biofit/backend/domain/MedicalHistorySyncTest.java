package com.biofit.backend.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.biofit.backend.health.MedicalHistoryEntry;
import com.biofit.backend.health.MedicalHistoryEntryRepository;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(
        properties = {
            "spring.datasource.url=jdbc:h2:mem:historysync;DB_CLOSE_DELAY=-1",
            "biofit.seed-demo-data=true",
            "biofit.bootstrap-accounts=true"
        })
class MedicalHistorySyncTest {

    @Autowired private CompletionService completionService;
    @Autowired private MedicalAdvisorService medicalAdvisorService;
    @Autowired private MedicalHistoryEntryRepository medicalHistoryEntryRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private MedicalRequestRepository medicalRequestRepository;
    @Autowired private UserRepository userRepository;

    @Test
    void healthRecordSaveSyncsHistoryWithoutDuplicates() {
        User client = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("client@biofit.local").orElseThrow();
        User other = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("alex.perera@biofit.demo").orElseThrow();
        User advisor = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("medical@biofit.local").orElseThrow();

        MedicalHistoryEntry legacy = new MedicalHistoryEntry();
        legacy.setUserId(client.getId());
        legacy.setClientCode("BF-C" + client.getId());
        legacy.setClientName(client.getFullName());
        legacy.setRecordType("Condition");
        legacy.setConditionName("Legacy manual note");
        legacy.setDescription("Legacy manual note");
        legacy.setStatus("Active");
        legacy.setRecordedDate(LocalDate.now());
        medicalHistoryEntryRepository.save(legacy);

        Map<String, Object> created =
                completionService.saveHealthRecord(null, payload(client, advisor, true));
        Long recordId = ((Number) created.get("recordId")).longValue();

        assertEntry(client.getId(), "Condition", "Hypertension", "Active");
        assertEntry(client.getId(), "Condition", "Asthma", "Active");
        assertEntry(client.getId(), "Allergy", "Peanuts", "Active");
        assertEntry(client.getId(), "Other", "Avoid high intensity exercise", "Active");
        assertEntry(client.getId(), "History", "Previous knee injury", "Active");
        assertEquals(1, countText(client.getId(), "Hypertension"));
        assertTrue(
                medicalHistoryEntryRepository.findByUserIdOrderByUpdatedAtDesc(client.getId()).stream()
                        .filter(entry -> "Legacy manual note".equals(entry.getConditionName()))
                        .allMatch(entry -> "Active".equalsIgnoreCase(entry.getStatus()) && entry.getSourceHealthRecordId() == null));

        Map<String, Object> edited =
                completionService.saveHealthRecord(recordId, payload(client, advisor, false));
        assertEquals(recordId, ((Number) edited.get("recordId")).longValue());

        assertEntry(client.getId(), "Condition", "Hypertension", "Active");
        assertEntry(client.getId(), "Condition", "Asthma", "Inactive");
        assertEntry(client.getId(), "Condition", "Diabetes", "Active");
        assertEntry(client.getId(), "Allergy", "Peanuts", "Active");
        assertEntry(client.getId(), "Allergy", "Shellfish", "Active");
        assertEquals(1, countText(client.getId(), "Hypertension"));
        assertEquals(1, countText(client.getId(), "Peanuts"));
        assertEquals(1, countText(client.getId(), "Asthma"));

        long beforeResave = medicalHistoryEntryRepository.findByUserIdOrderByUpdatedAtDesc(client.getId()).size();
        completionService.saveHealthRecord(recordId, payload(client, advisor, false));
        assertEquals(beforeResave, medicalHistoryEntryRepository.findByUserIdOrderByUpdatedAtDesc(client.getId()).size());
        assertEquals(1, countText(client.getId(), "Hypertension"));
        assertEquals(1, countText(client.getId(), "Diabetes"));

        Map<String, Object> renamed = payload(client, advisor, false);
        @SuppressWarnings("unchecked")
        Map<String, Object> history = (Map<String, Object>) renamed.get("medicalHistory");
        history.put("summary", "Patient requires regular medical monitoring.");
        completionService.saveHealthRecord(recordId, renamed);
        history.put("summary", "Patient requires closer monitoring.");
        completionService.saveHealthRecord(recordId, renamed);
        assertEntry(client.getId(), "History", "Patient requires closer monitoring.", "Active");
        assertEquals(0, countText(client.getId(), "Patient requires regular medical monitoring."));
        assertEquals(1, countText(client.getId(), "Patient requires closer monitoring."));

        completionService.saveHealthRecord(null, otherPayload(other, advisor));
        assertEquals(0, countText(other.getId(), "Hypertension"));
        assertEntry(other.getId(), "Allergy", "Shellfish", "Active");
        assertTrue(
                medicalHistoryEntryRepository.findByUserIdOrderByUpdatedAtDesc(client.getId()).stream()
                        .noneMatch(entry -> "Dairy".equalsIgnoreCase(entryText(entry))));
        assertTrue(
                medicalHistoryEntryRepository.findByUserIdOrderByUpdatedAtDesc(other.getId()).stream()
                        .allMatch(entry -> other.getId().equals(entry.getUserId())));

        medicalHistoryEntryRepository.findByUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(client.getId(), "Active").stream()
                .filter(entry -> "Condition".equalsIgnoreCase(entry.getRecordType()) && "Hypertension".equalsIgnoreCase(entryText(entry)))
                .findFirst()
                .ifPresent(entry -> {
                    entry.setSeverity("High");
                    medicalHistoryEntryRepository.save(entry);
                });

        Appointment appointment = new Appointment();
        appointment.setId("apt-history-sync");
        appointment.setClientUserId(client.getId());
        appointment.setProfessionalUserId(advisor.getId());
        appointment.setServiceType("Medical review");
        appointment.setAppointmentDate(LocalDate.now());
        appointment.setAppointmentTime("09:00");
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
        request.setDescription("Accepted so safety validation can read this client.");
        request.setStatus(MedicalRequest.ACCEPTED);
        request.setRequestedAt(Instant.now());
        request.setRespondedAt(Instant.now());
        medicalRequestRepository.save(request);

        Map<String, Object> validation =
                medicalAdvisorService.runSafetyValidation(
                        Map.of("userId", client.getId(), "clientId", "BF-C" + client.getId(), "clientName", client.getFullName()),
                        new UserPrincipal(advisor));
        @SuppressWarnings("unchecked")
        List<String> warnings = (List<String>) validation.get("warnings");
        assertTrue(warnings.stream().anyMatch(warning -> warning.toLowerCase().contains("peanuts")));
        assertTrue(warnings.stream().anyMatch(warning -> warning.toLowerCase().contains("hypertension")));
        assertTrue(warnings.stream().noneMatch(warning -> warning.toLowerCase().contains("asthma")));
    }

    private Map<String, Object> payload(User client, User advisor, boolean initial) {
        Map<String, Object> history = new java.util.LinkedHashMap<>();
        history.put("conditions", initial ? List.of("Hypertension", "Asthma") : List.of("Hypertension", "Diabetes"));
        history.put("allergies", initial ? List.of("Peanuts") : List.of("Peanuts", "Shellfish"));
        history.put("healthConsiderations", List.of("Avoid high intensity exercise"));
        history.put("previousNotes", List.of("Previous knee injury"));
        history.put("summary", "");
        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("userId", client.getId());
        body.put("clientId", "BF-C" + client.getId());
        body.put("clientName", client.getFullName());
        body.put("advisorUserId", advisor.getId());
        body.put("medicalHistory", history);
        return body;
    }

    private Map<String, Object> otherPayload(User client, User advisor) {
        Map<String, Object> history = new java.util.LinkedHashMap<>();
        history.put("conditions", List.of());
        history.put("allergies", List.of("Shellfish"));
        history.put("healthConsiderations", List.of("Dairy"));
        history.put("previousNotes", List.of());
        history.put("summary", "");
        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("userId", client.getId());
        body.put("clientId", "BF-C" + client.getId());
        body.put("clientName", client.getFullName());
        body.put("advisorUserId", advisor.getId());
        body.put("medicalHistory", history);
        return body;
    }

    private void assertEntry(Long userId, String type, String text, String status) {
        assertTrue(
                medicalHistoryEntryRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                        .anyMatch(
                                entry ->
                                        userId.equals(entry.getUserId())
                                                && type.equalsIgnoreCase(entry.getRecordType())
                                                && text.equalsIgnoreCase(entryText(entry))
                                                && status.equalsIgnoreCase(entry.getStatus())
                                                && entry.getSourceHealthRecordId() != null),
                () -> "Missing " + status + " " + type + " " + text);
    }

    private long countText(Long userId, String text) {
        return medicalHistoryEntryRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .filter(entry -> text.equalsIgnoreCase(entryText(entry)))
                .count();
    }

    private static String entryText(MedicalHistoryEntry entry) {
        if (entry.getDescription() != null && !entry.getDescription().isBlank()) return entry.getDescription();
        if (entry.getConditionName() != null && !entry.getConditionName().isBlank()) return entry.getConditionName();
        return entry.getAllergyInfo() == null ? "" : entry.getAllergyInfo();
    }
}
