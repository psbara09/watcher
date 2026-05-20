import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';
import { PRESIGNED_URL_EXPIRY } from '@watcher/shared';

const s3Client = new S3Client({
  endpoint: `http://${config.minio.endpoint}:${config.minio.port}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: config.minio.accessKey,
    secretAccessKey: config.minio.secretKey,
  },
  forcePathStyle: true,
});

export async function uploadFile(
  storagePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: config.minio.bucket,
    Key: storagePath,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
}

export async function generatePresignedUrl(storagePath: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: config.minio.bucket,
    Key: storagePath,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: PRESIGNED_URL_EXPIRY });
  return url;
}
