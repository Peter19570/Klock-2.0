package com.peter.klockapp.features.session.repo;

import com.peter.klockapp.features.session.enums.SessionArrivalStatus;
import com.peter.klockapp.features.session.enums.SessionStatus;
import com.peter.klockapp.features.session.model.Session;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

@Repository
public interface SessionRepo extends JpaRepository<Session, UUID>, JpaSpecificationExecutor<Session> {

    Optional<Session> findByWorkDateAndUserIdAndUserOrganizationId(
            LocalDate workDate, UUID userId, UUID organizationId);

    Optional<Session> findByIdAndOrganizationIdAndStatus(
            UUID sessionId, UUID orgId, SessionStatus sessionStatus);

    void deleteByUserIdAndUserOrganizationIdAndId(
            UUID userId, UUID organizationId, UUID sessionId);

    long countByStatusAndOrganizationIdAndWorkDate(
            SessionStatus sessionStatus, UUID orgId, LocalDate workDate);

    long countByArrivalStatusAndOrganizationIdAndWorkDate(
            SessionArrivalStatus arrivalStatus, UUID orgId, LocalDate workDate);

    long countByArrivalStatusAndOrganizationIdAndBranchIdAndWorkDate(
            SessionArrivalStatus arrivalStatus, UUID orgId, UUID branchId, LocalDate workDate);

    List<Session> findFirst10ByOrganizationIdOrderByCreatedAtAsc(
            UUID organizationId);

    List<Session> findFirst10ByOrganizationIdAndBranchIdOrderByCreatedAtAsc(
            UUID organizationId, UUID branchId);

    @Query("SELECT s.workDate as date, COUNT(s) as count FROM Session s " +
            "WHERE s.workDate > :since AND s.organization.id = :orgId " +
            "GROUP BY s.workDate ORDER BY s.workDate ASC")
    List<Object[]> getSessionTrendData(
            @Param("since") LocalDate since,
            @Param("orgId") UUID orgId);

    @Query("SELECT s.workDate as date, COUNT(s) as count FROM Session s " +
            "WHERE s.workDate > :since AND s.branch.id = :branchId AND s.organization.id = :orgId " +
            "GROUP BY s.workDate ORDER BY s.workDate ASC")
    List<Object[]> getSessionTrendDataForBranch(
            @Param("since") LocalDate since,
            @Param("branchId") UUID branchId,
            @Param("orgId") UUID orgId);

    @QueryHints(value = {
            @QueryHint(name = "org.hibernate.fetchSize", value = "100"),
            @QueryHint(name = "org.hibernate.readOnly", value = "true")
    })
    @Query("SELECT DISTINCT s FROM Session s " +
            "JOIN FETCH s.user " +
            "JOIN s.clockEvents e " +
            "WHERE (:branchId IS NULL OR e.branch.id = :branchId) " +
            "AND s.workDate BETWEEN :start AND :end " +
            "AND s.user.organization.id = :organizationId")
    Stream<Session> streamByBranchForExport(
            @Param("branchId") UUID branchId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("organizationId") UUID organizationId
    );
}
