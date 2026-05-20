# Frontend Components — Unit 2: Auth Service Frontend

## Pages

### LoginPage (`/login`)
**Purpose**: Authenticate user and redirect to appropriate dashboard

**State**:
- `username: string` (local)
- `password: string` (local)
- `error: string | null` (local)
- `isLoading: boolean` (local)

**Behaviour**:
1. Render username and password input fields
2. On submit: call `POST /api/auth/login`
3. On success: store JWT in Redux (authSlice), redirect based on role
4. On failure: display error message, clear password field
5. If already authenticated (token in store): redirect immediately

**Redirect Logic**:
- `store_staff` → `/dashboard`
- `facewatch_analyst` → `/verification`

---

## Layout Components

### AppShell
**Purpose**: Main application layout with navigation sidebar/header

**Props**: `{ children: ReactNode }`

**Behaviour**:
- Renders navigation based on user role
- Shows user info (username, store name) in header
- Provides logout button
- Wraps all authenticated pages

**Navigation Items (Store Staff)**:
- Dashboard (`/dashboard`)
- Incidents (`/incidents`)
- New Incident (`/incidents/new`)
- Alerts (`/alerts`) — placeholder
- Reports (`/reports`) — placeholder

**Navigation Items (Analyst)**:
- Verification Queue (`/verification`)
- Alerts (`/alerts`) — placeholder
- Reports (`/reports`) — placeholder
- Detection (`/detection`) — placeholder
- Admin (`/admin`) — placeholder

### ProtectedRoute
**Purpose**: Route guard that redirects unauthenticated users to login

**Props**: `{ children: ReactNode, allowedRoles?: UserRole[] }`

**Behaviour**:
1. Check if JWT exists in Redux store
2. If no token → redirect to `/login`
3. If token exists but role not in allowedRoles → redirect to appropriate home
4. If valid → render children

---

## Redux State (authSlice)

```typescript
interface AuthState {
  token: string | null;
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Actions
login(credentials: LoginRequest) → AsyncThunk
logout() → Action
clearError() → Action

// Selectors
selectIsAuthenticated(state) → boolean
selectUser(state) → User | null
selectTenant(state) → Tenant | null
selectRole(state) → UserRole | null
selectToken(state) → string | null
```

## Redux State (tenantSlice)

```typescript
interface TenantState {
  tenantId: string | null;
  tenantName: string | null;
  schemaName: string | null;
}

// Populated from login response
// Used by API clients to scope requests
```

---

## API Client (Auth)

```typescript
// Base URL: http://localhost:3001

authApi.login(username, password) → LoginResponse
authApi.verify(token) → VerifyTokenResponse
authApi.getProfile() → ProfileResponse
authApi.logout() → void
```

**Token Injection**: All API clients include `Authorization: Bearer <token>` header from Redux store automatically (axios interceptor or fetch wrapper).
