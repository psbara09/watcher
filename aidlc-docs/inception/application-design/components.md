# Components — Watcher Platform

## Component Overview

The Watcher platform consists of 4 main service components plus 1 shared package:

| Component | Type | Port | Responsibility |
|-----------|------|------|----------------|
| Auth Service | Backend Microservice | 3001 | Authentication, tenant resolution, token management |
| Incident Service | Backend Microservice | 3002 | Incident CRUD, evidence management, lifecycle states |
| Verification Service | Backend Microservice | 3003 | AI validation simulation, analyst queue, approve/reject |
| Frontend | React SPA | 3000 | User interface for all personas |
| Shared Package | npm Library | N/A | Common types, interfaces, constants |

---

## Component 1: Authentication & Tenant Service

**Package**: `services/auth-service`
**Port**: 3001
**Database Schema**: `auth` (shared across tenants — stores user/tenant mappings)

### Responsibilities
- Authenticate users with username/password credentials
- Generate and manage JWT tokens with tenant context and role
- Expose token verification endpoint for other services
- Manage user-tenant associations
- Provide tenant resolution (which store does this user belong to?)
- Seed and manage pre-configured user accounts

### Boundaries
- Does NOT manage incidents or verification data
- Does NOT handle file uploads
- Does NOT make decisions about incident workflow
- Owns: users table, tenants table, roles table

### Key Interfaces
- `POST /api/auth/login` — authenticate and return JWT
- `POST /api/auth/verify` — validate JWT token (used by other services)
- `POST /api/auth/logout` — invalidate session (client-side token removal)
- `GET /api/auth/me` — get current user profile and tenant context

---

## Component 2: Incident Management Service

**Package**: `services/incident-service`
**Port**: 3002
**Database Schema**: Per-tenant schema (e.g., `store1`, `store2`) for incident data

### Responsibilities
- Create, read, update incidents with structured metadata
- Manage evidence file uploads to MinIO
- Enforce tenant isolation (users only see their own store's incidents)
- Manage incident lifecycle states (Draft → Submitted → Under Review → Approved → Rejected)
- Provide evidence access via presigned URLs for other services
- Provide cross-tenant incident access for analysts (filtered by status)

### Boundaries
- Does NOT perform verification/validation logic
- Does NOT manage users or authentication
- Does NOT make approve/reject decisions
- Owns: incidents table, evidence table, incident_status_history table (per-tenant schema)

### Key Interfaces
- `POST /api/incidents` — create new incident
- `GET /api/incidents` — list incidents (tenant-scoped for staff, cross-tenant for analysts)
- `GET /api/incidents/:id` — get incident details
- `PATCH /api/incidents/:id/status` — update incident status
- `POST /api/incidents/:id/evidence` — upload evidence file
- `GET /api/incidents/:id/evidence/:evidenceId` — get evidence (presigned URL)

---

## Component 3: Verification Workflow Service

**Package**: `services/verification-service`
**Port**: 3003
**Database Schema**: `verification` (shared — stores verification records across all tenants)

### Responsibilities
- Receive submitted incidents and trigger AI validation simulation
- Execute pass-through AI validation with mock confidence scores
- Manage the analyst review queue (first-come-first-served)
- Process approve/reject decisions from analysts
- Update incident status in Incident Service after decisions
- Track verification history (who reviewed, when, decision, notes)

### Boundaries
- Does NOT store incident data (references Incident Service)
- Does NOT manage evidence files directly (requests via Incident Service)
- Does NOT handle authentication (calls Auth Service /verify)
- Owns: verification_records table, verification_history table

### Key Interfaces
- `POST /api/verification/submit` — receive incident for verification
- `GET /api/verification/queue` — get analyst review queue
- `GET /api/verification/:id` — get verification details for an incident
- `POST /api/verification/:id/review` — submit analyst decision (approve/reject with notes)

---

## Component 4: Frontend Application

**Package**: `packages/frontend`
**Port**: 3000
**Type**: React Single Page Application

### Responsibilities
- Render login page and handle authentication flow
- Display tenant-specific dashboard after login
- Provide incident submission form with evidence upload
- Display incident list with status indicators
- Render verification queue for analysts
- Provide incident review interface for analysts
- Show "Under Construction" placeholders for future features
- Manage client-side routing based on user role

### Boundaries
- Does NOT contain business logic (delegates to backend services)
- Does NOT directly access database or MinIO
- Does NOT perform server-side rendering
- Communicates directly with each backend service on its respective port

### Key Routes
- `/login` — login page
- `/dashboard` — tenant-specific dashboard (Store Staff)
- `/incidents/new` — incident submission form
- `/incidents` — incident list view
- `/incidents/:id` — incident detail view
- `/verification` — verification queue (Analyst)
- `/verification/:id` — incident review view (Analyst)
- `/alerts` — placeholder (Under Construction)
- `/reports` — placeholder (Under Construction)
- `/detection` — placeholder (Under Construction)
- `/admin` — placeholder (Under Construction)

---

## Component 5: Shared Package

**Package**: `packages/shared`
**Type**: npm library (internal)

### Responsibilities
- Define common TypeScript interfaces and types (User, Incident, Tenant, Evidence, VerificationRecord)
- Define shared constants (incident statuses, roles, incident types)
- Define shared validation schemas (if applicable)
- Define API response/request type contracts

### Boundaries
- Does NOT contain runtime logic or business rules
- Does NOT have its own server or database connection
- Pure type definitions and constants only
