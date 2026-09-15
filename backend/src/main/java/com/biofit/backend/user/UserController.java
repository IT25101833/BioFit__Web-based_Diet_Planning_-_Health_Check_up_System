package com.biofit.backend.user;

import com.biofit.backend.auth.AuthService;
import com.biofit.backend.auth.dto.AuthDtos.AuthUserResponse;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.dto.UserDtos.UpdateProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ApiResponse<AuthUserResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        User user =
                userRepository
                        .findById(principal.getId())
                        .orElseThrow(
                                () -> new ApiException("NOT_FOUND", "User not found.", HttpStatus.NOT_FOUND));
        return ApiResponse.ok(AuthService.toAuthUser(user));
    }

    @PatchMapping("/me")
    public ApiResponse<AuthUserResponse> updateMe(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        User user =
                userRepository
                        .findById(principal.getId())
                        .orElseThrow(
                                () -> new ApiException("NOT_FOUND", "User not found.", HttpStatus.NOT_FOUND));

        if (request.firstName() != null && !request.firstName().isBlank()) {
            user.setFirstName(request.firstName().trim());
        }
        if (request.lastName() != null && !request.lastName().isBlank()) {
            user.setLastName(request.lastName().trim());
        }
        if (request.contactNumber() != null) {
            user.setContactNumber(request.contactNumber().trim());
        }
        if (request.specialization() != null) {
            user.setSpecialization(request.specialization().trim());
        }

        userRepository.save(user);
        return ApiResponse.ok(AuthService.toAuthUser(user));
    }
}
