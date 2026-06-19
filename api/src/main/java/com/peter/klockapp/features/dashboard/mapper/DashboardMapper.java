package com.peter.klockapp.features.dashboard.mapper;

import com.peter.klockapp.features.dashboard.dto.response.DashboardAdminResponse;
import com.peter.klockapp.features.dashboard.dto.response.DashboardSuperAdminResponse;
import com.peter.klockapp.features.session.dto.response.SessionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DashboardMapper {

    DashboardSuperAdminResponse toSuperAdminDto(
            long totalEmployees,
            long totalAdmins,
            long totalActiveSessions,
            long totalLateArrivals,
            long lockedBranchCount,
            DashboardSuperAdminResponse.ClockOutStats clockOutStats,
            List<DashboardSuperAdminResponse.SessionTrend> sessionTrend,
            List<SessionResponse> recentSessions
    );

    DashboardAdminResponse toAdminDto(
            long totalEmployees,
            long totalActiveClockEvents,
            long totalLateArrivals,
            DashboardAdminResponse.ClockOutStats clockOutStats,
            List<DashboardAdminResponse.SessionTrend> sessionTrend,
            List<SessionResponse> recentSessions
    );
}
