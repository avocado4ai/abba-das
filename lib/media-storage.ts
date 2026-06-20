import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { promises as fs } from "fs";
import path from "path";

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "abba-das-images";

let s3Client: S3Client | null = null;

function hasMinioConfig() {
  return !!(process.env.MINIO_ACCESS_KEY && process.env.MINIO_SECRET_KEY);
}

function initializeS3Client() {
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;

  return new S3Client({
    region: "us-east-1",
    endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
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

async function uploadToS3(buffer: Buffer, filename: string, contentType: string) {
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

async function uploadToLocal(buffer: Buffer, filename: string) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const key = `${Date.now()}-${sanitizeFilename(filename)}`;
  const filePath = path.join(uploadsDir, key);
  await fs.writeFile(filePath, buffer);

  return {
    url: `/uploads/${key}`,
    filename: key,
  };
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
  if (hasMinioConfig()) {
    return uploadToS3(buffer, filename, contentType);
  }
  return uploadToLocal(buffer, filename);
}
