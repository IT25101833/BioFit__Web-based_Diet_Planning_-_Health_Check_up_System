package com.biofit.backend.user.dto;

import jakarta.validation.constraints.Size;

public class UserDtos {

    public record UpdateProfileRequest(
            @Size(max = 100) String firstName,
            @Size(max = 100) String lastName,
            @Size(max = 40) String contactNumber,
            @Size(max = 255) String specialization) {}
}
