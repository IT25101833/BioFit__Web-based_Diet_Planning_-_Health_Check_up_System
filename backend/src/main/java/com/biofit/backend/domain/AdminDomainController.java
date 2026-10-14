package com.biofit.backend.domain;

import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.erasure.ErasureService;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.UserManagementService;
import com.biofit.backend.user.UserStatus;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','DIGITAL_OPERATIONS_EXECUTIVE')")
public class AdminDomainController {

    private final DomainService domainService;
    private final CompletionService completionService;
    private final ErasureService erasureService;
    private final UserManagementService userManagementService;

    @GetMapping("/overview")
    public ApiResponse<Map<String, Object>> overview() {
        return ApiResponse.ok(completionService.adminDashboard());
    }

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        return ApiResponse.ok(completionService.adminDashboard());
    }

    @GetMapping("/users")
    public ApiResponse<List<Map<String, Object>>> users(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String sort) {
        return ApiResponse.ok(userManagementService.listAdminUsers(role, status, type, q, sort));
    }

    @GetMapping("/users/{id}")
    public ApiResponse<Map<String, Object>> user(@PathVariable Long id) {
        return ApiResponse.ok(userManagementService.getAdminUser(id));
    }

    @PostMapping("/users")
    public ApiResponse<Map<String, Object>> createUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body,
            HttpServletRequest http) {
        return ApiResponse.ok(
                userManagementService.createAdminUser(principal, body, clientIp(http), http.getHeader("User-Agent")));
    }

    @PatchMapping("/users/{id}")
    public ApiResponse<Map<String, Object>> updateUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            HttpServletRequest http) {
        return ApiResponse.ok(
                userManagementService.updateAdminUser(principal, id, body, clientIp(http), http.getHeader("User-Agent")));
    }

    @PatchMapping("/users/{id}/deactivate")
    public ApiResponse<Map<String, Object>> deactivateUser(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id, HttpServletRequest http) {
        return ApiResponse.ok(
                userManagementService.setAdminUserStatus(
                        principal, id, UserStatus.INACTIVE, clientIp(http), http.getHeader("User-Agent")));
    }

    @PatchMapping("/users/{id}/activate")
    public ApiResponse<Map<String, Object>> activateUser(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id, HttpServletRequest http) {
        return ApiResponse.ok(
                userManagementService.setAdminUserStatus(
                        principal, id, UserStatus.ACTIVE, clientIp(http), http.getHeader("User-Agent")));
    }

    @PatchMapping("/users/{id}/lock")
    public ApiResponse<Map<String, Object>> lockUser(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id, HttpServletRequest http) {
        return ApiResponse.ok(
                userManagementService.setAdminUserStatus(
                        principal, id, UserStatus.LOCKED, clientIp(http), http.getHeader("User-Agent")));
    }

    @PatchMapping("/users/{id}/unlock")
    public ApiResponse<Map<String, Object>> unlockUser(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id, HttpServletRequest http) {
        return ApiResponse.ok(
                userManagementService.setAdminUserStatus(
                        principal, id, UserStatus.ACTIVE, clientIp(http), http.getHeader("User-Agent")));
    }

    @PostMapping("/users/{id}/password-reset")
    public ApiResponse<Map<String, Object>> passwordReset(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id, HttpServletRequest http) {
        return ApiResponse.ok(
                userManagementService.issuePasswordReset(
                        principal, id, clientIp(http), http.getHeader("User-Agent")));
    }

    @GetMapping("/audit-logs")
    public ApiResponse<List<Map<String, Object>>> auditLogs() {
        return ApiResponse.ok(completionService.adminAuditLogs());
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<Map<String, Object>>> appointments() {
        return ApiResponse.ok(domainService.adminAppointments());
    }

    @DeleteMapping("/appointments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> hardDeleteAppointment(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.hardDeleteAppointment(principal.getId(), id));
    }

    @DeleteMapping("/dietary-restrictions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> hardDeleteDietary(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ApiResponse.ok(domainService.hardDeleteInactiveDietary(principal.getId(), id));
    }

    @GetMapping("/payments")
    public ApiResponse<Map<String, Object>> payments() {
        return ApiResponse.ok(domainService.adminOverview());
    }

    @PostMapping("/erasure-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> createErasureRequest(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(erasureService.create(body, principal));
    }

    @GetMapping("/erasure-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<Map<String, Object>>> listErasureRequests() {
        return ApiResponse.ok(erasureService.list());
    }

    @PatchMapping("/erasure-requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> approveErasureRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, Object> body) {
        return ApiResponse.ok(erasureService.approve(id, body == null ? Map.of() : body, principal));
    }

    @PatchMapping("/erasure-requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> rejectErasureRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, Object> body) {
        return ApiResponse.ok(erasureService.reject(id, body == null ? Map.of() : body, principal));
    }

    @PostMapping("/erasure-requests/{id}/execute")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> executeErasureRequest(
            @PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(erasureService.execute(id, principal));
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
