package com.biofit.backend.domain;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TodayAppointmentReminderJob {

    private final DomainService domainService;

    @Scheduled(cron = "0 0 7 * * *", zone = "Asia/Colombo")
    public void sendMorningReminders() {
        int created = domainService.sendTodayMedicalAppointmentReminders();
        log.info("Today medical appointment reminders created: {}", created);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void sendRemindersOnStartup() {
        int created = domainService.sendTodayMedicalAppointmentReminders();
        log.info("Startup medical appointment reminders created: {}", created);
    }
}
