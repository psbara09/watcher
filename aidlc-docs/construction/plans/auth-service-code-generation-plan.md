# Code Generation Plan — Unit 2: Auth Service + Auth Frontend

## Unit Context
- **Unit**: Auth Service + Auth Frontend
- **Priority**: 2
- **Dependencies**: Unit 1 (Shared Package)
- **Stories**: US-1 (Store Staff Login), US-2 (Analyst Login), US-3 (Logout)
- **Workspace Root**: d:\Stuffs\repos\watcher

---

## Generation Steps

### Step 1: Auth Service — Core Setup
- [ ] Create `services/auth-service/src/index.ts` (Express app, middleware, routes, Swagger)
- [ ] Create `services/auth-service/src/config.ts` (environment config)

### Step 2: Auth Service — Database Layer
- [ ] Create `services/auth-service/src/db.ts` (PostgreSQL connection pool)

### Step 3: Auth Service — Service Layer
- [ ] Create `services/auth-service/src/services/auth.service.ts` (authenticate, generateToken, validateToken, resolveTenant)

### Step 4: Auth Service — Controllers
- [ ] Create `services/auth-service/src/controllers/auth.controller.ts` (login, verify, me, logout)

### Step 5: Auth Service — Routes
- [ ] Create `services/auth-service/src/routes/auth.routes.ts` (route definitions with Swagger docs)

### Step 6: Auth Service — Middleware
- [ ] Create `services/auth-service/src/middleware/error-handler.ts` (global error handler)

### Step 7: Frontend — Core Setup
- [ ] Create `packages/frontend/src/main.tsx` (React entry point with Redux Provider, Router)
- [ ] Create `packages/frontend/src/App.tsx` (route definitions)

### Step 8: Frontend — Redux Store
- [ ] Create `packages/frontend/src/store/index.ts` (Redux store configuration)
- [ ] Create `packages/frontend/src/store/authSlice.ts` (auth state, login/logout thunks)

### Step 9: Frontend — API Client
- [ ] Create `packages/frontend/src/api/client.ts` (axios instance with token interceptor)
- [ ] Create `packages/frontend/src/api/auth.ts` (auth API functions)

### Step 10: Frontend — Auth Pages & Components
- [ ] Create `packages/frontend/src/pages/LoginPage.tsx` (login form)
- [ ] Create `packages/frontend/src/components/ProtectedRoute.tsx` (auth guard)
- [ ] Create `packages/frontend/src/components/AppShell.tsx` (layout with nav)
- [ ] Create `packages/frontend/src/pages/PlaceholderPage.tsx` (Under Construction)

### Step 11: Frontend — Styles
- [ ] Create `packages/frontend/src/index.css` (base styles)

### Step 12: Documentation
- [ ] Create `aidlc-docs/construction/auth-service/code/code-summary.md`
