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
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('WELLNESS_CENTRE_MANAGER','ADMIN')")
public class ManagerDomainController {

    private final DomainService domainService;
    private final CompletionService completionService;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.managerDashboard(principal.getId()));
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

    @GetMapping("/programmes")
    public ApiResponse<List<Map<String, Object>>> programmes() {
        return ApiResponse.ok(domainService.managerProgrammes());
    }

    @GetMapping("/programmes/{id}")
    public ApiResponse<Map<String, Object>> programme(@PathVariable String id) {
        return ApiResponse.ok(domainService.managerProgramme(id));
    }

    @PostMapping("/programmes")
    public ApiResponse<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.createProgramme(body));
    }

    @PutMapping("/programmes/{id}")
    public ApiResponse<Map<String, Object>> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.updateProgramme(id, body));
    }

    @PatchMapping("/programmes/{id}/deactivate")
    public ApiResponse<Map<String, Object>> deactivate(@PathVariable String id) {
        return ApiResponse.ok(domainService.deactivateProgramme(id));
    }

    @GetMapping("/enrolments")
    public ApiResponse<List<Map<String, Object>>> enrolments() {
        return ApiResponse.ok(domainService.managerEnrolments());
    }

    @GetMapping("/schedules")
    public ApiResponse<Map<String, Object>> schedules() {
        return ApiResponse.ok(domainService.managerSchedules());
    }

    @PostMapping("/schedules")
    public ApiResponse<Map<String, Object>> saveSchedule(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.saveSchedule(body));
    }

    @PatchMapping("/schedules/{id}/cancel")
    public ApiResponse<Map<String, Object>> cancelSchedule(@PathVariable String id) {
        return ApiResponse.ok(domainService.cancelSchedule(id));
    }

    @GetMapping("/reports")
    public ApiResponse<Map<String, Object>> reports() {
        return ApiResponse.ok(domainService.managerReports());
    }

    @GetMapping("/notifications")
    public ApiResponse<List<Map<String, Object>>> notifications() {
        return ApiResponse.ok(domainService.notificationsByAudience("MANAGER"));
    }

    @GetMapping("/escalations")
    public ApiResponse<List<Map<String, Object>>> escalations() {
        return ApiResponse.ok(completionService.escalatedTicketsFor("Wellness Centre Manager"));
    }

    @PostMapping("/escalations/{id}/respond")
    public ApiResponse<Map<String, Object>> respondEscalation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        String author = principal == null ? "Wellness Centre Manager" : principal.getUsername();
        return ApiResponse.ok(completionService.specialistRespond(id, author, body));
    }

    @GetMapping("/support-overview")
    public ApiResponse<Map<String, Object>> supportOverview() {
        return ApiResponse.ok(completionService.supportOverviewForManager());
    }

    @PatchMapping("/notifications/{id}/read")
    public ApiResponse<Map<String, Object>> markRead(@PathVariable String id) {
        return ApiResponse.ok(domainService.markNotificationRead(id));
    }

    @PatchMapping("/notifications/read-all")
    public ApiResponse<Map<String, Object>> markAll() {
        return ApiResponse.ok(domainService.markAudienceNotificationsRead("MANAGER"));
    }
}
