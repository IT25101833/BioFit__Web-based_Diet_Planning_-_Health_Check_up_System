package com.biofit.backend.domain;

import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/medical")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MEDICAL_ADVISOR','ADMIN')")
public class MedicalDomainController {

    private final DomainService domainService;
    private final CompletionService completionService;
    private final MedicalAdvisorService medicalAdvisorService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> dash = domainService.medicalDashboard(principal.getId());
        List<Map<String, Object>> recentAssessments =
                medicalAdvisorService
                        .filterRowsByAccessibleClients(principal, completionService.medicalAssessments())
                        .stream()
                        .limit(5)
                        .toList();
        List<Map<String, Object>> activeAlerts =
                medicalAdvisorService
                        .filterRowsByAccessibleClients(principal, completionService.healthAlerts())
                        .stream()
                        .limit(5)
                        .toList();
        dash.put("recentAssessments", recentAssessments);
        dash.put("activeAlerts", activeAlerts);
        return ApiResponse.ok(dash);
    }

    @GetMapping("/profile")
    public ApiResponse<Map<String, Object>> profile(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientProfile(principal.getId()));
    }

    @PatchMapping("/profile")
    public ApiResponse<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.updateClientProfile(principal.getId(), body));
    }

    @GetMapping("/appointments")
    public ApiResponse<List<Map<String, Object>>> appointments(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal.hasRole(RoleName.ADMIN)) {
            return ApiResponse.ok(domainService.appointmentsForRole("Medical"));
        }
        return ApiResponse.ok(domainService.appointmentsForProfessional(principal.getId()));
    }

    @PatchMapping("/appointments/{id}/attendance")
    public ApiResponse<Map<String, Object>> markAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(medicalAdvisorService.markAppointmentAttendance(principal, id, body));
    }

    @GetMapping("/assessments")
    public ApiResponse<List<Map<String, Object>>> assessments(
            @AuthenticationPrincipal UserPrincipal principal,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long clientUserId) {
        if (clientUserId != null) {
            medicalAdvisorService.assertAdvisorCanAccessClient(principal, clientUserId);
        }
        List<Map<String, Object>> rows = completionService.medicalAssessments(clientUserId);
        return ApiResponse.ok(medicalAdvisorService.filterRowsByAccessibleClients(principal, rows));
    }

    @GetMapping("/assessments/{id}")
    public ApiResponse<Map<String, Object>> assessment(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        Map<String, Object> row = completionService.medicalAssessment(id);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, asLong(row.get("userId")));
        return ApiResponse.ok(row);
    }

    @PostMapping("/assessments")
    public ApiResponse<Map<String, Object>> create(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        Long clientUserId = medicalAdvisorService.resolveClientUserId(body);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, clientUserId);
        body.put("userId", clientUserId);
        return ApiResponse.ok(completionService.saveMedicalAssessment(null, body));
    }

    @PutMapping("/assessments/{id}")
    public ApiResponse<Map<String, Object>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> existing = completionService.medicalAssessment(id);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, asLong(existing.get("userId")));
        if (body.get("userId") != null || body.get("clientUserId") != null || body.get("clientId") != null) {
            Long clientUserId = medicalAdvisorService.resolveClientUserId(body);
            medicalAdvisorService.assertAdvisorCanAccessClient(principal, clientUserId);
            body.put("userId", clientUserId);
        }
        return ApiResponse.ok(completionService.saveMedicalAssessment(id, body));
    }

    @GetMapping("/health-alerts")
    public ApiResponse<List<Map<String, Object>>> alerts(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(
                medicalAdvisorService.filterRowsByAccessibleClients(principal, completionService.healthAlerts()));
    }

    @GetMapping("/health-alerts/{id}")
    public ApiResponse<Map<String, Object>> alert(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        Map<String, Object> row = completionService.healthAlert(id);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, asLong(row.get("userId")));
        return ApiResponse.ok(row);
    }

    @PostMapping("/health-alerts")
    public ApiResponse<Map<String, Object>> createAlert(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        Long clientUserId = medicalAdvisorService.resolveClientUserId(body);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, clientUserId);
        body.put("userId", clientUserId);
        medicalAdvisorService.assertRelatedAssessmentBelongsToClient(clientUserId, body.get("relatedAssessmentId"));
        return ApiResponse.ok(completionService.saveHealthAlert(null, body));
    }

    @PutMapping("/health-alerts/{id}")
    public ApiResponse<Map<String, Object>> updateAlert(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> existing = completionService.healthAlert(id);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, asLong(existing.get("userId")));
        if (body.get("userId") != null || body.get("clientUserId") != null || body.get("clientId") != null) {
            Long clientUserId = medicalAdvisorService.resolveClientUserId(body);
            medicalAdvisorService.assertAdvisorCanAccessClient(principal, clientUserId);
            body.put("userId", clientUserId);
            medicalAdvisorService.assertRelatedAssessmentBelongsToClient(
                    clientUserId, body.get("relatedAssessmentId"));
        }
        return ApiResponse.ok(completionService.saveHealthAlert(id, body));
    }

    @PatchMapping("/health-alerts/{id}")
    public ApiResponse<Map<String, Object>> patchAlert(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> existing = completionService.healthAlert(id);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, asLong(existing.get("userId")));
        return ApiResponse.ok(completionService.patchHealthAlert(id, body));
    }

    @GetMapping("/health-records")
    public ApiResponse<List<Map<String, Object>>> records(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(
                medicalAdvisorService.filterRowsByAccessibleClients(principal, completionService.healthRecords()));
    }

    @GetMapping("/health-records/{id}")
    public ApiResponse<Map<String, Object>> record(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        String numeric = id.startsWith("hr-") ? id.substring(3) : id;
        Map<String, Object> row = completionService.healthRecord(Long.parseLong(numeric));
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, asLong(row.get("userId")));
        return ApiResponse.ok(row);
    }

    @PostMapping("/health-records")
    public ApiResponse<Map<String, Object>> createRecord(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        Long clientUserId = medicalAdvisorService.resolveClientUserId(body);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, clientUserId);
        body.put("userId", clientUserId);
        return ApiResponse.ok(completionService.saveHealthRecord(null, body));
    }

    @PutMapping("/health-records/{id}")
    public ApiResponse<Map<String, Object>> updateRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        String numeric = id.startsWith("hr-") ? id.substring(3) : id;
        Map<String, Object> existing = completionService.healthRecord(Long.parseLong(numeric));
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, asLong(existing.get("userId")));
        Long clientUserId = medicalAdvisorService.resolveClientUserId(body);
        medicalAdvisorService.assertAdvisorCanAccessClient(principal, clientUserId);
        body.put("userId", clientUserId);
        return ApiResponse.ok(completionService.saveHealthRecord(Long.parseLong(numeric), body));
    }

    @PatchMapping("/health-records/{id}/deactivate")
    public ApiResponse<Map<String, Object>> deactivateRecord(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        String numeric = id.startsWith("hr-") ? id.substring(3) : id;
        return ApiResponse.ok(medicalAdvisorService.deactivateHealthRecord(Long.parseLong(numeric), principal));
    }

    @GetMapping("/clients")
    public ApiResponse<List<Map<String, Object>>> clients(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(medicalAdvisorService.medicalClientsForAdvisor(principal));
    }

    @GetMapping("/medical-history")
    public ApiResponse<List<Map<String, Object>>> medicalHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String status,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long clientUserId) {
        return ApiResponse.ok(medicalAdvisorService.listMedicalHistory(status, clientUserId, principal));
    }

    @GetMapping("/medical-history/{id}")
    public ApiResponse<Map<String, Object>> medicalHistoryById(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(medicalAdvisorService.getMedicalHistory(id, principal));
    }

    @PostMapping("/medical-history")
    public ApiResponse<Map<String, Object>> createMedicalHistory(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(medicalAdvisorService.createMedicalHistory(body, principal));
    }

    @PutMapping("/medical-history/{id}")
    public ApiResponse<Map<String, Object>> updateMedicalHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        medicalAdvisorService.getMedicalHistory(id, principal);
        return ApiResponse.ok(medicalAdvisorService.updateMedicalHistory(id, body, principal));
    }

    @PatchMapping("/medical-history/{id}/deactivate")
    public ApiResponse<Map<String, Object>> deactivateMedicalHistory(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(medicalAdvisorService.deactivateMedicalHistory(id, principal));
    }

    @PatchMapping("/health-alerts/{id}/status")
    public ApiResponse<Map<String, Object>> updateAlertStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(medicalAdvisorService.updateRiskAlertStatus(id, body, principal));
    }

    @PatchMapping("/health-alerts/{id}/deactivate")
    public ApiResponse<Map<String, Object>> deactivateAlert(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(medicalAdvisorService.deactivateRiskAlert(id, principal));
    }

    @GetMapping("/safety-validations")
    public ApiResponse<List<Map<String, Object>>> safetyValidations(
            @AuthenticationPrincipal UserPrincipal principal,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long clientUserId) {
        return ApiResponse.ok(medicalAdvisorService.listSafetyValidations(clientUserId, principal));
    }

    @GetMapping("/safety-validations/{id}")
    public ApiResponse<Map<String, Object>> safetyValidation(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(medicalAdvisorService.getSafetyValidation(id, principal));
    }

    @PostMapping("/safety-validations")
    public ApiResponse<Map<String, Object>> runSafetyValidation(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(medicalAdvisorService.runSafetyValidation(body, principal));
    }

    @GetMapping("/escalations")
    public ApiResponse<List<Map<String, Object>>> escalations() {
        return ApiResponse.ok(completionService.escalatedTicketsFor("Medical Advisor"));
    }

    @PostMapping("/escalations/{id}/respond")
    public ApiResponse<Map<String, Object>> respondEscalation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        String authorName =
                principal == null
                        ? "Medical Advisor"
                        : userRepository
                                .findById(principal.getId())
                                .map(User::getFullName)
                                .orElse(principal.getUsername());
        return ApiResponse.ok(completionService.specialistRespond(id, authorName, body));
    }

    @GetMapping("/notifications")
    public ApiResponse<List<Map<String, Object>>> notifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.medicalNotificationsForAdvisor(principal.getId()));
    }

    @PatchMapping("/notifications/{id}/read")
    public ApiResponse<Map<String, Object>> markRead(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.markMedicalNotificationRead(principal.getId(), id));
    }

    @PatchMapping("/notifications/read-all")
    public ApiResponse<Map<String, Object>> markAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.markMedicalNotificationsRead(principal.getId()));
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
}
