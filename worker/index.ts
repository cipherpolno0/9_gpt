import "dotenv/config";
import { Pool } from "pg";
import Redis from "ioredis";
import { localServices } from "../src/server/config/local-services";

async function main() {
  const config = localServices(process.env);
  const pool = new Pool({
    connectionString: config.databaseUrl,
    connectionTimeoutMillis: 3000,
  });
  const redis = new Redis(config.redisUrl, {
    lazyConnect: true,
    connectTimeout: 3000,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null,
  });
  redis.on("error", () => {}); // ไม่logข้อความdriverที่อาจมีcredential
  try {
    await pool.query("SELECT 1");
    await redis.connect();
    if ((await redis.ping()) !== "PONG") throw new Error("บริการยังไม่พร้อม");
    console.log(
      "ตรวจการเชื่อมบริการในเครื่องสำเร็จ ยังไม่มีตัวประมวลงานธุรกิจ",
    );
  } finally {
    redis.disconnect();
    await pool.end();
  }
  if (!process.argv.includes("--check")) {
    const timer = setInterval(() => {
      console.log("ตัวรันกำลังรอ ยังไม่เปิดรับงานธุรกิจ");
    }, 30000);
    const stop = () => {
      clearInterval(timer);
      process.exitCode = 0;
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  }
}

main().catch(() => {
  console.error(
    "ยังเชื่อมบริการในเครื่องไม่ได้ ตรวจการตั้งค่าและการเปิดบริการตามคู่มือ",
  );
  process.exitCode = 1;
});
