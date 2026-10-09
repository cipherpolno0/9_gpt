import { createConnection } from "node:net";
import { maximumFileBytes } from "./files";
export function scanWithClamAV(
  bytes: Buffer,
  env: Record<string, string | undefined> = process.env,
): Promise<"CLEAN" | "REJECTED"> {
  const host = env.CLAMAV_HOST,
    port = Number(env.CLAMAV_PORT ?? 3310);
  if (
    !host ||
    !["127.0.0.1", "localhost", "clamav"].includes(host) ||
    !Number.isSafeInteger(port) ||
    port < 1 ||
    port > 65535 ||
    bytes.length < 1 ||
    bytes.length > maximumFileBytes
  )
    throw new Error("SCAN_NOT_CONFIGURED_OR_INVALID");
  // Local/private daemon only; no URL from a file or web caller is used.
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port });
    let reply = "",
      settled = false;
    const timer = setTimeout(() => finish(new Error("SCAN_TIMEOUT")), 30000);
    function finish(error?: Error, result?: "CLEAN" | "REJECTED") {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      if (error) reject(error);
      else resolve(result!);
    }
    socket.once("error", () => finish(new Error("SCAN_UNAVAILABLE")));
    socket.once("end", () => {
      if (!settled) finish(new Error("SCAN_INCOMPLETE"));
    });
    socket.on("data", (data) => {
      reply += data.toString("utf8");
      if (reply.length > 4096)
        return finish(new Error("SCAN_INVALID_RESPONSE"));
      if (!reply.includes("\0")) return;
      const value = reply.slice(0, reply.indexOf("\0"));
      if (value === "stream: OK") finish(undefined, "CLEAN");
      else if (/^stream: .+ FOUND$/.test(value)) finish(undefined, "REJECTED");
      else finish(new Error("SCAN_FAILED_CLOSED"));
    });
    socket.once("connect", async () => {
      try {
        const write = (buffer: Buffer) =>
          new Promise<void>((res, rej) =>
            socket.write(buffer, (e) => (e ? rej(e) : res())),
          );
        await write(Buffer.from("zINSTREAM\0"));
        for (
          let offset = 0;
          offset < bytes.length && !settled;
          offset += 65536
        ) {
          const chunk = bytes.subarray(offset, offset + 65536);
          const size = Buffer.alloc(4);
          size.writeUInt32BE(chunk.length);
          await write(size);
          await write(chunk);
        }
        if (!settled) await write(Buffer.alloc(4));
      } catch {
        finish(new Error("SCAN_UNAVAILABLE"));
      }
    });
  });
}
