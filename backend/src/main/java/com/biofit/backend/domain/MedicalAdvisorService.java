package com.biofit.backend.domain;

import com.biofit.backend.audit.AuditService;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.health.HealthAssessment;
import com.biofit.backend.health.HealthAssessmentRepository;
import com.biofit.backend.health.HealthProfile;
import com.biofit.backend.health.HealthProfileRepository;
import com.biofit.backend.health.HealthRiskAlert;
import com.biofit.backend.health.HealthRiskAlertRepository;
import com.biofit.backend.health.MedicalHistoryEntry;
import com.biofit.backend.health.MedicalHistoryEntryRepository;
import com.biofit.backend.health.SafetyValidation;
import com.biofit.backend.health.SafetyValidationRepository;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
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
public class MedicalAdvisorService {

    private final MedicalHistoryEntryRepository medicalHistoryEntryRepository;
    private final SafetyValidationRepository safetyValidationRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final HealthRiskAlertRepository healthRiskAlertRepository;
    private final HealthAssessmentRepository healthAssessmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DomainMapper mapper;
    private final AuditService auditService;
    private final NotificationRepository notificationRepository;

    /* ---------- Medical History ---------- */

    public List<Map<String, Object>> listMedicalHistory(
            String status, Long clientUserId, UserPrincipal principal) {
        if (clientUserId != null) {
            assertAdvisorCanAccessClient(principal, clientUserId);
        }
        List<MedicalHistoryEntry> entries;
        if (clientUserId != null && status != null && !status.isBlank()) {
            entries =
                    medicalHistoryEntryRepository.findByUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(
                            clientUserId, status);
        } else if (clientUserId != null) {
            entries = medicalHistoryEntryRepository.findByUserIdOrderByUpdatedAtDesc(clientUserId);
        } else if (status != null && !status.isBlank()) {
            entries = medicalHistoryEntryRepository.findByStatusIgnoreCaseOrderByUpdatedAtDesc(status);
        } else {
            entries = medicalHistoryEntryRepository.findAllByOrderByUpdatedAtDesc();
        }
        Set<Long> allowed = accessibleClientUserIds(principal);
        return entries.stream()
                .filter(e -> allowed == null || allowed.contains(e.getUserId()))
                .map(this::mapHistory)
                .toList();
    }

    public Map<String, Object> getMedicalHistory(Long id, UserPrincipal principal) {
        MedicalHistoryEntry entry = requireHistory(id);
        assertAdvisorCanAccessClient(principal, entry.getUserId());
        return mapHistory(entry);
    }

    @Transactional
    public Map<String, Object> createMedicalHistory(Map<String, Object> body, UserPrincipal principal) {
        validateHistoryPayload(body, true);
        Long userId = resolveUserId(body);
        assertAdvisorCanAccessClient(principal, userId);
        MedicalHistoryEntry entry = new MedicalHistoryEntry();
        applyHistoryFields(entry, body, userId, true);
        entry.setCreatedByUserId(principal.getId());
        entry.setCreatedByName(displayName(principal));
        entry.setStatus("Active");
        medicalHistoryEntryRepository.save(entry);
        audit(principal, "MEDICAL_HISTORY_CREATE", "MedicalHistoryEntry", String.valueOf(entry.getId()),
                "Created " + entry.getRecordType() + " for " + entry.getClientCode());
        return mapHistory(entry);
    }

    @Transactional
    public Map<String, Object> updateMedicalHistory(Long id, Map<String, Object> body, UserPrincipal principal) {
        MedicalHistoryEntry entry = requireHistory(id);
        if ("Inactive".equalsIgnoreCase(entry.getStatus())) {
            throw new ApiException("CONFLICT", "Inactive records cannot be edited. Reactivate via admin if needed.", HttpStatus.CONFLICT);
        }
        validateHistoryPayload(body, false);
        applyHistoryFields(entry, body, entry.getUserId(), false);
        medicalHistoryEntryRepository.save(entry);
        audit(principal, "MEDICAL_HISTORY_UPDATE", "MedicalHistoryEntry", String.valueOf(entry.getId()),
                "Updated " + entry.getRecordType());
        return mapHistory(entry);
    }

    @Transactional
    public Map<String, Object> deactivateMedicalHistory(Long id, UserPrincipal principal) {
        MedicalHistoryEntry entry = requireHistory(id);
        assertAdvisorCanAccessClient(principal, entry.getUserId());
        if ("Inactive".equalsIgnoreCase(entry.getStatus())) {
            return mapHistory(entry);
        }
        entry.setStatus("Inactive");
        entry.setDeactivatedAt(Instant.now());
        entry.setDeactivatedByUserId(principal.getId());
        medicalHistoryEntryRepository.save(entry);
        audit(principal, "MEDICAL_HISTORY_DEACTIVATE", "MedicalHistoryEntry", String.valueOf(entry.getId()),
                "Marked inactive");
        return mapHistory(entry);
    }

    /* ---------- Risk alert status ---------- */

    @Transactional
    public Map<String, Object> updateRiskAlertStatus(Long id, Map<String, Object> body, UserPrincipal principal) {
        HealthRiskAlert alert =
                healthRiskAlertRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Alert not found", HttpStatus.NOT_FOUND));
        assertAdvisorCanAccessClient(principal, alert.getUserId());
        if (!alert.isActive()) {
            throw new ApiException("CONFLICT", "Inactive alerts cannot be updated", HttpStatus.CONFLICT);
        }
        String status = str(body.get("status"));
        if (isBlank(status)) {
            throw new ApiException("VALIDATION_ERROR", "Status is required", HttpStatus.BAD_REQUEST);
        }
        String normalized = normalizeAlertStatus(status);
        alert.setStatus(normalized);
        healthRiskAlertRepository.save(alert);
        audit(principal, "RISK_ALERT_STATUS_UPDATE", "HealthRiskAlert", String.valueOf(alert.getId()),
                "Status -> " + normalized);
        return mapAlertLite(alert);
    }

    @Transactional
    public Map<String, Object> deactivateRiskAlert(Long id, UserPrincipal principal) {
        HealthRiskAlert alert =
                healthRiskAlertRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Alert not found", HttpStatus.NOT_FOUND));
        assertAdvisorCanAccessClient(principal, alert.getUserId());
        if (!alert.isActive()) {
            return mapAlertLite(alert);
        }
        alert.setActive(false);
        alert.setDeletedAt(Instant.now());
        if (!"Resolved".equalsIgnoreCase(alert.getStatus())) {
            alert.setStatus("Resolved");
        }
        healthRiskAlertRepository.save(alert);
        audit(principal, "RISK_ALERT_DEACTIVATE", "HealthRiskAlert", String.valueOf(alert.getId()), "Soft-deactivated");
        return mapAlertLite(alert);
    }

    /* ---------- Soft-delete health record (profile) ---------- */

    @Transactional
    public Map<String, Object> deactivateHealthRecord(Long id, UserPrincipal principal) {
        HealthProfile profile =
                healthProfileRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Record not found", HttpStatus.NOT_FOUND));
        assertAdvisorCanAccessClient(principal, profile.getUserId());
        if (!profile.isActive()) {
            Map<String, Object> existing = new LinkedHashMap<>();
            existing.put("id", "hr-" + profile.getId());
            existing.put("recordId", profile.getId());
            existing.put("active", false);
            existing.put("recordStatus", profile.getMedicalRecordStatus());
            return existing;
        }
        profile.setActive(false);
        profile.setDeletedAt(Instant.now());
        profile.setDeletedByUserId(principal.getId());
        profile.setMedicalRecordStatus("Inactive");
        healthProfileRepository.save(profile);
        audit(principal, "HEALTH_RECORD_DEACTIVATE", "HealthProfile", String.valueOf(profile.getId()), "Soft-deleted");
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", "hr-" + profile.getId());
        m.put("recordId", profile.getId());
        m.put("active", false);
        m.put("recordStatus", profile.getMedicalRecordStatus());
        return m;
    }

    /* ---------- Safety validation ---------- */

    public List<Map<String, Object>> listSafetyValidations(Long clientUserId, UserPrincipal principal) {
        if (clientUserId != null) {
            assertAdvisorCanAccessClient(principal, clientUserId);
        }
        List<SafetyValidation> list =
                clientUserId == null
                        ? safetyValidationRepository.findAllByOrderByValidatedAtDesc()
                        : safetyValidationRepository.findByUserIdOrderByValidatedAtDesc(clientUserId);
        Set<Long> allowed = accessibleClientUserIds(principal);
        return list.stream()
                .filter(v -> allowed == null || allowed.contains(v.getUserId()))
                .map(this::mapValidation)
                .toList();
    }

    public Map<String, Object> getSafetyValidation(Long id, UserPrincipal principal) {
        SafetyValidation validation = requireValidation(id);
        assertAdvisorCanAccessClient(principal, validation.getUserId());
        return mapValidation(validation);
    }

    @Transactional
    public Map<String, Object> runSafetyValidation(Map<String, Object> body, UserPrincipal principal) {
        Long userId = resolveUserId(body);
        assertAdvisorCanAccessClient(principal, userId);
        List<String> warnings = new ArrayList<>();

        List<MedicalHistoryEntry> history =
                medicalHistoryEntryRepository.findByUserIdAndStatusIgnoreCaseOrderByUpdatedAtDesc(userId, "Active");
        for (MedicalHistoryEntry entry : history) {
            if ("Allergy".equalsIgnoreCase(entry.getRecordType())
                    || (entry.getAllergyInfo() != null && !entry.getAllergyInfo().isBlank())) {
                String label =
                        firstNonBlank(entry.getAllergyInfo(), entry.getConditionName(), entry.getDescription());
                String sev = entry.getSeverity() == null ? "" : " (" + entry.getSeverity() + ")";
                warnings.add("Active allergy on file: " + label + sev);
            }
            if ("Condition".equalsIgnoreCase(entry.getRecordType())
                    && entry.getSeverity() != null
                    && (entry.getSeverity().equalsIgnoreCase("High")
                            || entry.getSeverity().equalsIgnoreCase("Severe"))) {
                warnings.add(
                        "High-severity condition: "
                                + firstNonBlank(entry.getConditionName(), entry.getDescription()));
            }
        }

        healthProfileRepository
                .findByUserId(userId)
                .ifPresent(
                        profile -> {
                            if (profile.getSafetyNotes() != null && !profile.getSafetyNotes().isBlank()) {
                                warnings.add("Profile safety notes: " + profile.getSafetyNotes());
                            }
                            Object parsed = mapper.parseJson(profile.getRecordJson(), Map.of());
                            if (parsed instanceof Map<?, ?> record) {
                                Object mh = record.get("medicalHistory");
                                if (mh instanceof Map<?, ?> historyMap) {
                                    Object allergies = historyMap.get("allergies");
                                    if (allergies instanceof List<?> list && !list.isEmpty()) {
                                        warnings.add("Health record lists " + list.size() + " allerg(y/ies).");
                                    }
                                    Object conditions = historyMap.get("conditions");
                                    if (conditions instanceof List<?> list && !list.isEmpty()) {
                                        warnings.add("Health record lists " + list.size() + " condition(s).");
                                    }
                                }
                            }
                        });

        long openAlerts =
                healthRiskAlertRepository.countByUserIdAndStatusIgnoreCase(userId, "Open")
                        + healthRiskAlertRepository.countByUserIdAndStatusIgnoreCase(userId, "Under Review")
                        + healthRiskAlertRepository.countByUserIdAndStatusIgnoreCase(userId, "Monitoring");
        if (openAlerts > 0) {
            warnings.add(openAlerts + " open/under-review risk alert(s) require attention.");
        }

        healthAssessmentRepository.findFirstByUserIdOrderByAssessedAtDesc(userId).ifPresent(a -> {
            if (Boolean.TRUE.equals(a.getFollowUpRequired())) {
                warnings.add("Latest health assessment requires follow-up.");
            }
            Object obs = mapper.parseJson(a.getObservationsJson(), Map.of());
            if (obs instanceof Map<?, ?> map) {
                Object safety = map.get("safety");
                if (safety != null && !String.valueOf(safety).isBlank()) {
                    warnings.add("Assessment safety note: " + safety);
                }
            }
        });

        String result;
        if (warnings.isEmpty()) {
            result = "Cleared";
        } else if (warnings.stream().anyMatch(w -> w.toLowerCase(Locale.ROOT).contains("high-severity")
                || w.toLowerCase(Locale.ROOT).contains("allergy"))) {
            result = "Needs Review";
        } else {
            result = "Caution";
        }

        SafetyValidation validation = new SafetyValidation();
        validation.setUserId(userId);
        validation.setClientCode(str(body.getOrDefault("clientId", "BF-C" + userId)));
        validation.setClientName(str(body.getOrDefault("clientName", clientName(userId))));
        validation.setReferenceType(str(body.getOrDefault("referenceType", "CLIENT")));
        validation.setReferenceId(str(body.get("referenceId")));
        validation.setResultStatus(result);
        validation.setWarningsJson(mapper.toJson(warnings));
        validation.setAdvisorNotes(str(body.get("advisorNotes")));
        validation.setValidatedByUserId(principal.getId());
        validation.setValidatedByName(displayName(principal));
        validation.setValidatedAt(Instant.now());
        safetyValidationRepository.save(validation);

        audit(principal, "SAFETY_VALIDATION_RUN", "SafetyValidation", String.valueOf(validation.getId()),
                result + " with " + warnings.size() + " warning(s)");
        return mapValidation(validation);
    }

    /* ---------- Clients for medical forms (from appointments) ---------- */

    /**
     * Clients the Medical Advisor may pick in Select Client forms.
     * Source of truth: appointments where attendance is ATTENDED (set by Attend).
     * Deduplicated by client user id. Does not return all registered patients.
     */
    public List<Map<String, Object>> medicalClientsForAdvisor(UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException("UNAUTHORIZED", "Authentication required", HttpStatus.UNAUTHORIZED);
        }
        List<Appointment> appointments =
                principal.hasRole(RoleName.ADMIN)
                        ? appointmentRepository.findByProfessionalRoleContainingIgnoreCaseOrderByAppointmentDateAsc(
                                "Medical")
                        : appointmentRepository.findByProfessionalUserIdOrderByAppointmentDateDesc(principal.getId());

        LinkedHashMap<Long, Map<String, Object>> byClient = new LinkedHashMap<>();
        for (Appointment appointment : appointments) {
            if (appointment.getClientUserId() == null) continue;
            if (!"ATTENDED".equalsIgnoreCase(appointment.getAttendance())) continue;
            Long clientUserId = appointment.getClientUserId();
            if (byClient.containsKey(clientUserId)) continue;

            User client = userRepository.findById(clientUserId).orElse(null);
            if (client == null || client.getDeletedAt() != null) continue;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", clientUserId);
            row.put("userId", clientUserId);
            row.put(
                    "clientId",
                    firstNonBlank(appointment.getClientId(), "BF-C" + clientUserId));
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
            byClient.put(clientUserId, row);
        }
        return new ArrayList<>(byClient.values());
    }

    /**
     * Client user ids this advisor may access clinically. {@code null} means unrestricted (ADMIN).
     * Same source of truth as Select Client: attendance ATTENDED.
     */
    public Set<Long> accessibleClientUserIds(UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException("UNAUTHORIZED", "Authentication required", HttpStatus.UNAUTHORIZED);
        }
        if (principal.hasRole(RoleName.ADMIN)) {
            return null;
        }
        return medicalClientsForAdvisor(principal).stream()
                .map(row -> asLong(row.get("userId")))
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    public List<Map<String, Object>> filterRowsByAccessibleClients(
            UserPrincipal principal, List<Map<String, Object>> rows) {
        Set<Long> allowed = accessibleClientUserIds(principal);
        if (allowed == null) {
            return rows;
        }
        return rows.stream()
                .filter(row -> allowed.contains(asLong(row.get("userId"))))
                .toList();
    }

    public void assertAdvisorCanAccessClient(UserPrincipal principal, Long clientUserId) {
        if (principal == null || clientUserId == null) {
            throw new ApiException("FORBIDDEN", "Client access denied", HttpStatus.FORBIDDEN);
        }
        if (principal.hasRole(RoleName.ADMIN)) {
            return;
        }
        boolean attended =
                appointmentRepository.existsByProfessionalUserIdAndClientUserIdAndAttendanceIgnoreCase(
                        principal.getId(), clientUserId, "ATTENDED");
        if (!attended) {
            // Fallback for any legacy casing / stream check
            boolean hasAttended =
                    appointmentRepository
                            .findByProfessionalUserIdOrderByAppointmentDateDesc(principal.getId())
                            .stream()
                            .anyMatch(
                                    a ->
                                            clientUserId.equals(a.getClientUserId())
                                                    && a.getAttendance() != null
                                                    && "ATTENDED".equalsIgnoreCase(a.getAttendance().trim()));
            if (!hasAttended) {
                throw new ApiException(
                        "FORBIDDEN",
                        "Attend this client from Appointments before accessing their medical information.",
                        HttpStatus.FORBIDDEN);
            }
        }
    }

    public void assertRelatedAssessmentBelongsToClient(Long clientUserId, Object relatedAssessmentId) {
        if (relatedAssessmentId == null) return;
        String raw = String.valueOf(relatedAssessmentId).trim();
        if (raw.isEmpty() || "null".equalsIgnoreCase(raw)) return;
        String digits = raw.replaceAll("\\D+", "");
        if (digits.isEmpty()) {
            throw new ApiException("VALIDATION_ERROR", "Invalid related assessment", HttpStatus.BAD_REQUEST);
        }
        Long assessmentId;
        try {
            assessmentId = Long.parseLong(digits);
        } catch (NumberFormatException ex) {
            throw new ApiException("VALIDATION_ERROR", "Invalid related assessment", HttpStatus.BAD_REQUEST);
        }
        HealthAssessment assessment =
                healthAssessmentRepository
                        .findById(assessmentId)
                        .orElseThrow(
                                () ->
                                        new ApiException(
                                                "NOT_FOUND", "Related assessment not found", HttpStatus.NOT_FOUND));
        if (!clientUserId.equals(assessment.getUserId())) {
            throw new ApiException(
                    "FORBIDDEN",
                    "Related assessment does not belong to the selected client",
                    HttpStatus.FORBIDDEN);
        }
    }

    private static boolean isCancelledStatus(String status) {
        return status != null && status.trim().equalsIgnoreCase("Cancelled");
    }

    /* ---------- helpers ---------- */

    private MedicalHistoryEntry requireHistory(Long id) {
        return medicalHistoryEntryRepository
                .findById(id)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Medical history entry not found", HttpStatus.NOT_FOUND));
    }

    private SafetyValidation requireValidation(Long id) {
        return safetyValidationRepository
                .findById(id)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Safety validation not found", HttpStatus.NOT_FOUND));
    }

    private void validateHistoryPayload(Map<String, Object> body, boolean creating) {
        String type = str(body.get("recordType"));
        if (creating && isBlank(type)) {
            throw new ApiException("VALIDATION_ERROR", "Record type is required", HttpStatus.BAD_REQUEST);
        }
        if (!isBlank(type)
                && !List.of("Condition", "Allergy", "Other", "History").contains(type)) {
            // allow free text types but prefer known ones
        }
        if (creating && isBlank(body.get("clientId")) && body.get("userId") == null && body.get("clientUserId") == null) {
            throw new ApiException("VALIDATION_ERROR", "Client is required", HttpStatus.BAD_REQUEST);
        }
        boolean isAllergy = "Allergy".equalsIgnoreCase(type);
        boolean isCondition = "Condition".equalsIgnoreCase(type);
        if (creating && isAllergy && isBlank(body.get("allergyInfo")) && isBlank(body.get("conditionName"))) {
            throw new ApiException("VALIDATION_ERROR", "Allergy information is required", HttpStatus.BAD_REQUEST);
        }
        if (creating && isCondition && isBlank(body.get("conditionName"))) {
            throw new ApiException("VALIDATION_ERROR", "Condition name is required", HttpStatus.BAD_REQUEST);
        }
        if (creating && isBlank(body.get("description")) && isBlank(body.get("conditionName")) && isBlank(body.get("allergyInfo"))) {
            throw new ApiException("VALIDATION_ERROR", "Description or condition/allergy details are required", HttpStatus.BAD_REQUEST);
        }
        if (body.containsKey("recordedDate") && !isBlank(body.get("recordedDate"))) {
            LocalDate recordedDate;
            try {
                recordedDate = LocalDate.parse(str(body.get("recordedDate")).trim());
            } catch (Exception ex) {
                throw new ApiException(
                        "VALIDATION_ERROR", "Please enter a valid date.", HttpStatus.BAD_REQUEST);
            }
            LocalDate today = LocalDate.now(java.time.ZoneId.systemDefault());
            if (recordedDate.isAfter(today)) {
                throw new ApiException(
                        "VALIDATION_ERROR",
                        "Future dates are not allowed.",
                        HttpStatus.BAD_REQUEST);
            }
        }
    }

    private void applyHistoryFields(MedicalHistoryEntry entry, Map<String, Object> body, Long userId, boolean creating) {
        if (creating) {
            entry.setUserId(userId);
            entry.setClientCode(str(body.getOrDefault("clientId", "BF-C" + userId)));
            entry.setClientName(str(body.getOrDefault("clientName", clientName(userId))));
        }
        if (body.get("recordType") != null) entry.setRecordType(str(body.get("recordType")));
        if (body.containsKey("conditionName")) entry.setConditionName(str(body.get("conditionName")));
        if (body.containsKey("allergyInfo")) entry.setAllergyInfo(str(body.get("allergyInfo")));
        if (body.containsKey("description")) entry.setDescription(str(body.get("description")));
        if (body.containsKey("severity")) entry.setSeverity(str(body.get("severity")));
        if (body.containsKey("recordedDate")) {
            String d = str(body.get("recordedDate"));
            if (isBlank(d)) {
                entry.setRecordedDate(null);
            } else {
                LocalDate recordedDate;
                try {
                    recordedDate = LocalDate.parse(d.trim());
                } catch (Exception ex) {
                    throw new ApiException(
                            "VALIDATION_ERROR", "Please enter a valid date.", HttpStatus.BAD_REQUEST);
                }
                LocalDate today = LocalDate.now(java.time.ZoneId.systemDefault());
                if (recordedDate.isAfter(today)) {
                    throw new ApiException(
                            "VALIDATION_ERROR",
                            "Future dates are not allowed.",
                            HttpStatus.BAD_REQUEST);
                }
                entry.setRecordedDate(recordedDate);
            }
        } else if (creating && entry.getRecordedDate() == null) {
            entry.setRecordedDate(LocalDate.now(java.time.ZoneId.systemDefault()));
        }
    }

    private Map<String, Object> mapHistory(MedicalHistoryEntry e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", e.getId());
        m.put("userId", e.getUserId());
        m.put("clientId", e.getClientCode());
        m.put("clientName", e.getClientName());
        m.put("recordType", e.getRecordType());
        m.put("conditionName", e.getConditionName());
        m.put("allergyInfo", e.getAllergyInfo());
        m.put("description", e.getDescription());
        m.put("severity", e.getSeverity());
        m.put("recordedDate", e.getRecordedDate() == null ? null : e.getRecordedDate().toString());
        m.put("status", e.getStatus());
        m.put("createdBy", e.getCreatedByName());
        m.put("createdByUserId", e.getCreatedByUserId());
        m.put("createdAt", e.getCreatedAt() == null ? null : e.getCreatedAt().toString());
        m.put("updatedAt", e.getUpdatedAt() == null ? null : e.getUpdatedAt().toString());
        m.put("deactivatedAt", e.getDeactivatedAt() == null ? null : e.getDeactivatedAt().toString());
        return m;
    }

    private Map<String, Object> mapValidation(SafetyValidation v) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", v.getId());
        m.put("userId", v.getUserId());
        m.put("clientId", v.getClientCode());
        m.put("clientName", v.getClientName());
        m.put("referenceType", v.getReferenceType());
        m.put("referenceId", v.getReferenceId());
        m.put("resultStatus", v.getResultStatus());
        m.put("status", v.getResultStatus());
        Object warnings = mapper.parseJson(v.getWarningsJson(), List.of());
        m.put("warnings", warnings);
        m.put("advisorNotes", v.getAdvisorNotes());
        m.put("validatedBy", v.getValidatedByName());
        m.put("validatedByUserId", v.getValidatedByUserId());
        m.put("validatedAt", v.getValidatedAt() == null ? null : v.getValidatedAt().toString());
        m.put("createdAt", v.getCreatedAt() == null ? null : v.getCreatedAt().toString());
        return m;
    }

    private Map<String, Object> mapAlertLite(HealthRiskAlert a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", String.valueOf(a.getId()));
        m.put("clientId", a.getClientCode());
        m.put("clientName", a.getClientName());
        m.put("title", a.getTitle());
        m.put("status", a.getStatus());
        m.put("priority", a.getPriority());
        m.put("active", a.isActive());
        m.put("updatedAt", a.getUpdatedAt() == null ? null : a.getUpdatedAt().toString());
        return m;
    }

    private String normalizeAlertStatus(String status) {
        String s = status.trim();
        if (s.equalsIgnoreCase("Active") || s.equalsIgnoreCase("Open") || s.equalsIgnoreCase("Monitoring")) {
            return "Open";
        }
        if (s.equalsIgnoreCase("Under Review")) return "Under Review";
        if (s.equalsIgnoreCase("Resolved") || s.equalsIgnoreCase("Closed")) return "Resolved";
        return s;
    }

    @Transactional
    public Map<String, Object> markAppointmentAttendance(
            UserPrincipal principal, String appointmentId, Map<String, Object> body) {
        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElseThrow(
                                () -> new ApiException("NOT_FOUND", "Appointment not found", HttpStatus.NOT_FOUND));

        boolean admin = principal != null && principal.hasRole(RoleName.ADMIN);
        boolean owner =
                principal != null
                        && appointment.getProfessionalUserId() != null
                        && Objects.equals(appointment.getProfessionalUserId(), principal.getId());
        if (!admin && !owner) {
            throw new ApiException(
                    "FORBIDDEN", "You can only mark attendance for your own appointments", HttpStatus.FORBIDDEN);
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
                    "CONFLICT", "Attendance has already been marked for this appointment.", HttpStatus.CONFLICT);
        }

        String attendance = str(body.get("attendance"));
        if (attendance == null) {
            throw new ApiException("VALIDATION_ERROR", "attendance is required", HttpStatus.BAD_REQUEST);
        }
        String attendanceNorm = attendance.trim().toUpperCase(Locale.ROOT);
        String note = str(body.get("note"));
        Instant now = Instant.now();

        if ("ATTENDED".equals(attendanceNorm)) {
            appointment.setAttendance("ATTENDED");
            appointment.setAttendanceNote(isBlank(note) ? null : note.trim());
            appointment.setAttendanceMarkedAt(now);
            appointment.setStatus("Completed");
            appointment.setUpdatedAt(now);
            appointmentRepository.save(appointment);
            audit(
                    principal,
                    "MEDICAL_APPOINTMENT_ATTENDED",
                    "Appointment",
                    appointment.getId(),
                    "Marked attended for " + firstNonBlank(appointment.getClientName(), "client"));
            return mapper.appointmentMap(appointment);
        }

        if ("ADVISOR_UNAVAILABLE".equals(attendanceNorm)) {
            if (isBlank(note)) {
                throw new ApiException(
                        "VALIDATION_ERROR",
                        "A reason is required when marking advisor unavailable.",
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
                    isBlank(appointment.getAppointmentTime()) ? "the scheduled time" : appointment.getAppointmentTime();
            String bodyText =
                    "Your medical review on "
                            + dateLabel
                            + " at "
                            + timeLabel
                            + " could not go ahead because the advisor was unavailable. Please reschedule. Reason: "
                            + reason;

            if (appointment.getClientUserId() != null) {
                NotificationEntity n = new NotificationEntity();
                n.setId("ntf-" + UUID.randomUUID().toString().substring(0, 8));
                n.setUserId(appointment.getClientUserId());
                n.setAudience("CLIENT");
                n.setType("appointments");
                n.setTitle("Medical appointment unavailable");
                n.setBody(bodyText);
                n.setLink("/client/appointments/" + appointment.getId() + "/reschedule");
                n.setReadFlag(false);
                n.setCreatedAt(now);
                notificationRepository.save(n);
            }

            audit(
                    principal,
                    "MEDICAL_APPOINTMENT_ADVISOR_UNAVAILABLE",
                    "Appointment",
                    appointment.getId(),
                    "Advisor unavailable: " + reason);
            return mapper.appointmentMap(appointment);
        }

        throw new ApiException(
                "VALIDATION_ERROR",
                "attendance must be ATTENDED or ADVISOR_UNAVAILABLE",
                HttpStatus.BAD_REQUEST);
    }

    public Long resolveClientUserId(Map<String, Object> body) {
        return resolveUserId(body);
    }

    private Long resolveUserId(Map<String, Object> body) {
        Long fromUserId = asLong(body.get("userId"));
        if (fromUserId != null && userRepository.existsById(fromUserId)) return fromUserId;
        Long fromClientUserId = asLong(body.get("clientUserId"));
        if (fromClientUserId != null && userRepository.existsById(fromClientUserId)) return fromClientUserId;

        String clientId = str(body.get("clientId"));
        if (!isBlank(clientId)) {
            // Real codes are "BF-C" + database user id (no demo email lookup).
            Long fromDigits = asLong(clientId.replaceAll("\\D+", ""));
            if (fromDigits != null && userRepository.existsById(fromDigits)) return fromDigits;
        }
        throw new ApiException("VALIDATION_ERROR", "Client is required", HttpStatus.BAD_REQUEST);
    }

    private static Long asLong(Object value) {
        if (value instanceof Number n) return n.longValue();
        if (value instanceof String s && !s.isBlank()) {
            try {
                return Long.parseLong(s.trim());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private String clientName(Long userId) {
        return userRepository
                .findById(userId)
                .map(u -> (u.getFirstName() + " " + u.getLastName()).trim())
                .orElse("Client");
    }

    private String displayName(UserPrincipal principal) {
        if (principal == null) return "Medical Advisor";
        return userRepository
                .findById(principal.getId())
                .map(User::getFullName)
                .filter(n -> n != null && !n.isBlank())
                .orElse(principal.getUsername());
    }

    private void audit(UserPrincipal principal, String action, String entityType, String entityId, String details) {
        if (principal == null) return;
        auditService.log(principal.getId(), action, entityType, entityId, "SUCCESS", null, null, details);
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private static boolean isBlank(Object o) {
        return o == null || String.valueOf(o).isBlank();
    }

    private static String firstNonBlank(String... values) {
        if (values == null) return "";
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return "";
    }
}
