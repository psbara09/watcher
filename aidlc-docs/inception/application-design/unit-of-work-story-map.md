# Unit of Work — Story Mapping

## Story-to-Unit Assignment

| Story | Primary Unit | Secondary Unit(s) | Rationale |
|-------|-------------|-------------------|-----------|
| US-1: Store Staff Login & Tenant Redirection | Unit 2 (Auth + Auth Frontend) | — | Login, JWT, tenant context, redirection all owned by Auth |
| US-2: Analyst Login & Queue Access | Unit 2 (Auth + Auth Frontend) | Unit 4 (redirect target) | Auth handles login; queue page built in Unit 4 |
| US-3: User Logout | Unit 2 (Auth + Auth Frontend) | — | Logout is purely auth functionality |
| US-4: Submit Incident with Evidence | Unit 3 (Incident + Incident Frontend) | Unit 4 (triggers verification) | Incident creation and evidence owned by Incident Service |
| US-5: View My Store's Incidents | Unit 3 (Incident + Incident Frontend) | — | Tenant-scoped listing owned by Incident Service |
| US-6: AI Validation of Submitted Incidents | Unit 4 (Verification + Verification Frontend) | Unit 3 (status update) | AI simulation owned by Verification Service |
| US-7: Analyst Reviews and Decides | Unit 4 (Verification + Verification Frontend) | Unit 3 (status update) | Review workflow owned by Verification Service |

---

## Unit-to-Story Coverage

### Unit 1: Shared Package & Project Scaffold
- **No direct user stories** — infrastructure/foundation unit
- **Supports all stories** by providing type contracts and project structure

### Unit 2: Auth Service + Auth Frontend
| Story | Coverage |
|-------|----------|
| US-1 | Full — login, JWT generation, tenant redirection, isolation enforcement |
| US-2 | Partial — analyst login and JWT (queue page in Unit 4) |
| US-3 | Full — logout functionality |

### Unit 3: Incident Service + Incident Frontend
| Story | Coverage |
|-------|----------|
| US-4 | Full — incident creation, evidence upload, metadata, status "Submitted" |
| US-5 | Full — tenant-scoped incident listing, status display |
| US-6 | Partial — receives status update from Verification Service |
| US-7 | Partial — receives status update from Verification Service |

### Unit 4: Verification Service + Verification Frontend
| Story | Coverage |
|-------|----------|
| US-2 | Partial — verification queue page (analyst landing after login) |
| US-4 | Partial — triggered by incident submission |
| US-6 | Full — AI validation simulation, routing to queue |
| US-7 | Full — analyst queue, review, approve/reject, status sync |

---

## Cross-Unit Stories

These stories span multiple units and require integration:

| Story | Units Involved | Integration Point |
|-------|---------------|-------------------|
| US-4 | Unit 3 + Unit 4 | Incident submission triggers verification (REST call) |
| US-6 | Unit 4 + Unit 3 | AI validation updates incident status (REST call) |
| US-7 | Unit 4 + Unit 3 | Analyst decision updates incident status (REST call) |

**Note**: Cross-unit integration is tested during the Build and Test stage after all units are code-generated.

---

## Story Coverage Validation

| Story | Assigned? | Primary Unit | Acceptance Criteria Achievable? |
|-------|:---------:|:------------:|:-------------------------------:|
| US-1 | ✓ | Unit 2 | ✓ (all scenarios covered by Auth unit) |
| US-2 | ✓ | Unit 2 + Unit 4 | ✓ (login in Unit 2, queue in Unit 4) |
| US-3 | ✓ | Unit 2 | ✓ (fully within Auth unit) |
| US-4 | ✓ | Unit 3 + Unit 4 | ✓ (creation in Unit 3, verification trigger in Unit 4) |
| US-5 | ✓ | Unit 3 | ✓ (fully within Incident unit) |
| US-6 | ✓ | Unit 4 | ✓ (AI sim in Unit 4, status update cross-unit) |
| US-7 | ✓ | Unit 4 | ✓ (review in Unit 4, status update cross-unit) |

**Result**: All 7 user stories are assigned to units with clear ownership. All acceptance criteria are achievable within the defined unit boundaries.
