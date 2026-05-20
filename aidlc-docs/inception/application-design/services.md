# Services & Orchestration — Watcher Platform

## Service Communication Pattern

**Pattern**: Direct synchronous REST calls
**Frontend → Services**: Direct communication on different ports (no API gateway)
**Service → Service**: REST calls with JWT forwarding

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  Frontend :3000  |---->|  Auth Svc :3001  |<----|  Incident :3002  |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        ^                        ^
        |                        |                        |
        |                +------------------+             |
        +--------------->|  Verification    |-------------+
                         |  Service :3003   |
                         +------------------+
```

---

## Service Definitions

### Auth Service (Port 3001)
- **Role**: Identity provider and token authority
- **Consumers**: Frontend (login), Incident Service (verify), Verification Service (verify)
- **Dependencies**: PostgreSQL (auth schema)
- **Stateless**: Yes (JWT-based, no server-side sessions)

### Incident Service (Port 3002)
- **Role**: Incident data owner and evidence manager
- **Consumers**: Frontend (CRUD), Verification Service (status updates, evidence access)
- **Dependencies**: PostgreSQL (per-tenant schemas), MinIO (evidence storage), Auth Service (token verification)
- **Tenant-Aware**: Yes (schema routing based on tenant context)

### Verification Service (Port 3003)
- **Role**: Verification pipeline orchestrator
- **Consumers**: Frontend (analyst queue/review), Incident Service (triggers submission)
- **Dependencies**: PostgreSQL (verification schema), Auth Service (token verification), Incident Service (status updates, evidence)
- **Cross-Tenant**: Yes (sees incidents from all tenants)

---

## Cross-Service Workflows

### Workflow 1: Incident Submission → Verification Pipeline

```
Store Staff (Frontend)
    |
    | 1. POST /api/incidents (create incident + upload evidence)
    v
Incident Service
    |
    | 2. Save incident (status: "Submitted")
    | 3. Store evidence in MinIO
    | 4. POST /api/verification/submit { incidentId, tenantId }
    v
Verification Service
    |
    | 5. Create verification record
    | 6. Run AI validation (mock pass-through)
    | 7. Mark as "AI Validated", add to analyst queue
    | 8. PATCH /api/incidents/:id/status { status: "Under Review" }
    v
Incident Service
    |
    | 9. Update incident status to "Under Review"
    v
Store Staff Dashboard (reflects new status)
```

### Workflow 2: Analyst Review → Decision

```
Analyst (Frontend)
    |
    | 1. GET /api/verification/queue
    v
Verification Service
    |
    | 2. Return queue items (ordered FCFS)
    v
Analyst (Frontend)
    |
    | 3. GET /api/verification/:id (view details)
    | 4. GET /api/incidents/:id/evidence/:eid (view evidence via presigned URL)
    v
Incident Service
    |
    | 5. Return presigned URL for evidence
    v
Analyst (Frontend)
    |
    | 6. POST /api/verification/:id/review { decision: "approved"|"rejected", notes }
    v
Verification Service
    |
    | 7. Record decision in verification_history
    | 8. PATCH /api/incidents/:id/status { status: "Approved"|"Rejected" }
    v
Incident Service
    |
    | 9. Update incident status
    v
Store Staff Dashboard (reflects final status)
```

### Workflow 3: Token Verification (Every Authenticated Request)

```
Any Service (Incident or Verification)
    |
    | 1. Extract JWT from Authorization header
    | 2. POST /api/auth/verify { token }
    v
Auth Service
    |
    | 3. Validate token signature and expiry
    | 4. Return { valid, user, tenant, role }
    v
Calling Service
    |
    | 5. If valid: proceed with request using tenant/role context
    | 6. If invalid: return 401 Unauthorized
```

---

## Tenant Context Propagation

### How Tenant Context Flows:

1. **Login**: Auth Service generates JWT containing `{ userId, tenantId, role }`
2. **Frontend**: Stores JWT, includes in `Authorization: Bearer <token>` header on all requests
3. **Backend Services**: On each request:
   - Extract token from header
   - Call Auth Service `/api/auth/verify` to validate and extract tenant context
   - Use `tenantId` to route database queries to correct schema
   - Use `role` to enforce access control

### Tenant Isolation Enforcement:

| Layer | Mechanism |
|-------|-----------|
| API | JWT contains tenantId — cannot be forged |
| Service | Token verification extracts tenantId from validated JWT |
| Database | Queries scoped to tenant-specific schema (e.g., `store1.incidents`) |
| Evidence | MinIO paths include tenantId (e.g., `evidence/store1/incident-123/file.jpg`) |

---

## Error Handling Patterns

| Scenario | Response | HTTP Status |
|----------|----------|-------------|
| Invalid/expired JWT | `{ error: "Unauthorized" }` | 401 |
| Valid JWT but wrong tenant | `{ error: "Forbidden" }` | 403 |
| Resource not found | `{ error: "Not found" }` | 404 |
| Validation error | `{ error: "Validation failed", details: [...] }` | 400 |
| Service unavailable | `{ error: "Service unavailable" }` | 503 |
