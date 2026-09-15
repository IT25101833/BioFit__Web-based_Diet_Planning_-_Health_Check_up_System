package com.biofit.backend.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(
            Long userId,
            String action,
            String entityType,
            String entityId,
            String resultStatus,
            String ipAddress,
            String userAgent,
            String details) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setResultStatus(resultStatus);
        log.setIpAddress(ipAddress);
        log.setUserAgent(truncate(userAgent, 512));
        log.setDetails(truncate(details, 1000));
        auditLogRepository.save(log);
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
