# ความพร้อม runtime หลังคำขอให้เว็บไซต์ใช้งานจริง

รุ่น 0.3 · 2026-10-09 · app/schema 0.8.0 · คำตัดสินเปิดจริงครบโครงการ: NO_GO

เอกสารบทก่อนเป็น specification และแผนเป็นส่วนใหญ่ ไม่ใช่ implementation ที่ผ่านตรวจรับ การพัฒนารอบนี้เริ่มจาก core เดิมและสร้าง portal จริง ไม่ถือว่าได้พัฒนาบท 07–72 ครบจากการมีไฟล์เอกสาร

| ระบบ | สิ่งที่เป็น runtime ในรอบนี้ | ส่วนที่ยังขาดก่อนตรวจรับ |
| --- | --- | --- |
| 1 บุคคล/หน้าที่ | หน้าค้น Person และชื่อที่มีผลจากข้อมูลกลาง ด้วย scope/RLS | แก้ไข ประวัติหน้าที่ workflow คำสั่งมีผล และอำนาจ |
| 2 หน่วยงาน/สนาม | หน้าค้น Organization และชื่อที่มีผลด้วย scope/RLS | แม่บทสนามรายรอบ สายสังกัด ที่ตั้ง และ projection ตามคำสั่ง |
| 3 การเรียน | เมนูและหน้าสาธารณะ ไม่มีข้อมูลเผยแพร่ | เนื้อหา pre/post lesson attempts คุณสมบัติผู้สอน |
| 4 คำขอ | wizard/r่าง/ส่งกลับ/คิวตรวจ/อนุมัติทดลอง, revision/maker-checker/idempotency/outbox | ประเภทคำขอจริง, impact, activation/history/amendment/public tracking และ UAT |
| 5 สอบ | เมนูสาธารณะและพื้นที่ทำงาน | Candidate/Application/snapshot/eligibility/seat/score/release/export |
| 6 งบ | เมนูพื้นที่ทำงาน ปิด mutation | ledger exact decimal/approval/locking/reversal/report/period close |
| 7 พัสดุ | เมนูพื้นที่ทำงาน ปิด mutation | procurement/stock ledger/custody/loan/stocktake/disposal |
| 8 สารบรรณ | บริการ Document/FileVersion/ACL/upload/quarantine/scan adapter กลาง; หนังสือยังปิด mutation | เลขทะเบียน/delivery/retention/signing/เจ้าหน้าที่ UAT และ scan/storage จริง |
| 9 Excel | API deny by default ไม่มี importer อีกทะเบียน | template/bounded parser/staging/dry-run/atomic commit/recovery |

สิ่งร่วมที่ทำแล้ว: public navigation 7 เมนู, workspace navigation 9 เมนู, contact URL เดียว, login/password+verified TOTP ผ่าน Supabase API, server-side provider user validation, cookie HttpOnly, local session hash/revocation, timed role assignments, SQL scope ก่อน pagination, no-store private pages/API, จำกัด login form และ rate, fixed provider URL, TLS verify สำหรับ production DB, base API deny by default

สิ่งร่วมที่ยังค้าง: provider integration จริง, MFA enroll/reset/recovery, privileged provisioning/authorities, public field policies, storage/scan daemon/worker host จริง, monitoring/backup/restore, business UAT 9 ระบบ และ deployment authorization/owner ของข้อมูลจริง; file versions/ACL/generic workflow/outbox มี implementation และ native CI แล้ว

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

## รอบ staging และ shared services 2026-10-09

Supabase/Vercel connector ติดตั้งและเชื่อมแล้ว ไม่ใช่ blocker ว่าไม่มีบริการอีกต่อไป ผู้ใช้เลือกสร้าง Supabase staging ใหม่ใน cipherpolno0 ฐานเดิมมี public schema ที่ใช้งานแล้ว จึงไม่ apply private core เพื่อเลี่ยงทะเบียนกลางซ้ำ ขั้นสร้างใหม่ติด get_cost UNAVAILABLE (`MCP tool get_cost was not returned by tools/list`) ก่อน cost confirmation ไม่ปลอม confirmation ID/ราคา

Vercel สร้าง project9-gpt-stagingแล้ว ตั้ง preview APP_ENV=staging/PORTAL_DATA_MODE=SYNTHETIC สำเร็จ ใช้ account context ที่สร้าง project; accountId ที่เริ่ม team_ ไม่ใช่หลักฐานว่า token มี team scope การใส่ teamId นั้นได้403และแก้โดยใช้ personal project context เดิม ไม่เปลี่ยนปลายทาง Preview/build/nativeCI ให้ดูผลล่าสุด ไม่ถือว่า project/env คือ deploymentพร้อมDB

ส่งมอบร่วม: [SHARED_WORKFLOW_SETUP](SHARED_WORKFLOW_SETUP.md), [UAT_SHARED_WORKFLOW](UAT_SHARED_WORKFLOW.md), migration20261009190000_documents_workflow เพิ่ม10models รวม35 ใช้ Person/Organization/Document/PolicyVersion/UserAccount/RoleAssignmentเดิม ไม่สร้าง loginหรือApplicationชุดที่สอง คำอนุมัติทดลองไม่เปลี่ยนทะเบียน ไม่มีข้อความว่า digital signature สำเร็จ

กฎจริง/ฟอร์ม/ผู้มีอำนาจและ UAT เจ้าหน้าที่ยัง PENDING/TO VERIFY ขั้นถัดไปปิด blockerสร้างฐานแยก/credentialsในsecretstore/privatebucket/daemon/workers แล้วตรวจ provider login/MFA/revocation/browserUAT บริการกลาง จากนั้นพัฒนา activation, Application/seat/import, ledgerงบ-stock และสารบรรณตามdependencyเดิม ไม่เปิดจริงครบ9หรือข้ามบท70–72


## หลักฐาน CI และข้อขัดข้อง deployment ที่ตรวจแล้ว

2026-10-09 source commit 5938b96091726a5528d0f60457ab4ebffddfbb33: [GitHub Actions run37981290444](https://github.com/cipherpolno0/9_gpt/actions/runs/37981290444) job113992168809 completed/success ทุกขั้น ใช้ Ubuntu24.04 Node24.19.0 pnpm11.28.2 PostgreSQL18.6 ฐานสมมติแยก; migration3ชุดผ่าน unit27/27 native PostgreSQL32/32 (รวม parent tests) build/HTTP35/lint/typecheck/schema/supported-pattern scanผ่าน หลักฐาน native รวมสอง connectionอนุมัติแข่งได้หนึ่งคำตัดสิน, keyซ้ำได้หนึ่งร่าง, injected outboxfailure rollbackทั้งstatus/decision/audit/receipt และconsumerretryไม่ซ้ำ ผลนี้ปิด PENDING_RUN ของบริการร่วม ไม่แทน concurrency ledger/seat/stock/import ที่ยังไม่มี runtime

Vercel project9-gpt-stagingมีจริง แต่ยังไม่มี READY deployment: dpl_GQoDFw21MgrDWG7QqTXAqrh5Y5Lb ส่ง target preview แต่ providerรายงาน production/ERROR git_info_failก่อนbuild; ไม่มีการเผยแพร่สำเร็จ การลองไม่ระบุtargetถูก automatic approval reviewปฏิเสธเพราะเสี่ยงผิดenvironment ไม่ได้ดำเนินการ จากนั้นใช้ target staging ตาม APIโดยตรง ได้ dpl_2RSe9jvVxqbH8ttEFX17S2hpz3ao reported staging/ERROR git_info_failเช่นกัน การส่ง source filesจากcommitเดิมพร้อมmanifestSHA2563196558170df663340308b477ad30b59186a91c11d9853a79c0f612fb148986eถูกขัดจังหวะ; inventoryหลังเหตุการณ์ยังมีเพียงสองdeploymentที่ERROR ไม่อ้างว่าส่ง/buildสำเร็จ ยังไม่มี staging HTTPsmoke หรือproviderlogin/PlaywrightUAT ไม่ปิดSSO protection

Supabase get_costยังUNAVAILABLEในการตรวจซ้ำครั้งที่3 จึงไม่มีราคา/costconfirmation/projectใหม่ ไม่แก้ฐานเดิม ต้องใช้ช่องทางproviderที่ยืนยันราคาและสิทธิ์ได้ Browser fallbackยังไม่ได้เริ่ม: กติกาเครื่องมือกำหนดให้ผู้ใช้อนุมัติก่อนเมื่อconnectorไม่เพียงพอ ownerUATยังPENDING_OWNER all9NO_GO

app/schema0.8.0 models35 migrations3SHAเดิมตามshared-workflow-results.json ไม่เปลี่ยนschemaในรอบบันทึกหลักฐานนี้ ขั้นต่อไปปิดproviderdeployment/DB/credential/privatebucket/scan/workers แล้วรันMFA/revocationและbrowserUATบริการกลาง จากนั้นพัฒนาธุรกรรมทั้ง9ตามPORTAL_READINESSและทบทวนบท70–72 ไม่เลื่อนไปบท73 ไม่เซ็นแทนเจ้าหน้าที่
