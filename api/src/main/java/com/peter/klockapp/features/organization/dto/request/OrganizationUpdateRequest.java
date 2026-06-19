package com.peter.klockapp.features.organization.dto.request;

public record OrganizationUpdateRequest(
        String displayName,
        String description
) {
}
