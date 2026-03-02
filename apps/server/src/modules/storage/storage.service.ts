import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../env.js";

// v1: local disk storage. Swap to S3/R2 later.

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

export async function uploadScreenshot(
  taskId: string,
  stepNumber: number,
  data: Buffer | string,
): Promise<string> {
  const dir = join(env.UPLOAD_DIR, taskId);
  ensureDir(dir);

  const filename = `step_${stepNumber}.png`;
  const filepath = join(dir, filename);

  const buffer = typeof data === "string"
    ? Buffer.from(data, "base64")
    : data;

  writeFileSync(filepath, buffer);

  // Return a URL path that the static route will serve
  return `/uploads/${taskId}/${filename}`;
}

export async function uploadFile(
  taskId: string,
  originalName: string,
  data: Buffer,
): Promise<{ name: string; url: string }> {
  const dir = join(env.UPLOAD_DIR, taskId, "files");
  ensureDir(dir);

  const ext = originalName.includes(".")
    ? originalName.slice(originalName.lastIndexOf("."))
    : "";
  const filename = `${randomUUID()}${ext}`;
  const filepath = join(dir, filename);

  writeFileSync(filepath, data);

  return {
    name: originalName,
    url: `/uploads/${taskId}/files/${filename}`,
  };
}
