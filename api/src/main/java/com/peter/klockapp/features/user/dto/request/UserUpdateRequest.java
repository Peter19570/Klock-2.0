package com.peter.klockapp.features.user.dto.request;

import com.peter.klockapp.features.user.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UserUpdateRequest(

        @Size(min = 3, message = "First name should be greater than 3 characters")
        String firstName,

        @Size(min = 3, message = "Last name should be greater than 3 characters")
        String lastName,

        @Size(max = 15, message = "Phone number should not exceed 15 characters")
        String phone,

        UserRole userRole,
        UUID branchId
) {
}
