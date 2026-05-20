# Unit of Work Dependencies — Watcher Platform

## Dependency Matrix

| Unit | Depends On | Required By |
|------|-----------|-------------|
| Unit 1: Shared Package | — (none) | Unit 2, Unit 3, Unit 4 |
| Unit 2: Auth Service | Unit 1 | Unit 3, Unit 4 |
| Unit 3: Incident Service | Unit 1, Unit 2 | Unit 4 |
| Unit 4: Verification Service | Unit 1, Unit 2, Unit 3 | — (none) |

---

## Dependency Details

### Unit 1 → Unit 2 (Shared Package → Auth Service)
- **Type**: Build dependency
- **What**: Auth Service imports types (User, Tenant, Role, AuthResponse) from shared package
- **Impact**: Shared package must be built before Auth Service can compile

### Unit 1 → Unit 3 (Shared Package → Incident Service)
- **Type**: Build dependency
- **What**: Incident Service imports types (Incident, Evidence, IncidentStatus) from shared package
- **Impact**: Shared package must be built before Incident Service can compile

### Unit 1 → Unit 4 (Shared Package → Verification Service)
- **Type**: Build dependency
- **What**: Verification Service imports types (VerificationRecord, Decision) from shared package
- **Impact**: Shared package must be built before Verification Service can compile

### Unit 2 → Unit 3 (Auth Service → Incident Service)
- **Type**: Runtime dependency
- **What**: Incident Service calls Auth Service `/api/auth/verify` for token validation
- **Impact**: Auth Service must be running for Incident Service to function

### Unit 2 → Unit 4 (Auth Service → Verification Service)
- **Type**: Runtime dependency
- **What**: Verification Service calls Auth Service `/api/auth/verify` for token validation
- **Impact**: Auth Service must be running for Verification Service to function

### Unit 3 → Unit 4 (Incident Service → Verification Service)
- **Type**: Runtime dependency (bidirectional)
- **What**:
  - Incident Service calls Verification Service `POST /api/verification/submit` on incident submission
  - Verification Service calls Incident Service `PATCH /api/incidents/:id/status` after decision
  - Verification Service calls Incident Service `GET /api/incidents/:id/evidence/:eid` for evidence access
- **Impact**: Both services must be running for full workflow; partial functionality possible independently

---

## Critical Path

```
Unit 1 (Shared Package)
    |
    v
Unit 2 (Auth Service + Auth Frontend)
    |
    v
Unit 3 (Incident Service + Incident Frontend)
    |
    v
Unit 4 (Verification Service + Verification Frontend)
    |
    v
Build and Test (Docker Compose, Seed Data, Integration)
```

The critical path is strictly linear — each unit depends on all previous units.

---

## Shared Resources

| Resource | Used By | Type |
|----------|---------|------|
| PostgreSQL (auth schema) | Unit 2 | Database |
| PostgreSQL (store1, store2 schemas) | Unit 3 | Database |
| PostgreSQL (verification schema) | Unit 4 | Database |
| MinIO (evidence bucket) | Unit 3 | Object Storage |
| Shared Package (types) | Units 2, 3, 4 | Build Dependency |
| JWT Secret | Units 2, 3, 4 | Configuration |
| Docker Network | All units | Infrastructure |

---

## Integration Points

| Integration | Between | Trigger | Protocol |
|-------------|---------|---------|----------|
| Token Verification | Any Service → Auth Service | Every authenticated request | REST (POST /api/auth/verify) |
| Incident Submission | Incident Service → Verification Service | Incident status = "Submitted" | REST (POST /api/verification/submit) |
| Status Update | Verification Service → Incident Service | Analyst decision made | REST (PATCH /api/incidents/:id/status) |
| Evidence Access | Verification Service → Incident Service | Analyst reviews incident | REST (GET /api/incidents/:id/evidence/:eid) |

---

## Design Phase Dependencies

For the "all designs first" strategy, functional designs can be done in parallel since they are documentation artifacts. However, the recommended order ensures each design can reference the previous:

1. Unit 1 design defines the type contracts all others reference
2. Unit 2 design defines the auth patterns others implement
3. Unit 3 design defines the incident model Unit 4 references
4. Unit 4 design references all previous designs
