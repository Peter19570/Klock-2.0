package com.peter.klockapp.features.session.filters;

import com.peter.klockapp.features.session.enums.SessionArrivalStatus;
import com.peter.klockapp.features.session.enums.SessionStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
public class SessionFilter {

    private LocalDate minWorkDate;
    private LocalDate maxWorkDate;
    private SessionArrivalStatus arrivalStatus;
    private SessionStatus status;
    private String sessionUser;
    private UUID userId;
    private UUID branchId;
    private UUID organizationId;
}
