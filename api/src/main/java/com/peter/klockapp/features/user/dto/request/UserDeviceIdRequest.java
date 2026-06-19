package com.peter.klockapp.features.user.dto.request;

import jakarta.validation.constraints.NotNull;

public record UserDeviceIdRequest(

        @NotNull(message = "Device-id is required")
        String deviceId
) {
}
