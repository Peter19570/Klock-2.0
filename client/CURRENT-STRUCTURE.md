# Project Structure

```
frontend/
├── app
│   ├── (auth)
│   │   ├── confirm-email
│   │   │   └── page.tsx
│   │   ├── forgot-password
│   │   │   └── page.tsx
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── register
│   │   │   └── page.tsx
│   │   ├── reset-password
│   │   │   └── page.tsx
│   │   ├── verify-email
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)
│   │   ├── attendance
│   │   │   └── page.tsx
│   │   ├── audits
│   │   │   └── page.tsx
│   │   ├── branches
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   └── page.tsx
│   │   ├── live-map
│   │   │   └── page.tsx
│   │   ├── organization
│   │   │   └── page.tsx
│   │   ├── sessions
│   │   │   └── page.tsx
│   │   ├── users
│   │   │   └── page.tsx
│   │   ├── error.tsx
│   │   └── layout.tsx
│   ├── api
│   │   └── auth
│   │       ├── login
│   │       │   └── route.ts
│   │       ├── logout
│   │       │   └── route.ts
│   │       ├── refresh
│   │       │   └── route.ts
│   │       └── register
│   │           └── route.ts
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components
│   ├── auth
│   │   └── role-gate.tsx
│   ├── brand
│   │   └── klock-logo.tsx
│   ├── common
│   │   ├── confirm-dialog.tsx
│   │   ├── date-picker.tsx
│   │   ├── enum-select.tsx
│   │   ├── pagination.tsx
│   │   ├── time-picker.tsx
│   │   └── toast.tsx
│   ├── layout
│   │   ├── navbar.tsx
│   │   ├── panel-sidebar.tsx
│   │   └── profile-dropdown.tsx
│   ├── providers
│   │   └── auth-provider.tsx
│   ├── theme
│   │   ├── force-theme.tsx
│   │   └── theme-toggle.tsx
│   └── ui
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── chart.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── config
│   └── nav.ts
├── features
│   ├── attendance
│   │   ├── components
│   │   │   ├── clock-button.tsx
│   │   │   ├── clock-card.tsx
│   │   │   ├── greeting-hero.tsx
│   │   │   ├── location-map.tsx
│   │   │   ├── marquee-text.tsx
│   │   │   └── status-pill.tsx
│   │   ├── hooks
│   │   │   ├── use-attendance-session.ts
│   │   │   ├── use-branch-socket.ts
│   │   │   └── use-geofence.ts
│   │   └── api.ts
│   ├── audits
│   │   ├── components
│   │   │   ├── audit-metadata-subtable.tsx
│   │   │   └── audit-table.tsx
│   │   ├── api.ts
│   │   └── constants.ts
│   ├── auth
│   │   ├── components
│   │   │   ├── confirm-email-status.tsx
│   │   │   ├── force-password-change-dialog.tsx
│   │   │   ├── forgot-password-form.tsx
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── reset-password-form.tsx
│   │   │   └── verify-email-status.tsx
│   │   └── api.ts
│   ├── branches
│   │   ├── components
│   │   │   ├── admin-branch-view.tsx
│   │   │   ├── branch-detail-modal.tsx
│   │   │   ├── branch-form-dialog.tsx
│   │   │   ├── branch-table.tsx
│   │   │   └── super-admin-branches-view.tsx
│   │   └── api.ts
│   ├── dashboard
│   │   ├── components
│   │   │   ├── clock-out-pie-chart.tsx
│   │   │   ├── dashboard-stats.tsx
│   │   │   ├── session-trend-chart.tsx
│   │   │   └── stat-card.tsx
│   │   └── hooks
│   │       └── use-dashboard-data.ts
│   ├── live-map
│   │   ├── components
│   │   │   ├── branch-info-card.tsx
│   │   │   ├── branch-selector.tsx
│   │   │   ├── live-map.tsx
│   │   │   └── user-info-tooltip.tsx
│   │   ├── hooks
│   │   │   └── use-live-users-socket.ts
│   │   └── api.ts
│   ├── organization
│   │   ├── components
│   │   │   ├── admin-org-view.tsx
│   │   │   ├── delete-organization-dialog.tsx
│   │   │   ├── organization-detail-modal.tsx
│   │   │   └── organization-form-dialog.tsx
│   │   └── api.ts
│   ├── sessions
│   │   └── components
│   │       ├── clock-events-subtable.tsx
│   │       ├── export-sessions-dialog.tsx
│   │       ├── recent-sessions.tsx
│   │       └── session-table.tsx
│   └── users
│       ├── components
│       │   ├── branch-select.tsx
│       │   ├── profile-modal.tsx
│       │   ├── user-detail-modal.tsx
│       │   ├── user-form-dialog.tsx
│       │   └── user-table.tsx
│       └── api.ts
├── hooks
│   ├── use-auto-marquee.ts
│   ├── use-count-up.ts
│   ├── use-geolocation.ts
│   └── use-is-mobile.ts
├── lib
│   ├── api
│   │   ├── generated
│   │   │   └── schema.ts
│   │   ├── api-error.ts
│   │   ├── api.ts
│   │   ├── backend-client.ts
│   │   ├── config.ts
│   │   ├── dashboard.ts
│   │   └── sessions.ts
│   ├── auth
│   │   └── rbac.ts
│   ├── theme
│   │   └── theme-provider.tsx
│   ├── websocket
│   │   └── stomp-client.ts
│   ├── attendance-events.ts
│   ├── device-id.ts
│   └── utils.ts
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── store
│   ├── auth-store.ts
│   └── ui-store.ts
├── AGENTS.md
├── CLAUDE.md
├── components.json
├── eslint.config.mjs
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```
