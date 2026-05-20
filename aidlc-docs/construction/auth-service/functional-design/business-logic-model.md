# Business Logic Model — Unit 2: Auth Service

## Authentication Flow

### Login Process
```
Input: { username, password }

1. Look up user by username
2. If user not found → return 401 "Invalid credentials"
3. Compare password with stored bcrypt hash
4. If mismatch → return 401 "Invalid credentials"
5. Look up tenant for user (if tenant_id is not null)
6. Generate JWT with payload: { userId, username, role, tenantId, tenantSchemaName }
7. Return { token, user, tenant }
```

### Token Verification Process
```
Input: Authorization header (Bearer <token>) OR { token } body

1. Extract token from header or body
2. If no token → return 401 "No token provided"
3. Verify JWT signature using secret
4. If invalid signature → return 401 "Invalid token"
5. Check token expiry
6. If expired → return 401 "Token expired"
7. Extract payload (userId, role, tenantId, tenantSchemaName)
8. Return { valid: true, user, tenant, role }
```

### Profile Retrieval
```
Input: Validated JWT (from verify middleware)

1. Extract userId from JWT payload
2. Look up user record
3. Look up tenant record (if tenantId present)
4. Return { user, tenant }
```

### Logout
```
Input: Authorization header

1. Client-side only: remove token from storage
2. Server responds with { success: true }
3. No server-side session invalidation (stateless JWT)
```

---

## Service Layer Methods

### authenticateUser(username, password) → AuthResult | null
- Query: `SELECT * FROM auth.users WHERE username = $1`
- Compare: `bcrypt.compare(password, user.password_hash)`
- Returns user record if valid, null if invalid

### generateToken(user, tenant) → string
- Payload: `{ userId, username, role, tenantId, tenantSchemaName }`
- Sign with JWT_SECRET, expiry: 24h
- Returns signed JWT string

### validateToken(token) → TokenPayload | null
- Verify signature with JWT_SECRET
- Check expiry
- Returns decoded payload if valid, null if invalid

### resolveTenant(tenantId) → Tenant | null
- Query: `SELECT * FROM auth.tenants WHERE id = $1`
- Returns tenant record or null

### getUserByUsername(username) → User | null
- Query: `SELECT * FROM auth.users WHERE username = $1`
- Returns user record or null (excludes password_hash from response)
