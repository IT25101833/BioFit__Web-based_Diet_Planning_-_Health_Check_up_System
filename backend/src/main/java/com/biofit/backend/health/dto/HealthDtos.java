package com.biofit.backend.health.dto;

import java.math.BigDecimal;
import java.util.List;

public class HealthDtos {

    public record DatedItem(String date, String title, String summary) {}

    public record UpcomingItem(String date, String title) {}

    public record HealthOverviewResponse(
            DatedItem latestCheckup,
            String medicalRecordStatus,
            DatedItem latestAssessment,
            UpcomingItem upcomingReview,
            List<String> safetyGuidance,
            long activeAlertsCount,
            BigDecimal heightCm,
            BigDecimal weightKg,
            BigDecimal bmi,
            List<MetricResponse> recentMetrics,
            List<GoalResponse> goals) {}

    public record MetricResponse(
            Long id, String metricType, BigDecimal valueNum, String valueText, String unit, String recordedAt) {}

    public record GoalResponse(
            Long id, String title, String description, String targetValue, String status, int progressPercent) {}

    public record AlertResponse(
            String id,
            String title,
            String status,
            String dateRaised,
            String followUpDate,
            String guidance) {}

    public record CreateMetricRequest(String metricType, BigDecimal valueNum, String valueText, String unit) {}

    public record CreateGoalRequest(String title, String description, String targetValue) {}

    public record UpdateGoalRequest(String title, String description, String targetValue, String status, Integer progressPercent) {}
}
