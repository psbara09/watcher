# Business Logic Model — Unit 4: Verification Service

## Core Workflows

### Submit for Verification
```
Input: { incidentId, tenantId } (called by Incident Service)

1. Validate request (incidentId and tenantId required)
2. Check if verification record already exists for this incident
3. If exists → return existing record (idempotent)
4. Create verification_record with status = "pending_ai"
5. Record history entry: { action: "submitted", actor: "incident-service" }
6. Execute AI validation (mock pass-through)
7. Return verification record
```

### AI Validation (Mock Pass-Through)
```
Input: verification record

1. Generate mock confidence score (random between 0.75 and 0.98)
2. Set ai_confidence_score = generated score
3. Set ai_validated_at = now()
4. Update status to "ai_validated"
5. Record history entry: { action: "ai_validated", actor: "system/ai", details: { score } }
6. Update incident status in Incident Service: PATCH /api/incidents/:id/status { status: "under_review" }
7. Return updated verification record

Note: In MVP, AI always passes. No rejection logic.
```

### Get Analyst Queue
```
Input: analyst JWT (verified via Auth Service)

1. Validate JWT via Auth Service /api/auth/verify
2. Confirm role = facewatch_analyst
3. Query verification_records WHERE status IN ('ai_validated', 'in_review')
4. Order by created_at ASC (first-come-first-served)
5. Return queue items with incident reference and tenant info
```

### Get Verification Details
```
Input: verificationId + analyst JWT

1. Validate JWT (analyst role)
2. Query verification_record by ID
3. Load verification_history for this record
4. Return record with full history
```

### Submit Analyst Review
```
Input: { decision, notes } + verificationId + analyst JWT

1. Validate JWT (analyst role)
2. Load verification record
3. Validate status is "ai_validated" or "in_review" (reviewable states)
4. If status is "ai_validated": update to "in_review" first (analyst picked it up)
5. Set analyst_id = analyst's userId
6. Set decision = request.decision (approved/rejected)
7. Set notes = request.notes
8. Set reviewed_at = now()
9. Update status to decision value (approved/rejected)
10. Record history entry: { action: "analyst_{decision}", actor: analystId, details: { notes } }
11. Update incident status in Incident Service:
    - If approved: PATCH /api/incidents/:id/status { status: "approved" }
    - If rejected: PATCH /api/incidents/:id/status { status: "rejected" }
12. Return updated verification record
```

---

## Cross-Service Communication

### Outbound Calls (Verification → Other Services)

| Target | Endpoint | When | Purpose |
|--------|----------|------|---------|
| Auth Service | POST /api/auth/verify | Every request | Token validation |
| Incident Service | PATCH /api/incidents/:id/status | After AI validation | Set "under_review" |
| Incident Service | PATCH /api/incidents/:id/status | After analyst decision | Set "approved"/"rejected" |

### Inbound Calls (Other Services → Verification)

| Source | Endpoint | When | Purpose |
|--------|----------|------|---------|
| Incident Service | POST /api/verification/submit | Incident created | Trigger verification |
| Frontend | GET /api/verification/queue | Analyst views queue | Get pending items |
| Frontend | GET /api/verification/:id | Analyst views details | Get record + history |
| Frontend | POST /api/verification/:id/review | Analyst decides | Submit decision |

---

## Error Handling

| Scenario | Response | Recovery |
|----------|----------|----------|
| Incident Service unreachable (status update) | Log error, verification record still updated | Retry or manual sync |
| Duplicate submission (same incidentId) | Return existing record (idempotent) | No action needed |
| Invalid verification status for review | 400 "Cannot review in current status" | Analyst refreshes queue |
| Analyst tries to review already-decided record | 400 "Already reviewed" | Analyst refreshes queue |
