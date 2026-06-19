package com.peter.klockapp.features.session.exceptions;

public class WriteToCSVException extends RuntimeException {
    public WriteToCSVException(String message, String eMessage) {
        super(message);
    }
}
