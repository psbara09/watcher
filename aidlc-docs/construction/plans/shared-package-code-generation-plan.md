# Code Generation Plan — Unit 1: Shared Package & Project Scaffold

## Unit Context
- **Unit**: Shared Package & Project Scaffold
- **Priority**: 1 (First)
- **Dependencies**: None (foundation unit)
- **Stories**: No direct user stories (supports all)
- **Workspace Root**: d:\Stuffs\repos\watcher

## Code Location
- **Application Code**: Workspace root (monorepo structure)
- **Documentation**: aidlc-docs/construction/shared-package/code/

---

## Generation Steps

### Step 1: Root Project Configuration
- [x] Create root `package.json` with npm workspaces configuration
- [x] Create root `tsconfig.base.json` with shared TypeScript settings
- [x] Create `.env.example` with all environment variables
- [x] Create `.gitignore` for Node.js monorepo

### Step 2: Shared Package — Structure & Configuration
- [x] Create `packages/shared/package.json`
- [x] Create `packages/shared/tsconfig.json` (extends base)
- [x] Create `packages/shared/src/index.ts` (barrel exports)

### Step 3: Shared Package — Type Definitions
- [x] Create `packages/shared/src/types/user.ts` (User, UserRole)
- [x] Create `packages/shared/src/types/tenant.ts` (Tenant)
- [x] Create `packages/shared/src/types/incident.ts` (Incident, IncidentStatus, IncidentType, Evidence)
- [x] Create `packages/shared/src/types/verification.ts` (VerificationRecord, VerificationStatus, AIValidationResult, AnalystReview, ReviewDecision)
- [x] Create `packages/shared/src/types/api.ts` (all API request/response contracts)
- [x] Create `packages/shared/src/types/index.ts` (type barrel exports)

### Step 4: Shared Package — Constants
- [x] Create `packages/shared/src/constants/index.ts` (all shared constants: file limits, JWT expiry, allowed types, status arrays)

### Step 5: Docker Compose & Infrastructure
- [x] Create `docker-compose.yml` (PostgreSQL, MinIO, all service placeholders)
- [x] Create `database/init/01-create-schemas.sql` (create auth, store1, store2, verification schemas)
- [x] Create `database/init/02-create-tables.sql` (all tables across schemas)

### Step 6: Database Seed Scripts
- [x] Create `database/seed/01-seed-tenants.sql` (store1, store2 tenants)
- [x] Create `database/seed/02-seed-users.sql` (store1, store2, facewatch1 users with bcrypt hashes)
- [x] Create `database/seed/03-seed-incidents.sql` (demo incidents for both stores)
- [x] Create `database/seed/04-seed-evidence.sql` (evidence references for demo incidents)
- [x] Create `database/seed/05-seed-verification.sql` (verification records for demo incidents)

### Step 7: Service Scaffolds (Minimal)
- [x] Create `services/auth-service/package.json`
- [x] Create `services/auth-service/tsconfig.json`
- [x] Create `services/auth-service/Dockerfile`
- [x] Create `services/incident-service/package.json`
- [x] Create `services/incident-service/tsconfig.json`
- [x] Create `services/incident-service/Dockerfile`
- [x] Create `services/verification-service/package.json`
- [x] Create `services/verification-service/tsconfig.json`
- [x] Create `services/verification-service/Dockerfile`

### Step 8: Frontend Scaffold (Minimal)
- [x] Create `packages/frontend/package.json`
- [x] Create `packages/frontend/tsconfig.json`
- [x] Create `packages/frontend/index.html`
- [x] Create `packages/frontend/vite.config.ts`

### Step 9: Documentation
- [x] Update `README.md` with project overview, setup instructions, and architecture summary
- [x] Create `aidlc-docs/construction/shared-package/code/code-summary.md`

---

## Summary
- **Total Steps**: 9
- **Files to Create**: ~35+
- **Scope**: Monorepo scaffold, shared types/constants, Docker Compose, database schemas/seeds, service scaffolds
