# Business Rules — Unit 3: Incident Service

## Incident Creation Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| INC-01 | All required fields must be non-empty (timestamp, incidentType, suspectDetails, description) | Request validation |
| INC-02 | incidentType must be a valid IncidentType enum value | Request validation |
| INC-03 | Incident is created with status "submitted" (no draft state for MVP) | Service layer |
| INC-04 | storeLocation auto-populated from tenant name | Service layer |
| INC-05 | Only Store Staff can create incidents | Role check middleware |
| INC-06 | Incident automatically triggers verification on creation | Service layer (POST to Verification) |

## Evidence Upload Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| EVD-01 | File type must be in ALLOWED_EVIDENCE_TYPES (jpeg, png, gif, mp4, mpeg) | Upload validation |
| EVD-02 | File size must not exceed MAX_EVIDENCE_FILE_SIZE (50MB) | Upload validation |
| EVD-03 | Evidence must be associated with an existing incident | FK validation |
| EVD-04 | Evidence can only be uploaded by the incident's tenant | Tenant check |
| EVD-05 | Storage path includes tenant namespace for isolation | MinIO path generation |

## Tenant Isolation Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| TEN-01 | Store Staff can ONLY access incidents in their own tenant schema | Schema routing from JWT |
| TEN-02 | Analysts can access incidents from ALL tenant schemas | Cross-schema query |
| TEN-03 | Tenant schema is determined from validated JWT, never from request body | Auth middleware |
| TEN-04 | MinIO paths are namespaced by tenant (evidence/{tenant}/...) | Storage path generation |
| TEN-05 | URL manipulation cannot bypass tenant isolation | Server-side tenant check |

## Status Transition Rules

| Current Status | Allowed Next Status | Triggered By |
|---------------|--------------------:|--------------|
| submitted | under_review | Verification Service (after AI validation) |
| under_review | approved | Verification Service (analyst approves) |
| under_review | rejected | Verification Service (analyst rejects) |

**Invalid Transitions** (return 400 error):
- Any backward transition (approved → under_review)
- Skipping states (submitted → approved)
- Changing from terminal states (approved → anything, rejected → anything)

## Access Control Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| ACL-01 | All endpoints require valid JWT (except health check) | Auth middleware |
| ACL-02 | Store Staff: create, list (own), get (own), upload evidence | Role + tenant check |
| ACL-03 | Analyst: list (all), get (all), get evidence (all) | Role check |
| ACL-04 | Status updates: only from Verification Service (internal) | Service-to-service auth |
| ACL-05 | Evidence presigned URLs: accessible to incident owner or analyst | Tenant/role check |
