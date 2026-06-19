package com.peter.klockapp.features.session.dto.response;

import com.peter.klockapp.features.clockevent.dto.response.ClockEventResponse;
import com.peter.klockapp.features.session.enums.SessionArrivalStatus;
import com.peter.klockapp.features.session.enums.SessionStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record SessionResponse(
        UUID id,
        LocalDate workDate,
        String sessionUser,
        SessionArrivalStatus arrivalStatus,
        SessionStatus status,
        Double totalDistanceCovered,
        List<ClockEventResponse> clockEvents
) {
}
