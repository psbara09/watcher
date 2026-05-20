# Business Rules — Unit 2: Auth Service

## Authentication Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| AUTH-01 | Username must exist in the database | Login endpoint validation |
| AUTH-02 | Password must match bcrypt hash | Login endpoint validation |
| AUTH-03 | JWT tokens expire after 24 hours | Token generation (exp claim) |
| AUTH-04 | JWT must be signed with server secret | Token generation and verification |
| AUTH-05 | Invalid/expired tokens return 401 | Verify endpoint |
| AUTH-06 | Analysts have null tenantId in JWT | Token generation logic |
| AUTH-07 | Store Staff always have a tenantId in JWT | Token generation logic |

## Token Verification Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| VERIFY-01 | Token must be present in Authorization header or body | Verify endpoint |
| VERIFY-02 | Token signature must be valid | jwt.verify() |
| VERIFY-03 | Token must not be expired | exp claim check |
| VERIFY-04 | Response includes full user context (role, tenant) | Verify response |

## Tenant Resolution Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| TENANT-01 | Each Store Staff user belongs to exactly one tenant | Database FK constraint |
| TENANT-02 | Analysts do not belong to any tenant (cross-tenant access) | tenant_id = NULL |
| TENANT-03 | Tenant schema_name maps to PostgreSQL schema | Used by other services for routing |

## Password Rules (MVP)

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| PWD-01 | Passwords stored as bcrypt hashes (cost factor 10) | Seed script + any future registration |
| PWD-02 | No password complexity requirements for MVP | N/A (pre-seeded accounts only) |
| PWD-03 | No password reset functionality for MVP | Out of scope |

## Security Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| SEC-01 | Password hash never returned in API responses | User serialization excludes password_hash |
| SEC-02 | Failed login attempts return generic error (no user enumeration) | Same error for "user not found" and "wrong password" |
| SEC-03 | JWT secret stored in environment variable | process.env.JWT_SECRET |
