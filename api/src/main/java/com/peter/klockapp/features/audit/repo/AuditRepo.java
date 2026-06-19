package com.peter.klockapp.features.audit.repo;

import com.peter.klockapp.features.audit.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditRepo extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {
}
