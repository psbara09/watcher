# Frontend Components — Unit 4: Verification Service Frontend

## Pages

### VerificationQueuePage (`/verification`)
**Purpose**: Analyst's main view — list of incidents awaiting review

**State** (VerificationContext):
- `queueItems: VerificationRecord[]`
- `isLoading: boolean`
- `error: string | null`

**Behaviour**:
1. On mount: fetch queue (GET /api/verification/queue)
2. Display as table with columns: Date Submitted, Store, Incident Type, AI Score, Status
3. Each row clickable → navigate to `/verification/:id`
4. Auto-refresh every 30 seconds (or manual refresh button)
5. Show total count of pending items
6. Items ordered oldest-first (FCFS)

**Access**: Analyst only

---

### VerificationReviewPage (`/verification/:id`)
**Purpose**: Analyst reviews a specific incident and makes approve/reject decision

**State** (local):
- `verification: VerificationRecord | null`
- `incident: Incident | null` (fetched from Incident Service)
- `evidence: Evidence[]`
- `decision: ReviewDecision | null`
- `notes: string`
- `isSubmitting: boolean`

**Behaviour**:
1. On mount: fetch verification details (GET /api/verification/:id)
2. Fetch incident details from Incident Service (GET /api/incidents/:id)
3. Display:
   - Incident metadata (timestamp, store, type, suspect, description)
   - AI validation results (confidence score, validated timestamp)
   - Evidence gallery (images displayed inline, video as links)
   - Verification history timeline
4. Provide decision controls:
   - "Approve" button (green)
   - "Reject" button (red)
   - Notes textarea (optional)
5. On decision submit:
   - POST /api/verification/:id/review { decision, notes }
   - On success: show confirmation, redirect to queue
   - On failure: show error message

**Access**: Analyst only

---

### PlaceholderPage (`/alerts`, `/reports`, `/detection`, `/admin`)
**Purpose**: "Under Construction" message for future features

**State**: None

**Behaviour**:
- Display centred message: "🚧 Under Construction"
- Subtitle: "This feature is coming soon."
- Back to dashboard/queue link

**Access**: All authenticated users (role-appropriate navigation)

---

## Shared Components

### VerificationStatusBadge
**Purpose**: Coloured status indicator for verification status

**Props**: `{ status: VerificationStatus }`

**Colours**:
- pending_ai → grey
- ai_validated → blue
- in_review → yellow/amber
- approved → green
- rejected → red

### AIScoreBadge
**Purpose**: Display AI confidence score with colour coding

**Props**: `{ score: number }`

**Colours**:
- >= 0.90 → green (high confidence)
- >= 0.80 → yellow (medium confidence)
- < 0.80 → orange (lower confidence)

### VerificationHistoryTimeline
**Purpose**: Display chronological history of verification actions

**Props**: `{ history: VerificationHistory[] }`

**Behaviour**:
- Vertical timeline showing each action
- Each entry: timestamp, actor, action description, details
- Most recent at top

### DecisionPanel
**Purpose**: Approve/Reject controls with notes

**Props**:
```typescript
{
  onDecision: (decision: ReviewDecision, notes: string) => void;
  isSubmitting: boolean;
  disabled: boolean;
}
```

**Behaviour**:
- Two buttons: Approve (green), Reject (red)
- Notes textarea
- Confirmation dialog before submitting
- Disabled state when already decided

---

## API Client (Verification)

```typescript
// Base URL: http://localhost:3003

verificationApi.getQueue() → VerificationQueueResponse
verificationApi.getById(id: string) → VerificationRecord
verificationApi.submitReview(id: string, data: SubmitReviewRequest) → VerificationRecord
```

---

## React Context (VerificationContext)

```typescript
interface VerificationContextState {
  queueItems: VerificationRecord[];
  currentVerification: VerificationRecord | null;
  isLoading: boolean;
  error: string | null;
}

// Actions
fetchQueue() → void
fetchVerificationById(id) → void
submitReview(id, decision, notes) → VerificationRecord
clearCurrentVerification() → void
```
