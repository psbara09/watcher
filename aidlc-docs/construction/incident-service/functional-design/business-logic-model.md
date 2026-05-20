# Business Logic Model — Unit 3: Incident Service

## Core Workflows

### Create Incident
```
Input: { timestamp, incidentType, suspectDetails, description } + tenantContext from JWT

1. Validate JWT via Auth Service POST /api/auth/verify
2. Extract tenantId and tenantSchemaName from verified token
3. Validate required fields (all must be non-empty)
4. Validate incidentType is a valid enum value
5. Set storeLocation from tenant name
6. Create incident record in {tenantSchema}.incidents with status = "submitted"
7. Record status history entry (null → submitted)
8. Trigger verification: POST verification-service/api/verification/submit { incidentId, tenantId }
9. Return created incident
```

### Upload Evidence
```
Input: Multipart file upload + incidentId + tenantContext from JWT

1. Validate JWT via Auth Service
2. Validate incident exists and belongs to tenant
3. Validate file type (must be in ALLOWED_EVIDENCE_TYPES)
4. Validate file size (must be <= MAX_EVIDENCE_FILE_SIZE)
5. Generate storage path: evidence/{tenantSchemaName}/{incidentId}/{evidenceId}_{fileName}
6. Upload file to MinIO at generated path
7. Create evidence record in {tenantSchema}.evidence
8. Return evidence metadata
```

### List Incidents (Tenant-Scoped)
```
Input: tenantContext from JWT + optional status filter

IF role = store_staff:
  1. Query {tenantSchema}.incidents WHERE tenant_id = tenantId
  2. Apply optional status filter
  3. Order by created_at DESC
  4. Return incidents with evidence count

IF role = facewatch_analyst:
  1. Query across ALL tenant schemas (store1.incidents UNION store2.incidents)
  2. Apply optional status filter (default: submitted, under_review)
  3. Order by created_at ASC (FCFS)
  4. Return incidents with tenant info
```

### Get Incident Detail
```
Input: incidentId + tenantContext from JWT

IF role = store_staff:
  1. Query {tenantSchema}.incidents WHERE id = incidentId AND tenant_id = tenantId
  2. If not found → 404
  3. Load associated evidence records
  4. Return incident with evidence list

IF role = facewatch_analyst:
  1. Query across all schemas for incident by ID
  2. If not found → 404
  3. Load associated evidence records
  4. Return incident with evidence list and tenant info
```

### Update Incident Status
```
Input: { status } + incidentId + callerContext

1. Load current incident
2. Validate status transition is allowed (see business rules)
3. Update incident status
4. Record status history entry
5. Update updated_at timestamp
6. Return updated incident
```

### Get Evidence (Presigned URL)
```
Input: incidentId + evidenceId + tenantContext from JWT

1. Validate incident belongs to tenant (or caller is analyst)
2. Load evidence record
3. Generate MinIO presigned GET URL (expiry: 1 hour)
4. Return { presignedUrl, expiresIn }
```

---

## Tenant Schema Routing

```
On every request:
1. Extract token from Authorization header
2. Call Auth Service /api/auth/verify
3. Get tenantSchemaName from response
4. Set database search_path to tenantSchemaName for this connection
5. All subsequent queries in this request use the tenant's schema
```

For analyst requests (cross-tenant):
- Query each tenant schema individually and merge results
- Or use a UNION query across known schemas
