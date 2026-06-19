package com.peter.klockapp.features.audit.dto;

import com.peter.klockapp.features.audit.enums.AuditAction;
import com.peter.klockapp.features.user.model.User;

import java.util.Map;

public record AuditRequest(
        User user,
        AuditAction auditAction,
        Map<String, Object> metaData
) {
}
