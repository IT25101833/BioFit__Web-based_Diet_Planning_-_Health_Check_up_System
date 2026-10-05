package com.biofit.backend.config;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Loads backend/.env into JVM system properties when present.
 * Works when the process is started from {@code /backend} or the project root.
 * Does not override variables already set in the OS environment.
 * Secrets stay on the server — never load this on the frontend.
 */
public final class DotEnvLoader {

    private static final Logger log = LoggerFactory.getLogger(DotEnvLoader.class);

    private DotEnvLoader() {}

    public static void loadIfPresent() {
        Path path = resolveEnvFile();
        if (path == null) {
            log.warn(
                    "No backend/.env found (checked ./.env and ./backend/.env relative to {}). "
                            + "Mail settings will use OS env / application.properties defaults only.",
                    Path.of("").toAbsolutePath().normalize());
            return;
        }

        Map<String, String> values = new LinkedHashMap<>();
        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }
                int eq = trimmed.indexOf('=');
                if (eq <= 0) {
                    continue;
                }
                String key = trimmed.substring(0, eq).trim();
                String value = trimmed.substring(eq + 1).trim();
                if ((value.startsWith("\"") && value.endsWith("\""))
                        || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }
                if (key.isEmpty()) {
                    continue;
                }
                values.put(key, value);
            }
        } catch (IOException ex) {
            log.warn("Could not read {}: {}", path.toAbsolutePath(), ex.getMessage());
            return;
        }

        int applied = 0;
        int skippedOs = 0;
        for (Map.Entry<String, String> entry : values.entrySet()) {
            String key = entry.getKey();
            // OS environment wins; otherwise .env overwrites prior system properties
            // so an updated .env is picked up on full JVM restart.
            if (System.getenv(key) != null) {
                skippedOs++;
                continue;
            }
            System.setProperty(key, entry.getValue());
            applied++;
        }
        log.info(
                "Loaded {} setting(s) from {} (skipped {} already set in OS env)",
                applied,
                path.toAbsolutePath().normalize(),
                skippedOs);
    }

    private static Path resolveEnvFile() {
        List<Path> candidates = new ArrayList<>();
        Path cwd = Path.of("").toAbsolutePath().normalize();
        candidates.add(cwd.resolve(".env"));
        candidates.add(cwd.resolve("backend").resolve(".env"));
        // If started from a nested cwd, also try parent/backend/.env
        if (cwd.getParent() != null) {
            candidates.add(cwd.getParent().resolve("backend").resolve(".env"));
            candidates.add(cwd.getParent().resolve(".env"));
        }
        for (Path candidate : candidates) {
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        return null;
    }
}
