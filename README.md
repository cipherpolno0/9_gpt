# เว็บไซต์กองบริหารทะเบียนและวัดผล

รุ่น 0.7.0: หน้าสาธารณะ 7 เมนู บัญชีกลางผ่าน Supabase Auth และหน้าค้นทะเบียนบุคคล/หน่วยงานตามสิทธิ์ใน PostgreSQL ไม่มีทะเบียนบุคคลหรือรหัสผ่านแยกตามระบบ

**ยังไม่เปิดใช้งานจริงครบ 9 ระบบ**: ระบบธุรกรรมสอบ เรียน คำขอ งบ พัสดุ สารบรรณ และ Excel ยังไม่เปิดทำรายการ ดูสถานะจริงที่ [PORTAL_READINESS](docs/PORTAL_READINESS.md) และผลตรวจที่ [PROGRESS](docs/PROGRESS.md)

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

เปิด http://127.0.0.1:3000 ได้ทันทีสำหรับหน้าสาธารณะ การเปิดล็อกอินและทะเบียนต้องจัดบริการ/บัญชี/สิทธิ์ตาม [PORTAL_SETUP](docs/PORTAL_SETUP.md) ไม่ต้องใส่ secret เพื่อดูหน้าสาธารณะ

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm db:validate
corepack pnpm db:test:sql
corepack pnpm build
corepack pnpm smoke
```

`db:test:sql` เป็นการตรวจเสริมด้วย PostgreSQL WASM ไม่แทน PostgreSQL server หรือการทดสอบงานแข่ง `db:test` ใช้ฐาน PostgreSQL จริงที่จำกัด loopback ตาม [DATABASE](docs/DATABASE.md)

Next.js/React/Prisma และ lockfile ใช้รุ่นเดิมตาม [ADR001](docs/ADR/001-stack.md) ไม่ใช้ SQLite แทน PostgreSQL ไม่เชื่อมธนาคาร NBMS e-GP หรือสร้างผลสอบทางการจาก AI

ห้าม commit `.env` หรือข้อมูลจริง เอกสารหลักอยู่ใต้ `docs/` สำเนาไฟล์เอกสารที่อัปโหลดไว้ที่ root ของ GitHub เดิมไม่ใช่ต้นทางสถานะล่าสุด
