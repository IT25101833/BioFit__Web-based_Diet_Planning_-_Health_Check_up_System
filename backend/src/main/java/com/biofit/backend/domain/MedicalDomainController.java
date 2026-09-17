package com.biofit.backend.domain;

import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.security.UserPrincipal;
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
    private final UserRepository userRepository;

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
    public ApiResponse<List<Map<String, Object>>> assessments() {
        return ApiResponse.ok(completionService.medicalAssessments());
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
    public ApiResponse<Map<String, Object>> createAlert(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(completionService.saveHealthAlert(null, body));
    }

    @PutMapping("/health-alerts/{id}")
    public ApiResponse<Map<String, Object>> updateAlert(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
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
    public ApiResponse<Map<String, Object>> createRecord(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(completionService.saveHealthRecord(null, body));
    }

    @PutMapping("/health-records/{id}")
    public ApiResponse<Map<String, Object>> updateRecord(
            @PathVariable String id, @RequestBody Map<String, Object> body) {
        String numeric = id.startsWith("hr-") ? id.substring(3) : id;
        return ApiResponse.ok(completionService.saveHealthRecord(Long.parseLong(numeric), body));
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
