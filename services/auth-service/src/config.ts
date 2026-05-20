import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

export const config = {
  port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
  db: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'watcher',
    password: process.env.POSTGRES_PASSWORD || 'watcher_dev',
    database: process.env.POSTGRES_DB || 'watcher',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'watcher-dev-secret-change-in-production',
    expiry: process.env.JWT_EXPIRY || '24h',
  },
};
