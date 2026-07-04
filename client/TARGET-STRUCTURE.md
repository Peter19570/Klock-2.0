## 1. Full tree

```
klock-frontend/
├── src/
│   ├── app/                                # ROUTES ONLY. No business logic lives here.
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                  # centered auth shell, no sidebar
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                  # authenticated shell: sidebar + topbar, role-aware nav
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                # server component: role check -> <SuperAdminDashboard/> | <AdminDashboard/>
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx                # USER-facing clock in/out (your existing LocationStatusMap/ClockButtons live here)
│   │   │   ├── sessions/
│   │   │   │   └── page.tsx                # SessionsTable + filters + export (admin/super-admin)
│   │   │   ├── branches/
│   │   │   │   ├── page.tsx                # list
│   │   │   │   └── [branchId]/page.tsx     # detail tabs: staff, active now, admins
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [userId]/page.tsx
│   │   │   ├── organization/
│   │   │   │   └── page.tsx                # org settings, SUPER_ADMIN only
│   │   │   ├── audits/
│   │   │   │   └── page.tsx                # audit log viewer
│   │   │   └── settings/
│   │   │       ├── profile/page.tsx
│   │   │       ├── security/page.tsx       # change password, reset device id
│   │   │       └── account/page.tsx        # deletion request flow
│   │   │
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── login/route.ts          # proxies /auth/login, sets httpOnly cookies from TokenResponse
│   │   │       ├── refresh/route.ts        # proxies /auth/refresh, rotates cookies
│   │   │       └── logout/route.ts         # clears cookies + calls backend /auth/logout
│   │   │
│   │   ├── layout.tsx                      # root layout: QueryClientProvider, ThemeProvider
│   │   ├── globals.css
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── features/                           # THE MEAT. One folder per domain.
│   │   ├── auth/
│   │   │   ├── components/                 # LoginForm, RegisterForm, ForgotPasswordForm
│   │   │   ├── hooks/                      # useLogin, useRegister, useCurrentUser
│   │   │   ├── api.ts                      # thin wrappers around lib/api/endpoints
│   │   │   └── schemas.ts                  # zod: LoginSchema, RegisterSchema (mirrors RegisterRequest)
│   │   │
│   │   ├── attendance/
│   │   │   ├── components/                 # LocationStatusMap, ClockButtons, StatusCard
│   │   │   ├── hooks/                      # useGeofenceStatus, useAttendanceSocket, useClockIn/Out
│   │   │   └── api.ts
│   │   │
│   │   ├── sessions/
│   │   │   ├── components/                 # SessionsTable, SessionFilters, ExportButton
│   │   │   ├── hooks/                      # useSessions (paginated query), useExportSessions
│   │   │   └── api.ts
│   │   │
│   │   ├── users/
│   │   │   ├── components/                 # UserTable, UserProfileModal, CreateUserForm
│   │   │   ├── hooks/
│   │   │   ├── api.ts
│   │   │   └── schemas.ts                  # role-dependent validation (SUPER_ADMIN/ADMIN/USER)
│   │   │
│   │   ├── branches/
│   │   │   ├── components/                 # BranchTable, BranchDetailTabs, BranchForm
│   │   │   ├── hooks/
│   │   │   └── api.ts
│   │   │
│   │   ├── organization/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── api.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/                 # SuperAdminDashboard, AdminDashboard, StatCard, SessionTrendChart
│   │   │   ├── hooks/                      # useSuperAdminDashboard, useAdminDashboard
│   │   │   └── api.ts
│   │   │
│   │   └── audits/
│   │       ├── components/                 # AuditTable, AuditFilters
│   │       ├── hooks/
│   │       └── api.ts
│   │
│   ├── components/                         # Generic, feature-agnostic. If it imports from `features/`, it's in the wrong place.
│   │   ├── ui/                              # shadcn/ui primitives (button, input, dialog, table...)
│   │   ├── layout/                          # Sidebar, Topbar, Shell, PageHeader
│   │   └── common/                          # DataTable, EmptyState, ConfirmDialog, RoleGate, Pagination
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── generated/
│   │   │   │   └── schema.ts               # your uploaded openapi-typescript output, regenerated via script
│   │   │   ├── client.ts                   # fetch/axios instance, base URL, credentials: 'include'
│   │   │   ├── endpoints.ts                # one typed function per operationId (login, clockIn, getSessions...)
│   │   │   └── interceptors.ts             # 401 -> silent refresh -> retry, else redirect /login
│   │   ├── auth/
│   │   │   ├── session.ts                  # server-side cookie read helpers (for server components/middleware)
│   │   │   └── rbac.ts                     # hasRole(), canAccess() helpers, single source of truth for role gates
│   │   ├── websocket/
│   │   │   └── stomp-client.ts             # SockJS/STOMP singleton, connect/disconnect lifecycle
│   │   ├── validations/
│   │   │   └── enums.ts                    # UserRole, ArrivalStatus, SessionStatus, ClockOutType, AuditAction — derived from generated schema, not re-typed
│   │   └── utils.ts                        # cn(), formatDate, formatDistance
│   │
│   ├── hooks/                               # truly global: useDebounce, useMediaQuery, useMounted
│   ├── stores/                              # zustand: authStore (current user snapshot), uiStore (sidebar collapsed etc.)
│   ├── types/
│   │   └── index.ts                        # domain types composed from lib/api/generated/schema.ts
│   ├── config/
│   │   ├── env.ts                          # zod-validated process.env
│   │   ├── nav.ts                          # role-based sidebar nav config
│   │   └── query-client.ts                 # React Query defaults (staleTime, retry policy)
│   └── middleware.ts                        # cookie-presence check + role-based redirect
│
├── public/
├── .env.local
├── .env.example
├── next.config.ts
├── tsconfig.json
├── components.json                          # shadcn config
├── package.json
└── README.md
```
