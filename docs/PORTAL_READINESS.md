# ความพร้อม runtime หลังคำขอให้เว็บไซต์ใช้งานจริง

รุ่น 0.1 · 2026-10-09 · app/schema 0.7.0 · คำตัดสินเปิดจริงครบโครงการ: NO_GO

เอกสารบทก่อนเป็น specification และแผนเป็นส่วนใหญ่ ไม่ใช่ implementation ที่ผ่านตรวจรับ การพัฒนารอบนี้เริ่มจาก core เดิมและสร้าง portal จริง ไม่ถือว่าได้พัฒนาบท 07–72 ครบจากการมีไฟล์เอกสาร

| ระบบ | สิ่งที่เป็น runtime ในรอบนี้ | ส่วนที่ยังขาดก่อนตรวจรับ |
| --- | --- | --- |
| 1 บุคคล/หน้าที่ | หน้าค้น Person และชื่อที่มีผลจากข้อมูลกลาง ด้วย scope/RLS | แก้ไข ประวัติหน้าที่ workflow คำสั่งมีผล และอำนาจ |
| 2 หน่วยงาน/สนาม | หน้าค้น Organization และชื่อที่มีผลด้วย scope/RLS | แม่บทสนามรายรอบ สายสังกัด ที่ตั้ง และ projection ตามคำสั่ง |
| 3 การเรียน | เมนูและหน้าสาธารณะ ไม่มีข้อมูลเผยแพร่ | เนื้อหา pre/post lesson attempts คุณสมบัติผู้สอน |
| 4 คำขอ | เมนูติดตามและข้อจำกัดการเปิดข้อมูล | draft/revision/decision/activation/tracking/outbox |
| 5 สอบ | เมนูสาธารณะและพื้นที่ทำงาน | Candidate/Application/snapshot/eligibility/seat/score/release/export |
| 6 งบ | เมนูพื้นที่ทำงาน ปิด mutation | ledger exact decimal/approval/locking/reversal/report/period close |
| 7 พัสดุ | เมนูพื้นที่ทำงาน ปิด mutation | procurement/stock ledger/custody/loan/stocktake/disposal |
| 8 สารบรรณ | เมนูพื้นที่ทำงาน ปิด mutation | FileVersion/ACL/เลขทะเบียน/delivery/retention/evidence |
| 9 Excel | API deny by default ไม่มี importer อีกทะเบียน | template/bounded parser/staging/dry-run/atomic commit/recovery |

สิ่งร่วมที่ทำแล้ว: public navigation 7 เมนู, workspace navigation 9 เมนู, contact URL เดียว, login/password+verified TOTP ผ่าน Supabase API, server-side provider user validation, cookie HttpOnly, local session hash/revocation, timed role assignments, SQL scope ก่อน pagination, no-store private pages/API, จำกัด login form และ rate, fixed provider URL, TLS verify สำหรับ production DB, base API deny by default

สิ่งร่วมที่ยังค้าง: provider integration จริง, MFA enroll/reset/recovery, privileged provisioning audit/authorities, public field policies, file bytes/version/scan/ACL, workflows/jobs/outbox, monitoring/backup/restore, business UAT 9 ระบบ และ deployment authorization/owner ของข้อมูลจริง

## หลักฐานการตรวจ

ดู tests/results/portal-foundation-results.json และท้าย PROGRESS.md ผล build/unit/HTTP ไม่แทน provider/native/concurrency/UAT ห้ามเปลี่ยน TO VERIFY ให้เป็น Confirmed จากผล software tests

มี tests/database/portal.integration.ts สำหรับ PostgreSQL จริง และ workflow CI ให้รันกับฐานสมมติ ผลต้องอ่านจากรันจริง ไม่กรอกว่า PASS ล่วงหน้า

## แผนดำเนินการที่ยังเปิด

1. C02/เจ้าของบัญชีสร้าง Supabase และ Vercel staging แล้วตรวจ provider/role/TLS/login/revocation
2. C02 ทำบริการเอกสารกลางและ workflow/outbox ก่อน business module ที่ต้องหลักฐาน
3. O01–O09 กับ C02 พัฒนา module ตาม dependency และ UAT เดิม ใช้ Application ระบบ 5 ร่วมกับ importer 9 และ ledger งบร่วมกับพัสดุ
4. C03/owners ยืนยัน form/rules/authority/visibility/retention ที่ TO VERIFY โดยแนบหลักฐานและรุ่น
5. C01/ผู้รับผิดชอบจริงรับรอง UAT/security/restore และ deployment authorization ก่อน pilot

owner เป็นบทบาทเสนอ ยังไม่มีการแต่งตั้งหรือกำหนดเสร็จที่ยืนยัน ไม่เปิดข้อมูลจริงหรือเซ็นรับมอบแทนหน่วยงาน
