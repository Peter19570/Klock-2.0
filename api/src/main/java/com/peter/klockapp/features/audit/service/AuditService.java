package com.peter.klockapp.features.audit.service;

import com.peter.klockapp.features.audit.dto.AuditRequest;
import com.peter.klockapp.features.audit.dto.AuditResponse;
import com.peter.klockapp.features.audit.filters.AuditFilter;
import com.peter.klockapp.features.audit.mapper.AuditMapper;
import com.peter.klockapp.features.audit.model.AuditLog;
import com.peter.klockapp.features.audit.repo.AuditRepo;
import com.peter.klockapp.features.audit.specifications.AuditSpecification;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import com.peter.klockapp.features.shared.dto.PageResponse;
import com.peter.klockapp.features.user.model.User;
import com.peter.klockapp.features.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditService {

    private final AuditRepo auditRepo;
    private final AuditMapper auditMapper;
    private final AuditSpecification auditSpecification;
    private final UserService userService;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleAuditEvent(AuditRequest request) {
        AuditLog audit = AuditLog.builder()
                .userId(request.user().getId())
                .organizationId(request.user().getOrganization().getId())
                .fullName(request.user().getFirstName() + " " + request.user().getLastName())
                .email(request.user().getEmail())
                .action(request.auditAction())
                .metadata(request.metaData())
                .build();

        auditRepo.save(audit);
    }

    public PageResponse<AuditResponse> getAllAudits(
            Pageable pageable, AuditFilter filter, CustomUserPrincipal principal){
        User currentUser = userService.fetchCurrentUser(principal);

        filter.setOrgId(currentUser.getOrganization().getId());
        Page<AuditLog> responses = auditRepo.findAll(auditSpecification.withFilter(filter), pageable);
        return PageResponse.from(responses.map(auditMapper::toDto));
    }
}
