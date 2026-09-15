package com.biofit.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "biofit")
public record BioFitProperties(Jwt jwt, Cors cors) {

    public record Jwt(String secret, long accessTokenMinutes, long refreshTokenDays) {}

    public record Cors(String origins) {}
}
