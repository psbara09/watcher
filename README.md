# Watcher — Incident Management Platform

Multi-tenant, AI-assisted Incident Logging, Verification & Offender Intelligence Platform for retail security environments.

## Architecture

Microservices monorepo with 3 backend services + React frontend:

| Service | Port | Purpose |
|---------|------|---------|
| Auth Service | 3001 | Authentication, JWT, tenant resolution |
| Incident Service | 3002 | Incident CRUD, evidence upload |
| Verification Service | 3003 | AI validation, analyst review queue |
| Frontend | 3000 | React SPA |

## Tech Stack

- **Backend**: Node.js, TypeScript, Express
- **Frontend**: React, Redux Toolkit, Vite
- **Database**: PostgreSQL (multi-tenant, separate schemas)
- **Object Storage**: MinIO (S3-compatible)
- **Auth**: JWT-based
- **Monorepo**: npm workspaces

## Quick Start

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose

### Setup

```bash
# 1. Start infrastructure (PostgreSQL + MinIO)
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Build shared package
npm run build:shared

# 4. Start services (in separate terminals)
npm run dev:auth
npm run dev:incident
npm run dev:verification
npm run dev:frontend
```

### Demo Accounts

| Username | Password | Role | Store |
|----------|----------|------|-------|
| store1 | store1 | Store Staff | Store 1 |
| store2 | store2 | Store Staff | Store 2 |
| facewatch1 | facewatch1 | Analyst | All stores |

## Project Structure

```
watcher/
├── packages/
│   ├── shared/          # Shared types & constants
│   └── frontend/        # React SPA
├── services/
│   ├── auth-service/    # Authentication & tenant
│   ├── incident-service/# Incident management
│   └── verification-service/ # Verification workflow
├── database/
│   ├── init/            # Schema creation
│   └── seed/            # Demo data
├── docker-compose.yml   # Infrastructure
└── package.json         # Workspace root
```

## MVP Scope

- Multi-tenant authentication (login/logout)
- Incident submission with evidence upload
- Verification workflow (AI simulation + analyst review)
- Tenant-isolated data access
- Full demo dataset

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed. Default values work with Docker Compose setup.
