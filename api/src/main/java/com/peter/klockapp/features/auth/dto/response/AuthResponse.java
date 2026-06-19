package com.peter.klockapp.features.auth.dto.response;

import com.peter.klockapp.features.user.dto.response.UserResponse;

public record AuthResponse(
        Boolean authenticated,
        TokenResponse token,
        UserResponse userInfo
) {}
