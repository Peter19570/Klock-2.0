package com.peter.klockapp.features.auth.dto.request;

import com.peter.klockapp.features.user.dto.request.UserCreateRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotNull(message = "Email is required")
        @NotBlank(message = "Email cannot be empty")
        @Email(message = "Enter a valid email address")
        String email,

        @NotNull(message = "Password is required")
        @NotBlank(message = "Password cannot be empty")
        @Size(min = 6, message = "Password should be greater than 6 chars")
        String password,

        @Valid
        UserCreateRequest userCreateRequest
) {
}
