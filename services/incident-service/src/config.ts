import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

export const config = {
  port: parseInt(process.env.INCIDENT_SERVICE_PORT || '3002', 10),
  db: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'watcher',
    password: process.env.POSTGRES_PASSWORD || 'watcher_dev',
    database: process.env.POSTGRES_DB || 'watcher',
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucket: process.env.MINIO_BUCKET || 'evidence',
  },
  services: {
    authUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    verificationUrl: process.env.VERIFICATION_SERVICE_URL || 'http://localhost:3003',
  },
};
