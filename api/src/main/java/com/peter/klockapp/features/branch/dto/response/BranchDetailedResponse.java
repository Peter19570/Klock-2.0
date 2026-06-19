package com.peter.klockapp.features.branch.dto.response;

import com.peter.klockapp.features.branch.enums.BranchStatus;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

public record BranchDetailedResponse(
        UUID id,
        UUID organizationId,
        String displayName,
        String slug,
        double latitude,
        double longitude,
        double radius,
        LocalTime shiftStart,
        LocalTime shiftEnd,
        String support,
        String geofenceName,
        Instant createdAt,

        Double avgDistance,
        double displayAvg,
        String status,

        long geofenceExitTimeoutMinutes,
        BranchStatus branchStatus,
        long totalEmployees,
        long totalAdmins,
        long currentActiveCount
) {
}
