package com.peter.klockapp.features.user.dto.request;

import com.peter.klockapp.features.user.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AdminCreateUserRequest(
        @NotNull(message = "First name is required")
        @NotBlank(message = "First name cannot be blank")
        String firstName,

        @NotNull(message = "Last name is required")
        @NotBlank(message = "Last name cannot be blank")
        String lastName,

        @NotNull(message = "Email is required")
        @NotBlank(message = "Email cannot be empty")
        @Email(message = "Enter a valid email address")
        String email,

        @Size(max = 15, message = "Phone number should not exceed 15 characters")
        String phone,

        UserRole userRole,
        UUID branchId
) {
}
