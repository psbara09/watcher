# Application Design Plan — Watcher Platform

## Plan Overview
This plan defines the approach for identifying components, their methods, service orchestration, and dependencies for the Watcher multi-tenant platform.

---

## Design Questions

### Question 1: API Gateway / Routing Pattern
How should the frontend communicate with the multiple backend services?

A) Single API Gateway service that routes requests to appropriate microservices (all requests go through one entry point)
B) Direct communication — frontend calls each microservice directly on different ports
C) BFF (Backend-for-Frontend) pattern — a dedicated aggregation layer between frontend and services
X) Other (please describe after [Answer]: tag below)

[Answer]: b

### Question 2: Shared Code Strategy
How should shared code (types, utilities, validation) be handled across services?

A) Shared npm package within the monorepo (e.g., packages/shared) imported by all services
B) Code duplication — each service maintains its own copies (simpler, more independent)
C) Shared types package only — common TypeScript interfaces/types shared, but logic duplicated
X) Other (please describe after [Answer]: tag below)

[Answer]: a

### Question 3: Database Access Pattern
How should services access the PostgreSQL database?

A) Each service has its own database connection and manages its own schema tables (true service isolation)
B) Shared database connection pool with service-specific table prefixes
C) Single shared data access layer used by all services
X) Other (please describe after [Answer]: tag below)

[Answer]: b

### Question 4: Authentication Middleware Pattern
How should non-auth services validate JWT tokens?

A) Each service includes its own JWT validation middleware (shared secret/key configured per service)
B) Auth service exposes a /verify endpoint that other services call to validate tokens
C) Shared middleware package imported by all services (validates locally with shared secret)
X) Other (please describe after [Answer]: tag below)

[Answer]: b

### Question 5: Evidence File Access
How should the Verification Service access evidence files uploaded by the Incident Service?

A) Verification Service accesses MinIO directly using the same bucket/credentials (shared storage)
B) Verification Service requests evidence via the Incident Service API (presigned URLs or proxy)
C) Evidence references (URLs) stored in incident metadata — Verification Service fetches directly from MinIO using stored paths
X) Other (please describe after [Answer]: tag below)

[Answer]: b

---

## Execution Plan (Post-Approval)

### Step 1: Define Components
- [x] Define Authentication & Tenant Service component (boundaries, responsibilities)
- [x] Define Incident Management Service component (boundaries, responsibilities)
- [x] Define Verification Workflow Service component (boundaries, responsibilities)
- [x] Define Frontend Application component (boundaries, responsibilities)
- [x] Define shared/common packages (if applicable)
- [x] Save to `aidlc-docs/inception/application-design/components.md`

### Step 2: Define Component Methods
- [x] Define Auth Service method signatures (login, verify, token management)
- [x] Define Incident Service method signatures (CRUD, evidence, status)
- [x] Define Verification Service method signatures (validate, queue, review)
- [x] Define Frontend routes and key component interfaces
- [x] Save to `aidlc-docs/inception/application-design/component-methods.md`

### Step 3: Define Services & Orchestration
- [x] Define service communication patterns (REST endpoints, request/response flows)
- [x] Define cross-service workflows (incident submission → verification pipeline)
- [x] Define tenant context propagation across services
- [x] Save to `aidlc-docs/inception/application-design/services.md`

### Step 4: Define Component Dependencies
- [x] Map service-to-service dependencies
- [x] Map service-to-infrastructure dependencies (PostgreSQL, MinIO)
- [x] Define data flow for key workflows
- [x] Save to `aidlc-docs/inception/application-design/component-dependency.md`

### Step 5: Consolidate Design
- [x] Create consolidated application-design.md
- [x] Validate design completeness and consistency
- [x] Save to `aidlc-docs/inception/application-design/application-design.md`
