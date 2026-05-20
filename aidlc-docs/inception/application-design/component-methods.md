# Component Methods — Watcher Platform

## Auth Service Methods

### Controller Layer (REST Endpoints)

| Method | Endpoint | Input | Output | Purpose |
|--------|----------|-------|--------|---------|
| login | `POST /api/auth/login` | `{ username, password }` | `{ token, user, tenant }` | Authenticate user, return JWT |
| verifyToken | `POST /api/auth/verify` | `{ token }` (or Authorization header) | `{ valid, user, tenant, role }` | Validate JWT for other services |
| logout | `POST /api/auth/logout` | Authorization header | `{ success }` | Client-side token invalidation |
| getProfile | `GET /api/auth/me` | Authorization header | `{ user, tenant, role }` | Get current user context |

### Service Layer

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| authenticateUser | `username: string, password: string` | `AuthResult \| null` | Validate credentials against DB |
| generateToken | `user: User, tenant: Tenant` | `string (JWT)` | Create JWT with user/tenant/role claims |
| validateToken | `token: string` | `TokenPayload \| null` | Decode and validate JWT |
| resolveTenant | `userId: string` | `Tenant` | Look up tenant for a user |
| getUserByUsername | `username: string` | `User \| null` | Find user record |

---

## Incident Service Methods

### Controller Layer (REST Endpoints)

| Method | Endpoint | Input | Output | Purpose |
|--------|----------|-------|--------|---------|
| createIncident | `POST /api/incidents` | `{ timestamp, incidentType, suspectDetails, description }` + tenant from token | `Incident` | Create new incident |
| listIncidents | `GET /api/incidents` | Query params (status filter) + tenant from token | `Incident[]` | List tenant-scoped incidents |
| getIncident | `GET /api/incidents/:id` | Incident ID + tenant from token | `Incident` | Get single incident details |
| updateStatus | `PATCH /api/incidents/:id/status` | `{ status }` + tenant from token | `Incident` | Update incident lifecycle status |
| uploadEvidence | `POST /api/incidents/:id/evidence` | Multipart file + incident ID | `Evidence` | Upload evidence to MinIO |
| getEvidence | `GET /api/incidents/:id/evidence/:evidenceId` | Evidence ID | `{ presignedUrl }` | Get presigned URL for evidence access |

### Service Layer

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| createIncident | `data: CreateIncidentDTO, tenantId: string` | `Incident` | Create incident in tenant schema |
| findIncidentsByTenant | `tenantId: string, filters?: IncidentFilters` | `Incident[]` | Query incidents for a tenant |
| findIncidentsForVerification | `status: string` | `Incident[]` | Query cross-tenant incidents by status (analyst view) |
| findIncidentById | `id: string, tenantId: string` | `Incident \| null` | Get single incident with tenant check |
| updateIncidentStatus | `id: string, status: IncidentStatus, tenantId: string` | `Incident` | Transition incident state |
| uploadEvidence | `incidentId: string, file: Buffer, metadata: FileMetadata` | `Evidence` | Store file in MinIO, save reference |
| generatePresignedUrl | `evidenceId: string` | `string` | Generate time-limited access URL |

---

## Verification Service Methods

### Controller Layer (REST Endpoints)

| Method | Endpoint | Input | Output | Purpose |
|--------|----------|-------|--------|---------|
| submitForVerification | `POST /api/verification/submit` | `{ incidentId, tenantId }` | `VerificationRecord` | Receive incident, trigger AI validation |
| getQueue | `GET /api/verification/queue` | Authorization header (analyst) | `VerificationRecord[]` | Get analyst review queue |
| getVerificationDetails | `GET /api/verification/:id` | Verification ID | `VerificationRecord` | Get verification status and history |
| submitReview | `POST /api/verification/:id/review` | `{ decision, notes }` + analyst from token | `VerificationRecord` | Analyst approve/reject |

### Service Layer

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| initiateVerification | `incidentId: string, tenantId: string` | `VerificationRecord` | Create verification record, run AI simulation |
| runAIValidation | `incidentId: string` | `AIValidationResult` | Mock pass-through with confidence score |
| getAnalystQueue | | `VerificationRecord[]` | Get pending reviews (FCFS order) |
| getVerificationById | `id: string` | `VerificationRecord \| null` | Get single verification record |
| submitAnalystDecision | `id: string, decision: Decision, notes: string, analystId: string` | `VerificationRecord` | Record decision, update incident status |
| updateIncidentStatus | `incidentId: string, tenantId: string, status: IncidentStatus` | `void` | Call Incident Service to update status |

---

## Frontend Key Components

### Pages/Routes

| Component | Route | Role Access | Purpose |
|-----------|-------|-------------|---------|
| LoginPage | `/login` | Public | Username/password authentication |
| DashboardPage | `/dashboard` | Store Staff | Tenant-specific incident overview |
| IncidentListPage | `/incidents` | Store Staff | List of store's incidents with status |
| IncidentCreatePage | `/incidents/new` | Store Staff | Incident submission form + evidence upload |
| IncidentDetailPage | `/incidents/:id` | Store Staff | View incident details and status |
| VerificationQueuePage | `/verification` | Analyst | Review queue (all stores) |
| VerificationReviewPage | `/verification/:id` | Analyst | Review incident, approve/reject |
| PlaceholderPage | `/alerts`, `/reports`, `/detection`, `/admin` | All | "Under Construction" message |

### State Management

| Store/Context | Scope | Purpose |
|---------------|-------|---------|
| authSlice (Redux) | Global | JWT token, user info, tenant context, role |
| tenantSlice (Redux) | Global | Current tenant ID, store name |
| IncidentContext | Local | Incident list, filters, current incident |
| VerificationContext | Local | Queue items, current review |

---

## Cross-Service Method Calls

| Caller | Callee | Method | Purpose |
|--------|--------|--------|---------|
| Incident Service | Auth Service | `POST /api/auth/verify` | Validate JWT on every request |
| Verification Service | Auth Service | `POST /api/auth/verify` | Validate JWT on every request |
| Verification Service | Incident Service | `PATCH /api/incidents/:id/status` | Update status after decision |
| Verification Service | Incident Service | `GET /api/incidents/:id/evidence/:eid` | Access evidence via presigned URL |
| Frontend | Auth Service | `POST /api/auth/login` | User authentication |
| Frontend | Incident Service | All incident endpoints | Incident CRUD + evidence |
| Frontend | Verification Service | Queue + review endpoints | Analyst workflow |
