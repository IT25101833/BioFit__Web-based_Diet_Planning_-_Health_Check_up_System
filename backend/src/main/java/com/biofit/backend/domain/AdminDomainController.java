package com.biofit.backend.domain;

import com.biofit.backend.common.ApiResponse;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','DIGITAL_OPERATIONS_EXECUTIVE')")
public class AdminDomainController {

    private final DomainService domainService;
    private final CompletionService completionService;

    @GetMapping("/overview")
    public ApiResponse<Map<String, Object>> overview() {
        return ApiResponse.ok(completionService.adminDashboard());
    }

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        return ApiResponse.ok(completionService.adminDashboard());
    }

    @GetMapping("/users")
    public ApiResponse<List<Map<String, Object>>> users() {
        return ApiResponse.ok(completionService.adminUsers());
    }

    @PatchMapping("/users/{id}")
    public ApiResponse<Map<String, Object>> updateUser(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(completionService.updateAdminUser(id, body));
    }

    @GetMapping("/audit-logs")
    public ApiResponse<List<Map<String, Object>>> auditLogs() {
        return ApiResponse.ok(completionService.adminAuditLogs());
    }

    @GetMapping("/payments")
    public ApiResponse<Map<String, Object>> payments() {
        return ApiResponse.ok(domainService.adminOverview());
    }
}
