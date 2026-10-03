# ฐานข้อมูลกลางทดลอง — บท 06

รุ่น schema 0.6.0 | migration `20261003130000_core_foundation` | 3 ตุลาคม 2569

**สถานะ: สร้างและตรวจ schema/SQL แล้ว แต่ยังไม่ผ่านการตรวจรับ PostgreSQL แบบ server** ดู DB-06 ด้านล่าง บท05มี blocker Docker เดิม จึงไม่อ้าง migration/Prisma seed จริงผ่านหรือเริ่มบทถัดไป

## 1 แนวคิดทีละขั้น

1. Person คือรหัสตัวตนกลาง หน้าที่ผู้สอน เจ้าหน้าที่ และผู้สมัครในอนาคตจะอ้างคนเดียวกัน ชื่อไม่ใช่รหัสและไม่ใช้ชื่อคล้ายเพื่อmerge PersonPrivateเป็นข้อมูลส่วนตัวแยกหนึ่งรายการต่อPerson ไม่มีเลขประชาชนในschemaบทนี้
2. Organization คือรหัสหน่วยงานกลาง ส่วนชื่อ ที่ตั้ง และช่องทางติดต่ออยู่ในตารางประวัติ Geographyเป็นพื้นที่ค้นหาเท่านั้น สองหน่วยอยู่พื้นที่เดียวกันได้ ไม่อนุมานสายปกครอง/สังกัดการศึกษา/สิทธิ์จากที่อยู่
3. UUID คือรหัสรายการที่ไม่ผูกชื่อหรือเลขบัตร FKป้องกันอ้างบุคคล/หน่วย/หลักฐานที่ไม่มี Uniqueป้องกันรหัสซ้ำ และRLSปิดการเข้าถึงทุกตารางจนกว่าจะพัฒนาบัญชีและสิทธิ์
4. วันมีผลกับวันบันทึกต่างกัน: `effective_from/effective_to` เป็นวันไทยแบบdate Gregorian, `recorded_at` เป็นinstant เมื่อแก้ชื่อให้supersedeรุ่นเดิมแล้วเพิ่มรุ่นใหม่ในtransactionเดียว ไม่แก้เนื้อหาเก่า
5. ปีศึกษาและปีงบมีคนละตาราง เก็บ label_year_ce เป็นค.ศ.และแปลง+543เฉพาะแสดงผล วันเริ่ม/สิ้นเป็นค่าจากconfiguration ตัวอย่าง seedไม่ใช่ปฏิทินทางการ

ดูแบบ128ตารางใน ERD/DATA_DICTIONARY ของบท04 และ [ADR002](ADR/002-core-database.md) สำหรับขอบเขต19modelsที่ทำจริงกับส่วนยังรอ ไม่มีlogin/applicationอีกชุด Documentเป็นmetadataสมมติ ไม่ใช่บริการไฟล์พร้อมใช้

## 2 เตรียมเครื่อง

ใช้ [SETUP](SETUP.md) สำหรับ Windows/macOS/Linux ติดตั้ง Node24.19.0 pnpm11.28.2 และDocker Desktop/Engineก่อน บนWindowsให้รันชุดคำสั่งต่อไปในPowerShellหรือterminal VS Code; ไม่มีการตั้ง environment แบบshellเฉพาะOSในคำสั่งนี้ เพราะค่าอยู่ `.env` ในเครื่องตนเอง

```bash
pnpm install --frozen-lockfile
pnpm env:init
pnpm services:up
pnpm db:validate
pnpm db:generate
```

เปิด `.env` ในVS Code ใช้รหัสผ่านlocalที่env:initสร้างเอง ไม่ส่งURL/password/tokenในแชต ตรวจCH06_DATABASE_URL และCH06_TEST_DATABASE_URL ให้password/portตรงPOSTGRES_PASSWORD/POSTGRES_PORTของCompose ไม่คัดลอกcredentialproductionมาใช้

ค่าที่ต้องมี (ตัวอย่างเป็นplaceholderเท่านั้น):

```dotenv
APP_ENV=local
CH06_DATABASE_URL=postgresql://postgres:CHANGE_THIS_LOCAL_ONLY@127.0.0.1:5432/sangha_ch06_demo
CH06_TEST_DATABASE_URL=postgresql://postgres:CHANGE_THIS_LOCAL_ONLY@127.0.0.1:5432/sangha_ch06_test
```

**สำคัญ:** .env เดิมจากบท05จะยังไม่มีสองตัวแปรนี้ env:initไม่เขียนทับไฟล์เดิม ให้เพิ่มเองจาก.env.exampleและใช้รหัสผ่านlocalเดิม ตัวอย่างCH06URLจากenv:initใหม่จะได้รับรหัสผ่านเดียวกับCompose DATABASE_URLยังเป็นruntimeplaceholderบท05 เว็บไม่queryDBผ่านrolepostgres บทสิทธิ์ต้องตั้งlimited roleจริงก่อนใช้

## 3 สร้างฐานใหม่ migration และ seed

```bash
pnpm db:new:local
pnpm db:migrate:local
pnpm db:seed
pnpm db:seed
pnpm db:status
```

- db:new:localสร้างฐานเฉพาะที่ยังไม่มี หากมีอยู่เก็บไว้ ไม่DROP/RESET/TRUNCATE
- db:migrate:localตรวจloopback+ชื่อฐานก่อนเรียกPrisma migrate deploy จากไฟล์migration มีBEGIN/COMMIT เพื่อไม่ทิ้งschemaครึ่งชุด หากล้มเหลวให้ตรวจสาเหตุและPrisma migration statusก่อนจัดการfailed migrationบนฐานทดลอง ห้ามแก้SQLที่เคยdeployสำเร็จแล้ว
- db:seedใช้PrismaPgและgeneratedPrisma7client ชุดข้อมูล41รายการ: actor1/reference7/orgtype1/geography2/org2/document1/policy1/ประวัติหน่วยงาน6/person3/private3/name3/contact3/ปีศึกษา2/ปีงบ2/examtype1/examlevel3 เกิดaudit41recordsจากseedครั้งแรก ทุกชื่อระบุสมมติ รหัสDEMO_* อีเมล@example.invalid ไม่มีเลขบัตร วันเกิด เบอร์โทร หรือที่อยู่จริง
- seedใช้UUIDจากkeyคงที่, upsert(update={}), transactionเดียวและadvisory lock รันซ้ำไม่overwriteข้อมูลเดิมหรือเพิ่มauditซ้ำ ความพร้อมกันผ่านPrisma/PostgreSQLserverยังต้องdb:test; replayWASMไม่ใช้แทนผลนั้น
- ถ้ารหัสหรือfixtureIDมีข้อมูลไม่ตรง ให้ตรวจในฐานทดลองหรือสร้างฐานใหม่ seedจะไม่แก้ประวัติให้เงียบ ๆ และ unique constraintsจะปฏิเสธbusinesskeyชนกัน

Prisma7 seedทำเมื่อเรียกชัดเจนเท่านั้น ไม่เรียกอัตโนมัติหลังmigration [ตามเอกสารPrisma7](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding)

## 4 เริ่มทดลองใหม่โดยไม่แตะฐานเดิม

ไม่ใช้ `prisma migrate reset`, `db push` หรือ `docker compose down -v` เปลี่ยนCH06_DATABASE_URLใน.envให้เป็นฐานใหม่ เช่น `sangha_ch06_demo_round2` (host/port/passwordlocalเดิม) แล้วรันdb:new:local → db:migrate:local → db:seedตามข้อ3 เก็บฐานเก่าไว้ตรวจประวัติ/หลักฐาน ไม่ส่งชื่อproductionเข้าscriptใด

Scriptsบังคับ APP_ENV=local/test, hostlocalhost/127.0.0.1/[::1], ไม่มีquery/hash, ชื่อdemo `sangha_ch06_demo` หรือsuffixอักษรเล็ก/ตัวเลข ฐานtestsใช้ `sangha_ch06_test` กับsuffixแบบเดียวกัน ปฏิเสธproduction/Supabase/ชื่อpostgres/sangha_local ไม่มีคำสั่งลบฐาน แม้ชื่อมีloopbackก็ควรใช้เฉพาะเครื่องทดลองที่ตรวจว่าไม่มีproductionforwarding

## 5 วิธีตรวจรับ PostgreSQL แบบ server

```bash
pnpm db:test
pnpm db:validate
pnpm check
pnpm smoke
```

db:testใช้CH06_TEST_DATABASE_URL ไม่ใช้DATABASE_URLหรือฐานdemo สร้างฐานtestหากยังไม่มี แล้วdeploymigration หากฐานมีข้อมูลต้องมีmigrationบท06สำเร็จตรงรุ่นและไม่มีกลุ่มตารางอื่น ชุดconstraints testsใช้ROLLBACKทุกกรณี เก็บเฉพาะfixture41รายการไว้ทดสอบซ้ำ ไม่ลบฐานหรือdata

ตรวจ12กลุ่มจริงและtestครอบรวม13tests: seedซ้ำ/พร้อมกัน, Prismaอ่านPersonร่วม, unique, FK, reference domain/ช่วงปี, immutable/overlap, supersession, softdelete/audit, geographycycle, auditprivacy/rollback, RLSlimitedrole, SQL/JavaScriptวันไทย ผู้ใช้ฐานtestต้องมีสิทธิ์CREATE DATABASE/ROLE/extensionสำหรับการตรวจ bootstrapเท่านั้น limitedroleprobeNOLOGINสร้างในtransactionและROLLBACK ไม่สร้างบัญชีผู้ใช้จริง

ในการรันครั้งแรกต้องใช้ฐานชื่อใหม่ที่ว่าง จึงพิสูจน์ migrationจากemptyPGได้ ถ้าฐานtestมีอยู่เดิมผลนั้นเป็นrerun ไม่อ้างเป็นclean migration; ใช้suffixใหม่แล้วรันอีกครั้งเพื่อหลักฐานclean

## 6 การตรวจ SQL โดยไม่ต้องเปิด server

```bash
pnpm db:test:sql
```

ใช้devdependencyPGlite0.5.8 (PostgreSQL18.3WASMตามversionจริง) ฐานใหม่ในmemory ไม่มีnetwork/credential ใช้ไฟล์migrationจริงกับfixturereplay ตรวจ SQL/triggers/FK/unique/RLS/timezone เป็น12testsรวมtestครอบ **ไม่ใช่ Prisma migration deploy/PrismaPg seed test** และไม่พิสูจน์concurrency/network/volume/Compose18.6/Supabase

PGliteใช้PostgreSQLที่คอมไพล์เป็นWASMและsingle connection [เอกสารต้นทาง](https://github.com/electric-sql/pglite) ไม่เปลี่ยนฐานแอปไปWASM

## 7 วันเวลาและปี พ.ศ.

| ประเภท | ฐานข้อมูล | วิธีใช้ |
| --- | --- | --- |
| Instant | timestamptz(6) | ส่งISO8601ที่มีZ/offset แสดงAsia/Bangkokด้วยformatThaiInstant |
| วันมีผล/ขอบเขตปี | date ค.ศ. | YYYY-MM-DD, ขอบเขต[from,to) ห้ามparse03/10/69 |
| labelปี | label_year_ce integer | ใช้buddhistYearตอนแสดง ไม่เก็บ2569ซ้ำ |
| วันที่จากPrismaDATE | Dateที่UTCmidnight | formatThaiDateOnlyรักษาส่วนวัน ไม่ตีความเป็นdeadline |
| หน้าต่างวันไทย | dateสองค่าแปลงinstant | bangkokDayStart/isWithinBangkokDays; ปลายสิ้นไม่รวม |

โค้ดใช้ร่วม `src/shared/dates/bangkok.ts` ตัวอย่าง: `2026-12-31T16:59:59.999Z`ยัง31ธ.ค.2569 แต่`2026-12-31T17:00:00Z`คือ1ม.ค.2570เวลา00:00ไทย วันเริ่มปีศึกษา/ปีงบจากseedเป็นสมมติQ017ยังเปิด ไม่ใช้ปฏิทินนี้ตัดสินสิทธิ์จริง

## 8 RLS audit และข้อมูลส่วนตัว

ทุกตารางอยู่private ENABLE/FORCE RLS ไม่มีallowpolicy/publicviewหรือDTOอ่านPersonPrivateจากหน้าเว็บ; contacts/addresses/namesก็ปิด ไม่exposeprivate schemaในSupabaseAPI สิทธิ์runtimeยังdeny by defaultทั้งserver403และdatabase ไม่อ้างว่าการใช้postgres/secretservicecredentialข้ามRLSคืออำนาจธุรกิจ

Auditต้องมีapp.service_actor_idกับapp.correlation_idในtransaction seedตั้งเองเพื่อprovenanceเฉพาะlocal ค่านี้ไม่ใช่verified authcontext และไม่มีRLSpolicyที่ใช้อนุญาตอะไร บทบัญชีต้องเพิ่มaccountactorจากserverตรวจแล้ว role+scope+เวลา ทุกช่องทาง/worker และmaker-checker ไม่เปิดruntimegrantบทนี้

Migrationติดตั้งbtree_gistสำหรับhistoryexclusionและfunctionsในprivate REVOKEสิทธิ์PUBLIC function ยกเว้นmigration/seedผู้มีสิทธิ์ ใช้updated_at/row_versionจากtrigger ป้องกันเปลี่ยนcreationfields historyแก้เฉพาะsuperseded_atพร้อมauditแล้วinsertreplacement FKRESTRICTรักษาการอ้างอิง ห้ามUPDATE/DELETEaudit/physicalDELETE ถ้าต้องretentionจริงรอQ016/Q025; superuser/ownerที่มีDDLยังต้องถูกจำกัดแยกจากruntime

## 9 DB-06 — blocker และวิธีปิด

เครื่องนี้LinuxUbuntu24.04 uid0, uid_map/gid_mapมีเพียง0:0:1 ไม่มีDockerdaemon NativePostgreSQL18.4 `initdb`คืนexit1 `cannot be run as root`; `runuser`คืน`cannot set groups: Operation not permitted`; os.setuid(65534)คืนEINVAL ไม่มีฐานPostgreSQLแบบserverเปิดขึ้น `pnpm db:test`กับloopback5546คืนexit1เชื่อมต่อไม่ได้

ผลที่ผ่าน: schema validate/generate; unit/date/guard tests; SQLWASM migration+fixturereplay+constraints ยังไม่ได้รันPrisma migrate deploy, db:seedด้วยPrismaPg, concurrency, worker/Redis/volume/PostgreSQL18.6กับserverจริง

C02ใช้เครื่องDockerพร้อมหรือnativePGที่รันด้วยผู้ใช้ทั่วไป สร้างฐานtestชื่อใหม่ รันข้อ5และบันทึกversion/ผลPASSพร้อมmigrationchecksumโดยไม่ส่งcredential ปิดDB-06ได้เมื่อหลักฐานnativeintegrationครบ DOCKER-05ยังต้องตรวจRedis/worker/volumeแยก ก่อนปิดอย่าเลื่อนไปบทถัดไปที่พึ่งฐานข้อมูล
