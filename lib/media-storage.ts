import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "abba-das-images";

let s3Client: S3Client | null = null;

function initializeS3Client() {
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "MinIO credentials not configured. Set MINIO_ACCESS_KEY and MINIO_SECRET_KEY environment variables."
    );
  }

  return new S3Client({
    region: "us-east-1",
    endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

function getS3Client() {
  if (!s3Client) {
    s3Client = initializeS3Client();
  }

  return s3Client;
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
}

export async function uploadBufferToMediaStorage({
  buffer,
  filename,
  contentType,
}: {
  buffer: Buffer;
  filename: string;
  contentType: string;
}) {
  const key = `${Date.now()}-${sanitizeFilename(filename)}`;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return {
    url: `${process.env.NEXT_PUBLIC_MINIO_URL || "http://localhost:9000"}/${BUCKET_NAME}/${key}`,
    filename: key,
  };
}
