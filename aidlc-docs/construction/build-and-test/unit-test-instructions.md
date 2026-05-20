# Unit Test Instructions — Watcher Platform

## Overview
Unit tests are not included in the MVP code generation (per user request — tests not explicitly requested). This document provides guidance for adding unit tests when needed.

## Recommended Test Framework
- **Backend**: Jest + ts-jest
- **Frontend**: Vitest + React Testing Library

## Setup (When Ready to Add Tests)

### Backend Services
```bash
# Add test dependencies to each service
npm install --save-dev jest ts-jest @types/jest -w services/auth-service
npm install --save-dev jest ts-jest @types/jest -w services/incident-service
npm install --save-dev jest ts-jest @types/jest -w services/verification-service
```

Add to each service's `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Frontend
```bash
# Add test dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom -w packages/frontend
```

## Key Test Areas

### Auth Service
- `authenticateUser()` — valid/invalid credentials
- `generateToken()` — correct payload structure
- `validateToken()` — valid/expired/malformed tokens
- Login endpoint — success/failure responses
- Verify endpoint — valid/invalid tokens

### Incident Service
- `createIncident()` — valid data, tenant isolation
- `listIncidentsByTenant()` — returns only tenant's incidents
- `updateIncidentStatus()` — valid/invalid transitions
- `uploadEvidence()` — file validation (type, size)
- Tenant isolation — cross-tenant access blocked

### Verification Service
- `initiateVerification()` — idempotent behavior
- `runAIValidation()` — mock confidence score generation
- `getAnalystQueue()` — FCFS ordering, correct statuses
- `submitAnalystDecision()` — status transitions, history recording
- Role enforcement — only analysts can review

### Frontend
- LoginPage — form submission, error display, redirect
- ProtectedRoute — redirect when unauthenticated
- DashboardPage — stats calculation, incident display
- IncidentCreatePage — form validation, file validation
- VerificationQueuePage — queue display, navigation
- VerificationReviewPage — approve/reject flow

## Running Tests (Once Implemented)
```bash
# Run all tests
npm test --workspaces

# Run specific service tests
npm test -w services/auth-service
npm test -w services/incident-service
npm test -w services/verification-service
npm test -w packages/frontend
```
