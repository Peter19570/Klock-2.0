package com.peter.klockapp.features.organization.dto.response;

import com.peter.klockapp.features.auth.dto.response.AuthResponse;

import java.util.UUID;

public record OrganizationResponse(
        OrganizationInfo organizationInfo,
        AuthResponse authResponse
) {
    public record OrganizationInfo(
            UUID id,
            String displayName
    ){}
}
