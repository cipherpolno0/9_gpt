# นโยบายและสัญญาเผยแพร่ผลสอบรายปี — บท 39

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) | source `cffcf98` | **Proposal / BLOCKED — ยังไม่มี release services, schema หรือ public endpoint จริง**

## 1 สถานะและแนวคิด

ผลรับรองของบท38กับสิทธิ์เผยแพร่เป็นคนละขั้น ผู้รับรองคะแนนไม่ได้รับอำนาจเผยแพร่โดยอัตโนมัติ และผู้ดูแลเทคนิคไม่เป็นผู้อนุมัติธุรกิจ บท38ยัง BLOCKED ตาม [RESULT_CERTIFICATION](RESULT_CERTIFICATION.md) จึงไม่มีผลรับรองให้บทนี้นำไปเผยแพร่ การเขียนสัญญานี้ไม่ใช่การผ่านเกณฑ์หรืออนุมัตินโยบายจริง

ตรวจ repository: Prisma0.6.0 มี19models ไม่มี ResultRelease, ResultReleaseItem, ResultDraft, Publication, PublicationPolicy, ApplicationSnapshot, User, RoleAssignment, WorkflowInstance, OutboxEvent หรือ FormTemplateRegistry ที่รันได้ exams/exam-imports มีเพียง README; ยังไม่มีหน้า `/exams/results` หรือบริการค้นผล private route เป็นbootstrap403 ไม่ใช่ DAL ที่ตรวจสิทธิ์สมบูรณ์ ไม่สร้าง login/ทะเบียนบุคคล/ฐานผลสอบอีกชุดเพื่อข้าม prerequisite

กฎเผยแพร่ชื่อ ผลเด็ก ระยะเผยแพร่ ผู้มีอำนาจ และรูปแบบ ศ.4/ศ.8 ยัง **TO VERIFY** ตาม Q003/Q005/Q008/Q014/Q016/Q025 ไม่มีไฟล์ทางการหรือนโยบายอนุมัติในงานนี้ โหมดจริงต้องปิดไว้ โหมดทดลองภายหลังใช้ชื่อสมมติพร้อมป้าย “ข้อมูลทดลอง ไม่ใช่ผลสอบทางการ” และนโยบาย DEMO แยกจาก OFFICIAL

## 2 ใช้โครงสร้างกลางเดิมและเสนอ delta

logical04 ใน [DATA_DICTIONARY](DATA_DICTIONARY.md) มี `result_release`, `result_release_item`, `publication`, `publication_policy` อยู่แล้ว แต่ทั้งหมดเป็น Proposal ไม่ใช่ Prisma models ใช้โครงนี้ร่วมกับทะเบียน05และ importer09 ไม่สร้าง public copy ของ Person หรือ Candidate

| ส่วน | ข้อมูลที่ pin และ delta ที่เสนอ | ขอบเขต |
| --- | --- | --- |
| ResultRelease | result_draft_id, release_no, approval_decision_id, supersedes_release_id, sealed_at เดิม; เพิ่ม series/context binding, version, certified manifest/hash, rule version, correction reason/evidence refs | immutable payload อ้างชุดผลที่รับรองแล้ว |
| ResultReleaseItem | result_release_id/result_draft_item_id/result_draft_id composite context เดิม; ชื่อ/สังกัด/outcome snapshot; เพิ่ม ApplicationSnapshot version, typed year/type/level/stage/offering context และ pass classification ที่รับรอง | snapshot ของปีนั้น ไม่ join ชื่อปัจจุบัน |
| Publication | result_release_id/publication_policy_id/approval_decision_id/published_at/withdrawn_at/published_by/public_ref เดิม; เพิ่ม revision, visibility epoch, scheduled_at และ append-only status events | จุดตัดสิน public eligibility; published_at คือเวลามีผล ไม่ใช่เวลา seal |
| PublicationPolicy | policy_version_id, dto_kind, allowed_fields, public_search_fields, valid_from/valid_to เดิม; เพิ่ม purpose, audience/child classification, retention และ authority evidence ที่รับรอง | field policy ที่ตรวจปัจจุบันได้ ไม่เชื่อ client |
| Receipt/Audit/Outbox | ใช้กลไกกลาง11เมื่อพร้อม; pin decision, actor, correlation, payload hash และ dedupe key | mutation และ notification ใน transaction เดียว ไม่เก็บ secret/ชื่อผู้ค้นเต็มชุด |

เวลาเก็บ UTC/timestamptz แสดง พ.ศ. ในชั้น UI วันที่ตัดรอบตาม Asia/Bangkok ใช้ AcademicYear กลาง ไม่ใช่ FiscalYear ยืนยันความสัมพันธ์ของ year/type/level/stage กับ ExamSession/Offering และ source snapshot ที่server ไม่เชื่อ org_id/client year หรือ outcome=passed ที่ส่งมา

ข้อจำกัดที่ต้องลง migration เมื่อ prerequisites พร้อม (**K39-01–07 ยังไม่สร้าง/NOT RUN**):

| Ref | ข้อบังคับเสนอ |
| --- | --- |
| K39-01 | unique(series_id, version); series business key ต้องเจ้าของยืนยัน ไม่สมมติหนึ่งประกาศต่อประเทศต่อปี |
| K39-02 | unique(release_id, result_draft_item_id) และ composite FK ไป item ของ certified draft เดียวกัน; source ApplicationSnapshot/context ต้องตรง |
| K39-03 | decision ต้องผูก action/resource/approved revision/hash เดียวกัน; source/authority FK RESTRICT ไม่ลบหลักฐาน |
| K39-04 | publication target เป็น release เดียวที่ระบุชนิดชัด; current head ของ series ใช้ CAS ป้องกันสองรุ่นมีผลแข่งกัน |
| K39-05 | unique(actor, action, idempotency_key) พร้อม request hash; key เดิม payload ต่างให้ conflict ไม่ reuse receipt |
| K39-06 | supersedes ต้องอยู่ series เดียว รุ่นก่อนหน้า และไม่เกิด self/cycle; status event/outbox dedupe unique |
| K39-07 | seal payload/items แก้ไม่ได้; public projection ต้องใช้ approved allowlist ไม่รับ JSON fields อิสระจาก client |

ดัชนีเสนอเลือกจาก query ปี/type/level/stage และ publication eligibility กับชื่อ snapshotตาม search policy ทดสอบ query plan ก่อนกำหนด btree/ข้อความค้นจริง ไม่เพิ่ม index ทุกคอลัมน์หรืออ้างว่าดัชนี logical04ทั้งหมดเหมาะแล้ว บทนี้ไม่แก้ data_model.json, schema, migration หรือ seed

## 3 Invariants และกระบวนการเผยแพร่

| Ref | กฎที่ต้องบังคับฝั่ง server |
| --- | --- |
| I39-01 | มี certified manifest ที่ล็อกแล้วและผ่าน prerequisite38; raw/accepted/calculated หรือคะแนนฝึกระบบ3เผยแพร่แทนไม่ได้ |
| I39-02 | เจ้าของงานยืนยันว่า outcome ใดเป็นผ่าน; snapshot รายชื่อผู้ผ่านมาจากชุดรับรอง ไม่คำนวณเกณฑ์ผ่านใหม่ในpublic service |
| I39-03 | ผู้อนุมัติเผยแพร่เป็นคนละคนกับผู้สร้าง release และมี current account/action/scope/delegation ณ เวลาตัดสินและทำ job |
| I39-04 | นโยบายเผยแพร่และฟิลด์/วัตถุประสงค์ได้รับอนุมัติตรงรุ่นและบริบทจริง; unknown/expired/revoked policy ให้ deny |
| I39-05 | public read ใช้เวลาของserver ตรวจ published_at <= now และยังไม่ถอน/แทนรุ่น ห้ามคาดวันจาก client/jobล่าช้า |
| I39-06 | ค้น/นับ/แบ่งหน้า/HTML/RSC/export/index/download ใช้ public eligibility และ allowlist เดียวกัน ไม่มีช่องอ่าน draft |
| I39-07 | ชื่อ สังกัดและผลปีเก่าจาก sealed snapshot; เปลี่ยน Person ปีใหม่ไม่แก้ snapshotย้อนหลัง |
| I39-08 | การแก้ผลต้องผ่าน score amendment/recertify38 และ release ใหม่; audit/รุ่นเดิมไม่ overwrite |
| I39-09 | ถอน/แทนรุ่นเพิ่ม visibility epoch ใน transaction; cache/index ล่าช้าไม่เปิดช่องข้าม live visibility gate |

ขั้นตอนเสนอ **S39-01–07**:

1. S39-01 โหลด context และ current grant ฝั่งserver ตรวจ certified manifest/source hash/rule/ผลผ่าน/evidence ไม่รับ client certification
2. S39-02 สร้าง draft release ด้วย idempotency receipt และ snapshotจากชุดรับรอง ยังไม่มี public publication
3. S39-03 ตรวจ completeness, field policy, child classification, rights/scan ของไฟล์ และข้อมูลก่อนหลัง ให้ผู้ตรวจเห็นผ่าน internal DAL เท่านั้น
4. S39-04 ผู้อนุมัติคนละ creator ตรวจ scope/delegation และ CAS revision/hash พร้อมเหตุผล หากสาระสำคัญเปลี่ยนต้องตรวจรุ่นใหม่ ไม่ใช้ decision เก่า
5. S39-05 seal payload/manifest/items จัดเวลาเผยแพร่ที่รับรอง การอนุมัติ/ตั้งเวลาไม่ทำให้ public อ่านก่อนเวลา
6. S39-06 activation transaction ตรวจ authority/account/current policy/source และ expected head; เปลี่ยน visibility, published_by/published_at, append event, receipt, audit และ outbox พร้อมกัน rollback เมื่อส่วนใดล้ม
7. S39-07 worker retry ตรวจ current job authority และ idempotency ส่ง notificationไป dev sink พร้อม invalidation/index work ไม่มีเผยแพร่โดยถือว่าอยู่ในqueueแล้วได้รับสิทธิ์ถาวร

draft / reviewing / approved / scheduled / published / withdrawn เป็นสถานะ Publication lifecycle ที่เสนอ; supersession เป็น event/pointerไป releaseใหม่ แยกจากผลรับรองของ ResultDraft และ application state ผู้ใช้ต้องเห็นชัดว่า “ผลรับรองแล้ว แต่ยังไม่เผยแพร่” อำนาจ เส้นทางตรวจ และช่วงเผยแพร่ทั้งหมดรอเจ้าของยืนยัน ไม่ใช่กฎทางการที่เดาขึ้น

## 4 Field policy และแบบบัญชีผลสอบ

| ฟิลด์ | Public DTO ที่เสนอ | Private view |
| --- | --- | --- |
| ปี ประเภท ระดับ ช่วงชั้น รุ่น/แหล่งประกาศ | อนุญาตเฉพาะ approved policy/context | ตรวจ current DAL เช่นเดียวกัน |
| display_name_snapshot, organization_name_snapshot, outcome | TO VERIFY: เปิดเฉพาะที่ policy ระบุ รวมกติกาเด็ก/กลุ่มเสี่ยง; ขณะนี้ไม่มี approved policy | เจ้าของเชื่อม User–Person ที่ยืนยัน หรือเจ้าหน้าที่ใน scope พร้อม field grant |
| คะแนนรายวิชา/ดิบ/เหตุผล/feedback/ประวัติแก้ | deny โดยค่าเริ่มต้น | จำกัดตาม purpose/field grant ไม่ใช่ทุกคนที่อ่านรายชื่อได้ |
| เลขบัตร วันเกิด เบอร์ส่วนตัว ที่อยู่ เอกสาร/คำขอภายใน | ห้ามใน public DTO/filter/facet/HTML/export/metadata | field policy + File ACL/scan สำหรับเอกสาร ไม่คืนทั้ง ORM graph |
| Person/User/Candidate/Application/seat/source document IDs, internal correlation | ไม่ส่งเป็น public identifier หรือprofile link | referenceภายในตามgrantเท่านั้น; public_refแยกและไม่ให้ grant จากการรู้ค่า |
| อายุ/การจำแนกผู้เยาว์ | ไม่เปิด DOB หรือเดาจากชื่อ/ช่วงชั้น | ใช้ classification ตามนโยบายที่ยืนยัน; unknown classificationปิด public |

Public allowlist ทั้ง response และ filters ต้องตรง policy แยก DTO/queries จาก private service ห้ามใช้ `include_private=true` หรือขยายฟิลด์จาก query/role ที่clientอ้าง การอนุมัติ template ไม่ได้อนุมัติเปิดเผยข้อมูลคน

ต่อทะเบียนเดียวใน [FORM_TEMPLATE_REGISTRY](FORM_TEMPLATE_REGISTRY.md) รุ่น0.2 เพิ่ม F39-01 ศ.4 และ F39-02 ศ.8 เป็น **TO VERIFY / official issuance BLOCKED** ยังไม่ได้สร้าง DB registry rows หรือรับไฟล์จริง ต้องยืนยันชื่อเต็ม รุ่น/ปี purpose/type/level/stage fields/layout source hash ผู้ตรวจ และสิทธิ์เผยแพร่ก่อน renderer/workerออกเอกสารจริง layoutทดลองใช้ `DEMO_RESULT_LAYOUT_V1` มีป้ายทุกหน้า ไม่ตั้งว่าเป็น ศ.4/ศ.8 และไม่คัดลอกจากชื่อเมนู

ค้นและรับข้อมูลภายในตาม [RESULT_SEARCH_CONTRACT](RESULT_SEARCH_CONTRACT.md); แก้/ถอนและแผนทดสอบ18กรณีตาม [RESULT_RELEASE_RECOVERY](RESULT_RELEASE_RECOVERY.md) ทุก invariant/process/constraint เป็นสัญญา ยังไม่ได้รันจริง
