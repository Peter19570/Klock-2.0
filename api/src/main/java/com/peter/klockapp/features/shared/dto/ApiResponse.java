package com.peter.klockapp.features.shared.dto;

public record ApiResponse<T>(
        String msg,
        T data
) {
}
