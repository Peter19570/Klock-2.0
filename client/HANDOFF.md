# Klock Frontend — HANDOFF.md

Next.js (App Router) frontend for Klock, talking to the existing Spring Boot backend via the generated `schema.ts`. Monolithic Next app, feature-based internal structure. npm as package manager.

---

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

---

## 2. Why this shape (the decisions that matter)

**`app/` stays dumb on purpose.** Pages just compose feature components and handle route params/searchParams. If you ever find business logic in an `app/**/page.tsx`, that's a smell — it belongs in `features/`.

**Route groups `(auth)` and `(dashboard)`** give you two completely separate layouts without affecting the URL. `(auth)` has no sidebar, `(dashboard)` has the shell + is where `middleware.ts` enforces auth.

**Token handling — this is the one to not wing.** Your backend returns `TokenResponse { access, refresh, expiresAt }` in the response body (see `AuthResponse`), not as a `Set-Cookie` header. If you store that in localStorage or a JS-readable cookie, any XSS on the app hands over both tokens. Instead:
- `app/api/auth/login/route.ts` calls your Spring backend server-side, receives the JSON, and sets `access`/`refresh` as `httpOnly`, `secure`, `sameSite=lax` cookies on the Next.js response.
- The browser never sees the raw tokens.
- `middleware.ts` just checks "does the access cookie exist" for route protection — cheap and doesn't need to decode the JWT.
- `lib/api/interceptors.ts` handles the 401 → hit `/api/auth/refresh` → retry original request loop.
- Server Components that need the current user call `lib/auth/session.ts`, which reads the cookie and calls `getCurrentUser` (`/api/v1/users/me`) server-side.

**Role-based dashboard is one route, not two.** `DashboardSuperAdminResponse` and `DashboardAdminResponse` are different shapes with different endpoints (`/dashboard/super` vs `/dashboard/admin`), but the *page* is the same URL. `dashboard/page.tsx` is a server component that checks the role from the session and renders `<SuperAdminDashboard/>` or `<AdminDashboard/>` from `features/dashboard/components`. Same pattern applies anywhere role changes the data shape, not the URL — e.g. branch detail tabs.

**React Query vs Zustand — don't blur this.** Anything that comes from the API (users, branches, sessions, dashboard stats, audits) is React Query's job: caching, refetch, pagination, invalidation on mutation. Zustand only holds client-only state that multiple components need without prop-drilling — current user snapshot for `RoleGate` checks, sidebar collapsed/expanded, active branch filter. If it's fetched from the backend, it doesn't belong in a zustand store.

**`lib/validations/enums.ts` derives from the generated schema instead of retyping.** You already have `"USER" | "ADMIN" | "SUPER_ADMIN"`, `"EARLY" | "ON_TIME" | "LATE"`, `"ACTIVE" | "COMPLETED"`, the full `AuditAction` union, etc. sitting in `schema.ts`. Pull them out with `components["schemas"]["X"]["fieldName"]` instead of hand-typing the same union twice — when the backend adds an enum value, you regenerate and TypeScript tells you everywhere that needs updating.

**WebSocket client is a singleton, not a hook that reconnects on every mount.** `useAttendanceSocket` (which you've already built) should consume a connection managed in `lib/websocket/stomp-client.ts`, not open its own SockJS connection per component instance.

**`components/` vs `features/*/components/` — the import direction is the rule.** `components/` can be imported by anything. `features/` should basically never import from another `features/*` folder — if `sessions` needs something from `attendance`, that's a sign the shared piece should move down into `components/common` or up into a `lib/` util.

---

## 3. Build order

Roughly the order that unblocks the most downstream work fastest:

1. `lib/api/generated/schema.ts` (drop your file in), `lib/api/client.ts`, `lib/api/endpoints.ts` — nothing else works without this.
2. `lib/validations/enums.ts`, `types/index.ts` — pull your reusable types out before you write forms against them.
3. `features/auth` + `app/(auth)/*` + the three `app/api/auth/*` route handlers + `middleware.ts` — auth end to end, including the cookie dance, before touching anything else.
4. `components/layout/*` (Shell, Sidebar, Topbar) + `app/(dashboard)/layout.tsx` — the authenticated shell.
5. `features/attendance` — you already have most of these components; just slot them into this structure.
6. `features/dashboard`, `features/sessions`, `features/branches`, `features/users`, `features/organization`, `features/audits` — in whatever order matches what you need to demo next.

## 4. package.json starter deps (npm)

```
npm install @tanstack/react-query zustand zod react-hook-form @hookform/resolvers
npm install @stomp/stompjs sockjs-client
npm install -D openapi-typescript
```
(shadcn/ui components get added individually via the shadcn CLI as you need them, not installed as one package.)
