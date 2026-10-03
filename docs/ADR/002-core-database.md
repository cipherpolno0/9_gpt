# ADR 002 — ข้อมูลกลางทดลองบท 06

สถานะ: Accepted สำหรับ implementation ทดลองตามแผนที่ผู้ใช้อนุมัติ | 3 ตุลาคม 2569 | schema 0.6.0

## ขอบเขตและสัญญา

ต่อ repository เดิมที่ `5b47b0a` หลังบท05 ใช้ Prisma CLI/client/adapter-pg 7.10.0, Node24.19.0, pnpm11.28.2 และ PostgreSQL Compose18.6 ตาม ADR001 ไม่เปลี่ยน Next/Tailwind/Supabase ไม่มีบัญชีหรือใบสมัครอีกชุด และไม่สร้างครบ128ตารางล่วงหน้า

สร้าง19 models ใน schema `private`: ServiceActor, ReferenceCode, OrganizationType, Geography, Organization, Document, PolicyVersion, Person, PersonPrivate, PersonNameHistory, PersonContact, OrganizationNameHistory, AddressVersion, OrganizationContact, AcademicYear, FiscalYear, ExamType, ExamLevel, AuditLog ตาราง `audit_logs` ใช้ชื่อตาม MASTER; ที่เหลือ map snake_case

Prisma7 URL อยู่ใน prisma.config.ts, client ใน src/generated/prisma/client และใช้ PrismaPg config seeding อยู่ `migrations.seed` เรียก seed ชัดเจน ไม่พึ่ง migrate reset เรียก seed อัตโนมัติ ไม่ใช้ `db push` เปลี่ยนschema constraints/triggers/RLSผ่าน migrationเดียว `20261003130000_core_foundation`

## ลด dependency โดยรักษาแบบบท04

- ServiceActor เป็นทะเบียนต้นทางการบันทึก **ไม่มี login, password, person binding หรือ grants** สำหรับ local bootstrap เท่านั้น บท06ยังไม่มี auth.users หรือ UserAccount จึงไม่สร้างบัญชีปลอมใน PostgreSQLเดี่ยว `created_by_actor_id`/`recorded_by_actor_id` FKมาที่นี่ เมื่อถึงบัญชีจริงเพิ่ม account provenance ด้วย migration และรักษาหลักฐานเดิม ไม่ถือ actor code/GUC เป็นสิทธิ์ธุรกิจ
- Document เป็น metadata หลักฐานสมมติร่วมกับทุกประวัติ มี ownerOrganization FK; ไม่มี upload/storage/download/scanner ไม่อ้างว่า METADATA_ONLY เป็นหลักฐานทางการหรือไฟล์ผ่านscanแล้ว
- PolicyVersion เป็นรุ่น configuration ปฏิทินทดลอง มีสถานะ TO_VERIFY และหลักฐาน FK กฎจริงต้องรับรองก่อน
- ReferenceCode เป็น code catalog ที่มี UUID + unique(code_set,code) triggerตรวจชนิดอ้างอิง ไม่ใช้ enum ที่เดากฎทางการ OrganizationType/ExamType/ExamLevel ยังคงตารางเฉพาะตามแบบบท04 ไม่มี ExamSession/application ในบทนี้
- Address ใช้ model AddressVersion / ตาราง address_version ตามแบบบท04 เก็บที่ตั้งหน่วยงานตามเวลา ข้อมูลที่อยู่ส่วนบุคคลอยู่ PersonPrivate; PersonContact กับ OrganizationContact แยกเจ้าของชัดตามแบบเดิม ชื่อกับที่ตั้งไม่ถูกใช้เป็น PK
- label_year_ce เก็บ **ปี label ค.ศ.** แทน display_year_be ในแบบlogicalเดิมตามพรอมป์ต์บท06 แปลง BEเฉพาะแสดงผล ไม่ถือ label เป็นปีของ starts_on เสมอ ปีงบ/ปีศึกษาเป็นคนละตารางและ ranges มาจากconfiguration สมมติ
- ไม่สร้าง user_account, hierarchy, education affiliation, scope, state events, requests หรือ snapshotสอบก่อนบทที่สั่ง Geographyไม่เป็นscopeหรือสายคณะสงฆ์ และไม่ได้อ้างบท06ทำประวัติธุรกิจทุกโมดูลครบ

## Constraints และสิทธิ์

UUID PK/RESTRICT FK; uniqueรหัสกลางไม่คืนรหัสเมื่อปิดใช้งาน ไม่มี uniqueชื่อบุคคล Composite unique ExamLevel(id,examTypeId) ให้รอบสอบบทถัดไปใช้ FKตรวจระดับกับประเภท

ใช้ date Gregorian สำหรับวันมีผล `[from,to)`; timestamptz(6) สำหรับ instant บันทึก มี superseded_at/replaces_id/evidenceDocumentId ในประวัติ ใช้ btree_gist exclusion เฉพาะcurrent knowledge ชื่อ/ที่ตั้ง/ช่องทางตามbusinesskey history content immutable ยกเว้น superseded_at และ replacementต้องเจ้าของ/ชนิดเดิมตามข้อมูลหลักฐานเดิม

ทุกตาราง ENABLE + FORCE RLS และไม่มีallow policies; ไม่มีpublic views/DTO/grants ไม่เชื่อค่า user-settable GUC เป็นauthorization ไม่มีruntimeDB queryใหม่ในเว็บ/worker Migration/seedใช้local privileged role แยกจากruntimeที่ยังปิด ฝั่งserver `/app`ยัง403 บทสิทธิ์ต้องเพิ่ม verified request context, limited role, scope+time และmaker-checkerผ่านmigration ก่อนได้ข้อมูลจริง

Audit triggerอยู่transactionเดียวกับwrite เก็บactor/correlation/target/ชื่อฟิลด์ ไม่เก็บก่อน-หลังหรือค่าข้อมูลส่วนตัว ห้ามUPDATE/DELETE audit และห้ามphysicalDELETEข้อมูลกลาง ปิดด้วยis_activeหรือsupersede ไม่มีพฤติกรรมretentionทางการที่เดา

เลือกindexตามการอ่าน: parentGeography, organizationType, mergedInto, history owner+kind+effectiveFrom, addressGeography, audit target/time กับactor/time UniquePK/indexesรองรับlookup FK/รหัสอยู่แล้ว ไม่สร้างindexทุกคอลัมน์ ไม่รับรองประสิทธิภาพหรือconcurrencyก่อนPostgreSQLserver/EXPLAINจริง

## การตรวจและข้อจำกัด

Native PostgreSQL18.4 ดาวน์โหลดเป็นเครื่องมือชั่วคราวนอกrepository แต่ initdbปฏิเสธroot และuid_map/gid_mapมีเฉพาะ0; runuser/setuidไม่ได้ DOCKER-05ยังเปิด จึงมี DB-06: ยังไม่มีผล `prisma migrate deploy + Prisma seed` กับPostgreSQLserver

เพิ่ม **dev dependency** `@electric-sql/pglite` **0.5.8** pinเต็มในlockfileเพื่อSQL checksที่รันได้โดยไม่daemon เป็นPostgreSQL18.3 WASMตามSELECTversionจริง ตรวจengines/แพ็กเกจไม่มีpeer conflict ไม่ใช่ฐานแอป ไม่เปลี่ยนเป้าหมายCompose18.6 ไม่มีAPI Prismaผ่านWASM adapter การreplayfixturesเป็นtest doubleเฉพาะscalar upsert ไม่เท่ากับPrisma seed test และsingle connectionไม่พิสูจน์concurrency native testsแยกอยู่tests/database/core.integration.ts

`pnpm db:test:sql`เปิดฐานWASMใหม่ในหน่วยความจำ รันmigrationทุกstatementและchecks ไม่แตะDATABASE_URL/production ส่วน `pnpm db:test` บังคับชื่อฐานtestบนloopbackก่อนPrisma deploy และทดสอบจริง รอเครื่องที่รองรับก่อนผ่านAC06

## แหล่งทางการที่อ่าน

- [Prisma7 seeding](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding)
- [Prisma migration editing](https://www.prisma.io/docs/orm/migrations/editing-a-migration)
- [Prisma multi-schema](https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/multi-schema)
- [PostgreSQL18 RLS](https://www.postgresql.org/docs/18/ddl-rowsecurity.html)
- [PGlite source/documentation](https://github.com/electric-sql/pglite) และ [getting started](https://pglite.dev/docs/)

ข้อเลือกและข้อจำกัดข้างต้นเป็นการตัดสินใจโครงการ ไม่ใช่ข้อรับรองกฎทางการหรือproduction
