# Frontend Components — Unit 3: Incident Service Frontend

## Pages

### DashboardPage (`/dashboard`)
**Purpose**: Tenant-specific overview showing incident summary

**State** (IncidentContext):
- `incidents: Incident[]`
- `isLoading: boolean`
- `error: string | null`

**Behaviour**:
1. On mount: fetch incidents for current tenant (GET /api/incidents)
2. Display summary cards: total incidents, by status (submitted, under review, approved, rejected)
3. Show recent incidents list (last 5)
4. Provide quick link to "New Incident" form

**Access**: Store Staff only

---

### IncidentListPage (`/incidents`)
**Purpose**: Full list of tenant's incidents with status indicators

**State** (IncidentContext):
- `incidents: Incident[]`
- `statusFilter: IncidentStatus | null`
- `isLoading: boolean`

**Behaviour**:
1. On mount: fetch all incidents for tenant
2. Display as table/list with columns: Date, Type, Status, Description (truncated)
3. Status shown as coloured badge (green=approved, red=rejected, yellow=under review, blue=submitted)
4. Optional filter by status
5. Click row → navigate to `/incidents/:id`

**Access**: Store Staff only

---

### IncidentCreatePage (`/incidents/new`)
**Purpose**: Form to submit new incident with evidence

**State** (local):
- `formData: { timestamp, incidentType, suspectDetails, description }`
- `evidenceFiles: File[]`
- `isSubmitting: boolean`
- `errors: Record<string, string>`
- `uploadProgress: number`

**Behaviour**:
1. Render form with fields:
   - Timestamp (datetime picker, defaults to now)
   - Incident Type (dropdown from IncidentType enum)
   - Suspect Details (textarea)
   - Description (textarea)
   - Evidence Upload (file input, multiple files allowed)
2. Client-side validation:
   - All fields required
   - File type must be in ALLOWED_EVIDENCE_TYPES
   - File size must be <= MAX_EVIDENCE_FILE_SIZE
3. On submit:
   - POST /api/incidents (create incident)
   - For each file: POST /api/incidents/:id/evidence (upload)
   - On success: redirect to `/incidents/:id`
   - On failure: show error, preserve form data

**Access**: Store Staff only

---

### IncidentDetailPage (`/incidents/:id`)
**Purpose**: View full incident details and evidence

**State** (local):
- `incident: Incident | null`
- `evidence: Evidence[]`
- `isLoading: boolean`

**Behaviour**:
1. On mount: fetch incident by ID (GET /api/incidents/:id)
2. Display all metadata fields
3. Display status with history timeline (if available)
4. Display evidence list with thumbnails (images) or file icons (video)
5. Click evidence → open presigned URL in new tab
6. Back button → return to incident list

**Access**: Store Staff (own tenant), Analyst (any tenant)

---

## Shared Components

### EvidenceUploader
**Purpose**: Reusable file upload component with validation

**Props**:
```typescript
{
  onFilesSelected: (files: File[]) => void;
  maxFileSize: number;
  allowedTypes: string[];
  multiple: boolean;
}
```

**Behaviour**:
- Drag-and-drop zone + file picker button
- Validates file type and size before accepting
- Shows file preview (thumbnail for images, icon for video)
- Shows file name and size
- Remove button per file

### IncidentStatusBadge
**Purpose**: Coloured status indicator

**Props**: `{ status: IncidentStatus }`

**Colours**:
- submitted → blue
- under_review → yellow/amber
- approved → green
- rejected → red

### IncidentCard
**Purpose**: Summary card for incident in list/dashboard views

**Props**: `{ incident: Incident, onClick: () => void }`

---

## API Client (Incidents)

```typescript
// Base URL: http://localhost:3002

incidentApi.create(data: CreateIncidentRequest) → Incident
incidentApi.list(filter?: { status?: IncidentStatus }) → IncidentListResponse
incidentApi.getById(id: string) → Incident
incidentApi.uploadEvidence(incidentId: string, file: File) → Evidence
incidentApi.getEvidenceUrl(incidentId: string, evidenceId: string) → EvidenceAccessResponse
```

---

## React Context (IncidentContext)

```typescript
interface IncidentContextState {
  incidents: Incident[];
  currentIncident: Incident | null;
  isLoading: boolean;
  error: string | null;
}

// Actions
fetchIncidents(filter?) → void
fetchIncidentById(id) → void
createIncident(data) → Incident
clearCurrentIncident() → void
```
