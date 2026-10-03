# เว็บไซต์กองบริหารทะเบียนและวัดผล

โครงการเดียวสำหรับ9ระบบตาม[BLUEPRINT](BLUEPRINT.md) สร้างข้อมูลกลางทดลองถึงบท06 หน้าแรกทดลองภาษาไทย ไม่มีข้อมูลจริงและยังไม่เปิดระบบธุรกิจ

เริ่มจาก[SETUP](docs/SETUP.md) ใช้Node24.19.0และpnpm11.28.2รุ่นตาม[ADR001](docs/ADR/001-stack.md)

```bash
pnpm install --frozen-lockfile
pnpm env:init
pnpm dev
```

เปิดhttp://localhost:3000 ตรวจด้วยpnpmcheck บริการComposeและworkerอยู่repoเดียว ดูคู่มือก่อนเริ่ม มีschema/migrationและRLSdenyallในไฟล์แล้ว แต่Prisma/PostgreSQLserverยังNOT RUN ไม่มีAuth/สิทธิ์ธุรกิจหรือdeploy ข้อจำกัดDOCKER-05และBROWSER-03ยังต้องผลตรวจจริง อ่าน[PROGRESS](docs/PROGRESS.md)และ[OPEN_QUESTIONS](docs/OPEN_QUESTIONS.md)

ห้ามcommit.envหรือข้อมูลบุคคลจริง ไม่ติดตั้งlatestหรือสร้างระบบบทถัดไปก่อนอนุมัติ

คู่มือฐานทดลอง: [DATABASE](docs/DATABASE.md) และ [ADR002](docs/ADR/002-core-database.md) ตรวจ SQL ด้วย `pnpm db:test:sql`; ตรวจ server จริงด้วย `pnpm db:test` บท06ยังค้าง DB-06 ก่อนตรวจรับครบ
