import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

export const config = {
  port: parseInt(process.env.VERIFICATION_SERVICE_PORT || '3003', 10),
  db: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'watcher',
    password: process.env.POSTGRES_PASSWORD || 'watcher_dev',
    database: process.env.POSTGRES_DB || 'watcher',
  },
  services: {
    authUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    incidentUrl: process.env.INCIDENT_SERVICE_URL || 'http://localhost:3002',
  },
};
