# สัญญาข้อมูลผู้เรียน ผู้สมัคร และใบสมัคร — บท 35

รุ่น 0.1 | 4 ตุลาคม 2569 (2026-10-04) | source `fb346a0` | **Proposal / BLOCKED — ยังไม่มี Prisma models/migration/services บท35**

บท34ยังไม่ผ่านตาม [UAT_SYSTEM_04](UAT_SYSTEM_04.md) โมดูลexamsและexam-importsมีREADMEเท่านั้น coreไม่มีEnrollment/Candidate/Application/ApplicationSnapshot/FormTemplateRegistry/ExamSession/SessionLevel/CenterSessionLevel/User/RoleAssignment/WorkflowInstance/FileVersion จึงยังไม่เพิ่มDDLที่ขาดFK/ต้นทางสิทธิ์ เอกสารนี้เป็นlogicalcontract ไม่ใช่schemaที่รันPrisma validate/migrateได้

อ่าน [DATA_DICTIONARY](DATA_DICTIONARY.md), [EXAM_SESSIONS](EXAM_SESSIONS.md), [FORM_TEMPLATE_REGISTRY](FORM_TEMPLATE_REGISTRY.md), [APPLICATION_STATES](APPLICATION_STATES.md), [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md), [ADR002](ADR/002-core-database.md) ใช้ฐาน/Person/Organization/บัญชี/เอกสาร/ใบสมัครกลางร่วม9ระบบ

## 1 แยกตัวตนและการสมัคร

1. Person เป็นตัวคนกลาง Candidate เป็นบทบาทผู้สมัครหนึ่งรายการต่อPerson ไม่สร้างคนหรือcandidateใหม่ทุกปี ทุกประเภท หรือทุกช่องนำเข้า
2. Enrollment เป็นการขึ้นทะเบียนเรียนตามปี หน่วย แผนก/หลักสูตรที่รับรอง แยกจากApplicationซึ่งเป็นใบสมัครสอบ การมีEnrollmentไม่เท่ากับผ่านคุณสมบัติสอบหรือมีสิทธิ์เว็บ
3. Applicationหลายปีหรือหลายโอกาสสอบที่กฎอนุญาตเชื่อมCandidateเดียวกัน การแก้ชื่อ/ย้ายสังกัดปัจจุบันไม่เปลี่ยนหลักฐานใบสมัครเก่า
4. ApplicationSnapshotตรึงข้อมูลตอนส่งแต่ละรุ่นรวมแหล่ง/วันอ้างอิง การอนุมัติต้องอ้างรุ่นที่ตรวจ ไม่ใช้latest Person/Organization/form ruleมาสร้างปีเก่าใหม่
5. importerระบบ9เรียกapplicationserviceเดียวกับเว็บ ไม่สร้างCandidate/Application/loginหรือcandidate registryอีกชุด

LearningEnrollmentของระบบ3เป็นสิทธิ์/การเข้าหลักสูตรออนไลน์ตามแบบเดิม ไม่ใช่ใบสมัครสอบหรือEnrollmentทะเบียนการศึกษานี้ หากต้องเชื่อมให้typedreferenceผ่านPerson/Enrollmentที่รับรอง ไม่สร้างชื่อบุคคลหรือผลสอบทางการซ้ำ

## 2 Model contractเสนอ

UUID PK/FK, snake_case map, private schema/RLS deny by default, account provenance, row_version>=1, timestamptz/DATEตามชนิดและON DELETE RESTRICTตามความสัมพันธ์ ประวัติ/ธุรกรรมไม่harddelete ทุกmutationผ่านcurrentDALและaudit transaction ต้องmigrationใหม่ไม่แก้coremigrationเดิม

| Modelเสนอ            | ตาราง mapเสนอ          | ฟิลด์/ความสัมพันธ์ที่ต้องมี                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Candidate            | candidate              | id, person_id requiredFKPerson/unique, candidate_code uniqueรหัสภายใน, account provenance/row_version/is_active; unique(id,person_id)สำหรับcompositeFK ไม่เก็บชื่อ เลขประชาชน หรือเบอร์ซ้ำ Candidateไม่grant/eligibility                                                                                                                                                                     |
| Enrollment           | enrollment             | id, person_id FKPerson, organization_id FKOrganization, academic_year_id FKAcademicYear, education_branch_id FKกลาง13เมื่อพร้อม, program/offering bindingที่รับรอง, enrollment_no/status, valid_from/valid_until, recorded_atและprovenance; unique(id,person_id) คำขอสมัครเรียน/สถานะเรียนแยกจากapplication_status                                                                           |
| Application          | application            | id, candidate_id/person_id/enrollment_idที่ผูกคนเดียวกัน, exam_session_id/academic_year_id/exam_type_id/contextผ่านtypedbindings, session_level/offering/center_offering FKตาม21, registration_slotฝั่งserver, currentdraftrevision, submitted_snapshot_id, application_status, workflowbinding/receipt/policy/formversion refs, submitted_at/recorded_at/row_version/provenance             |
| ApplicationSnapshot  | application_snapshot   | id, application_id FK, version_no uniqueต่อใบสมัคร, captured_at/recorded_at/source_effective_on, sourcePersonName/OrganizationName/Affiliation/PersonStatus/address versionsตามpurpose, name-at-application/monastic-or-lay-status/educationstage/level/organization/academic-year/session/type/offering/pinnedform-and-rule versions, canonicalhash/sealed_at/recorded_by; immutableหลังส่ง |
| FormTemplateRegistry | form_template_registry | registryหนึ่งชุดตามแบบ04ร่วมO05/O09; template_code/version unique, official_form_reference nullableจนยืนยัน, verification/mode/issuance policy, typedtype-level-stage-purpose mapping, machine-schema/printlayout version, evidenceDocument/FileVersion/hash/issuer/approval/source dates/window/rights ตามเอกสารregistry                                                                    |

SessionOffering/CenterSessionOfferingเป็นชื่อbindingเสนอสำหรับช่วงชั้นตาม21 ไม่ใช่modelsที่มีแล้ว ต้องเชื่อมSessionLevel/CenterSessionLevelและcapacitypoolเดิม ไม่สร้างโควตาความจุซ้ำทุกช่วงชั้น Enrollmentที่จำเป็นต่อการสมัครต้องruleรับรอง หากเปิดโอกาสสอบที่ไม่ต้องEnrollmentต้องปรับlogical04/typedFKให้ชัด ไม่สร้างEnrollmentปลอมเพื่อให้submitผ่าน

Applicationไม่ได้เป็นตารางชื่อ/ที่อยู่ใหม่ free-textใช้เฉพาะsnapshotที่มีpurpose/sourcebinding ไม่แทนทะเบียนปัจจุบัน Snapshotfieldsส่วนตัวอยู่privateและallowlistตามหน้าที่ มีretention/legalpolicyไม่ถือเก็บPIIตลอดไป

บรรพชิต/คฤหัสถ์เป็นdimensionสถานะบุคคลตามรุ่นกลาง13 ไม่ใช้enumเดียวรวมสถานะมีชีวิต/เสียชีวิต/การจ้าง/คำขอหรือสถานะApplication ชื่อ/ฉายาตอนสมัครต้องsourceประวัติที่ยืนยัน ไม่กรอกใหม่เพื่อสร้างPersonซ้ำ สถานะบุคคลที่อาจมีผลต่อคุณสมบัติตรวจผ่านruleversionโดยเจ้าของรับรอง ไม่เดาว่าทุกประเภทห้ามหรืออนุญาตตามสถานะใด

Enrollment/Program refsต้องconfigurationที่ยืนยัน ไม่เอาช่วงชั้นประถม/มัธยม/อุดมแทนEducationBranchธรรม/บาลี/สามัญ/ปริยัตินิเทศก์ ระดับตรี/โท/เอกอ้างExamLevelภายใต้ExamTypeและช่วงชั้นเป็นofferingอีกมิติ ถ้าไม่มีช่วงชั้นใช้NOT_APPLICABLEจากconfiguration ไม่NULLในbusiness uniqueจนกันซ้ำไม่ได้

## 3 FKและvalidationที่เสนอ

| Constraint ref | สิ่งที่ต้องฐาน/service enforce                                                                                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K35-01         | unique Candidate.person_id และcandidate_code; candidate.person_idไม่ถูกเปลี่ยนเงียบ ๆ เมื่อมีApplication เปลี่ยนidentityใช้ขั้นตรวจคนซ้ำ/แก้ไขที่มีหลักฐาน ไม่mergeชื่อ/วันเกิดอัตโนมัติ             |
| K35-02         | compositeFK(candidate_id,person_id)→Candidate(id,person_id) และ(enrollment_id,person_id)→Enrollment(id,person_id) ไม่เอาคนอีกคนมาแนบใบสมัคร                                                          |
| K35-03         | Enrollment.organization/year/branch/program typedFKและช่วงมีผล valid_from<valid_untilเมื่อมีปลายช่วง ประวัติย้าย/เรียนซ้ำเก็บรุ่น/ช่วง ไม่updateorganizationเก่าให้ตามปัจจุบัน                       |
| K35-04         | ExamSession/AcademicYear/ExamType/context และSessionLevel/SessionOffering/CenterSessionOfferingต้องปี/ประเภท/ระดับ/ช่วงชั้นเดียวกันผ่านcomposite bindingsตาม21 ไม่เชื่อorg_idจากclient               |
| K35-05         | cross-resourceเงื่อนไขEnrollmentปีและสังกัด/ช่วงเรียน/eligibility ต้องownertransactionหรือtypedbindingที่รับรอง ไม่CHECKqueryข้ามตาราง Enrollmentจากปีก่อนไม่รับเป็นปีนี้โดยเดา เว้นruleยืนยัน       |
| K35-06         | unique(candidate_id,session_offering_id,registration_slot)เป็นProposal naturalkey businessซ้ำ ต้องกฎcross-offering/retakeอีกชั้น ไม่ให้เลือกslotเองหรือใช้channel/org/center/policyversionเพิ่มใบซ้ำ |
| K35-07         | submitted_snapshot_idต้องเป็นรุ่นของApplicationเดียวกัน compositeFK(id,application_id); unique(application_id,version_no) Snapshot/source/form pinsimmutableหลังseal                                 |
| K35-08         | FormTemplateRegistry/version/typedmappings/sourceFileVersion FKและofficialissuanceguardตามpolicy; machine-schemaJSONต้องvalidated ไม่JSONprogramที่สั่งรัน/เขียนmodelเอง                             |
| K35-09         | statechangeCAS + currentgrants + workflowขั้นที่ตรง + operation receipt + audit/outbox atomic; unique binding/workflowcycleตามAPPLICATION_STATES ไม่rowstatusจากclient                               |
| K35-10         | RESTRICT/noharddelete/nativeuniques/CASขณะretry/import concurrency; withdrawn/rejectedไม่ลบidentity/ใบสมัคร/snapshot/ผลที่อ้างแล้ว                                                                   |

### Deltaที่ต้องทำADRก่อนimplementation

แบบ04มีCandidateuniquePersonแล้ว แต่Applicationunique(person_id,session_level_id)ยังเป็นProposal และSessionLevelไม่มีช่วงชั้น บท21เสนอchildoffering `(session_level_id,stage_key)` ยังไม่มีจริง ดังนั้น35ต้องalignofferingFK/centercontextและnaturalkeyก่อนmigration ไม่เพิ่มstagefree-textแล้วปล่อยuniqueเดิมขัดกฎที่อาจอนุญาตหลายกลุ่ม

FormTemplateRegistryแบบ04อยู่module09/ownerO09แต่35ใช้ร่วมระบบ5และ9 ข้อเสนอให้O05รับรองความหมาย/ประเภทสอบ O09รับรองmachine-schema/ช่องนำเข้า C03ตรวจpolicyสิทธิ์ข้อมูล ไม่สร้างregistryเพิ่ม O09เป็นเจ้าของadapterไม่ใช่ทะเบียนใบสมัครหรือกฎคุณสมบัติอีกชุด

document/dictionary/data_model.jsonเดิมยังเป็นlogical04 ไม่แก้ทั้ง128tablesก่อนfoundationพร้อม ต้องปรับADR/dictionary/ERD/typedschemaให้ตรงข้อเสนอที่เจ้าของรับรองพร้อมmigrationจริงก่อนใช้งาน ไม่อ้างdeltaเอกสารนี้บังคับDBแล้ว

## 4 Business keyและการสมัครซ้ำ

Candidate: Personเดียว→Candidateเดียวตลอดประวัติ PersonปีA/ปีBมีApplicationsหลายรายการได้โดยCandidateIDเดิม ไม่ผูกcandidateกับสำนัก ปี เพศ สถานะบรรพชิตหรือchannel ถ้าคนไม่เคยยืนยันidentityให้ใช้duplicate-reviewกลาง ไม่สร้างPersonจากชื่อซ้ำเพื่อหลบkey

Enrollment naturalkeyเสนอ `(person_id, organization_id, academic_year_id, education_branch_id, program_offering_id, enrollment_slot)` โดยslotฝั่งserverตามruleสำหรับเรียนซ้ำ/ย้ายที่รับรอง defaultDEMO1 ไม่มีทางการยังTO VERIFY enrollment_noเป็นรหัสแสดงผลuniqueในหน่วย/ปี ไม่แทนตัวตนคน/กฎเรียนซ้ำ Multi-affiliation/หลายprogramอนุญาตตามrule ไม่uniquePersonทั้งปีจนบล็อกทุกกรณี

Application naturalkeyเสนอ `(candidate_id, session_offering_id, registration_slot)` offeringมีcontextปี/ประเภท/รอบ/ระดับ/ช่วงชั้น และslotออกโดยserverเฉพาะruleที่ยอมรับ defaultDEMO1 stablebusinesskeyไม่ใช้uuidrandomจากclientเป็นโอกาสใหม่ ความต่างของcenter/organization/channelหรือpolicyversionไม่สร้างโอกาสสมัครเพิ่ม Duplicateเว็บ+Excelต้องsameapplicationหรือsafeconflictตามcurrentreadpolicy ไม่บอกชื่อ/เลขใบของคนอื่นผ่านerror

หากกฎไม่ให้คนเดียวสมัครหลายofferingที่ขัดกันต้องเพิ่มexclusivity guard/constraintภายใต้transaction ไม่ถือuniqueแต่ละofferingให้สิทธิ์สมัครทุกช่วงชั้น การเปลี่ยนปี/ประเภท/รอบที่allowedเป็นbusinessopportunityใหม่ การเรียนซ้ำ/ถอนแล้วสมัครใหม่ต้องexplicitpolicy/slotissued/approvalไม่รับretryเป็นretakeและไม่reusekeyโดยลบแถวเก่า

OperationReceiptกันcommandซ้ำตามactor/command/businessref/key/fingerprint ต่างจากnaturalkeyกันใบสมัครซ้ำแม้keyใหม่ เว็บ/Excelsharecanonicalvalidation/identityresolution/naturalkey/currenttargetscope/mutationserviceและtransaction ไม่สร้างPerson/Candidate/enrollmentโดยsilentupsertจากข้อมูลชื่อในแถวExcelหรือlast-write-winsบนใบเดิม

## 5 Snapshotและประวัติหลายปี

draftเก็บrevisionของข้อเสนอ การส่งsealSnapshotรุ่นหนึ่งไว้พร้อมsource refs/hash/time/form/rules/context วันที่อ้างอิงกฎต้องexplicitไม่ใช้ปีlabelแทนวันชื่อ/สังกัด คนเปลี่ยนชื่อหลังปีA ปีBใช้sourceใหม่ได้ แต่ปีAอ่านsnapshotเดิม ไม่joinlatestเพื่อprintปีเก่าอีกครั้ง

returnedแก้แล้วresubmitSnapshotรุ่นใหม่ใต้ApplicationIDเดิม เพิ่มreviewcycleตามworkflow11 เก็บเดิมและคำตัดสินเก่า ไม่เพิ่มCandidate/ใบสมัครจากretry หากapprovedแล้วมีสาระสำคัญเปลี่ยนใช้amendmentตามworkflowที่เจ้าของรับรอง ไม่editSnapshotใต้คำอนุมัติเก่า ไม่แก้ผลสอบ/เลขที่นั่งที่ออกแล้วโดยแก้ใบสมัครเฉย ๆ

สิทธิ์read/export/print/download/job/workerตรวจcurrentaccount/scope/purpose/fieldACLที่DALตอนอ่าน แม้snapshotเป็นปีเก่าก็ไม่เป็นpublicอัตโนมัติ เก็บชื่อและข้อมูลตามpurposeที่ยืนยัน ไม่เก็บdocumentidentity/privatephone/addressเต็มในcache/HTML/publicDTO/audit/notification

## 6 แผนตรวจรับ — ทุกP35 NOT RUN

| Case ref | Testเมื่อruntimeพร้อม                                                                  | หลักฐานที่ต้องได้                                                                 |
| -------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| P35-01   | PersonเดียวมีEnrollment/ApplicationsปีA-Bและสองประเภทที่DEMOpolicyยอม                  | Candidate/PersonIDเดียว ไม่มีทะเบียนต่อปี/ประเภท/ช่องทาง                          |
| P35-02   | เปลี่ยนชื่อ/ฉายา/สังกัด/monasticstatusหลังปีA แล้วอ่าน/print/exportปีA-B               | snapshot/sourceversionปีAคงเดิม ปีBตามเวลาของรุ่นใหม่ privatefieldsไม่public      |
| P35-03   | เว็บและimporterเริ่มสมัครbusinesskeyเดียว keyเดิม/keyใหม่/nativeสองconnections         | oneApplication/receiptตามcontract ไม่silentoverwrite/duplicateCandidate           |
| P35-04   | ปลอมCandidate/Enrollmentคนอื่น หรือyear/type/level/stage/centercontext                 | compositeFK/currentDAL/validationdeny ไม่มีorphan/mixedperson                     |
| P35-05   | ผ่านหลายoffering/slotที่allowed และลองclientสร้างslot/เปลี่ยนorg/channelหลบduplicate   | serverruleexclusivityบังคับ มีหลายรายการเฉพาะallowed ไม่uniquePersonทั่วทุกปี     |
| P35-06   | state6และtransitionsตามAPPLICATION_STATES maker/currentscope/revoke/action/jobตรง      | canonicalworkflow+CAS/snapshotpins/receipt/audit/outboxครบ ไม่clientstatusapprove |
| P35-07   | draftresume/returnedresubmit/withdrawnretry/rejectedreapplypolicy                      | IDเดิมและประวัติไม่หาย ไม่ใช้partialactiveuniqueเพื่อลบทางเข้าแล้วสมัครซ้ำ        |
| P35-08   | ทุกศ.1/2/3/5/6ไม่มีsourceverified ทดลองforceOFFICIALผ่านAPI/job/print/export           | failclosedไม่ออกแบบทางการ ศ.3ไม่มีautoaliasmapping                                |
| P35-09   | DEMOgenericlayoutมีป้าย/ข้อมูลสมมติและmodeถูกต้อง clientพยายามสลับofficial             | ไม่ใช้รหัส/ตรา/ชื่อแบบทางการพิสูจน์ว่าเป็นofficial ไม่มีpublicPII                 |
| P35-10   | registryversion/mappingเปลี่ยนหรือwithdraw ขณะใบเก่ามีsnapshot/งานนำเข้าค้าง           | pinรุ่นเดิมและตรวจcurrentwithdrawalpolicy ไม่joinlatest/ออกofficialเมื่อขาดguard  |
| P35-11   | nativefailหลังCandidate/Application/Snapshot/audit/outbox writesหรือACKหาย             | atomicrollbackหรือreceiptเดิมไม่มีpartialregistry ไม่CREATEcandidateบนGET         |
| P35-12   | nonemptyyearhistory/FK manifests/อ่านนอกพื้นที่/formprivatefile/cache/errors/retention | identity/sourcehistoryครบ scope/field/filedeny ไม่absenceoftablesเป็นPASS         |

เกณฑ์35-01ผูกP35-01–05/07/12; เกณฑ์35-02ผูกP35-08–10 ยัง **BLOCKED / NOT RUN** ไม่มีmulti-year/unique/native/rendererผ่านจากเอกสารนี้

## 7 Versionsและgate

app/schema0.6.0 Prisma7.10.0 Next16.3.8 pnpm11.28.2 lockfile9 core19models/213scalarfields/migration1 `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน ไม่มีschema/seed/migration/servicesใหม่

วันที่4ตุลาคม2569 sourcefb346a0 ตรวจmodels/module/logic04/21จริงและPythonDocker/TCPprobe DockerCLI/socketไม่มี loopback5432/5546ConnectionRefusedError `corepack pnpm db:test` exit1 safeerrorไม่แยกenv/connection ไม่เดาสาเหตุย่อย DB-06/Q027/DOCKER-05/Q026ยังเปิด ไม่แตะproduction

ต้องตรวจรับ34และต้นทางAuth/DAL/Document/FileVersion/workflow/ExamSession/offerings/personhistoryก่อนimplementation35ตามแผนMASTERข้อ2 แผน07เดิมอนุมัติแล้วไม่ขอซ้ำ กฎยังTO VERIFYใช้DEMOเมื่อruntimeพร้อมได้ ไม่ถือการอนุมัติแผนเป็นผลเกณฑ์ผ่าน บท36ยังไม่เริ่ม ไม่เดาขอบเขต ไม่push/deploy

## 8 คำสั่งและผลตรวจสิ่งส่งมอบรอบ35

รันจากroot repository:

```bash
corepack pnpm exec prettier --ignore-path /dev/null --check docs/APPLICATION_SCHEMA.md docs/FORM_TEMPLATE_REGISTRY.md docs/APPLICATION_STATES.md src/modules/exams/README.md src/modules/exam-imports/README.md
git diff --check
git diff --cached --check
corepack pnpm secrets:check
corepack pnpm db:test
```

Prettier/whitespace/secretscheckผ่านตามขอบเขตตัวตรวจ ส่วนdb:test exit1ตามหัวข้อ7 ไม่ใช่ผลทดสอบใบสมัครผ่าน Pythoninlineตรวจ5modelcontracts, K35-01–10, P35-01–12, F35-01–05, A35-01–06, T35-01–11, E35-01–08, 20local linksใน3เอกสารใหม่และ2README, DEC-148–151 และ9ไฟล์เปลี่ยนผ่าน ตรวจ19coremodels/1migration/checksumและschema-migration-package-lock-logical04ไม่เปลี่ยนผ่าน เป็นdocument/inventorycheckเท่านั้น

ไม่ได้รันrootunit/typecheck/lint/build/nativeCandidate-Application/API/importworker/formrenderer/browser/P35-01–12ในบท35 ไม่มีruntimeใหม่ ไม่อ้างผลบทก่อนเป็นผลรอบนี้ ทั้งสองเกณฑ์ยังBLOCKED ต้องปิดDB-06/Q027, DOCKER-05/Q026 และตรวจรับ34/ต้นทางก่อนimplementationและexecution35
