package com.biofit.backend.auth;

import com.biofit.backend.auth.dto.AuthDtos.AuthUserResponse;
import com.biofit.backend.auth.dto.AuthDtos.ChangePasswordRequest;
import com.biofit.backend.auth.dto.AuthDtos.ForgotPasswordRequest;
import com.biofit.backend.auth.dto.AuthDtos.LoginRequest;
import com.biofit.backend.auth.dto.AuthDtos.RefreshRequest;
import com.biofit.backend.auth.dto.AuthDtos.RegisterRequest;
import com.biofit.backend.auth.dto.AuthDtos.ResetPasswordRequest;
import com.biofit.backend.auth.dto.AuthDtos.TokenResponse;
import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TokenResponse> register(
            @Valid @RequestBody RegisterRequest request, HttpServletRequest http) {
        return ApiResponse.ok(authService.register(request, clientIp(http), http.getHeader("User-Agent")));
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(
            @Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        return ApiResponse.ok(authService.login(request, clientIp(http), http.getHeader("User-Agent")));
    }

    @PostMapping("/refresh")
    public ApiResponse<TokenResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ApiResponse.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ApiResponse<Map<String, Boolean>> logout(
            @RequestBody(required = false) RefreshRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest http) {
        String token = request == null ? null : request.refreshToken();
        authService.logout(token, principal, clientIp(http), http.getHeader("User-Agent"));
        return ApiResponse.ok(Map.of("success", true));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Map<String, String>> forgot(
            @Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest http) {
        authService.forgotPassword(request, clientIp(http), http.getHeader("User-Agent"));
        return ApiResponse.ok(
                Map.of("message", "If an account exists for that email, reset instructions were issued."));
    }

    @PostMapping("/reset-password")
    public ApiResponse<Map<String, String>> reset(
            @Valid @RequestBody ResetPasswordRequest request, HttpServletRequest http) {
        authService.resetPassword(request, clientIp(http), http.getHeader("User-Agent"));
        return ApiResponse.ok(Map.of("message", "Password updated successfully."));
    }

    @PutMapping("/change-password")
    public ApiResponse<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest http) {
        authService.changePassword(principal, request, clientIp(http), http.getHeader("User-Agent"));
        return ApiResponse.ok(Map.of("message", "Password updated successfully."));
    }

    @GetMapping("/me")
    public ApiResponse<AuthUserResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(authService.me(principal));
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
