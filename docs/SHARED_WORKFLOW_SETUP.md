# เอกสารและ workflow กลางสำหรับ staging

รุ่น 0.1 · 2026-10-09 · app/schema 0.8.0 · ใช้ข้อมูลสมมติเท่านั้น

## แนวคิดทีละขั้น

1. Document กลางเป็นเรื่องของเอกสาร ส่วน FileVersion เป็น bytes รุ่นที่แน่นอน เก็บ SHA256, ขนาด และ object key ที่ไม่เขียนทับกัน การอัปโหลดสร้าง UPLOAD_PENDING ก่อน แล้วจึงเป็น QUARANTINED เมื่อ storage รับไฟล์สำเร็จ ความล้มเหลวระหว่างสองบริการไม่ถือว่า upload สำเร็จ ใช้ key เดิม retry ได้
2. Scan worker อ่าน bytes ตรวจ hash แล้วส่ง ClamAV INSTREAM ผลอื่นนอกจาก OK/FOUND ถือว่าบริการไม่พร้อมและคง quarantine ไว้ ห้ามเจ้าหน้าที่กด CLEAN ผ่าน web API การทดสอบ protocol simulator ไม่แทน daemon และ signature database จริง
3. การอ่านต้องมีทั้งหน้าที่ documents.read ในหน่วยงานและ DocumentAccess ที่ยังมีผล รุ่นต้อง CLEAN ไม่มี public/signed download URL ส่งให้ client; proxy ตรวจ hash และตรวจสิทธิ์อีกครั้งหลัง storage I/O ก่อนตอบ attachment/no-store/CSP sandbox
4. ร่างคำขอผูก revision, payload, policy version และ FileVersion ที่อ่านได้ ส่งกลับแล้วแก้เรื่องเดิมด้วย revision ใหม่ การแก้รุ่นเก่าหรือคำขอที่อนุมัติแล้วได้ conflict โดยไม่เขียนทับคำตัดสิน
5. ผู้ยื่น ผู้ตรวจ และผู้อนุมัติแยกกัน ตรวจ scope/session/ช่วงมอบหมายฝั่ง DB ขณะทำรายการ ผู้ดูแลเทคนิคมีเฉพาะ admin.read ไม่ได้อำนาจจากชื่อบทบาท
6. status, decision, audit, idempotency receipt และ outbox อยู่ใน transaction เดียว Worker ใช้ SESSION_USER เป็นขอบเขต ไม่ใช้ job payload เป็นสิทธิ์ การ claim ใช้ row lock/SKIP LOCKED และไม่ข้าม event รุ่นก่อนที่ยังค้าง Notification และ consumer receipt มี unique key

## ความหมายและข้อจำกัด

Workflow นี้เป็นบริการกลางทดลองของ PERSON_CORRECTION, ORGANIZATION_CHANGE, EXAM_CENTER_CHANGE เท่านั้น ยังไม่ใช่ implementation ครบของคำขอจัดตั้ง/ยุบ/เปิด/ปิด/ย้ายตามบท31–34 ไม่มี activation, impact checks ผู้สมัคร/บุคลากร, amendment คำสั่ง หรือผลทางทะเบียน Approval หมายถึงอนุมัติทดลอง ไม่เป็นคำสั่งทางการหรือ digital signature

policy namespace workflow.synthetic รุ่น1 สถานะ TO_VERIFY ไม่ปลดล็อกฟอร์มหรือกฎทางการ มี required fields หัวเรื่อง เหตุผล target_id วันมีผล และหลักฐานอย่างน้อยหนึ่งรุ่น เป้าหมาย Person ต้องมี affiliation ปัจจุบันใน scope; เป้าหมายหน่วยงานต้องเป็น Organization กลางใน scope ตรวจใหม่เมื่อส่ง/ตรวจ/อนุมัติ ห้ามถือ UUID/เลขติดตามเป็นสิทธิ์อ่านเรื่องสาธารณะ

หน้ารายการแสดงล่าสุด50รายการ ยังไม่มี pagination/ค้นย้อนหลังทั้งหมด หน่วยงานและผู้ตรวจเลือกด้วย central UUID/Account ID ต้องจัดเตรียมรหัสให้เจ้าหน้าที่ก่อน UAT ไม่เลือกจากชื่อคล้ายกันเอง วันที่มีผลเป็น date-only รูปแบบ YYYY-MM-DD ไม่มีการตีความเป็นวันเปิดทะเบียนจริง

## การตั้งค่าบริการ

ใช้ Supabase โครงการ staging แยกจากฐานที่มีข้อมูลเดิม รัน migration3ชุดผ่าน migrator ที่ได้รับอำนาจก่อนสร้าง web/worker login ไม่ใช้ superuser หรือ BYPASSRLS เป็น PORTAL_DATABASE_URL

| ชื่อ environment | ที่ใช้ | ข้อกำหนด |
| --- | --- | --- |
| APP_ENV | web/worker | staging หรือ test |
| PORTAL_DATA_MODE | web/worker | SYNTHETIC |
| NEXT_PUBLIC_SUPABASE_URL | web/worker Storage | project staging ที่ยืนยันแล้ว HTTPS supabase.co |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | web/worker | publishable key; ไม่ใช้ secret ใน NEXT_PUBLIC |
| PORTAL_DATABASE_URL | web | login ที่มี portal_runtime เท่านั้น; TLS verify |
| PORTAL_WORKER_DATABASE_URL | notification worker | login ที่มี portal_event_worker เท่านั้น |
| PORTAL_SCAN_DATABASE_URL | scan worker | login ที่มี portal_scan_worker เท่านั้น |
| PORTAL_DATABASE_CA | DB | CA ที่ตรวจ certificate ได้ เมื่อจำเป็น |
| PORTAL_LOGIN_PEPPER | web | secret store อย่างน้อย32ตัวอักษร |
| SUPABASE_STORAGE_SERVER_KEY | server/scan worker | server secret store; ห้ามส่ง browser/log |
| PORTAL_PRIVATE_BUCKET | web/scan worker | ชื่อ portal-… private=true/ไม่มี anon policy; ตรวจ metadata ก่อน I/O |
| CLAMAV_HOST / CLAMAV_PORT | scan worker | localhost/127.0.0.1/clamav ใน private network; default3310 |
| PORTAL_ORIGIN | web | HTTPS origin ที่แน่นอน; preview canonical ใช้ VERCEL_URL ฝั่ง server ได้ |

เว็บรับไฟล์ไม่เกิน4 MiB ให้ต่ำกว่า Vercel Function payload ceiling ส่วน DB/scan มีเพดาน10 MiB สำหรับบริการกลางภายหลัง ไม่มี direct upload/download10 MiB ในรอบนี้ รับ PDF/PNG/JPEG ตรวจ signature+MIME+นามสกุลและ scan; ไม่รับ XLSX และไม่อ้างว่า signature check เป็นการ parse/sanitize PDF เต็มรูปแบบ การตรวจ active content/เอกสารเข้ารหัสและ retention ยังต้องพัฒนาตามนโยบายก่อนข้อมูลจริง

ตัวอย่าง role provisioning ไม่ใส่ password: operator สร้าง LOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS ที่ไม่เป็นสมาชิก helper/migrator/admin แล้ว GRANT portal_runtime หรือ worker role ตามหน้าที่ ไม่ GRANT portal_work_guard ให้บัญชี runtime Operator ใส่ WorkerScope ให้ db_login จริง หน่วยงาน purpose notification/scan และวันเริ่ม/สิ้นสุด การใช้ pooler ต้องพิสูจน์ SESSION_USER ก่อนเปิด worker เพราะ permission bind กับ login ไม่ใช่ชื่อที่อ้างใน environment

Authority provisioning ต้องสร้าง BUSINESS_OPERATOR กับ explicit actions/organization/time โดยผู้รับผิดชอบสิทธิ์ ไม่เปิด UI ให้ technical admin แต่งตั้งตนเอง ผู้ใช้มี documents.share ยังต้องให้ผู้รับมี documents.read ในหน่วยงานเดียวกัน สิทธิ์เอกสารไม่เกิน30วันเป็นค่าทดลอง TO VERIFY ไม่มีการให้สิทธิ์ทั้งหน่วยงานโดยอัตโนมัติ

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm db:test:sql
APP_ENV=test CH06_TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:5432/sangha_ch06_test corepack pnpm db:test
corepack pnpm build
corepack pnpm smoke
corepack pnpm worker:notifications
corepack pnpm worker:scan
```

คำสั่ง db:test จำกัด loopback/ฐานสมมติ ไม่มี reset ฐานจริง Worker เป็น bounded invocation: แจ้งเตือนไม่เกิน25 event และ scanไม่เกิน10ไฟล์ต่อครั้ง ต้องมี scheduler/host ของ worker ที่เจ้าของระบบกำหนด ไม่เปิด cron HTTP ที่ใช้ web credential แทน worker และไม่ตั้ง timer ใน Vercel web request

## Recovery

- UPLOAD_PENDING: storage ยังไม่ครบหรือ mark ไม่สำเร็จ ใช้ upload key/body เดิม ไม่ upsert object เดิม หาก bytes ต่างให้ conflict และรุ่นใหม่
- QUARANTINED: scanner ไม่พร้อมให้ตรวจ daemon/private network/สิทธิ์และ retry ห้ามแก้ scan_status ด้วย SQL เพื่อผ่าน UAT จริง
- คำตัดสิน conflict: โหลดรุ่นล่าสุด ตรวจผู้ตัดสินและ hash ก่อนเลือกทำรายการใหม่ ไม่ retry ด้วย revisionใหม่โดยไม่ให้ผู้ตรวจอ่าน
- outbox ล้ม: retry worker ด้วย login/scope เดิม source transaction ยังคงอยู่ ถ้า worker txn rollback จะไม่มี receipt/notificationครึ่งชุด
- revoke scope/ACL/session: ทุก API/worker ตรวจใหม่ ไม่อาศัยการซ่อนปุ่ม หน้า private ใช้ no-store ไม่มี body/payload บุคคลใน job log
