import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // fallback ใช้validateตอนยังไม่มี.env; ไม่ใช่credentialหรือDBจริง
    url:
      process.env.DIRECT_DATABASE_URL ??
      "postgresql://setup_unconfigured@127.0.0.1:5432/setup_unconfigured",
  },
});
