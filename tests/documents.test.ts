import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import {
  inspectUpload,
  boundedBytes,
  contentHash,
  maximumFileBytes,
} from "../src/server/documents/files";
import { scanWithClamAV } from "../src/server/documents/clamav";
test("Thai filename preserved; forged MIME/path/size rejected before storage", () => {
  const data = Buffer.from("%PDF-1.7\nสมมติ");
  const file = inspectUpload(data, "หลักฐานสมมติ.pdf", "application/pdf");
  assert.equal(file.label, "หลักฐานสมมติ.pdf");
  assert.equal(file.sha256, contentHash(data));
  for (const [bytes, label, mime] of [
    [data, "../หลักฐาน.pdf", "application/pdf"],
    [Buffer.from("MZexe"), "หลักฐาน.pdf", "application/pdf"],
    [data, "หลักฐาน.xlsx", "application/pdf"],
    [Buffer.alloc(maximumFileBytes + 1), "หลักฐาน.pdf", "application/pdf"],
  ] as const)
    assert.throws(() => inspectUpload(bytes, label, mime));
});
test("streaming byte limit rejects oversized body independent of content-length", async () => {
  const request = new Request("https://example.invalid", {
    method: "POST",
    body: new Uint8Array(33),
  });
  await assert.rejects(boundedBytes(request, 32));
});
async function daemon(response: string, fn: (port: number) => Promise<void>) {
  // Protocol simulator only: this does not certify the ClamAV signature database.
  const server = createServer((socket) => {
    socket.on("data", () => {
      socket.end(response + "\0");
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  try {
    await fn(address.port);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
test("scanner adapter fails closed on daemon error and only accepts exact clean result", async () => {
  const bytes = Buffer.from("%PDF-1.7 test");
  await assert.rejects(async () => scanWithClamAV(bytes, {}));
  await daemon("stream: OK", async (port) =>
    assert.equal(
      await scanWithClamAV(bytes, {
        CLAMAV_HOST: "127.0.0.1",
        CLAMAV_PORT: String(port),
      }),
      "CLEAN",
    ),
  );
  await daemon("stream: Eicar-Test-Signature FOUND", async (port) =>
    assert.equal(
      await scanWithClamAV(bytes, {
        CLAMAV_HOST: "127.0.0.1",
        CLAMAV_PORT: String(port),
      }),
      "REJECTED",
    ),
  );
  await daemon(
    "INSTREAM size limit exceeded. ERROR",
    async (port) =>
      await assert.rejects(
        scanWithClamAV(bytes, {
          CLAMAV_HOST: "127.0.0.1",
          CLAMAV_PORT: String(port),
        }),
      ),
  );
});

test("storage proxy detects changed bytes and rejects an accidentally public bucket", async () => {
  const { readObject } = await import("../src/server/documents/storage");
  const previous = globalThis.fetch;
  const vars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_STORAGE_SERVER_KEY",
    "PORTAL_PRIVATE_BUCKET",
  ];
  const saved = vars.map((k) => process.env[k]);
  const bytes = Buffer.from("%PDF-1.7 mock");
  let publicBucket = false;
  try {
    Object.assign(process.env, {
      NEXT_PUBLIC_SUPABASE_URL: "https://synthetic-project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "SIMULATED_PUBLISHABLE",
      SUPABASE_STORAGE_SERVER_KEY: "SIMULATED_SERVER_ONLY",
      PORTAL_PRIVATE_BUCKET: "portal-test",
    });
    globalThis.fetch = async (url) =>
      String(url).includes("/bucket/")
        ? Response.json({ id: "portal-test", public: publicBucket })
        : new Response(new Uint8Array(bytes));
    const key =
      "00000000-0000-4000-8000-000000000001/00000000-0000-4000-8000-000000000002/00000000-0000-4000-8000-000000000003";
    assert.deepEqual(
      await readObject(key, contentHash(bytes), bytes.length),
      bytes,
    );
    await assert.rejects(
      readObject(key, contentHash(Buffer.from("changed")), bytes.length),
    );
    publicBucket = true;
    await assert.rejects(readObject(key, contentHash(bytes), bytes.length));
  } finally {
    globalThis.fetch = previous;
    vars.forEach((k, i) => {
      if (saved[i] === undefined) delete process.env[k];
      else process.env[k] = saved[i];
    });
  }
});
