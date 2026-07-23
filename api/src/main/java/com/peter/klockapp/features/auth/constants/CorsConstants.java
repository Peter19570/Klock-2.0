package com.peter.klockapp.features.auth.constants;

import org.springframework.beans.factory.annotation.Value;

import java.util.List;

public final class CorsConstants {

    private CorsConstants() {}

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
