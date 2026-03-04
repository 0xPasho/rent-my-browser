import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../env.js";

// v1: local disk storage. Swap to S3/R2 later.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

function safePath(base: string, ...segments: string[]): string {
  const resolved = resolve(base, ...segments);
  if (!resolved.startsWith(resolve(base))) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}

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

  const dir = safePath(env.UPLOAD_DIR, taskId);
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
  if (!UUID_RE.test(taskId)) {
    throw new Error("Invalid task ID format");
  }

  const dir = safePath(env.UPLOAD_DIR, taskId, "files");
  ensureDir(dir);

  // Only allow safe extensions, strip any path components from originalName
  const baseName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const ext = baseName.includes(".")
    ? baseName.slice(baseName.lastIndexOf("."))
    : "";
  const filename = `${randomUUID()}${ext}`;
  const filepath = join(dir, filename);

  writeFileSync(filepath, data);

  return {
    name: originalName,
    url: `/uploads/${taskId}/files/${filename}`,
  };
}
