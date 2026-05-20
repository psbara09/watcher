# Domain Entities — Unit 4: Verification Service

## Database Schema: `verification`

### Table: verification_records
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique verification record ID |
| incident_id | UUID | NOT NULL, UNIQUE | Reference to incident being verified |
| tenant_id | UUID | NOT NULL | Tenant that owns the incident |
| status | VARCHAR(30) | NOT NULL, DEFAULT 'pending_ai' | VerificationStatus enum value |
| ai_confidence_score | DECIMAL(3,2) | NULLABLE | Mock AI confidence (0.00-1.00) |
| ai_validated_at | TIMESTAMP | NULLABLE | When AI validation completed |
| analyst_id | UUID | NULLABLE | Analyst who reviewed (if reviewed) |
| decision | VARCHAR(20) | NULLABLE | ReviewDecision enum value |
| notes | TEXT | NULLABLE | Analyst review notes |
| reviewed_at | TIMESTAMP | NULLABLE | When analyst reviewed |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

### Table: verification_history
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique history entry ID |
| verification_id | UUID | FK → verification_records.id, NOT NULL | Parent verification record |
| action | VARCHAR(50) | NOT NULL | What happened (e.g., "ai_validated", "analyst_approved") |
| actor | VARCHAR(100) | NOT NULL | Who/what performed the action |
| details | JSONB | NULLABLE | Additional context (scores, notes) |
| created_at | TIMESTAMP | DEFAULT NOW() | When action occurred |

---

## Seed Data (Demo Dataset)

Verification records corresponding to the seeded incidents:

### Store 1 Verification Records
| Incident | Status | AI Score | Analyst | Decision |
|----------|--------|----------|---------|----------|
| Theft (approved) | approved | 0.92 | facewatch1 | approved |
| Antisocial (rejected) | rejected | 0.78 | facewatch1 | rejected |
| Theft (under review) | in_review | 0.85 | — | — |
| Vandalism (submitted) | ai_validated | 0.88 | — | — |

### Store 2 Verification Records
| Incident | Status | AI Score | Analyst | Decision |
|----------|--------|----------|---------|----------|
| Fraud (approved) | approved | 0.95 | facewatch1 | approved |
| Trespass (submitted) | pending_ai | — | — | — |
| Theft (under review) | in_review | 0.81 | — | — |
