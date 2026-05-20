# Application Design — Watcher Platform (Consolidated)

## Architecture Overview

The Watcher platform is a microservices-based, multi-tenant web application deployed locally via Docker Compose. The frontend communicates directly with each backend service on separate ports (no API gateway).

```
+-------------------------------------------------------------------+
|                        Docker Compose Network                       |
|                                                                     |
|  +-------------+   +-------------+   +-----------------+           |
|  | Auth Svc    |   | Incident Svc|   | Verification Svc|           |
|  | :3001       |   | :3002       |   | :3003           |           |
|  +------+------+   +------+------+   +--------+--------+           |
|         |                  |                   |                    |
|         +--------+---------+-------------------+                    |
|                  |                                                   |
|         +--------+--------+    +------------------+                 |
|         |  PostgreSQL     |    |  MinIO (S3)      |                 |
|         |  :5432          |    |  :9000           |                 |
|         +-----------------+    +------------------+                 |
+-------------------------------------------------------------------+
          |
  +-------+-------+
  |  Frontend     |
  |  :3000        |
  |  (Browser)    |
  +---------------+
```

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Service Communication | Direct REST (no gateway) | Simplest for MVP, each service on own port |
| Shared Code | Shared npm package (`packages/shared`) | Common types/interfaces, DRY principle |
| Database Access | Shared connection pool, service-specific table prefixes | Simpler ops for MVP while maintaining logical separation |
| Auth Middleware | Auth Service /verify endpoint | Centralised token validation, single source of truth |
| Evidence Access | Via Incident Service API (presigned URLs) | Proper encapsulation, Incident Service owns evidence |
| Multi-Tenancy | Separate PostgreSQL schema per tenant | Strong isolation, clear data boundaries |
| State Management | Redux Toolkit (auth/tenant) + React Context (local) | Balanced approach for MVP complexity |

---

## Components Summary

### Backend Services

| Service | Port | Schema | Key Responsibility |
|---------|------|--------|-------------------|
| Auth Service | 3001 | `auth` | Login, JWT, token verification, tenant resolution |
| Incident Service | 3002 | Per-tenant (`store1`, `store2`) | Incident CRUD, evidence upload/access, lifecycle |
| Verification Service | 3003 | `verification` | AI simulation, analyst queue, approve/reject |

### Frontend & Shared

| Package | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | React SPA — login, dashboard, forms, queue |
| Shared | N/A | TypeScript types, interfaces, constants |

---

## API Contract Summary

### Auth Service (3001)
| Endpoint | Method | Access | Purpose |
|----------|--------|--------|---------|
| `/api/auth/login` | POST | Public | Authenticate, return JWT |
| `/api/auth/verify` | POST | Internal | Validate token (service-to-service) |
| `/api/auth/logout` | POST | Authenticated | Client-side token clear |
| `/api/auth/me` | GET | Authenticated | Current user profile |

### Incident Service (3002)
| Endpoint | Method | Access | Purpose |
|----------|--------|--------|---------|
| `/api/incidents` | POST | Store Staff | Create incident |
| `/api/incidents` | GET | Store Staff / Analyst | List incidents (tenant-scoped or cross-tenant) |
| `/api/incidents/:id` | GET | Store Staff / Analyst | Get incident details |
| `/api/incidents/:id/status` | PATCH | Internal / Analyst | Update status |
| `/api/incidents/:id/evidence` | POST | Store Staff | Upload evidence |
| `/api/incidents/:id/evidence/:eid` | GET | Store Staff / Analyst | Get presigned URL |

### Verification Service (3003)
| Endpoint | Method | Access | Purpose |
|----------|--------|--------|---------|
| `/api/verification/submit` | POST | Internal (from Incident Svc) | Trigger verification |
| `/api/verification/queue` | GET | Analyst | Get review queue |
| `/api/verification/:id` | GET | Analyst | Get verification details |
| `/api/verification/:id/review` | POST | Analyst | Submit decision |

---

## Multi-Tenancy Design

### Schema Structure
```
PostgreSQL
+-- auth schema (shared)
|   +-- users
|   +-- tenants
|   +-- user_tenants
|   +-- roles
|
+-- store1 schema (tenant-specific)
|   +-- incidents
|   +-- evidence
|   +-- incident_status_history
|
+-- store2 schema (tenant-specific)
|   +-- incidents
|   +-- evidence
|   +-- incident_status_history
|
+-- verification schema (shared)
    +-- verification_records
    +-- verification_history
```

### Tenant Isolation Flow
1. JWT contains `tenantId` claim
2. Every request validated via Auth Service `/verify`
3. Service extracts `tenantId` from validated token
4. Database queries routed to tenant-specific schema
5. MinIO paths namespaced by tenant (`evidence/{tenantId}/...`)

---

## Startup & Health

### Docker Compose Startup Order
1. PostgreSQL (with health check)
2. MinIO (with health check)
3. Auth Service (depends on PostgreSQL)
4. Incident Service (depends on PostgreSQL, MinIO, Auth Service)
5. Verification Service (depends on PostgreSQL, Auth Service, Incident Service)
6. Frontend (depends on all backend services)

### Health Check Endpoints
Each service exposes `GET /health` returning `{ status: "ok", service: "<name>" }`

---

## Seed Data (MVP)

| User | Password | Role | Tenant |
|------|----------|------|--------|
| store1 | store1 | Store Staff | store1 |
| store2 | store2 | Store Staff | store2 |
| facewatch1 | facewatch1 | FaceWatch Analyst | — (cross-tenant) |

Plus full demo dataset: sample incidents in various lifecycle states, evidence references, and verification history records.
