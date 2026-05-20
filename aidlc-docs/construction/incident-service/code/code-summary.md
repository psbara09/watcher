# Code Summary — Unit 3: Incident Service + Incident Frontend

## Files Created

### Incident Service Backend (`services/incident-service/src/`)
- `index.ts` — Express app setup, Swagger, health check, routes
- `config.ts` — Environment configuration (DB, MinIO, service URLs)
- `db.ts` — PostgreSQL connection pool
- `services/incident.service.ts` — Business logic (create, list, get, updateStatus, uploadEvidence, presignedUrl)
- `services/storage.service.ts` — MinIO/S3 operations (upload, presigned URL generation)
- `controllers/incident.controller.ts` — HTTP handlers (create, list, getById, patchStatus, uploadEvidence, getEvidence)
- `routes/incident.routes.ts` — Route definitions with multer upload + Swagger
- `middleware/auth.middleware.ts` — JWT verification via Auth Service /verify
- `middleware/error-handler.ts` — Global error handler

### Frontend Pages (`packages/frontend/src/pages/`)
- `DashboardPage.tsx` — Tenant dashboard with stats cards and recent incidents table
- `IncidentListPage.tsx` — Full incident list with status filter
- `IncidentCreatePage.tsx` — Incident submission form with evidence upload
- `IncidentDetailPage.tsx` — Incident detail view with evidence list

### Frontend API (`packages/frontend/src/api/`)
- `incidents.ts` — Incident API client (create, list, getById, uploadEvidence, getEvidenceUrl)

### Modified Files
- `packages/frontend/src/App.tsx` — Updated routes to use real pages instead of placeholders

## Total New Files: 14 (+ 1 modified)

## Stories Covered
- US-4: Submit Security Incident with Evidence ✓
- US-5: View My Store's Incidents ✓

## Key Features
- Tenant-scoped incident CRUD (store staff sees only own store)
- Cross-tenant listing for analysts
- Evidence upload to MinIO with file type/size validation
- Presigned URL generation for evidence access
- Incident lifecycle status management with transition validation
- Auto-trigger verification on incident creation
- Auth middleware calling Auth Service /verify on every request
- Dashboard with status summary cards
- data-testid attributes on all interactive elements
