package com.peter.klockapp.features.audit.mapper;

import com.peter.klockapp.features.audit.dto.AuditResponse;
import com.peter.klockapp.features.audit.model.AuditLog;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuditMapper {

    AuditResponse toDto(AuditLog auditLog);
}
