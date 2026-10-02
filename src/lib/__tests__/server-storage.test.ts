import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import os from "os";
import { unlink } from "fs/promises";
import { safeReadJson, safeWriteJson } from "../server-storage";

describe("server-storage", () => {
  const testFile = path.join(os.tmpdir(), `test-storage-${Date.now()}.json`);

  afterEach(async () => {
    try {
      await unlink(testFile);
    } catch {
      // ignore
    }
  });

  it("reads default value when file does not exist", async () => {
    const data = await safeReadJson(testFile, { fallback: true });
    expect(data).toEqual({ fallback: true });
  });

  it("writes and reads back JSON successfully", async () => {
    const payload = { items: ["keychain-1", "keychain-2"], total: 2 };
    await safeWriteJson(testFile, payload);
    const read = await safeReadJson(testFile, {});
    expect(read).toEqual(payload);
  });

  it("updates existing JSON content", async () => {
    await safeWriteJson(testFile, { step: 1 });
    await safeWriteJson(testFile, { step: 2 });
    const read = await safeReadJson(testFile, {});
    expect(read).toEqual({ step: 2 });
  });
});
