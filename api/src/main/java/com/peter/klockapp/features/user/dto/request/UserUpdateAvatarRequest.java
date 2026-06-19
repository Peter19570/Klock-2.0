package com.peter.klockapp.features.user.dto.request;

import java.util.UUID;

public record UserUpdateAvatarRequest(
        UUID userId,
        UUID orgId,
        String secureId,
        String publicId
) {
}
