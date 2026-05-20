# Unit of Work Plan — Watcher Platform

## Plan Overview
This plan decomposes the Watcher platform into ordered units of work for structured implementation. Based on the Application Design, the system has 4 main components (Auth Service, Incident Service, Verification Service, Frontend) plus a shared package.

---

## Planning Questions

### Question 1: Implementation Strategy
Should each unit be fully completed (design + code + tested) before starting the next, or should all designs be done first then all code?

A) Sequential per-unit — complete each unit fully (design → code → verify) before starting the next
B) All designs first — do functional design for all units, then code generation for all units
X) Other (please describe after [Answer]: tag below)

[Answer]: b

### Question 2: Frontend Implementation Approach
Should the Frontend be its own separate unit of work, or should frontend components be built incrementally alongside each backend service?

A) Separate unit — build entire frontend as the final unit after all backend services are complete
B) Incremental — build frontend pages alongside each backend service (auth pages with auth service, incident pages with incident service, etc.)
X) Other (please describe after [Answer]: tag below)

[Answer]: b

### Question 3: Shared Package Timing
When should the shared package (types, interfaces) be created?

A) First — create shared package as its own unit before any services (defines contracts upfront)
B) Alongside first service — create shared package as part of the Auth Service unit, extend as needed
C) Incrementally — each service unit adds its own types to the shared package as it's built
X) Other (please describe after [Answer]: tag below)

[Answer]: a

---

## Execution Plan (Post-Approval)

### Step 1: Define Units of Work
- [x] Define each unit with name, scope, and responsibilities
- [x] Assign build priority order
- [x] Document what each unit delivers when complete
- [x] Save to `aidlc-docs/inception/application-design/unit-of-work.md`

### Step 2: Define Unit Dependencies
- [x] Map dependencies between units (which must be built first)
- [x] Identify shared resources and integration points
- [x] Define the critical path
- [x] Save to `aidlc-docs/inception/application-design/unit-of-work-dependency.md`

### Step 3: Map Stories to Units
- [x] Assign each user story to its primary unit
- [x] Identify cross-unit stories (stories that span multiple units)
- [x] Validate all stories are covered
- [x] Save to `aidlc-docs/inception/application-design/unit-of-work-story-map.md`

### Step 4: Document Code Organization
- [x] Define monorepo directory structure
- [x] Define package naming conventions
- [x] Document how shared code is organized
- [x] Include in `unit-of-work.md`

### Step 5: Validate Completeness
- [x] Verify all components from Application Design are assigned to units
- [x] Verify all user stories are mapped
- [x] Verify dependency order is achievable
- [x] Confirm unit boundaries are clear and non-overlapping
