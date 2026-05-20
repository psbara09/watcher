# Integration Test Instructions — Watcher Platform

## Purpose
Validate the end-to-end MVP flow across all services, confirming the system works as a whole.

## Prerequisites
- Docker Compose running (PostgreSQL + MinIO)
- All 3 backend services running
- Frontend running
- Seed data loaded

## Manual Integration Test Scenarios

### Scenario 1: Store Staff Login and Tenant Redirection
1. Open http://localhost:3000
2. Login with `store1` / `store1`
3. **Expected**: Redirected to `/dashboard`, see "Store 1 Dashboard" title
4. Verify sidebar shows: Dashboard, Incidents, New Incident
5. Logout
6. Login with `store2` / `store2`
7. **Expected**: Redirected to `/dashboard`, see "Store 2 Dashboard" title

### Scenario 2: Tenant Isolation Verification
1. Login as `store1` / `store1`
2. Navigate to Incidents list
3. **Expected**: See only Store 1's incidents (4 demo incidents)
4. Logout
5. Login as `store2` / `store2`
6. Navigate to Incidents list
7. **Expected**: See only Store 2's incidents (3 demo incidents)
8. **Verify**: No Store 1 incidents visible to Store 2

### Scenario 3: Incident Submission with Evidence
1. Login as `store1` / `store1`
2. Click "New Incident"
3. Fill form:
   - Timestamp: current time
   - Type: Theft
   - Suspect: "Male, 20s, blue jacket"
   - Description: "Suspect seen concealing items"
4. Attach an image file (JPEG/PNG)
5. Click "Submit Incident"
6. **Expected**: Redirected to incident detail page, status = "Under Review" (AI validation auto-triggered)
7. Navigate to Incidents list
8. **Expected**: New incident appears in list with "Under Review" status

### Scenario 4: Analyst Verification Workflow
1. Login as `facewatch1` / `facewatch1`
2. **Expected**: Redirected to `/verification` (queue page)
3. **Expected**: See pending incidents from both stores in queue
4. Click on an incident in the queue
5. **Expected**: See full incident details, evidence, AI score, history
6. Enter review notes: "Evidence clear, suspect identifiable"
7. Click "Approve"
8. **Expected**: Confirmation dialog, then redirect to queue
9. **Expected**: Approved incident no longer in queue

### Scenario 5: Status Update Propagation
1. After Scenario 4, login as the store staff whose incident was approved
2. Navigate to Incidents list
3. **Expected**: The approved incident now shows "Approved" status
4. Click on the incident
5. **Expected**: Status badge shows "Approved"

### Scenario 6: Invalid Login
1. Navigate to http://localhost:3000/login
2. Enter invalid credentials (e.g., `wrong` / `wrong`)
3. **Expected**: Error message "Invalid credentials" displayed
4. **Expected**: Remain on login page

### Scenario 7: Analyst Cannot Create Incidents
1. Login as `facewatch1` / `facewatch1`
2. **Expected**: No "New Incident" option in navigation
3. Manually navigate to `/incidents/new`
4. **Expected**: Page renders but submission would fail with 403

## API Integration Tests (curl)

### Test Auth Flow
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"store1","password":"store1"}'
# Expected: 200 with token, user, tenant

# Verify token
TOKEN="<token from login>"
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\"}"
# Expected: 200 with valid=true, user, tenant, role
```

### Test Incident CRUD
```bash
# List incidents (store1)
curl http://localhost:3002/api/incidents \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 with store1's incidents only

# Create incident
curl -X POST http://localhost:3002/api/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"2026-05-20T10:00:00Z","incidentType":"theft","suspectDetails":"Test suspect","description":"Test description"}'
# Expected: 201 with created incident (status: submitted)
```

### Test Verification Flow
```bash
# Login as analyst
ANALYST_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"facewatch1","password":"facewatch1"}' | jq -r '.token')

# Get queue
curl http://localhost:3003/api/verification/queue \
  -H "Authorization: Bearer $ANALYST_TOKEN"
# Expected: 200 with queue items

# Approve an incident (replace VERIFICATION_ID)
curl -X POST http://localhost:3003/api/verification/VERIFICATION_ID/review \
  -H "Authorization: Bearer $ANALYST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decision":"approved","notes":"Test approval"}'
# Expected: 200 with updated verification record
```

## Automated Integration Tests (Future)
When ready to automate, use:
- **Backend**: Supertest + Jest for API testing
- **Frontend**: Cypress or Playwright for E2E browser testing
