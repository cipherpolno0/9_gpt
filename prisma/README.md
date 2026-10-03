# ข้อมูลกลางบท06

Schema 0.6.0 มี19models ตาม ADR002 และ migrationเดียว `20261003130000_core_foundation` UUID/snake_case/RESTRICT FK, RLSdenyall, auditและประวัติ ผ่านPrisma validate/generateและSQLWASM แต่ยังมีDB-06รอPostgreSQLserver/Prismaจริง

อ่าน [DATABASE](../docs/DATABASE.md) ก่อน migrate/seed ใช้ `pnpm db:new:local`, `pnpm db:migrate:local`, `pnpm db:seed` กับฐานเฉพาะloopbackชื่อsangha_ch06_demo ไม่ใช้db push/migrate reset ไม่มีproductioncredentialหรือruntimegrant

Generated clientอยู่src/generated/prisma/client ใช้PrismaPg ตามAPI7 configseedอยู่prisma.config.ts บัญชีUserAccount/auth.usersยังรอบทบัญชี ServiceActorเป็นprovenancebootstrapไม่มีloginหรือสิทธิ์ธุรกิจ Documentเป็นmetadataสมมติยังไม่มีไฟล์/scan/ACLdownload
