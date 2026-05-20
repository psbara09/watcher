# Requirements Verification Questions

Please answer the following questions to help clarify and confirm the requirements for the Watcher platform. Fill in the letter choice after each [Answer]: tag.

---

## Question 1: Deployment Environment
Where will the MVP be deployed and run?

A) Local development only (Docker Compose or similar)
B) Cloud-hosted (AWS, Azure, GCP) — specify which
C) Self-hosted on-premises server
D) Containerised deployment (Docker/Kubernetes) on cloud
X) Other (please describe after [Answer]: tag below)

[Answer]: a

---

## Question 2: Database Setup
How should the PostgreSQL database be structured for multi-tenancy?

A) Shared database, shared schema with tenant_id column discrimination
B) Shared database, separate schema per tenant
C) Separate database per tenant
X) Other (please describe after [Answer]: tag below)

[Answer]: b

---

## Question 3: File/Evidence Storage
Where should uploaded evidence files (CCTV footage, images) be stored for the MVP?

A) Local filesystem on the server
B) Cloud object storage (e.g., AWS S3, Azure Blob)
C) Database BLOB storage
X) Other (please describe after [Answer]: tag below)

[Answer]: b

---

## Question 4: AI Validation Simulation
The statement mentions "AI validation simulation layer" for MVP. How should this be simulated?

A) Simple pass-through that always marks validation as "passed" with mock confidence scores
B) Rule-based checks (e.g., verify all required fields present, file size/type valid) without actual AI
C) Random pass/fail with configurable probability for testing purposes
X) Other (please describe after [Answer]: tag below)

[Answer]: a

---

## Question 5: Inter-Service Communication for MVP
The statement mentions "in-memory or simple queue abstraction" for event-driven messaging. For MVP, which approach?

A) Direct synchronous REST calls only (no event messaging for MVP)
B) In-memory event bus within the monorepo (e.g., Node.js EventEmitter or simple pub/sub)
C) Lightweight message queue (e.g., BullMQ with Redis)
X) Other (please describe after [Answer]: tag below)

[Answer]: a

---

## Question 6: Frontend State Management
The statement mentions "Redux Toolkit optional". Should the MVP use Redux Toolkit?

A) Yes — use Redux Toolkit for global state management
B) No — use React Context + hooks for simpler state management
C) Minimal — use Redux Toolkit only for auth/tenant state, React Context for the rest
X) Other (please describe after [Answer]: tag below)

[Answer]: c

---

## Question 7: Monorepo Tooling
What monorepo management tool should be used?

A) npm workspaces (simplest, no extra tooling)
B) Turborepo (build caching, task orchestration)
C) Nx (full-featured monorepo management)
D) pnpm workspaces
X) Other (please describe after [Answer]: tag below)

[Answer]: a

---

## Question 8: API Documentation
Should the MVP include API documentation?

A) Yes — OpenAPI/Swagger specification with auto-generated docs
B) Yes — basic README-based API documentation only
C) No — skip API documentation for MVP
X) Other (please describe after [Answer]: tag below)

[Answer]: a

---

## Question 9: Verification Workflow — Analyst Assignment
When an incident enters the verification queue, how should analyst assignment work?

A) First-come-first-served — any analyst picks from the shared queue
B) Auto-assigned round-robin to available analysts
C) Manual assignment by a lead analyst
X) Other (please describe after [Answer]: tag below)

[Answer]: a

---

## Question 10: MVP Pre-seeded Data
The statement specifies pre-created profiles (store1/store1, store2/store2, facewatch1/facewatch1). Should additional seed data be included?

A) Only the 3 user profiles as specified — no sample incidents
B) User profiles plus a few sample incidents in various states for demo purposes
C) User profiles plus full demo dataset (incidents, evidence references, verification history)
X) Other (please describe after [Answer]: tag below)

[Answer]: c

---

## Question 11: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: b

---

## Question 12: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)
B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)
C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)
X) Other (please describe after [Answer]: tag below)

[Answer]: c
