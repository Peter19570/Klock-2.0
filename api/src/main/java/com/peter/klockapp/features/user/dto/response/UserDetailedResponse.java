package com.peter.klockapp.features.user.dto.response;

import com.peter.klockapp.features.user.enums.UserRole;

import java.time.Instant;
import java.util.UUID;

public record UserDetailedResponse(
        UUID id,
        String joinedOrganization,
        String email,
        String firstName,
        String lastName,
        String picture,
        UserRole userRole,
        boolean emailVerified,
        String provider,
        boolean hasSetDevice,
        boolean mustChangePassword,
        Instant createdAt,
        String phone,
        String assignedBranch
) {
}
