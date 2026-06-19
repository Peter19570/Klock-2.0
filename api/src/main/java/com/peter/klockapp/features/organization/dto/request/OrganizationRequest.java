package com.peter.klockapp.features.organization.dto.request;

import com.peter.klockapp.features.auth.dto.request.RegisterRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrganizationRequest(

        @NotNull(message = "Organization display name is required")
        @NotBlank(message = "Organization display name cannot be blank")
        String displayName,

        String description,

        @Valid
        @NotNull(message = "Registration information is required")
        RegisterRequest registerRequest
) {
}
