// frontend/lib/mocks/dashboard-data.ts
import type { components } from "@/lib/api/generated/schema";

type DashboardData = components["schemas"]["DashboardSuperAdminResponse"] &
  components["schemas"]["DashboardAdminResponse"];
type SessionTrend = components["schemas"]["SessionTrend"];
type ClockOutStats = components["schemas"]["ClockOutStats"];
type SessionResponse = components["schemas"]["SessionResponse"];

export const mockDashboardData: DashboardData = {
  totalEmployees: 24,
  totalAdmins: 3,
  totalActiveSessions: 12,
  totalActiveClockEvents: 12,
  totalLateArrivals: 1,
  lockedBranchCount: 0,
  sessionTrend: [
    { dayLabel: "Mon", count: 18 },
    { dayLabel: "Tue", count: 22 },
    { dayLabel: "Wed", count: 20 },
    { dayLabel: "Thu", count: 24 },
    { dayLabel: "Fri", count: 19 },
    { dayLabel: "Sat", count: 21 },
    { dayLabel: "Sun", count: 23 },
  ] as SessionTrend[],
  clockOutStats: {
    manual: 20,
    automatic: 12,
    server: 8,
    adminForce: 4,
  } as ClockOutStats,
  recentSessions: [
      {
          id: "sess-1",
          workDate: "2026-07-19",
          sessionUser: "Ama Owusu",
          arrivalStatus: "ON_TIME",
          status: "ACTIVE",
          totalDistanceCovered: 0,
          clockEvents: [
              { eventType: "CLOCK_IN", timestamp: "2026-07-19T08:02:00", latitude: 5.6037, longitude: -0.187, verified: true },
          ],
      },
      {
          id: "sess-2",
          workDate: "2026-07-19",
          sessionUser: "Kofi Mensah",
          arrivalStatus: "EARLY",
          status: "ACTIVE",
          totalDistanceCovered: 0,
          clockEvents: [
              { eventType: "CLOCK_IN", timestamp: "2026-07-19T07:45:00", latitude: 5.604, longitude: -0.1865, verified: true },
          ],
      },
      {
          id: "sess-3",
          workDate: "2026-07-19",
          sessionUser: "Abena Asante",
          arrivalStatus: "LATE",
          status: "ACTIVE",
          totalDistanceCovered: 0,
          clockEvents: [
              { eventType: "CLOCK_IN", timestamp: "2026-07-19T09:12:00", latitude: 5.6035, longitude: -0.1872, verified: true },
          ],
      },
      {
          id: "sess-4",
          workDate: "2026-07-18",
          sessionUser: "Yaw Addo",
          arrivalStatus: "ON_TIME",
          status: "COMPLETED",
          totalDistanceCovered: 0,
          clockEvents: [
              { eventType: "CLOCK_IN", timestamp: "2026-07-18T07:58:00", latitude: 5.6038, longitude: -0.1868, verified: true },
              { eventType: "CLOCK_OUT", timestamp: "2026-07-18T16:15:00", latitude: 5.6039, longitude: -0.1869, verified: true },
          ],
      },
      {
          id: "sess-5",
          workDate: "2026-07-18",
          sessionUser: "Efua Boateng",
          arrivalStatus: "ON_TIME",
          status: "COMPLETED",
          totalDistanceCovered: 0,
          clockEvents: [
              { eventType: "CLOCK_IN", timestamp: "2026-07-18T08:00:00", latitude: 5.6036, longitude: -0.1871, verified: true },
              { eventType: "CLOCK_OUT", timestamp: "2026-07-18T16:30:00", latitude: 5.6037, longitude: -0.187, verified: true },
          ],
      },
  ] as unknown as SessionResponse[],
};