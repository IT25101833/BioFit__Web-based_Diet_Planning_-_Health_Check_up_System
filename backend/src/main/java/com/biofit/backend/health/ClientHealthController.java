package com.biofit.backend.health;

import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.health.dto.HealthDtos.AlertResponse;
import com.biofit.backend.health.dto.HealthDtos.CreateGoalRequest;
import com.biofit.backend.health.dto.HealthDtos.CreateMetricRequest;
import com.biofit.backend.health.dto.HealthDtos.GoalResponse;
import com.biofit.backend.health.dto.HealthDtos.HealthOverviewResponse;
import com.biofit.backend.health.dto.HealthDtos.MetricResponse;
import com.biofit.backend.health.dto.HealthDtos.UpdateGoalRequest;
import com.biofit.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
public class ClientHealthController {

    private final HealthService healthService;

    @GetMapping("/health")
    public ApiResponse<HealthOverviewResponse> health(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(healthService.overview(principal.getId()));
    }

    @GetMapping("/health-alerts")
    public ApiResponse<List<AlertResponse>> alerts(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(healthService.alerts(principal.getId()));
    }

    @PostMapping("/health/metrics")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MetricResponse> addMetric(
            @AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody CreateMetricRequest request) {
        return ApiResponse.ok(healthService.addMetric(principal.getId(), request));
    }

    @PostMapping("/health/goals")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<GoalResponse> addGoal(
            @AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody CreateGoalRequest request) {
        return ApiResponse.ok(healthService.addGoal(principal.getId(), request));
    }

    @PatchMapping("/health/goals/{id}")
    public ApiResponse<GoalResponse> updateGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody UpdateGoalRequest request) {
        return ApiResponse.ok(healthService.updateGoal(principal.getId(), id, request));
    }
}
