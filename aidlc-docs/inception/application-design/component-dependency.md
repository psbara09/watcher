# Component Dependencies — Watcher Platform

## Dependency Matrix

| Component | Depends On | Depended On By |
|-----------|-----------|----------------|
| Auth Service | PostgreSQL | Incident Service, Verification Service, Frontend |
| Incident Service | PostgreSQL, MinIO, Auth Service | Verification Service, Frontend |
| Verification Service | PostgreSQL, Auth Service, Incident Service | Frontend |
| Frontend | Auth Service, Incident Service, Verification Service | — |
| Shared Package | — | Auth Service, Incident Service, Verification Service, Frontend |

---

## Service-to-Service Dependencies

```
+-------------+          +------------------+          +---------------------+
|  Frontend   |--------->|  Auth Service    |<---------|  Incident Service   |
|  :3000      |    |     |  :3001           |     |    |  :3002              |
+-------------+    |     +------------------+     |    +---------------------+
      |            |                              |            ^
      |            |     +------------------+     |            |
      +------------|---->| Verification Svc |-----+            |
                   |     | :3003            |------------------+
                   |     +------------------+
                   |
                   +---> Direct REST calls (no gateway)
```

### Dependency Details

| From | To | Type | Endpoint | Purpose |
|------|----|------|----------|---------|
| Incident Service | Auth Service | Sync REST | `POST /api/auth/verify` | Token validation on every request |
| Verification Service | Auth Service | Sync REST | `POST /api/auth/verify` | Token validation on every request |
| Verification Service | Incident Service | Sync REST | `PATCH /api/incidents/:id/status` | Update incident status after decision |
| Verification Service | Incident Service | Sync REST | `GET /api/incidents/:id/evidence/:eid` | Access evidence via presigned URL |
| Incident Service | Verification Service | Sync REST | `POST /api/verification/submit` | Trigger verification on submission |
| Frontend | Auth Service | Sync REST | `POST /api/auth/login`, `GET /api/auth/me` | Authentication |
| Frontend | Incident Service | Sync REST | All `/api/incidents/*` | Incident CRUD + evidence |
| Frontend | Verification Service | Sync REST | All `/api/verification/*` | Analyst workflow |

---

## Infrastructure Dependencies

| Component | PostgreSQL | MinIO | Network |
|-----------|:----------:|:-----:|:-------:|
| Auth Service | ✓ (auth schema) | — | Internal |
| Incident Service | ✓ (per-tenant schemas) | ✓ (evidence bucket) | Internal |
| Verification Service | ✓ (verification schema) | — | Internal |
| Frontend | — | — | External (browser) |

---

## Database Schema Ownership

| Schema | Owner Service | Tables |
|--------|--------------|--------|
| `auth` | Auth Service | users, tenants, user_tenants, roles |
| `store1` | Incident Service | incidents, evidence, incident_status_history |
| `store2` | Incident Service | incidents, evidence, incident_status_history |
| `verification` | Verification Service | verification_records, verification_history |

---

## Startup Order (Docker Compose)

Services must start in this order due to dependencies:

1. **PostgreSQL** — database must be ready first
2. **MinIO** — object storage must be ready
3. **Auth Service** — must be available before other services (token verification)
4. **Incident Service** — depends on Auth Service, PostgreSQL, MinIO
5. **Verification Service** — depends on Auth Service, Incident Service, PostgreSQL
6. **Frontend** — depends on all backend services being available

Docker Compose `depends_on` with health checks will enforce this ordering.

---

## Data Flow: End-to-End Incident Lifecycle

```
[Store Staff Browser]
        |
        | (1) Login: POST auth:3001/api/auth/login
        | (2) Get JWT { userId, tenantId: "store1", role: "staff" }
        |
        | (3) Create Incident: POST incident:3002/api/incidents
        |     -> Auth verify: POST auth:3001/api/auth/verify
        |     -> Save to store1.incidents (status: Submitted)
        |     -> Upload evidence to MinIO: evidence/store1/...
        |     -> Trigger: POST verification:3003/api/verification/submit
        |
        | (4) Verification Service:
        |     -> Auth verify: POST auth:3001/api/auth/verify
        |     -> Create verification_record
        |     -> AI simulation (pass-through, score: 0.85)
        |     -> Update status: PATCH incident:3002/api/incidents/:id/status
        |        (status: "Under Review")
        |
[Analyst Browser]
        |
        | (5) Login: POST auth:3001/api/auth/login
        | (6) Get JWT { userId, tenantId: null, role: "analyst" }
        |
        | (7) View Queue: GET verification:3003/api/verification/queue
        |     -> Auth verify: POST auth:3001/api/auth/verify
        |     -> Return pending items (FCFS order)
        |
        | (8) View Evidence: GET incident:3002/api/incidents/:id/evidence/:eid
        |     -> Auth verify (analyst role allowed)
        |     -> Return presigned MinIO URL
        |
        | (9) Approve: POST verification:3003/api/verification/:id/review
        |     -> Auth verify
        |     -> Record decision in verification_history
        |     -> Update: PATCH incident:3002/api/incidents/:id/status
        |        (status: "Approved")
        |
[Store Staff Browser]
        |
        | (10) View Incidents: GET incident:3002/api/incidents
        |      -> Auth verify (tenantId: "store1")
        |      -> Query store1.incidents
        |      -> See updated status: "Approved"
```
