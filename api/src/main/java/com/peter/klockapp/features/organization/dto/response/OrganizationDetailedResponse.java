package com.peter.klockapp.features.organization.dto.response;

import java.time.Instant;
import java.util.UUID;

public record OrganizationDetailedResponse(
        UUID id,
        String displayName,
        String description,
        Instant createdAt
) {
}
