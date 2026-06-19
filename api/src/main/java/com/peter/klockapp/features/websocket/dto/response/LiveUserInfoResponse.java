package com.peter.klockapp.features.websocket.dto.response;

public record LiveUserInfoResponse(
        String id,
        String email,
        String fullName,
        String latitude,
        String longitude,
        String timeStamp,
        String clockEventStatus,
        SessionInfo sessionInfo

) {
    public record SessionInfo(
            String sessionState,
            String arrivalStatus
    ){}
}
