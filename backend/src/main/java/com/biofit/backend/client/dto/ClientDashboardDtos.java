package com.biofit.backend.client.dto;

import java.util.List;

public class ClientDashboardDtos {

    public record MetricCard(String title, String value, String support, String badge, String badgeTone) {}

    public record ProgressItem(String label, int value, String detail) {}

    public record HealthItem(String label, String value) {}

    public record ActivityItem(String day, String month, String title, String time) {}

    public record NotificationItem(String icon, String title, String detail, String time, String tone) {}

    public record DashboardResponse(
            String greetingName,
            List<MetricCard> summary,
            String programmeName,
            String programmeWeek,
            int programmeProgress,
            String nextAppointmentTitle,
            String nextAppointmentWhen,
            String nextAppointmentProfessional,
            List<ProgressItem> progress,
            List<HealthItem> health,
            List<ActivityItem> upcoming,
            List<NotificationItem> notifications) {}
}
