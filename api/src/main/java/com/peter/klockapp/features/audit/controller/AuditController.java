package com.peter.klockapp.features.audit.controller;

import com.peter.klockapp.features.audit.dto.AuditResponse;
import com.peter.klockapp.features.audit.enums.AuditAction;
import com.peter.klockapp.features.audit.filters.AuditFilter;
import com.peter.klockapp.features.audit.service.AuditService;
import com.peter.klockapp.features.shared.dto.ApiResponse;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audits")
@RequiredArgsConstructor
@Tag(name = "Audit-Log")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditResponse>>> getAllAudits(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) AuditAction auditAction,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) Instant minCreatedAt,
            @RequestParam(required = false) Instant maxCreatedAt
    ){
        AuditFilter filter = AuditFilter.builder()
                .fullName(fullName)
                .auditAction(auditAction)
                .userId(userId)
                .maxCreatedAt(maxCreatedAt)
                .minCreatedAt(minCreatedAt)
                .build();

        Pageable pageable = PageRequest.of(page, 50, Sort.by("createdAt").descending());
        Page<AuditResponse> responses = auditService.getAllAudits(pageable, filter, principal.user());
        return ResponseEntity.ok(new ApiResponse<>("All Audit Logs", responses));
    }
}
