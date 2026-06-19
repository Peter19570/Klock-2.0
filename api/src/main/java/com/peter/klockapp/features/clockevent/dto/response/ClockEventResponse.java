package com.peter.klockapp.features.clockevent.dto.response;

import com.peter.klockapp.features.clockevent.enums.ClockOutType;

import java.time.Instant;
import java.util.UUID;

public record ClockEventResponse(
        UUID id,
        String branchName,
        Instant clockInTime,
        Instant clockOutTime,
        Boolean departedEarly,
        ClockOutType clockOutType,
        Double latitude,
        Double longitude,
        Double clockInOutDistance,
        Double clockInDistanceFromBranch
) {
}
