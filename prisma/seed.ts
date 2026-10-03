import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { assertLocalDatabase } from "./local-safety";
import { seedSyntheticData } from "./seed-data";

async function main() {
  const connectionString = assertLocalDatabase(
    process.env.CH06_DATABASE_URL,
    process.env.APP_ENV,
    "demo",
  );
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    await seedSyntheticData(prisma);
    console.log(
      "เพิ่มชุดข้อมูลสมมติบท06สำเร็จ รันซ้ำได้โดยไม่เพิ่มหรือเขียนทับข้อมูลเดิม",
    );
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(() => {
  console.error(
    "seed ไม่สำเร็จ ตรวจฐานทดลอง migration และสิทธิ์จาก DATABASE.md (ไม่แสดง URL/ข้อมูลส่วนตัว)",
  );
  process.exitCode = 1;
});
