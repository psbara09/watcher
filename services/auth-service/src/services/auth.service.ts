import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { config } from '../config';
import { User, UserRole, Tenant } from '@watcher/shared';

export interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  tenantId: string | null;
  tenantSchemaName: string | null;
}

export interface AuthResult {
  user: User;
  tenant: Tenant | null;
  token: string;
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<AuthResult | null> {
  const userResult = await pool.query(
    'SELECT id, username, password_hash, role, tenant_id, created_at FROM auth.users WHERE username = $1',
    [username]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  const row = userResult.rows[0];
  const passwordValid = await bcrypt.compare(password, row.password_hash);

  if (!passwordValid) {
    return null;
  }

  const user: User = {
    id: row.id,
    username: row.username,
    role: row.role as UserRole,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
  };

  let tenant: Tenant | null = null;
  if (user.tenantId) {
    tenant = await resolveTenant(user.tenantId);
  }

  const token = generateToken(user, tenant);

  return { user, tenant, token };
}

export function generateToken(user: User, tenant: Tenant | null): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    tenantId: user.tenantId,
    tenantSchemaName: tenant?.schemaName || null,
  };

  return jwt.sign(payload as object, config.jwt.secret, {
    expiresIn: config.jwt.expiry as string,
  } as jwt.SignOptions);
}

export function validateToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function resolveTenant(tenantId: string): Promise<Tenant | null> {
  const result = await pool.query(
    'SELECT id, name, schema_name, created_at FROM auth.tenants WHERE id = $1',
    [tenantId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    schemaName: row.schema_name,
    createdAt: row.created_at,
  };
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT id, username, role, tenant_id, created_at FROM auth.users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    username: row.username,
    role: row.role as UserRole,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
  };
}
