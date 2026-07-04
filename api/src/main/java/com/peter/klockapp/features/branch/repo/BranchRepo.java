package com.peter.klockapp.features.branch.repo;

import com.peter.klockapp.features.branch.enums.BranchStatus;
import com.peter.klockapp.features.branch.model.Branch;
import com.peter.klockapp.features.user.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BranchRepo extends JpaRepository<Branch, UUID>, JpaSpecificationExecutor<Branch> {

    Optional<Branch> findByOrganizationIdAndIdAndDeletedAtIsNull(
            UUID organizationId, UUID branchId);

    List<Branch> findAllByOrganizationIdAndDeletedAtIsNull
            (UUID organizationId);

    long countByOrganizationIdAndBranchStatusAndDeletedAtIsNull(
            UUID orgId, BranchStatus branchStatus);

    @Query("SELECT COUNT(e) FROM ClockEvent e WHERE e.branch.id = :branchId" +
            " AND e.clockOutTime IS NULL AND e.user.organization.id = :organizationId")
    long countActiveUsersByBranchId(
            @Param("branchId") UUID branchId,
            @Param("organizationId") UUID organizationId);

    @Query("SELECT COUNT(u) FROM Branch b JOIN b.users u WHERE b.id = :branchId " +
            "AND b.organization.id = :organizationId AND u.userRole = :userRole")
    long countUsersByBranchIdAndRole(
            @Param("branchId") UUID branchId,
            @Param("organizationId") UUID organizationId,
            @Param("userRole") UserRole userRole
    );
}
