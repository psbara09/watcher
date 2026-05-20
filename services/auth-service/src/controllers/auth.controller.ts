import { Request, Response } from 'express';
import {
  authenticateUser,
  validateToken,
  resolveTenant,
  getUserById,
} from '../services/auth.service';
import { LoginRequest, LoginResponse, VerifyTokenResponse, ProfileResponse } from '@watcher/shared';

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as LoginRequest;

  if (!username || !password) {
    res.status(400).json({ error: 'Validation failed', message: 'Username and password are required', statusCode: 400 });
    return;
  }

  const result = await authenticateUser(username, password);

  if (!result) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials', statusCode: 401 });
    return;
  }

  const response: LoginResponse = {
    token: result.token,
    user: result.user,
    tenant: result.tenant,
  };

  res.json(response);
}

export async function verify(req: Request, res: Response): Promise<void> {
  let token: string | undefined;

  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Fall back to body
  if (!token && req.body?.token) {
    token = req.body.token;
  }

  if (!token) {
    const response: VerifyTokenResponse = { valid: false, user: null, tenant: null, role: null };
    res.status(401).json(response);
    return;
  }

  const payload = validateToken(token);

  if (!payload) {
    const response: VerifyTokenResponse = { valid: false, user: null, tenant: null, role: null };
    res.status(401).json(response);
    return;
  }

  const user = await getUserById(payload.userId);
  let tenant = null;
  if (payload.tenantId) {
    tenant = await resolveTenant(payload.tenantId);
  }

  const response: VerifyTokenResponse = {
    valid: true,
    user,
    tenant,
    role: payload.role,
  };

  res.json(response);
}

export async function me(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'No token provided', statusCode: 401 });
    return;
  }

  const token = authHeader.substring(7);
  const payload = validateToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token', statusCode: 401 });
    return;
  }

  const user = await getUserById(payload.userId);
  if (!user) {
    res.status(404).json({ error: 'Not found', message: 'User not found', statusCode: 404 });
    return;
  }

  let tenant = null;
  if (user.tenantId) {
    tenant = await resolveTenant(user.tenantId);
  }

  const response: ProfileResponse = { user, tenant };
  res.json(response);
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // Stateless JWT — logout is client-side (token removal)
  res.json({ success: true, message: 'Logged out successfully' });
}
