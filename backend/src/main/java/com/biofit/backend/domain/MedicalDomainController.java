package com.biofit.backend.domain;

import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.security.UserPrincipal;
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

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> dash = domainService.medicalDashboard(principal.getId());
        dash.put("recentAssessments", completionService.medicalAssessments().stream().limit(5).toList());
        dash.put("activeAlerts", completionService.healthAlerts().stream().limit(5).toList());
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
    public ApiResponse<List<Map<String, Object>>> appointments() {
        return ApiResponse.ok(domainService.appointmentsForRole("Medical"));
    }

    @GetMapping("/assessments")
    public ApiResponse<List<Map<String, Object>>> assessments(
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long clientUserId) {
        return ApiResponse.ok(completionService.medicalAssessments(clientUserId));
    }

    @GetMapping("/assessments/{id}")
    public ApiResponse<Map<String, Object>> assessment(@PathVariable Long id) {
        return ApiResponse.ok(completionService.medicalAssessment(id));
    }

    @PostMapping("/assessments")
    public ApiResponse<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(completionService.saveMedicalAssessment(null, body));
    }

    @PutMapping("/assessments/{id}")
    public ApiResponse<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(completionService.saveMedicalAssessment(id, body));
    }

    @GetMapping("/health-alerts")
    public ApiResponse<List<Map<String, Object>>> alerts() {
        return ApiResponse.ok(completionService.healthAlerts());
    }

    @GetMapping("/health-alerts/{id}")
    public ApiResponse<Map<String, Object>> alert(@PathVariable Long id) {
        return ApiResponse.ok(completionService.healthAlert(id));
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
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(completionService.patchHealthAlert(id, body));
    }

    @GetMapping("/health-records")
    public ApiResponse<List<Map<String, Object>>> records() {
        return ApiResponse.ok(completionService.healthRecords());
    }

    @GetMapping("/health-records/{id}")
    public ApiResponse<Map<String, Object>> record(@PathVariable String id) {
        String numeric = id.startsWith("hr-") ? id.substring(3) : id;
        return ApiResponse.ok(completionService.healthRecord(Long.parseLong(numeric)));
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
        Long clientUserId = medicalAdvisorService.resolveClientUserId(body);
        if (clientUserId != null) {
            medicalAdvisorService.assertAdvisorCanAccessClient(principal, clientUserId);
            body.put("userId", clientUserId);
        }
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
            @org.springframework.web.bind.annotation.RequestParam(required = false) String status,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long clientUserId) {
        return ApiResponse.ok(medicalAdvisorService.listMedicalHistory(status, clientUserId));
    }

    @GetMapping("/medical-history/{id}")
    public ApiResponse<Map<String, Object>> medicalHistoryById(@PathVariable Long id) {
        return ApiResponse.ok(medicalAdvisorService.getMedicalHistory(id));
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
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long clientUserId) {
        return ApiResponse.ok(medicalAdvisorService.listSafetyValidations(clientUserId));
    }

    @GetMapping("/safety-validations/{id}")
    public ApiResponse<Map<String, Object>> safetyValidation(@PathVariable Long id) {
        return ApiResponse.ok(medicalAdvisorService.getSafetyValidation(id));
    }

    @PostMapping("/safety-validations")
    public ApiResponse<Map<String, Object>> runSafetyValidation(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(medicalAdvisorService.runSafetyValidation(body, principal));
    }

    @GetMapping("/notifications")
    public ApiResponse<List<Map<String, Object>>> notifications() {
        return ApiResponse.ok(domainService.notificationsByAudience("MEDICAL"));
    }

    @PatchMapping("/notifications/{id}/read")
    public ApiResponse<Map<String, Object>> markRead(@PathVariable String id) {
        return ApiResponse.ok(domainService.markNotificationRead(id));
    }

    @PatchMapping("/notifications/read-all")
    public ApiResponse<Map<String, Object>> markAll() {
        return ApiResponse.ok(domainService.markAudienceNotificationsRead("MEDICAL"));
    }
}
