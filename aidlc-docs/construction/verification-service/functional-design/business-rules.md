# Business Rules — Unit 4: Verification Service

## Verification Pipeline Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| VER-01 | Every submitted incident must go through AI validation | Submit endpoint triggers AI automatically |
| VER-02 | AI validation is a mock pass-through (always passes in MVP) | AI simulation logic |
| VER-03 | AI confidence score is randomly generated between 0.75-0.98 | AI simulation logic |
| VER-04 | After AI validation, incident status becomes "under_review" | Status update to Incident Service |
| VER-05 | Submission is idempotent (duplicate incidentId returns existing record) | Unique constraint check |

## Analyst Queue Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| QUE-01 | Queue shows items with status "ai_validated" or "in_review" | Query filter |
| QUE-02 | Queue is ordered first-come-first-served (oldest first) | ORDER BY created_at ASC |
| QUE-03 | Any analyst can pick any item (no assignment) | No ownership check |
| QUE-04 | Only analysts can access the queue | Role check (facewatch_analyst) |

## Review Decision Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| REV-01 | Only items in "ai_validated" or "in_review" status can be reviewed | Status validation |
| REV-02 | Decision must be "approved" or "rejected" | Enum validation |
| REV-03 | Notes are optional but recommended | No enforcement (nullable) |
| REV-04 | Once decided, a record cannot be re-reviewed | Status check (terminal states) |
| REV-05 | Decision updates incident status in Incident Service | Cross-service PATCH call |
| REV-06 | Verification history records every action with timestamp and actor | History table insert |

## Status Transition Rules

| Current Status | Allowed Next Status | Triggered By |
|---------------|--------------------:|--------------|
| pending_ai | ai_validated | AI simulation completion |
| ai_validated | in_review | Analyst picks up (implicit on review) |
| ai_validated | approved | Analyst approves directly |
| ai_validated | rejected | Analyst rejects directly |
| in_review | approved | Analyst approves |
| in_review | rejected | Analyst rejects |

**Terminal States** (no further transitions):
- approved
- rejected

## Access Control Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| ACL-01 | POST /api/verification/submit: internal service call (from Incident Service) | Service-to-service auth |
| ACL-02 | GET /api/verification/queue: analyst only | Role check |
| ACL-03 | GET /api/verification/:id: analyst only | Role check |
| ACL-04 | POST /api/verification/:id/review: analyst only | Role check |
| ACL-05 | All endpoints require valid JWT | Auth middleware |
