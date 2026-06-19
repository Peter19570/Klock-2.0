package com.peter.klockapp.features.clockevent.repo;

import com.peter.klockapp.features.clockevent.model.ClockEvent;
import com.peter.klockapp.features.session.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClockEventRepo extends JpaRepository<ClockEvent, UUID> {

    boolean existsBySessionUserIdAndUserOrganizationIdAndClockOutTimeIsNull(
            UUID userId, UUID organizationId);

    Optional<ClockEvent> findBySessionUserIdAndUserOrganizationIdAndClockOutTimeIsNull(
            UUID userId, UUID organizationId);

    long countByClockOutTimeIsNullAndSessionStatusAndBranchIdAndOrganizationId(
            SessionStatus sessionStatus, UUID branchId, UUID orgId);

    @Query("SELECT ce.clockOutType, COUNT(ce) FROM ClockEvent ce " +
            "WHERE ce.clockOutTime IS NOT NULL AND ce.organization.id = :orgId AND ce.clockInTime >= :startOfDay " +
            "GROUP BY ce.clockOutType")
    List<Object[]> getTodayClockOutStats(
            @Param("startOfDay") Instant startOfDay,
            @Param("orgId") UUID ordId);

    @Query("SELECT ce.clockOutType, COUNT(ce) FROM ClockEvent ce " +
            "WHERE ce.clockOutTime IS NOT NULL " +
            "AND ce.organization.id = :orgId AND ce.branch.id = :branchId " +
            "AND ce.clockInTime >= :startOfDay " +
            "GROUP BY ce.clockOutType")
    List<Object[]> getTodayClockOutStatsForBranch(
            @Param("startOfDay") Instant startOfDay,
            @Param("branchId") UUID branchId,
            @Param("orgId") UUID ordId);


    @Query("SELECT AVG(ce.clockInDistanceFromBranch) FROM ClockEvent ce " +
            "WHERE ce.branch.id = :branchId " +
            "AND ce.clockInDistanceFromBranch IS NOT NULL " +
            "AND ce.organization.id = :organizationId")
    Double getAverageClockInDistanceForBranch(
            @Param("branchId") UUID branchId,
            @Param("organizationId") UUID organizationId);

    @Modifying
    @Transactional
    @Query(value = """
    WITH terminated_events AS (
        UPDATE clock_events ce
        SET clock_out_time = NOW(),
            clock_out_type = 'SERVER'
        FROM branches b, sessions s
        WHERE ce.branch_id = b.id
          AND ce.session_id = s.id
          AND ce.clock_out_time IS NULL
          AND s.status = 'ACTIVE'
          AND NOW() > ((ce.created_at::date + b.shift_end) + INTERVAL '3 hours')
        RETURNING ce.session_id
    )
    UPDATE sessions
    SET status = 'COMPLETED'
    WHERE id IN (SELECT session_id FROM terminated_events);
    """, nativeQuery = true)
    int autoClockOutExpiredSessions();
}
