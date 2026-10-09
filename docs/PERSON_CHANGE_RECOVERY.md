# เชื่อมสถานะบุคคล ตำแหน่ง บัญชี และการแก้สถานะผิด — แบบเตรียมบท 17

รุ่นเอกสาร 0.1 | 4 ตุลาคม 2569 | **Proposal / BLOCKED — ยังไม่มี event handlers, การปรับสิทธิ์ หรือ recovery runtime**

บท17ต้องผ่าน16ก่อน ตรวจ source `518c2da` พบโมดูลpeopleมีREADMEเท่านั้น ไม่มี PersonChangeRequest, PositionAssignment, RoleAssignment, บัญชี/session หรือ outbox จริง บท16และfoundation12ยังBLOCKED เอกสารนี้เป็นสัญญาสำหรับพัฒนาต่อ ไม่ใช่ schema/migration, service หรือผลตรวจรับ กฎอำนาจและผลต่อหน้าที่ที่ยังไม่มีหลักฐานใช้ **TO VERIFY**

## 1 เรียนรู้ทีละขั้น

1. คำขอที่อนุมัติยังอาจรอวันมีผล การเปลี่ยนทะเบียนเกิดเมื่อถึงวันนั้นและตรวจเงื่อนไขครบ จึงปิดเฉพาะช่วงหน้าที่หรือสังกัดที่คำอนุมัติระบุ
2. worker อาจได้รับงานเดิมหลายครั้ง ต้องเก็บใบรับผลการทำงานในธุรกรรมเดียวกับการเปลี่ยนข้อมูล เมื่อรับซ้ำจึงรู้ว่าทำสำเร็จแล้ว ไม่ปิดช่วงประวัติรอบใหม่
3. ตำแหน่งกับสิทธิ์เว็บไซต์เป็นคนละเรื่อง ย้ายสังกัดไม่ให้สิทธิ์พื้นที่ใหม่จากที่อยู่ และลาสิกขาไม่ระงับบัญชีหรือสิทธิ์แบบคฤหัสถ์ทั้งหมด
4. การแก้สถานะผิดเป็นคำขอใหม่ที่อ้างเหตุการณ์เดิม มีเหตุผล หลักฐาน และผู้อนุมัติ ไม่ลบ audit หรือย้อนข้อมูลทั้งคนจาก snapshot เก่า

ใช้ Person/Organization/บัญชี/เอกสาร/คำขอ/workflow/audit/outbox กลางร่วมกันตาม [BLUEPRINT](../BLUEPRINT.md), [PERSON_CHANGE_WORKFLOWS](PERSON_CHANGE_WORKFLOWS.md), [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md), [POSITION_RULES](POSITION_RULES.md) และ [PERSON_VISIBILITY](PERSON_VISIBILITY.md)

## 2 เจ้าของการเปลี่ยนข้อมูลและลำดับเหตุการณ์

บริการ activation ของโมดูลpeopleเป็นผู้เขียนผลมีจริงเพียงทางเดียว ทั้ง Route Handler และ worker เรียกบริการนี้ ไม่มี consumer อีกตัวที่ได้รับเหตุการณ์มีผลแล้วปิดตำแหน่งซ้ำ

| งานที่เสนอ          | หน้าที่                                                                                                   | สิ่งที่ห้ามทำ                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| เตรียมรายงานผลกระทบ | อ่านทรัพยากรที่มีสิทธิ์และรุ่นปัจจุบัน สร้างแผนรายการเป้าหมายให้ตรวจ                                      | ไม่เขียนทะเบียนหรือเพิ่มสิทธิ์จากการคำนวณรายงาน                                            |
| ตรวจ/อนุมัติแผน     | workflowกลาง pinคำขอ/revision/rule/evidence/รายการเป้าหมายและgrantที่อนุมัติ                              | ผู้สร้างอนุมัติงานสำคัญของตนเองไม่ได้; อำนาจเปลี่ยนสถานะไม่เท่ากับอำนาจเพิ่มRoleAssignment |
| งาน activation      | ถึงวันมีผลแล้วตรวจอำนาจปัจจุบันและ invariants; ทำ domain writes + receipt + audit + outbox ใน transaction | ไม่ตั้ง effective ก่อนข้อมูลหลัก commit; ไม่ถือ event payload เป็นอำนาจ                    |
| งานหลังมีผล         | อ่านเหตุการณ์ที่ commit แล้ว เพื่อแจ้งเตือน/ซิงก์ provider/ส่งงานให้โมดูลที่ลงทะเบียน                     | ไม่เขียนผลเดิมใหม่ ไม่อัปเดตโดยใช้ arbitrary model/org_id จาก payload                      |
| คำขอแก้ไข           | ผ่านเส้นทางตรวจของตนเอง แล้วเรียก activation เดียวกันด้วยรายการแก้ไขที่รับรอง                             | ไม่แก้คำอนุมัติ/receipt/audit เดิม หรือ restore snapshot ทั้งชุด                           |

หากแผนเปลี่ยนสิทธิ์ยังไม่ผ่านผู้มีอำนาจตามpolicy ห้ามปล่อยสิทธิ์ที่สิ้นฐานอำนาจให้คงอยู่เพียงเพราะงานซิงก์ยังไม่เสร็จ ต้องกำหนดในกฎที่รับรองว่า grant ใดสิ้นสุดอัตโนมัติตามฐานการมอบหมาย และ grant ใดต้องคำอนุมัติแยกก่อน activation ทั้งหมดนี้ยัง TO VERIFY ไม่ใช้การย้ายของPersonเป็นคำสั่งถอนทุกRoleAssignmentโดยปริยาย

## 3 สัญญา event และ receipt ที่เสนอ

ชื่อด้านล่างเป็นชื่อภายในที่เสนอ ไม่ใช่ model ที่เพิ่มแล้ว รูปแบบ migration/constraints ต้องออกแบบร่วมบท07/11/16หลังdependencyผ่าน และเปิด RLS แบบdeny by default ตามกติกากลาง

| ส่วน                 | ข้อมูลขั้นต่ำ / ข้อบังคับ                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Event envelope       | event UUID, event type/schema version, central request ID/revision, Person FK, activation receipt ID, aggregate version, rule version, effective date, recorded_at, correlation UUID        |
| Authority provenance | initiating account/service identity, decision references และ approved plan version; worker ตรวจ current authority/scope/ช่วงมอบหมายตามpolicy ไม่ถือ ServiceActor bootstrap เป็นบัญชีอนุมัติ |
| Payload              | ใช้ typed references ของเป้าหมายที่ server resolve ได้ ไม่มี rawเหตุผล/ชื่อ/เบอร์/ที่อยู่/secret/token; evidenceชี้FileVersionที่ scan/ACL ผ่าน                                             |
| Activation receipt   | unique(request_id, approved_revision, operation_kind); command keyผูก actor/request/operation และ fingerprintจำกัดฟิลด์ตาม11; event UUID unique                                             |
| รายการผลต่อเป้าหมาย  | unique(activation_receipt_id, target_kind, target_id, effect_kind); FKหรือbindingที่ฐานบังคับได้ พร้อม before/after revision references                                                     |
| Downstream receipt   | unique(event_id, consumer_name, operation_kind); ผลในฐานเดียวกันต้อง commit พร้อม receipt; งานนอกฐานใช้สัญญา provider เพิ่ม                                                                 |

ใช้ทั้ง business activation key และ event UUID: หากproducerเผลอสร้างUUIDใหม่ให้ activation เดิม ต้องยังถูก business key กันซ้ำ Keyเดิมแต่ fingerprint ต่างกันเป็น conflict ไม่ตอบว่าสำเร็จ หรือสร้างผลใหม่เพียงเปลี่ยน event ID

อ่านreceiptซ้ำต้องตรวจสิทธิ์ปัจจุบันก่อนคืนผล ห้ามคืน snapshot/เหตุผล/เอกสารให้ผู้ถูกถอนสิทธิ์แล้ว Receiptที่ commit แล้วเป็นหลักฐาน immutable ไม่ทำ flagว่า processed ในหน่วยความจำแทนฐานข้อมูล

## 4 Transaction และการแข่ง/หยุดทำงาน

1. resolve actor/session หรือ service assignment จากserver ตรวจ action/resource/scope/account status/เวลา และ maker checker ตาม [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md) รวมสิทธิ์เปลี่ยน grant ที่ระบุ
2. ใน transaction ตรวจคำขอ approved revision, เวลา Asia/Bangkok, rule/evidence versions, account/grant versions และ expected versions ของ Person/ตำแหน่ง/สังกัด/เป้าหมาย ต้อง serialize การถอนสิทธิ์กับการเปลี่ยนตามบท07; ถอนก่อนเริ่มแล้วต้องไม่อนุญาต
3. ตรวจ receipt/business key แบบ atomic และ optimistic versions หรือ locks ตามชนิดทรัพยากร รวม capacity/overlap ของ14 หากมี concurrent conflict ให้ rollback และรายงาน conflict เพื่อทบทวน ไม่อ้าง row_version กันทุก write skew ได้เอง
4. สร้าง status/history revisions และปิดช่วงที่อนุมัติด้วยช่วงวันที่ `[effective_from, effective_to)` โดยไม่ทำลายฉบับเก่า เก็บ recorded_at/supersession และ evidence แต่งตั้ง/ยุติคนละ reference วันสิ้นสุดก่อนวันเริ่มหรือแก้ช่วงย้อนหลังขัดกับข้อเท็จจริงอื่นต้องหยุดตรวจ ไม่ clampวันเอง
5. ทำ grant/account changes ที่อยู่ในฐานเดียวกันตาม approved plan; เขียน receipt, ผลต่อแต่ละเป้าหมาย, audit_logs และ outbox ใน transaction เดียว ตั้งคำขอ effective เมื่อผลหลักครบแล้วเท่านั้น
6. consumer ใช้ claim/lease token, retry/backoff/dead letter จาก11 ตรวจ latest assignment ก่อนทำงาน/ack; receiptในฐานเดียวกันบันทึกพร้อมผลและack งานที่อำนาจหายต้องพักเป็นปัญหา ไม่ใช้สิทธิ์เก่าในjobข้ามdeny

| จุดที่จำลอง                            | ผลที่ต้องพิสูจน์ภายหลัง                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| crashก่อน domain commit                | ไม่มีช่วงถูกปิด ไม่มีreceipt/audit/outboxที่บอกสำเร็จ; retryทำได้                       |
| crashหลัง commit ก่อน ack              | retryพบreceiptเดิม ไม่เพิ่มhistory/close effect/audit/outboxเดิมซ้ำ                     |
| สอง worker ทำ activation เดียวพร้อมกัน | มีผลสำเร็จและreceiptหนึ่งชุด ผู้แพ้คืนreceiptหลังตรวจสิทธิ์หรือconflictตามpayload       |
| worker leaseหมดแล้วกลับมา              | tokenเก่าackหรือเขียน downstreamผลไม่ได้                                                |
| eventเก่ามาถึงหลังคำขอแก้ไข            | aggregate/revisionตรวจพบ stale ไม่ย้อนสถานะใหม่; บันทึกผล ignored/conflict ที่ติดตามได้ |

consumer ที่ต้องรักษาลำดับใช้ aggregate version และ causation reference เมื่อขาดเหตุการณ์ก่อนหน้าให้ retry/พักตรวจ ไม่ข้ามช่องว่างโดยสมมติว่าไม่มีผลกระทบ ไม่อ้างว่าworkerรันครั้งเดียว ข้อเสนอคือผลธุรกิจไม่ซ้ำจาก transaction/unique keys ต้องทดสอบกับ PostgreSQLจริง

## 5 ผลต่อสังกัด ตำแหน่ง สิทธิ์ และบัญชี

| เรื่องมีผล                | ผลต่อทะเบียน                                                                             | ผลต่อสิทธิ์/บัญชีที่ต้องรับรอง                                                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| ย้าย                      | ปิดสังกัด/ตำแหน่งต้นทางเฉพาะรายการ และเปิดรายการปลายทางที่คำอนุมัติระบุ ไม่แตะสังกัดอื่น | สิ้นสุดRoleAssignmentต้นทางที่ผูกฐานอำนาจนั้นตามแผนที่อนุมัติ ไม่เพิ่มปลายทางจากที่อยู่/ตำแหน่ง การเพิ่มต้องอนุมัติ scope/action/ช่วงเวลาแยกชัดเจน |
| ลาออก POSITION/EMPLOYMENT | ปิดเป้าหมายที่ระบุ ไม่เปลี่ยนreligious/lifestatus                                        | ตรวจสิทธิ์ที่สิ้นฐานอำนาจตามรายการ ไม่ถอนสิทธิ์อิสระจากหน้าที่อื่น                                                                                 |
| ลาสิกขา                   | บันทึกreligiousstatusที่รับรอง ปิดเฉพาะหน้าที่ที่กฎรับรองว่าต้องสิ้นสุด                  | ไม่ suspend บัญชีทั้งหมดโดยอัตโนมัติ คงสิทธิ์คฤหัสถ์ที่ยังมีฐานอำนาจ/ช่วงมอบหมาย ห้ามให้สิทธิ์คฤหัสถ์ใหม่เอง                                       |
| เสียชีวิต                 | บันทึกข้อเท็จจริงและประวัติ ณ วันมีผล ปิดหน้าที่/สังกัดที่กฎยืนยัน                       | วงจรบัญชีตาม08: ปฏิเสธบัญชีที่ยืนยันว่าเชื่อมPersonนี้ เพิกถอนsession/สิทธิ์ตามpolicyที่อนุมัติ และซิงก์provider ไม่ลบบัญชี ประวัติ หรือผลสอบ      |

RoleAssignmentต้องมี provenance ของฐานการมอบหมายและการอนุมัติ ห้ามหาgrantที่ต้องถอนจากorg_id/ที่อยู่เพียงอย่างเดียว ถ้าบัญชีมีสิทธิ์ที่ยังอ่านต้นทางได้จากการมอบหมายอื่นที่ถูกต้อง ให้รายงานฐานนั้นชัดเจนและใช้policyปัจจุบัน ไม่อ้างว่าการถอนgrantหนึ่งรายการทำให้หมดทุกสิทธิ์

ช่วงในอนาคตเป็นข้อมูลplannedจนถึงวันมีผล วันข้อเท็จจริง วันมีผลและวันบันทึกแยกกัน ตามกฎที่ยืนยัน งานย้อนหลังเปลี่ยนประวัติธุรกิจได้ด้วยrevision แต่ไม่ทำให้ย้อนหลังการเพิกถอนsessionที่เคยใช้งานไปแล้ว

### ระบบบัญชีในฐานกับ OIDC provider

ใช้บัญชีเดียวตามบท08ที่ผู้ใช้เลือก Auth.js/OIDC ไม่เพิ่ม login อีกชุด การ suspend/death action ในฐานทำให้ DAL/session gateway ตรวจบัญชีปัจจุบันแล้วdenyทันทีที่commit สำหรับAPI/export/download/job ไม่รอproviderปิดบัญชีสำเร็จ

คำสั่งปิดบัญชี/เพิกถอนprovider sessions อยู่นอกtransaction PostgreSQL จึงส่งผ่านoutbox พร้อมidempotency key/receipt/retryและรายงาน sync pending/failed หากproviderไม่มีสัญญารับซ้ำ ต้อง reconcileสถานะ ไม่อ้าง exactly once ภายนอก โหมดdevใช้sink/realmสมมติเท่านั้น ไม่ส่งแจ้งเตือนภายนอก

การแก้การระงับผิดไม่คืนsession/tokenเดิม ผู้ใช้ต้องผ่านlogin/MFAใหม่ตามหน้าที่และpolicyปัจจุบัน สิทธิ์ที่อนุมัติคืนไม่รวมการกู้ password/recovery code หรือซ่อนเหตุการณ์ถอนสิทธิ์ครั้งก่อน

## 6 คำขอแก้สถานะผิดและการคืนสิทธิ์

เสนอ correction request เป็นประเภทคำขอผ่านworkflowกลาง16/11 อ้าง origin request/revision, activation receipt/event, affected history/grant/account revisions, เหตุผลและFileVersionหลักฐาน พร้อมรายการ desired changes ไม่สร้างengineแก้ไขแยก

ขั้นตรวจประกอบด้วยผู้ร้องที่มีสิทธิ์ เสนอรายการแก้และผลกระทบ ผู้ตรวจพิจารณาหลักฐาน และผู้มีอำนาจอนุมัติการแก้ทะเบียนกับการคืนgrantตามหน้าที่ ผู้สร้างห้ามอนุมัติของตน แม้เป็นtechnicaladmin ทุกครั้ง pinrevisionใหม่ไม่ยืมapprovalของเรื่องต้นทาง

| สิ่งที่แก้                            | วิธีที่เสนอ                                                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| สถานะ/ช่วงหน้าที่ที่บันทึกผิด         | เพิ่ม corrective event/history revision พร้อม replaces/supersedes และ origin reference; preservedฉบับเก่ายัง query known_at ได้                      |
| ข้อมูลอื่นเกิดขึ้นหลังเหตุการณ์ต้นทาง | ตรวจ latest versions และ capacity/overlapใหม่ ห้าม overwriteจากbefore snapshot หากขัดกันให้conflict/ตรวจแผนใหม่                                      |
| สิทธิ์ที่ขอคืน                        | ระบุ RoleAssignmentอ้างเดิม, role/action/scope/สาย/ช่วงเวลาใหม่, ฐานอำนาจและ decision ที่อนุมัติ เปิดgrantใหม่หรือrevisionตาม07 ไม่ลบ revocationเดิม |
| สิทธิ์เดิมหมดอายุหรือฐานอำนาจหาย      | ไม่ restore เว้นมีคำอนุมัติปัจจุบันใหม่ครบเงื่อนไข; คืนเฉพาะรายการที่ผ่าน ไม่อนุมานจากสถานะPersonที่ถูกแก้                                           |
| บัญชีที่ระงับจากเหตุผลอื่นด้วย        | ยังdenyจนเหตุผลอื่นถูกแก้โดยวงจรบัญชี08 การแก้deathผิดเพียงเรื่องเดียวไม่เปิดบัญชีที่ถูกระงับด้วยอีกเหตุผล                                           |
| คำขอแก้ไขถูกแก้ผิดอีกครั้ง            | สร้างคำขอถัดไปอ้าง corrective eventล่าสุดและต้นทาง เก็บ chain มีรุ่นตรวจ stale/cycle ไม่แก้auditเดิม                                                 |

แผนที่ approved แล้วอาจทำให้มีผลไม่ได้เมื่อข้อมูล/สิทธิ์เปลี่ยน ระบุ approved แต่ activation blocked/conflict จนผ่านการทบทวน ห้ามอ้าง effective หรือคืนgrantครึ่งชุดนอกtransaction เพียงเพื่อปิดงาน

ผลกระทบย้าย/ลาสิกขา/เสียชีวิตต้องทดสอบแยกกัน ไม่มีกฎ generic rollback ที่เปิดทุกตำแหน่ง ทุกสังกัด และทุกสิทธิ์ รวมถึงไม่สร้างเหตุการณ์แจ้งเตือนซ้ำจากการreplayเหตุการณ์เก่า

## 7 รายงานผลกระทบและงานค้าง

รายงานมี report ID/version, request revision, effective date, observed_at, target versions, policy version, รายการผลที่เสนอ/ผู้อนุมัติ/สถานะ adapter และcorrelation ไม่มีsecret รายงานอ่าน/ส่งออกผ่าน current scope/fieldpolicyเดียวกับ15 เหตุผล/ตัวตน/เอกสารprivateไม่เปิดจากtrackingURL

| ขอบเขต            | สิ่งที่รายงาน/ติดตาม                                                                      | สิ่งที่รักษาไว้                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| ตำแหน่ง/สังกัด    | เป้าหมายที่จะปิด/ปรับ ผลcapacity และการมอบหมายที่ยังมีผล                                  | ฉบับและหลักฐานเดิมตามeffective_date/known_at                                    |
| บัญชี/สิทธิ์      | grantที่จะสิ้นสุด/คงไว้/เสนอเพิ่มหรือคืนพร้อมฐานอำนาจ; sessions และ provider sync pending | audit/provenanceเดิม; ไม่ใส่token/sessionsecret                                 |
| ผู้รับเอกสาร      | รายการรับผิดชอบปัจจุบันที่ต้องเสนอมอบใหม่และผู้ตรวจ; recipientsnapshotของเอกสารเดิม       | ไม่ rewriteผู้รับหนังสือที่ส่งแล้ว ไม่ resend/เปิดไฟล์ให้ผู้รับใหม่โดยอัตโนมัติ |
| รายการค้าง        | อนุมัติค้าง งานรับเอกสาร/export/job และหน้าที่ที่ต้องเจ้าของตัดสินใจตามโมดูลที่สร้างจริง  | ไม่ข้ามbusinessinvariant ไม่เปลี่ยนเจ้าของ/อนุมัติรายการอัตโนมัติ               |
| ผลสอบ/ประวัติอื่น | ตรวจเฉพาะความสัมพันธ์ที่policyจำเป็น                                                      | ไม่ลบหรือเปลี่ยนผลสอบ/คะแนน/หลักฐานจากการเปลี่ยนสถานะPerson                     |

adapterต้องเป็นบริการserverที่ลงทะเบียนของโมดูลเจ้าของและตรวจสิทธิ์ ไม่ให้clientส่งSQL/model/objectkey ถ้าโมดูลหรือmappingผู้รับเอกสาร/งานค้างยังไม่สร้าง ให้ระบุ **UNKNOWN / NOT IMPLEMENTED** ไม่แสดงจำนวน0หรือ“ไม่มีผลกระทบ” Required adapter ที่กฎกำหนดแต่ยังunknownต้องบล็อกactivation ไม่อ้างรายงานครบทั้ง9ระบบ

รายการที่ไม่บังคับให้เสร็จในactivation เช่น งานเสนอมอบหมายผู้รับเอกสารใหม่ อาจเป็น follow-up item/outbox ในtransactionเดียวกัน มีowner/สถานะ/เวลา/การยืนยัน/receipt ตรวจสิทธิ์ที่เวลาทำจริงไม่ให้ workerรับสิทธิ์ผู้รับใหม่อัตโนมัติ เก็บรายงานรุ่นเดิมกับรุ่นแก้ ไม่เผยรายละเอียดprivateในnotification/log

## 8 แผนตรวจรับ — ทุกกรณี NOT RUN

ใช้Person/บัญชี/หน่วยงานที่ติดDEMOชัดเจน ไม่มีข้อมูลคนจริง ต้องมี native PostgreSQL, authz/auth/files/workflow และservice16จริงก่อนรัน คำสั่งsmokeของstarterและSQLWASMcoreไม่พิสูจน์เกณฑ์นี้

| รหัส   | การทดสอบที่ต้องทำ                                                               | ผลที่ต้องได้                                                                                                     |
| ------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| P17-01 | activation eventเดิมซ้ำ และUUIDใหม่แต่request/revisionเดิม                      | ช่วงตำแหน่ง/สังกัดปิดครั้งเดียว receipt/history/audit/outboxหนึ่งผลตามbusinesskey                                |
| P17-02 | สองworkerแข่ง; crashก่อนcommit/หลังcommitก่อนack; leaseเก่ากลับ                 | atomicrollbackหรือreceiptเดิม tokenเก่าเขียนไม่ได้ ไม่มีผล/notificationซ้ำตามkey                                 |
| P17-03 | eventย้อนลำดับ/ขาดversion และeventเดิมหลังcorrection                            | ไม่ย้อนทะเบียนล่าสุด มีpending/conflict/ignoredที่ติดตามได้                                                      |
| P17-04 | ย้ายเฉพาะสังกัดA มีอีกสังกัด/หน้าที่B                                           | Aปิดตามแผน Bไม่ถูกปิด; oldgrantที่สิ้นฐานถูกถอน ปลายทางไม่มีgrantจนอนุมัติ และURL/export/jobใช้สิทธิ์ปัจจุบัน    |
| P17-05 | ลาสิกขาพร้อมสิทธิ์คฤหัสถ์ที่ยังมีผล                                             | ไม่suspendทั้งหมด ไม่ให้grantใหม่อัตโนมัติ สิ้นเฉพาะหน้าที่/สิทธิ์ที่กฎรับรอง                                    |
| P17-06 | deathถึงวันมีผล OIDCproviderล้มเหลวและworkerretry                               | accountDAL/API/job/downloaddenyทันทีในฐาน syncpending/retryเห็นได้ ประวัติ/ผลสอบไม่ถูกลบ                         |
| P17-07 | correctionapprovedคืนหนึ่งgrant มีอีกgrantหมดอายุ/บัญชีระงับอีกเหตุ             | คืนเฉพาะรายการที่อำนาจ/ช่วงผ่าน ไม่เปิดบัญชีที่ยังมีเหตุระงับ ไม่คืนtoken/sessionเก่า                            |
| P17-08 | makerอนุมัติตัวเอง/ไม่มีอำนาจrestore/หลักฐานquarantine/targetเปลี่ยนระหว่างตรวจ | denyหรือconflict ไม่มีdomainwritesหรือgrantกลับ                                                                  |
| P17-09 | ค้นอดีต/known_atก่อนและหลังcorrection และretrycorrection                        | ต้นทาง/เหตุผล/หลักฐานผ่านACLยังตรวจได้ auditimmutableและcorrectionไม่ซ้ำ                                         |
| P17-10 | adapterผู้รับเอกสาร/งานค้างขาดและการtamperreport/ID/fields/export               | UNKNOWNไม่ใช่0 requiredgapบล็อก ผู้ไม่มีgrantไม่เห็นรายงาน/เหตุผล/filemetadata ไม่มีPII/secretในpublic/cache/log |
| P17-11 | วันมีผลใกล้เที่ยงคืนไทย/อนาคต/ย้อนหลังขัดช่วง                                   | ใช้Asia/Bangkok+dateมาตรฐาน plannedยังไม่effective ไม่ปิดช่วงติดลบหรือclampวันเอง                                |

ยังไม่มี test entrypoint ของ17 จึงไม่ให้คำสั่งสมมติที่อ้างว่ารันได้ ต้องเพิ่มintegration/fault-injection testsเมื่อเริ่มimplementation และบันทึกcommands/resultจริง ไม่เปลี่ยน NOT RUN เป็น PASSจากการตรวจMarkdown

## 9 สถานะ dependency และขั้นต่อไป

app/schema `0.6.0`, Prisma `7.10.0`, core19models/213scalarfields/migration1 ไม่มี model/consumer ของ17เพิ่ม core migrationยัง `20261003130000_core_foundation` checksum `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756`

Q027/DB-06ยังเปิดจากผลnativeDBที่บันทึกใน [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md) บท16ยังเป็นเอกสาร ไม่ใช้ metadataDocument หรือServiceActorเดิมแทนFileVersion/บัญชี/authority ต้องปิด06และfoundation07–12 รวม13–16ก่อนhandlers17

Q002/Q005/Q006ต้องฐานการมอบหมาย/ผู้มีอำนาจถอนคืน/ผู้ตรวจการแก้ผิด; Q023ต้องบัญชีbinding/session/IdP reconciliation; Q024ต้องผลต่อหน้าที่/ช่วงย้อนหลัง/ลำดับcorrection; Q008/Q016/Q025ต้องรายงาน/audit/evidence/retention; Q011ต้องtransaction/worker/retry/providerและadapterของโมดูลที่สร้างจริง ทุกกฎทางการยัง TO VERIFY จนมีหลักฐานรับรอง

ก่อนเขียนโค้ดจริงต้องมีแผนไทยไม่เกิน10บรรทัดและการอนุมัติเฉพาะบทตาม [00_MASTER_PROMPT](../00_MASTER_PROMPT.md) ข้อ2 รายงานนี้ไม่ได้ปิดเกณฑ์17 และยังไม่เลื่อนไปบท18
