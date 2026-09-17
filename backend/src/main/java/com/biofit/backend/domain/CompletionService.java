package com.biofit.backend.domain;

import com.biofit.backend.audit.AuditLogRepository;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.health.HealthAssessment;
import com.biofit.backend.health.HealthAssessmentRepository;
import com.biofit.backend.health.HealthProfile;
import com.biofit.backend.health.HealthProfileRepository;
import com.biofit.backend.health.HealthRiskAlert;
import com.biofit.backend.health.HealthRiskAlertRepository;
import com.biofit.backend.user.Role;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.RoleRepository;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import com.biofit.backend.user.UserStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
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
public class CompletionService {

    private final HealthAssessmentRepository healthAssessmentRepository;
    private final HealthRiskAlertRepository healthRiskAlertRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final FitnessAssessmentRepository fitnessAssessmentRepository;
    private final ClientInquiryRepository inquiryRepository;
    private final ClientFeedbackRepository feedbackRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final DomainMapper mapper;

    private static final DateTimeFormatter DAY = DateTimeFormatter.ISO_LOCAL_DATE;

    /* ---------- Medical assessments ---------- */

    public List<Map<String, Object>> medicalAssessments() {
        return medicalAssessments(null);
    }

    public List<Map<String, Object>> medicalAssessments(Long clientUserId) {
        List<HealthAssessment> assessments =
                clientUserId == null
                        ? healthAssessmentRepository.findAll()
                        : healthAssessmentRepository.findByUserIdOrderByAssessedAtDesc(clientUserId);
        return assessments.stream().map(this::mapMedicalAssessment).toList();
    }

    public Map<String, Object> medicalAssessment(Long id) {
        return mapMedicalAssessment(
                healthAssessmentRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Assessment not found", HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public Map<String, Object> saveMedicalAssessment(Long id, Map<String, Object> body) {
        HealthAssessment a = id == null ? new HealthAssessment() : healthAssessmentRepository.findById(id).orElse(new HealthAssessment());
        if (a.getId() == null) {
            a.setAssessedAt(Instant.now());
            a.setCreatedAt(Instant.now());
        }
        Long userId = resolveUserId(body);
        a.setUserId(userId);
        a.setClientCode(str(body.getOrDefault("clientId", "BF-C" + userId)));
        a.setTitle(str(body.getOrDefault("type", body.getOrDefault("title", "Health assessment"))));
        a.setAssessmentType(str(body.getOrDefault("type", "General")));
        a.setAdvisorName(str(body.getOrDefault("advisor", "Medical Advisor")));
        a.setFollowUpRequired(Boolean.TRUE.equals(body.get("followUpRequired")));
        String status = str(body.get("status"));
        if (isBlank(status)) {
            status = Boolean.TRUE.equals(a.getFollowUpRequired()) ? "Follow-up Required" : "Completed";
        }
        a.setStatus(status);
        a.setRelatedAlertId(isBlank(body.get("relatedAlertId")) ? null : str(body.get("relatedAlertId")));
        a.setProfessionalNotes(str(body.get("professionalNotes")));
        a.setSummary(str(body.getOrDefault("summary", a.getProfessionalNotes())));
        a.setObservationsJson(mapper.toJson(body.getOrDefault("observations", Map.of())));
        if (!isBlank(body.get("date"))) {
            LocalDate assessmentDate = LocalDate.parse(str(body.get("date")).trim());
            LocalDate today = LocalDate.now(java.time.ZoneId.systemDefault());
            if (assessmentDate.isBefore(today)) {
                throw new ApiException(
                        "VALIDATION_ERROR",
                        "Assessment date cannot be in the past. Please select today or a future date.",
                        HttpStatus.BAD_REQUEST);
            }
            a.setAssessedAt(assessmentDate.atStartOfDay().toInstant(ZoneOffset.UTC));
        }
        if (body.containsKey("nextReview")) {
            a.setNextReviewAt(parseOptionalDate(body.get("nextReview")));
        }
        if (isBlank(a.getTitle())) {
            a.setTitle(isBlank(a.getAssessmentType()) ? "Health assessment" : a.getAssessmentType());
        }
        healthAssessmentRepository.save(a);
        return mapMedicalAssessment(a);
    }

    /* ---------- Health alerts ---------- */

    public List<Map<String, Object>> healthAlerts() {
        return healthRiskAlertRepository.findAll().stream()
                .filter(HealthRiskAlert::isActive)
                .map(this::mapAlert)
                .toList();
    }

    public Map<String, Object> healthAlert(Long id) {
        return mapAlert(
                healthRiskAlertRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Alert not found", HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public Map<String, Object> saveHealthAlert(Long id, Map<String, Object> body) {
        HealthRiskAlert alert =
                id == null ? new HealthRiskAlert() : healthRiskAlertRepository.findById(id).orElse(new HealthRiskAlert());
        Long userId = resolveUserId(body);
        alert.setUserId(userId);
        alert.setClientCode(str(body.getOrDefault("clientId", "BF-C" + userId)));
        alert.setClientName(str(body.getOrDefault("clientName", clientName(userId))));
        alert.setTitle(str(body.getOrDefault("title", "Health alert")));
        alert.setStatus(str(body.getOrDefault("status", "Open")));
        alert.setPriority(str(body.getOrDefault("priority", "Medium")));
        alert.setReason(str(body.get("reason")));
        alert.setGuidance(str(body.getOrDefault("guidance", body.get("reason"))));
        alert.setAssignedAdvisor(str(body.getOrDefault("assignedAdvisor", "Elena Costa")));
        alert.setRelatedAssessmentId(str(body.get("relatedAssessmentId")));
        if (alert.getDateRaised() == null) alert.setDateRaised(Instant.now());
        Instant followUpAt = parseOptionalDate(body.get("followUpDate"));
        if (followUpAt != null || (body.containsKey("followUpDate") && isBlank(body.get("followUpDate")))) {
            alert.setFollowUpAt(followUpAt);
        }
        Map<String, Object> details = new LinkedHashMap<>();
        if (body.get("followUp") != null) details.put("followUp", body.get("followUp"));
        if (body.get("wellnessImpact") != null) details.put("wellnessImpact", body.get("wellnessImpact"));
        if (body.get("guidance") instanceof Map<?, ?> g) details.put("guidance", g);
        else {
            Map<String, Object> guidance = new LinkedHashMap<>();
            guidance.put("summary", str(body.getOrDefault("guidance", body.get("reason"))));
            details.put("guidance", guidance);
        }
        if (body.get("activity") != null) details.put("activity", body.get("activity"));
        alert.setDetailsJson(mapper.toJson(details));
        healthRiskAlertRepository.save(alert);
        return mapAlert(alert);
    }

    @Transactional
    public Map<String, Object> patchHealthAlert(Long id, Map<String, Object> body) {
        HealthRiskAlert alert =
                healthRiskAlertRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Alert not found", HttpStatus.NOT_FOUND));
        if (body.get("status") != null) alert.setStatus(str(body.get("status")));
        if (body.get("priority") != null) alert.setPriority(str(body.get("priority")));
        if (body.get("guidance") != null) {
            if (body.get("guidance") instanceof String) alert.setGuidance(str(body.get("guidance")));
            Map<String, Object> details = detailsMap(alert);
            details.put("guidance", body.get("guidance"));
            alert.setDetailsJson(mapper.toJson(details));
        }
        if (body.get("followUp") != null) {
            Map<String, Object> details = detailsMap(alert);
            details.put("followUp", body.get("followUp"));
            alert.setDetailsJson(mapper.toJson(details));
        }
        if (body.get("activity") != null) {
            Map<String, Object> details = detailsMap(alert);
            details.put("activity", body.get("activity"));
            alert.setDetailsJson(mapper.toJson(details));
        }
        healthRiskAlertRepository.save(alert);
        return mapAlert(alert);
    }

    /* ---------- Health records ---------- */

    public List<Map<String, Object>> healthRecords() {
        return healthProfileRepository.findAll().stream()
                .filter(HealthProfile::isActive)
                .map(this::mapRecordListItem)
                .toList();
    }

    public Map<String, Object> healthRecord(Long id) {
        HealthProfile profile =
                healthProfileRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Record not found", HttpStatus.NOT_FOUND));
        Map<String, Object> m = mapRecordListItem(profile);
        Object extra = mapper.parseJson(profile.getRecordJson(), Map.of());
        if (extra instanceof Map<?, ?> map) {
            map.forEach((k, v) -> m.put(String.valueOf(k), v));
        }
        m.put(
                "assessments",
                healthAssessmentRepository.findByUserIdOrderByAssessedAtDesc(profile.getUserId()).stream()
                        .map(this::mapMedicalAssessment)
                        .toList());
        m.put(
                "alerts",
                healthRiskAlertRepository.findByUserIdOrderByDateRaisedDesc(profile.getUserId()).stream()
                        .map(this::mapAlert)
                        .toList());
        return m;
    }

    @Transactional
    public Map<String, Object> saveHealthRecord(Long id, Map<String, Object> body) {
        Long userId = resolveUserId(body);
        HealthProfile profile;
        if (id != null) {
            profile =
                    healthProfileRepository
                            .findById(id)
                            .orElseThrow(() -> new ApiException("NOT_FOUND", "Record not found", HttpStatus.NOT_FOUND));
        } else {
            // One medical record per client — create or update by user.
            profile = healthProfileRepository.findByUserId(userId).orElseGet(HealthProfile::new);
        }
        profile.setUserId(userId);
        profile.setClientCode(str(body.getOrDefault("clientId", "BF-C" + userId)));
        if (!isBlank(body.get("programme"))) {
            profile.setProgrammeLabel(str(body.get("programme")));
        }
        if (body.containsKey("assignedCoach")) {
            profile.setAssignedCoach(str(body.get("assignedCoach")));
        }
        if (body.containsKey("assignedNutrition")) {
            profile.setAssignedNutrition(str(body.get("assignedNutrition")));
        }
        String recordStatus = str(body.getOrDefault("recordStatus", body.get("reviewStatus")));
        if (isBlank(recordStatus)) {
            recordStatus = Boolean.TRUE.equals(body.get("followUpRequired")) ? "Review Required" : "Up to Date";
        }
        profile.setMedicalRecordStatus(recordStatus);
        profile.setRecordJson(mapper.toJson(body));
        if (body.containsKey("nextCheckup") || body.containsKey("nextReviewDate")) {
            Instant next =
                    parseOptionalDate(
                            body.containsKey("nextCheckup") && !isBlank(body.get("nextCheckup"))
                                    ? body.get("nextCheckup")
                                    : body.get("nextReviewDate"));
            profile.setNextCheckupAt(next);
        }
        healthProfileRepository.save(profile);
        return mapRecordListItem(profile);
    }

    /* ---------- Fitness assessments ---------- */

    public List<Map<String, Object>> fitnessAssessments() {
        return fitnessAssessmentRepository.findAll().stream().map(this::mapFitness).toList();
    }

    public Map<String, Object> fitnessAssessment(String id) {
        return mapFitness(
                fitnessAssessmentRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Assessment not found", HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public Map<String, Object> saveFitnessAssessment(String id, Map<String, Object> body) {
        FitnessAssessment a =
                id == null
                        ? new FitnessAssessment()
                        : fitnessAssessmentRepository.findById(id).orElse(new FitnessAssessment());
        if (a.getId() == null) a.setId("fa-" + UUID.randomUUID().toString().substring(0, 8));
        a.setClientId(str(body.get("clientId")));
        a.setClientName(str(body.get("clientName")));
        a.setClientUserId(resolveUserId(body));
        a.setCoachName(str(body.getOrDefault("coach", "Daniel Perera")));
        a.setType(str(body.getOrDefault("type", "Fitness assessment")));
        a.setStatus(str(body.getOrDefault("status", "Completed")));
        if (body.get("date") != null) a.setAssessmentDate(LocalDate.parse(str(body.get("date"))));
        else if (a.getAssessmentDate() == null) a.setAssessmentDate(LocalDate.now());
        if (body.get("nextAssessment") != null) a.setNextAssessment(LocalDate.parse(str(body.get("nextAssessment"))));
        a.setPayloadJson(mapper.toJson(body));
        fitnessAssessmentRepository.save(a);
        return mapFitness(a);
    }

    /* ---------- Inquiries / feedback ---------- */

    public List<Map<String, Object>> inquiries() {
        return inquiryRepository.findAll().stream().map(this::mapInquiry).toList();
    }

    @Transactional
    public Map<String, Object> respondInquiry(String id, Map<String, Object> body) {
        ClientInquiry inq =
                inquiryRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Inquiry not found", HttpStatus.NOT_FOUND));
        @SuppressWarnings("unchecked")
        List<Object> responses =
                new ArrayList<>((List<Object>) mapper.parseJson(inq.getResponsesJson(), new ArrayList<>()));
        responses.add(
                Map.of(
                        "id",
                        "r-" + (responses.size() + 1),
                        "body",
                        str(body.getOrDefault("message", body.get("body"))),
                        "author",
                        str(body.getOrDefault("author", "Support")),
                        "at",
                        Instant.now().toString()));
        inq.setResponsesJson(mapper.toJson(responses));
        inq.setStatus(str(body.getOrDefault("status", "Responded")));
        inquiryRepository.save(inq);
        return mapInquiry(inq);
    }

    @Transactional
    public Map<String, Object> convertInquiryToTicket(String id) {
        ClientInquiry inq =
                inquiryRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Inquiry not found", HttpStatus.NOT_FOUND));
        SupportTicketEntity t = new SupportTicketEntity();
        t.setId("tkt-" + UUID.randomUUID().toString().substring(0, 8));
        t.setClientUserId(inq.getClientUserId());
        t.setClientId(inq.getClientId());
        t.setClientName(inq.getClientName());
        t.setSubject(inq.getSubject());
        t.setCategory(inq.getCategory());
        t.setPriority("Medium");
        t.setStatus("Open");
        t.setAssignedTo(inq.getAssignedTo());
        t.setRelatedService("Inquiry conversion");
        t.setMessagesJson(
                mapper.toJson(
                        List.of(
                                Map.of(
                                        "id",
                                        "msg-1",
                                        "from",
                                        "client",
                                        "author",
                                        inq.getClientName(),
                                        "body",
                                        inq.getMessage(),
                                        "at",
                                        Instant.now().toString()))));
        supportTicketRepository.save(t);
        inq.setStatus("Converted");
        inquiryRepository.save(inq);
        return mapper.ticketSummary(t);
    }

    public List<Map<String, Object>> feedback() {
        return feedbackRepository.findAll().stream().map(this::mapFeedback).toList();
    }

    @Transactional
    public Map<String, Object> updateFeedback(String id, Map<String, Object> body) {
        ClientFeedback f =
                feedbackRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Feedback not found", HttpStatus.NOT_FOUND));
        if (body.get("status") != null) f.setStatus(str(body.get("status")));
        if (body.get("assignedTo") != null) f.setAssignedTo(str(body.get("assignedTo")));
        if (body.get("note") != null || body.get("message") != null) {
            @SuppressWarnings("unchecked")
            List<Object> notes = new ArrayList<>((List<Object>) mapper.parseJson(f.getNotesJson(), new ArrayList<>()));
            notes.add(
                    Map.of(
                            "id",
                            "n-" + (notes.size() + 1),
                            "body",
                            str(body.getOrDefault("note", body.get("message"))),
                            "at",
                            Instant.now().toString()));
            f.setNotesJson(mapper.toJson(notes));
        }
        f.setUpdatedAt(Instant.now());
        feedbackRepository.save(f);
        return mapFeedback(f);
    }

    /* ---------- Support ticket mutations ---------- */

    @Transactional
    public Map<String, Object> patchTicket(String id, Map<String, Object> body) {
        SupportTicketEntity t =
                supportTicketRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Ticket not found", HttpStatus.NOT_FOUND));
        if (body.get("status") != null) t.setStatus(str(body.get("status")));
        if (body.get("priority") != null) t.setPriority(str(body.get("priority")));
        if (body.get("category") != null) t.setCategory(str(body.get("category")));
        if (body.get("assignedTo") != null) t.setAssignedTo(str(body.get("assignedTo")));
        if (body.get("waitingOn") != null) t.setWaitingOn(str(body.get("waitingOn")));
        if (body.get("escalation") != null) t.setEscalationJson(mapper.toJson(body.get("escalation")));
        if (body.get("resolution") != null) t.setResolutionJson(mapper.toJson(body.get("resolution")));
        if (body.get("message") != null || body.get("body") != null || body.get("note") != null) {
            @SuppressWarnings("unchecked")
            List<Object> messages =
                    new ArrayList<>((List<Object>) mapper.parseJson(t.getMessagesJson(), new ArrayList<>()));
            boolean internal = Boolean.TRUE.equals(body.get("internal"));
            messages.add(
                    Map.of(
                            "id",
                            "msg-" + (messages.size() + 1),
                            "from",
                            internal ? "internal" : "support",
                            "role",
                            internal ? "internal" : "support",
                            "author",
                            str(body.getOrDefault("author", "Support")),
                            "body",
                            str(body.getOrDefault("message", body.getOrDefault("body", body.get("note")))),
                            "at",
                            Instant.now().toString()));
            t.setMessagesJson(mapper.toJson(messages));
        }
        appendActivity(t, str(body.getOrDefault("activity", "Ticket updated")));
        t.setUpdatedAt(Instant.now());
        supportTicketRepository.save(t);
        return fullTicket(t);
    }

    public Map<String, Object> fullTicket(String id) {
        return fullTicket(
                supportTicketRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Ticket not found", HttpStatus.NOT_FOUND)));
    }

    public List<Map<String, Object>> ticketsByClient(String clientId) {
        return supportTicketRepository.findAll().stream()
                .filter(t -> clientId.equals(t.getClientId()))
                .map(this::fullTicket)
                .toList();
    }

    /* ---------- Admin ---------- */

    public Map<String, Object> adminDashboard() {
        long users = userRepository.count();
        long staff =
                userRepository.findAll().stream()
                        .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() != RoleName.CLIENT))
                        .count();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put(
                "stats",
                List.of(
                        Map.of("label", "Total Users", "value", String.valueOf(users), "hint", "Across all BioFit roles", "icon", "Users"),
                        Map.of("label", "Active Staff Accounts", "value", String.valueOf(staff), "hint", "Currently enabled", "icon", "UserCheck"),
                        Map.of("label", "Open Tickets", "value", String.valueOf(supportTicketRepository.count()), "hint", "Support load", "icon", "TriangleAlert"),
                        Map.of("label", "Backup Status", "value", "Healthy", "hint", "Latest backup successful", "icon", "DatabaseBackup")));
        m.put("users", adminUsers());
        m.put("auditLogs", adminAuditLogs());
        m.put(
                "services",
                List.of(
                        Map.of("name", "BioFit Web Application", "status", "Operational", "checked", "Just now", "issue", "No recent issues"),
                        Map.of("name", "Database Service", "status", "Connected", "checked", "Just now", "issue", "No recent issues"),
                        Map.of("name", "Authentication Service", "status", "Available", "checked", "Just now", "issue", "No recent issues")));
        m.put(
                "backups",
                List.of(
                        Map.of("id", "BKP-latest", "date", LocalDate.now().toString(), "type", "Scheduled", "status", "Successful", "duration", "4m 12s", "by", "System")));
        m.put(
                "roles",
                roleRepository.findAll().stream().map(r -> r.getName().name()).toList());
        m.put("notifications", List.of(Map.of("title", "Platform healthy", "category", "System", "time", "Just now", "read", false)));
        return m;
    }

    public List<Map<String, Object>> adminUsers() {
        return userRepository.findAll().stream()
                .map(
                        u -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            String role =
                                    u.getRoles().stream()
                                            .map(r -> r.getName().name())
                                            .findFirst()
                                            .orElse("CLIENT");
                            m.put("id", "USR-" + u.getId());
                            m.put("userId", u.getId());
                            m.put("name", u.getFullName());
                            m.put(
                                    "initials",
                                    (u.getFirstName().substring(0, 1) + u.getLastName().substring(0, 1)).toUpperCase());
                            m.put("role", role);
                            m.put("email", u.getEmail());
                            m.put("status", u.getStatus() == null ? "ACTIVE" : u.getStatus().name());
                            m.put("type", role.equals("CLIENT") ? "Client" : "Staff");
                            m.put("created", u.getCreatedAt() == null ? "" : u.getCreatedAt().toString());
                            m.put("lastLogin", "-");
                            m.put("verification", u.isEmailVerified() ? "Verified" : "Pending");
                            return m;
                        })
                .toList();
    }

    @Transactional
    public Map<String, Object> updateAdminUser(Long id, Map<String, Object> body) {
        User u =
                userRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));
        if (body.get("status") != null) {
            u.setStatus(UserStatus.valueOf(str(body.get("status")).toUpperCase()));
        }
        if (body.get("firstName") != null) u.setFirstName(str(body.get("firstName")));
        if (body.get("lastName") != null) u.setLastName(str(body.get("lastName")));
        if (body.get("role") != null) {
            RoleName rn = RoleName.valueOf(str(body.get("role")).toUpperCase());
            Role role =
                    roleRepository
                            .findByName(rn)
                            .orElseThrow(() -> new ApiException("ROLE_MISSING", "Role missing", HttpStatus.BAD_REQUEST));
            u.getRoles().clear();
            u.getRoles().add(role);
        }
        userRepository.save(u);
        return adminUsers().stream().filter(x -> id.equals(x.get("userId"))).findFirst().orElseThrow();
    }

    public List<Map<String, Object>> adminAuditLogs() {
        return auditLogRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(50)
                .map(
                        log -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", "AUD-" + log.getId());
                            m.put("time", log.getCreatedAt().toString());
                            m.put("actor", log.getUserId() == null ? "System" : "User #" + log.getUserId());
                            m.put("role", "-");
                            m.put("action", log.getAction());
                            m.put("module", log.getEntityType() == null ? "System" : log.getEntityType());
                            m.put("description", log.getDetails() == null ? log.getAction() : log.getDetails());
                            m.put("outcome", log.getResultStatus() == null ? "SUCCESS" : log.getResultStatus());
                            return m;
                        })
                .toList();
    }

    /* ---------- Seed extras ---------- */

    @Transactional
    public void seedExtrasIfEmpty(Long clientUserId, String clientCode, String clientName) {
        if (fitnessAssessmentRepository.count() == 0) {
            FitnessAssessment fa = new FitnessAssessment();
            fa.setId("fa-1");
            fa.setClientUserId(clientUserId);
            fa.setClientId(clientCode);
            fa.setClientName(clientName);
            fa.setCoachName("Daniel Perera");
            fa.setAssessmentDate(LocalDate.of(2026, 8, 28));
            fa.setType("Movement comfort review");
            fa.setStatus("Completed");
            fa.setNextAssessment(LocalDate.of(2026, 9, 28));
            fa.setPayloadJson(
                    mapper.toJson(
                            Map.of(
                                    "activityLevel",
                                    "Moderate",
                                    "experience",
                                    "Beginner+",
                                    "strength",
                                    "Improving",
                                    "endurance",
                                    "Steady",
                                    "mobility",
                                    "Good",
                                    "goals",
                                    "Consistent movement",
                                    "limitations",
                                    "None significant",
                                    "safetyNotes",
                                    "Progress gradually",
                                    "coachNotes",
                                    "Steady improvement in mobility.")));
            fitnessAssessmentRepository.save(fa);
        }
        if (inquiryRepository.count() == 0) {
            ClientInquiry inq = new ClientInquiry();
            inq.setId("inq-1");
            inq.setClientUserId(clientUserId);
            inq.setClientId(clientCode);
            inq.setClientName(clientName);
            inq.setEmail("client@biofit.demo");
            inq.setPhone("+94 77 000 0000");
            inq.setSubject("Programme schedule question");
            inq.setCategory("Scheduling");
            inq.setMessage("Can I move my Friday session?");
            inq.setStatus("Open");
            inq.setAssignedTo("Priya Nair");
            inq.setResponsesJson("[]");
            inquiryRepository.save(inq);
        }
        if (feedbackRepository.count() == 0) {
            ClientFeedback fb = new ClientFeedback();
            fb.setId("fb-1");
            fb.setClientUserId(clientUserId);
            fb.setClientId(clientCode);
            fb.setClientName(clientName);
            fb.setType("Compliment");
            fb.setSubject("Supportive coaching");
            fb.setMessage("The movement guidance has been clear and supportive.");
            fb.setStatus("Open");
            fb.setAssignedTo("Priya Nair");
            fb.setRelatedService("Fitness");
            fb.setNotesJson("[]");
            feedbackRepository.save(fb);
        }
        // enrich existing health assessment/alerts for medical portal
        healthAssessmentRepository.findByUserIdOrderByAssessedAtDesc(clientUserId).forEach(a -> {
            if (a.getClientCode() == null) {
                a.setClientCode(clientCode);
                a.setAdvisorName("Elena Costa");
                a.setFollowUpRequired(false);
                a.setObservationsJson(
                        mapper.toJson(
                                Map.of(
                                        "general",
                                        "Overall wellness markers within expected ranges.",
                                        "concerns",
                                        "None urgent.",
                                        "restrictions",
                                        "Gradual progression preferred.",
                                        "allergyReview",
                                        "No new allergies.",
                                        "safety",
                                        "Continue supportive programme guidance.")));
                a.setProfessionalNotes("Routine wellness review completed.");
                healthAssessmentRepository.save(a);
            }
        });
        healthRiskAlertRepository.findByUserIdOrderByDateRaisedDesc(clientUserId).forEach(alert -> {
            if (alert.getClientCode() == null) {
                alert.setClientCode(clientCode);
                alert.setClientName(clientName);
                alert.setPriority("Medium");
                alert.setReason(alert.getTitle());
                alert.setAssignedAdvisor("Elena Costa");
                alert.setDetailsJson(
                        mapper.toJson(
                                Map.of(
                                        "followUp",
                                        Map.of("date", LocalDate.now().plusDays(7).toString(), "status", "Scheduled"),
                                        "wellnessImpact",
                                        Map.of("summary", "Monitoring only"),
                                        "guidance",
                                        Map.of("summary", alert.getGuidance() == null ? "" : alert.getGuidance()),
                                        "activity",
                                        List.of())));
                healthRiskAlertRepository.save(alert);
            }
        });
        healthProfileRepository.findByUserId(clientUserId).ifPresent(p -> {
            if (p.getClientCode() == null) {
                p.setClientCode(clientCode);
                p.setProgrammeLabel("Weight Management Programme");
                p.setAssignedCoach("Daniel Perera");
                p.setAssignedNutrition("Maya Fernando");
                p.setNextCheckupAt(LocalDate.of(2026, 9, 25).atStartOfDay().toInstant(ZoneOffset.UTC));
                healthProfileRepository.save(p);
            }
        });
    }

    /* ---------- mappers ---------- */

    private Map<String, Object> mapMedicalAssessment(HealthAssessment a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", String.valueOf(a.getId()));
        m.put("userId", a.getUserId());
        m.put("clientId", a.getClientCode() != null ? a.getClientCode() : "BF-C" + a.getUserId());
        m.put("clientName", clientName(a.getUserId()));
        m.put("title", a.getTitle());
        m.put("date", a.getAssessedAt() == null ? null : DAY.format(a.getAssessedAt().atZone(ZoneOffset.UTC)));
        m.put("type", a.getAssessmentType());
        m.put("advisor", a.getAdvisorName());
        m.put("status", a.getStatus());
        m.put("followUpRequired", Boolean.TRUE.equals(a.getFollowUpRequired()));
        m.put(
                "nextReview",
                a.getNextReviewAt() == null ? null : DAY.format(a.getNextReviewAt().atZone(ZoneOffset.UTC)));
        m.put("observations", mapper.parseJson(a.getObservationsJson(), Map.of()));
        m.put("professionalNotes", a.getProfessionalNotes());
        m.put("relatedAlertId", a.getRelatedAlertId());
        return m;
    }

    private Map<String, Object> mapAlert(HealthRiskAlert a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", String.valueOf(a.getId()));
        m.put("userId", a.getUserId());
        m.put("clientId", a.getClientCode() != null ? a.getClientCode() : "BF-C" + a.getUserId());
        m.put("clientName", a.getClientName() != null ? a.getClientName() : clientName(a.getUserId()));
        m.put("title", a.getTitle());
        m.put("dateRaised", a.getDateRaised() == null ? null : DAY.format(a.getDateRaised().atZone(ZoneOffset.UTC)));
        m.put("priority", a.getPriority());
        m.put("status", a.getStatus());
        m.put("active", a.isActive());
        m.put("reason", a.getReason());
        m.put("assignedAdvisor", a.getAssignedAdvisor());
        m.put("relatedAssessmentId", a.getRelatedAssessmentId());
        Map<String, Object> details = detailsMap(a);
        if (!details.containsKey("followUp")) {
            Map<String, Object> followUp = new LinkedHashMap<>();
            followUp.put(
                    "date",
                    a.getFollowUpAt() == null
                            ? null
                            : DAY.format(a.getFollowUpAt().atZone(ZoneOffset.UTC)));
            followUp.put("status", "Scheduled");
            details.put("followUp", followUp);
        }
        m.put("followUp", details.get("followUp"));
        m.put("wellnessImpact", details.getOrDefault("wellnessImpact", Map.of()));
        Object guidanceDefault = a.getGuidance() == null ? "" : a.getGuidance();
        m.put(
                "guidance",
                details.getOrDefault("guidance", Map.of("summary", guidanceDefault)));
        m.put("activity", details.getOrDefault("activity", List.of()));
        return m;
    }

    private Map<String, Object> mapRecordListItem(HealthProfile p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", "hr-" + p.getId());
        m.put("recordId", p.getId());
        m.put("clientId", p.getClientCode() != null ? p.getClientCode() : "BF-C" + p.getUserId());
        m.put("clientName", clientName(p.getUserId()));
        m.put("programme", p.getProgrammeLabel());
        m.put("recordStatus", p.getMedicalRecordStatus());
        healthAssessmentRepository
                .findFirstByUserIdOrderByAssessedAtDesc(p.getUserId())
                .ifPresent(
                        a ->
                                m.put(
                                        "latestAssessment",
                                        a.getAssessedAt() == null
                                                ? null
                                                : DAY.format(a.getAssessedAt().atZone(ZoneOffset.UTC))));
        m.put("activeRiskAlerts", healthRiskAlertRepository.countByUserIdAndStatusIgnoreCase(p.getUserId(), "Open")
                + healthRiskAlertRepository.countByUserIdAndStatusIgnoreCase(p.getUserId(), "Monitoring"));
        m.put(
                "nextCheckup",
                p.getNextCheckupAt() == null ? null : DAY.format(p.getNextCheckupAt().atZone(ZoneOffset.UTC)));
        m.put("reviewStatus", "Up to date");
        m.put("assignedCoach", p.getAssignedCoach());
        m.put("assignedNutrition", p.getAssignedNutrition());
        m.put("lastUpdated", p.getUpdatedAt() == null ? null : p.getUpdatedAt().toString());
        m.put("active", p.isActive());
        m.put("status", p.isActive() ? "Active" : "Inactive");
        return m;
    }

    private Map<String, Object> mapFitness(FitnessAssessment a) {
        Map<String, Object> m = new LinkedHashMap<>();
        Object payload = mapper.parseJson(a.getPayloadJson(), Map.of());
        if (payload instanceof Map<?, ?> map) {
            map.forEach((k, v) -> m.put(String.valueOf(k), v));
        }
        m.put("id", a.getId());
        m.put("clientId", a.getClientId());
        m.put("clientName", a.getClientName());
        m.put("date", a.getAssessmentDate() == null ? null : a.getAssessmentDate().toString());
        m.put("type", a.getType());
        m.put("coach", a.getCoachName());
        m.put("status", a.getStatus());
        m.put("nextAssessment", a.getNextAssessment() == null ? null : a.getNextAssessment().toString());
        return m;
    }

    private Map<String, Object> mapInquiry(ClientInquiry i) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", i.getId());
        m.put("client", i.getClientName());
        m.put("clientId", i.getClientId());
        m.put("email", i.getEmail());
        m.put("phone", i.getPhone());
        m.put("subject", i.getSubject());
        m.put("category", i.getCategory());
        m.put("receivedAt", i.getReceivedAt() == null ? null : i.getReceivedAt().toString());
        m.put("status", i.getStatus());
        m.put("assignedTo", i.getAssignedTo());
        m.put("message", i.getMessage());
        m.put("responses", mapper.parseJson(i.getResponsesJson(), List.of()));
        return m;
    }

    private Map<String, Object> mapFeedback(ClientFeedback f) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", f.getId());
        m.put("client", f.getClientName());
        m.put("clientId", f.getClientId());
        m.put("type", f.getType());
        m.put("subject", f.getSubject());
        m.put("message", f.getMessage());
        m.put("date", f.getSubmittedAt() == null ? null : f.getSubmittedAt().toString());
        m.put("status", f.getStatus());
        m.put("assignedTo", f.getAssignedTo());
        m.put("relatedService", f.getRelatedService());
        m.put("notes", mapper.parseJson(f.getNotesJson(), List.of()));
        m.put("complaintLifecycle", mapper.parseJson(f.getComplaintLifecycleJson(), null));
        return m;
    }

    private Map<String, Object> fullTicket(SupportTicketEntity t) {
        Map<String, Object> m = mapper.ticketSummary(t);
        m.put("waitingOn", t.getWaitingOn());
        m.put("activityTimeline", mapper.parseJson(t.getActivityJson(), List.of()));
        m.put("escalation", mapper.parseJson(t.getEscalationJson(), null));
        m.put("resolution", mapper.parseJson(t.getResolutionJson(), null));
        return m;
    }

    private void appendActivity(SupportTicketEntity t, String text) {
        @SuppressWarnings("unchecked")
        List<Object> activity =
                new ArrayList<>((List<Object>) mapper.parseJson(t.getActivityJson(), new ArrayList<>()));
        activity.add(Map.of("id", "act-" + (activity.size() + 1), "text", text, "at", Instant.now().toString()));
        t.setActivityJson(mapper.toJson(activity));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> detailsMap(HealthRiskAlert a) {
        Object parsed = mapper.parseJson(a.getDetailsJson(), Map.of());
        if (parsed instanceof Map<?, ?> map) {
            return new LinkedHashMap<>((Map<String, Object>) map);
        }
        return new LinkedHashMap<>();
    }

    private Long resolveUserId(Map<String, Object> body) {
        Long fromNumber = asExistingUserId(body.get("userId"));
        if (fromNumber != null) return fromNumber;
        fromNumber = asExistingUserId(body.get("clientUserId"));
        if (fromNumber != null) return fromNumber;

        String clientId = str(body.get("clientId"));
        if (!isBlank(clientId)) {
            Long fromProfile =
                    healthProfileRepository.findAll().stream()
                            .filter(p -> clientId.equalsIgnoreCase(p.getClientCode()))
                            .map(HealthProfile::getUserId)
                            .filter(id -> id != null && userRepository.existsById(id))
                            .findFirst()
                            .orElse(null);
            if (fromProfile != null) return fromProfile;

            String mappedEmail = DEMO_CLIENT_EMAILS.get(clientId.toUpperCase());
            if (mappedEmail != null) {
                Long fromEmail =
                        userRepository
                                .findByEmailIgnoreCaseAndDeletedAtIsNull(mappedEmail)
                                .map(User::getId)
                                .orElse(null);
                if (fromEmail != null) return fromEmail;
            }

            if (clientId.regionMatches(true, 0, "BF-C", 0, 4)) {
                try {
                    Long parsed = Long.parseLong(clientId.substring(4).trim());
                    if (userRepository.existsById(parsed)) return parsed;
                } catch (Exception ignored) {
                    // Demo UI codes like BF-C1024 are not database user ids.
                }
            }
        }

        String name = str(body.get("clientName"));
        if (!isBlank(name)) {
            String cleaned = name.replaceAll("\\s*\\(.*\\)$", "").trim();
            Long fromName =
                    userRepository.findAll().stream()
                            .filter(u -> u.getDeletedAt() == null)
                            .filter(u -> cleaned.equalsIgnoreCase(u.getFullName()))
                            .map(User::getId)
                            .findFirst()
                            .orElse(null);
            if (fromName != null) return fromName;
        }

        return userRepository
                .findByEmailIgnoreCaseAndDeletedAtIsNull("client@biofit.demo")
                .map(User::getId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Client not found", HttpStatus.NOT_FOUND));
    }

    private static final Map<String, String> DEMO_CLIENT_EMAILS =
            Map.of(
                    "BF-C1024", "alex.perera@biofit.demo",
                    "BF-C1095", "nimali.silva@biofit.demo",
                    "BF-C1088", "sahan.desilva@biofit.demo",
                    "BF-C1110", "dilani.fernando@biofit.demo",
                    "BF-C1102", "taylor.kim@biofit.demo",
                    "BF-C1201", "kasuni.abeysekara@biofit.demo");

    private Long asExistingUserId(Object value) {
        if (value instanceof Number n) {
            long id = n.longValue();
            return userRepository.existsById(id) ? id : null;
        }
        if (value instanceof String s && !s.isBlank()) {
            try {
                long id = Long.parseLong(s.trim());
                return userRepository.existsById(id) ? id : null;
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Instant parseOptionalDate(Object value) {
        if (isBlank(value)) return null;
        try {
            return LocalDate.parse(str(value).trim()).atStartOfDay().toInstant(ZoneOffset.UTC);
        } catch (Exception ex) {
            throw new ApiException("VALIDATION_ERROR", "Invalid date: " + value, HttpStatus.BAD_REQUEST);
        }
    }

    private static boolean isBlank(Object value) {
        if (value == null) return true;
        String s = String.valueOf(value).trim();
        return s.isEmpty() || "null".equalsIgnoreCase(s);
    }

    private String clientName(Long userId) {
        return userRepository.findById(userId).map(User::getFullName).orElse("Client");
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }
}
