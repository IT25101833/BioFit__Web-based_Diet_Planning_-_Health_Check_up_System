package com.biofit.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record LoginRequest(
            @NotBlank(message = "Email is required") @Email String email,
            @NotBlank(message = "Password is required") String password) {}

    public record RegisterRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password,
            @NotBlank String firstName,
            @NotBlank String lastName,
            String contactNumber) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record ForgotPasswordRequest(@NotBlank @Email String email) {}

    public record ResetPasswordRequest(
            @NotBlank String token,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
                    String newPassword) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
                    String newPassword) {}

    public record VerifyEmailRequest(
            @NotBlank @Email String email,
            @NotBlank
                    @Pattern(regexp = "^\\d{6}$", message = "Verification code must be 6 digits")
                    String otp) {}

    public record ResendVerificationRequest(@NotBlank @Email String email) {}

    public record RegisterPendingResponse(
            String email, String message, boolean verificationRequired, String devOtp) {}

    public record VerifyEmailResponse(String email, String message, boolean verified) {}

    public record AuthUserResponse(
            Long id,
            String email,
            String firstName,
            String lastName,
            String fullName,
            String contactNumber,
            String specialization,
            String status,
            boolean emailVerified,
            java.util.List<String> roles,
            String primaryRole) {}

    public record TokenResponse(
            String accessToken, String refreshToken, String tokenType, AuthUserResponse user) {}
}
