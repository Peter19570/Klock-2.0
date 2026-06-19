package com.peter.klockapp.features.dashboard.service;

import com.peter.klockapp.features.auth.exceptions.NotFoundException;
import com.peter.klockapp.features.branch.enums.BranchStatus;
import com.peter.klockapp.features.branch.repo.BranchRepo;
import com.peter.klockapp.features.clockevent.enums.ClockOutType;
import com.peter.klockapp.features.clockevent.repo.ClockEventRepo;
import com.peter.klockapp.features.dashboard.dto.response.DashboardAdminResponse;
import com.peter.klockapp.features.dashboard.dto.response.DashboardSuperAdminResponse;
import com.peter.klockapp.features.dashboard.mapper.DashboardMapper;
import com.peter.klockapp.features.session.dto.response.SessionResponse;
import com.peter.klockapp.features.session.enums.SessionArrivalStatus;
import com.peter.klockapp.features.session.enums.SessionStatus;
import com.peter.klockapp.features.session.mapper.SessionMapper;
import com.peter.klockapp.features.session.repo.SessionRepo;
import com.peter.klockapp.features.user.enums.UserRole;
import com.peter.klockapp.features.user.model.User;
import com.peter.klockapp.features.user.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepo userRepo;
    private final SessionRepo sessionRepo;
    private final ClockEventRepo clockEventRepo;
    private final BranchRepo branchRepo;
    private final SessionMapper sessionMapper;
    private final DashboardMapper dashboardMapper;

    public DashboardSuperAdminResponse getSuperAdminDashboard(User currentUser) {
        UUID orgId = currentUser.getOrganization().getId();
        Instant startOfToday = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();

        long totalEmployees = userRepo.countByUserRoleAndOrganizationId(
                UserRole.USER, orgId);

        long totalAdmins = userRepo.countByUserRoleAndOrganizationId(
                UserRole.ADMIN, orgId);

        long totalActiveSessions = sessionRepo.countByStatusAndOrganizationIdAndWorkDate(
                SessionStatus.ACTIVE, orgId, LocalDate.now());

        long totalLateArrivals = sessionRepo.countByArrivalStatusAndOrganizationIdAndWorkDate(
                SessionArrivalStatus.LATE, orgId, LocalDate.now());

        long lockedBranchCount = branchRepo.countByOrganizationIdAndBranchStatus(
                orgId, BranchStatus.LOCKED);

        List<DashboardSuperAdminResponse.SessionTrend> trend = getLast7DaysTrend(orgId);

        var clockOutMap = clockEventRepo.getTodayClockOutStats(startOfToday, orgId)
                .stream()
                .collect(Collectors.toMap(
                        row -> (ClockOutType) row[0],
                        row -> (Long) row[1],
                        (a, b) -> a
                ));

        var stats = new DashboardSuperAdminResponse.ClockOutStats(
                clockOutMap.getOrDefault(ClockOutType.MANUAL, 0L),
                clockOutMap.getOrDefault(ClockOutType.AUTOMATIC, 0L),
                clockOutMap.getOrDefault(ClockOutType.SERVER, 0L),
                clockOutMap.getOrDefault(ClockOutType.ADMIN_FORCE, 0L)
        );

        List<SessionResponse> recentSessions = sessionMapper
                .toListDto(sessionRepo.findFirst10ByOrganizationIdOrderByCreatedAtAsc(orgId));

        return dashboardMapper.toSuperAdminDto(
                totalEmployees, totalAdmins, totalActiveSessions,
                totalLateArrivals, lockedBranchCount, stats,
                trend, recentSessions
        );
    }

    public DashboardAdminResponse getAdminDashBoard(User currentUser, UUID branchUUID){
        UUID orgId = currentUser.getOrganization().getId();
        UUID branchId = null;

        Instant startOfToday = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();
        UserRole userRole = currentUser.getUserRole();


        switch (userRole){
            case ADMIN -> {
                if (currentUser.getBranch().getId() == null){
                    throw new NotFoundException("User is not assigned to any Branch");
                }

                branchId = currentUser.getBranch().getId();
            }

            case SUPER_ADMIN -> {
                if (branchUUID == null){
                    throw new NotFoundException("Provide branch ID to view dashboard");
                }

                branchId = branchUUID;
            }
        }

        long totalEmployees = userRepo.countByUserRoleAndOrganizationIdAndBranchId(
                UserRole.USER, orgId, branchId);

        long totalActiveClockEvents = clockEventRepo
                .countByClockOutTimeIsNullAndSessionStatusAndBranchIdAndOrganizationId(
                        SessionStatus.ACTIVE, branchId, orgId);

        long totalLateArrivals = sessionRepo
                .countByArrivalStatusAndOrganizationIdAndBranchIdAndWorkDate(
                        SessionArrivalStatus.LATE, orgId, branchId, LocalDate.now());

        var clockOutMap = clockEventRepo.getTodayClockOutStatsForBranch(startOfToday, branchId, orgId)
                .stream()
                .collect(Collectors.toMap(
                        row -> (ClockOutType) row[0],
                        row -> (Long) row[1],
                        (a, b) -> a
                ));

        var stats = new DashboardAdminResponse.ClockOutStats(
                clockOutMap.getOrDefault(ClockOutType.MANUAL, 0L),
                clockOutMap.getOrDefault(ClockOutType.AUTOMATIC, 0L),
                clockOutMap.getOrDefault(ClockOutType.SERVER, 0L),
                clockOutMap.getOrDefault(ClockOutType.ADMIN_FORCE, 0L)
        );

        List<DashboardAdminResponse.SessionTrend> trend = getLast7DaysTrendForBranch(
                branchId, orgId);

        List<SessionResponse> recentSessions = sessionMapper.toListDto(
                sessionRepo.findFirst10ByOrganizationIdAndBranchIdOrderByCreatedAtAsc(orgId, branchId));

        return dashboardMapper.toAdminDto(totalEmployees, totalActiveClockEvents,
                totalLateArrivals, stats, trend, recentSessions);
    }

    private List<DashboardSuperAdminResponse.SessionTrend> getLast7DaysTrend(UUID orgId) {
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(6);
        var dbData = sessionRepo.getSessionTrendData(sevenDaysAgo, orgId)
                .stream().collect(Collectors.toMap(
                        row -> (LocalDate) row[0],
                        row -> ((Long) row[1]).intValue()
                ));

        List<DashboardSuperAdminResponse.SessionTrend> fullTrend = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = sevenDaysAgo.plusDays(i);
            fullTrend.add(new DashboardSuperAdminResponse.SessionTrend(
                    date.toString(),
                    date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    dbData.getOrDefault(date, 0)
            ));
        }
        return fullTrend;
    }

    private List<DashboardAdminResponse.SessionTrend> getLast7DaysTrendForBranch(UUID branchId, UUID orgId) {
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(6);
        var dbData = sessionRepo.getSessionTrendDataForBranch(sevenDaysAgo, branchId, orgId)
                .stream().collect(Collectors.toMap(
                        row -> (LocalDate) row[0],
                        row -> ((Long) row[1]).intValue()
                ));

        List<DashboardAdminResponse.SessionTrend> fullTrend = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = sevenDaysAgo.plusDays(i);
            fullTrend.add(new DashboardAdminResponse.SessionTrend(
                    date.toString(),
                    date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    dbData.getOrDefault(date, 0)
            ));
        }
        return fullTrend;
    }

}
