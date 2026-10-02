import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import os from "os";

// In-memory cache keyed by relative or base filename
const memoryStore = new Map<string, string>();

/**
 * Safely reads a JSON file from disk.
 * Falls back to in-memory store and os.tmpdir() if filesystem is read-only or file missing.
 */
export async function safeReadJson<T>(primaryPath: string, defaultValue: T): Promise<T> {
  const baseName = path.basename(primaryPath);

  // 1. Try memory cache first
  if (memoryStore.has(baseName)) {
    try {
      return JSON.parse(memoryStore.get(baseName)!);
    } catch {
      // ignore
    }
  }

  // 2. Try primary path
  try {
    const raw = await readFile(primaryPath, "utf-8");
    const parsed = JSON.parse(raw);
    memoryStore.set(baseName, raw);
    return parsed;
  } catch {
    // primary not found or unreadable, check tmp
  }

  // 3. Try tmp directory fallback
  const tmpPath = path.join(os.tmpdir(), baseName);
  try {
    const raw = await readFile(tmpPath, "utf-8");
    const parsed = JSON.parse(raw);
    memoryStore.set(baseName, raw);
    return parsed;
  } catch {
    // ignore
  }

  return defaultValue;
}

/**
 * Safely writes JSON data to disk.
 * If primaryPath throws EROFS (Vercel Serverless read-only filesystem),
 * it falls back gracefully to os.tmpdir() and maintains memory cache.
 */
export async function safeWriteJson<T>(primaryPath: string, data: T): Promise<void> {
  const baseName = path.basename(primaryPath);
  const jsonStr = JSON.stringify(data, null, 2);

  // Always keep in-memory cache current
  memoryStore.set(baseName, jsonStr);

  // 1. Attempt writing to primary path
  try {
    await mkdir(path.dirname(primaryPath), { recursive: true });
    await writeFile(primaryPath, jsonStr, "utf-8");
    return;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    // If read-only filesystem (Vercel Lambda) or permission issue, fallback to tmp
    if (
      error?.code === "EROFS" ||
      error?.code === "EACCES" ||
      error?.code === "EPERM" ||
      error?.message?.includes("read-only")
    ) {
      try {
        const tmpPath = path.join(os.tmpdir(), baseName);
        await writeFile(tmpPath, jsonStr, "utf-8");
        return;
      } catch (tmpErr) {
        console.warn("[server-storage] Failed writing to tmp dir fallback:", tmpErr);
      }
    }
    console.warn("[server-storage] Fallback write error:", err);
  }
}
