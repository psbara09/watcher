# Units of Work — Watcher Platform

## Implementation Strategy
- **Approach**: All functional designs first, then code generation per unit
- **Frontend**: Built incrementally alongside each backend service
- **Shared Package**: Created first to define contracts upfront

---

## Unit 1: Shared Package & Project Scaffold

**Priority**: 1 (First)
**Type**: Library + Infrastructure Setup

### Scope
- Monorepo scaffold (npm workspaces, root package.json, tsconfig)
- Shared TypeScript types and interfaces
- Shared constants (roles, incident statuses, incident types)
- API request/response type contracts
- Docker Compose base configuration (PostgreSQL, MinIO)
- Database initialization scripts (schema creation)

### Deliverables When Complete
- Working monorepo structure with npm workspaces
- `packages/shared` package with all type definitions
- Docker Compose file with PostgreSQL and MinIO running
- Database schemas created (auth, store1, store2, verification)
- Base TypeScript configuration shared across packages

---

## Unit 2: Auth Service + Auth Frontend

**Priority**: 2
**Type**: Backend Microservice + Frontend Pages

### Scope — Backend
- Auth Service (Express/Node.js on port 3001)
- User login endpoint (POST /api/auth/login)
- Token verification endpoint (POST /api/auth/verify)
- Profile endpoint (GET /api/auth/me)
- Logout endpoint (POST /api/auth/logout)
- Health check endpoint (GET /health)
- JWT generation with tenant context and role claims
- Password validation (simple hash comparison for MVP)
- Seed data: 3 pre-configured users (store1, store2, facewatch1)
- OpenAPI/Swagger documentation for auth endpoints

### Scope — Frontend
- Login page (username/password form)
- Auth state management (Redux Toolkit authSlice, tenantSlice)
- Protected route wrapper (redirect to login if unauthenticated)
- Role-based route guard (staff vs analyst routing)
- Post-login redirection to tenant-specific dashboard
- Logout functionality
- App shell/layout with navigation (including placeholder tabs)
- API client setup for auth service

### Deliverables When Complete
- Users can log in with store1/store1, store2/store2, facewatch1/facewatch1
- JWT tokens generated with correct tenant/role claims
- Token verification endpoint working for other services
- Frontend login page functional
- Role-based redirection working (staff → dashboard, analyst → verification queue)
- Logout clears token and redirects to login

---

## Unit 3: Incident Service + Incident Frontend

**Priority**: 3
**Type**: Backend Microservice + Frontend Pages

### Scope — Backend
- Incident Service (Express/Node.js on port 3002)
- Incident CRUD endpoints (create, list, get, update status)
- Evidence upload endpoint (multipart → MinIO)
- Evidence access endpoint (presigned URL generation)
- Tenant-scoped queries (schema routing based on JWT tenant)
- Auth middleware (calls Auth Service /verify on every request)
- Incident lifecycle state management
- Cross-tenant incident listing for analysts
- OpenAPI/Swagger documentation for incident endpoints

### Scope — Frontend
- Tenant-aware dashboard page (incident summary/overview)
- Incident submission form (metadata fields + evidence upload)
- Incident list view (with status indicators, tenant-scoped)
- Incident detail view (metadata + evidence display)
- Evidence upload component (file picker, progress, preview)
- API client setup for incident service

### Deliverables When Complete
- Store staff can create incidents with metadata
- Evidence files upload to MinIO successfully
- Incidents stored in tenant-specific schema
- Tenant isolation enforced (store1 cannot see store2 data)
- Analysts can view incidents from all stores
- Incident status displayed correctly
- Evidence viewable via presigned URLs

---

## Unit 4: Verification Service + Verification Frontend

**Priority**: 4
**Type**: Backend Microservice + Frontend Pages

### Scope — Backend
- Verification Service (Express/Node.js on port 3003)
- Submit for verification endpoint (receives incident, triggers AI sim)
- AI validation simulation (pass-through with mock confidence scores)
- Analyst queue endpoint (FCFS ordering)
- Review endpoint (approve/reject with notes)
- Status synchronisation with Incident Service
- Verification history tracking
- Auth middleware (calls Auth Service /verify)
- OpenAPI/Swagger documentation for verification endpoints

### Scope — Frontend
- Verification queue page (analyst view, all stores' incidents)
- Incident review page (detail view + evidence + approve/reject buttons)
- Review notes input
- Queue status indicators
- "Under Construction" placeholder pages (Alerts, Reports, Detection, Admin)
- API client setup for verification service

### Deliverables When Complete
- Submitted incidents trigger AI validation (mock pass-through)
- Incidents appear in analyst queue after AI validation
- Analysts can approve/reject with notes
- Status updates propagate to Incident Service
- Verification history recorded
- Full end-to-end workflow functional
- Placeholder tabs visible with "Under Construction" message

---

## Code Organization (Monorepo Structure)

```
watcher/
+-- package.json                    # Root workspace config
+-- tsconfig.base.json              # Shared TypeScript config
+-- docker-compose.yml              # All services + infra
+-- .env.example                    # Environment variables template
+-- packages/
|   +-- shared/                     # Unit 1: Shared types & constants
|   |   +-- package.json
|   |   +-- tsconfig.json
|   |   +-- src/
|   |       +-- types/              # TypeScript interfaces
|   |       +-- constants/          # Enums, status values, roles
|   |       +-- index.ts            # Package exports
|   +-- frontend/                   # Units 2-4: React SPA
|       +-- package.json
|       +-- tsconfig.json
|       +-- src/
|           +-- pages/              # Route pages
|           +-- components/         # Reusable UI components
|           +-- store/              # Redux slices
|           +-- contexts/           # React contexts
|           +-- api/                # API client functions
|           +-- App.tsx
|           +-- main.tsx
+-- services/
|   +-- auth-service/               # Unit 2: Auth backend
|   |   +-- package.json
|   |   +-- tsconfig.json
|   |   +-- Dockerfile
|   |   +-- src/
|   |       +-- controllers/
|   |       +-- services/
|   |       +-- middleware/
|   |       +-- routes/
|   |       +-- index.ts
|   +-- incident-service/           # Unit 3: Incident backend
|   |   +-- package.json
|   |   +-- tsconfig.json
|   |   +-- Dockerfile
|   |   +-- src/
|   |       +-- controllers/
|   |       +-- services/
|   |       +-- middleware/
|   |       +-- routes/
|   |       +-- index.ts
|   +-- verification-service/       # Unit 4: Verification backend
|       +-- package.json
|       +-- tsconfig.json
|       +-- Dockerfile
|       +-- src/
|           +-- controllers/
|           +-- services/
|           +-- middleware/
|           +-- routes/
|           +-- index.ts
+-- database/
|   +-- init/                       # Schema creation scripts
|   +-- seed/                       # Seed data scripts
+-- docs/
    +-- api/                        # Generated OpenAPI specs
```

---

## Construction Phase Execution Order

Given the "all designs first, then code" strategy:

### Phase A: Functional Design (all units)
1. Functional Design — Unit 1 (Shared Package)
2. Functional Design — Unit 2 (Auth Service + Auth Frontend)
3. Functional Design — Unit 3 (Incident Service + Incident Frontend)
4. Functional Design — Unit 4 (Verification Service + Verification Frontend)

### Phase B: Code Generation (per unit, sequential)
5. Code Generation — Unit 1 (Shared Package + Project Scaffold)
6. Code Generation — Unit 2 (Auth Service + Auth Frontend)
7. Code Generation — Unit 3 (Incident Service + Incident Frontend)
8. Code Generation — Unit 4 (Verification Service + Verification Frontend)

### Phase C: Build and Test
9. Build and Test — Docker Compose, seed data, integration testing
