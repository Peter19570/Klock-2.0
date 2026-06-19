package com.peter.klockapp.features.user.dto.response;

import com.peter.klockapp.features.user.enums.UserRole;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String picture,
        UserRole userRole,
        boolean emailVerified,
        boolean hasSetDevice,
        boolean mustChangePassword,
        String assignedBranch
) {}
