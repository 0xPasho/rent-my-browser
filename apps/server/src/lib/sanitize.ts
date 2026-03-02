const MAX_DEPTH = 5;
const MAX_STRING_LENGTH = 5000;
const MAX_KEYS = 50;

function stripTags(str: string): string {
  return str.replace(/<[^>]*>/g, "").slice(0, MAX_STRING_LENGTH);
}

export function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return undefined;

  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    return stripTags(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_KEYS).map((v) => sanitizeValue(v, depth + 1));
  }

  if (typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    const keys = Object.keys(value as Record<string, unknown>).slice(0, MAX_KEYS);
    for (const key of keys) {
      const cleanKey = stripTags(key);
      sanitized[cleanKey] = sanitizeValue(
        (value as Record<string, unknown>)[key],
        depth + 1,
      );
    }
    return sanitized;
  }

  return undefined;
}
