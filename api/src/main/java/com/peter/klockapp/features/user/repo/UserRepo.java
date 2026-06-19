package com.peter.klockapp.features.user.repo;

import com.peter.klockapp.features.user.enums.UserRole;
import com.peter.klockapp.features.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepo extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmail(String email);

    Optional<User> findByIdAndDeletedAtIsNull(UUID userId);

    Optional<User> findByIdAndOrganizationId(UUID userId, UUID orgId);

    void deleteByIdAndOrganizationId(UUID userId, UUID orgId);

    long countByUserRoleAndOrganizationId(
            UserRole userRole, UUID orgId);

    long countByUserRoleAndOrganizationIdAndBranchId(
            UserRole userRole, UUID orgId, UUID branchId);
}
