package com.peter.klockapp.features.audit.filters;

import com.peter.klockapp.features.audit.enums.AuditAction;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
public class AuditFilter {

    private String fullName;
    private AuditAction auditAction;
    private UUID userId;
    private UUID orgId;
    private Instant minCreatedAt;
    private Instant maxCreatedAt;

}
