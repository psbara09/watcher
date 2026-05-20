import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { config } from '../config';
import { UserRole } from '@watcher/shared';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  username?: string;
  role?: UserRole;
  tenantId?: string | null;
  tenantSchemaName?: string | null;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'No token provided', statusCode: 401 });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const response = await axios.post(`${config.services.authUrl}/api/auth/verify`, { token });

    if (!response.data.valid) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid token', statusCode: 401 });
      return;
    }

    req.userId = response.data.user?.id;
    req.username = response.data.user?.username;
    req.role = response.data.role as UserRole;
    req.tenantId = response.data.tenant?.id || null;
    req.tenantSchemaName = response.data.tenant?.schemaName || null;

    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized', message: 'Token verification failed', statusCode: 401 });
  }
}
