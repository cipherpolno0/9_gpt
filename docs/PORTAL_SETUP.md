# ตั้งค่า portal 0.7.0

รุ่น 0.1 · 2026-10-09 · สำหรับ staging ข้อมูลสมมติ ยังไม่อนุญาตข้อมูลจริงหรือเปิดครบ 9 ระบบ

## 1. เปิดหน้าสาธารณะบนเครื่อง

ใช้ Node 24.19.0 และ pnpm 11.28.2 ตาม package.json และ lockfile

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

เปิด http://127.0.0.1:3000 หน้าแรก ทะเบียนสาธารณะ ผลสอบ ติดตามคำขอ เรียน คู่มือ และติดต่อเราเปิดได้โดยไม่ต้องใส่ secret บริการที่ยังไม่มีข้อมูลอนุมัติจะแสดงสถานะว่างตามจริง

## 2. สร้างบริการ staging

เจ้าของบัญชีสร้างโครงการ Supabase และ Vercel ในบัญชีของตนก่อน ปัจจุบันผู้ใช้ยืนยันว่ายังไม่มีบริการ ไม่ได้สร้างโครงการแทนหรือคิดค่าบริการโดยอัตโนมัติ

1. Supabase: สร้างโครงการ PostgreSQL/Auth ใหม่สำหรับข้อมูลสมมติ แยกจาก production ตั้งรหัสฐานข้อมูลในช่องของผู้ให้บริการ ไม่ส่งในแชต
2. Vercel: Import repository `cipherpolno0/9_gpt` เลือกสาขาส่งมอบ Framework Next.js, root เป็น root repository และ Node.js 24.x
3. ใช้ vercel.json สำหรับ frozen install และ build **build ไม่รัน migration หรือ seed**
4. สำหรับ public preview ยังไม่ใส่ค่าบัญชีได้ การล็อกอินจะปิดโดยตั้งใจ
5. เปิด Auth ให้เฉพาะบัญชีที่เจ้าของงานยืนยัน ปิด public signup จนมีนโยบาย ไม่มีหน้า register หรือฐาน password อีกชุดในแอป

## 3. Migration และบัญชีฐานข้อมูล

ต้องทดสอบ migration กับโครงการ staging ว่างก่อน ให้ operator ใช้ migration role โดยตรง ไม่ใช้บัญชี web และไม่เปลี่ยน migration ที่เคยใช้แล้ว

ตั้ง DIRECT_DATABASE_URL ใน environment ของ shell/operator ที่ได้รับสิทธิ์ ไม่วางไว้ใน command line หรือไฟล์ Git และตรวจว่าไม่มี CH06_DATABASE_URL ที่จะ override ตาม prisma.config.ts

```bash
corepack pnpm exec prisma migrate deploy
corepack pnpm exec prisma migrate status
```

migration เดิม `20261003130000_core_foundation` และใหม่ `20261009170000_portal_access` สร้าง 25 ตารางพร้อม FORCE RLS ทั้งหมด บทบาท `portal_runtime` และ `portal_auth_guard` เป็น NOLOGIN/NOBYPASSRLS ต้องให้ provider อนุญาต CREATE ROLE/GRANT/ALTER FUNCTION OWNER และส่วนขยาย btree_gist ผล Supabase จริงยัง NOT_RUN ถ้า privilege ไม่พอให้หยุดและเก็บรหัส error โดยไม่เปิด BYPASSRLS ให้ web

operator สร้าง login role แยกสำหรับ web ในฐาน staging:

```sql
CREATE ROLE portal_web LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
GRANT portal_runtime TO portal_web;
```

ตั้ง password ด้วยช่องทางจัดการที่ได้รับสิทธิ์ เช่น `\password portal_web` ใน psql ห้ามให้ role นี้เป็นสมาชิก portal_auth_guard หรือ migration role แอปตรวจว่าบัญชีเชื่อมต่อไม่เป็น superuser/BYPASSRLS และ SET LOCAL ROLE portal_runtime ทุก transaction

## 4. Environment ของ web

ตั้งค่าผ่าน Vercel Project Settings สำหรับ Preview/staging แยกจาก Production

| ตัวแปร | ที่มา / ความหมาย |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | HTTPS project URL จริง เฉพาะ host ลงท้าย .supabase.co |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | publishable key ของโครงการ ไม่ใช้ service_role หรือ secret key |
| PORTAL_DATABASE_URL | URI สำหรับ portal_web ใช้ direct หรือ pooler ของโครงการตาม provider รองรับ credentials percent encoding |
| PORTAL_DATABASE_CA | CA PEM จาก provider เมื่อจำเป็นสำหรับตรวจ certificate; ไม่ปิด rejectUnauthorized |
| PORTAL_ORIGIN | HTTPS origin ของ staging แบบตรงตัว เช่น origin ที่ Vercel ออกให้ ไม่ใช่ wildcard/path |
| PORTAL_LOGIN_PEPPER | ค่าสุ่มอย่างน้อย 32 ตัวอักษรใน secrets manager; ใช้ HMAC rate-limit ไม่ใช่รหัสผ่านผู้ใช้ |

production runtime บังคับ TLS และตรวจ certificate แม้ URI มี sslmode=disable; จำกัด host .supabase.co/.pooler.supabase.com pool สูงสุด 4 connection ต่อ instance และ statement timeout 5 วินาที ต้องวัด pooling/connection limit ใน staging ก่อนเปิดจริง URI query options ไม่ถูกนำมาเปลี่ยน TLS configuration

อย่าวาง DIRECT_DATABASE_URL หรือ migration credential ใน environment ของ web ไม่มี refresh token ในแอป session หมดอายุตาม access token ต้องเข้าสู่ระบบใหม่

## 5. บัญชีและสิทธิ์ทดลอง

สร้างบัญชีสมมติใน Supabase Auth ก่อน ใช้ Auth user UUID อ้าง UserAccount ที่เชื่อม Person กลาง ไม่สร้าง Person จากชื่อผู้ล็อกอินหรือให้สิทธิ์จาก email/domain/ชื่อฝ่าย

UserAccount.require_mfa ค่าเริ่มต้น true หน้า login รับรหัส TOTP ของ factor ที่ verified แล้ว **ยังไม่มีหน้า enroll/reset/recovery MFA ใน portal** ต้องจัดกระบวนการ onboarding ที่ได้รับยืนยันก่อนใช้งานจริง ไม่ปรับค่า default ให้ false เพื่อข้ามปัญหา

script operator ด้านล่างสร้างสิทธิ์ REGISTER_READER เฉพาะ people.read/organizations.read ใช้ได้เฉพาะ APP_ENV=test ต้องใช้ Person/Organization ที่มีอยู่ในฐานสมมติ และ Auth UUID จริงของบัญชีทดสอบ JSON ต้องมาจากไฟล์ private ที่ไม่อยู่ใน Git ตัวอย่างรูปแบบ:

```json
{
  "authUserId": "00000000-0000-4000-8000-000000000001",
  "personId": "00000000-0000-4000-8000-000000000002",
  "assignmentId": "00000000-0000-4000-8000-000000000003",
  "organizationId": "00000000-0000-4000-8000-000000000004",
  "actions": ["people.read", "organizations.read"],
  "startsAt": "2026-10-09T00:00:00Z",
  "endsAt": "2026-11-09T00:00:00Z"
}
```

UUID ข้างต้นเป็นตัวอย่างไม่ใช่บัญชีที่มีอยู่ ตั้ง APP_ENV=test และ DIRECT_DATABASE_URL ของ staging ผ่าน environment ที่ป้องกันแล้ว:

```bash
node --import tsx scripts/provision-account.mts --apply < /private/account-assignment.json
```

id เดิมกับเนื้อหาใหม่ถูกปฏิเสธ ไม่ให้สิทธิ์ approve/export/download บุคคลที่จะแสดงต้องมี PersonAffiliation ตามหน่วยงาน ช่วงวัน และ evidence Document กลางด้วย ไม่มีการสร้าง affiliation/Person อัตโนมัติจากการให้สิทธิ์บัญชี การให้สิทธิ์ข้อมูลจริงยังต้อง owner และ audit provisioning ที่ครบกว่านี้

## 6. ตรวจรับก่อนเปิดบัญชีจริง

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm db:validate
corepack pnpm db:test:sql
corepack pnpm build
corepack pnpm smoke
```

บนเครื่องที่มี PostgreSQL จริง ใช้ฐานสมมติ loopback ตาม DATABASE.md แล้วรัน `corepack pnpm db:test` ตรวจ core และ portal แบบ sequential เพื่อไม่แข่ง seed fixtures `db:test:sql` ไม่แทนการตรวจ server จริง

CI `.github/workflows/portal-ci.yml` เตรียมบริการ PostgreSQL 18 ใน runner ที่มีแต่ข้อมูลสมมติ ใช้ trust เฉพาะ runner ชั่วคราว ห้ามคัดลอก setting นี้ไป staging/production image ใช้ major tag ต้องเก็บ digest/version ของรันจริงและ review pin ก่อนใช้ deployment pipeline CI ไม่ deploy และไม่รับรอง UAT/กฎทางการ

staging ต้องตรวจ login/TOTP/logout/revocation, 401/403, บัญชี scope A/B, SQL query จริง, หน้าไทย/keyboard/mobile และการหมด session กับ provider จริง ตรวจ cookie Secure/HttpOnly/SameSite, private no-store และ TLS ด้วย ก่อนเปิดข้อมูลจริง

## ขอบเขตและขั้นต่อไป

เว็บรุ่นนี้อ่านทะเบียนได้เมื่อเชื่อมบริการและสิทธิ์ครบ ยังไม่มี mutation ทะเบียน เอกสารกลางแบบ FileVersion/scan workflow/outbox หรือธุรกรรม 9 ระบบ ดู PORTAL_READINESS.md ไม่ถือ deployment preview เป็นการรับรองระบบทั้งโครงการ

พบชื่อไฟล์ .env ใน main ของ GitHub เดิม ไม่อ่านหรือแสดงค่า สาขาส่งมอบจะถอดไฟล์ออก แต่ประวัติยังอยู่ ให้เจ้าของบริการประเมิน/หมุน credential หากเป็นของจริงและจัดการประวัติตามแผนที่อนุมัติ ห้ามสรุปว่าไม่มี secret ในประวัติจาก pattern scan ของ worktree

เอกสารผู้ให้บริการที่ตรวจประกอบการตั้งค่า: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions , https://supabase.com/docs/guides/database/connecting-to-postgres , https://supabase.com/docs/guides/database/postgres/roles , https://supabase.com/docs/guides/auth/auth-mfa/totp
