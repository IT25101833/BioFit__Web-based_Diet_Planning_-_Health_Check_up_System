package com.biofit.backend.client;

import com.biofit.backend.client.dto.ClientDashboardDtos.DashboardResponse;
import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
public class ClientDashboardController {

    private final ClientDashboardService dashboardService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public ApiResponse<DashboardResponse> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(dashboardService.dashboard(principal.getId()));
    }
}
