package com.peter.klockapp.features.audit.dto;

import com.peter.klockapp.features.audit.enums.AuditAction;

import java.util.Map;
import java.util.UUID;

public record AuditResponse(
        UUID userId,
        String fullName,
        AuditAction action,
        Map<String, Object> metadata
) {
}
