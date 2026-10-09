import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --import tsx prisma/seed.ts",
  },
  datasource: {
    // fallback ใช้validateตอนยังไม่มี.env; ไม่ใช่credentialหรือDBจริง
    url:
      process.env.CH06_DATABASE_URL ??
      process.env.DIRECT_DATABASE_URL ??
      "postgresql://setup_unconfigured@127.0.0.1:5432/setup_unconfigured",
  },
});
