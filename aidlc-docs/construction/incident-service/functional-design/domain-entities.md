# Domain Entities — Unit 3: Incident Service

## Database Schema: Per-Tenant (e.g., `store1`, `store2`)

### Table: incidents
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique incident identifier |
| tenant_id | UUID | NOT NULL | Tenant that owns this incident |
| timestamp | TIMESTAMP | NOT NULL | When incident occurred |
| store_location | VARCHAR(200) | NOT NULL | Auto-populated from tenant name |
| incident_type | VARCHAR(50) | NOT NULL | IncidentType enum value |
| suspect_details | TEXT | NOT NULL | Description of suspect |
| description | TEXT | NOT NULL | Narrative of what happened |
| status | VARCHAR(30) | NOT NULL, DEFAULT 'submitted' | IncidentStatus enum value |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

### Table: evidence
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique evidence identifier |
| incident_id | UUID | FK → incidents.id, NOT NULL | Parent incident |
| tenant_id | UUID | NOT NULL | Tenant that owns this evidence |
| file_name | VARCHAR(255) | NOT NULL | Original filename |
| file_type | VARCHAR(100) | NOT NULL | MIME type |
| file_size | INTEGER | NOT NULL | File size in bytes |
| storage_path | VARCHAR(500) | NOT NULL | MinIO object path |
| uploaded_at | TIMESTAMP | DEFAULT NOW() | Upload time |

### Table: incident_status_history
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique record identifier |
| incident_id | UUID | FK → incidents.id, NOT NULL | Related incident |
| previous_status | VARCHAR(30) | NULLABLE | Status before change |
| new_status | VARCHAR(30) | NOT NULL | Status after change |
| changed_by | VARCHAR(100) | NOT NULL | Who/what triggered the change |
| changed_at | TIMESTAMP | DEFAULT NOW() | When status changed |

---

## MinIO Storage Structure

```
evidence-bucket/
+-- store1/
|   +-- {incident-id}/
|       +-- {evidence-id}_{original-filename}
+-- store2/
    +-- {incident-id}/
        +-- {evidence-id}_{original-filename}
```

---

## Seed Data (Demo Dataset)

### Store 1 Incidents
| # | Type | Status | Evidence | Description |
|---|------|--------|----------|-------------|
| 1 | Theft | Approved | 1 image | Shoplifting incident in electronics aisle |
| 2 | Antisocial Behaviour | Rejected | 1 image | Verbal abuse towards staff member |
| 3 | Theft | Under Review | 2 images | Suspect concealing items in bag |
| 4 | Vandalism | Submitted | 1 image | Graffiti on store exterior |

### Store 2 Incidents
| # | Type | Status | Evidence | Description |
|---|------|--------|----------|-------------|
| 1 | Fraud | Approved | 1 image | Counterfeit currency used at checkout |
| 2 | Trespass | Submitted | 1 image | Previously banned individual re-entered |
| 3 | Theft | Under Review | 1 image | Coordinated theft by two suspects |

**Note**: Evidence files for seed data will be placeholder images (small test files) stored in MinIO during database seeding.
