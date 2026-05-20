# Build Instructions — Watcher Platform

## Prerequisites
- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **Docker**: >= 24.x
- **Docker Compose**: >= 2.x
- **Disk Space**: ~2GB (Docker images + node_modules)
- **Memory**: 4GB minimum recommended

## Environment Setup

### 1. Clone and Configure
```bash
# Clone repository
git clone <repository-url>
cd watcher

# Create environment file
cp .env.example .env
```

No changes needed to `.env` for local development — defaults work with Docker Compose.

### 2. Start Infrastructure (PostgreSQL + MinIO)
```bash
# Start database and object storage
docker-compose up -d

# Verify services are healthy
docker-compose ps
# Expected: postgres (healthy), minio (healthy), minio-init (exited 0)
```

**Wait for health checks** — PostgreSQL needs ~5 seconds to initialize schemas and seed data.

### 3. Install Dependencies
```bash
# Install all workspace dependencies from root
npm install
```

This installs dependencies for all packages and services via npm workspaces.

### 4. Build Shared Package (Required First)
```bash
npm run build:shared
```

The shared package must be built before any service, as they import types from it.

### 5. Build All Services
```bash
# Build all backend services
npm run build:auth
npm run build:incident
npm run build:verification

# Build frontend
npm run build:frontend
```

Or build everything at once:
```bash
npm run build:all
```

## Running the Application

### Development Mode (Recommended)
Start each service in a separate terminal:

```bash
# Terminal 1: Auth Service
npm run dev:auth

# Terminal 2: Incident Service
npm run dev:incident

# Terminal 3: Verification Service
npm run dev:verification

# Terminal 4: Frontend
npm run dev:frontend
```

### Service URLs
| Service | URL | Swagger Docs |
|---------|-----|--------------|
| Frontend | http://localhost:3000 | — |
| Auth Service | http://localhost:3001 | http://localhost:3001/api-docs |
| Incident Service | http://localhost:3002 | http://localhost:3002/api-docs |
| Verification Service | http://localhost:3003 | http://localhost:3003/api-docs |
| MinIO Console | http://localhost:9001 | — |

### Verify Build Success
1. All services start without errors
2. Health checks respond:
   - `curl http://localhost:3001/health` → `{"status":"ok","service":"auth-service"}`
   - `curl http://localhost:3002/health` → `{"status":"ok","service":"incident-service"}`
   - `curl http://localhost:3003/health` → `{"status":"ok","service":"verification-service"}`
3. Frontend loads at http://localhost:3000
4. Login works with store1/store1

## Troubleshooting

### "Cannot find module '@watcher/shared'"
**Cause**: Shared package not built
**Solution**: Run `npm run build:shared` before starting services

### "Connection refused" on database
**Cause**: PostgreSQL not running or not ready
**Solution**: Run `docker-compose up -d` and wait for health check

### "ECONNREFUSED" on MinIO
**Cause**: MinIO not running
**Solution**: Run `docker-compose up -d` and verify minio container is healthy

### Port already in use
**Cause**: Another process using the port
**Solution**: Kill the process or change port in `.env`

## Stopping the Application
```bash
# Stop all Docker services
docker-compose down

# To also remove data volumes (fresh start)
docker-compose down -v
```
