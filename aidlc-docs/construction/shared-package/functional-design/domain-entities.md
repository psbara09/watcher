# Domain Entities — Unit 1: Shared Package

## Core Entities

### User
```typescript
interface User {
  id: string;
  username: string;
  role: UserRole;
  tenantId: string | null;  // null for analysts (cross-tenant)
  createdAt: string;        // ISO 8601
}

enum UserRole {
  STORE_STAFF = 'store_staff',
  FACEWATCH_ANALYST = 'facewatch_analyst',
}
```

### Tenant
```typescript
interface Tenant {
  id: string;
  name: string;           // e.g., "Store 1"
  schemaName: string;     // e.g., "store1" (PostgreSQL schema)
  createdAt: string;
}
```

### Incident
```typescript
interface Incident {
  id: string;
  tenantId: string;
  timestamp: string;          // When incident occurred (ISO 8601)
  storeLocation: string;     // Auto-populated from tenant
  incidentType: IncidentType;
  suspectDetails: string;
  description: string;
  status: IncidentStatus;
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

enum IncidentStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

enum IncidentType {
  THEFT = 'theft',
  ASSAULT = 'assault',
  VANDALISM = 'vandalism',
  FRAUD = 'fraud',
  TRESPASS = 'trespass',
  ANTISOCIAL_BEHAVIOUR = 'antisocial_behaviour',
  OTHER = 'other',
}
```

### Evidence
```typescript
interface Evidence {
  id: string;
  incidentId: string;
  tenantId: string;
  fileName: string;
  fileType: string;       // MIME type
  fileSize: number;       // bytes
  storagePath: string;    // MinIO path
  uploadedAt: string;
}
```

### VerificationRecord
```typescript
interface VerificationRecord {
  id: string;
  incidentId: string;
  tenantId: string;
  aiValidation: AIValidationResult;
  analystReview: AnalystReview | null;
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

interface AIValidationResult {
  passed: boolean;
  confidenceScore: number;  // 0.0 - 1.0
  validatedAt: string;
}

interface AnalystReview {
  analystId: string;
  decision: ReviewDecision;
  notes: string;
  reviewedAt: string;
}

enum VerificationStatus {
  PENDING_AI = 'pending_ai',
  AI_VALIDATED = 'ai_validated',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

enum ReviewDecision {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
```

---

## API Contract Types

### Auth API
```typescript
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
  tenant: Tenant | null;
}

interface VerifyTokenRequest {
  token: string;
}

interface VerifyTokenResponse {
  valid: boolean;
  user: User | null;
  tenant: Tenant | null;
  role: UserRole | null;
}

interface ProfileResponse {
  user: User;
  tenant: Tenant | null;
}
```

### Incident API
```typescript
interface CreateIncidentRequest {
  timestamp: string;
  incidentType: IncidentType;
  suspectDetails: string;
  description: string;
}

interface UpdateStatusRequest {
  status: IncidentStatus;
}

interface IncidentListResponse {
  incidents: Incident[];
  total: number;
}

interface EvidenceUploadResponse {
  evidence: Evidence;
}

interface EvidenceAccessResponse {
  presignedUrl: string;
  expiresIn: number;  // seconds
}
```

### Verification API
```typescript
interface SubmitVerificationRequest {
  incidentId: string;
  tenantId: string;
}

interface VerificationQueueResponse {
  items: VerificationRecord[];
  total: number;
}

interface SubmitReviewRequest {
  decision: ReviewDecision;
  notes: string;
}
```

---

## Shared Constants

```typescript
const INCIDENT_STATUSES = Object.values(IncidentStatus);
const INCIDENT_TYPES = Object.values(IncidentType);
const USER_ROLES = Object.values(UserRole);
const VERIFICATION_STATUSES = Object.values(VerificationStatus);

const MAX_EVIDENCE_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EVIDENCE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/mpeg',
];
const PRESIGNED_URL_EXPIRY = 3600; // 1 hour in seconds
const JWT_EXPIRY = '24h';
```
