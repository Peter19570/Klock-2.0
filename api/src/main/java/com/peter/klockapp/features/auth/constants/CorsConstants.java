package com.peter.klockapp.features.auth.constants;

import java.util.List;

public final class CorsConstants {

    private CorsConstants() {}

    // remember to set allowed credentials to false if using *
    // public static final List<String> ALLOWED_ORIGINS = List.of("*");

    public static final List<String> ALLOWED_ORIGINS = List.of("http://localhost:3000");

    public static final List<String> ALLOWED_HEADERS = List.of(
            "Authorization",
            "Content-Type",
            "Accept",
            "X-Requested-With"
    );

    public static final List<String> ALLOWED_METHODS = List.of(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS",
            "PATCH"
    );

    public static final List<String> ALLOWED_EXPOSED_HEADERS = List.of("Authorization");

    public static final String PATTERN = "/**";

}
