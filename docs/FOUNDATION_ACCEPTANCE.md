# ตรวจรับส่วนกลางก่อนเริ่มระบบเฉพาะ — บท 12

รุ่นเอกสาร 1.0 | ตรวจวันที่ 3 ตุลาคม 2569 เวลาไทย | source ที่ทดสอบ: commit `9ded24d`

**ผลรวม: BLOCKED — ยังไม่พร้อมเริ่มระบบเฉพาะหรือ release ส่วนกลาง**

ส่วน starter ติดตั้งและตรวจโค้ด/build/HTTP ได้จริง แต่ prerequisite06–11ยังไม่ครบ ไม่มีบัญชี login, authz/DAL, บริการไฟล์, workflow หรือ outbox ที่ทำงานได้ จึงไม่ใช้ผล starter ผ่านแทนเส้นทางธุรกิจครบชุด

## 1 วิธีอ่านผล

PASS ในเอกสารนี้ผูกกับขอบเขตที่ระบุเท่านั้น PARTIAL คือมีหลักฐานบางส่วน BLOCKED คือทำต่อไม่ได้เพราะ dependency และ NOT RUN คือยังไม่ได้ทดสอบจริง การเห็น schema/แบบร่าง/หน้าจอไม่เท่ากับบริการพร้อมใช้

ตรวจรับแยกสามขั้น: อ่าน implementation ที่มี → รันชุดตรวจที่มีจริง → เทียบกับเกณฑ์ของบทเต็ม พร้อมแจ้งสิ่งที่ชุดตรวจยังไม่ครอบคลุม ไม่สร้าง login หรือสิทธิ์จำลองเพื่อให้ smoke ดูเหมือนผ่าน

## 2 Prerequisite gate

| บท  | สิ่งที่พบจริง                                                                                                           | ผลก่อนตรวจรับส่วนกลาง               |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 06  | schema/seed/migration core; unit และ SQL WASM ผ่าน แต่ Prisma/PostgreSQL server ยังไม่ผ่าน                              | BLOCKED DB-06/Q027                  |
| 07  | bootstrap deny403 มีจริง แต่ไม่มี UserAccount/Role/Permission/Scope, authz/DAL หรือ role matrix runtime                 | BLOCKED                             |
| 08  | ไม่มี Auth.js/OIDC/session/revoke/account lifecycle; /login และ /api/auth/session ได้404                                | BLOCKED                             |
| 09  | มีหน้าแรก starter/ฟอนต์/ปุ่ม; มี wireframe บท03 แต่ไม่มี app shell9ระบบ/public CMS; browser responsive/focus ยังไม่ตรวจ | BLOCKED BROWSER-03 และ dependency08 |
| 10  | Document เป็น metadata; ไม่มี FileVersion/ACL/quarantine/scan/download/preview                                          | BLOCKED dependency08                |
| 11  | WORKFLOW_ENGINE0.1เป็น Proposal; audit trigger core มี แต่ไม่มี workflow/outbox/notification consumer                   | BLOCKED dependency07/10             |

## 3 Checklist การร่วมใช้

| ส่วนกลาง                              | ระดับความพร้อมจริง                            | หลักฐานและสิ่งที่ยังขาด                                                                                    |
| ------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| repository / 9โมดูล                   | พร้อมใช้สำหรับโครง starter                    | src/modules9โฟลเดอร์มีREADMEเท่านั้น ไม่มี package/login แยก; structure testผ่าน ไม่ใช่9ระบบใช้งานได้      |
| Person / Organization / ปี / Document | มี schema/seed เท่านั้น                       | Prisma coreกลาง19models; seedสมมติ ไม่ได้เปิดบริการอ่านหรือเขียนธุรกิจ                                     |
| application service ร่วมเว็บ/Excel    | มีข้อกำหนดเท่านั้น                            | exams/exam-imports README อ้างต้นทางร่วม ยังไม่มีทะเบียนใบสมัครหรือ importservice                          |
| account / authorization               | ยังไม่มี                                      | ไม่พบ login ซ้ำ แต่ก็ยังไม่มี login ที่ใช้ได้; /appทุกmethodปิด403/no-store ไม่ใช่ authz ตามผู้ใช้/พื้นที่ |
| app shell / public content            | มีหน้า starter และหน้าร่าง                    | หน้าแรกจริง200; /news/downloads/contact/registry ยัง404; wireframeไม่ได้ต่อฐาน ไม่มี CMS                   |
| documents                             | มี metadata เท่านั้น                          | ไม่สามารถอัปโหลด/สแกน/preview/download หรือใช้เป็นหลักฐานอนุมัติได้                                        |
| workflow / outbox                     | มีแบบออกแบบเท่านั้น                           | WORKFLOW_ENGINE ไม่ใช่ schema/บริการ; worker readinessไม่ใช่consumer                                       |
| audit / history                       | มี schema/trigger และ supplementary SQL tests | audit_logsอยู่ฐานกลางและ append-only; ยังไม่มีหน้าดูauditหรือ actorบัญชีที่เชื่อมsession                   |
| วันเวลาไทย                            | helper/unit พร้อมใช้ในงานต่อไป                | tests/datesผ่าน; ปีแสดง พ.ศ. แยกจากค่าเก็บมาตรฐาน ไม่รับรองปฏิทินทางการ                                    |
| กฎ/อำนาจ/เผยแพร่/retention            | ยังต้องยืนยัน                                 | Q002/Q005/Q006/Q008/Q011/Q016/Q017/Q023–Q027 ตาม OPEN_QUESTIONS; ไม่มีการเดาบุคคลหรือข้อกฎหมาย             |

## 4 Environment, schema และ versions

ใช้ clean copy จาก `git archive 9ded24d` ในโฟลเดอร์ใหม่ ไม่มี node_modules, .env, .next หรือ generated client เดิม สร้าง Gitในสำเนาตาม SETUP เพื่อให้ secret check ใช้ได้ ติดตั้งจาก lockfile ใช้ package cache ของเครื่องตามปกติ ไม่ใช่ผลทดสอบ offline/networkใหม่หรือOSอื่น

| รายการ                       | รุ่น/สถานะ                                                                |
| ---------------------------- | ------------------------------------------------------------------------- |
| Node / pnpm                  | 24.19.0 / 11.28.2 ผ่าน Corepack                                           |
| app / schema                 | 0.6.0 ไม่มี schema changes ในบท12                                         |
| Next.js / React              | 16.3.8 / 19.3.0                                                           |
| Prisma CLI/client/adapter-pg | 7.10.0 ทั้งชุด                                                            |
| migration                    | 20261003130000_core_foundation เพียง1ไฟล์; 19models/213scalarfields       |
| checksum migration           | 04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756          |
| SQL supplementary            | PGlite0.5.8, PostgreSQL18.3 WASM; ไม่ใช้แทน Prisma/server/concurrency     |
| PostgreSQL / Redisจริง       | ยังเปิดไม่ได้; Compose18.6/8.10.2เป็นรุ่นกำหนด ไม่ใช่ผลSELECTversion/PING |

ตรวจ environment รอบนี้ uid0, uid_map0:0:1 ไม่มีคำสั่ง Docker หรือ daemon socket ไม่มีฐานหรือ production ถูกแก้หรือเชื่อม

## 5 คำสั่งและผลที่รันจริง

ชุดสุดท้ายรันตามลำดับใน clean copy เดียวโดยหยุดเมื่อคำสั่งล้มเหลว ไม่มี build ที่แข่งขันกัน:

```bash
node --version
corepack pnpm --version
corepack pnpm install --frozen-lockfile
corepack pnpm env:init
corepack pnpm check
corepack pnpm smoke
```

env:init สร้างค่าทดลองสุ่ม ไม่แสดงค่าและไม่ส่ง.envเข้าGit การตรวจ dev เพิ่มเติมเปิดด้วย `corepack pnpm dev --port 3106` ส่วน smoke เดิมเปิด next start ที่3105 และ probeรุ่นbuildใช้3107 หยุดprocessทดสอบหลังจบ

| คำสั่ง/การตรวจ                        | ผลจริง                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| install --frozen-lockfile             | PASS 356packages; pnpm11.28.2                                                           |
| db:validate ใน check                  | PASS schema valid ไม่มีการเชื่อม server                                                 |
| lint ใน check                         | PASS ไม่มี warning/error                                                                |
| typecheck ใน check                    | PASS generatePrismaและtsc --noEmit                                                      |
| test ใน check                         | PASS 17tests รวม denybootstrap/โครง/วันไทย/local safety                                 |
| db:test:sql ใน check                  | PASS 12testsรวมwrapper; fixture replay41rows/audit41 ไม่ใช่ Prisma seedจริง             |
| format:check / secrets:check ใน check | PASS ตามไฟล์และแพตเทิร์นที่ตัวตรวจรองรับ                                                |
| build ใน check                        | PASS หน้า / และ /_not-found static; /app catchall dynamic                               |
| smoke                                 | PASS 27รายการจาก scripts/smoke.mjs ซึ่งมีอยู่เดิม ไม่แก้โค้ด                            |
| supplementary HTTP probe              | PASS 75responsechecksใน dev และ75ใน build; 28staticassets และ15prerender HTML/RSC files |
| db:test ฐานtestใหม่ที่loopback5546    | exit1 ก่อนmigration/integrationcases; BLOCKED DB-06 ไม่ใช่13native testsล้มเหลว         |
| worker:check                          | exit1 เชื่อมบริการlocalไม่ได้; ไม่มีผลworkerconsumer                                    |

db:testใช้ APP_ENV=test กับฐาน `sangha_ch06_test_foundation_20261003` และบัญชี setup_unconfigured บน127.0.0.1:5546 ไม่มี credentialproduction และไม่มีการสร้างฐานสำเร็จ

การเตรียมสำเนาครั้งแรกเรียก git archive ผิดcwdและเริ่ม Corepackนอกpackage ทำให้เลือกรุ่นpnpmผิด จากนั้นมี checkสองprocessในสำเนานั้นจนหนึ่งbuildชนlock จึงยุติการใช้สำเนานั้นและสร้าง clean copyใหม่สำหรับชุดสุดท้าย ผล PASS อ้างชุดสุดท้ายเท่านั้น ไม่แก้ engines หรือข้อกำหนดรุ่นให้ผ่าน

probeครั้งแรกตรวจ Cache-Control ผ่าน dictionaryที่ไม่ได้normalizeชื่อheaderจึงรายงานผิด ได้แก้เครื่องมือชั่วคราวให้ชื่อheaderเป็นlowercaseและรันใหม่ทั้งชุด ไม่พบข้อผิดพลาดของแอปที่ต้องแก้จากกรณีนี้

## 6 Private data: สิ่งที่ตรวจได้และขอบเขตที่ยังไม่ได้พิสูจน์

เครื่องมือ probe ชั่วคราวอยู่นอกrepository ไม่ใช่ regressiontestที่commit ตรวจหน้าแรก, 404ของ/login/registry/news/downloads/contact/api/auth/session/api/documents/example/หน้าที่ไม่มี และคำขอCache-Control:max-age=0 รวม RSCหน้าแรก ทั้งdevและbuild

ตรวจ /app, /app/people/{fixture_id}, /app/requests?org_id={fixture_id}, /app/documents/example, /app/notifications, /app/audit, /app/admin และ /app/exams/imports ด้วย GET/POST/PUT/PATCH/DELETE/OPTIONS/HEAD รวม body ที่ส่ง org_id/action ทุกกรณี403/no-store ข้อสรุปคือ bootstrapปิดพื้นที่ทั้งหมดจริง ไม่ใช่ผู้ใช้จังหวัดAถูกแยกจากจังหวัดBหลังlogin

ค้น marker ของ DEMO_PERSON, ชื่อ/อีเมลสมมติ, UUIDของPerson/PersonPrivate/ชื่อ/ช่องทาง รวมตัวบ่งชี้secretและค่าlocalURL/passwordจริงใน.env โดยไม่พิมพ์ค่า ตรวจทั้งUTF-8และรูปunicode escape ในresponse, prerender HTML/RSC และstaticassetsทุกไฟล์ที่fetchจากbuildได้: พบ0hits ไม่มีpublic folderในsourceและไม่มีไฟล์ผู้สมัคร

ข้อรับรองจำกัดเฉพาะstarterที่ไม่มีDBquery/privateข้อมูลในเว็บนี้ ค่าcacheของหน้าpublicอาจเป็นstatic/cacheableได้เพราะมีแต่เนื้อหาคงที่ การส่งmax-age=0และค้นbuildfilesไม่ใช่การพิสูจน์CDN cache isolation หรือNextdata cacheของข้อมูลผู้ใช้ ยังไม่มีการseedprivate canaryลงserver, loginสองบัญชี, revoke, DTO, export/download หรือ cacheหลังเปลี่ยนสิทธิ์ จึงไม่ปิดเกณฑ์ private data ของส่วนกลางเต็มระบบ

## 7 Smoke flow เต็มที่ต้องผ่าน — BLOCKED / NOT RUN ทุกขั้น

| ขั้น                       | วิธีตรวจเมื่อ dependencyพร้อม                                   | หลักฐานที่ต้องได้                                                                         |
| -------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| F12-FLOW-01 login          | บัญชีสมมติ requesterA/reviewerA/outsiderBจากproviderเดียว       | sessionจริง; สถานะบัญชี/สิทธิ์ปัจจุบันผ่านDAL                                             |
| F12-FLOW-02 หน้างาน        | requesterAเข้าscopeA แล้วเปลี่ยนURL/body/queryเป็นscopeB        | อ่านAได้ Bถูกปฏิเสธ แม้เรียกAPIตรง                                                        |
| F12-FLOW-03 ส่งเรื่อง      | สร้างdraftและsubmitด้วยcommandkeyเดิมซ้ำ                        | มีคำขอเดียวและpinรุ่นกฎ/resource/evidence                                                 |
| F12-FLOW-04 ไฟล์           | uploadสมมติ retry, ไฟล์ปลอม/เกินขนาด/ยังscanไม่ผ่าน             | quarantine/ปฏิเสธ; ไม่มีdownload/previewก่อนผ่าน; retryไม่เพิ่มเอกสารใช้จริง              |
| F12-FLOW-05 ตรวจอนุมัติ    | reviewerAตรวจรุ่นเก่า/ผู้สร้างอนุมัติเอง/หลักฐานหมดACL          | conflictหรือdeny; ผ่านได้เฉพาะผู้มีอำนาจกับรุ่นล่าสุด                                     |
| F12-FLOW-06 ผลและแจ้งเตือน | effectiveตามเวลา; หยุดworkerก่อน/หลังcommitแล้วคืนงาน           | ทะเบียน/audit/outboxสอดคล้อง; notification/devsinkหนึ่งรายการต่อdedupekey ไม่มีส่งออกจริง |
| F12-FLOW-07 ย้อนaudit      | ผู้ตรวจสอบที่มีscopeดูactor/version/เหตุผล/evidence/correlation | append-onlyและไม่มีsecret; outsiderอ่านไม่ได้                                             |
| F12-FLOW-08 revoke/cache   | ถอนสิทธิ์/ระงับ/sessionหมดอายุแล้วเรียกAPI/export/file/jobซ้ำ   | denyตามบัญชีและสิทธิ์ล่าสุด; private canaryไม่อยู่ในHTML/RSC/cache/assets                 |

ไม่มี user_account หรือrealmสมมติที่ใช้งานได้ จึงไม่ได้ทำขั้นแรกและไม่ได้ข้ามไปใช้ServiceActorแทนผู้ใช้ รายการนี้เป็นแผนตรวจรับ ไม่ใช่testที่ผ่านแล้ว

## 8 เกณฑ์บท12และขั้นตอนต่อไป

การตรวจเอกสารรอบสุดท้าย: `git diff --check` และ local link targets ผ่าน พบ `.prettierignore` ข้าม `docs/*.md` ตามการรักษาเอกสารเดิม จึงตรวจ README กับรายงานใหม่นี้โดยตรงด้วย `corepack pnpm exec prettier --ignore-path /dev/null --check README.md docs/FOUNDATION_ACCEPTANCE.md` ไม่ใช้ผล format:check อ้างว่าตรวจเอกสารเดิมทุกไฟล์

| เกณฑ์                                                        | ผลรวม                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| typecheck/lint/build/smoke บนdevตั้งค่าจากREADME             | PARTIAL: starterทั้งหมดผ่านจากclean copy รวมdevHTTP แต่smokeflowส่วนกลางเต็ม BLOCKED |
| private dataไม่อยู่ในpublic response/HTML/cache/staticassets | PARTIAL: markerprobeของstarterผ่าน; privateDB/session/cacheข้ามผู้ใช้ NOT RUN        |

ไม่พบปัญหาโค้ดstarterที่ต้องแก้จากchecksชุดสุดท้าย ปรับREADMEให้เข้าถึงผลตรวจรับและวิธีใช้Corepackรุ่นถูกต้อง อัปเดต TRACEABILITY/PROGRESS/DECISIONS/OPEN_QUESTIONS ไม่มีschema/package/lockfileหรือsmoke codeเปลี่ยน

ก่อนเริ่มโมดูลเฉพาะต้องปิดDB-06ตามDATABASE, ตรวจรับบท06, ทำ07ตามแผนเดิมที่อนุมัติ, 08, 09พร้อมbrowser/a11y, 10 และ11 แล้วรันชุดตรวจรับ12อีกครั้ง ไม่เลื่อนไปบท13จากผลstarter และไม่push/deployในรอบนี้
