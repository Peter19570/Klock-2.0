package com.peter.klockapp.features.dashboard.dto.response;

import com.peter.klockapp.features.session.dto.response.SessionResponse;

import java.util.List;

public record DashboardAdminResponse(
        long totalEmployees,
        long totalActiveClockEvents,
        long totalLateArrivals,
        ClockOutStats clockOutStats,
        List<SessionTrend> sessionTrend,
        List<SessionResponse> recentSessions

) {
    public record SessionTrend(
            String date,
            String dayLabel,
            int count
    ) {}

    public record ClockOutStats(
            long manual,
            long automatic,
            long server,
            long adminForce
    ) {}
}
