package com.peter.klockapp.features.auth.exceptions;

public class AuthenticationException extends RuntimeException {
    public AuthenticationException(String message) {
        super(message);
    }
}
