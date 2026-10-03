# พจนานุกรมข้อมูล — เว็บไซต์กองบริหารทะเบียนและวัดผล

บท 04 | รุ่นเอกสาร 1.4 | 3 ตุลาคม 2569 (2026-10-03) | PROPOSAL / LOGICAL DESIGN ONLY

## 1 อ่านเอกสารนี้อย่างไร

พจนานุกรมข้อมูลอธิบายว่าตารางเก็บอะไร แต่ละช่องหมายถึงอะไร และข้อมูลเชื่อมกันด้วยรหัสไหน อ่าน [ERD](ERD.md) ก่อน แล้วค้นชื่อตารางด้านล่าง ไม่ต้องอ่านทุกช่องพร้อมกัน

แบบนี้มี **128 ตาราง / 1551 ฟิลด์** รวมฟิลด์กลางที่ขยายแสดงทุกตาราง ไม่มีการละฟิลด์ด้วยจุดไข่ปลา ใช้ [data_model.json](data_model.json) เป็นบัญชีเชิงโครงสร้างสำหรับตรวจความครบของเอกสาร ไม่ใช่migration/ORMschema ไม่สร้างฐานข้อมูลจริง

ทุกตารางเป็นข้อเสนอ อยู่ใน `private` schemaที่ไม่เปิดให้anonymousเรียกtableโดยตรง **เปิดRLSทุกตาราง + deny by default** และตรวจserver/workerอีกชั้น Public DTOใน [DATA_CLASSIFICATION](DATA_CLASSIFICATION.md) ออกผ่านbackendที่ตรวจprojection/รุ่น/การเผยแพร่ ไม่เปิดprivate tablesผ่านREST/GraphQLหรือserializeทั้งrecord

ชื่อภาษาอังกฤษsnake_caseเป็นชื่อเทคนิค คำอธิบายไทยเพื่อเจ้าของงาน เจ้าของO01–O09/C01–C04เป็นหน้าที่เสนอจากCharter ไม่ใช่ฝ่าย/ตำแหน่งทางการ กฎ จศป. แบบ ศ.3 คะแนน อำนาจ วงเงิน การเผยแพร่/อายุข้อมูลยังTO VERIFYใน [OPEN_QUESTIONS](OPEN_QUESTIONS.md)

## 2 สัญลักษณ์และกติกาทุกตาราง

| คำ | ความหมาย/กติกา |
| --- | --- |
| PK | `id uuid` เป็นรหัสหนึ่งรายการ ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| FK | อ้างPK/uniqueชุดที่ระบุ เปลี่ยน/ลบ parentด้วยRESTRICT; ไม่มีcascadeลบข้อมูลจริง |
| composite FK | อ้างหลายคอลัมน์ร่วม เช่น candidate_id+person_id เพื่อกันเอาผู้สมัครคนหนึ่งผูกคนอื่น |
| unique | ป้องกันรายการซ้ำตามkey; PK/uniqueสร้างดัชนีของตน ไม่สร้างอีกindexซ้ำโดยไม่มีเหตุ |
| index | btreeสำหรับFKและรูปแบบqueryตามรายการด้านล่าง; แผนqueryจริงต้องEXPLAIN/วัดเมื่อมีDB ไม่รับรองความเร็วจากแบบ |
| NULL | ช่องว่างได้ตามคอลัมน์; draftบางเรื่องขาดหลักฐานได้แต่ส่ง/มีผลต้องครบตามpolicy |
| default | เป็นเจตนาเชิงแบบ `server_now` คือserverกำหนดเวลา ไม่ใช่ชื่อSQLfunction; ไม่ให้clientกำหนดactor/time/grantเอง |
| ชั้น P/I/R/H | Publicเมื่อรับรอง / Internal / Restricted / Highly Restricted ทุกฟิลด์มีชั้น รวมPK/FK/metadata; Pไม่ทำให้draftหรือprivate tableเป็นpublic |
| numeric | money `numeric(20,2)`, quantity `numeric(20,6)`, score `numeric(10,4)` เป็นprecision/scaleเสนอQ024 ไม่ใช่วงเงิน/เกณฑ์ผ่าน |
| date/timestamptz | วันล้วนใช้dateค.ศ. วันเวลาใช้UTC; แสดงAsia/Bangkok/พ.ศ.; ไม่บวก543ในstorageหรือแปลงdateจนเลื่อนวัน |
| jsonb/text | JSONใช้schema allowlistต่อชนิด; unknownfield/leafclassให้ปฏิเสธ payload/ข้อความอิสระที่อาจมีPIIจัดH ไม่มีsecretในconfig |

FKทุกรายการมีindexเสนอ; actorFKอ่านตามภารกิจ ไม่ให้อำนาจจากการเป็นผู้สร้าง ข้ามแถว/ข้ามตาราง เช่น cycle ยอดรวม ความจุ อำนาจและmaker-checkerตรวจด้วยtransaction/RPC+lock/constraintsที่เหมาะสม ไม่เขียนCHECKที่แอบqueryตารางอื่น แบบphysical/extensions/versionจริงรอQ023

user_account.auth_user_idเป็นFKภายนอกเฉพาะPK `auth.users(id)` ไม่มีตารางloginหรือpasswordของแอปเพิ่ม บัญชีแรกสร้างด้วยtrustedprovisioningและcreated_by/updated_byอ้างรหัสบัญชีเดียวกันเป็นbootstrapmetadataเท่านั้น ไม่ได้สิทธิ์ธุรกิจจากการอ้างตน การมอบgrantต้องworkflowแยก

file_version.bucket_id/object_keyเป็นreferenceStorageผ่านAPI **ไม่ใช่SQLFK** และไม่มีsignedURLถาวร ต้องตรวจobjectมีจริง/hash/ชนิด/scan/ACLก่อนใช้ ไม่แก้ตารางstorageโดยตรง audit/notification.target_idเป็นตัวชี้หลักฐาน/ทางลัดที่ตั้งใจไม่ใช้polymorphicbusinessFK; businessrelationshipsใช้FKจริงหรือtypedFKของworkflow/publication

ประวัติ12ตารางมีeffective_from/effective_to/recorded_at/evidence_document_id และsuperseded_at/replaces_id เก็บสองแกนเวลา ไม่ทับความจริงที่ใช้ในปีเดิม เงื่อนไขที่อ่านได้ตามเวลาและnonoverlapอยู่ในERD

## 3 นโยบายปิดใช้งานและประวัติ

| รหัส | การจัดการที่ออกแบบ | gate/ข้อจำกัด |
| --- | --- | --- |
| RET-S | `is_active=false` สำหรับmaster/ทะเบียน ไม่ลบหรือใช้รหัสเดิมกับคนใหม่ | สถานะinactiveไม่ห้ามดูsnapshot/ประวัติที่มีสิทธิ์ |
| RET-H | จบช่วง/แก้ความรู้ด้วยประวัติรุ่นใหม่และหลักฐาน; stampsuperseded_atร่วมaudit | เก็บoriginalcontentและreferences ไม่ใช้softdeleteบังความจริงปีเก่า |
| RET-E | draftแก้ตามversion; หลังsubmitted/sealed/postedใช้revision/reversalและaudit | retryอ้างoperation_receiptเดิม; ไม่ลบjournal/score/result |
| RET-F | กักไฟล์/stagingและจำกัดACL; ปิดเข้าถึง/archived/heldแทนลบข้อมูลจริง | วันหมดอายุ/การปกปิด/การทำลายต้องหลักฐานQ016/Q025; บทนี้ไม่อนุญาตharddelete |
| RET-A | audit/holdเป็นappend-onlyหรือยุติholdตามอำนาจ เก็บหลักฐาน | ไม่มีbusinessroleแก้/lบaudit; ห้ามlogpassword/token/secretหรือpayloadส่วนตัวทั้งชุด |

ไม่ตั้งจำนวนวันเก็บจากการเดา ไม่ถือhistoryเป็นเหตุเก็บPIIตลอดไป การลบ/ปกปิดตามกฎหมายยังNeeds Legal Review และต้องmigration/policyที่รับรองเมื่อถึงบทลงมือ ทุกbusinessmutationต้องมีaudit_logsร่วมtransaction; auditเสียแล้วbusinessmutationต้องไม่สำเร็จ

## 4 สารบัญตาราง

| หมวด | ตารางและเจ้าของเสนอ |
| --- | --- |
| 00 ข้อมูลกลาง บัญชี สิทธิ์ เอกสาร และบริการร่วม | [user_account](#user_account), [role](#role), [permission](#permission), [role_permission](#role_permission), [scope](#scope), [role_assignment](#role_assignment), [policy_version](#policy_version), [document](#document), [file_version](#file_version), [document_acl](#document_acl), [operation_receipt](#operation_receipt), [audit_logs](#audit_logs), [outbox](#outbox), [notification](#notification), [publication_policy](#publication_policy), [publication](#publication), [site_content](#site_content), [news_post](#news_post), [download_entry](#download_entry), [workflow_case](#workflow_case), [decision](#decision) |
| 01 บุคลากรและประวัติ | [person](#person), [person_private](#person_private), [person_identifier](#person_identifier), [person_name_history](#person_name_history), [education_branch](#education_branch), [position_type](#position_type), [position_assignment](#position_assignment), [affiliation_history](#affiliation_history), [person_status_event](#person_status_event), [person_change_request](#person_change_request) |
| 02 หน่วยงาน ภูมิศาสตร์ ปีและสนามสอบ | [geography](#geography), [organization_type](#organization_type), [organization_relation_type](#organization_relation_type), [organization](#organization), [organization_name_history](#organization_name_history), [organization_relation](#organization_relation), [address_version](#address_version), [organization_location](#organization_location), [organization_contact](#organization_contact), [academic_year](#academic_year), [exam_type](#exam_type), [exam_level](#exam_level), [exam_session](#exam_session), [session_level](#session_level), [exam_center](#exam_center), [center_session](#center_session), [center_session_level](#center_session_level), [exam_center_appointment](#exam_center_appointment) |
| 03 การเรียนและคลังข้อสอบ | [learning_group](#learning_group), [curriculum](#curriculum), [course](#course), [lesson_version](#lesson_version), [question_version](#question_version), [answer_key](#answer_key), [assessment_blueprint](#assessment_blueprint), [assessment_item](#assessment_item), [learning_enrollment](#learning_enrollment), [attempt](#attempt), [attempt_item](#attempt_item), [response](#response), [learning_progress](#learning_progress), [manual_grading](#manual_grading) |
| 04 คำขอและสถานะที่มีผล | [change_request](#change_request), [request_version](#request_version), [impact_assessment](#impact_assessment), [status_event](#status_event), [activation_record](#activation_record) |
| 05 สมัครสอบและผลทางการ | [candidate](#candidate), [enrollment](#enrollment), [eligibility_rule_version](#eligibility_rule_version), [application](#application), [application_snapshot](#application_snapshot), [seat_allocation](#seat_allocation), [exam_subject](#exam_subject), [session_subject](#session_subject), [grading_rule_version](#grading_rule_version), [subject_score](#subject_score), [result_draft](#result_draft), [result_draft_item](#result_draft_item), [result_score_link](#result_score_link), [result_release](#result_release), [result_release_item](#result_release_item) |
| 06 งบประมาณ | [fiscal_year](#fiscal_year), [funding_source](#funding_source), [project](#project), [project_exam_session](#project_exam_session), [budget_line](#budget_line), [budget_event](#budget_event), [allocation](#allocation), [reservation](#reservation), [obligation](#obligation), [disbursement](#disbursement), [budget_posting](#budget_posting), [period_close](#period_close) |
| 07 พัสดุและครุภัณฑ์ | [unit_of_measure](#unit_of_measure), [item](#item), [warehouse](#warehouse), [procurement_request](#procurement_request), [procurement_request_line](#procurement_request_line), [purchase_order](#purchase_order), [purchase_order_line](#purchase_order_line), [goods_receipt](#goods_receipt), [goods_receipt_line](#goods_receipt_line), [stock_movement](#stock_movement), [stock_movement_line](#stock_movement_line), [asset](#asset), [asset_assignment](#asset_assignment), [loan](#loan), [maintenance](#maintenance), [stocktake](#stocktake), [stocktake_line](#stocktake_line), [disposal](#disposal) |
| 08 สารบรรณ | [register_counter](#register_counter), [correspondence](#correspondence), [record_version](#record_version), [routing](#routing), [recipient_snapshot](#recipient_snapshot), [receipt](#receipt), [assignment](#assignment), [approval_evidence](#approval_evidence), [retention_hold](#retention_hold) |
| 09 นำเข้าผ่าน Excel | [form_template_registry](#form_template_registry), [import_batch](#import_batch), [import_row](#import_row), [validation_issue](#validation_issue), [commit_receipt](#commit_receipt), [amendment_link](#amendment_link) |

## หมวด 00 — ข้อมูลกลาง บัญชี สิทธิ์ เอกสาร และบริการร่วม

### user_account

บัญชีแอปหนึ่งชุด ผูกAuthและPersonโดยไม่เก็บรหัสผ่าน

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: P08ตามบัญชีที่ดูแล; P01อ่านข้อมูลบัญชีตน; businessgrantsไม่เกิดจากaccount_status

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| auth_user_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | auth.users.id / RESTRICT | อ้างauth.users(id)ที่Supabaseเป็นเจ้าของ |
| person_id | uuid | ได้ | NULL | R | person.id / RESTRICT | ผูกPersonหลังตรวจตัวตน; ยังไม่ผูกไม่มีP01 |
| account_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | สถานะเทคนิค active/disabled/pending_binding |
| bound_at | timestamptz | ได้ | NULL | R | — | เวลาที่ตรวจbindingแล้ว |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_user_account_01`: (auth_user_id)
- `uq_user_account_02`: (person_id) WHERE person_id IS NOT NULL AND is_active AND account_status = 'active'
- `ix_user_account_01` btree: (created_by)
- `ix_user_account_02` btree: (updated_by)
- `ix_user_account_03` btree: (person_id)
- auth_user_idห้ามเปลี่ยนเพียงเพื่อย้ายสิทธิ์
- bindingหนึ่งPersonต่อบัญชีและหนึ่งactiveaccountต่อPersonเป็นProposal Q023
- row_version >= 1

### role

บทบาทตามหน้าที่ ไม่ใช่ชื่อตำแหน่งทางการ

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| role_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสหน้าที่ |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | คำอธิบายไทยที่เจ้าของรับรอง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_role_01`: (role_code)
- `ix_role_01` btree: (created_by)
- `ix_role_02` btree: (updated_by)
- row_version >= 1

### permission

สิทธิ์รายactionตามP01–P11

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| action_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | read_self/read_scope/edit/submit/approve/publish/download/manage_accounts/read_public/restore/read_audit |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | คำอธิบายไทย |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_permission_01`: (action_code)
- `ix_permission_01` btree: (created_by)
- `ix_permission_02` btree: (updated_by)
- row_version >= 1

### role_permission

บทบาทให้actionเฉพาะโมดูล ไม่รวมgrantคนละเรื่อง

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| role_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | role.id / RESTRICT | อ้างรหัส role |
| permission_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | permission.id / RESTRICT | อ้างรหัส permission |
| module_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | 00–09หรือnamespaceส่วนกลาง |
| resource_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ประเภทงานที่อนุญาต |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_role_permission_01`: (role_id, permission_id, module_code, resource_kind)
- `ix_role_permission_01` btree: (created_by)
- `ix_role_permission_02` btree: (updated_by)
- `ix_role_permission_03` btree: (role_id)
- `ix_role_permission_04` btree: (permission_id)
- row_version >= 1

### scope

ขอบเขตที่มอบหมายแยกจากพื้นที่ภูมิศาสตร์

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| scope_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสขอบเขต |
| root_organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| relation_type_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization_relation_type.id / RESTRICT | อ้างรหัส organization_relation_type |
| include_descendants | boolean | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รวมหน่วยลูกเฉพาะชนิดสายนี้ |
| exam_session_id | uuid | ได้ | NULL | R | exam_session.id / RESTRICT | อ้างรหัส exam_session |
| center_session_id | uuid | ได้ | NULL | R | center_session.id / RESTRICT | อ้างรหัส center_session |
| warehouse_id | uuid | ได้ | NULL | R | warehouse.id / RESTRICT | อ้างรหัส warehouse |
| funding_source_id | uuid | ได้ | NULL | R | funding_source.id / RESTRICT | อ้างรหัส funding_source |
| fiscal_year_id | uuid | ได้ | NULL | R | fiscal_year.id / RESTRICT | อ้างรหัส fiscal_year |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_scope_01`: (scope_code)
- `ix_scope_01` btree: (created_by)
- `ix_scope_02` btree: (updated_by)
- `ix_scope_03` btree: (root_organization_id)
- `ix_scope_04` btree: (relation_type_id)
- `ix_scope_05` btree: (exam_session_id)
- `ix_scope_06` btree: (center_session_id)
- `ix_scope_07` btree: (warehouse_id)
- `ix_scope_08` btree: (funding_source_id)
- `ix_scope_09` btree: (fiscal_year_id)
- ทุกข้อจำกัดในscopeต้องผ่านร่วมกัน ห้ามORจนข้ามสาย
- row_version >= 1
- transactionตรวจcenter_session.exam_session_idตรงexam_session_idเมื่อระบุทั้งคู่; warehouse/fund/centerอยู่หน่วยในrelationtype+ช่วงที่scopeอนุญาต

### role_assignment

การมอบหมายบทบาทและscopeตามเวลา

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| user_account_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| role_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | role.id / RESTRICT | อ้างรหัส role |
| scope_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | scope.id / RESTRICT | อ้างรหัส scope |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| valid_from | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เริ่มอำนาจ |
| valid_to | timestamptz | ได้ | NULL | I | — | สิ้นอำนาจแบบไม่รวมปลาย |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |
| granted_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| revoked_at | timestamptz | ได้ | NULL | I | — | เพิกถอนแล้วหยุดใช้สิทธิ์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_role_assignment_01`: (user_account_id, role_id, scope_id, valid_from)
- `ix_role_assignment_01` btree: (created_by)
- `ix_role_assignment_02` btree: (updated_by)
- `ix_role_assignment_03` btree: (user_account_id)
- `ix_role_assignment_04` btree: (role_id)
- `ix_role_assignment_05` btree: (scope_id)
- `ix_role_assignment_06` btree: (policy_version_id)
- `ix_role_assignment_07` btree: (evidence_document_id)
- `ix_role_assignment_08` btree: (granted_by)
- `ix_role_assignment_09` btree: (user_account_id, valid_from, valid_to)
- valid_to IS NULL OR valid_to > valid_from
- ผู้ดูแลห้ามมอบP05/P06ให้ตนโดยไม่มีอำนาจQ006
- row_version >= 1

### policy_version

configurationกฎทดลอง/ทางการมีรุ่น ไม่มีข้อมูลบุคคล

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| policy_namespace | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดกฎ |
| version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่น >=1 |
| verification_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | TO_VERIFY/VERIFIED/SUPERSEDED |
| configuration | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | JSONตามschema allowlist ไม่มีsecret/PII; ค่าทางการต้องหลักฐาน |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มกฎ |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นกฎ |
| evidence_document_id | uuid | ได้ | NULL | R | document.id / RESTRICT | อ้างรหัส document |
| verified_at | timestamptz | ได้ | NULL | I | — | เวลารับรองจริง |
| verified_by | uuid | ได้ | NULL | R | user_account.id / RESTRICT | อ้างรหัส user_account |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_policy_version_01`: (policy_namespace, version_no)
- `ix_policy_version_01` btree: (created_by)
- `ix_policy_version_02` btree: (updated_by)
- `ix_policy_version_03` btree: (evidence_document_id)
- `ix_policy_version_04` btree: (verified_by)
- VERIFIEDต้องมีevidence/verified_by/verified_at
- version_no>=1; effective_to>effective_fromถ้ามี
- row_version >= 1

### document

ทะเบียนเอกสารร่วมทุกระบบ ไม่คัดลอกคำสั่ง/หลักฐาน

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-F ไฟล์และstagingprivate; quarantine/ACL/hold; อายุจริงTO VERIFY

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| owner_organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| document_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดตามconfiguration ไม่เดาชื่อแบบ |
| title | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | หัวเรื่องอาจมีข้อมูลอ่อนไหว |
| visibility_class | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | P/I/R/Hของเนื้อหา |
| lifecycle_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | draft/active/held/archived |
| retention_policy_id | uuid | ได้ | NULL | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_document_01` btree: (created_by)
- `ix_document_02` btree: (updated_by)
- `ix_document_03` btree: (owner_organization_id)
- `ix_document_04` btree: (retention_policy_id)
- row_version >= 1

### file_version

รุ่นไฟล์และตำแหน่งStorageprivate; metadataไม่ใช่ไฟล์เอง

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-F ไฟล์และstagingprivate; quarantine/ACL/hold; อายุจริงTO VERIFY

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |
| version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นไฟล์ |
| bucket_id | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | อ้างStorageผ่านAPI ไม่แก้storage schemaเอง |
| object_key | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | ตำแหน่งprivate ไม่เป็นpublicURL |
| original_filename | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | ชื่อไฟล์อาจมีPII |
| media_type | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดที่ตรวจแล้ว |
| size_bytes | bigint | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ขนาด>=0 |
| sha256 | char(64) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | digestตรวจรุ่นไฟล์ ไม่ใช่สิทธิ์อ่าน |
| scan_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | quarantined/pending/passed/rejected |
| scanned_at | timestamptz | ได้ | NULL | I | — | เวลาผลscan |
| scan_policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| sealed_at | timestamptz | ได้ | NULL | I | — | รุ่นที่ใช้หลักฐานแล้วไม่แก้byte |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_file_version_01`: (document_id, version_no)
- `uq_file_version_02`: (bucket_id, object_key)
- `uq_file_version_03`: (id, document_id)
- `ix_file_version_01` btree: (created_by)
- `ix_file_version_02` btree: (updated_by)
- `ix_file_version_03` btree: (document_id)
- `ix_file_version_04` btree: (scan_policy_version_id)
- version_no>=1; size_bytes>=0
- objectต้องมีจริงและhashตรงก่อนpassed; signedURLไม่เก็บในDB
- row_version >= 1

### document_acl

สิทธิ์เอกสารแยกเรื่องและรุ่น

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |
| file_version_id | uuid | ได้ | NULL | R | file_version.id / RESTRICT | อ้างรหัส file_version |
| user_account_id | uuid | ได้ | NULL | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| scope_id | uuid | ได้ | NULL | R | scope.id / RESTRICT | อ้างรหัส scope |
| permission_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | permission.id / RESTRICT | อ้างรหัส permission |
| valid_from | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เริ่มACL |
| valid_to | timestamptz | ได้ | NULL | I | — | สิ้นACL |
| evidence_document_id | uuid | ได้ | NULL | R | document.id / RESTRICT | อ้างรหัส document |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_document_acl_01`: (document_id, user_account_id, permission_id, valid_from) WHERE user_account_id IS NOT NULL AND file_version_id IS NULL
- `uq_document_acl_02`: (document_id, user_account_id, permission_id, valid_from, file_version_id) WHERE user_account_id IS NOT NULL AND file_version_id IS NOT NULL
- `uq_document_acl_03`: (document_id, scope_id, permission_id, valid_from) WHERE scope_id IS NOT NULL AND file_version_id IS NULL
- `uq_document_acl_04`: (document_id, scope_id, permission_id, valid_from, file_version_id) WHERE scope_id IS NOT NULL AND file_version_id IS NOT NULL
- `ix_document_acl_01` btree: (created_by)
- `ix_document_acl_02` btree: (updated_by)
- `ix_document_acl_03` btree: (document_id)
- `ix_document_acl_04` btree: (file_version_id)
- `ix_document_acl_05` btree: (user_account_id)
- `ix_document_acl_06` btree: (scope_id)
- `ix_document_acl_07` btree: (permission_id)
- `ix_document_acl_08` btree: (evidence_document_id)
- composite FK (file_version_id, document_id) → file_version(id, document_id); parentมีuniqueชุดนี้; RESTRICT
- exactlyone(user_account_id,scope_id)
- file_version_idต้องเป็นdocument_idเดียวกัน via compositeFK
- nullableversionใช้partialuniqueเพิ่มตามDDไม่ปล่อยNULLซ้ำ
- row_version >= 1

### operation_receipt

idempotencyกลางสำหรับงานเสี่ยงซ้ำ

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| initiating_account_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| module_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | โมดูลที่ทำรายการ |
| operation_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดงาน |
| idempotency_key | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | keyสุ่ม; ไม่ใช้secret |
| payload_digest | char(64) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | digestcanonicalpayload ไม่มีpayloadทั้งชุด |
| operation_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | pending/completed/failed |
| correlation_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสตามรอย |
| completed_at | timestamptz | ได้ | NULL | I | — | ยืนยันผลแล้ว |
| result_summary | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | เฉพาะรหัส/จำนวนที่actorเข้าถึงได้ ไม่เก็บprivateDTOทั้งหมด |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_operation_receipt_01`: (initiating_account_id, module_code, operation_code, idempotency_key)
- `ix_operation_receipt_01` btree: (recorded_by)
- `ix_operation_receipt_02` btree: (initiating_account_id)

### audit_logs

หลักฐานเพิ่มแก้ปิดใช้งาน ห้ามแก้ลบย้อนหลัง

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-A audit/hold append only ห้ามแก้ลบ

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| actor_account_id | uuid | ได้ | NULL | R | user_account.id / RESTRICT | NULLเฉพาะsystemeventที่มีservice_actor_codeและinitiatorตรวจได้ |
| initiating_account_id | uuid | ได้ | NULL | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| service_actor_code | text | ได้ | NULL | I | — | ระบุworkerทางเทคนิค ไม่แทนสิทธิ์ธุรกิจ |
| action_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | การกระทำ |
| target_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดaggregate |
| target_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ตัวชี้เหตุการณ์ ไม่เป็นpolymorphicbusinessFK |
| changed_fields | text[] | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ชื่อฟิลด์เปลี่ยน ไม่มีค่าprivateทั้งชุด |
| safe_change_summary | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | redacted metadataตามallowlist |
| correlation_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสตามรอย |
| policy_version_id | uuid | ได้ | NULL | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_audit_logs_01` btree: (recorded_by)
- `ix_audit_logs_02` btree: (actor_account_id)
- `ix_audit_logs_03` btree: (initiating_account_id)
- `ix_audit_logs_04` btree: (policy_version_id)
- `ix_audit_logs_05` btree: (target_kind, target_id, recorded_at)
- `ix_audit_logs_06` btree: (actor_account_id, recorded_at)

### outbox

งานเบื้องหลังผูกธุรกรรมและสิทธิ์initiator

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| operation_receipt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | operation_receipt.id / RESTRICT | อ้างรหัส operation_receipt |
| initiating_account_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| event_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดงาน |
| payload_refs | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสอ้างอิงที่allowlist ไม่ใส่secret/PII |
| job_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | queued/running/completed/failed/revoked |
| attempt_count | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | จำนวนretry>=0 |
| next_attempt_at | timestamptz | ได้ | NULL | I | — | เวลาลองใหม่ |
| correlation_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ตามรอย |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_outbox_01`: (operation_receipt_id, event_code)
- `ix_outbox_01` btree: (created_by)
- `ix_outbox_02` btree: (updated_by)
- `ix_outbox_03` btree: (operation_receipt_id)
- `ix_outbox_04` btree: (initiating_account_id)
- workerตรวจlatestgrant/policy/ACLก่อนอ่านและก่อนcommit
- row_version >= 1

### notification

แจ้งเตือนกลาง ไม่คัดลอกข้อมูลลับต้นเรื่อง

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| recipient_account_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| outbox_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | outbox.id / RESTRICT | อ้างรหัส outbox |
| event_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดแจ้งเตือน |
| target_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดต้นเรื่อง |
| target_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ตัวชี้ไม่ให้สิทธิ์; resolverallowlistตรวจต้นเรื่อง |
| seen_at | timestamptz | ได้ | NULL | R | — | เปิดแจ้งเตือน ไม่เท่ากับreceiptหนังสือ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_notification_01`: (recipient_account_id, outbox_id)
- `ix_notification_01` btree: (created_by)
- `ix_notification_02` btree: (updated_by)
- `ix_notification_03` btree: (recipient_account_id)
- `ix_notification_04` btree: (outbox_id)
- `ix_notification_05` btree: (recipient_account_id, seen_at)
- row_version >= 1

### publication_policy

allowlistข้อมูลเผยแพร่แบบมีรุ่น

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| dto_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดDTOที่อนุญาต |
| allowed_fields | text[] | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รายชื่อDTOfield; ห้ามrawprivateและdenylistถาวร |
| public_search_fields | text[] | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ค้นเฉพาะฟิลด์ที่รับรอง |
| valid_from | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เวลาเริ่มนโยบาย |
| valid_to | timestamptz | ได้ | NULL | I | — | เวลาสิ้น |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_publication_policy_01`: (policy_version_id, dto_kind)
- `ix_publication_policy_01` btree: (created_by)
- `ix_publication_policy_02` btree: (updated_by)
- `ix_publication_policy_03` btree: (policy_version_id)
- row_version >= 1

### publication

การรับรองเผยแพร่ projection ไม่ใช่Person/Applicationทะเบียนใหม่

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| target_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดต้นทาง |
| person_id | uuid | ได้ | NULL | R | person.id / RESTRICT | อ้างรหัส person |
| organization_id | uuid | ได้ | NULL | R | organization.id / RESTRICT | อ้างรหัส organization |
| curriculum_id | uuid | ได้ | NULL | R | curriculum.id / RESTRICT | อ้างรหัส curriculum |
| result_release_id | uuid | ได้ | NULL | R | result_release.id / RESTRICT | อ้างรหัส result_release |
| record_version_id | uuid | ได้ | NULL | R | record_version.id / RESTRICT | อ้างรหัส record_version |
| site_content_id | uuid | ได้ | NULL | R | site_content.id / RESTRICT | อ้างรหัส site_content |
| news_post_id | uuid | ได้ | NULL | R | news_post.id / RESTRICT | อ้างรหัส news_post |
| download_entry_id | uuid | ได้ | NULL | R | download_entry.id / RESTRICT | อ้างรหัส download_entry |
| publication_policy_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | publication_policy.id / RESTRICT | อ้างรหัส publication_policy |
| approval_decision_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | decision.id / RESTRICT | อ้างรหัส decision |
| published_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เวลาที่เผยแพร่ |
| withdrawn_at | timestamptz | ได้ | NULL | I | — | ถอนเผยแพร่หยุดคืนDTO |
| published_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| public_summary_th | text | ได้ | NULL | P | — | สรุปที่editorตรวจให้เผยแพร่; ไม่dumprawH ไม่ให้กฎอนุญาตหลบdenylist |
| public_ref | uuid | ไม่ได้ | gen_random_uuid() | P | — | รหัสpublicของการเผยแพร่ ไม่ใช้rawPerson/Application/fileidแทนสิทธิ์ |
| source_person_name_history_id | uuid | ได้ | NULL | R | person_name_history.id / RESTRICT | อ้างรหัส person_name_history |
| source_organization_name_history_id | uuid | ได้ | NULL | R | organization_name_history.id / RESTRICT | อ้างรหัส organization_name_history |
| source_effective_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันที่ธุรกิจที่อนุมัติให้เลือกข้อมูล |
| source_recorded_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | จุดความรู้ที่อนุมัติ ห้ามjoinข้อมูลใหม่ที่ยังไม่รับรอง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_publication_01`: (public_ref)
- `ix_publication_01` btree: (recorded_by)
- `ix_publication_02` btree: (person_id)
- `ix_publication_03` btree: (organization_id)
- `ix_publication_04` btree: (curriculum_id)
- `ix_publication_05` btree: (result_release_id)
- `ix_publication_06` btree: (record_version_id)
- `ix_publication_07` btree: (site_content_id)
- `ix_publication_08` btree: (news_post_id)
- `ix_publication_09` btree: (download_entry_id)
- `ix_publication_10` btree: (publication_policy_id)
- `ix_publication_11` btree: (approval_decision_id)
- `ix_publication_12` btree: (published_by)
- `ix_publication_13` btree: (target_kind, published_at)
- `ix_publication_14` btree: (source_person_name_history_id)
- `ix_publication_15` btree: (source_organization_name_history_id)
- exactlyone typedtargetFKตามtarget_kind
- P06แยกจากP05; policyต้องVERIFIEDก่อนข้อมูลจริง
- sourcehistoryFKต้องเป็นPerson/Organizationตรงtypedtarget และอ่านตามsource_effective_on/source_recorded_atที่ตรึง; ไม่ใช้currentnameแทนรุ่นรับรอง

### site_content

เนื้อหากลางcontact/about/help/FAQ/policiesหนึ่งต้นทางต่อชนิดและรุ่น

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| content_key | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เช่นcontact/about/help/topic/faq/topic/policy/key |
| version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นเนื้อหา |
| title_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | P | — | หัวข้อไทยเมื่ออนุมัติ |
| body_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | P | — | เนื้อหาเพื่อเผยแพร่ผ่านตรวจและไม่มีPIIต้องห้าม |
| organization_id | uuid | ได้ | NULL | R | organization.id / RESTRICT | ข้อมูลcontactอ้างOrganizationเดิม |
| content_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | draft/approved/withdrawn |
| evidence_document_id | uuid | ได้ | NULL | R | document.id / RESTRICT | อ้างรหัส document |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_site_content_01`: (content_key, version_no)
- `ix_site_content_01` btree: (created_by)
- `ix_site_content_02` btree: (updated_by)
- `ix_site_content_03` btree: (organization_id)
- `ix_site_content_04` btree: (evidence_document_id)
- row_version >= 1
- หลังsubmitted/approved/published/sealedตามชนิด ห้ามแก้เนื้อหาหรือsourceversionเดิม; revisionสร้างversionใหม่ร่วมaudit

### news_post

ข่าวกลางชุดเดียวใช้site_contentรุ่นที่ตรวจแล้ว

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| site_content_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | site_content.id / RESTRICT | อ้างรหัส site_content |
| category_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ประเภทข่าวที่ตั้งค่า |
| announced_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เวลาแสดงประกาศ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_news_post_01`: (site_content_id)
- `ix_news_post_01` btree: (created_by)
- `ix_news_post_02` btree: (updated_by)
- row_version >= 1
- หลังsubmitted/approved/published/sealedตามชนิด ห้ามแก้เนื้อหาหรือsourceversionเดิม; revisionสร้างversionใหม่ร่วมaudit

### download_entry

รายการดาวน์โหลดกลางพร้อมสิทธิ์ต้นทาง

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| entry_key | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสรายการดาวน์โหลด |
| file_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | file_version.id / RESTRICT | อ้างรหัส file_version |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | P | — | คำอธิบายเมื่ออนุมัติ |
| form_template_id | uuid | ได้ | NULL | R | form_template_registry.id / RESTRICT | อ้างรหัส form_template_registry |
| audience_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | public/internalตามpolicy ไม่ให้privateไฟล์เอง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_download_entry_01`: (entry_key, file_version_id)
- `ix_download_entry_01` btree: (created_by)
- `ix_download_entry_02` btree: (updated_by)
- `ix_download_entry_03` btree: (file_version_id)
- `ix_download_entry_04` btree: (form_template_id)
- row_version >= 1
- หลังsubmitted/approved/published/sealedตามชนิด ห้ามแก้เนื้อหาหรือsourceversionเดิม; revisionสร้างversionใหม่ร่วมaudit

### workflow_case

engineตรวจอนุมัติร่วม ใช้FKเป้าหมายตามชนิดหนึ่งรายการ

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| target_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดเป้าหมาย |
| request_version_id | uuid | ได้ | NULL | R | request_version.id / RESTRICT | อ้างรหัส request_version |
| application_id | uuid | ได้ | NULL | R | application.id / RESTRICT | อ้างรหัส application |
| result_draft_id | uuid | ได้ | NULL | R | result_draft.id / RESTRICT | อ้างรหัส result_draft |
| budget_event_id | uuid | ได้ | NULL | R | budget_event.id / RESTRICT | อ้างรหัส budget_event |
| procurement_request_id | uuid | ได้ | NULL | R | procurement_request.id / RESTRICT | อ้างรหัส procurement_request |
| stocktake_id | uuid | ได้ | NULL | R | stocktake.id / RESTRICT | อ้างรหัส stocktake |
| disposal_id | uuid | ได้ | NULL | R | disposal.id / RESTRICT | อ้างรหัส disposal |
| record_version_id | uuid | ได้ | NULL | R | record_version.id / RESTRICT | อ้างรหัส record_version |
| lesson_version_id | uuid | ได้ | NULL | R | lesson_version.id / RESTRICT | อ้างรหัส lesson_version |
| question_version_id | uuid | ได้ | NULL | R | question_version.id / RESTRICT | อ้างรหัส question_version |
| site_content_id | uuid | ได้ | NULL | R | site_content.id / RESTRICT | อ้างรหัส site_content |
| creator_account_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| case_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | draft/submitted/returned/approved/rejected |
| round_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รอบตรวจของtargetversion |
| period_close_id | uuid | ได้ | NULL | R | period_close.id / RESTRICT | อ้างรหัส period_close |
| curriculum_id | uuid | ได้ | NULL | R | curriculum.id / RESTRICT | อ้างรหัส curriculum |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_workflow_case_01`: (request_version_id, round_no) WHERE request_version_id IS NOT NULL
- `uq_workflow_case_02`: (application_id, round_no) WHERE application_id IS NOT NULL
- `uq_workflow_case_03`: (result_draft_id, round_no) WHERE result_draft_id IS NOT NULL
- `uq_workflow_case_04`: (budget_event_id, round_no) WHERE budget_event_id IS NOT NULL
- `uq_workflow_case_05`: (procurement_request_id, round_no) WHERE procurement_request_id IS NOT NULL
- `uq_workflow_case_06`: (stocktake_id, round_no) WHERE stocktake_id IS NOT NULL
- `uq_workflow_case_07`: (disposal_id, round_no) WHERE disposal_id IS NOT NULL
- `uq_workflow_case_08`: (record_version_id, round_no) WHERE record_version_id IS NOT NULL
- `uq_workflow_case_09`: (lesson_version_id, round_no) WHERE lesson_version_id IS NOT NULL
- `uq_workflow_case_10`: (question_version_id, round_no) WHERE question_version_id IS NOT NULL
- `uq_workflow_case_11`: (site_content_id, round_no) WHERE site_content_id IS NOT NULL
- `uq_workflow_case_12`: (period_close_id, round_no) WHERE period_close_id IS NOT NULL
- `uq_workflow_case_13`: (curriculum_id, round_no) WHERE curriculum_id IS NOT NULL
- `ix_workflow_case_01` btree: (created_by)
- `ix_workflow_case_02` btree: (updated_by)
- `ix_workflow_case_03` btree: (request_version_id)
- `ix_workflow_case_04` btree: (application_id)
- `ix_workflow_case_05` btree: (result_draft_id)
- `ix_workflow_case_06` btree: (budget_event_id)
- `ix_workflow_case_07` btree: (procurement_request_id)
- `ix_workflow_case_08` btree: (stocktake_id)
- `ix_workflow_case_09` btree: (disposal_id)
- `ix_workflow_case_10` btree: (record_version_id)
- `ix_workflow_case_11` btree: (lesson_version_id)
- `ix_workflow_case_12` btree: (question_version_id)
- `ix_workflow_case_13` btree: (site_content_id)
- `ix_workflow_case_14` btree: (creator_account_id)
- `ix_workflow_case_15` btree: (policy_version_id)
- `ix_workflow_case_16` btree: (period_close_id)
- `ix_workflow_case_17` btree: (curriculum_id)
- exactlyone targetFKตามtarget_kind
- unique(target_kind,targetFK,round_no)เป็นpartialindexรายชนิด
- ผู้สร้างและผู้อนุมัติงานสำคัญคนละคนตรวจในtransaction
- row_version >= 1

### decision

คำตัดสินengineกลาง immutableต่อรุ่นงาน

เจ้าของเสนอ: C02 + C03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ตามบริบทต้นเรื่อง/หน้าที่ส่วนกลาง ไม่ให้ admin อ่านทุกเรื่อง; grant/ACL/เวลาและfield visibility

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| workflow_case_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | workflow_case.id / RESTRICT | อ้างรหัส workflow_case |
| actor_account_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| decision_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | return/approve/rejectตามpolicy |
| reason | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | เหตุผลที่อาจมีPII |
| decided_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เวลาตัดสิน |
| evidence_document_id | uuid | ได้ | NULL | R | document.id / RESTRICT | อ้างรหัส document |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_decision_01`: (workflow_case_id, actor_account_id, decision_code)
- `ix_decision_01` btree: (recorded_by)
- `ix_decision_02` btree: (workflow_case_id)
- `ix_decision_03` btree: (actor_account_id)
- `ix_decision_04` btree: (evidence_document_id)
- actor!=workflow_case.creatorเมื่องานสำคัญ; P05ไม่ให้P06

## หมวด 01 — บุคลากรและประวัติ

### person

ตัวตนกลางไม่เป็นทะเบียนผู้สอน/ผู้สมัครอีกชุด

เจ้าของเสนอ: O01 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: P01ของตน หรือ P02/P03ทะเบียนตามสายและช่วงมอบหมาย; person_private ต้อง grantฟิลด์เฉพาะ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| person_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสภายในสุ่ม ไม่ใช้เลขประชาชน |
| identity_review_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | unverified/verified/duplicate_review |
| current_state_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | cacheสถานะตามevent ไม่ใช่แหล่งประวัติ |
| merged_into_person_id | uuid | ได้ | NULL | R | person.id / RESTRICT | aliasเมื่อยืนยันคนซ้ำ ไม่ลบและไม่ย้ายFKโดยเดา |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_person_01`: (person_code)
- `ix_person_01` btree: (created_by)
- `ix_person_02` btree: (updated_by)
- `ix_person_03` btree: (merged_into_person_id)
- merged_into_person_id != id; mergeต้องหลักฐาน/authority
- row_version >= 1

### person_private

ข้อมูลส่วนตัวแยก ห้ามpublicทุกฟิลด์

เจ้าของเสนอ: O01 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: P01เฉพาะfieldที่ดูตนได้ หรือgrantเฉพาะข้อมูลส่วนตัวตามภารกิจ ไม่ได้จากP02ทั่วไป

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| birth_date | date | ได้ | NULL | H | — | วันเกิด ไม่เผยแพร่ |
| private_address_text | text | ได้ | NULL | H | — | ที่อยู่ส่วนตัว |
| private_phone | text | ได้ | NULL | H | — | เบอร์ส่วนตัว |
| private_notes | text | ได้ | NULL | H | — | ข้อมูลเท่าที่มีวัตถุประสงค์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_person_private_01`: (person_id)
- `ix_person_private_01` btree: (created_by)
- `ix_person_private_02` btree: (updated_by)
- row_version >= 1

### person_identifier

เอกสารประจำตัวหลายชนิด ไม่ใช้เป็นPK

เจ้าของเสนอ: O01 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: P01ของตน หรือ P02/P03ทะเบียนตามสายและช่วงมอบหมาย; person_private ต้อง grantฟิลด์เฉพาะ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| identifier_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | ชนิดเอกสารตามconfiguration ไม่เดาแบบ |
| issuer_namespace | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | รหัสผู้ออก/ประเทศที่ยืนยัน |
| encrypted_value | bytea | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | เลขประชาชน/หนังสือเดินทางเข้ารหัส ไม่เก็บkey |
| lookup_hmac | bytea | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | HMACค้นซ้ำด้วยkeyนอกDB ไม่ใช้hashเลขตรงๆ |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |
| verified_at | timestamptz | ได้ | NULL | R | — | เวลาตรวจเอกสาร |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_person_identifier_01`: (issuer_namespace, identifier_kind, lookup_hmac)
- `ix_person_identifier_01` btree: (created_by)
- `ix_person_identifier_02` btree: (updated_by)
- `ix_person_identifier_03` btree: (person_id)
- `ix_person_identifier_04` btree: (evidence_document_id)
- การป้องกันคนซ้ำไม่mergeด้วยชื่อ; เข้ารหัส/keymanagement Q025
- row_version >= 1

### person_name_history

ชื่อย้อนหลังสองแกนเวลา

เจ้าของเสนอ: O01 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: P01ของตน หรือ P02/P03ทะเบียนตามสายและช่วงมอบหมาย; person_private ต้อง grantฟิลด์เฉพาะ

การปิด/เก็บ: RET-H ประวัติไม่เขียนทับ; แก้ด้วยรุ่นใหม่/หลักฐาน

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มมีผล; ตีความวันไทย |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นช่วงแบบไม่รวมปลาย; NULLไม่มีวันสิ้น |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC แสดงAsia/Bangkokพ.ศ. |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | หลักฐานที่มีACL; ต้องมีเมื่อรับประวัติมีผล |
| superseded_at | timestamptz | ได้ | NULL | I | — | เวลาที่แทนรุ่นความรู้เดิม; เปลี่ยนmetadataนี้พร้อมauditเท่านั้น |
| replaces_id | uuid | ได้ | NULL | R | person_name_history.id / RESTRICT | อ้างรุ่นเก่าที่แก้ไข; ไม่ลบหรือแก้เนื้อหาเดิม |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| name_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดชื่อที่รับรองเช่นdisplay/legalตามconfiguration |
| prefix_text | text | ได้ | NULL | R | — | คำนำหน้าที่มีหลักฐาน |
| given_name | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ชื่อที่ใช้ช่วงนี้ |
| family_name | text | ได้ | NULL | R | — | นามสกุลตามหลักฐาน |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_person_name_history_01` btree: (recorded_by)
- `ix_person_name_history_02` btree: (evidence_document_id)
- `ix_person_name_history_03` btree: (replaces_id)
- `ix_person_name_history_04` btree: (person_id)
- `ix_person_name_history_05` btree: (person_id, effective_from)
- `ix_person_name_history_06` btree: (person_id, name_kind, effective_from, recorded_at)
- `ex_person_name_history_current`: nonoverlapตามkey (person_id, name_kind) ของcurrentknowledge ช่วง[effective_from,effective_to); EXCLUDE/GiSTหรือalternativelockรอQ023 ไม่ใช้CHECKข้ามแถว
- effective_to IS NULL OR effective_to > effective_from
- superseded_at IS NULL OR superseded_at >= recorded_at
- ช่วงcurrentknowledgeห้ามทับตามbusinesskeyที่ระบุในERD; exclusion/transaction ไม่ใช้CHECKข้ามแถว

### education_branch

แผนกการศึกษาจากmasterที่รับรอง

เจ้าของเสนอ: O01 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: P01ของตน หรือ P02/P03ทะเบียนตามสายและช่วงมอบหมาย; person_private ต้อง grantฟิลด์เฉพาะ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| branch_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสแผนก ไม่เดา จศป.ทุกแท่ง |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชื่อที่รับรอง; ธรรม/บาลี/สามัญ/ปริยัตินิเทศก์ตามขอบเขตผู้ใช้ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_education_branch_01`: (branch_code)
- `ix_education_branch_01` btree: (created_by)
- `ix_education_branch_02` btree: (updated_by)
- row_version >= 1

### position_type

ประเภทหน้าที่/ตำแหน่งแบบconfiguration

เจ้าของเสนอ: O01 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: P01ของตน หรือ P02/P03ทะเบียนตามสายและช่วงมอบหมาย; person_private ต้อง grantฟิลด์เฉพาะ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| position_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสที่ยืนยัน |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชื่อที่หลักฐานรับรอง |
| education_branch_id | uuid | ได้ | NULL | R | education_branch.id / RESTRICT | อ้างรหัส education_branch |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_position_type_01`: (position_code)
- `ix_position_type_01` btree: (created_by)
- `ix_position_type_02` btree: (updated_by)
- `ix_position_type_03` btree: (education_branch_id)
- `ix_position_type_04` btree: (policy_version_id)
- row_version >= 1

### position_assignment

คนเดียวมีหลายหน้าที่ข้ามปีได้

เจ้าของเสนอ: O01 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: P01ของตน หรือ P02/P03ทะเบียนตามสายและช่วงมอบหมาย; person_private ต้อง grantฟิลด์เฉพาะ

การปิด/เก็บ: RET-H ประวัติไม่เขียนทับ; แก้ด้วยรุ่นใหม่/หลักฐาน

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มมีผล; ตีความวันไทย |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นช่วงแบบไม่รวมปลาย; NULLไม่มีวันสิ้น |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC แสดงAsia/Bangkokพ.ศ. |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | หลักฐานที่มีACL; ต้องมีเมื่อรับประวัติมีผล |
| superseded_at | timestamptz | ได้ | NULL | I | — | เวลาที่แทนรุ่นความรู้เดิม; เปลี่ยนmetadataนี้พร้อมauditเท่านั้น |
| replaces_id | uuid | ได้ | NULL | R | position_assignment.id / RESTRICT | อ้างรุ่นเก่าที่แก้ไข; ไม่ลบหรือแก้เนื้อหาเดิม |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| position_type_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | position_type.id / RESTRICT | อ้างรหัส position_type |
| assignment_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | แต่งตั้ง/รักษาการตามconfiguration |
| source_request_id | uuid | ได้ | NULL | R | change_request.id / RESTRICT | อ้างรหัส change_request |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_position_assignment_01` btree: (recorded_by)
- `ix_position_assignment_02` btree: (evidence_document_id)
- `ix_position_assignment_03` btree: (replaces_id)
- `ix_position_assignment_04` btree: (person_id)
- `ix_position_assignment_05` btree: (organization_id)
- `ix_position_assignment_06` btree: (position_type_id)
- `ix_position_assignment_07` btree: (source_request_id)
- `ix_position_assignment_08` btree: (organization_id, position_type_id, effective_from)
- `ix_position_assignment_09` btree: (person_id, organization_id, position_type_id, assignment_kind, effective_from, recorded_at)
- `ex_position_assignment_current`: nonoverlapตามkey (person_id, organization_id, position_type_id, assignment_kind) ของcurrentknowledge ช่วง[effective_from,effective_to); EXCLUDE/GiSTหรือalternativelockรอQ023 ไม่ใช้CHECKข้ามแถว
- effective_to IS NULL OR effective_to > effective_from
- superseded_at IS NULL OR superseded_at >= recorded_at
- ช่วงcurrentknowledgeห้ามทับตามbusinesskeyที่ระบุในERD; exclusion/transaction ไม่ใช้CHECKข้ามแถว

### affiliation_history

สังกัดมีชนิดและช่วง ไม่ให้ภูมิศาสตร์แทนสังกัด

เจ้าของเสนอ: O01 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: P01ของตน หรือ P02/P03ทะเบียนตามสายและช่วงมอบหมาย; person_private ต้อง grantฟิลด์เฉพาะ

การปิด/เก็บ: RET-H ประวัติไม่เขียนทับ; แก้ด้วยรุ่นใหม่/หลักฐาน

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มมีผล; ตีความวันไทย |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นช่วงแบบไม่รวมปลาย; NULLไม่มีวันสิ้น |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC แสดงAsia/Bangkokพ.ศ. |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | หลักฐานที่มีACL; ต้องมีเมื่อรับประวัติมีผล |
| superseded_at | timestamptz | ได้ | NULL | I | — | เวลาที่แทนรุ่นความรู้เดิม; เปลี่ยนmetadataนี้พร้อมauditเท่านั้น |
| replaces_id | uuid | ได้ | NULL | R | affiliation_history.id / RESTRICT | อ้างรุ่นเก่าที่แก้ไข; ไม่ลบหรือแก้เนื้อหาเดิม |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| relation_type_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization_relation_type.id / RESTRICT | อ้างรหัส organization_relation_type |
| source_request_id | uuid | ได้ | NULL | R | change_request.id / RESTRICT | อ้างรหัส change_request |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_affiliation_history_01` btree: (recorded_by)
- `ix_affiliation_history_02` btree: (evidence_document_id)
- `ix_affiliation_history_03` btree: (replaces_id)
- `ix_affiliation_history_04` btree: (person_id)
- `ix_affiliation_history_05` btree: (organization_id)
- `ix_affiliation_history_06` btree: (relation_type_id)
- `ix_affiliation_history_07` btree: (source_request_id)
- `ix_affiliation_history_08` btree: (person_id, relation_type_id, effective_from)
- `ix_affiliation_history_09` btree: (person_id, organization_id, relation_type_id, effective_from, recorded_at)
- `ex_affiliation_history_current`: nonoverlapตามkey (person_id, organization_id, relation_type_id) ของcurrentknowledge ช่วง[effective_from,effective_to); EXCLUDE/GiSTหรือalternativelockรอQ023 ไม่ใช้CHECKข้ามแถว
- effective_to IS NULL OR effective_to > effective_from
- superseded_at IS NULL OR superseded_at >= recorded_at
- ช่วงcurrentknowledgeห้ามทับตามbusinesskeyที่ระบุในERD; exclusion/transaction ไม่ใช้CHECKข้ามแถว

### person_status_event

สถานะบุคคลที่มีผลจริงแยกจากคำขอ

เจ้าของเสนอ: O01 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: P01ของตน หรือ P02/P03ทะเบียนตามสายและช่วงมอบหมาย; person_private ต้อง grantฟิลด์เฉพาะ

การปิด/เก็บ: RET-H ประวัติไม่เขียนทับ; แก้ด้วยรุ่นใหม่/หลักฐาน

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มมีผล; ตีความวันไทย |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นช่วงแบบไม่รวมปลาย; NULLไม่มีวันสิ้น |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC แสดงAsia/Bangkokพ.ศ. |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | หลักฐานที่มีACL; ต้องมีเมื่อรับประวัติมีผล |
| superseded_at | timestamptz | ได้ | NULL | I | — | เวลาที่แทนรุ่นความรู้เดิม; เปลี่ยนmetadataนี้พร้อมauditเท่านั้น |
| replaces_id | uuid | ได้ | NULL | R | person_status_event.id / RESTRICT | อ้างรุ่นเก่าที่แก้ไข; ไม่ลบหรือแก้เนื้อหาเดิม |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| event_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ประเภทเหตุการณ์ตามpolicy ไม่รวมลาออก/ลาสิกขา/เสียชีวิตเป็นสถานะเดียว |
| source_request_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | request_version.id / RESTRICT | อ้างรหัส request_version |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| status_dimension | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดสถานะ/รหัสช่องประวัติจากconfiguration ไม่เดากฎทางการ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_person_status_event_01` btree: (recorded_by)
- `ix_person_status_event_02` btree: (evidence_document_id)
- `ix_person_status_event_03` btree: (replaces_id)
- `ix_person_status_event_04` btree: (person_id)
- `ix_person_status_event_05` btree: (source_request_version_id)
- `ix_person_status_event_06` btree: (policy_version_id)
- `ix_person_status_event_07` btree: (person_id, status_dimension, effective_from, recorded_at)
- `ex_person_status_event_current`: nonoverlapตามkey (person_id, status_dimension) ของcurrentknowledge ช่วง[effective_from,effective_to); EXCLUDE/GiSTหรือalternativelockรอQ023 ไม่ใช้CHECKข้ามแถว
- effective_to IS NULL OR effective_to > effective_from
- superseded_at IS NULL OR superseded_at >= recorded_at
- ช่วงcurrentknowledgeห้ามทับตามbusinesskeyที่ระบุในERD; exclusion/transaction ไม่ใช้CHECKข้ามแถว

### person_change_request

ส่วนขยายคำขอกลางสำหรับเรื่องบุคคล ไม่เป็นworkflowใหม่

เจ้าของเสนอ: O01 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: P01ของตน หรือ P02/P03ทะเบียนตามสายและช่วงมอบหมาย; person_private ต้อง grantฟิลด์เฉพาะ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| change_request_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | change_request.id / RESTRICT | อ้างรหัส change_request |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| change_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดข้อเสนอแก้บุคคลตามconfiguration |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_person_change_request_01`: (change_request_id)
- `ix_person_change_request_01` btree: (created_by)
- `ix_person_change_request_02` btree: (updated_by)
- `ix_person_change_request_03` btree: (person_id)
- row_version >= 1

## หมวด 02 — หน่วยงาน ภูมิศาสตร์ ปีและสนามสอบ

### geography

ภูมิศาสตร์เป็นแกนค้นหา ไม่เป็นscopeอัตโนมัติ

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| geography_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสที่รับรอง |
| geography_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดพื้นที่ที่รับรอง |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | P | — | ชื่อพื้นที่เมื่ออนุญาต |
| parent_geography_id | uuid | ได้ | NULL | R | geography.id / RESTRICT | อ้างรหัส geography |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_geography_01`: (geography_code)
- `ix_geography_01` btree: (created_by)
- `ix_geography_02` btree: (updated_by)
- `ix_geography_03` btree: (parent_geography_id)
- parentไม่เป็นวงจร; service+transactionไม่ใช้CHECKข้ามแถว
- row_version >= 1

### organization_type

ประเภทหน่วยงานจากmaster

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| type_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสประเภท |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชื่อที่รับรอง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_organization_type_01`: (type_code)
- `ix_organization_type_01` btree: (created_by)
- `ix_organization_type_02` btree: (updated_by)
- row_version >= 1

### organization_relation_type

แยกสายปกครองคณะสงฆ์/สังกัดการศึกษา/ความสัมพันธ์อื่น

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| relation_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสชนิดความสัมพันธ์ |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | คำอธิบายไทย |
| is_hierarchy | boolean | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | มีparent/descendantsเมื่อpolicyกำหนด |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_organization_relation_type_01`: (relation_code)
- `ix_organization_relation_type_01` btree: (created_by)
- `ix_organization_relation_type_02` btree: (updated_by)
- `ix_organization_relation_type_03` btree: (policy_version_id)
- row_version >= 1

### organization

ทะเบียนหน่วยงานเดียวสำหรับทุกโมดูล

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| organization_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสกลางที่รับรอง |
| organization_type_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization_type.id / RESTRICT | อ้างรหัส organization_type |
| current_status_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | cacheจากstatus_eventที่มีผล |
| merged_into_organization_id | uuid | ได้ | NULL | R | organization.id / RESTRICT | อ้างรหัส organization |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_organization_01`: (organization_code)
- `ix_organization_01` btree: (created_by)
- `ix_organization_02` btree: (updated_by)
- `ix_organization_03` btree: (organization_type_id)
- `ix_organization_04` btree: (merged_into_organization_id)
- ไม่ยืนยันซ้ำ/mergeจากชื่อคล้ายล้วน
- row_version >= 1

### organization_name_history

ชื่อหน่วยงานย้อนหลัง

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-H ประวัติไม่เขียนทับ; แก้ด้วยรุ่นใหม่/หลักฐาน

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มมีผล; ตีความวันไทย |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นช่วงแบบไม่รวมปลาย; NULLไม่มีวันสิ้น |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC แสดงAsia/Bangkokพ.ศ. |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | หลักฐานที่มีACL; ต้องมีเมื่อรับประวัติมีผล |
| superseded_at | timestamptz | ได้ | NULL | I | — | เวลาที่แทนรุ่นความรู้เดิม; เปลี่ยนmetadataนี้พร้อมauditเท่านั้น |
| replaces_id | uuid | ได้ | NULL | R | organization_name_history.id / RESTRICT | อ้างรุ่นเก่าที่แก้ไข; ไม่ลบหรือแก้เนื้อหาเดิม |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| display_name | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ชื่อที่มีหลักฐานและนโยบายเผยแพร่ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_organization_name_history_01` btree: (recorded_by)
- `ix_organization_name_history_02` btree: (evidence_document_id)
- `ix_organization_name_history_03` btree: (replaces_id)
- `ix_organization_name_history_04` btree: (organization_id)
- `ix_organization_name_history_05` btree: (organization_id, effective_from, recorded_at)
- `ex_organization_name_history_current`: nonoverlapตามkey (organization_id) ของcurrentknowledge ช่วง[effective_from,effective_to); EXCLUDE/GiSTหรือalternativelockรอQ023 ไม่ใช้CHECKข้ามแถว
- effective_to IS NULL OR effective_to > effective_from
- superseded_at IS NULL OR superseded_at >= recorded_at
- ช่วงcurrentknowledgeห้ามทับตามbusinesskeyที่ระบุในERD; exclusion/transaction ไม่ใช้CHECKข้ามแถว

### organization_relation

หลายสาย/ชนิดสัมพันธ์ตามช่วงเวลา

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-H ประวัติไม่เขียนทับ; แก้ด้วยรุ่นใหม่/หลักฐาน

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มมีผล; ตีความวันไทย |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นช่วงแบบไม่รวมปลาย; NULLไม่มีวันสิ้น |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC แสดงAsia/Bangkokพ.ศ. |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | หลักฐานที่มีACL; ต้องมีเมื่อรับประวัติมีผล |
| superseded_at | timestamptz | ได้ | NULL | I | — | เวลาที่แทนรุ่นความรู้เดิม; เปลี่ยนmetadataนี้พร้อมauditเท่านั้น |
| replaces_id | uuid | ได้ | NULL | R | organization_relation.id / RESTRICT | อ้างรุ่นเก่าที่แก้ไข; ไม่ลบหรือแก้เนื้อหาเดิม |
| parent_organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| child_organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| relation_type_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization_relation_type.id / RESTRICT | อ้างรหัส organization_relation_type |
| source_request_id | uuid | ได้ | NULL | R | change_request.id / RESTRICT | อ้างรหัส change_request |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_organization_relation_01` btree: (recorded_by)
- `ix_organization_relation_02` btree: (evidence_document_id)
- `ix_organization_relation_03` btree: (replaces_id)
- `ix_organization_relation_04` btree: (parent_organization_id)
- `ix_organization_relation_05` btree: (child_organization_id)
- `ix_organization_relation_06` btree: (relation_type_id)
- `ix_organization_relation_07` btree: (source_request_id)
- `ix_organization_relation_08` btree: (parent_organization_id, child_organization_id, relation_type_id, effective_from, recorded_at)
- `ex_organization_relation_current`: nonoverlapตามkey (parent_organization_id, child_organization_id, relation_type_id) ของcurrentknowledge ช่วง[effective_from,effective_to); EXCLUDE/GiSTหรือalternativelockรอQ023 ไม่ใช้CHECKข้ามแถว
- parent_organization_id != child_organization_id
- cycleตรวจเฉพาะrelationtype+เวลา ด้วยlock/transaction
- effective_to IS NULL OR effective_to > effective_from
- superseded_at IS NULL OR superseded_at >= recorded_at
- ช่วงcurrentknowledgeห้ามทับตามbusinesskeyที่ระบุในERD; exclusion/transaction ไม่ใช้CHECKข้ามแถว

### address_version

ที่อยู่หน่วยงานและจัดส่ง ไม่ใช่ที่อยู่ส่วนตัว

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-H ประวัติไม่เขียนทับ; แก้ด้วยรุ่นใหม่/หลักฐาน

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มมีผล; ตีความวันไทย |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นช่วงแบบไม่รวมปลาย; NULLไม่มีวันสิ้น |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC แสดงAsia/Bangkokพ.ศ. |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | หลักฐานที่มีACL; ต้องมีเมื่อรับประวัติมีผล |
| superseded_at | timestamptz | ได้ | NULL | I | — | เวลาที่แทนรุ่นความรู้เดิม; เปลี่ยนmetadataนี้พร้อมauditเท่านั้น |
| replaces_id | uuid | ได้ | NULL | R | address_version.id / RESTRICT | อ้างรุ่นเก่าที่แก้ไข; ไม่ลบหรือแก้เนื้อหาเดิม |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| address_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ที่ตั้ง/จัดส่งตามconfiguration |
| address_text | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ที่อยู่ช่วงนี้; publishเฉพาะที่อนุญาต |
| geography_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | geography.id / RESTRICT | อ้างรหัส geography |
| postal_code | text | ได้ | NULL | R | — | ข้อความรักษาศูนย์นำหน้า |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_address_version_01` btree: (recorded_by)
- `ix_address_version_02` btree: (evidence_document_id)
- `ix_address_version_03` btree: (replaces_id)
- `ix_address_version_04` btree: (organization_id)
- `ix_address_version_05` btree: (geography_id)
- `ix_address_version_06` btree: (organization_id, address_kind, effective_from, recorded_at)
- `ex_address_version_current`: nonoverlapตามkey (organization_id, address_kind) ของcurrentknowledge ช่วง[effective_from,effective_to); EXCLUDE/GiSTหรือalternativelockรอQ023 ไม่ใช้CHECKข้ามแถว
- effective_to IS NULL OR effective_to > effective_from
- superseded_at IS NULL OR superseded_at >= recorded_at
- ช่วงcurrentknowledgeห้ามทับตามbusinesskeyที่ระบุในERD; exclusion/transaction ไม่ใช้CHECKข้ามแถว

### organization_location

ตำแหน่งภูมิศาสตร์แยกจากสายปกครอง

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-H ประวัติไม่เขียนทับ; แก้ด้วยรุ่นใหม่/หลักฐาน

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มมีผล; ตีความวันไทย |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นช่วงแบบไม่รวมปลาย; NULLไม่มีวันสิ้น |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC แสดงAsia/Bangkokพ.ศ. |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | หลักฐานที่มีACL; ต้องมีเมื่อรับประวัติมีผล |
| superseded_at | timestamptz | ได้ | NULL | I | — | เวลาที่แทนรุ่นความรู้เดิม; เปลี่ยนmetadataนี้พร้อมauditเท่านั้น |
| replaces_id | uuid | ได้ | NULL | R | organization_location.id / RESTRICT | อ้างรุ่นเก่าที่แก้ไข; ไม่ลบหรือแก้เนื้อหาเดิม |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| geography_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | geography.id / RESTRICT | อ้างรหัส geography |
| latitude | numeric(10,7) | ได้ | NULL | R | — | พิกัดถ้ามีวัตถุประสงค์ |
| longitude | numeric(10,7) | ได้ | NULL | R | — | พิกัดถ้ามีวัตถุประสงค์ |
| location_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดสถานะ/รหัสช่องประวัติจากconfiguration ไม่เดากฎทางการ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_organization_location_01` btree: (recorded_by)
- `ix_organization_location_02` btree: (evidence_document_id)
- `ix_organization_location_03` btree: (replaces_id)
- `ix_organization_location_04` btree: (organization_id)
- `ix_organization_location_05` btree: (geography_id)
- `ix_organization_location_06` btree: (organization_id, location_code, effective_from, recorded_at)
- `ex_organization_location_current`: nonoverlapตามkey (organization_id, location_code) ของcurrentknowledge ช่วง[effective_from,effective_to); EXCLUDE/GiSTหรือalternativelockรอQ023 ไม่ใช้CHECKข้ามแถว
- latitude between -90 and 90; longitude between -180 and 180
- effective_to IS NULL OR effective_to > effective_from
- superseded_at IS NULL OR superseded_at >= recorded_at
- ช่วงcurrentknowledgeห้ามทับตามbusinesskeyที่ระบุในERD; exclusion/transaction ไม่ใช้CHECKข้ามแถว
- latitude/longitude: ปฏิเสธNaN/Infinityและทศนิยมเกินscaleก่อนcast; NULLเมื่อไม่มีหลักฐานพิกัด ไม่แทนด้วย0

### organization_contact

ช่องทางติดต่อหน่วยงานหลายรายการมีประวัติ

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-H ประวัติไม่เขียนทับ; แก้ด้วยรุ่นใหม่/หลักฐาน

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มมีผล; ตีความวันไทย |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นช่วงแบบไม่รวมปลาย; NULLไม่มีวันสิ้น |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC แสดงAsia/Bangkokพ.ศ. |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | หลักฐานที่มีACL; ต้องมีเมื่อรับประวัติมีผล |
| superseded_at | timestamptz | ได้ | NULL | I | — | เวลาที่แทนรุ่นความรู้เดิม; เปลี่ยนmetadataนี้พร้อมauditเท่านั้น |
| replaces_id | uuid | ได้ | NULL | R | organization_contact.id / RESTRICT | อ้างรุ่นเก่าที่แก้ไข; ไม่ลบหรือแก้เนื้อหาเดิม |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| channel_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดช่องทาง |
| contact_value | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ช่องทางหน่วยงานที่รับรอง; ไม่คัดลอกเบอร์ส่วนตัวไปpublic |
| is_public_eligible | boolean | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ต้องpolicy+publicationด้วย ไม่อนุญาตเพียงflag |
| contact_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดสถานะ/รหัสช่องประวัติจากconfiguration ไม่เดากฎทางการ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_organization_contact_01` btree: (recorded_by)
- `ix_organization_contact_02` btree: (evidence_document_id)
- `ix_organization_contact_03` btree: (replaces_id)
- `ix_organization_contact_04` btree: (organization_id)
- `ix_organization_contact_05` btree: (organization_id, contact_code, effective_from, recorded_at)
- `ex_organization_contact_current`: nonoverlapตามkey (organization_id, contact_code) ของcurrentknowledge ช่วง[effective_from,effective_to); EXCLUDE/GiSTหรือalternativelockรอQ023 ไม่ใช้CHECKข้ามแถว
- effective_to IS NULL OR effective_to > effective_from
- superseded_at IS NULL OR superseded_at >= recorded_at
- ช่วงcurrentknowledgeห้ามทับตามbusinesskeyที่ระบุในERD; exclusion/transaction ไม่ใช้CHECKข้ามแถว
- is_public_eligible=trueไม่ใช่P06/publication grant; contact_valueต้องเป็นช่องทางงานที่รับรอง ห้ามคัดลอกprivatephone

### academic_year

ปีการศึกษากลางทุกการสอบ/เรียน

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| year_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสปี |
| display_year_be | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | labelพ.ศ.ที่รับรอง |
| starts_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เริ่มปีจากconfiguration |
| ends_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | สิ้นปีแบบไม่รวมปลาย |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_academic_year_01`: (year_code)
- `ix_academic_year_01` btree: (created_by)
- `ix_academic_year_02` btree: (updated_by)
- `ix_academic_year_03` btree: (policy_version_id)
- ends_on>starts_on; ไม่deriveปีงบจากตารางนี้
- row_version >= 1

### exam_type

ประเภทสอบจากconfiguration

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| type_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสสอบ |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชื่อประเภทที่รับรอง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_exam_type_01`: (type_code)
- `ix_exam_type_01` btree: (created_by)
- `ix_exam_type_02` btree: (updated_by)
- row_version >= 1

### exam_level

ระดับสอบจากconfigurationไม่รวมปีไว้ในรหัสคน

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| exam_type_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | exam_type.id / RESTRICT | อ้างรหัส exam_type |
| level_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสระดับ |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชื่อระดับ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_exam_level_01`: (exam_type_id, level_code)
- `uq_exam_level_02`: (id, exam_type_id)
- `ix_exam_level_01` btree: (created_by)
- `ix_exam_level_02` btree: (updated_by)
- `ix_exam_level_03` btree: (exam_type_id)
- row_version >= 1

### exam_session

รอบสอบอ้างปีศึกษาและประเภท รองรับหลายระดับ

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| academic_year_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | academic_year.id / RESTRICT | อ้างรหัส academic_year |
| exam_type_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | exam_type.id / RESTRICT | อ้างรหัส exam_type |
| session_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสรอบ |
| registration_opens_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เวลาเปิดรับไทยแปลงUTCตามpolicy |
| registration_closes_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เวลาปิดไม่รวมปลาย |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_exam_session_01`: (academic_year_id, exam_type_id, session_code)
- `uq_exam_session_02`: (id, exam_type_id)
- `ix_exam_session_01` btree: (created_by)
- `ix_exam_session_02` btree: (updated_by)
- `ix_exam_session_03` btree: (academic_year_id)
- `ix_exam_session_04` btree: (exam_type_id)
- `ix_exam_session_05` btree: (policy_version_id)
- registration_closes_at>registration_opens_at
- row_version >= 1

### session_level

ระดับที่เปิดในรอบ ไม่จำกัดหนึ่งระดับต่อสนาม

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| exam_session_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | exam_session.id / RESTRICT | อ้างรหัส exam_session |
| exam_level_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | exam_level.id / RESTRICT | อ้างรหัส exam_level |
| exam_type_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | exam_type.id / RESTRICT | คอลัมน์contextสำหรับcompositeFK ไม่ให้clientปลอมความสัมพันธ์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_session_level_01`: (exam_session_id, exam_level_id)
- `uq_session_level_02`: (id, exam_session_id)
- `ix_session_level_01` btree: (created_by)
- `ix_session_level_02` btree: (updated_by)
- `ix_session_level_03` btree: (exam_session_id)
- `ix_session_level_04` btree: (exam_level_id)
- `ix_session_level_05` btree: (exam_type_id)
- composite FK (exam_level_id, exam_type_id) → exam_level(id, exam_type_id); parentมีuniqueชุดนี้; RESTRICT
- composite FK (exam_session_id, exam_type_id) → exam_session(id, exam_type_id); parentมีuniqueชุดนี้; RESTRICT
- exam_level.exam_typeต้องตรงexam_sessionผ่านcompositeFK/บริการที่ระบุDD
- row_version >= 1

### exam_center

สนามแม่บทอ้างสถานที่ถาวร

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| center_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสสนามกลาง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_exam_center_01`: (center_code)
- `uq_exam_center_02`: (organization_id)
- `ix_exam_center_01` btree: (created_by)
- `ix_exam_center_02` btree: (updated_by)
- row_version >= 1

### center_session

การเปิดสนามรายรอบ; ปีได้จากExamSession

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| exam_center_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | exam_center.id / RESTRICT | อ้างรหัส exam_center |
| exam_session_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | exam_session.id / RESTRICT | อ้างรหัส exam_session |
| status_event_id | uuid | ได้ | NULL | R | status_event.id / RESTRICT | อ้างรหัส status_event |
| session_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | สถานะมีผลตามactivationไม่ใช่ร่างคำขอ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_center_session_01`: (exam_center_id, exam_session_id)
- `uq_center_session_02`: (id, exam_session_id)
- `ix_center_session_01` btree: (created_by)
- `ix_center_session_02` btree: (updated_by)
- `ix_center_session_03` btree: (exam_center_id)
- `ix_center_session_04` btree: (exam_session_id)
- `ix_center_session_05` btree: (status_event_id)
- row_version >= 1

### center_session_level

หลายระดับในสนามรอบเดียว

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| center_session_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | center_session.id / RESTRICT | อ้างรหัส center_session |
| session_level_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | session_level.id / RESTRICT | อ้างรหัส session_level |
| capacity | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ความจุทดลอง/จริงตามหลักฐาน |
| exam_session_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | exam_session.id / RESTRICT | คอลัมน์contextสำหรับcompositeFK ไม่ให้clientปลอมความสัมพันธ์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_center_session_level_01`: (center_session_id, session_level_id)
- `uq_center_session_level_02`: (id, session_level_id)
- `ix_center_session_level_01` btree: (created_by)
- `ix_center_session_level_02` btree: (updated_by)
- `ix_center_session_level_03` btree: (center_session_id)
- `ix_center_session_level_04` btree: (session_level_id)
- `ix_center_session_level_05` btree: (exam_session_id)
- composite FK (center_session_id, exam_session_id) → center_session(id, exam_session_id); parentมีuniqueชุดนี้; RESTRICT
- composite FK (session_level_id, exam_session_id) → session_level(id, exam_session_id); parentมีuniqueชุดนี้; RESTRICT
- capacity>=0; ทั้งสองFKต้องexam_sessionเดียวกัน via compositeFK
- row_version >= 1

### exam_center_appointment

ประธาน/ผู้รับข้อสอบผูกสนามรายรอบและPerson

เจ้าของเสนอ: O02 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: สายสัมพันธ์หน่วยตนและหน่วยลูกที่มอบหมาย; geography ไม่ให้สิทธิ์เอง; สนามเพิ่มปี/รอบ

การปิด/เก็บ: RET-H ประวัติไม่เขียนทับ; แก้ด้วยรุ่นใหม่/หลักฐาน

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มมีผล; ตีความวันไทย |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นช่วงแบบไม่รวมปลาย; NULLไม่มีวันสิ้น |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC แสดงAsia/Bangkokพ.ศ. |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | หลักฐานที่มีACL; ต้องมีเมื่อรับประวัติมีผล |
| superseded_at | timestamptz | ได้ | NULL | I | — | เวลาที่แทนรุ่นความรู้เดิม; เปลี่ยนmetadataนี้พร้อมauditเท่านั้น |
| replaces_id | uuid | ได้ | NULL | R | exam_center_appointment.id / RESTRICT | อ้างรุ่นเก่าที่แก้ไข; ไม่ลบหรือแก้เนื้อหาเดิม |
| center_session_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | center_session.id / RESTRICT | อ้างรหัส center_session |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| duty_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดหน้าที่ตามบัญชีที่รับรอง ไม่ตั้งชื่อตำแหน่งเอง |
| person_name_history_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person_name_history.id / RESTRICT | อ้างรหัส person_name_history |
| affiliation_history_id | uuid | ได้ | NULL | R | affiliation_history.id / RESTRICT | อ้างรหัส affiliation_history |
| address_version_id | uuid | ได้ | NULL | R | address_version.id / RESTRICT | อ้างรหัส address_version |
| display_name_snapshot | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ชื่อณวันที่ใช้รายงาน |
| organization_name_snapshot | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | สังกัดณรอบนี้ |
| delivery_address_snapshot | text | ได้ | NULL | R | — | ที่อยู่จัดส่งหน่วยงานณวันทำรายการ |
| organization_name_history_id | uuid | ได้ | NULL | R | organization_name_history.id / RESTRICT | แหล่งที่มาชื่อหน่วยงานที่snapshot ไม่joinชื่อใหม่ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_exam_center_appointment_01` btree: (recorded_by)
- `ix_exam_center_appointment_02` btree: (evidence_document_id)
- `ix_exam_center_appointment_03` btree: (replaces_id)
- `ix_exam_center_appointment_04` btree: (center_session_id)
- `ix_exam_center_appointment_05` btree: (person_id)
- `ix_exam_center_appointment_06` btree: (person_name_history_id)
- `ix_exam_center_appointment_07` btree: (affiliation_history_id)
- `ix_exam_center_appointment_08` btree: (address_version_id)
- `ix_exam_center_appointment_09` btree: (center_session_id, person_id, duty_code, effective_from, recorded_at)
- `ix_exam_center_appointment_10` btree: (organization_name_history_id)
- `ex_exam_center_appointment_current`: nonoverlapตามkey (center_session_id, person_id, duty_code) ของcurrentknowledge ช่วง[effective_from,effective_to); EXCLUDE/GiSTหรือalternativelockรอQ023 ไม่ใช้CHECKข้ามแถว
- sourcehistoryต้องเป็นPerson/Organizationที่ตรง ไม่joinชื่อปัจจุบันทับsnapshot
- effective_to IS NULL OR effective_to > effective_from
- superseded_at IS NULL OR superseded_at >= recorded_at
- ช่วงcurrentknowledgeห้ามทับตามbusinesskeyที่ระบุในERD; exclusion/transaction ไม่ใช้CHECKข้ามแถว

## หมวด 03 — การเรียนและคลังข้อสอบ

### learning_group

9กลุ่มตามBLUEPRINT ไม่เดาหลักสูตรทางการ

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| group_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสกลุ่มทดลอง |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ประถม/มัธยม/อุดม × ตรี/โท/เอกตามขอบเขตผู้ใช้ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_learning_group_01`: (group_code)
- `ix_learning_group_01` btree: (created_by)
- `ix_learning_group_02` btree: (updated_by)
- row_version >= 1

### curriculum

หลักสูตรแบบมีรุ่นและแหล่งที่มา

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| learning_group_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | learning_group.id / RESTRICT | อ้างรหัส learning_group |
| curriculum_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสหลักสูตร |
| version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นหลักสูตร |
| title_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | P | — | ชื่อเมื่อเจ้าของรับรอง |
| source_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| content_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | draft/approved/withdrawn |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_curriculum_01`: (curriculum_code, version_no)
- `ix_curriculum_01` btree: (created_by)
- `ix_curriculum_02` btree: (updated_by)
- `ix_curriculum_03` btree: (learning_group_id)
- `ix_curriculum_04` btree: (source_document_id)
- `ix_curriculum_05` btree: (policy_version_id)
- row_version >= 1
- หลังsubmitted/approved/published/sealedตามชนิด ห้ามแก้เนื้อหาหรือsourceversionเดิม; revisionสร้างversionใหม่ร่วมaudit

### course

วิชา/หน่วยเรียนในหลักสูตร ไม่ใช่ทะเบียนคนใหม่

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| curriculum_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | curriculum.id / RESTRICT | อ้างรหัส curriculum |
| course_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสวิชา |
| title_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | P | — | ชื่อวิชาที่รับรอง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_course_01`: (curriculum_id, course_code)
- `ix_course_01` btree: (created_by)
- `ix_course_02` btree: (updated_by)
- `ix_course_03` btree: (curriculum_id)
- row_version >= 1

### lesson_version

รุ่นบทเรียน immutableเมื่อใช้

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| course_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | course.id / RESTRICT | อ้างรหัส course |
| lesson_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสบท |
| version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นบท |
| title_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | P | — | ชื่อบท |
| body_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | P | — | เนื้อหาที่ตรวจลิขสิทธิ์และความถูกต้อง |
| content_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | draft/approved/withdrawn |
| source_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_lesson_version_01`: (course_id, lesson_code, version_no)
- `ix_lesson_version_01` btree: (created_by)
- `ix_lesson_version_02` btree: (updated_by)
- `ix_lesson_version_03` btree: (course_id)
- `ix_lesson_version_04` btree: (source_document_id)
- row_version >= 1
- หลังsubmitted/approved/published/sealedตามชนิด ห้ามแก้เนื้อหาหรือsourceversionเดิม; revisionสร้างversionใหม่ร่วมaudit

### question_version

คำถามรุ่นที่ตรวจรับ snapshotแต่ละครั้ง

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| course_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | course.id / RESTRICT | อ้างรหัส course |
| question_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสคำถาม |
| version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นคำถาม |
| question_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | objective/writtenตามblueprint |
| stem | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | คำถามตามระดับเปิดเผย |
| options | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ตัวเลือกallowlistไม่รวมเฉลย |
| content_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | draft/approved/withdrawn |
| source_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_question_version_01`: (course_id, question_code, version_no)
- `ix_question_version_01` btree: (created_by)
- `ix_question_version_02` btree: (updated_by)
- `ix_question_version_03` btree: (course_id)
- `ix_question_version_04` btree: (source_document_id)
- row_version >= 1
- หลังsubmitted/approved/published/sealedตามชนิด ห้ามแก้เนื้อหาหรือsourceversionเดิม; revisionสร้างversionใหม่ร่วมaudit

### answer_key

เฉลยprivateแยก ห้ามส่งก่อนส่งคำตอบ

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: เฉพาะgradingworker/ผู้ตรวจที่มีgrantเรื่องและเวลา; learner/P09ไม่อ่านตารางนี้

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| question_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | question_version.id / RESTRICT | อ้างรหัส question_version |
| correct_answer | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | เฉลย/วิธีให้คะแนนของรุ่นนี้ |
| rubric | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | เกณฑ์ข้อเขียนตามschemaที่O03รับรอง |
| max_score | numeric(10,4) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | คะแนนเต็มทดลอง/จริงมีหลักฐาน |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_answer_key_01`: (question_version_id)
- `ix_answer_key_01` btree: (created_by)
- `ix_answer_key_02` btree: (updated_by)
- row_version >= 1
- max_score: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger
- max_score>0เป็นProposalQ007/Q024; scoringversionตรึงกับattemptเพื่อไม่ใช้เฉลยใหม่ให้คะแนนย้อนหลัง

### assessment_blueprint

ชุดประเมินก่อน/หลังตามรุ่นหลักสูตร

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| curriculum_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | curriculum.id / RESTRICT | อ้างรหัส curriculum |
| assessment_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสชุด |
| version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นชุด |
| phase_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | pre/post/practice |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_assessment_blueprint_01`: (curriculum_id, assessment_code, version_no)
- `uq_assessment_blueprint_02`: (id, curriculum_id)
- `ix_assessment_blueprint_01` btree: (created_by)
- `ix_assessment_blueprint_02` btree: (updated_by)
- `ix_assessment_blueprint_03` btree: (curriculum_id)
- `ix_assessment_blueprint_04` btree: (policy_version_id)
- row_version >= 1

### assessment_item

คำถามในชุดและลำดับ

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| assessment_blueprint_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | assessment_blueprint.id / RESTRICT | อ้างรหัส assessment_blueprint |
| question_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | question_version.id / RESTRICT | อ้างรหัส question_version |
| item_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ลำดับ>=1 |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_assessment_item_01`: (assessment_blueprint_id, item_no)
- `ix_assessment_item_01` btree: (created_by)
- `ix_assessment_item_02` btree: (updated_by)
- `ix_assessment_item_03` btree: (assessment_blueprint_id)
- `ix_assessment_item_04` btree: (question_version_id)
- row_version >= 1
- question_version.course.curriculumต้องอยู่curriculumของassessment_blueprint; ตรึงversionก่อนเริ่มattempt

### learning_enrollment

ผูกผู้เรียนกับรุ่นหลักสูตร ไม่สร้างPersonเรียนแยก

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| curriculum_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | curriculum.id / RESTRICT | อ้างรหัส curriculum |
| academic_year_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | academic_year.id / RESTRICT | อ้างรหัส academic_year |
| organization_id | uuid | ได้ | NULL | R | organization.id / RESTRICT | อ้างรหัส organization |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_learning_enrollment_01`: (person_id, curriculum_id, academic_year_id)
- `uq_learning_enrollment_02`: (id, curriculum_id)
- `ix_learning_enrollment_01` btree: (created_by)
- `ix_learning_enrollment_02` btree: (updated_by)
- `ix_learning_enrollment_03` btree: (person_id)
- `ix_learning_enrollment_04` btree: (curriculum_id)
- `ix_learning_enrollment_05` btree: (academic_year_id)
- `ix_learning_enrollment_06` btree: (organization_id)
- row_version >= 1

### attempt

การทำแบบประเมินฝึกของตนแยกจากผลทางการ

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| learning_enrollment_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | learning_enrollment.id / RESTRICT | อ้างรหัส learning_enrollment |
| assessment_blueprint_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | assessment_blueprint.id / RESTRICT | อ้างรหัส assessment_blueprint |
| attempt_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ลำดับการทำตามpolicy |
| started_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | เริ่ม |
| submitted_at | timestamptz | ได้ | NULL | R | — | ส่งจริง |
| attempt_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | in_progress/submitted/awaiting_manual/graded |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| curriculum_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | curriculum.id / RESTRICT | คอลัมน์contextสำหรับcompositeFK ไม่ให้clientปลอมความสัมพันธ์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_attempt_01`: (learning_enrollment_id, assessment_blueprint_id, attempt_no)
- `ix_attempt_01` btree: (created_by)
- `ix_attempt_02` btree: (updated_by)
- `ix_attempt_03` btree: (learning_enrollment_id)
- `ix_attempt_04` btree: (assessment_blueprint_id)
- `ix_attempt_05` btree: (policy_version_id)
- `ix_attempt_06` btree: (curriculum_id)
- composite FK (assessment_blueprint_id, curriculum_id) → assessment_blueprint(id, curriculum_id); parentมีuniqueชุดนี้; RESTRICT
- composite FK (learning_enrollment_id, curriculum_id) → learning_enrollment(id, curriculum_id); parentมีuniqueชุดนี้; RESTRICT
- blueprint.curriculumต้องตรงenrollment.curriculum compositeFK
- submittedattemptแก้คำตอบเดิมไม่ได้
- row_version >= 1

### attempt_item

คำถามsnapshotที่ผู้เรียนเห็นในครั้งนี้

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| attempt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | attempt.id / RESTRICT | อ้างรหัส attempt |
| question_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | question_version.id / RESTRICT | อ้างรหัส question_version |
| item_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ลำดับ |
| stem_snapshot | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ข้อความที่ใช้จริง |
| options_snapshot | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ตัวเลือกที่ใช้จริง ไม่รวมเฉลย |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_attempt_item_01`: (attempt_id, item_no)
- `ix_attempt_item_01` btree: (created_by)
- `ix_attempt_item_02` btree: (updated_by)
- `ix_attempt_item_03` btree: (attempt_id)
- `ix_attempt_item_04` btree: (question_version_id)
- row_version >= 1
- question_versionต้องมาจากassessment_itemของblueprintรุ่นที่attemptใช้ ไม่อ่านเฉลยเข้าระบบผู้เรียน

### response

คำตอบฝึกและเวลายืนยันautosave

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| attempt_item_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | attempt_item.id / RESTRICT | อ้างรหัส attempt_item |
| answer_payload | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | คำตอบfree textอาจมีข้อมูลอ่อนไหว |
| saved_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | เวลาที่serverยืนยัน |
| is_final | boolean | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | submittedแล้วห้ามแก้ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_response_01`: (attempt_item_id)
- `ix_response_01` btree: (created_by)
- `ix_response_02` btree: (updated_by)
- row_version >= 1

### learning_progress

ความก้าวหน้าเรียนของตน ไม่เป็นofficialscore

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| learning_enrollment_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | learning_enrollment.id / RESTRICT | อ้างรหัส learning_enrollment |
| lesson_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | lesson_version.id / RESTRICT | อ้างรหัส lesson_version |
| progress_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | not_started/in_progress/completed |
| last_confirmed_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | เวลาserverยืนยันprogress |
| last_attempt_id | uuid | ได้ | NULL | R | attempt.id / RESTRICT | อ้างรหัส attempt |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_learning_progress_01`: (learning_enrollment_id, lesson_version_id)
- `ix_learning_progress_01` btree: (created_by)
- `ix_learning_progress_02` btree: (updated_by)
- `ix_learning_progress_03` btree: (learning_enrollment_id)
- `ix_learning_progress_04` btree: (lesson_version_id)
- `ix_learning_progress_05` btree: (last_attempt_id)
- row_version >= 1
- transactionตรวจlesson_version.course.curriculumตรงlearning_enrollment.curriculum และlast_attemptเป็นของenrollmentเดียวกัน

### manual_grading

การตรวจข้อเขียนฝึกเก็บรุ่นคำวินิจฉัย

เจ้าของเสนอ: O03 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: attempt/enrollmentของตน หรือหลักสูตร/กลุ่มที่ได้รับมอบหมาย; answer_key ไม่อ่านก่อนส่ง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| response_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | response.id / RESTRICT | อ้างรหัส response |
| grader_account_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| answer_key_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | answer_key.id / RESTRICT | อ้างรหัส answer_key |
| grade_version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นคำวินิจฉัย |
| score | numeric(10,4) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | คะแนนฝึกตามrubric |
| feedback | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | คำแนะนำไม่เผยคนอื่น |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_manual_grading_01`: (response_id, grade_version_no)
- `ix_manual_grading_01` btree: (recorded_by)
- `ix_manual_grading_02` btree: (response_id)
- `ix_manual_grading_03` btree: (grader_account_id)
- `ix_manual_grading_04` btree: (answer_key_id)
- scoreต้องอยู่ขอบเขตรุ่นanswer_key โดยRPCที่มีlock ไม่ใช้CHECKข้ามtable
- score: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger
- answer_key.question_versionตรงattempt_itemของresponse; score>=0 และไม่เกินmax_scoreรุ่นที่ตรึง เกณฑ์จริงTO VERIFY

## หมวด 04 — คำขอและสถานะที่มีผล

### change_request

หัวคำขอกลางร่วมบุคคล/หน่วยงาน ไม่เปลี่ยนสถานะทันที

เจ้าของเสนอ: O04 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ผู้เสนอ/ประเภทเรื่อง/เป้าหมายใน scope + maker-checker; publictrackingต้อง proof

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| request_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสคำขอภายใน |
| subject_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | person/organization/center_sessionตามconfiguration |
| target_person_id | uuid | ได้ | NULL | R | person.id / RESTRICT | อ้างรหัส person |
| target_organization_id | uuid | ได้ | NULL | R | organization.id / RESTRICT | อ้างรหัส organization |
| target_center_session_id | uuid | ได้ | NULL | R | center_session.id / RESTRICT | อ้างรหัส center_session |
| requester_account_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| request_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | draft/submitted/returned/approved/rejected/awaiting_effect/activated |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_change_request_01`: (request_code)
- `ix_change_request_01` btree: (created_by)
- `ix_change_request_02` btree: (updated_by)
- `ix_change_request_03` btree: (target_person_id)
- `ix_change_request_04` btree: (target_organization_id)
- `ix_change_request_05` btree: (target_center_session_id)
- `ix_change_request_06` btree: (requester_account_id)
- `ix_change_request_07` btree: (policy_version_id)
- exactlyone targetFKตามsubject_kind; เปิดหน่วยใหม่ใช้organizationร่างยังไม่มีผล
- row_version >= 1

### request_version

ข้อเสนอแต่ละรุ่น เก็บร่าง/ส่งกลับแยก

เจ้าของเสนอ: O04 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ผู้เสนอ/ประเภทเรื่อง/เป้าหมายใน scope + maker-checker; publictrackingต้อง proof

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| change_request_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | change_request.id / RESTRICT | อ้างรหัส change_request |
| version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นคำขอ |
| proposed_changes | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | typed schema allowlistต่อชนิด ไม่ยอมfieldที่ไม่รู้class |
| effective_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันที่เสนอให้มีผล |
| evidence_document_id | uuid | ได้ | NULL | R | document.id / RESTRICT | draftยังไม่มีหลักฐานได้; submittedต้องครบตามกฎรับรอง |
| submitted_at | timestamptz | ได้ | NULL | R | — | เวลาส่งรุ่นนี้ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_request_version_01`: (change_request_id, version_no)
- `ix_request_version_01` btree: (created_by)
- `ix_request_version_02` btree: (updated_by)
- `ix_request_version_03` btree: (change_request_id)
- `ix_request_version_04` btree: (evidence_document_id)
- row_version >= 1

### impact_assessment

ผลกระทบก่อนปิด/ยุบ/ย้าย

เจ้าของเสนอ: O04 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ผู้เสนอ/ประเภทเรื่อง/เป้าหมายใน scope + maker-checker; publictrackingต้อง proof

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| request_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | request_version.id / RESTRICT | อ้างรหัส request_version |
| impact_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ใบสมัคร/หน้าที่/ทรัพย์สิน/งานค้าง |
| affected_record_refs | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | อ้างอิงallowlist; ownerตรวจต้นทางใหม่ |
| resolution_summary | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | แผนจัดการที่เจ้าของรับรอง |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_impact_assessment_01`: (request_version_id, impact_kind)
- `ix_impact_assessment_01` btree: (created_by)
- `ix_impact_assessment_02` btree: (updated_by)
- `ix_impact_assessment_03` btree: (request_version_id)
- `ix_impact_assessment_04` btree: (evidence_document_id)
- row_version >= 1

### status_event

สถานะองค์กร/สนามที่มีผลแล้ว

เจ้าของเสนอ: O04 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ผู้เสนอ/ประเภทเรื่อง/เป้าหมายใน scope + maker-checker; publictrackingต้อง proof

การปิด/เก็บ: RET-H ประวัติไม่เขียนทับ; แก้ด้วยรุ่นใหม่/หลักฐาน

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มมีผล; ตีความวันไทย |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นช่วงแบบไม่รวมปลาย; NULLไม่มีวันสิ้น |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC แสดงAsia/Bangkokพ.ศ. |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | หลักฐานที่มีACL; ต้องมีเมื่อรับประวัติมีผล |
| superseded_at | timestamptz | ได้ | NULL | I | — | เวลาที่แทนรุ่นความรู้เดิม; เปลี่ยนmetadataนี้พร้อมauditเท่านั้น |
| replaces_id | uuid | ได้ | NULL | R | status_event.id / RESTRICT | อ้างรุ่นเก่าที่แก้ไข; ไม่ลบหรือแก้เนื้อหาเดิม |
| organization_id | uuid | ได้ | NULL | R | organization.id / RESTRICT | อ้างรหัส organization |
| center_session_id | uuid | ได้ | NULL | R | center_session.id / RESTRICT | อ้างรหัส center_session |
| event_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เปิด/ปิด/ย้าย/เปลี่ยนชื่อฯตามpolicy |
| source_request_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | request_version.id / RESTRICT | อ้างรหัส request_version |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| status_dimension | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชนิดสถานะ/รหัสช่องประวัติจากconfiguration ไม่เดากฎทางการ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_status_event_01` btree: (recorded_by)
- `ix_status_event_02` btree: (evidence_document_id)
- `ix_status_event_03` btree: (replaces_id)
- `ix_status_event_04` btree: (organization_id)
- `ix_status_event_05` btree: (center_session_id)
- `ix_status_event_06` btree: (source_request_version_id)
- `ix_status_event_07` btree: (policy_version_id)
- `ix_status_event_08` btree: (organization_id, center_session_id, status_dimension, effective_from, recorded_at)
- `ex_status_event_current`: nonoverlapตามkey (organization_id, center_session_id, status_dimension) ของcurrentknowledge ช่วง[effective_from,effective_to); EXCLUDE/GiSTหรือalternativelockรอQ023 ไม่ใช้CHECKข้ามแถว
- exactlyone(organization_id,center_session_id)
- effective_to IS NULL OR effective_to > effective_from
- superseded_at IS NULL OR superseded_at >= recorded_at
- ช่วงcurrentknowledgeห้ามทับตามbusinesskeyที่ระบุในERD; exclusion/transaction ไม่ใช้CHECKข้ามแถว

### activation_record

ยืนยันทำให้approvedrequestมีผลแล้ว

เจ้าของเสนอ: O04 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: ผู้เสนอ/ประเภทเรื่อง/เป้าหมายใน scope + maker-checker; publictrackingต้อง proof

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| request_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | request_version.id / RESTRICT | อ้างรหัส request_version |
| decision_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | decision.id / RESTRICT | อ้างรหัส decision |
| status_event_id | uuid | ได้ | NULL | R | status_event.id / RESTRICT | อ้างรหัส status_event |
| person_status_event_id | uuid | ได้ | NULL | R | person_status_event.id / RESTRICT | อ้างรหัส person_status_event |
| operation_receipt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | operation_receipt.id / RESTRICT | อ้างรหัส operation_receipt |
| activated_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เวลาworkerสำเร็จจริง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_activation_record_01`: (request_version_id)
- `uq_activation_record_02`: (operation_receipt_id)
- `ix_activation_record_01` btree: (recorded_by)
- `ix_activation_record_02` btree: (decision_id)
- `ix_activation_record_03` btree: (status_event_id)
- `ix_activation_record_04` btree: (person_status_event_id)
- exactlyone status_event_id/person_status_event_id; ต้องตัดสินapproveและถึงวันมีผล

## หมวด 05 — สมัครสอบและผลทางการ

### candidate

บทบาทผู้สมัคร1ต่อPerson ไม่เก็บชื่อ/เลขประชาชนซ้ำ

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| candidate_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสผู้สมัครกลาง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_candidate_01`: (person_id)
- `uq_candidate_02`: (candidate_code)
- `uq_candidate_03`: (id, person_id)
- `ix_candidate_01` btree: (created_by)
- `ix_candidate_02` btree: (updated_by)
- row_version >= 1

### enrollment

การขึ้นทะเบียนเรียนรายปี/หน่วย/แผนก

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| academic_year_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | academic_year.id / RESTRICT | อ้างรหัส academic_year |
| education_branch_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | education_branch.id / RESTRICT | อ้างรหัส education_branch |
| enrollment_no | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | เลขรายการจากconfiguration |
| enrollment_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | สถานะเรียนตามหลักฐาน |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_enrollment_01`: (organization_id, academic_year_id, enrollment_no)
- `uq_enrollment_02`: (id, person_id)
- `ix_enrollment_01` btree: (created_by)
- `ix_enrollment_02` btree: (updated_by)
- `ix_enrollment_03` btree: (person_id)
- `ix_enrollment_04` btree: (organization_id)
- `ix_enrollment_05` btree: (academic_year_id)
- `ix_enrollment_06` btree: (education_branch_id)
- naturalkeyPerson+หน่วย+ปี+แผนกและเงื่อนไขเรียนซ้ำรอQ024 ไม่ใช้ชื่อเป็นkey
- row_version >= 1

### eligibility_rule_version

กฎคุณสมบัติอ้างpolicyversionที่รับรอง

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| session_level_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | session_level.id / RESTRICT | อ้างรหัส session_level |
| verification_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | TO_VERIFY/VERIFIED; ไม่เดาคุณสมบัติ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_eligibility_rule_version_01`: (policy_version_id, session_level_id)
- `ix_eligibility_rule_version_01` btree: (created_by)
- `ix_eligibility_rule_version_02` btree: (updated_by)
- `ix_eligibility_rule_version_03` btree: (policy_version_id)
- `ix_eligibility_rule_version_04` btree: (session_level_id)
- row_version >= 1

### application

ทะเบียนใบสมัครเดียวจากเว็บและExcel

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| candidate_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | candidate.id / RESTRICT | อ้างรหัส candidate |
| enrollment_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | enrollment.id / RESTRICT | อ้างรหัส enrollment |
| session_level_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | session_level.id / RESTRICT | อ้างรหัส session_level |
| center_session_level_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | center_session_level.id / RESTRICT | อ้างรหัส center_session_level |
| eligibility_rule_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | eligibility_rule_version.id / RESTRICT | อ้างรหัส eligibility_rule_version |
| application_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | draft/submitted/approved/returned/cancelledตามconfiguration |
| submitted_at | timestamptz | ได้ | NULL | R | — | เวลาส่ง |
| operation_receipt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | operation_receipt.id / RESTRICT | อ้างรหัส operation_receipt |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_application_01`: (person_id, session_level_id)
- `uq_application_02`: (operation_receipt_id)
- `uq_application_03`: (id, center_session_level_id)
- `uq_application_04`: (id, session_level_id)
- `ix_application_01` btree: (created_by)
- `ix_application_02` btree: (updated_by)
- `ix_application_03` btree: (person_id)
- `ix_application_04` btree: (candidate_id)
- `ix_application_05` btree: (enrollment_id)
- `ix_application_06` btree: (session_level_id)
- `ix_application_07` btree: (center_session_level_id)
- `ix_application_08` btree: (eligibility_rule_version_id)
- composite FK (candidate_id, person_id) → candidate(id, person_id); parentมีuniqueชุดนี้; RESTRICT
- composite FK (enrollment_id, person_id) → enrollment(id, person_id); parentมีuniqueชุดนี้; RESTRICT
- composite FK (center_session_level_id, session_level_id) → center_session_level(id, session_level_id); parentมีuniqueชุดนี้; RESTRICT
- candidate.person_id=enrollment.person_id=application.person_id via compositeFK
- center_session_level.session_levelตรงapplication.session_level via compositeFK
- naturaluniqueเป็นProposal Q024; ขอยกเลิกไม่ลบหรือสร้างอีกใบโดยลัดขั้น
- row_version >= 1
- transaction/RPCตรวจenrollment.academic_year_idตรงexam_session.academic_year_idผ่านsession_level และeligibility_rule_versionตรงรอบ/ระดับ/วันส่ง ไม่ใช้CHECKข้ามตาราง

### application_snapshot

ชื่อ/สังกัด/ข้อมูลรอบณรุ่นใบสมัครที่ใช้ปีเก่า

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| application_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | application.id / RESTRICT | อ้างรหัส application |
| version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นsnapshot |
| person_name_history_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person_name_history.id / RESTRICT | อ้างรหัส person_name_history |
| organization_name_history_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization_name_history.id / RESTRICT | อ้างรหัส organization_name_history |
| affiliation_history_id | uuid | ได้ | NULL | R | affiliation_history.id / RESTRICT | อ้างรหัส affiliation_history |
| address_version_id | uuid | ได้ | NULL | R | address_version.id / RESTRICT | อ้างรหัส address_version |
| display_name_snapshot | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ชื่อจริงที่ใช้ขณะส่ง/รับรอง ไม่joinค่าปัจจุบัน |
| organization_name_snapshot | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | สังกัดที่ใช้ในปี/รอบเดิม |
| delivery_address_snapshot | text | ได้ | NULL | R | — | ที่อยู่หน่วยงานณวันใช้ |
| captured_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เวลาที่snapshot |
| source_effective_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันที่ธุรกิจที่ใช้เลือกประวัติ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_application_snapshot_01`: (application_id, version_no)
- `uq_application_snapshot_02`: (id, application_id)
- `ix_application_snapshot_01` btree: (recorded_by)
- `ix_application_snapshot_02` btree: (application_id)
- `ix_application_snapshot_03` btree: (person_name_history_id)
- `ix_application_snapshot_04` btree: (organization_name_history_id)
- `ix_application_snapshot_05` btree: (affiliation_history_id)
- `ix_application_snapshot_06` btree: (address_version_id)
- หลังsubmitted/approved/published/sealedตามชนิด ห้ามแก้เนื้อหาหรือsourceversionเดิม; revisionสร้างversionใหม่ร่วมaudit

### seat_allocation

ที่นั่งอ้างapplicationและสนาม/ระดับ

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| application_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | application.id / RESTRICT | อ้างรหัส application |
| center_session_level_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | center_session_level.id / RESTRICT | อ้างรหัส center_session_level |
| seat_number | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสที่นั่งตามconfiguration รักษาศูนย์นำหน้า |
| operation_receipt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | operation_receipt.id / RESTRICT | อ้างรหัส operation_receipt |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_seat_allocation_01`: (application_id)
- `uq_seat_allocation_02`: (center_session_level_id, seat_number)
- `uq_seat_allocation_03`: (operation_receipt_id)
- `ix_seat_allocation_01` btree: (created_by)
- `ix_seat_allocation_02` btree: (updated_by)
- `ix_seat_allocation_03` btree: (center_session_level_id)
- composite FK (application_id, center_session_level_id) → application(id, center_session_level_id); parentมีuniqueชุดนี้; RESTRICT
- สนาม/ระดับต้องตรงapplicationด้วยcompositeFK; approvedก่อนออกที่นั่ง; lockcapacity
- row_version >= 1

### exam_subject

วิชาทางการแบบmaster ไม่ใช้Courseฝึกแทน

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| subject_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสวิชาที่รับรอง |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชื่อวิชาที่รับรอง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_exam_subject_01`: (subject_code)
- `ix_exam_subject_01` btree: (created_by)
- `ix_exam_subject_02` btree: (updated_by)
- row_version >= 1

### session_subject

วิชาที่สอบในรอบและระดับ

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| session_level_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | session_level.id / RESTRICT | อ้างรหัส session_level |
| exam_subject_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | exam_subject.id / RESTRICT | อ้างรหัส exam_subject |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_session_subject_01`: (session_level_id, exam_subject_id)
- `uq_session_subject_02`: (id, session_level_id)
- `ix_session_subject_01` btree: (created_by)
- `ix_session_subject_02` btree: (updated_by)
- `ix_session_subject_03` btree: (session_level_id)
- `ix_session_subject_04` btree: (exam_subject_id)
- row_version >= 1

### grading_rule_version

เกณฑ์คะแนนทางการมีหลักฐาน

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| session_subject_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | session_subject.id / RESTRICT | อ้างรหัส session_subject |
| max_score | numeric(10,4) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | คะแนนเต็มจากกฎยืนยัน |
| verification_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | TO_VERIFY/VERIFIED |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_grading_rule_version_01`: (policy_version_id, session_subject_id)
- `ix_grading_rule_version_01` btree: (created_by)
- `ix_grading_rule_version_02` btree: (updated_by)
- `ix_grading_rule_version_03` btree: (policy_version_id)
- `ix_grading_rule_version_04` btree: (session_subject_id)
- row_version >= 1
- max_score: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### subject_score

คะแนนดิบแต่ละรุ่น ไม่ทับคะแนนเก่า

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| application_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | application.id / RESTRICT | อ้างรหัส application |
| session_subject_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | session_subject.id / RESTRICT | อ้างรหัส session_subject |
| grading_rule_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | grading_rule_version.id / RESTRICT | อ้างรหัส grading_rule_version |
| score_version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นคะแนน |
| score_value | numeric(10,4) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | คะแนนทางการดิบตามกฎ ไม่รับคะแนนฝึก |
| source_file_version_id | uuid | ได้ | NULL | R | file_version.id / RESTRICT | อ้างรหัส file_version |
| supersedes_score_id | uuid | ได้ | NULL | R | subject_score.id / RESTRICT | อ้างรหัส subject_score |
| session_level_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | session_level.id / RESTRICT | คอลัมน์contextสำหรับcompositeFK ไม่ให้clientปลอมความสัมพันธ์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_subject_score_01`: (application_id, session_subject_id, score_version_no)
- `uq_subject_score_02`: (id, application_id)
- `uq_subject_score_03`: (id, session_subject_id)
- `ix_subject_score_01` btree: (recorded_by)
- `ix_subject_score_02` btree: (application_id)
- `ix_subject_score_03` btree: (session_subject_id)
- `ix_subject_score_04` btree: (grading_rule_version_id)
- `ix_subject_score_05` btree: (source_file_version_id)
- `ix_subject_score_06` btree: (supersedes_score_id)
- `ix_subject_score_07` btree: (session_level_id)
- composite FK (application_id, session_level_id) → application(id, session_level_id); parentมีuniqueชุดนี้; RESTRICT
- composite FK (session_subject_id, session_level_id) → session_subject(id, session_level_id); parentมีuniqueชุดนี้; RESTRICT
- วิชาอยู่session_levelของapplication compositeFK; คะแนนช่วงที่ยืนยันตรวจRPC
- score_value: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger
- score_value>=0 และไม่เกินmax_scoreของgrading_rule_versionที่รับรอง กฎคะแนนจริงTO VERIFY

### result_draft

ชุดผลรอรับรองรายสนาม/รอบ/ระดับ

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| center_session_level_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | center_session_level.id / RESTRICT | อ้างรหัส center_session_level |
| draft_version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นชุดผล |
| draft_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | draft/submitted/approved/rejected |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_result_draft_01`: (center_session_level_id, draft_version_no)
- `ix_result_draft_01` btree: (created_by)
- `ix_result_draft_02` btree: (updated_by)
- `ix_result_draft_03` btree: (center_session_level_id)
- `ix_result_draft_04` btree: (policy_version_id)
- row_version >= 1

### result_draft_item

ผลรายคนอ้างsnapshotและคะแนนรุ่นที่ใช้

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| result_draft_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | result_draft.id / RESTRICT | อ้างรหัส result_draft |
| application_snapshot_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | application_snapshot.id / RESTRICT | อ้างรหัส application_snapshot |
| outcome_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ผลจากกฎยืนยันไม่เดาคะแนนผ่าน |
| application_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | application.id / RESTRICT | คอลัมน์contextสำหรับcompositeFK ไม่ให้clientปลอมความสัมพันธ์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_result_draft_item_01`: (result_draft_id, application_snapshot_id)
- `uq_result_draft_item_02`: (id, application_id)
- `uq_result_draft_item_03`: (id, result_draft_id)
- `uq_result_draft_item_04`: (result_draft_id, application_id)
- `ix_result_draft_item_01` btree: (created_by)
- `ix_result_draft_item_02` btree: (updated_by)
- `ix_result_draft_item_03` btree: (result_draft_id)
- `ix_result_draft_item_04` btree: (application_snapshot_id)
- `ix_result_draft_item_05` btree: (application_id)
- composite FK (application_snapshot_id, application_id) → application_snapshot(id, application_id); parentมีuniqueชุดนี้; RESTRICT
- row_version >= 1
- transaction/RPCตรวจapplication.center_session_level_idตรงresult_draft.center_session_level_idทุกitem ห้ามรวมผลคนละสนาม/รอบ

### result_score_link

ระบุคะแนนรุ่นใดคำนวณผล ไม่joinคะแนนล่าสุด

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| result_draft_item_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | result_draft_item.id / RESTRICT | อ้างรหัส result_draft_item |
| subject_score_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | subject_score.id / RESTRICT | อ้างรหัส subject_score |
| application_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | application.id / RESTRICT | คอลัมน์contextสำหรับcompositeFK ไม่ให้clientปลอมความสัมพันธ์ |
| session_subject_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | session_subject.id / RESTRICT | คอลัมน์contextสำหรับcompositeFK ไม่ให้clientปลอมความสัมพันธ์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_result_score_link_01`: (result_draft_item_id, subject_score_id)
- `uq_result_score_link_02`: (result_draft_item_id, session_subject_id)
- `ix_result_score_link_01` btree: (created_by)
- `ix_result_score_link_02` btree: (updated_by)
- `ix_result_score_link_03` btree: (result_draft_item_id)
- `ix_result_score_link_04` btree: (subject_score_id)
- `ix_result_score_link_05` btree: (application_id)
- `ix_result_score_link_06` btree: (session_subject_id)
- composite FK (result_draft_item_id, application_id) → result_draft_item(id, application_id); parentมีuniqueชุดนี้; RESTRICT
- composite FK (subject_score_id, application_id) → subject_score(id, application_id); parentมีuniqueชุดนี้; RESTRICT
- composite FK (subject_score_id, session_subject_id) → subject_score(id, session_subject_id); parentมีuniqueชุดนี้; RESTRICT
- scoreเป็นapplicationเดียวกับdraftitem; หนึ่งวิชาต่อผลผ่านpartial/compositeconstraint
- row_version >= 1

### result_release

ชุดผลที่รับรอง immutable เผยแพร่ผ่านpublication

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| result_draft_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | result_draft.id / RESTRICT | อ้างรหัส result_draft |
| release_no | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสชุดประกาศ |
| approval_decision_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | decision.id / RESTRICT | อ้างรหัส decision |
| supersedes_release_id | uuid | ได้ | NULL | R | result_release.id / RESTRICT | อ้างรหัส result_release |
| sealed_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เวลาปิดชุดผลก่อนเผยแพร่ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_result_release_01`: (result_draft_id)
- `uq_result_release_02`: (release_no)
- `uq_result_release_03`: (id, result_draft_id)
- `ix_result_release_01` btree: (recorded_by)
- `ix_result_release_02` btree: (approval_decision_id)
- `ix_result_release_03` btree: (supersedes_release_id)

### result_release_item

snapshotผลประกาศรุ่นเดิมไม่เปลี่ยนตามชื่อปัจจุบัน

เจ้าของเสนอ: O05 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: personตนหรือหน่วยผู้สมัคร/สนาม/รอบที่มอบหมาย; approve/publish/downloadแยก

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| result_release_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | result_release.id / RESTRICT | อ้างรหัส result_release |
| result_draft_item_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | result_draft_item.id / RESTRICT | อ้างรหัส result_draft_item |
| display_name_snapshot | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ชื่อจากapplicationsnapshotที่รับรอง |
| organization_name_snapshot | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | สังกัดจากsnapshotปีเดิม |
| outcome_snapshot | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ผลตามruleversionที่รับรอง ไม่ให้publicเอง |
| result_draft_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | result_draft.id / RESTRICT | คอลัมน์contextสำหรับcompositeFK ไม่ให้clientปลอมความสัมพันธ์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_result_release_item_01`: (result_release_id, result_draft_item_id)
- `ix_result_release_item_01` btree: (recorded_by)
- `ix_result_release_item_02` btree: (result_release_id)
- `ix_result_release_item_03` btree: (result_draft_item_id)
- `ix_result_release_item_04` btree: (result_draft_id)
- composite FK (result_release_id, result_draft_id) → result_release(id, result_draft_id); parentมีuniqueชุดนี้; RESTRICT
- composite FK (result_draft_item_id, result_draft_id) → result_draft_item(id, result_draft_id); parentมีuniqueชุดนี้; RESTRICT

## หมวด 06 — งบประมาณ

### fiscal_year

ปีงบแยกจากปีศึกษา

เจ้าของเสนอ: O06 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: หน่วย+ปีงบ+แหล่งเงิน+อำนาจวงเงินที่ยืนยัน; techไม่มีอนุมัติเอง

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| year_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสปีงบ |
| display_year_be | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | labelที่รับรอง |
| starts_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เริ่มปีจากpolicy ไม่เดาวัน |
| ends_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | สิ้นแบบไม่รวมปลาย |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_fiscal_year_01`: (year_code)
- `ix_fiscal_year_01` btree: (created_by)
- `ix_fiscal_year_02` btree: (updated_by)
- `ix_fiscal_year_03` btree: (policy_version_id)
- ends_on>starts_on
- row_version >= 1

### funding_source

แหล่งเงินตามเจ้าของรับรอง

เจ้าของเสนอ: O06 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: หน่วย+ปีงบ+แหล่งเงิน+อำนาจวงเงินที่ยืนยัน; techไม่มีอนุมัติเอง

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| source_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสแหล่งเงิน |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชื่อที่รับรอง |
| currency_code | char(3) | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | สกุลเงินที่อนุมัติ ไม่แปลงเอง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_funding_source_01`: (organization_id, source_code)
- `ix_funding_source_01` btree: (created_by)
- `ix_funding_source_02` btree: (updated_by)
- `ix_funding_source_03` btree: (organization_id)
- row_version >= 1

### project

โครงการอ้างองค์กรไม่ผูกปีงบกับปีศึกษาหนึ่งค่า

เจ้าของเสนอ: O06 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: หน่วย+ปีงบ+แหล่งเงิน+อำนาจวงเงินที่ยืนยัน; techไม่มีอนุมัติเอง

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| project_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสโครงการ |
| title_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ชื่อโครงการที่รับรอง |
| starts_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่ม |
| ends_on | date | ได้ | NULL | I | — | วันสิ้น |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_project_01`: (organization_id, project_code)
- `ix_project_01` btree: (created_by)
- `ix_project_02` btree: (updated_by)
- `ix_project_03` btree: (organization_id)
- row_version >= 1

### project_exam_session

โครงการสัมพันธ์หลายรอบสอบได้

เจ้าของเสนอ: O06 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: หน่วย+ปีงบ+แหล่งเงิน+อำนาจวงเงินที่ยืนยัน; techไม่มีอนุมัติเอง

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| project_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | project.id / RESTRICT | อ้างรหัส project |
| exam_session_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | exam_session.id / RESTRICT | อ้างรหัส exam_session |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_project_exam_session_01`: (project_id, exam_session_id)
- `ix_project_exam_session_01` btree: (created_by)
- `ix_project_exam_session_02` btree: (updated_by)
- `ix_project_exam_session_03` btree: (project_id)
- `ix_project_exam_session_04` btree: (exam_session_id)
- row_version >= 1

### budget_line

เส้นงบตามหน่วย ปีงบ แหล่งเงิน หมวด

เจ้าของเสนอ: O06 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: หน่วย+ปีงบ+แหล่งเงิน+อำนาจวงเงินที่ยืนยัน; techไม่มีอนุมัติเอง

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| fiscal_year_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | fiscal_year.id / RESTRICT | อ้างรหัส fiscal_year |
| funding_source_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | funding_source.id / RESTRICT | อ้างรหัส funding_source |
| project_id | uuid | ได้ | NULL | R | project.id / RESTRICT | อ้างรหัส project |
| line_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสเส้นงบ |
| category_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | หมวดที่รับรองจากpolicy |
| currency_code | char(3) | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | สกุลเดียวกับแหล่งเงิน |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_budget_line_01`: (organization_id, fiscal_year_id, funding_source_id, line_code)
- `ix_budget_line_01` btree: (created_by)
- `ix_budget_line_02` btree: (updated_by)
- `ix_budget_line_03` btree: (organization_id)
- `ix_budget_line_04` btree: (fiscal_year_id)
- `ix_budget_line_05` btree: (funding_source_id)
- `ix_budget_line_06` btree: (project_id)
- funding_source.organization/currencyต้องตรงและP02ทุกเส้น ไม่รับยอดคงเหลือจากclient
- row_version >= 1

### budget_event

หัวjournalธุรกิจ สร้าง/อนุมัติ/โพสต์ atomic

เจ้าของเสนอ: O06 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: หน่วย+ปีงบ+แหล่งเงิน+อำนาจวงเงินที่ยืนยัน; techไม่มีอนุมัติเอง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| fiscal_year_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | fiscal_year.id / RESTRICT | อ้างรหัส fiscal_year |
| event_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | allocate/reserve/obligate/pay/transfer/reverseตามpolicy |
| business_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันรายการตามช่วงงบ ไม่ใช้เวลาบันทึกแทน |
| posting_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | draft/approved/posted/reversed |
| operation_receipt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | operation_receipt.id / RESTRICT | อ้างรหัส operation_receipt |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| evidence_document_id | uuid | ได้ | NULL | R | document.id / RESTRICT | อ้างรหัส document |
| reverses_event_id | uuid | ได้ | NULL | R | budget_event.id / RESTRICT | อ้างรหัส budget_event |
| posted_at | timestamptz | ได้ | NULL | I | — | เวลาโพสต์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_budget_event_01`: (operation_receipt_id)
- `uq_budget_event_02`: (reverses_event_id) WHERE reverses_event_id IS NOT NULL
- `ix_budget_event_01` btree: (created_by)
- `ix_budget_event_02` btree: (updated_by)
- `ix_budget_event_03` btree: (organization_id)
- `ix_budget_event_04` btree: (fiscal_year_id)
- `ix_budget_event_05` btree: (policy_version_id)
- `ix_budget_event_06` btree: (evidence_document_id)
- `ix_budget_event_07` btree: (reverses_event_id)
- postedแล้วไม่แก้line; reversalใหม่อ้างoriginal; partialreversalใช้policyเฉพาะก่อนเปิดจริง
- row_version >= 1
- draftมีหลักฐานยังไม่ครบได้; submitted/approved/postedต้องหลักฐานครบตามpolicy; ให้server/RPCตรวจ

### allocation

หลักฐานการจัดสรร ไม่ใช้ยอดนี้บวกกับledgerอีกครั้ง

เจ้าของเสนอ: O06 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: หน่วย+ปีงบ+แหล่งเงิน+อำนาจวงเงินที่ยืนยัน; techไม่มีอนุมัติเอง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| budget_event_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | budget_event.id / RESTRICT | อ้างรหัส budget_event |
| budget_line_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | budget_line.id / RESTRICT | อ้างรหัส budget_line |
| authorized_amount | numeric(20,2) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ยอดจัดสรรที่รับรองเป็นexactdecimal |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_allocation_01`: (budget_event_id)
- `ix_allocation_01` btree: (created_by)
- `ix_allocation_02` btree: (updated_by)
- `ix_allocation_03` btree: (budget_line_id)
- row_version >= 1
- authorized_amount: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### reservation

รายละเอียดจอง ไม่เป็นbalanceอีกชุด

เจ้าของเสนอ: O06 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: หน่วย+ปีงบ+แหล่งเงิน+อำนาจวงเงินที่ยืนยัน; techไม่มีอนุมัติเอง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| budget_event_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | budget_event.id / RESTRICT | อ้างรหัส budget_event |
| budget_line_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | budget_line.id / RESTRICT | อ้างรหัส budget_line |
| requested_amount | numeric(20,2) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ยอดจอง>0 |
| procurement_request_id | uuid | ได้ | NULL | R | procurement_request.id / RESTRICT | อ้างรหัส procurement_request |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_reservation_01`: (budget_event_id)
- `ix_reservation_01` btree: (created_by)
- `ix_reservation_02` btree: (updated_by)
- `ix_reservation_03` btree: (budget_line_id)
- `ix_reservation_04` btree: (procurement_request_id)
- row_version >= 1
- requested_amount: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### obligation

ภาระผูกพันอ้างจองเดิมเพื่อไม่หักซ้ำ

เจ้าของเสนอ: O06 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: หน่วย+ปีงบ+แหล่งเงิน+อำนาจวงเงินที่ยืนยัน; techไม่มีอนุมัติเอง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| budget_event_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | budget_event.id / RESTRICT | อ้างรหัส budget_event |
| budget_line_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | budget_line.id / RESTRICT | อ้างรหัส budget_line |
| reservation_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | reservation.id / RESTRICT | อ้างรหัส reservation |
| purchase_order_id | uuid | ได้ | NULL | R | purchase_order.id / RESTRICT | อ้างรหัส purchase_order |
| committed_amount | numeric(20,2) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ยอดเปลี่ยนจองเป็นผูกพัน>0 |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_obligation_01`: (budget_event_id)
- `ix_obligation_01` btree: (created_by)
- `ix_obligation_02` btree: (updated_by)
- `ix_obligation_03` btree: (budget_line_id)
- `ix_obligation_04` btree: (reservation_id)
- `ix_obligation_05` btree: (purchase_order_id)
- row_version >= 1
- committed_amount: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### disbursement

หลักฐานจ่ายบางส่วนอ้างobligation ไม่ใช่โอนธนาคาร

เจ้าของเสนอ: O06 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: หน่วย+ปีงบ+แหล่งเงิน+อำนาจวงเงินที่ยืนยัน; techไม่มีอนุมัติเอง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| budget_event_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | budget_event.id / RESTRICT | อ้างรหัส budget_event |
| obligation_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | obligation.id / RESTRICT | อ้างรหัส obligation |
| goods_receipt_id | uuid | ได้ | NULL | R | goods_receipt.id / RESTRICT | อ้างรหัส goods_receipt |
| paid_amount | numeric(20,2) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | จำนวนจ่าย>0ตามหลักฐาน |
| payment_reference | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | เลขเอกสารจ่ายเท่าที่จำเป็น ไม่มีเลขบัญชี/secretที่ไม่จำเป็น |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_disbursement_01`: (budget_event_id)
- `ix_disbursement_01` btree: (created_by)
- `ix_disbursement_02` btree: (updated_by)
- `ix_disbursement_03` btree: (obligation_id)
- `ix_disbursement_04` btree: (goods_receipt_id)
- row_version >= 1
- paid_amount: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### budget_posting

แหล่งยอดจริงหนึ่งชุด perbucket signeddelta

เจ้าของเสนอ: O06 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: หน่วย+ปีงบ+แหล่งเงิน+อำนาจวงเงินที่ยืนยัน; techไม่มีอนุมัติเอง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| budget_event_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | budget_event.id / RESTRICT | อ้างรหัส budget_event |
| budget_line_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | budget_line.id / RESTRICT | อ้างรหัส budget_line |
| entry_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ลำดับline>=1 |
| bucket_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | allocated/reserved/obligated/spent |
| amount_delta | numeric(20,2) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | deltaบวก/ลบ exact ไม่zero |
| reservation_id | uuid | ได้ | NULL | R | reservation.id / RESTRICT | อ้างรหัส reservation |
| obligation_id | uuid | ได้ | NULL | R | obligation.id / RESTRICT | อ้างรหัส obligation |
| disbursement_id | uuid | ได้ | NULL | R | disbursement.id / RESTRICT | อ้างรหัส disbursement |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_budget_posting_01`: (budget_event_id, entry_no)
- `ix_budget_posting_01` btree: (recorded_by)
- `ix_budget_posting_02` btree: (budget_event_id)
- `ix_budget_posting_03` btree: (budget_line_id)
- `ix_budget_posting_04` btree: (reservation_id)
- `ix_budget_posting_05` btree: (obligation_id)
- `ix_budget_posting_06` btree: (disbursement_id)
- `ix_budget_posting_07` btree: (budget_line_id, bucket_code)
- amount_delta!=0; entry_no>=1
- RPClockbudget_line ตรวจยอด/period/สกุล/alllines/approve/audit; CHECKไม่รวมยอดข้ามแถว
- amount_delta: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### period_close

ปิดช่วงตามpolicyไม่เดาวันปิด

เจ้าของเสนอ: O06 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: หน่วย+ปีงบ+แหล่งเงิน+อำนาจวงเงินที่ยืนยัน; techไม่มีอนุมัติเอง

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| fiscal_year_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | fiscal_year.id / RESTRICT | อ้างรหัส fiscal_year |
| period_key | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสช่วงที่รับรอง |
| starts_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เริ่ม |
| ends_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | สิ้นไม่รวมปลาย |
| closed_at | timestamptz | ได้ | NULL | I | — | เวลาปิด |
| decision_id | uuid | ได้ | NULL | R | decision.id / RESTRICT | อ้างรหัส decision |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_period_close_01`: (organization_id, fiscal_year_id, period_key)
- `ix_period_close_01` btree: (created_by)
- `ix_period_close_02` btree: (updated_by)
- `ix_period_close_03` btree: (organization_id)
- `ix_period_close_04` btree: (fiscal_year_id)
- `ix_period_close_05` btree: (decision_id)
- ends_on>starts_on; closedperiodห้ามpostจนworkflowเปิดใหม่ที่รับรอง
- row_version >= 1

## หมวด 07 — พัสดุและครุภัณฑ์

### unit_of_measure

หน่วยนับและความละเอียดจากpolicy

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| unit_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสหน่วย |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชื่อหน่วยรับรอง |
| quantity_scale | smallint | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ทศนิยมที่อนุญาต0–6 เป็นProposalQ024 |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_unit_of_measure_01`: (unit_code)
- `ix_unit_of_measure_01` btree: (created_by)
- `ix_unit_of_measure_02` btree: (updated_by)
- row_version >= 1

### item

วัสดุหรือชนิดครุภัณฑ์ ไม่ใช่ทะเบียนรายชิ้น

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| item_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสสินค้า/วัสดุ |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชื่อที่รับรอง |
| item_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | material/assetตามpolicy |
| unit_of_measure_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | unit_of_measure.id / RESTRICT | อ้างรหัส unit_of_measure |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_item_01`: (item_code)
- `ix_item_01` btree: (created_by)
- `ix_item_02` btree: (updated_by)
- `ix_item_03` btree: (unit_of_measure_id)
- row_version >= 1

### warehouse

คลังอ้างOrganizationเดิม

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| warehouse_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสคลัง |
| label_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชื่อคลัง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_warehouse_01`: (organization_id, warehouse_code)
- `ix_warehouse_01` btree: (created_by)
- `ix_warehouse_02` btree: (updated_by)
- `ix_warehouse_03` btree: (organization_id)
- row_version >= 1

### procurement_request

ขอซื้ออ้างเส้นงบ ไม่เปิดงบโดยroleพัสดุ

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| budget_line_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | budget_line.id / RESTRICT | อ้างรหัส budget_line |
| request_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสขอซื้อ |
| estimated_amount | numeric(20,2) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ประมาณการexactdecimal |
| request_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | draft/submitted/approved/returned |
| evidence_document_id | uuid | ได้ | NULL | R | document.id / RESTRICT | อ้างรหัส document |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_procurement_request_01`: (organization_id, request_code)
- `ix_procurement_request_01` btree: (created_by)
- `ix_procurement_request_02` btree: (updated_by)
- `ix_procurement_request_03` btree: (organization_id)
- `ix_procurement_request_04` btree: (budget_line_id)
- `ix_procurement_request_05` btree: (evidence_document_id)
- approvalจึงจองงบ; เงินทางการและเกณฑ์จัดซื้อยังQ010
- row_version >= 1
- draftมีหลักฐานยังไม่ครบได้; submitted/approved/postedต้องหลักฐานครบตามpolicy; ให้server/RPCตรวจ
- estimated_amount: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### procurement_request_line

รายการขอซื้อ

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| procurement_request_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | procurement_request.id / RESTRICT | อ้างรหัส procurement_request |
| line_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ลำดับ |
| item_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | item.id / RESTRICT | อ้างรหัส item |
| requested_quantity | numeric(20,6) | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | จำนวน>0ตามunit scale |
| estimated_unit_price | numeric(20,2) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ราคาexactdecimal |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_procurement_request_line_01`: (procurement_request_id, line_no)
- `uq_procurement_request_line_02`: (id, procurement_request_id)
- `ix_procurement_request_line_01` btree: (created_by)
- `ix_procurement_request_line_02` btree: (updated_by)
- `ix_procurement_request_line_03` btree: (procurement_request_id)
- `ix_procurement_request_line_04` btree: (item_id)
- row_version >= 1
- requested_quantity: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger
- estimated_unit_price: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### purchase_order

คำสั่งซื้อ; ชื่อorderเดิมเปลี่ยนหลีกคำSQLกำกวม

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| procurement_request_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | procurement_request.id / RESTRICT | อ้างรหัส procurement_request |
| order_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสคำสั่งซื้อ |
| obligation_id | uuid | ได้ | NULL | R | obligation.id / RESTRICT | อ้างรหัส obligation |
| evidence_document_id | uuid | ได้ | NULL | R | document.id / RESTRICT | อ้างรหัส document |
| order_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | draft/approved/issued/closed |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_purchase_order_01`: (order_code)
- `uq_purchase_order_02`: (id, procurement_request_id)
- `ix_purchase_order_01` btree: (created_by)
- `ix_purchase_order_02` btree: (updated_by)
- `ix_purchase_order_03` btree: (procurement_request_id)
- `ix_purchase_order_04` btree: (obligation_id)
- `ix_purchase_order_05` btree: (evidence_document_id)
- issuedต้องมีobligationจากงบที่ตรวจแล้ว
- row_version >= 1
- draftมีหลักฐานยังไม่ครบได้; submitted/approved/postedต้องหลักฐานครบตามpolicy; ให้server/RPCตรวจ

### purchase_order_line

รายการสั่งซื้ออ้างรายการขอ

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| purchase_order_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | purchase_order.id / RESTRICT | อ้างรหัส purchase_order |
| procurement_request_line_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | procurement_request_line.id / RESTRICT | อ้างรหัส procurement_request_line |
| line_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ลำดับ |
| ordered_quantity | numeric(20,6) | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | จำนวนสั่ง>0 |
| unit_price | numeric(20,2) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ราคาexactdecimal |
| procurement_request_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | procurement_request.id / RESTRICT | คอลัมน์contextสำหรับcompositeFK ไม่ให้clientปลอมความสัมพันธ์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_purchase_order_line_01`: (purchase_order_id, line_no)
- `uq_purchase_order_line_02`: (id, purchase_order_id)
- `ix_purchase_order_line_01` btree: (created_by)
- `ix_purchase_order_line_02` btree: (updated_by)
- `ix_purchase_order_line_03` btree: (purchase_order_id)
- `ix_purchase_order_line_04` btree: (procurement_request_line_id)
- `ix_purchase_order_line_05` btree: (procurement_request_id)
- composite FK (procurement_request_line_id, procurement_request_id) → procurement_request_line(id, procurement_request_id); parentมีuniqueชุดนี้; RESTRICT
- composite FK (purchase_order_id, procurement_request_id) → purchase_order(id, procurement_request_id); parentมีuniqueชุดนี้; RESTRICT
- รายการขอต้องอยู่procurement_requestเดียวกับheader via compositeFK
- row_version >= 1
- ordered_quantity: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger
- unit_price: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### goods_receipt

ตรวจรับบางส่วน แยกบันทึกจ่าย

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| purchase_order_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | purchase_order.id / RESTRICT | อ้างรหัส purchase_order |
| warehouse_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | warehouse.id / RESTRICT | อ้างรหัส warehouse |
| receipt_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | เลขตรวจรับที่รับรอง |
| received_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันรับ |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |
| operation_receipt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | operation_receipt.id / RESTRICT | อ้างรหัส operation_receipt |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_goods_receipt_01`: (receipt_code)
- `uq_goods_receipt_02`: (operation_receipt_id)
- `uq_goods_receipt_03`: (id, purchase_order_id)
- `ix_goods_receipt_01` btree: (created_by)
- `ix_goods_receipt_02` btree: (updated_by)
- `ix_goods_receipt_03` btree: (purchase_order_id)
- `ix_goods_receipt_04` btree: (warehouse_id)
- `ix_goods_receipt_05` btree: (evidence_document_id)
- row_version >= 1

### goods_receipt_line

จำนวนรับครั้งนี้ ไม่รวมซ้ำหลายreceipt

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| goods_receipt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | goods_receipt.id / RESTRICT | อ้างรหัส goods_receipt |
| purchase_order_line_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | purchase_order_line.id / RESTRICT | อ้างรหัส purchase_order_line |
| line_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ลำดับ |
| received_quantity | numeric(20,6) | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | จำนวนรับ>0 |
| purchase_order_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | purchase_order.id / RESTRICT | คอลัมน์contextสำหรับcompositeFK ไม่ให้clientปลอมความสัมพันธ์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_goods_receipt_line_01`: (goods_receipt_id, line_no)
- `ix_goods_receipt_line_01` btree: (created_by)
- `ix_goods_receipt_line_02` btree: (updated_by)
- `ix_goods_receipt_line_03` btree: (goods_receipt_id)
- `ix_goods_receipt_line_04` btree: (purchase_order_line_id)
- `ix_goods_receipt_line_05` btree: (purchase_order_id)
- composite FK (goods_receipt_id, purchase_order_id) → goods_receipt(id, purchase_order_id); parentมีuniqueชุดนี้; RESTRICT
- composite FK (purchase_order_line_id, purchase_order_id) → purchase_order_line(id, purchase_order_id); parentมีuniqueชุดนี้; RESTRICT
- RPClockorderline ตรวจรับรวมไม่เกินที่สั่งตามpolicy; FKheaderorderต้องตรง
- row_version >= 1
- received_quantity: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### stock_movement

หัวledgerวัสดุ immutableหลังโพสต์

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| movement_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | receive/issue/transfer/adjust/reverse |
| operation_receipt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | operation_receipt.id / RESTRICT | อ้างรหัส operation_receipt |
| goods_receipt_id | uuid | ได้ | NULL | R | goods_receipt.id / RESTRICT | อ้างรหัส goods_receipt |
| stocktake_id | uuid | ได้ | NULL | R | stocktake.id / RESTRICT | อ้างรหัส stocktake |
| reverses_movement_id | uuid | ได้ | NULL | R | stock_movement.id / RESTRICT | อ้างรหัส stock_movement |
| business_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเคลื่อนไหว |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |
| posted_at | timestamptz | ได้ | NULL | I | — | เวลาโพสต์ |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_stock_movement_01`: (operation_receipt_id)
- `uq_stock_movement_02`: (reverses_movement_id) WHERE reverses_movement_id IS NOT NULL
- `ix_stock_movement_01` btree: (created_by)
- `ix_stock_movement_02` btree: (updated_by)
- `ix_stock_movement_03` btree: (goods_receipt_id)
- `ix_stock_movement_04` btree: (stocktake_id)
- `ix_stock_movement_05` btree: (reverses_movement_id)
- `ix_stock_movement_06` btree: (evidence_document_id)
- row_version >= 1

### stock_movement_line

signedquantityต่อคลัง/วัสดุ; โอนคู่ในtransaction

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| stock_movement_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | stock_movement.id / RESTRICT | อ้างรหัส stock_movement |
| line_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ลำดับ |
| warehouse_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | warehouse.id / RESTRICT | อ้างรหัส warehouse |
| item_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | item.id / RESTRICT | อ้างรหัส item |
| quantity_delta | numeric(20,6) | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | บวกเข้า/ลบออก ไม่zero |
| goods_receipt_line_id | uuid | ได้ | NULL | R | goods_receipt_line.id / RESTRICT | อ้างรหัส goods_receipt_line |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_stock_movement_line_01`: (stock_movement_id, line_no)
- `ix_stock_movement_line_01` btree: (recorded_by)
- `ix_stock_movement_line_02` btree: (stock_movement_id)
- `ix_stock_movement_line_03` btree: (warehouse_id)
- `ix_stock_movement_line_04` btree: (item_id)
- `ix_stock_movement_line_05` btree: (goods_receipt_line_id)
- `ix_stock_movement_line_06` btree: (warehouse_id, item_id)
- transfernet0ต่อitem+unit; ตรวจscopeต้นปลาย; lockคู่คลังเรียงidกันdeadlock
- stockคงเหลือมาจากsum postedlines ไม่เก็บสองทะเบียน
- quantity_delta: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### asset

ทะเบียนครุภัณฑ์รายชิ้น อ้างreceiptเดิม

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| item_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | item.id / RESTRICT | อ้างรหัส item |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| goods_receipt_line_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | goods_receipt_line.id / RESTRICT | อ้างรหัส goods_receipt_line |
| asset_ordinal | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ลำดับชิ้นในreceiptline |
| asset_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสทะเบียนชิ้น |
| serial_number | text | ได้ | NULL | R | — | เลขเครื่องถ้ามี |
| acquisition_cost | numeric(20,2) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ทุนตามpolicy ไม่เดาค่าเสื่อม |
| asset_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | สถานะตามประวัติ/policy |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_asset_01`: (asset_code)
- `uq_asset_02`: (goods_receipt_line_id, asset_ordinal)
- `ix_asset_01` btree: (created_by)
- `ix_asset_02` btree: (updated_by)
- `ix_asset_03` btree: (item_id)
- `ix_asset_04` btree: (organization_id)
- `ix_asset_05` btree: (goods_receipt_line_id)
- item_kind=asset; ordinal>=1; รับแบบจำนวนเต็มตามunitpolicy
- row_version >= 1
- acquisition_cost: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger
- acquisition_cost>=0 อนุญาต0เมื่อpolicyรับรองหลักฐานได้มาที่ไม่คิดราคา; ไม่ตีราคาหรือค่าเสื่อมจากการเดา

### asset_assignment

ประวัติผู้ถือครอง อ้างPersonเดิม

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-H ประวัติไม่เขียนทับ; แก้ด้วยรุ่นใหม่/หลักฐาน

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| effective_from | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเริ่มมีผล; ตีความวันไทย |
| effective_to | date | ได้ | NULL | I | — | วันสิ้นช่วงแบบไม่รวมปลาย; NULLไม่มีวันสิ้น |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC แสดงAsia/Bangkokพ.ศ. |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | หลักฐานที่มีACL; ต้องมีเมื่อรับประวัติมีผล |
| superseded_at | timestamptz | ได้ | NULL | I | — | เวลาที่แทนรุ่นความรู้เดิม; เปลี่ยนmetadataนี้พร้อมauditเท่านั้น |
| replaces_id | uuid | ได้ | NULL | R | asset_assignment.id / RESTRICT | อ้างรุ่นเก่าที่แก้ไข; ไม่ลบหรือแก้เนื้อหาเดิม |
| asset_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | asset.id / RESTRICT | อ้างรหัส asset |
| person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_asset_assignment_01` btree: (recorded_by)
- `ix_asset_assignment_02` btree: (evidence_document_id)
- `ix_asset_assignment_03` btree: (replaces_id)
- `ix_asset_assignment_04` btree: (asset_id)
- `ix_asset_assignment_05` btree: (person_id)
- `ix_asset_assignment_06` btree: (organization_id)
- `ix_asset_assignment_07` btree: (asset_id, person_id, effective_from, recorded_at)
- `ex_asset_assignment_current`: nonoverlapตามkey (asset_id, person_id) ของcurrentknowledge ช่วง[effective_from,effective_to); EXCLUDE/GiSTหรือalternativelockรอQ023 ไม่ใช้CHECKข้ามแถว
- effective_to IS NULL OR effective_to > effective_from
- superseded_at IS NULL OR superseded_at >= recorded_at
- ช่วงcurrentknowledgeห้ามทับตามbusinesskeyที่ระบุในERD; exclusion/transaction ไม่ใช้CHECKข้ามแถว

### loan

ยืมคืนครุภัณฑ์แยกเหตุการณ์

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| asset_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | asset.id / RESTRICT | อ้างรหัส asset |
| borrower_person_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | person.id / RESTRICT | อ้างรหัส person |
| loaned_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | เวลายืม |
| due_at | timestamptz | ได้ | NULL | R | — | กำหนดคืน |
| returned_at | timestamptz | ได้ | NULL | R | — | เวลาคืน |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_loan_01`: (asset_id) WHERE returned_at IS NULL AND is_active
- `ix_loan_01` btree: (created_by)
- `ix_loan_02` btree: (updated_by)
- `ix_loan_03` btree: (asset_id)
- `ix_loan_04` btree: (borrower_person_id)
- `ix_loan_05` btree: (evidence_document_id)
- returned_at IS NULL OR returned_at>=loaned_at
- row_version >= 1

### maintenance

ประวัติซ่อมชิ้น ไม่เขียนทับผู้ถือครอง

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| asset_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | asset.id / RESTRICT | อ้างรหัส asset |
| started_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เริ่ม |
| ended_on | date | ได้ | NULL | I | — | สิ้น |
| cost_amount | numeric(20,2) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | ค่าใช้จ่ายอ้างงบถ้ามี |
| budget_event_id | uuid | ได้ | NULL | R | budget_event.id / RESTRICT | อ้างรหัส budget_event |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |
| description | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | คำอธิบายเท่าที่จำเป็น |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_maintenance_01` btree: (created_by)
- `ix_maintenance_02` btree: (updated_by)
- `ix_maintenance_03` btree: (asset_id)
- `ix_maintenance_04` btree: (budget_event_id)
- `ix_maintenance_05` btree: (evidence_document_id)
- row_version >= 1
- cost_amount: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### stocktake

หัวตรวจนับและapprovalการปรับ

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| warehouse_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | warehouse.id / RESTRICT | อ้างรหัส warehouse |
| stocktake_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | รหัสตรวจนับ |
| counted_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันตรวจ |
| stocktake_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | draft/submitted/approved/posted |
| evidence_document_id | uuid | ได้ | NULL | R | document.id / RESTRICT | อ้างรหัส document |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_stocktake_01`: (warehouse_id, stocktake_code)
- `ix_stocktake_01` btree: (created_by)
- `ix_stocktake_02` btree: (updated_by)
- `ix_stocktake_03` btree: (warehouse_id)
- `ix_stocktake_04` btree: (evidence_document_id)
- row_version >= 1
- draftมีหลักฐานยังไม่ครบได้; submitted/approved/postedต้องหลักฐานครบตามpolicy; ให้server/RPCตรวจ

### stocktake_line

จำนวนที่เห็นและยอดsnapshotก่อนปรับ

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| stocktake_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | stocktake.id / RESTRICT | อ้างรหัส stocktake |
| item_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | item.id / RESTRICT | อ้างรหัส item |
| expected_quantity_snapshot | numeric(20,6) | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ยอดณcutoff |
| counted_quantity | numeric(20,6) | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ยอดนับ>=0 |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_stocktake_line_01`: (stocktake_id, item_id)
- `ix_stocktake_line_01` btree: (created_by)
- `ix_stocktake_line_02` btree: (updated_by)
- `ix_stocktake_line_03` btree: (stocktake_id)
- `ix_stocktake_line_04` btree: (item_id)
- row_version >= 1
- expected_quantity_snapshot: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger
- counted_quantity: ปฏิเสธNaN/Infinity และทศนิยมเกินscaleก่อนcast; ช่วงค่าตามชนิดและpolicy; คะแนน/ต้นทุนอาจเป็น0 quantity/amountdeltaมีเครื่องหมายได้เฉพาะledger

### disposal

จำหน่าย/ยุติใช้งานมีหลักฐาน ไม่ลบasset

เจ้าของเสนอ: O07 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: คลัง/หน่วย/ผู้ถือครองตาม grant; การโอนตรวจสองคลัง; ปรับยอดต้องอนุมัติ

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| asset_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | asset.id / RESTRICT | อ้างรหัส asset |
| proposed_on | date | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | วันเสนอ |
| effective_on | date | ได้ | NULL | I | — | วันมีผลที่รับรอง |
| disposal_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | draft/submitted/approved/effective |
| evidence_document_id | uuid | ได้ | NULL | R | document.id / RESTRICT | อ้างรหัส document |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_disposal_01` btree: (created_by)
- `ix_disposal_02` btree: (updated_by)
- `ix_disposal_03` btree: (asset_id)
- `ix_disposal_04` btree: (evidence_document_id)
- `ix_disposal_05` btree: (policy_version_id)
- row_version >= 1
- draftมีหลักฐานยังไม่ครบได้; submitted/approved/postedต้องหลักฐานครบตามpolicy; ให้server/RPCตรวจ

## หมวด 08 — สารบรรณ

### register_counter

เลขทะเบียนตามperiodkeyที่รับรอง ไม่ใช้max+1

เจ้าของเสนอ: O08 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: scopeและACLเรื่อง/รุ่น/ผู้รับ; preview/search/download/printตรวจเหมือนกัน

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| register_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รับ/ส่ง/ภายในตามpolicy |
| period_key | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ช่วงเลข ไม่เดาว่าตรงปีงบ/ปีศึกษา |
| next_number | bigint | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เลขถัดไป>0เพิ่มในtransactionมีlock |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_register_counter_01`: (organization_id, register_kind, period_key)
- `ix_register_counter_01` btree: (created_by)
- `ix_register_counter_02` btree: (updated_by)
- `ix_register_counter_03` btree: (organization_id)
- `ix_register_counter_04` btree: (policy_version_id)
- row_version >= 1

### correspondence

เรื่องหนังสือกลาง ใช้documentเดิม

เจ้าของเสนอ: O08 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: scopeและACLเรื่อง/รุ่น/ผู้รับ; preview/search/download/printตรวจเหมือนกัน

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| register_counter_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | register_counter.id / RESTRICT | อ้างรหัส register_counter |
| register_number | bigint | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | เลขจากcounter |
| title_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | ชื่อเรื่องอาจลับ |
| secrecy_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชั้นตามระเบียบที่ยืนยัน |
| urgency_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ความเร่งด่วนตามpolicy |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_correspondence_01`: (register_counter_id, register_number)
- `ix_correspondence_01` btree: (created_by)
- `ix_correspondence_02` btree: (updated_by)
- `ix_correspondence_03` btree: (organization_id)
- `ix_correspondence_04` btree: (register_counter_id)
- row_version >= 1

### record_version

รุ่นหนังสือที่ตรวจแล้ว ไม่แก้ไฟล์หลังอนุมัติ

เจ้าของเสนอ: O08 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: scopeและACLเรื่อง/รุ่น/ผู้รับ; preview/search/download/printตรวจเหมือนกัน

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| correspondence_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | correspondence.id / RESTRICT | อ้างรหัส correspondence |
| version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นหนังสือ |
| file_version_id | uuid | ได้ | NULL | R | file_version.id / RESTRICT | อ้างรหัส file_version |
| record_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | draft/submitted/approved/sent |
| content_hash | char(64) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | hashรุ่น ไม่แทนลายมือชื่อ |
| supersedes_version_id | uuid | ได้ | NULL | R | record_version.id / RESTRICT | อ้างรหัส record_version |
| title_th_snapshot | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | หัวเรื่องของรุ่นนี้; ห้ามเอาหัวเรื่องล่าสุดให้คนที่มีสิทธิ์เฉพาะรุ่นเก่า |
| secrecy_code_snapshot | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชั้นของรุ่นนี้ตามpolicy |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_record_version_01`: (correspondence_id, version_no)
- `ix_record_version_01` btree: (created_by)
- `ix_record_version_02` btree: (updated_by)
- `ix_record_version_03` btree: (correspondence_id)
- `ix_record_version_04` btree: (file_version_id)
- `ix_record_version_05` btree: (supersedes_version_id)
- row_version >= 1
- draftมีหลักฐานยังไม่ครบได้; submitted/approved/postedต้องหลักฐานครบตามpolicy; ให้server/RPCตรวจ
- หลังsubmitted/approved/published/sealedตามชนิด ห้ามแก้เนื้อหาหรือsourceversionเดิม; revisionสร้างversionใหม่ร่วมaudit

### routing

ส่งรุ่นที่อนุมัติผ่านoutboxกลาง

เจ้าของเสนอ: O08 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: scopeและACLเรื่อง/รุ่น/ผู้รับ; preview/search/download/printตรวจเหมือนกัน

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| record_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | record_version.id / RESTRICT | อ้างรหัส record_version |
| sender_account_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| outbox_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | outbox.id / RESTRICT | อ้างรหัส outbox |
| sent_at | timestamptz | ได้ | NULL | R | — | เวลาส่งจริง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_routing_01`: (record_version_id, outbox_id)
- `ix_routing_01` btree: (created_by)
- `ix_routing_02` btree: (updated_by)
- `ix_routing_03` btree: (record_version_id)
- `ix_routing_04` btree: (sender_account_id)
- `ix_routing_05` btree: (outbox_id)
- row_version >= 1

### recipient_snapshot

ผู้รับจากPerson/Organizationและsnapshotรุ่น

เจ้าของเสนอ: O08 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: scopeและACLเรื่อง/รุ่น/ผู้รับ; preview/search/download/printตรวจเหมือนกัน

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| record_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | record_version.id / RESTRICT | อ้างรหัส record_version |
| target_kind | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | person/organization |
| person_id | uuid | ได้ | NULL | R | person.id / RESTRICT | อ้างรหัส person |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| person_name_snapshot | text | ได้ | NULL | R | — | ชื่อผู้รับถ้าperson |
| organization_name_snapshot | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | หน่วยผู้รับณวันส่ง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_recipient_snapshot_01`: (record_version_id, person_id) WHERE target_kind = 'person'
- `uq_recipient_snapshot_02`: (record_version_id, organization_id) WHERE target_kind = 'organization'
- `ix_recipient_snapshot_01` btree: (recorded_by)
- `ix_recipient_snapshot_02` btree: (record_version_id)
- `ix_recipient_snapshot_03` btree: (person_id)
- `ix_recipient_snapshot_04` btree: (organization_id)
- target_kindpersonต้องperson_id; organizationต้องperson_idNULL; ห้ามเลือกชื่อเหมือนแทนรหัส

### receipt

รับทราบexplicitตามผู้รับและรุ่น

เจ้าของเสนอ: O08 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: scopeและACLเรื่อง/รุ่น/ผู้รับ; preview/search/download/printตรวจเหมือนกัน

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| recipient_snapshot_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | recipient_snapshot.id / RESTRICT | อ้างรหัส recipient_snapshot |
| acknowledged_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| acknowledged_at | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | เวลายืนยันรับทราบ |
| operation_receipt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | operation_receipt.id / RESTRICT | อ้างรหัส operation_receipt |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_receipt_01`: (recipient_snapshot_id)
- `uq_receipt_02`: (operation_receipt_id)
- `ix_receipt_01` btree: (recorded_by)
- `ix_receipt_02` btree: (acknowledged_by)
- ผู้รับองค์กรให้authorizedactorคนหนึ่งรับแทนเป็นProposal Q009/Q023; ไม่autoเมื่อเปิดnotification

### assignment

มอบหมายงานหนังสือให้บัญชีที่ได้รับสิทธิ์

เจ้าของเสนอ: O08 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: scopeและACLเรื่อง/รุ่น/ผู้รับ; preview/search/download/printตรวจเหมือนกัน

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| record_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | record_version.id / RESTRICT | อ้างรหัส record_version |
| assigned_to | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| assigned_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| due_at | timestamptz | ได้ | NULL | R | — | กำหนดเสร็จ |
| assignment_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | pending/accepted/completed/returned |
| evidence_document_id | uuid | ได้ | NULL | R | document.id / RESTRICT | อ้างรหัส document |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_assignment_01`: (record_version_id, assigned_to)
- `ix_assignment_01` btree: (created_by)
- `ix_assignment_02` btree: (updated_by)
- `ix_assignment_03` btree: (record_version_id)
- `ix_assignment_04` btree: (assigned_to)
- `ix_assignment_05` btree: (assigned_by)
- `ix_assignment_06` btree: (evidence_document_id)
- row_version >= 1

### approval_evidence

หลักฐานapproval ไม่อ้างเป็นsignatureทางการ

เจ้าของเสนอ: O08 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: scopeและACLเรื่อง/รุ่น/ผู้รับ; preview/search/download/printตรวจเหมือนกัน

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| decision_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | decision.id / RESTRICT | อ้างรหัส decision |
| record_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | record_version.id / RESTRICT | อ้างรหัส record_version |
| file_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | file_version.id / RESTRICT | อ้างรหัส file_version |
| approved_hash | char(64) | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | hashของรุ่นที่ตรวจ |
| signing_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | internal_evidence/verified_signatureถ้ามีproviderที่รับรอง |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_approval_evidence_01`: (decision_id, record_version_id)
- `ix_approval_evidence_01` btree: (created_by)
- `ix_approval_evidence_02` btree: (updated_by)
- `ix_approval_evidence_03` btree: (decision_id)
- `ix_approval_evidence_04` btree: (record_version_id)
- `ix_approval_evidence_05` btree: (file_version_id)
- row_version >= 1

### retention_hold

ระงับการเปลี่ยน/ปกปิดหลักฐานตามอำนาจ

เจ้าของเสนอ: O08 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: scopeและACLเรื่อง/รุ่น/ผู้รับ; preview/search/download/printตรวจเหมือนกัน

การปิด/เก็บ: RET-A audit/hold append only ห้ามแก้ลบ

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |
| hold_reason | text | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | เหตุผลlegalholdไม่เปิดpublic |
| held_from | timestamptz | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เริ่มhold |
| released_at | timestamptz | ได้ | NULL | I | — | ยกholdที่รับรอง |
| evidence_document_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | document.id / RESTRICT | อ้างรหัส document |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- ไม่มีnaturaluniqueเพิ่มจากPK; การกดซ้ำใช้receipt/กฎบริการตามชนิด
- `ix_retention_hold_01` btree: (created_by)
- `ix_retention_hold_02` btree: (updated_by)
- `ix_retention_hold_03` btree: (document_id)
- `ix_retention_hold_04` btree: (evidence_document_id)
- row_version >= 1

## หมวด 09 — นำเข้าผ่าน Excel

### form_template_registry

แบบ/schemaมีรุ่น ไม่เดาชื่อศ.3

เจ้าของเสนอ: O09 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: เจ้าของbatch+หน่วย/รอบ+สิทธิ์ล่าสุดของworker; ไม่รับscopeจากไฟล์เป็นสิทธิ์

การปิด/เก็บ: RET-S ปิดใช้งาน; FK/ประวัติยังอยู่

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| template_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสเทมเพลต |
| version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นmachine schema |
| official_form_reference | text | ได้ | NULL | I | — | อ้างแบบทางการหลังหลักฐานครบ |
| verification_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | TO_VERIFY/VERIFIED |
| machine_schema | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | allowlistชื่อfield/type/calendar/sensitivity ไม่รับformula/macro/external link |
| evidence_document_id | uuid | ได้ | NULL | R | document.id / RESTRICT | อ้างรหัส document |
| file_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | file_version.id / RESTRICT | อ้างรหัส file_version |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_form_template_registry_01`: (template_code, version_no)
- `ix_form_template_registry_01` btree: (created_by)
- `ix_form_template_registry_02` btree: (updated_by)
- `ix_form_template_registry_03` btree: (evidence_document_id)
- `ix_form_template_registry_04` btree: (file_version_id)
- row_version >= 1

### import_batch

ไฟล์ชุดนำเข้าprivateไม่เพิ่มทะเบียนใบสมัคร

เจ้าของเสนอ: O09 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: เจ้าของbatch+หน่วย/รอบ+สิทธิ์ล่าสุดของworker; ไม่รับscopeจากไฟล์เป็นสิทธิ์

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| organization_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | organization.id / RESTRICT | อ้างรหัส organization |
| exam_session_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | exam_session.id / RESTRICT | อ้างรหัส exam_session |
| template_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | form_template_registry.id / RESTRICT | อ้างรหัส form_template_registry |
| source_file_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | file_version.id / RESTRICT | อ้างรหัส file_version |
| initiating_account_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| batch_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | quarantined/scanning/validating/ready/committing/completed/failed |
| dry_run_version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นรายงาน |
| total_rows | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | จำนวน>=0 |
| policy_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | policy_version.id / RESTRICT | อ้างรหัส policy_version |
| operation_receipt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | operation_receipt.id / RESTRICT | อ้างรหัส operation_receipt |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_import_batch_01`: (operation_receipt_id)
- `ix_import_batch_01` btree: (created_by)
- `ix_import_batch_02` btree: (updated_by)
- `ix_import_batch_03` btree: (organization_id)
- `ix_import_batch_04` btree: (exam_session_id)
- `ix_import_batch_05` btree: (template_id)
- `ix_import_batch_06` btree: (source_file_version_id)
- `ix_import_batch_07` btree: (initiating_account_id)
- `ix_import_batch_08` btree: (policy_version_id)
- ก่อนready scanpassedและschemaถูก; latestgrantหน่วย/รอบทั้งdryrun/commit/worker
- row_version >= 1

### import_row

ข้อมูล stagingแยกจากใบสมัครจริง

เจ้าของเสนอ: O09 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: เจ้าของbatch+หน่วย/รอบ+สิทธิ์ล่าสุดของworker; ไม่รับscopeจากไฟล์เป็นสิทธิ์

การปิด/เก็บ: RET-F ไฟล์และstagingprivate; quarantine/ACL/hold; อายุจริงTO VERIFY

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| import_batch_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | import_batch.id / RESTRICT | อ้างรหัส import_batch |
| row_number | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | เลขแถว>=1 |
| dry_run_version_no | integer | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รุ่นรายงาน |
| normalized_payload | jsonb | ไม่ได้ | ไม่มี; serverต้องระบุ | H | — | อาจมีเลขประจำตัว; ทุกleafตามtemplateclass ไม่รู้classปฏิเสธ |
| matched_person_id | uuid | ได้ | NULL | R | person.id / RESTRICT | อ้างรหัส person |
| row_status | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | valid/error/warningตามschema |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_import_row_01`: (import_batch_id, dry_run_version_no, row_number)
- `ix_import_row_01` btree: (created_by)
- `ix_import_row_02` btree: (updated_by)
- `ix_import_row_03` btree: (import_batch_id)
- `ix_import_row_04` btree: (matched_person_id)
- row_version >= 1

### validation_issue

รายงานfield/แถวไม่ใส่ค่าลับทั้งเซลล์

เจ้าของเสนอ: O09 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: เจ้าของbatch+หน่วย/รอบ+สิทธิ์ล่าสุดของworker; ไม่รับscopeจากไฟล์เป็นสิทธิ์

การปิด/เก็บ: RET-F ไฟล์และstagingprivate; quarantine/ACL/hold; อายุจริงTO VERIFY

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| import_row_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | import_row.id / RESTRICT | อ้างรหัส import_row |
| field_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | ชื่อfieldจากschema |
| issue_code | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | รหัสปัญหา |
| severity | text | ไม่ได้ | ไม่มี; serverต้องระบุ | I | — | error/warning |
| message_th | text | ไม่ได้ | ไม่มี; serverต้องระบุ | R | — | วิธีแก้ไทยแบบredact ไม่echoเลขประชาชน |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_validation_issue_01`: (import_row_id, field_code, issue_code)
- `ix_validation_issue_01` btree: (created_by)
- `ix_validation_issue_02` btree: (updated_by)
- `ix_validation_issue_03` btree: (import_row_id)
- row_version >= 1

### commit_receipt

ลิงก์batch/แถวไปapplicationเดิม ไม่อีกทะเบียน

เจ้าของเสนอ: O09 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: เจ้าของbatch+หน่วย/รอบ+สิทธิ์ล่าสุดของworker; ไม่รับscopeจากไฟล์เป็นสิทธิ์

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| recorded_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาบันทึกUTC |
| recorded_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| import_batch_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | import_batch.id / RESTRICT | อ้างรหัส import_batch |
| import_row_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | import_row.id / RESTRICT | อ้างรหัส import_row |
| application_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | application.id / RESTRICT | อ้างรหัส application |
| operation_receipt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | operation_receipt.id / RESTRICT | อ้างรหัส operation_receipt |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_commit_receipt_01`: (import_row_id)
- `uq_commit_receipt_02`: (import_batch_id, application_id)
- `ix_commit_receipt_01` btree: (recorded_by)
- `ix_commit_receipt_02` btree: (import_batch_id)
- `ix_commit_receipt_03` btree: (application_id)
- `ix_commit_receipt_04` btree: (operation_receipt_id)
- row/batch/receipt/หน่วย/รอบต้องตรง; commitทั้งชุดสำเร็จหรือย้อนกลับ

### amendment_link

ขอแก้ชุดที่มีปลายทางแทนลบ

เจ้าของเสนอ: O09 | PK: `id` | schema: `private` | RLS: ENABLED / DENY BY DEFAULT (ยังไม่สร้างจริง)

ขอบเขต: เจ้าของbatch+หน่วย/รอบ+สิทธิ์ล่าสุดของworker; ไม่รับscopeจากไฟล์เป็นสิทธิ์

การปิด/เก็บ: RET-E ธุรกรรม/รุ่นที่sealแล้วไม่แก้; กลับรายการ/รุ่นแก้ไข

| ฟิลด์ | ชนิด | NULLได้ | defaultเสนอ | ชั้น | FK | ความหมาย/ข้อจำกัด |
| --- | --- | --- | --- | --- | --- | --- |
| id | uuid | ไม่ได้ | gen_random_uuid() | R | — | รหัสรายการกลาง; ไม่ใช้ชื่อหรือเลขประชาชนเป็นPK |
| created_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาสร้างUTC |
| created_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| updated_at | timestamptz | ไม่ได้ | server_now | I | — | เวลาปรับล่าสุดUTC |
| updated_by | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | user_account.id / RESTRICT | อ้างรหัส user_account |
| row_version | integer | ไม่ได้ | 1 | I | — | รุ่นตรวจoptimistic concurrency |
| is_active | boolean | ไม่ได้ | true | I | — | ปิดใช้งานแทนลบ; ไม่ทำให้FKหรือประวัติหาย |
| import_batch_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | import_batch.id / RESTRICT | อ้างรหัส import_batch |
| application_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | application.id / RESTRICT | อ้างรหัส application |
| request_version_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | request_version.id / RESTRICT | อ้างรหัส request_version |
| previous_commit_receipt_id | uuid | ไม่ได้ | ไม่มี; serverต้องระบุ | R | commit_receipt.id / RESTRICT | อ้างรหัส commit_receipt |

ข้อบังคับและดัชนีเสนอ:

- PK: `id` ไม่NULLและห้ามซ้ำ
- `uq_amendment_link_01`: (application_id, request_version_id)
- `ix_amendment_link_01` btree: (created_by)
- `ix_amendment_link_02` btree: (updated_by)
- `ix_amendment_link_03` btree: (import_batch_id)
- `ix_amendment_link_04` btree: (application_id)
- `ix_amendment_link_05` btree: (request_version_id)
- `ix_amendment_link_06` btree: (previous_commit_receipt_id)
- มีที่นั่ง/คะแนน/ผลแล้วต้องworkflowและแก้รุ่น ไม่deleteปลายทาง
- row_version >= 1

## 5 สิ่งที่ไม่ได้ยืนยันจากเอกสารนี้

ตัวเลขprecision/scaleและnaturalkeysเป็นข้อเสนอเพื่อออกแบบ ไม่ใช่ระเบียบ/วงเงิน/คุณสมบัติจริง ไม่มีmigrationหรือการรันPostgreSQL/RLS/Auth/Storage/API/worker ความครบของตารางและฟิลด์ตรวจด้วยdata_model.jsonและเครื่องมือตรวจเอกสาร บท02TC90กรณียังPLANNED / NOT RUN

ชื่อแนวคิดเดิมที่เปลี่ยน: `Course` → `course`, `order` → `purchase_order`, `Relation` → `organization_relation`, `address` → `address_version`, `learning_attempt` → `attempt`, `budget_ledger` → `budget_event` + `budget_posting`, `exam_result` → `subject_score`/`result_draft`/`result_release` ชื่อเดิมเป็นconcept ไม่สร้างตารางคู่ขนานเพิ่ม

หัวperson_change_requestจากบท02เสนอเป็นextensionของchange_requestในบท04 ไม่มีอีกengine/คิว/formsใหม่ ต้องให้O01/O04รับรองชนิดเรื่องในQ024ก่อนmigrationจริง กระบวนการอนุมัติบัญชี/restoreที่ยังไม่กำหนดอยู่นอกbusinessworkflowtargetsในโมเดลนี้ ไม่สร้างadminflowจากการเดา
