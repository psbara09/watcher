# User Stories — Watcher Platform

**Organisation**: User Journey-Based (login → submit → review → approve)
**Granularity**: Coarse-grained (one story per major feature)
**Acceptance Criteria**: Given/When/Then (BDD-style)
**Error Coverage**: Moderate (key error scenarios as acceptance criteria)

---

## Epic 1: Authentication & Tenant Access

### US-1: Store Staff Login and Tenant Redirection

**As a** Store Staff member,
**I want to** log into the platform with my credentials,
**So that** I am redirected to my store-specific workspace and can only access my own store's data.

**Persona**: Store Staff — Sarah (Store 1), Store Staff — Marcus (Store 2)

**Acceptance Criteria:**

```gherkin
Scenario: Successful login with tenant redirection (Store 1)
  Given I am on the login page
  When I enter valid credentials (store1/store1)
  Then I receive a JWT token containing my tenant context (store1) and role (Store Staff)
  And I am redirected to Store 1's dashboard
  And I can only see data belonging to Store 1

Scenario: Successful login with tenant redirection (Store 2)
  Given I am on the login page
  When I enter valid credentials (store2/store2)
  Then I receive a JWT token containing my tenant context (store2) and role (Store Staff)
  And I am redirected to Store 2's dashboard
  And I can only see data belonging to Store 2

Scenario: Failed login with invalid credentials
  Given I am on the login page
  When I enter invalid credentials
  Then I see an error message indicating authentication failed
  And I remain on the login page
  And no JWT token is issued

Scenario: Tenant isolation — Store 2 cannot see Store 1 data
  Given Sarah (store1) has submitted incidents
  And Marcus (store2) logs in with store2/store2
  When Marcus views his incident list
  Then he sees only Store 2's incidents
  And none of Sarah's Store 1 incidents are visible

Scenario: Tenant isolation — URL/API manipulation blocked
  Given I am logged in as store1 staff
  When I attempt to access store2's data via URL manipulation or API
  Then I receive an access denied response
  And no cross-tenant data is exposed
```

---

### US-2: Analyst Login and Queue Access

**As a** FaceWatch Analyst,
**I want to** log into the platform with my credentials,
**So that** I can access the verification queue containing incidents from all stores.

**Persona**: FaceWatch Analyst (James)

**Acceptance Criteria:**

```gherkin
Scenario: Successful analyst login
  Given I am on the login page
  When I enter valid analyst credentials (e.g., facewatch1/facewatch1)
  Then I receive a JWT token with analyst role
  And I am redirected to the verification queue dashboard
  And I can see submitted incidents from all stores

Scenario: Analyst cannot access store-specific submission features
  Given I am logged in as a FaceWatch Analyst
  When I navigate the application
  Then I do not see incident submission forms
  And my interface is focused on the verification workflow
```

---

### US-3: User Logout

**As a** logged-in user (any role),
**I want to** log out of the platform,
**So that** my session is terminated and the system is secured.

**Persona**: Store Staff (Sarah), FaceWatch Analyst (James)

**Acceptance Criteria:**

```gherkin
Scenario: Successful logout
  Given I am logged in to the platform
  When I click the logout button
  Then my JWT token is invalidated/cleared
  And I am redirected to the login page
  And I cannot access protected pages without logging in again
```

---

## Epic 2: Incident Submission & Evidence

### US-4: Submit Security Incident with Evidence

**As a** Store Staff member,
**I want to** create and submit a security incident with structured metadata and evidence files,
**So that** the incident enters the verification pipeline for review.

**Persona**: Store Staff (Sarah)

**Acceptance Criteria:**

```gherkin
Scenario: Successful incident submission
  Given I am logged in as Store Staff
  When I fill in the incident form with:
    | Field           | Value                          |
    | Timestamp       | Date/time of incident          |
    | Store Location  | Auto-populated from tenant     |
    | Incident Type   | Selected from predefined types |
    | Suspect Details | Description of suspect         |
    | Description     | Narrative of what happened     |
  And I upload one or more evidence files (images or video)
  Then the incident is created with status "Submitted"
  And evidence files are stored in the object storage (MinIO)
  And the incident appears in my incident list
  And the incident is routed to the verification workflow

Scenario: Incident submission with missing required fields
  Given I am logged in as Store Staff
  When I attempt to submit an incident with missing required fields
  Then I see validation errors indicating which fields are required
  And the incident is not submitted

Scenario: Evidence upload failure
  Given I am filling in the incident form
  When I upload an evidence file and the upload fails
  Then I see an error message about the upload failure
  And I can retry the upload without losing form data
```

---

### US-5: View My Store's Incidents

**As a** Store Staff member,
**I want to** view a list of all incidents submitted by my store,
**So that** I can track their status through the verification pipeline.

**Persona**: Store Staff (Sarah)

**Acceptance Criteria:**

```gherkin
Scenario: View tenant-scoped incident list
  Given I am logged in as Store Staff
  When I navigate to the incident list view
  Then I see all incidents belonging to my store
  And each incident shows its current status (Draft/Submitted/Under Review/Approved/Rejected)
  And I do not see incidents from other stores

Scenario: Incident status reflects verification progress
  Given I have a submitted incident
  When a FaceWatch Analyst approves or rejects my incident
  Then the status update is reflected in my incident list
  And I can see the updated status without manual refresh
```

---

## Epic 3: Verification Workflow

### US-6: AI Validation of Submitted Incidents

**As the** System/AI service,
**I want to** automatically validate submitted incidents,
**So that** they are pre-processed before reaching the analyst queue.

**Persona**: System/AI (AutoValidator)

**Acceptance Criteria:**

```gherkin
Scenario: Automatic AI validation on submission (MVP - pass-through)
  Given an incident has been submitted by Store Staff
  When the verification service receives the incident
  Then the AI simulation executes (pass-through with mock confidence score)
  And the incident is marked as "AI Validated"
  And the incident is routed to the analyst review queue

Scenario: AI validation records mock results
  Given an incident passes through AI validation
  Then a validation record is created with:
    | Field            | Value                    |
    | Confidence Score | Mock value (e.g., 0.85)  |
    | Validation Status| Passed                   |
    | Timestamp        | Current time             |
```

---

### US-7: Analyst Reviews and Decides on Incidents

**As a** FaceWatch Analyst,
**I want to** review submitted incidents from the queue and approve or reject them,
**So that** only verified incidents are accepted into the system.

**Persona**: FaceWatch Analyst (James)

**Acceptance Criteria:**

```gherkin
Scenario: Analyst picks incident from shared queue
  Given I am logged in as a FaceWatch Analyst
  When I view the verification queue
  Then I see all incidents with status "Under Review" from all stores
  And incidents are ordered first-come-first-served
  And I can select any incident to review

Scenario: Analyst approves an incident
  Given I am reviewing an incident
  When I click "Approve" and optionally add review notes
  Then the incident status changes to "Approved"
  And the status update is reflected in the store staff's dashboard
  And a verification history record is created (who, when, decision, notes)

Scenario: Analyst rejects an incident
  Given I am reviewing an incident
  When I click "Reject" and optionally add review notes
  Then the incident status changes to "Rejected"
  And the status update is reflected in the store staff's dashboard
  And a verification history record is created (who, when, decision, notes)

Scenario: Analyst views incident details and evidence
  Given I am reviewing an incident
  When I open the incident detail view
  Then I can see all incident metadata (timestamp, store, type, suspect, description)
  And I can view/download attached evidence files
  And I have sufficient context to make an approve/reject decision
```

---

## Story-Persona Mapping

| Story | Store Staff (Sarah/Store1) | Store Staff (Marcus/Store2) | FaceWatch Analyst | System/AI |
|-------|:--------------------------:|:---------------------------:|:-----------------:|:---------:|
| US-1: Store Staff Login | ✓ | ✓ | | |
| US-2: Analyst Login | | | ✓ | |
| US-3: Logout | ✓ | ✓ | ✓ | |
| US-4: Submit Incident | ✓ | ✓ | | |
| US-5: View Incidents | ✓ | ✓ | | |
| US-6: AI Validation | | | | ✓ |
| US-7: Analyst Review | | | ✓ | |

---

## MVP Success Criteria Cross-Reference

| MVP Criterion | Covered By |
|---------------|------------|
| store1 logs in → sees only store1 dashboard | US-1 |
| store1 submits incident with evidence | US-4 |
| store2 logs in → sees only store2 dashboard | US-1 (tenant isolation) |
| store2 submits incident with evidence | US-4 |
| facewatch1 logs in → sees verification queue | US-2 |
| facewatch1 approves/rejects incident | US-7 |
| Status update reflected on store dashboard | US-5, US-7 |
| Tenant isolation enforced | US-1, US-5 |

---

## INVEST Criteria Verification

| Story | Independent | Negotiable | Valuable | Estimable | Small | Testable |
|-------|:-----------:|:----------:|:--------:|:---------:|:-----:|:--------:|
| US-1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| US-2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| US-3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| US-4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| US-5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| US-6 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| US-7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
