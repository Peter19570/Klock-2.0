# Project Structure

```
client/
├── frontend
│   ├── app
│   │   ├── (auth)
│   │   │   ├── forgot-password
│   │   │   │   └── page.tsx
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   ├── register
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password
│   │   │   │   └── page.tsx
│   │   │   ├── verify-email
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)
│   │   │   ├── attendance
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard
│   │   │   │   └── page.tsx
│   │   │   ├── organization
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api
│   │   │   └── auth
│   │   │       ├── login
│   │   │       │   └── route.ts
│   │   │       ├── logout
│   │   │       │   └── route.ts
│   │   │       ├── refresh
│   │   │       │   └── route.ts
│   │   │       └── register
│   │   │           └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── auth
│   │   │   └── role-gate.tsx
│   │   ├── brand
│   │   │   └── klock-logo.tsx
│   │   ├── layout
│   │   │   ├── navbar.tsx
│   │   │   └── profile-dropdown.tsx
│   │   ├── providers
│   │   │   └── auth-provider.tsx
│   │   ├── theme
│   │   │   ├── force-theme.tsx
│   │   │   └── theme-toggle.tsx
│   │   └── ui
│   │       ├── button.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── textarea.tsx
│   ├── features
│   │   ├── attendance
│   │   │   └── components
│   │   │       ├── clock-button.tsx
│   │   │       ├── clock-card.tsx
│   │   │       ├── greeting-hero.tsx
│   │   │       └── location-map.tsx
│   │   └── auth
│   │       └── components
│   │           ├── forgot-password-form.tsx
│   │           ├── login-form.tsx
│   │           ├── register-form.tsx
│   │           ├── reset-password-form.tsx
│   │           └── verify-email-status.tsx
│   ├── lib
│   │   ├── api
│   │   │   ├── generated
│   │   │   │   └── schema.ts
│   │   │   ├── backend-client.ts
│   │   │   └── config.ts
│   │   ├── auth
│   │   │   └── rbac.ts
│   │   ├── theme
│   │   │   └── theme-provider.tsx
│   │   └── utils.ts
│   ├── public
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── store
│   │   └── auth-store.ts
│   ├── components.json
│   ├── eslint.config.mjs
│   ├── middleware.ts
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   └── tsconfig.json
├── CURRENT-STRUCTURE.md
├── HANDOFF.md
└── TARGET-STRUCTURE.md
```
