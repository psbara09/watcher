# Domain Entities — Unit 2: Auth Service

## Database Schema: `auth`

### Table: users
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique user identifier |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| role | VARCHAR(30) | NOT NULL | UserRole enum value |
| tenant_id | UUID | FK → tenants.id, NULLABLE | Associated tenant (null for analysts) |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

### Table: tenants
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique tenant identifier |
| name | VARCHAR(100) | NOT NULL | Display name (e.g., "Store 1") |
| schema_name | VARCHAR(50) | UNIQUE, NOT NULL | PostgreSQL schema name (e.g., "store1") |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

---

## Seed Data

### Tenants
| id | name | schema_name |
|----|------|-------------|
| (generated) | Store 1 | store1 |
| (generated) | Store 2 | store2 |

### Users
| username | password (plain) | password_hash | role | tenant_id |
|----------|-----------------|---------------|------|-----------|
| store1 | store1 | bcrypt("store1") | store_staff | → Store 1 |
| store2 | store2 | bcrypt("store2") | store_staff | → Store 2 |
| facewatch1 | facewatch1 | bcrypt("facewatch1") | facewatch_analyst | NULL |

---

## JWT Token Payload
```typescript
interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  tenantId: string | null;
  tenantSchemaName: string | null;
  iat: number;    // issued at
  exp: number;    // expiry
}
```
