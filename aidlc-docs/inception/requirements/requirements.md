# Requirements Document — Watcher Platform

## Intent Analysis

| Field | Value |
|-------|-------|
| **User Request** | Multi-tenant, AI-assisted Incident Logging, Verification, and Offender Intelligence Platform for retail security (FaceWatch) |
| **Request Type** | New Project (Greenfield) |
| **Scope Estimate** | Multiple Components (microservices monorepo) |
| **Complexity Estimate** | Moderate (well-defined MVP with clear boundaries) |
| **Depth Level** | Standard |

---

## 1. Project Overview

**Watcher** is a web-based, multi-tenant platform for retail security environments. It enables store staff to log security incidents with evidence, routes them through a structured verification pipeline (AI simulation + human analyst review), and manages incident lifecycle states. The MVP is intentionally scoped to authentication, incident submission, and verification workflow only.

---

## 2. MVP Scope Definition

### In Scope (MVP)
- Multi-tenant authentication and login
- Incident submission with evidence upload
- Verification workflow (AI simulation + analyst review)
- Tenant-isolated data access
- Pre-seeded demo data (users + full demo dataset)

### Out of Scope (Future Extensions — Mocked with "Under Construction" tabs)
- Real-time offender recognition and alerting
- Sighting tracking system
- Automated incident outcome classification
- Report generation module
- Email dispatch to external authorities
- Admin management portal

---

## 3. Functional Requirements

### FR-1: Authentication & Tenant Service

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | Users authenticate with username/password credentials | Must |
| FR-1.2 | System generates JWT tokens upon successful authentication | Must |
| FR-1.3 | JWT contains tenant context (store ID) and role information | Must |
| FR-1.4 | Users are redirected to their tenant-specific workspace after login | Must |
| FR-1.5 | Role-based access control enforces Store Staff vs FaceWatch Analyst permissions | Must |
| FR-1.6 | Tenant context is propagated across all service API requests | Must |
| FR-1.7 | Pre-seeded accounts: store1/store1 (Store Staff), store2/store2 (Store Staff), facewatch1/facewatch1 (Analyst) | Must |
| FR-1.8 | Logout functionality clears session and redirects to login | Must |

**Roles:**
- **Store Staff** — incident submission, alert viewing (mocked), tenant-scoped dashboard
- **FaceWatch Analyst** — verification queue, approve/reject workflow
- **System/AI** — automated validation (simulated)

### FR-2: Incident Management Service

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | Store Staff can create incidents with structured metadata (timestamp, store location, incident type, suspect details, description) | Must |
| FR-2.2 | Evidence files (images, video) can be uploaded and associated with incidents | Must |
| FR-2.3 | Evidence stored in MinIO (S3-compatible) via S3 SDK | Must |
| FR-2.4 | Incidents follow lifecycle states: Draft → Submitted → Under Review → Approved → Rejected | Must |
| FR-2.5 | Store Staff can only view/access incidents belonging to their own tenant/store | Must |
| FR-2.6 | FaceWatch Analysts can view incidents from all tenants (for verification purposes) | Must |
| FR-2.7 | Incident status updates are reflected in real-time on dashboards | Must |
| FR-2.8 | Incident metadata includes: ID, tenant/store ID, timestamp, description, suspect details, evidence references, current status | Must |

### FR-3: Verification Workflow Service

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | Submitted incidents are received by the verification service | Must |
| FR-3.2 | AI validation simulation executes (pass-through with mock confidence scores) | Must |
| FR-3.3 | After AI validation, incidents are routed to the analyst queue | Must |
| FR-3.4 | Analysts pick incidents from a shared first-come-first-served queue | Must |
| FR-3.5 | Analysts can approve or reject incidents with optional notes | Must |
| FR-3.6 | Approval/rejection updates the incident status in the Incident Service | Must |
| FR-3.7 | Verification history is tracked (who reviewed, when, decision, notes) | Must |

### FR-4: Frontend Application

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | Login page with username/password form | Must |
| FR-4.2 | Tenant-aware dashboard showing store-specific incidents | Must |
| FR-4.3 | Incident submission form with metadata fields and evidence upload | Must |
| FR-4.4 | Incident list view with status indicators | Must |
| FR-4.5 | Verification queue view for analysts (all tenants' submitted incidents) | Must |
| FR-4.6 | Incident detail/review view for analysts with approve/reject actions | Must |
| FR-4.7 | Logout button accessible from all authenticated pages | Must |
| FR-4.8 | "Under Construction" placeholder tabs for: Alerts, Reporting, Real-time Detection, Admin | Must |
| FR-4.9 | Responsive design optimised for desktop-first usage | Should |

---

## 4. Non-Functional Requirements

| ID | Requirement | Category |
|----|-------------|----------|
| NFR-1 | Local deployment via Docker Compose (all services + PostgreSQL + MinIO) | Deployment |
| NFR-2 | Separate PostgreSQL schema per tenant for data isolation | Data |
| NFR-3 | JWT-based stateless authentication with configurable token expiry | Security |
| NFR-4 | RESTful JSON APIs between all services | Integration |
| NFR-5 | Direct synchronous REST calls between services (no message queue for MVP) | Integration |
| NFR-6 | OpenAPI/Swagger specification with auto-generated documentation | Documentation |
| NFR-7 | npm workspaces for monorepo management | Tooling |
| NFR-8 | Evidence files stored in MinIO container (S3-compatible, kept simple) | Storage |
| NFR-9 | Full demo seed dataset (users, sample incidents in various states, evidence references, verification history) | Data |
| NFR-10 | Node.js with TypeScript for all backend services | Technology |
| NFR-11 | React with Redux Toolkit (auth/tenant state) + React Context (local state) for frontend | Technology |
| NFR-12 | PostgreSQL as the primary database | Technology |

---

## 5. Technical Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Microservices in monorepo | Domain-driven separation with MVP simplicity |
| Backend Framework | Node.js + TypeScript | As specified in requirements |
| Frontend Framework | React | As specified in requirements |
| State Management | Redux Toolkit (auth/tenant) + React Context | Balanced approach for MVP |
| Database | PostgreSQL, separate schema per tenant | Strong isolation without operational overhead of separate DBs |
| Object Storage | MinIO (Docker container) | S3-compatible, local, simple for MVP |
| Authentication | JWT-based | Stateless, tenant context in token |
| API Style | RESTful JSON | Standard, well-understood |
| Inter-Service Comms | Synchronous REST | Simplest approach for MVP |
| Monorepo Tool | npm workspaces | Minimal tooling overhead |
| API Docs | OpenAPI/Swagger | Auto-generated, industry standard |
| Deployment | Docker Compose | Local development, all services containerised |

---

## 6. Microservices Breakdown (MVP)

### Service 1: Authentication & Tenant Service
- User login and JWT generation
- Role-based access control
- Tenant resolution and context propagation
- Multi-tenant login redirection

### Service 2: Incident Management Service
- Incident CRUD operations
- Evidence file upload (to MinIO)
- Tenant-scoped data access
- Incident lifecycle state management

### Service 3: Verification Workflow Service
- Receive submitted incidents
- AI validation simulation (pass-through)
- Analyst review queue
- Approve/reject workflow
- Status synchronisation with Incident Service

### Service 4: Frontend (React SPA)
- Login, dashboard, incident forms
- Verification queue (analyst view)
- Tenant-aware routing
- Placeholder tabs for future features

---

## 7. User Flow (MVP End-to-End)

1. User navigates to login page
2. User enters credentials (e.g., store1/store1)
3. Auth Service validates, returns JWT with tenant context
4. User redirected to tenant-specific dashboard
5. Store Staff creates incident with metadata + evidence
6. Evidence uploaded to MinIO, incident saved with status "Submitted"
7. Verification Service picks up submitted incident
8. AI simulation runs (pass-through, mock scores)
9. Incident appears in analyst queue
10. Analyst (facewatch1) logs in, sees queue from all stores
11. Analyst reviews incident, approves or rejects
12. Status updated, reflected on store staff's dashboard
13. Store2 staff cannot see Store1's incidents (tenant isolation)

---

## 8. MVP Success Criteria

- [ ] store1 logs in → sees only store1 dashboard
- [ ] store1 submits incident with evidence → status becomes "Submitted"
- [ ] store2 logs in → sees only store2 dashboard, cannot see store1 incidents
- [ ] store2 submits incident with evidence
- [ ] facewatch1 logs in → sees verification queue with incidents from all stores
- [ ] facewatch1 approves/rejects an incident
- [ ] Status update reflected on respective store staff's dashboard
- [ ] Tenant isolation enforced throughout

---

## 9. Extension Configuration

| Extension | Enabled | Decided At |
|-----------|---------|------------|
| Security Baseline | No | Requirements Analysis |
| Property-Based Testing | No | Requirements Analysis |

---

## 10. Build Priority (Phases)

1. **Phase 1**: Authentication and tenant login
2. **Phase 2**: Incident submission and evidence upload
3. **Phase 3**: Verification workflow and status management
