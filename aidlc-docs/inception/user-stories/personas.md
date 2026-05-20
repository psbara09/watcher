# User Personas — Watcher Platform

---

## Persona 1: Store Staff Member (Store 1)

| Attribute | Description |
|-----------|-------------|
| **Name** | Sarah (Store Security Lead) |
| **Role** | Store Staff |
| **Organisation** | Store 1 (tenant: store1) |
| **Credentials** | store1 / store1 |
| **Tech Proficiency** | Moderate — comfortable with web applications, not technical |
| **Primary Goal** | Quickly and accurately log security incidents with supporting evidence |
| **Secondary Goals** | Track incident outcomes, maintain awareness of store security status |
| **Pain Points** | Time pressure during incidents, complex forms slow down reporting, unclear what happens after submission |
| **Workflow Context** | Works on-site at a retail store, accesses the system from a desktop workstation, often needs to log incidents shortly after they occur |
| **Key Motivations** | Protecting store assets, fulfilling security obligations, getting timely feedback on reported incidents |
| **Access Pattern** | Logs in at start of shift, submits incidents as they occur, checks dashboard for status updates |

**Tenant Context**: Sarah belongs to Store 1 (store1). She can only see incidents and data from her own store. She is unaware of other tenants' data.

---

## Persona 2: Store Staff Member (Store 2)

| Attribute | Description |
|-----------|-------------|
| **Name** | Marcus (Store Security Officer) |
| **Role** | Store Staff |
| **Organisation** | Store 2 (tenant: store2) |
| **Credentials** | store2 / store2 |
| **Tech Proficiency** | Moderate — familiar with basic web tools and reporting systems |
| **Primary Goal** | Log security incidents for his store and track their verification status |
| **Secondary Goals** | Ensure evidence is properly captured and submitted |
| **Pain Points** | Needs confidence that his store's data is private, wants clear feedback on submission outcomes |
| **Workflow Context** | Works at a different retail location from Sarah, same role but completely isolated data |
| **Key Motivations** | Store security, compliance with reporting procedures, data privacy assurance |
| **Access Pattern** | Logs in as needed, submits incidents, reviews own store's incident history |

**Tenant Context**: Marcus belongs to Store 2 (store2). He can only see incidents and data from his own store. He cannot see Store 1's incidents, and Sarah cannot see his. This persona exists specifically to validate tenant isolation — when Marcus logs in, none of Sarah's (store1) incidents are visible, and vice versa.

---

## Persona 2: FaceWatch Analyst

| Attribute | Description |
|-----------|-------------|
| **Name** | James (Verification Analyst) |
| **Role** | FaceWatch Analyst |
| **Organisation** | FaceWatch (central verification authority) |
| **Tech Proficiency** | High — experienced with review workflows and evidence assessment |
| **Primary Goal** | Efficiently review and verify submitted incidents for accuracy and quality |
| **Secondary Goals** | Maintain high verification throughput, ensure consistent quality standards |
| **Pain Points** | High volume of submissions, inconsistent evidence quality, need to context-switch between different stores' incidents |
| **Workflow Context** | Works from a central office, reviews incidents from all stores, makes approve/reject decisions based on evidence quality and completeness |
| **Key Motivations** | Maintaining database integrity, ensuring only verified incidents enter the central system, processing queue efficiently |
| **Access Pattern** | Logs in to review queue, works through incidents sequentially (first-come-first-served), makes decisions with notes |

**Tenant Context**: James has cross-tenant visibility — he sees submitted incidents from all stores in a single verification queue. He does not "belong" to a specific store tenant.

---

## Persona 3: System/AI Service

| Attribute | Description |
|-----------|-------------|
| **Name** | AutoValidator (AI Simulation) |
| **Role** | System/AI Service |
| **Organisation** | FaceWatch (automated pipeline) |
| **Tech Proficiency** | N/A — automated system actor |
| **Primary Goal** | Perform initial validation checks on submitted incidents before human review |
| **Capabilities (MVP)** | Pass-through validation with mock confidence scores |
| **Limitations (MVP)** | No actual AI/ML processing, no image analysis, no facial recognition |
| **Workflow Context** | Triggered automatically when an incident is submitted, runs validation, routes to analyst queue |
| **Future Capabilities** | Data completeness checks, image quality assessment, preliminary face matching, automated classification |

**MVP Behaviour**: In the MVP, this actor simply passes all incidents through with a mock "validated" status and confidence score, simulating what a real AI pipeline would do.

---

## Persona-to-Role Mapping

| Persona | System Role | Tenant Scope | Key Actions |
|---------|-------------|--------------|-------------|
| Store Staff — Sarah (Store 1) | Store Staff | Single tenant (store1) | Login, submit incidents, upload evidence, view own incidents |
| Store Staff — Marcus (Store 2) | Store Staff | Single tenant (store2) | Login, submit incidents, upload evidence, view own incidents |
| FaceWatch Analyst (James) | FaceWatch Analyst | Cross-tenant (all stores) | Login, review queue, approve/reject incidents |
| System/AI (AutoValidator) | System Service | Cross-tenant (automated) | Validate submissions, route to queue |
