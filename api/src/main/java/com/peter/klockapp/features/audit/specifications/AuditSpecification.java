package com.peter.klockapp.features.audit.specifications;

import com.peter.klockapp.features.audit.filters.AuditFilter;
import com.peter.klockapp.features.audit.model.AuditLog;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class AuditSpecification {

    public Specification<AuditLog> withFilter(AuditFilter auditLogFilter){

        Specification<AuditLog> spec = Specification.allOf();

        if (auditLogFilter.getFullName() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")),
                            "%" + auditLogFilter.getFullName().toLowerCase() + "%"));
        }

        if (auditLogFilter.getAuditAction() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("action"), auditLogFilter.getAuditAction()));
        }

        if (auditLogFilter.getUserId() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("userId"), auditLogFilter.getUserId()));
        }

        if (auditLogFilter.getOrgId() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("organizationId"), auditLogFilter.getOrgId()));
        }

        if (auditLogFilter.getMinCreatedAt() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), auditLogFilter.getMinCreatedAt()));
        }

        if (auditLogFilter.getMaxCreatedAt() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), auditLogFilter.getMaxCreatedAt()));
        }

        return spec;
    }
}
