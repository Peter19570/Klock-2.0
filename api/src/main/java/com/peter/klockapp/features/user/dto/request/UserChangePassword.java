package com.peter.klockapp.features.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserChangePassword(

        @NotNull(message = "Password is required")
        @NotBlank(message = "Password cannot be empty")
        @Size(min = 6, message = "Password should be greater than 6 chars")
        String newPassword
) {
}
