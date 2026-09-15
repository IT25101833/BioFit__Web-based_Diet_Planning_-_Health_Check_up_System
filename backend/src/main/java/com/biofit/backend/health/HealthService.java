package com.biofit.backend.health;

import com.biofit.backend.common.ApiException;
import com.biofit.backend.health.dto.HealthDtos.AlertResponse;
import com.biofit.backend.health.dto.HealthDtos.CreateGoalRequest;
import com.biofit.backend.health.dto.HealthDtos.CreateMetricRequest;
import com.biofit.backend.health.dto.HealthDtos.DatedItem;
import com.biofit.backend.health.dto.HealthDtos.GoalResponse;
import com.biofit.backend.health.dto.HealthDtos.HealthOverviewResponse;
import com.biofit.backend.health.dto.HealthDtos.MetricResponse;
import com.biofit.backend.health.dto.HealthDtos.UpdateGoalRequest;
import com.biofit.backend.health.dto.HealthDtos.UpcomingItem;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HealthService {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneOffset.UTC);

    private final HealthProfileRepository profileRepository;
    private final HealthMetricRepository metricRepository;
    private final HealthGoalRepository goalRepository;
    private final HealthAssessmentRepository assessmentRepository;
    private final HealthRiskAlertRepository alertRepository;

    @Transactional(readOnly = true)
    public HealthOverviewResponse overview(Long userId) {
        HealthProfile profile =
                profileRepository
                        .findByUserId(userId)
                        .orElseGet(() -> emptyProfile(userId));

        HealthAssessment latest =
                assessmentRepository.findFirstByUserIdOrderByAssessedAtDesc(userId).orElse(null);

        DatedItem checkup =
                latest == null
                        ? new DatedItem(null, "No check-up yet", "Book a wellness check-up to begin tracking.")
                        : new DatedItem(DATE.format(latest.getAssessedAt()), latest.getTitle(), latest.getSummary());

        DatedItem assessment =
                latest == null
                        ? new DatedItem(null, "No assessment yet", "Your advisor will add results after review.")
                        : new DatedItem(DATE.format(latest.getAssessedAt()), latest.getTitle(), latest.getSummary());

        UpcomingItem upcoming =
                latest != null && latest.getNextReviewAt() != null
                        ? new UpcomingItem(DATE.format(latest.getNextReviewAt()), "Medical review")
                        : new UpcomingItem(null, "No review scheduled");

        List<String> guidance =
                profile.getSafetyNotes() == null || profile.getSafetyNotes().isBlank()
                        ? List.of(
                                "Continue gradual activity increases as advised by your coach.",
                                "Stay hydrated and rest when you feel unusually tired.",
                                "Contact support if symptoms feel new or concerning.")
                        : Arrays.stream(profile.getSafetyNotes().split("\\|")).map(String::trim).filter(s -> !s.isEmpty()).toList();

        long activeAlerts = alertRepository.countByUserIdAndStatusIgnoreCase(userId, "Monitoring");

        BigDecimal bmi = null;
        if (profile.getHeightCm() != null
                && profile.getWeightKg() != null
                && profile.getHeightCm().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal meters = profile.getHeightCm().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            bmi = profile.getWeightKg().divide(meters.multiply(meters), 1, RoundingMode.HALF_UP);
        }

        List<MetricResponse> metrics =
                metricRepository.findByUserIdOrderByRecordedAtDesc(userId).stream()
                        .limit(8)
                        .map(this::toMetric)
                        .toList();

        List<GoalResponse> goals =
                goalRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream().map(this::toGoal).toList();

        return new HealthOverviewResponse(
                checkup,
                profile.getMedicalRecordStatus(),
                assessment,
                upcoming,
                guidance,
                activeAlerts,
                profile.getHeightCm(),
                profile.getWeightKg(),
                bmi,
                metrics,
                goals);
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> alerts(Long userId) {
        return alertRepository.findByUserIdOrderByDateRaisedDesc(userId).stream()
                .map(
                        a ->
                                new AlertResponse(
                                        String.valueOf(a.getId()),
                                        a.getTitle(),
                                        a.getStatus(),
                                        DATE.format(a.getDateRaised()),
                                        a.getFollowUpAt() == null ? null : DATE.format(a.getFollowUpAt()),
                                        a.getGuidance()))
                .toList();
    }

    @Transactional
    public MetricResponse addMetric(Long userId, CreateMetricRequest request) {
        if (request.metricType() == null || request.metricType().isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Metric type is required.", HttpStatus.BAD_REQUEST);
        }
        HealthMetric metric = new HealthMetric();
        metric.setUserId(userId);
        metric.setMetricType(request.metricType().trim().toUpperCase());
        metric.setValueNum(request.valueNum());
        metric.setValueText(request.valueText());
        metric.setUnit(request.unit());
        metric.setRecordedAt(Instant.now());
        metric.setSource("CLIENT");
        return toMetric(metricRepository.save(metric));
    }

    @Transactional
    public GoalResponse addGoal(Long userId, CreateGoalRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Goal title is required.", HttpStatus.BAD_REQUEST);
        }
        HealthGoal goal = new HealthGoal();
        goal.setUserId(userId);
        goal.setTitle(request.title().trim());
        goal.setDescription(request.description());
        goal.setTargetValue(request.targetValue());
        goal.setStatus("ACTIVE");
        goal.setProgressPercent(0);
        return toGoal(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponse updateGoal(Long userId, Long goalId, UpdateGoalRequest request) {
        HealthGoal goal =
                goalRepository
                        .findById(goalId)
                        .filter(g -> g.getUserId().equals(userId))
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Goal not found.", HttpStatus.NOT_FOUND));
        if (request.title() != null && !request.title().isBlank()) goal.setTitle(request.title().trim());
        if (request.description() != null) goal.setDescription(request.description());
        if (request.targetValue() != null) goal.setTargetValue(request.targetValue());
        if (request.status() != null) goal.setStatus(request.status());
        if (request.progressPercent() != null) {
            goal.setProgressPercent(Math.max(0, Math.min(100, request.progressPercent())));
        }
        return toGoal(goalRepository.save(goal));
    }

    private HealthProfile emptyProfile(Long userId) {
        HealthProfile profile = new HealthProfile();
        profile.setUserId(userId);
        profile.setMedicalRecordStatus("Not started");
        return profile;
    }

    private MetricResponse toMetric(HealthMetric m) {
        return new MetricResponse(
                m.getId(),
                m.getMetricType(),
                m.getValueNum(),
                m.getValueText(),
                m.getUnit(),
                DATE.format(m.getRecordedAt()));
    }

    private GoalResponse toGoal(HealthGoal g) {
        return new GoalResponse(
                g.getId(), g.getTitle(), g.getDescription(), g.getTargetValue(), g.getStatus(), g.getProgressPercent());
    }
}
