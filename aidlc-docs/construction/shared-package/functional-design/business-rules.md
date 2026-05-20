# Business Rules — Unit 1: Shared Package

## Overview
Unit 1 contains no business rules. It defines the shared constants that encode business rule parameters used by other units.

## Shared Rule Parameters (Constants)

| Constant | Value | Used By |
|----------|-------|---------|
| MAX_EVIDENCE_FILE_SIZE | 50 MB | Incident Service (upload validation) |
| ALLOWED_EVIDENCE_TYPES | jpeg, png, gif, mp4, mpeg | Incident Service (upload validation) |
| PRESIGNED_URL_EXPIRY | 3600 seconds (1 hour) | Incident Service (evidence access) |
| JWT_EXPIRY | 24 hours | Auth Service (token generation) |

## Status Transition Rules (Defined Here, Enforced in Services)

### Incident Status Transitions
```
Draft → Submitted (Store Staff submits)
Submitted → Under Review (Verification Service picks up)
Under Review → Approved (Analyst approves)
Under Review → Rejected (Analyst rejects)
```

Invalid transitions (enforced by Incident Service):
- Cannot go backwards (Approved → Under Review)
- Cannot skip states (Draft → Approved)
- Only specific roles can trigger specific transitions

### Verification Status Transitions
```
Pending AI → AI Validated (AI simulation completes)
AI Validated → In Review (Analyst picks up)
In Review → Approved (Analyst approves)
In Review → Rejected (Analyst rejects)
```
