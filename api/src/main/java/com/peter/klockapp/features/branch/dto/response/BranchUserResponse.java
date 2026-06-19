package com.peter.klockapp.features.branch.dto.response;

import java.time.LocalTime;
import java.util.UUID;

public record BranchUserResponse(
        UUID id,
        String displayName,
        String slug,
        double latitude,
        double longitude,
        Double radius,
        LocalTime shiftStart,
        LocalTime shiftEnd,
        Long geofenceExitTimeoutMinutes,
        String geofenceName
) {
}
