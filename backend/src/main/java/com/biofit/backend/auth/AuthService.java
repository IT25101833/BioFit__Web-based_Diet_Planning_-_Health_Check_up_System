package com.biofit.backend.auth;

import com.biofit.backend.audit.AuditService;
import com.biofit.backend.auth.dto.AuthDtos.AuthUserResponse;
import com.biofit.backend.auth.dto.AuthDtos.ChangePasswordRequest;
import com.biofit.backend.auth.dto.AuthDtos.ForgotPasswordRequest;
import com.biofit.backend.auth.dto.AuthDtos.LoginRequest;
import com.biofit.backend.auth.dto.AuthDtos.RefreshRequest;
import com.biofit.backend.auth.dto.AuthDtos.RegisterPendingResponse;
import com.biofit.backend.auth.dto.AuthDtos.RegisterRequest;
import com.biofit.backend.auth.dto.AuthDtos.ResendVerificationRequest;
import com.biofit.backend.auth.dto.AuthDtos.ResetPasswordRequest;
import com.biofit.backend.auth.dto.AuthDtos.TokenResponse;
import com.biofit.backend.auth.dto.AuthDtos.VerifyEmailRequest;
import com.biofit.backend.auth.dto.AuthDtos.VerifyEmailResponse;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.mail.EmailService;
import com.biofit.backend.security.JwtService;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.Role;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.RoleRepository;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import com.biofit.backend.user.UserStatus;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_MINUTES = 15;
    private static final int OTP_LENGTH_BOUND = 1_000_000;
    private static final long OTP_EXPIRY_SECONDS = 5 * 60;
    private static final long RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_OTP_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public RegisterPendingResponse register(RegisterRequest request, String ip, String userAgent) {
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
        user.setEmailVerified(false);
        user.getRoles().add(clientRole);
        userRepository.save(user);

        String devOtp = issueAndSendOtp(user, ip, userAgent, "REGISTER");

        auditService.log(
                user.getId(), "REGISTER", "User", String.valueOf(user.getId()), "SUCCESS", ip, userAgent, null);

        if (devOtp != null) {
            return new RegisterPendingResponse(
                    user.getEmail(),
                    "Email could not be sent. Development mode: use the code shown on screen.",
                    true,
                    devOtp);
        }

        return new RegisterPendingResponse(
                user.getEmail(),
                "We sent a verification code to your email.",
                true,
                null);
    }

    @Transactional
    public VerifyEmailResponse verifyEmail(VerifyEmailRequest request, String ip, String userAgent) {
        User user =
                userRepository
                        .findByEmailIgnoreCaseAndDeletedAtIsNull(request.email().trim())
                        .orElseThrow(
                                () ->
                                        new ApiException(
                                                "NOT_FOUND",
                                                "No account found for this email.",
                                                HttpStatus.NOT_FOUND));

        if (user.isEmailVerified()) {
            throw new ApiException(
                    "ALREADY_VERIFIED",
                    "This email is already verified. You can sign in.",
                    HttpStatus.BAD_REQUEST);
        }

        if (user.getEmailOtpHash() == null || user.getEmailOtpExpiresAt() == null) {
            throw new ApiException(
                    "OTP_MISSING",
                    "No verification code is pending. Please request a new code.",
                    HttpStatus.BAD_REQUEST);
        }

        if (user.getEmailOtpAttempts() >= MAX_OTP_ATTEMPTS) {
            clearOtp(user);
            userRepository.save(user);
            throw new ApiException(
                    "OTP_ATTEMPTS_EXCEEDED",
                    "Too many incorrect attempts. Please request a new verification code.",
                    HttpStatus.TOO_MANY_REQUESTS);
        }

        if (user.getEmailOtpExpiresAt().isBefore(Instant.now())) {
            clearOtp(user);
            userRepository.save(user);
            throw new ApiException(
                    "OTP_EXPIRED",
                    "This verification code has expired. Please request a new code.",
                    HttpStatus.BAD_REQUEST);
        }

        String otp = request.otp().trim();
        if (!passwordEncoder.matches(otp, user.getEmailOtpHash())) {
            user.setEmailOtpAttempts(user.getEmailOtpAttempts() + 1);
            if (user.getEmailOtpAttempts() >= MAX_OTP_ATTEMPTS) {
                clearOtp(user);
                userRepository.save(user);
                auditService.log(
                        user.getId(),
                        "VERIFY_EMAIL_FAILED",
                        "User",
                        String.valueOf(user.getId()),
                        "FAILURE",
                        ip,
                        userAgent,
                        "attempts exceeded");
                throw new ApiException(
                        "OTP_ATTEMPTS_EXCEEDED",
                        "Too many incorrect attempts. Please request a new verification code.",
                        HttpStatus.TOO_MANY_REQUESTS);
            }
            userRepository.save(user);
            auditService.log(
                    user.getId(),
                    "VERIFY_EMAIL_FAILED",
                    "User",
                    String.valueOf(user.getId()),
                    "FAILURE",
                    ip,
                    userAgent,
                    "invalid otp");
            throw new ApiException(
                    "OTP_INVALID",
                    "Invalid verification code. Please try again.",
                    HttpStatus.BAD_REQUEST);
        }

        user.setEmailVerified(true);
        clearOtp(user);
        userRepository.save(user);

        auditService.log(
                user.getId(),
                "VERIFY_EMAIL",
                "User",
                String.valueOf(user.getId()),
                "SUCCESS",
                ip,
                userAgent,
                null);

        return new VerifyEmailResponse(
                user.getEmail(), "Email verified successfully. You can now sign in.", true);
    }

    @Transactional
    public RegisterPendingResponse resendVerification(
            ResendVerificationRequest request, String ip, String userAgent) {
        String email = request.email() == null ? "" : request.email().trim().toLowerCase();
        log.info("Resend OTP request received for {}", EmailService.maskEmail(email));

        User user =
                userRepository
                        .findByEmailIgnoreCaseAndDeletedAtIsNull(email)
                        .orElseThrow(
                                () -> {
                                    log.warn(
                                            "Resend OTP failed: no account for {}",
                                            EmailService.maskEmail(email));
                                    return new ApiException(
                                            "NOT_FOUND",
                                            "No account found for this email.",
                                            HttpStatus.NOT_FOUND);
                                });

        if (user.isEmailVerified()) {
            log.info("Resend OTP skipped: userId={} already verified", user.getId());
            throw new ApiException(
                    "ALREADY_VERIFIED",
                    "This email is already verified. You can sign in.",
                    HttpStatus.BAD_REQUEST);
        }

        log.info(
                "Pending user found userId={} emailVerified=false",
                user.getId());

        if (user.getEmailOtpLastSentAt() != null) {
            Instant earliest = user.getEmailOtpLastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS);
            if (earliest.isAfter(Instant.now())) {
                long waitSeconds = Math.max(1, earliest.getEpochSecond() - Instant.now().getEpochSecond());
                log.info(
                        "Resend OTP blocked by cooldown userId={} waitSeconds={}",
                        user.getId(),
                        waitSeconds);
                throw new ApiException(
                        "OTP_RESEND_COOLDOWN",
                        "Please wait " + waitSeconds + " seconds before requesting a new code.",
                        HttpStatus.TOO_MANY_REQUESTS);
            }
        }

        String devOtp = issueAndSendOtp(user, ip, userAgent, "RESEND_VERIFICATION");

        log.info("Resend OTP completed successfully for userId={}", user.getId());
        if (devOtp != null) {
            return new RegisterPendingResponse(
                    user.getEmail(),
                    "Email could not be sent. Development mode: use the code shown on screen.",
                    true,
                    devOtp);
        }
        return new RegisterPendingResponse(
                user.getEmail(), "We sent a verification code to your email.", true, null);
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

        if (user.getStatus() != UserStatus.ACTIVE && user.getStatus() != UserStatus.LOCKED) {
            auditService.log(
                    user.getId(),
                    "LOGIN_DISABLED",
                    "User",
                    String.valueOf(user.getId()),
                    "FAILURE",
                    ip,
                    userAgent,
                    "status=" + user.getStatus());
            throw new ApiException(
                    "ACCOUNT_DISABLED",
                    "This account is not active. Contact BioFit support.",
                    HttpStatus.FORBIDDEN);
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

        if (!user.isEmailVerified()) {
            auditService.log(
                    user.getId(),
                    "LOGIN_UNVERIFIED",
                    "User",
                    String.valueOf(user.getId()),
                    "FAILURE",
                    ip,
                    userAgent,
                    null);
            throw new ApiException(
                    "EMAIL_NOT_VERIFIED",
                    "Please verify your email before signing in. Check your inbox for the verification code.",
                    HttpStatus.FORBIDDEN);
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        if (user.getStatus() == UserStatus.LOCKED) {
            user.setStatus(UserStatus.ACTIVE);
        }
        user.setLastLoginAt(Instant.now());
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
        User refreshUser = stored.getUser();
        if (refreshUser.getDeletedAt() != null
                || refreshUser.getStatus() != UserStatus.ACTIVE
                || refreshUser.isLocked()) {
            throw new ApiException("ACCOUNT_DISABLED", "This account is not active.", HttpStatus.UNAUTHORIZED);
        }
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
        // Administrative status is independent of password recovery.
        // INACTIVE, PENDING and LOCKED accounts stay in that status.
        if (user.getStatus() == UserStatus.ACTIVE) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
        }
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

    /**
     * Generates and stores a hashed OTP, then attempts email delivery.
     *
     * @return plain OTP when email was not sent and dev-fallback is enabled; otherwise {@code null}
     */
    private String issueAndSendOtp(User user, String ip, String userAgent, String auditAction) {
        String otp = generateOtp();
        // New hash replaces any previous OTP; verification only accepts the latest code.
        user.setEmailOtpHash(passwordEncoder.encode(otp));
        user.setEmailOtpExpiresAt(Instant.now().plusSeconds(OTP_EXPIRY_SECONDS));
        user.setEmailOtpAttempts(0);
        user.setEmailOtpLastSentAt(Instant.now());
        userRepository.save(user);

        log.info(
                "New OTP generated and stored for userId={} action={} expiresInSeconds={}",
                user.getId(),
                auditAction,
                OTP_EXPIRY_SECONDS);

        boolean emailSent = emailService.sendVerificationOtp(user.getEmail(), otp);

        auditService.log(
                user.getId(),
                auditAction,
                "User",
                String.valueOf(user.getId()),
                "SUCCESS",
                ip,
                userAgent,
                emailSent ? "otp issued" : "otp issued (dev fallback)");

        return emailSent ? null : otp;
    }

    private String generateOtp() {
        int value = secureRandom.nextInt(OTP_LENGTH_BOUND);
        return String.format("%06d", value);
    }

    private void clearOtp(User user) {
        user.setEmailOtpHash(null);
        user.setEmailOtpExpiresAt(null);
        user.setEmailOtpAttempts(0);
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
                user.isEmailVerified(),
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
