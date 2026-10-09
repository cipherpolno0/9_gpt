# ทะเบียนหนังสือและเลขสารบรรณ — บท 53

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `243c234` | **Proposal / BLOCKED — ยังไม่มี schema/migration หรือบริการออกเลขจริง**

บท52/ส่วนกลางยังไม่ผ่าน `corepack pnpm db:test` รอบ53exit1 ไม่มีnativePostgreSQLพร้อมใช้ core19modelsมีDocumentแบบMETADATA_ONLY ไม่มีFileVersion/currentAuthDAL/recordACL/workflow/businessoutbox สารบรรณมีREADMEเท่านั้น [E_OFFICE_SCHEMA](E_OFFICE_SCHEMA.md), [RECORD_DOCUMENT_ACCESS](RECORD_DOCUMENT_ACCESS.md) และ [records-register-53-plan](fixtures/records-register-53-plan.json) เป็นสัญญาและPLAN ONLY ไม่seed ไม่ออกเลข ไม่อัปโหลดหรือส่งหนังสือจริง

## 1 แนวคิดทีละขั้น

1. หนังสือหนึ่งเรื่องมี Correspondence กลางและ RecordVersion ของเนื้อหา/ผู้รับ/หลักฐาน เก็บ Document/FileVersion เดิมตามรหัส ไม่คัดลอกไฟล์เพราะมีหลายระบบอ้าง
2. RegisterType ระบุรับ/ส่ง/ภายใน/เวียน ส่วน Priority ระบุความเร่งด่วนและ Confidentiality ระบุชั้นความลับ เป็นสามมิติคนละชุด config ไม่ใช้ด่วนแทนลับ หรือรับแทนpublic
3. เลขทะเบียนเกิดเมื่อการลงทะเบียนcommitสำเร็จในnamespaceหน่วยงาน–ปีทะเบียน–ประเภท ไม่เกิดจากเปิดหน้า/ร่าง/notification และไม่ใช้เลขของหน่วยงานเป็นเลขทั่วประเทศ
4. ยกเลิกเลขที่ออกแล้วเก็บเลข/เหตุผล/หลักฐาน/ผู้กระทำ/วันมีผลและวันบันทึก ไม่ลดcounterหรือเอาเลขเดิมให้หนังสือใหม่ หนังสือแก้ไขเพิ่มรุ่นหรือคำแก้ไขที่อ้างต้นทางตามpolicy ไม่เขียนประวัติเดิมทับ

## 2 Policy และปีทะเบียน

RegisterPolicyVersionอ้างPolicyVersionกลาง ระบุowner/sourceevidence/verification/effectivewindow/ประเภท/period/calendar/timezone/yearlabel/startnumber/maxnumber/displayformatter/การยกเลิก/การแก้ปี/authority/delegation/retention/numberreservation/registeredversion requirements ไม่มีแหล่งยืนยันให้เป็นTO VERIFYและปิดofficial issuance

ค่าทดลองมี4ประเภท `DEMO_IN`, `DEMO_OUT`, `DEMO_INTERNAL`, `DEMO_CIRCULAR` ไม่ใช่รหัสราชการ priorityใช้ `DEMO_NORMAL`, `DEMO_RUSH`; confidentialityใช้ `DEMO_INTERNAL`, `DEMO_RESTRICTED` แยกnamespaceconfig แม้ข้อความบางตัวเหมือนกัน ไม่สร้าง public policyจากตัวอย่าง

ปีทะเบียนใช้ RegisterPeriod ที่ระบุวันเริ่มรวม/วันสิ้นสุดไม่รวม timezoneAsia/Bangkokและcalendarpolicy แยกจากFiscalYear/AcademicYear แม้labelปีเท่ากัน ตัวอย่างช่วง2027-01-01ถึง2028-01-01เป็นDEMO ไม่ยืนยันปีงบหรือการรีเซ็ตเลขจริง Incoming document date, received_at, registered_at, effective_on และ recorded_atเป็นคนละข้อมูล การเลือกย้อนหลังต้องอำนาจ/periodเปิด/policyที่ยืนยัน ไม่ให้เวลาbrowserหรือyearparamเปิดnamespaceใหม่เอง

Canonical namespace = `(organization_id, register_type_id, register_period_id)` โดยtype/periodเป็นidentityคงที่ไม่ใช่ชื่อหรือformatter version ต้องห้ามperiodช่วงทับซ้อนสำหรับบริบทเดียวเมื่อactive การแก้formatหรือpolicyversionไม่reset counter ไม่สร้างtype/periodใหม่ด้วยชื่อเดิมเพื่อใช้เลขซ้ำ register_counter04มีunique(org,register_kind,period_key) ต้องADR reconcileชนิดFK/period identityก่อนmigration ไม่สร้างcounterอีกชุด

รูปแบบทดลอง `TEST_<orgcode>_<periodcode>_<typecode>_<ordinal padded 4>` เป็นdisplayจากsnapshotที่คุมinputชัดเจน ไม่ใช่เลขหนังสือราชการ เลขordinalเก็บBIGINTบวกและส่งDTOเป็นdecimal string ไม่ผ่านJSNumber สำหรับค่าที่เกินsafeinteger Formatted numberเก็บsnapshotพร้อมformatter/policyversionและไม่เปลี่ยนตามชื่อหน่วยงานปัจจุบัน การformatชน/collideต้องdenyทั้งtransactionไม่autoเลือกเลขอื่น

## 3 สัญญาบริการออกเลข

Servicesเสนอ `createDraft`, `reviseDraft(expected_revision)`, `registerRecord(expected_revision, idempotency_key)`, `voidRegisterNumber(expected_revision, reason, evidence)` และ `readAuthorizedRecord(as_of, known_at)` ไม่มีroute/serviceจริงในรอบนี้ ไม่สร้างsend/acknowledge/signature/routingengineล่วงหน้า

1. ตรวจcurrentaccount/action/orgscope/ช่วงมอบหมาย/delegation/currentrecordACL/fieldpolicyทั้ง DAL และ limited DBcontext ผู้สร้างไม่approveงานสำคัญเอง ตรวจrequirementตามtype/approvedrevision/contenthash/recipients/due policyและFileVersionCLEAN/currentACL ก่อนออกเลข ยังไม่ครบให้validationerrorที่ลดข้อมูล ไม่เพิ่มcounter
2. เปิดtransaction ตรวจperiod/policy/record/source versionsและauthorization ณ จุดทำรายการ Lock orderที่ADRต้องใช้ร่วมทุกwriter: authority/period context → correspondence/rootrevision → counter namespacesตามcanonical identity → register/version/reference → operationreceipt/audit/outbox ห้ามregistrationกับvoidหรือworkerเลือกorderสวนกัน ต้องกำหนดprotocolrevoke/fileACL/sourcevalidationร่วมส่วนกลางด้วย
3. หากcounterrowยังไม่มี ให้createด้วยnamespaceunique/atomicupsertตามADRก่อนlockแถวจริง ไม่ถือSELECT FOR UPDATEที่ไม่พบแถวว่ากันการcreateแข่งแล้ว เมื่อrowมีให้lockและตรวจrowversion/positive next_number/maxrange ใช้next_numberได้ไม่เกินmin(policymax, BIGINT_MAX−1)เพราะต้องเก็บnext_number+1; ถึงBIGINT_MAXให้denyไม่wrap/truncate หากต้องใช้เลขสุดท้ายBIGINTต้องADRcounter-exhausted stateต่างหาก
4. ป้องกันtransportretryด้วยoperation_receipt11+payloaddigest และ businessuniqueหนึ่งRegisterNumberต่อCorrespondenceในnamespaceที่อนุญาต keyใหม่ไม่ออกเลขใหม่ให้เรื่องเดียว รุ่นที่แก้หลังregisteredใช้เลขเดิมหากpolicyให้แก้เรื่องเดิม ส่วนเลขใหม่ต้องคำขอ/เรื่องใหม่ที่อนุมัติและtyped correctionref ไม่เลือกเอง
5. อ่านordinalจากcounterที่lock เพิ่มnext_numberหนึ่ง บันทึกRegisterNumberISSUED/Correspondence binding/registered RecordVersion snapshot/ACL references/operationreceipt/audit/outboxในtransactionเดียว unique(namespace,ordinal)และunique(correspondence,register namespace)ใช้กับทุกสถานะ ไม่partialตามis_activeหรือVOID เลขยกเลิกยังblockการใช้ซ้ำ Composite FKต้องผูกownerorg/type/period/counterจริงกันการเปลี่ยนcounter_idข้ามหน่วยงาน
6. ถ้าvalidation/source/CAS/unique/failpointผิดก่อนcommit rollbackcounterและทุกwrite ห้ามเผยเลขหรือส่งnotificationก่อนcommit กรณีนี้ไม่มีเลขออกแล้วให้ยกเลิก ตัวเลขที่เคยคำนวณแต่ไม่commitไม่เป็นcancelled registerและไม่claimเลขไร้ช่องว่างทางการ หากpolicyต้องจองเลขก่อนเนื้อหาเสร็จ ต้องADR durable reservation/expiry/VOID evidenceก่อนเปิดmodeนั้น รอบนี้ไม่มีreservationmode
7. Commitแล้วresponseหาย retrykey/hashเดิมต้องตรวจสิทธิ์ปัจจุบันก่อนคืนเลขเดิม/receipt ไม่เพิ่มcounterอีก Hashเปลี่ยนconflict; newkey samebusinessslotไม่ออกใหม่ boundedretryทั้งtransactionเฉพาะretryableconflict/deadlockตามADR ไม่retryvalidationหรือสุ่มเลขหนีunique
8. Workerแจ้งผ่านoutbox11/durableinbox/devsink/dedupe/retry/deadletter ไม่allocatecounterหรือสร้างrecordใหม่จากการส่งซ้ำ ไม่ยืนยัน exactly-onceการส่งภายนอกที่ไม่มีprotocol ไม่แสดง secret/objectkey/subject/recipientrosterในauditหรือnotificationโดยปริยาย

อ่านหลักการจากPostgreSQL18 [row locks](https://www.postgresql.org/docs/18/explicit-locking.html) และ [unique/FK constraints](https://www.postgresql.org/docs/18/ddl-constraints.html) เพื่อทบทวนข้อเสนอ ไม่ใช่หลักฐานว่ามีSQLguardหรือtransactionที่executeผ่านแล้ว

## 4 ยกเลิก แก้ไขและประวัติ

| เหตุการณ์                       | ผลต่อเลขและเรื่อง                           | หลักฐาน/เงื่อนไข                                                                                     |
| ------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ร่าง/validationไม่ผ่าน          | ไม่มีเลข ไม่มีincrement                     | auditการเปลี่ยนที่กำหนด ไม่มีเลขVOIDปลอม                                                             |
| ก่อนcommitล้มเหลว               | rollbackทุกส่วน ไม่เผยเลข                   | observerproofต้องตรวจcounter/register/version/receipt/audit/outbox ไม่แค่HTTPerror                   |
| ลงทะเบียนสำเร็จ                 | ISSUEDและเลขsnapshotคงที่                   | record revision/approvedhash/policy/evidence/currentACLครบตามtype                                    |
| ยกเลิกหลังcommit                | VOID eventอ้างเลขเดิม ไม่decrement/reassign | reason/evidence/actor/authority/effective-recorded/correlation/idempotency ครบ                       |
| แก้เนื้อหาหรือผู้รับ            | RecordVersionใหม่supersedesรุ่นเดิม         | registeredversion immutable ตรวจรุ่นใหม่ ไม่เปลี่ยนเอกสารหรือคำตัดสินเก่า                            |
| ย้ายเรื่องไปปี/ประเภท/หน่วยอื่น | ไม่แก้namespaceทับ                          | correction/re-registrationที่policyยืนยันและอำนาจทั้งต้นปลาย เลขเก่าคงหลักฐาน ไม่reset/copyเรื่องเอง |

VOIDไม่ลบFileVersion/คำอนุมัติ/ผู้รับ/ราคา/บุคคลที่ต้นเรื่องอื่นใช้อยู่และไม่ยกเลิกธุรกรรมระบบอื่นเอง ประวัติเลขต้องค้น ณ วันที่มีผลและเวลาบันทึกตามสิทธิ์ ห้ามsoftdeleteทำให้uniqueหมดผล การคืนสถานะเลขใช้approvedcorrectioneventตามpolicy ไม่reuseเลขให้คนละเรื่อง

## 5 กรณีตรวจเมื่อพร้อม

| Case   | หลักฐานที่ต้องได้จริง                                                                        | สถานะ   |
| ------ | -------------------------------------------------------------------------------------------- | ------- |
| P53-01 | ทั้ง4typeสร้างdraft/revise/registerได้ fields/requirements/priority/confidentialityแยก       | NOT RUN |
| P53-02 | native2connections/barrierออกเลขnamespaceเดียว 2เลขต่างกันหนึ่งcounterถูกต้อง                | NOT RUN |
| P53-03 | raceแรกเริ่มcounterไม่มีrow ได้หนึ่งnamespace/2ordinals ไม่missingrowlockหลอก                | NOT RUN |
| P53-04 | org/period/typeต่างกันอนุญาตordinalเดียวกัน policy/formatterเปลี่ยนไม่reset                  | NOT RUN |
| P53-05 | retrycommitresponseหาย/keyhashต่าง/newkeybusinesssame ได้ผลเดิมหรือconflictไม่มีเลขใหม่      | NOT RUN |
| P53-06 | VOID/retryVOID/แก้เหตุผลด้วยeventใหม่ nextไม่ลด/codeไม่reuse/historyครบ                      | NOT RUN |
| P53-07 | failpointcounter/register/version/receipt/audit/outboxก่อนcommitrollbackครบ                  | NOT RUN |
| P53-08 | register-vs-revision/void/revoke/periodclose/fileACL race globalorder/currentguards          | NOT RUN |
| P53-09 | directlimitedSQL/RLS/compositeFK/unique/positive/overflow/softinactive bypassdeny            | NOT RUN |
| P53-10 | unknownofficialformat/calendar/authority/closedperiod/clienttime/backdatedyear deny          | NOT RUN |
| P53-11 | BigIntDTO/Thaiเลขdisplay/namechange/asof/known_at/future/correctionรักษาสnapshot             | NOT RUN |
| P53-12 | หนังสือรับส่งภายในเวียน5ระบบอ้างDocument/FileVersionเดิมไม่มีfilecopy                        | NOT RUN |
| P53-13 | newFileVersionไม่เปลี่ยนregisteredattachmentsเดิม compositeid/hash/CLEANcurrentACLตรวจจริง   | NOT RUN |
| P53-14 | source/record/version/fileaction ACL intersectionไม่union grantจากlink/recipientไม่automatic | NOT RUN |
| P53-15 | crossorg/nativeStorage/fulltext/search/detail/preview/export/print/worker revokeddeny        | NOT RUN |
| P53-16 | ผู้รับชื่อเหมือน/Person-org XOR/snapshot/currentaccountverifiedlink/ACLrosterprivacy         | NOT RUN |
| P53-17 | เปลี่ยนpriorityไม่เปลี่ยนconfidentiality/ACL duecalendar serverไม่grantจากbrowser            | NOT RUN |
| P53-18 | filepending/mimewrong/scanfailed/ACLถอน/policyใหม่ denyไม่เผย objectkey/signedURL            | NOT RUN |
| P53-19 | outboxretry/workerACK/DL/devsinkหนึ่งeffectไม่มีเลขหรือหนังสือเพิ่ม                          | NOT RUN |
| P53-20 | GET/report/link/notificationไม่มีcounter/ack/send/signature/post; auditลดข้อมูล/ownerUAT     | NOT RUN |

nativeprotocolต้องสองconnectionsที่มีprincipalsจริง/barrier/observerหลังcommit/globalorder/retrySQLSTATEและmanifestprivate(run_id/commit/DB/migration/policy/expected/actual/เลข-source-receipt-evidence refs/issue/ผู้ตรวจ/เวลา) ใช้devแยกproduction ไม่PGlite/WASM/mockALLOW/skipเป็นPASS db:test06เดิมไม่เป็นP53runner

เกณฑ์53-01ผูกP53-02–11/19–20 เกณฑ์53-02ผูกP53-12–18/20 ทั้งสอง **BLOCKED / NOT RUN** ไม่มีmigration/nativeบริการ/เลขหรือsharedfileexecutionจริง ต้องแก้52/ส่วนกลาง/DB-06/DOCKER-05ก่อน โค้ด53ยังต้องแผนตามMASTERข้อ2 ไม่เริ่ม54จากreferencefixtureหรือการตรวจเอกสาร
