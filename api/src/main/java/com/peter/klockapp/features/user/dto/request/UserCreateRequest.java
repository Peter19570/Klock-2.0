package com.peter.klockapp.features.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(
        @NotNull(message = "First name is required")
        @NotBlank(message = "First name cannot be blank")
        String firstName,

        @NotNull(message = "Last name is required")
        @NotBlank(message = "Last name cannot be blank")
        String lastName,

        @Size(max = 15, message = "Phone number should not exceed 15 characters")
        String phone,

        String deviceId
) {
}
