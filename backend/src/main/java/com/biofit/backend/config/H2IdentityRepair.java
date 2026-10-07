package com.biofit.backend.config;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * After an abrupt stop, H2 can hand out an ID that is already stored.
 * Move each identity counter to one past the highest saved ID before requests are accepted.
 */
@Component
@Order(50)
@RequiredArgsConstructor
@Slf4j
public class H2IdentityRepair implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    @Override
    public void run(ApplicationArguments args) {
        if (!datasourceUrl.startsWith("jdbc:h2:")) {
            return;
        }
        List<Map<String, Object>> columns =
                jdbcTemplate.queryForList(
                        """
                        SELECT TABLE_NAME, COLUMN_NAME
                        FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_SCHEMA = 'PUBLIC' AND IS_IDENTITY = 'YES'
                        """);
        int repaired = 0;
        for (Map<String, Object> column : columns) {
            String table = String.valueOf(column.get("TABLE_NAME"));
            String idColumn = String.valueOf(column.get("COLUMN_NAME"));
            if (!table.matches("[A-Za-z0-9_]+") || !idColumn.matches("[A-Za-z0-9_]+")) {
                continue;
            }
            try {
                Long max =
                        jdbcTemplate.queryForObject(
                                "SELECT COALESCE(MAX(" + idColumn + "), 0) FROM " + table, Long.class);
                long next = (max == null ? 0L : max) + 1L;
                jdbcTemplate.execute(
                        "ALTER TABLE " + table + " ALTER COLUMN " + idColumn + " RESTART WITH " + next);
                repaired++;
            } catch (RuntimeException ex) {
                log.warn("Could not align the ID counter for {}", table, ex);
            }
        }
        log.info("Aligned {} H2 ID counters with the rows already saved", repaired);
    }
}
