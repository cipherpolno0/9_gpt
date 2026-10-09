# คิวตรวจและคำตัดสิน — บท 32

รุ่น 0.1 | 4 ตุลาคม 2569 (2026-10-04) | source `985c180` | **Proposal / BLOCKED — ไม่มีหน้า queue หรือ decision service ที่ใช้งานได้**

บท 31 ยังไม่ผ่านตาม [REQUEST_SUBMISSION](REQUEST_SUBMISSION.md) โมดูลคำขอมีเพียง README ไม่พบ User, RoleAssignment, Scope, ChangeRequest, RequestVersion, WorkflowInstance, StepDecision หรือ FileVersion ใน Prisma schema เอกสารนี้เตรียมงานบท 32 ไม่ใช่โค้ดหรือผลตรวจรับ ไม่สร้าง engine อนุมัติ บัญชี หรือทะเบียนใบสมัครอีกชุด

อ่านร่วมกับ [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md), [ORG_CENTER_REQUEST_SCHEMA](ORG_CENTER_REQUEST_SCHEMA.md), [REQUEST_IMPACT_CHECKS](REQUEST_IMPACT_CHECKS.md), [PERMISSIONS](PERMISSIONS.md) และ [ADR002](ADR/002-core-database.md)

## 1 แนวคิดทีละขั้น

1. คิวเป็นมุมมองของคำขอที่ส่งแล้วและขั้นตอน workflow กลาง ไม่ใช่ทะเบียนคำขออีกชุด
2. ผู้ตรวจอ่านรุ่นที่ส่ง หลักฐาน และผลกระทบ แล้วให้ความเห็นหรือส่งกลับ ผู้อนุมัติตัดสินตามอำนาจที่ยังใช้ได้ขณะบันทึก
3. คำตัดสินผูกกับรุ่นคำขอ รอบตรวจ ขั้นตอน รุ่นกฎ และหลักฐาน หากข้อเสนอเปลี่ยน คำตัดสินเก่าไม่อนุมัติรุ่นใหม่
4. เลขรุ่นป้องกันคนสองคนตัดสินจากข้อมูลเก่า ส่วน receipt ป้องกันคำสั่งเดิมทำซ้ำ ทั้งสองทำงานร่วมกับ transaction
5. อนุมัติไม่ได้แปลว่าทะเบียนเปลี่ยนแล้ว การทำให้มีผลต้องตรวจเงื่อนไขปัจจุบันผ่านเจ้าของข้อมูลตามบท 30

## 2 คิวตามระดับ พื้นที่ และหน้าที่

เส้นทางเสนอ `/app/requests/review` และ `/app/requests/review/[request_id]` ยังไม่มีหน้าเว็บจริง คิวใช้ current DAL ของบท 07/08 ตรวจบัญชี session action ประเภทคำขอ ขั้นตอน สายสังกัด scope และช่วงมอบหมายก่อน query รวมถึง counts, facets, pagination, export, notification และหลักฐาน ปฏิเสธเมื่อไม่มี policy ที่ตรง

ระดับตำบล อำเภอ จังหวัด ภาค และส่วนกลางเป็นตัวกรองที่ใช้ได้เฉพาะภายในสิทธิ์ ไม่ให้อำนาจจากชื่อระดับ ผู้ตรวจสายการศึกษาของจังหวัด A ไม่ได้รับสิทธิ์สายปกครองหรือจังหวัด B อัตโนมัติ descendant scope คำนวณจากความสัมพันธ์กลางที่ยืนยันและช่วงเวลาที่ policy กำหนด ไม่เชื่อ `org_id`, `level`, `role`, `assigned_to` หรือ scope จาก client

DTO คิวเสนอ: request reference, ประเภทเรื่อง, เป้าหมายที่อ่านได้, submitted version, review cycle, step, workflow version, วันส่ง, วันขอมีผล และข้อความสถานะผลกระทบ ตัด reason, PII, object key และหลักฐานออกจากรายการ หลักฐานแต่ละ FileVersion ต้องตรวจ scan และ ACL เพิ่มก่อน preview/download ไม่ถือว่ามีสิทธิ์คิวแล้วอ่านไฟล์ได้ทั้งหมด

หน้ารายละเอียดแสดงรุ่นคำขอที่ส่ง ข้อมูลก่อน/หลังที่อนุญาต และสถานะผลกระทบแยกจากทะเบียนปัจจุบัน ระบุวันที่อ้างอิง รุ่นและเวลาประเมิน diff ฝั่ง server ตาม allowlist ไม่ส่ง private fields ไปให้ browser สร้าง diff เอง

| UI state                 | ข้อความ/พฤติกรรมเสนอ                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------- |
| loading                  | “กำลังโหลดงานที่คุณมีสิทธิ์ตรวจ” พร้อมสถานะสำหรับโปรแกรมอ่านหน้าจอ                     |
| empty                    | “ไม่พบงานตามตัวกรอง ลองล้างตัวกรองหรือตรวจช่วงมอบหมาย” ไม่เปิดจำนวนงานนอก scope        |
| forbidden / unavailable  | “ไม่พบงานที่คุณมีสิทธิ์ดำเนินการ” ไม่เปิดชื่อหรือเหตุผลของเรื่องนอกพื้นที่             |
| evidence pending         | “เอกสารยังไม่พร้อมใช้ตรวจ” ไม่สร้าง preview หรือ download link                         |
| impact not ready         | “ยังตรวจผลกระทบไม่ครบ จึงอนุมัติไม่ได้” ไม่แสดง unknown เป็นศูนย์                      |
| conflict                 | “มีผู้ดำเนินการหรือเปลี่ยนข้อมูลแล้ว กรุณาโหลดใหม่และตรวจทานก่อนตัดสิน” ไม่ auto retry |
| approved awaiting effect | “อนุมัติแล้ว — ยังไม่มีผลต่อทะเบียน” แสดงแยกจากสถานะทะเบียน                            |

## 3 อำนาจและ delegation

ข้อกำหนดทางการของทุก C30-01–10 ยัง **TO VERIFY** ตาม Q005/Q006 ใช้ configuration ทดลองที่ติด DEMO/Proposal ได้เมื่อส่วนกลางพร้อม ไม่แต่งชื่อแบบ ผู้มีอำนาจ จำนวนเสียง หรือลำดับอนุมัติทางการ

| ผู้กระทำ                | คำสั่งที่เสนอ                           | เงื่อนไขขั้นต่ำ                                                                        |
| ----------------------- | --------------------------------------- | -------------------------------------------------------------------------------------- |
| ผู้ยื่น/ผู้สร้างข้อเสนอ | ดูของตนและแก้ returned ผ่านบท 31        | ไม่มีสิทธิ์ review/approve งานตนจากการเป็นเจ้าของ                                      |
| ผู้ตรวจ                 | รับตรวจ เสนอความเห็น ส่งกลับพร้อมเหตุผล | active assignment ตรงขั้น ประเภทเรื่อง สาย/พื้นที่และเวลา; ไม่ใช่ maker                |
| ผู้อนุมัติ              | อนุมัติหรือปฏิเสธพร้อมเหตุผล            | อำนาจปัจจุบันตรงขั้น/ประเภท/พื้นที่; หลักฐานและ impact พร้อมเมื่ออนุมัติ; ไม่ใช่ maker |
| ผู้รับมอบอำนาจ          | คำสั่งภายในขอบเขตที่มอบเท่านั้น         | หลักฐานมอบหมายยังมีผล ผู้มอบมีอำนาจ ขอบเขตย่อยไม่กว้างกว่าเดิม และไม่มีการเพิกถอน      |
| ผู้ตรวจสอบ              | อ่านตามภารกิจที่ได้รับมอบหมาย           | read only; field/ไฟล์มี policy แยก                                                     |
| ผู้ดูแลเทคนิค           | จัดการระบบตามสิทธิ์เทคนิค               | ไม่มี review/approve ธุรกิจโดยปริยาย                                                   |

maker ประกอบด้วยผู้สร้างคำขอ ผู้สร้าง/ผู้แก้สาระสำคัญของรุ่นที่ส่ง และ principal ผู้มอบที่อ้างอำนาจในการตัดสิน ต้องมี provenance ฝั่ง server ไม่ให้ผู้ยื่นมอบอำนาจผู้อื่นเพื่ออนุมัติเรื่องตน การห้ามผู้ตรวจซ้ำผู้อนุมัติใช้กฎที่ pin และได้รับรับรอง ไม่สมมติว่าหลาย role ล้างข้อห้ามได้

ช่วงมอบหมายใช้ `[valid_from, valid_until)` เวลา server ที่จุดตรวจสิทธิ์หลังได้ lock ก่อนตัดสิน; valid_until ว่างใช้ได้เฉพาะ policy ที่ยอมรับ ต้องทดสอบ clock ที่เดินระหว่างรอ lock ไม่ใช้เวลาเริ่ม transaction อย่างเดียว การถอนสิทธิ์กับ decision ใช้การประสาน lock/version เดียวกันใน DAL: ถอนที่ commit ก่อนจุดอนุญาตต้อง deny ส่วนสองคำสั่งที่แข่งต้องมีลำดับและ audit ตรวจได้ ไม่ให้ browser session claim หรือ queue snapshot เป็นสิทธิ์ถาวร

## 4 สัญญาบริการเสนอ — ยังไม่มี implementation

ทุก entrypoint ตรวจ session/CSRF ตามส่วนกลาง และเรียกบริการเดียวกัน ตรวจ server-only/DAL/RLS กับ runtime role จำกัดทั้ง direct API, Server Action และ worker

| Service ref | บริการเสนอ          | input ที่ให้ client ส่ง                                                                         | กฎสำคัญ                                                                                            |
| ----------- | ------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| S32-01      | listReviewQueue     | filters/page/cursor แบบ allowlist                                                               | clamp pagination; scope อยู่ใน SQL ก่อนนับ/แบ่งหน้า; ไม่กรอง unauthorized rows หลัง query          |
| S32-02      | getReviewDetail     | request_id                                                                                      | resolve typed target ฝั่ง server; DTO/ไฟล์/impact ตรวจสิทธิ์แยก                                    |
| S32-03      | claimReview         | request_id, expected workflow version, cycle, operation key                                     | submitted → reviewing ตาม workflow11; claim ไม่ให้อำนาจเพิ่มหรือจองสิทธิ์ตลอดไป                    |
| S32-04      | recordReviewOpinion | request_id, version/cycle/step, expected workflow version, reason, evidence refs, operation key | append ความเห็น; ไม่ใช่คำตัดสินสุดท้าย ไม่เปิดทะเบียน                                              |
| S32-05      | returnForCorrection | pins เดียวกับ S32-04 และเหตุผล                                                                  | reviewing → returned; รักษาคำตัดสิน/หลักฐานรอบเก่า; resubmit ใช้ header เดิมตาม31                  |
| S32-06      | decideRequest       | pins เดียวกัน, APPROVE/REJECT, reason, operation key                                            | current approver/maker-checker; APPROVE ต้อง impact gate; ไม่รับ actor/grant/hash/score จาก client |

pins ต้องมี RequestVersion, workflow row_version, review_cycle, step และ impact manifest ที่ตรวจ โดย server ยืนยัน ownership/hash/rule version อีกครั้ง ไม่ใช้ client hash เป็นหลักฐานความถูกต้อง reason เป็นข้อมูลจำกัดสิทธิ์ ไม่ใส่ body เต็มลง audit หรือ conflict error

## 5 Transaction และการอนุมัติแข่ง

ข้อเสนอนี้ต่อ transaction ของ workflow11 ไม่สร้าง decision store อีกชุด:

1. Resolve current actor แล้วตรวจ policy เบื้องต้น เปิด transaction และ lock request/workflow/authority guard/target guard ตามลำดับเดียวกับบริการถอนสิทธิ์และแก้คำขอที่ส่วนกลางเลือกไว้
2. ตรวจสิทธิ์ซ้ำหลังรอ lock ด้วยเวลา server จริง ตรวจ active account, assignment/delegation, maker และ typed resource ไม่ถือว่าการอ่านคิวครั้งก่อนให้สิทธิ์ตัดสิน
3. ตรวจ operation receipt ภายใต้สิทธิ์ปัจจุบัน key/payload เดิมคืน receipt ของรุ่นเดิม; key เดิม payload ต่าง conflict ผู้หมดสิทธิ์ไม่ได้อ่านรายละเอียด receipt เก่า
4. ตรวจสถานะ reviewing, submitted RequestVersion/cycle/step และ expected workflow version; ตรวจหลักฐานและผลกระทบตาม [REQUEST_IMPACT_CHECKS](REQUEST_IMPACT_CHECKS.md) หาก mismatch หยุดโดยไม่บันทึกความสำเร็จ
5. CAS workflow ด้วย id + expected version + cycle + step + expected status; ต้องเปลี่ยนหนึ่งแถว บันทึก StepDecision, receipt, audit_logs และ outbox ใน transaction เดียว หากล้มเหลว rollback ทั้งชุด
6. commit แล้วจึงตอบผล แจ้งเตือนผ่าน outbox กลาง/dev sink ตรวจ current recipient policy; ส่งแจ้งเตือนไม่ได้ไม่ย้อนคำตัดสินที่ commit แล้ว

unique(instance, cycle, step, reviewer) ของแบบ11อย่างเดียวกันผู้อนุมัติคนละคนไม่ได้ เมื่อเลือก DEMO ขั้นตัดสินสุดท้ายหนึ่งชุด ต้องเพิ่มข้อจำกัดกลางที่บังคับหนึ่ง terminal resolution ต่อ `(instance_id, review_cycle, step_code)` แยกจากความคิดเห็นหลายรายการ จะใช้ partial unique constraint หรือ step resolution กลางต้องบันทึก ADR/migration ใหม่และ native tests ก่อนใช้ ไม่เพิ่ม unique ทุก StepDecision จนความคิดเห็นหรือขั้น quorum ใช้ไม่ได้ กฎหลายเสียงทางการยัง TO VERIFY

ผู้อนุมัติสองคนอ่าน version เดียวกันและกดพร้อมกัน: หนึ่ง transaction สำเร็จ อีกคนได้ HTTP409 `REQUEST_REVIEW_CONFLICT` ไม่มี terminal decision/receipt/outbox success ชุดที่สอง ไม่เพิ่ม expected version ให้อัตโนมัติ ไม่แสดงชื่อผู้ตัดสินอีกคนหรือเหตุผลที่ไม่มีสิทธิ์ การ retry key เดิมหลัง ACK หายคืน receipt เดิม ไม่ตอบ conflict แทนงานเดิมที่สำเร็จแล้ว

Conflict ที่เกิดกับหลาย resource/serialization อาจคืน error ที่แปลงเป็นข้อความปลอดภัย ไม่รันการอนุมัติรุ่นใหม่ด้วยการ retry แบบไม่ให้ผู้ตรวจอ่านใหม่ เหตุการณ์ deny/conflict เก็บ audit ขั้นต่ำแยกจาก transaction ที่ rollback ตาม11

## 6 รุ่นที่อนุมัติและการแก้สาระสำคัญ

seal RequestVersion รวม target/type/year/session/effective_on/เหตุผล/หลักฐาน/แผนผลกระทบ/รุ่นกฎ ผูก terminal decision กับรุ่นนี้ผ่าน FK ที่ตรวจ ownership; content/hash ของรุ่นที่ seal แก้ไม่ได้ผ่าน UI, service หรือ runtime SQL role

returned correction เพิ่ม revision และ review_cycle ใน workflow instance เดิม ไม่สร้างคำขอซ้ำ คำตัดสินเก่าเป็นประวัติ ไม่เป็น grant รุ่นใหม่ หากแก้สาระสำคัญหลัง approved ต้องคำขอแก้ไขที่อ้างต้นเรื่องและตรวจใหม่ตาม30 ไม่เปิด approved กลับมาแก้ด้วยการ update status ไม่แก้ audit เดิม ห้าม activation นำ latest draft หรือแผนรุ่นใหม่มาใช้กับคำอนุมัติเก่า

ขอบเขต “สาระสำคัญ” ต้อง config มีรุ่นและ Q006/Q024 รับรอง ค่าเริ่มต้นทดลองให้ถือ target/type/วันมีผล/สถานที่/หลักฐาน/แผนและข้อมูลที่มีผลต่อ authority/impact ว่าต้องตรวจใหม่ ไม่เดาว่าช่องว่างอื่นแก้แล้วไม่กระทบ

## 7 แผนตรวจรับ — ทุกกรณี NOT RUN

fixture เสนอเป็น `DEMO_REQUESTER_A`, `DEMO_REVIEWER_A`, `DEMO_APPROVER_A1`, `DEMO_APPROVER_A2`, `DEMO_APPROVER_B`, `DEMO_DELEGATE_A`, `DEMO_TECH_ADMIN` อ้าง User/Person กลางเมื่อสร้างจริง ไม่มีบัญชีหรือ seed เพิ่มในบทนี้

| Case ref | การทดสอบที่ต้องรันจริง                                                                             | ผลที่ต้องพิสูจน์                                                                          |
| -------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| P32-01   | คิวหลายระดับ/สองสาย/พื้นที่A-B; เปลี่ยน URL/body/query/cursor/count/export                         | เห็นเฉพาะงานตาม current scope; ไม่มี metadata นอกขอบเขต                                   |
| P32-02   | ผู้ยื่นเรียก approve API/Action โดยตรงหรือถือหลาย role                                             | deny; decision/receipt success/outbox ไม่มีเพิ่ม                                          |
| P32-03   | ผู้ไม่มี approver grant/เทคนิค/ผู้ตรวจ-only เรียก APPROVE/REJECT                                   | deny แม้เห็นหน้า/ทราบ request_id                                                          |
| P32-04   | delegation ก่อนเริ่ม/ช่วงใช้งาน/วันสิ้นสุด/ถอน/ผู้มอบหมดอำนาจ/เกินscope/ผู้มอบเป็นmaker            | อนุญาตเฉพาะที่ครบ; เวลาserver/ขอบวันไทยไม่client clock                                    |
| P32-05   | เปิดคิวแล้ว suspend/revoke หรือสิทธิ์หมดระหว่างรอ lock                                             | API และ worker deny หลังจุดถอน/หมดสิทธิ์; audit มีลำดับที่พิสูจน์ได้                      |
| P32-06   | ผู้ตรวจส่งความเห็น/ส่งกลับ ผู้ร้องแก้และ resubmit                                                  | header/instance เดิม, cycle ใหม่, คำตัดสินเก่าไม่หายและไม่อนุมัติรุ่นใหม่                 |
| P32-07   | สอง independent PostgreSQL connections ตัดสินขั้นสุดท้ายด้วย version เดียว ใช้ barrier ให้แข่งจริง | success หนึ่ง/409หนึ่ง; terminal decision หนึ่งชุด, audit/outbox/receipt success หนึ่งชุด |
| P32-08   | ACKหาย retry key/payload เดิม; keyเดิม payloadต่าง; เปลี่ยนkeyขณะversionเก่า                       | receiptเดิมเมื่อมีสิทธิ์; conflictเมื่อpayload/versionไม่ตรง; ไม่สร้างคำตัดสินซ้ำ         |
| P32-09   | สาระสำคัญหรือหลักฐานเปลี่ยนระหว่างอ่านกับตัดสิน; raw SQL แก้ sealed version                        | conflict/constraint deny; รุ่นและคำตัดสินเก่ายังตรวจได้                                   |
| P32-10   | ยุบ/ปิดมีผู้สมัคร แผนขาด/ไม่มีผู้รับรอง/ปลายทางเต็ม                                                | approveไม่ได้; ไม่ลบหน่วยงานหรือย้ายใบสมัครเอง                                            |
| P32-11   | impact adapterหาย/ล่ม/อ่านไม่ครบ/ข้อมูลใหม่หลังประเมิน                                             | NOT_READY/STALE ไม่แปลงunknownเป็น0; ไม่มีactivation                                      |
| P32-12   | ทุกC30-01–10 เทียบ before/after และ dependencies 4ด้าน                                             | manifestตรงtype/ปี/พื้นที่/sourceversion; public DTOไม่เปิดชื่อผู้สมัครหรือเบอร์ส่วนตัว   |
| P32-13   | faultหลังCAS/ก่อนdecision/audit/outbox; workerหยุดแล้วกลับมา                                       | rollbackครบหรือreceiptที่commitแล้วครบ; devsinkไม่แจ้งซ้ำตามdedupe                        |
| P32-14   | rejected/returned/approvedรอวันมีผล และแก้แผนใหม่ภายหลัง                                           | ทะเบียน/application/RoleAssignment/historyเก่าไม่เปลี่ยนจากคำตัดสินหรือlatestdraft        |
| P32-15   | เปลี่ยนID/filekey; quarantine/ถอนACL; HTML/RSC/cache/search/notif/export/privatecanary             | server deny/projectionไม่มีprivateข้อมูล; documentgatewayตาม10                            |
| P32-16   | keyboard ThaiIME/labels/เหตุผล/errors/focus/conflict และ375/768/1024/1440                          | ส่งคำตัดสินได้เมื่อมีสิทธิ์; statusมีข้อความ; conflictกลับมาตรวจใหม่ ไม่ auto submit      |

ไม่มี test runner ของบท32 ไม่มี API ผ่านทั้งสองเกณฑ์ และยังไม่ได้จำลอง concurrency จริง เก็บหลักฐาน source/migration/fixture/authority/clock/version/cycle/DBcounts/HTTP/correlation ในพื้นที่ private ไม่ commit token/secret/เหตุผลเต็ม/ไฟล์หลักฐาน

## 8 Gate และแหล่งเทคนิค

ต้องตรวจรับ31และ dependency ก่อน: DB-06/native PostgreSQL → ส่วนกลาง07/08/10/11 → ทะเบียนและ typed requests30 → wizard31 → queue/decision32 การลงมือโค้ดต้องแผนตาม MASTER ข้อ2; แผน07เดิมที่อนุมัติยังใช้ได้ ไม่ขอซ้ำเพื่อแก้ dependency เดิม บท33ยังไม่เริ่มและไม่เดาขอบเขต

เอกสารทางการที่อ่าน4ตุลาคม2569: [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) รองรับ deny by default และตรวจทุก request; [PostgreSQL18 Explicit Locking](https://www.postgresql.org/docs/18/explicit-locking.html) อธิบาย row locks และ lock ordering ข้อเสนอ transaction/terminal resolution ด้านบนเป็นการออกแบบโครงการ ต้องพิสูจน์กับฐานและ migrations จริง ไม่ใช่คำรับรองว่า locks อย่างเดียวป้องกันทุกกรณีได้
