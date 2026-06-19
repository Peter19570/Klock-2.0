package com.peter.klockapp.features.auth.constants;

public final class SecurityConstants {

    private SecurityConstants () {}

    public static final String[] PUBLIC_URLS = {"/api/v1/auth/**", "/api/v1/organization"};

    public static final String[] SWAGGER_URLS = {"/swagger-ui/**", "/v3/api-docs/**"};

    public static final String[] WEBSOCKET_URLS = {"/api/v1/avatar/webhook"};

    public static final String[] WEBHOOK_URLS = {"/ws-klock/**"};
}
