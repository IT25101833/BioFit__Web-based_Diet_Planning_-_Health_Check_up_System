package com.biofit.backend.client;

import com.biofit.backend.client.dto.ClientDashboardDtos.ActivityItem;
import com.biofit.backend.client.dto.ClientDashboardDtos.DashboardResponse;
import com.biofit.backend.client.dto.ClientDashboardDtos.HealthItem;
import com.biofit.backend.client.dto.ClientDashboardDtos.MetricCard;
import com.biofit.backend.client.dto.ClientDashboardDtos.NotificationItem;
import com.biofit.backend.client.dto.ClientDashboardDtos.ProgressItem;
import com.biofit.backend.health.HealthGoalRepository;
import com.biofit.backend.health.HealthMetricRepository;
import com.biofit.backend.health.HealthProfile;
import com.biofit.backend.health.HealthProfileRepository;
import com.biofit.backend.health.HealthRiskAlertRepository;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientDashboardService {

    private final UserRepository userRepository;
    private final HealthProfileRepository profileRepository;
    private final HealthMetricRepository metricRepository;
    private final HealthGoalRepository goalRepository;
    private final HealthRiskAlertRepository alertRepository;

    @Transactional(readOnly = true)
    public DashboardResponse dashboard(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        HealthProfile profile = profileRepository.findByUserId(userId).orElse(null);

        BigDecimal weight =
                profile != null && profile.getWeightKg() != null ? profile.getWeightKg() : BigDecimal.valueOf(72.5);
        BigDecimal height =
                profile != null && profile.getHeightCm() != null ? profile.getHeightCm() : BigDecimal.valueOf(170);
        BigDecimal meters = height.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal bmi = weight.divide(meters.multiply(meters), 1, RoundingMode.HALF_UP);

        long activeAlerts = alertRepository.countByUserIdAndStatusIgnoreCase(userId, "Monitoring");
        int avgGoal =
                (int)
                        goalRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                                .mapToInt(g -> g.getProgressPercent())
                                .average()
                                .orElse(78);

        List<MetricCard> summary =
                List.of(
                        new MetricCard(
                                "Current Programme",
                                "Weight Management",
                                "Week 4 of 12",
                                "Active",
                                "green"),
                        new MetricCard(
                                "Next Appointment",
                                "25 Sep",
                                "Medical Review · 9:00 AM",
                                "Confirmed",
                                "teal"),
                        new MetricCard(
                                "Today's Focus",
                                "Upper Body",
                                "6 exercises · ~45 min",
                                "Not Started",
                                "amber"),
                        new MetricCard(
                                "Overall Progress",
                                avgGoal + "%",
                                "On track this month",
                                "Good",
                                "green"));

        List<ProgressItem> progress =
                goalRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                        .limit(3)
                        .map(g -> new ProgressItem(g.getTitle(), g.getProgressPercent(), g.getTargetValue() == null ? "In progress" : g.getTargetValue()))
                        .toList();
        if (progress.isEmpty()) {
            progress =
                    List.of(
                            new ProgressItem("Programme consistency", avgGoal, "Steady this month"),
                            new ProgressItem("Meal participation", 84, "Good weekly rhythm"),
                            new ProgressItem("Workout completion", 76, "3 of 4 sessions"));
        }

        List<HealthItem> health = new ArrayList<>();
        health.add(new HealthItem("Weight", weight + " kg"));
        health.add(new HealthItem("BMI", String.valueOf(bmi)));
        health.add(new HealthItem("Active alerts", String.valueOf(activeAlerts)));
        metricRepository.findByUserIdAndMetricTypeOrderByRecordedAtDesc(userId, "HYDRATION").stream()
                .findFirst()
                .ifPresent(m -> health.add(new HealthItem("Hydration", m.getValueText() != null ? m.getValueText() : m.getValueNum() + " " + m.getUnit())));

        List<ActivityItem> upcoming =
                List.of(
                        new ActivityItem("25", "Sep", "Medical review", "09:00 AM"),
                        new ActivityItem("27", "Sep", "Nutrition follow-up", "10:30 AM"),
                        new ActivityItem("29", "Sep", "Coach check-in", "04:00 PM"));

        List<NotificationItem> notifications =
                List.of(
                        new NotificationItem(
                                "health",
                                "Health update available",
                                "Your latest wellness summary is ready to review.",
                                "2h ago",
                                "green"),
                        new NotificationItem(
                                "appointment",
                                "Appointment reminder",
                                "Medical review on 25 Sep at 9:00 AM.",
                                "Yesterday",
                                "teal"));

        return new DashboardResponse(
                user.getFirstName(),
                summary,
                "Weight Management",
                "Week 4 of 12",
                avgGoal,
                "Medical Review",
                "25 Sep · 9:00 AM",
                "Elena Costa",
                progress,
                health,
                upcoming,
                notifications);
    }
}
