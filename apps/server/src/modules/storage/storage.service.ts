import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../env.js";

const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const PRESIGN_TTL = 60 * 60 * 24; // 24 hours

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function uploadScreenshot(
  taskId: string,
  stepNumber: number,
  data: Buffer | string,
): Promise<string> {
  if (!UUID_RE.test(taskId)) {
    throw new Error("Invalid task ID format");
  }
  if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > 10000) {
    throw new Error("Invalid step number");
  }

  const key = `${taskId}/step_${stepNumber}.png`;
  const buffer = typeof data === "string" ? Buffer.from(data, "base64") : data;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
    }),
  );

  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
    { expiresIn: PRESIGN_TTL },
  );
}

export async function uploadFile(
  taskId: string,
  originalName: string,
  data: Buffer,
): Promise<{ name: string; url: string }> {
  if (!UUID_RE.test(taskId)) {
    throw new Error("Invalid task ID format");
  }

  const baseName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const ext = baseName.includes(".")
    ? baseName.slice(baseName.lastIndexOf("."))
    : "";
  const key = `${taskId}/files/${randomUUID()}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: data,
    }),
  );

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
    { expiresIn: PRESIGN_TTL },
  );

  return { name: originalName, url };
}
