package com.biofit.backend.auth;

import com.biofit.backend.audit.AuditService;
import com.biofit.backend.auth.dto.AuthDtos.AuthUserResponse;
import com.biofit.backend.auth.dto.AuthDtos.ChangePasswordRequest;
import com.biofit.backend.auth.dto.AuthDtos.ForgotPasswordRequest;
import com.biofit.backend.auth.dto.AuthDtos.LoginRequest;
import com.biofit.backend.auth.dto.AuthDtos.RefreshRequest;
import com.biofit.backend.auth.dto.AuthDtos.RegisterRequest;
import com.biofit.backend.auth.dto.AuthDtos.ResetPasswordRequest;
import com.biofit.backend.auth.dto.AuthDtos.TokenResponse;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.security.JwtService;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.Role;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.RoleRepository;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import com.biofit.backend.user.UserStatus;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_MINUTES = 15;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    @Transactional
    public TokenResponse register(RegisterRequest request, String ip, String userAgent) {
        if (userRepository.existsByEmailIgnoreCaseAndDeletedAtIsNull(request.email())) {
            throw new ApiException("EMAIL_EXISTS", "An account with this email already exists.", HttpStatus.CONFLICT);
        }

        Role clientRole =
                roleRepository
                        .findByName(RoleName.CLIENT)
                        .orElseThrow(
                                () ->
                                        new ApiException(
                                                "ROLE_MISSING",
                                                "Client role is not configured.",
                                                HttpStatus.INTERNAL_SERVER_ERROR));

        User user = new User();
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setContactNumber(request.contactNumber());
        user.setStatus(UserStatus.ACTIVE);
        user.getRoles().add(clientRole);
        userRepository.save(user);

        auditService.log(
                user.getId(), "REGISTER", "User", String.valueOf(user.getId()), "SUCCESS", ip, userAgent, null);
        return issueTokens(user);
    }

    @Transactional
    public TokenResponse login(LoginRequest request, String ip, String userAgent) {
        User user =
                userRepository
                        .findByEmailIgnoreCaseAndDeletedAtIsNull(request.email().trim())
                        .orElse(null);

        if (user == null) {
            auditService.log(null, "LOGIN_FAILED", "User", null, "FAILURE", ip, userAgent, "unknown email");
            throw new ApiException("UNAUTHORIZED", "Invalid email or password.", HttpStatus.UNAUTHORIZED);
        }

        if (user.isLocked()) {
            auditService.log(
                    user.getId(), "LOGIN_LOCKED", "User", String.valueOf(user.getId()), "FAILURE", ip, userAgent, null);
            throw new ApiException(
                    "ACCOUNT_LOCKED",
                    "Account is temporarily locked. Try again later.",
                    HttpStatus.LOCKED);
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(Instant.now().plusSeconds(LOCK_MINUTES * 60));
                user.setStatus(UserStatus.LOCKED);
            }
            userRepository.save(user);
            auditService.log(
                    user.getId(),
                    "LOGIN_FAILED",
                    "User",
                    String.valueOf(user.getId()),
                    "FAILURE",
                    ip,
                    userAgent,
                    "bad password");
            throw new ApiException("UNAUTHORIZED", "Invalid email or password.", HttpStatus.UNAUTHORIZED);
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        if (user.getStatus() == UserStatus.LOCKED) {
            user.setStatus(UserStatus.ACTIVE);
        }
        userRepository.save(user);

        auditService.log(
                user.getId(), "LOGIN", "User", String.valueOf(user.getId()), "SUCCESS", ip, userAgent, null);
        return issueTokens(user);
    }

    @Transactional
    public TokenResponse refresh(RefreshRequest request) {
        RefreshToken stored =
                refreshTokenRepository
                        .findByTokenAndRevokedFalse(request.refreshToken())
                        .orElseThrow(
                                () ->
                                        new ApiException(
                                                "INVALID_TOKEN",
                                                "Refresh token is invalid.",
                                                HttpStatus.UNAUTHORIZED));

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            stored.setRevoked(true);
            refreshTokenRepository.save(stored);
            throw new ApiException("TOKEN_EXPIRED", "Refresh token has expired.", HttpStatus.UNAUTHORIZED);
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
        return issueTokens(stored.getUser());
    }

    @Transactional
    public void logout(String refreshToken, UserPrincipal principal, String ip, String userAgent) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository
                    .findByTokenAndRevokedFalse(refreshToken)
                    .ifPresent(
                            token -> {
                                token.setRevoked(true);
                                refreshTokenRepository.save(token);
                            });
        }
        Long userId = principal != null ? principal.getId() : null;
        auditService.log(userId, "LOGOUT", "User", userId == null ? null : String.valueOf(userId), "SUCCESS", ip, userAgent, null);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request, String ip, String userAgent) {
        userRepository
                .findByEmailIgnoreCaseAndDeletedAtIsNull(request.email().trim())
                .ifPresent(
                        user -> {
                            user.setPasswordResetToken(UUID.randomUUID().toString());
                            user.setPasswordResetExpiresAt(Instant.now().plusSeconds(3600));
                            userRepository.save(user);
                            auditService.log(
                                    user.getId(),
                                    "FORGOT_PASSWORD",
                                    "User",
                                    String.valueOf(user.getId()),
                                    "SUCCESS",
                                    ip,
                                    userAgent,
                                    "reset token issued");
                        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request, String ip, String userAgent) {
        User user =
                userRepository
                        .findByPasswordResetTokenAndDeletedAtIsNull(request.token())
                        .orElseThrow(
                                () ->
                                        new ApiException(
                                                "INVALID_TOKEN",
                                                "Reset token is invalid.",
                                                HttpStatus.BAD_REQUEST));

        if (user.getPasswordResetExpiresAt() == null
                || user.getPasswordResetExpiresAt().isBefore(Instant.now())) {
            throw new ApiException("TOKEN_EXPIRED", "Reset token has expired.", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        auditService.log(
                user.getId(),
                "RESET_PASSWORD",
                "User",
                String.valueOf(user.getId()),
                "SUCCESS",
                ip,
                userAgent,
                null);
    }

    @Transactional
    public void changePassword(UserPrincipal principal, ChangePasswordRequest request, String ip, String userAgent) {
        User user =
                userRepository
                        .findById(principal.getId())
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "User not found.", HttpStatus.NOT_FOUND));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ApiException("INVALID_PASSWORD", "Current password is incorrect.", HttpStatus.BAD_REQUEST);
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        auditService.log(
                user.getId(),
                "CHANGE_PASSWORD",
                "User",
                String.valueOf(user.getId()),
                "SUCCESS",
                ip,
                userAgent,
                null);
    }

    @Transactional(readOnly = true)
    public AuthUserResponse me(UserPrincipal principal) {
        User user =
                userRepository
                        .findById(principal.getId())
                        .orElseThrow(
                                () ->
                                        new ApiException(
                                                "NOT_FOUND", "User not found.", HttpStatus.NOT_FOUND));
        return toAuthUser(user);
    }

    private TokenResponse issueTokens(User user) {
        List<String> roles = user.getRoles().stream().map(r -> r.getName().name()).sorted().toList();
        String access = jwtService.createAccessToken(user.getId(), user.getEmail(), roles);

        RefreshToken refresh = new RefreshToken();
        refresh.setUser(user);
        refresh.setToken(jwtService.createRefreshTokenValue());
        refresh.setExpiresAt(jwtService.refreshExpiry());
        refreshTokenRepository.save(refresh);

        return new TokenResponse(access, refresh.getToken(), "Bearer", toAuthUser(user));
    }

    public static AuthUserResponse toAuthUser(User user) {
        List<String> roles = user.getRoles().stream().map(r -> r.getName().name()).sorted().toList();
        String primary =
                roles.stream()
                        .min(Comparator.comparingInt(AuthService::rolePriority))
                        .orElse(RoleName.CLIENT.name());
        return new AuthUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getFullName(),
                user.getContactNumber(),
                user.getSpecialization(),
                user.getStatus().name(),
                roles,
                primary);
    }

    private static int rolePriority(String role) {
        return switch (role) {
            case "ADMIN" -> 0;
            case "DIGITAL_OPERATIONS_EXECUTIVE" -> 1;
            case "WELLNESS_CENTRE_MANAGER" -> 2;
            case "MEDICAL_ADVISOR" -> 3;
            case "NUTRITION_CONSULTANT" -> 4;
            case "FITNESS_COACH" -> 5;
            case "CUSTOMER_EXPERIENCE_OFFICER" -> 6;
            default -> 10;
        };
    }
}
