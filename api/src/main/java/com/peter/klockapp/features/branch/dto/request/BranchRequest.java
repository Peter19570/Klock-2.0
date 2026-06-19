package com.peter.klockapp.features.branch.dto.request;

import com.peter.klockapp.features.branch.enums.BranchStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public record BranchRequest(
        String displayName,

        @DecimalMin(value = "-90.0", message = "Latitude should range between -90 to 90")
        @DecimalMax(value = "90.0", message = "Latitude should range between -90 to 90")
        Double latitude,

        @DecimalMin(value = "-180.0", message = "Latitude should range between -180 to 180")
        @DecimalMax(value = "180.0", message = "Latitude should range between -180 to 180")
        Double longitude,

        @DecimalMin(value = "0.0", message = "Radius should be greater than 0.0")
        Double radius,

        String geofenceName,
        LocalTime shiftStart,
        LocalTime shiftEnd,

        @Min(value = 0L, message = "Geofence exit timeout should be greater than 0 minute")
        Long geofenceExitTimeoutMinutes,

        BranchStatus branchStatus,

        @Size(max = 100, message = "Support contact should not exceed 100 characters")
        String support
) {
}
