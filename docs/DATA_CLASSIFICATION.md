# การจัดชั้นข้อมูลและข้อมูลสำหรับหน้าสาธารณะ

บท 04 | รุ่นเอกสาร 1.4 | 3 ตุลาคม 2569 (2026-10-03) | PROPOSAL / TO VERIFY

## 1 อ่านและใช้ร่วมกัน

ชั้นข้อมูลบอกว่าช่องนั้นควรเปิดเผยได้แค่ไหน ไม่ได้ให้สิทธิ์ผู้ใช้โดยตัวเอง สิทธิ์ยังต้องผ่านหน้าที่ พื้นที่ ช่วงมอบหมาย และวัตถุประสงค์ตาม [PERMISSIONS](PERMISSIONS.md) อ่านคำอธิบายทุกช่องใน [DATA_DICTIONARY](DATA_DICTIONARY.md) และความสัมพันธ์ใน [ERD](ERD.md)

เจ้าของงานตามหน้าที่และ C03 ต้องรับรองรายการฟิลด์ วัตถุประสงค์ ฐานการใช้/เปิดเผย และอายุเก็บใน Q008/Q016/Q025 ก่อนข้อมูลจริง ผู้ใช้อนุมัติให้เขียนแบบออกแบบ ไม่ได้ยืนยันคำตอบทางกฎหมายหรือทำให้ข้อมูลส่วนตัวกลายเป็นสาธารณะ ใช้เฉพาะข้อมูลสมมติใน dev

## 2 ระดับข้อมูลเสนอ

| ชั้น | ความหมาย | ตัวอย่าง/หลักใช้งาน |
| --- | --- | --- |
| P | Public เมื่อผ่านการรับรองและเผยแพร่รุ่นนั้นแล้ว | เนื้อหากลางที่ตรวจแล้ว public_ref; สถานะ draft/withdrawn ห้ามออก public แม้ฟิลด์เป็น P |
| I | Internal ใช้ภายในตามงาน | เวลา metadata รหัสเทคนิค policy configuration ที่ไม่มีข้อมูลส่วนตัวหรือ secret |
| R | Restricted เฉพาะหน้าที่และขอบเขต | Person/Organization IDs ชื่อ สังกัด ใบสมัคร คะแนน ผล งบ ครุภัณฑ์ ผู้สร้าง/อนุมัติ |
| H | Highly Restricted จำกัดวัตถุประสงค์และช่องข้อมูลเพิ่ม | เลขประชาชน วันเกิด ที่อยู่/เบอร์ส่วนตัว ข้อความอิสระ หลักฐาน ไฟล์ต้นฉบับ เฉลย และ payload นำเข้า |

P เป็นระดับขั้นต่ำเมื่อมีเงื่อนไขครบ ไม่ใช่คำสั่ง grant anonymous ชื่อบุคคลอยู่ R; ถ้าต้องแสดงตามนโยบายที่ยืนยัน ต้องสร้าง projection ของชื่อรุ่นที่รับรองผ่าน backend และ publication โดยไม่เปิดตาราง Person ทั้งชุด เจ้าหน้าที่ที่เข้าถึง Person ไม่ได้เข้าถึง H ทุกช่องอัตโนมัติ

UserAccount ไม่เก็บ password/token/secret จาก Auth ไม่มีฟิลด์สำหรับ credential ใหม่ รหัส Person ไม่ใช้เลขประชาชน การตรวจซ้ำด้วยตัวระบุเข้ารหัส/HMAC ต้องยืนยันชนิดตัวระบุ กุญแจ การหมุนกุญแจ และหลักฐานใน Q025; ไม่คำนวณ HMAC ด้วยกุญแจที่อยู่ในตารางหรือ frontend

## 3 เส้นทางเข้าถึงและไฟล์

1. ทุกตารางเสนอให้อยู่ private schema ที่ไม่เปิด anonymous table endpoint และเปิด RLS deny by default ต้องสร้างและทดสอบผ่าน migration ในบทลงมือ แบบเอกสารนี้ยังไม่สร้าง policy
2. Server ตรวจ session/binding/action/role/scope/เวลา/old-new rows ทุกครั้ง ทั้งอ่านแก้ส่งออกพิมพ์ดาวน์โหลดอนุมัติ Worker ตรวจตัวผู้ริเริ่มและ grant ปัจจุบันอีกครั้ง ไม่มีสิทธิ์ข้ามสายเพราะอยู่จังหวัดเดียวกัน
3. RLS คุมแถว; backend จำกัดฟิลด์ตามงานเพิ่มเติม ห้าม SELECT * แล้วส่ง record ตรง ๆ ห้ามใช้ service-role เป็นทางผ่าน public โดยไม่มีการตรวจ ต้องทดสอบฐานข้อมูลด้วย role/JWT ที่มีข้อจำกัดและทดสอบทางเข้าอื่นด้วย C02 ยืนยันรูปแบบจริง Q023
4. DTO คือรายการช่องข้อมูลที่อนุญาตส่งไปหน้าเว็บ Public DTO ใช้ allowlist ต่อชนิดและรุ่น policy ตรวจ publication/approval/withdrawal และตรึง source version ก่อนส่ง ไม่เอาชื่อปัจจุบันแทนชื่อที่อนุมัติในปีเก่า
5. ไฟล์ private ต้องตรวจขนาด ชนิดจริงจากเนื้อไฟล์เทียบ MIME/hash scan และ ACL ของ Document+FileVersion ที่ตรงกัน Quarantine ยังดู/ดาวน์โหลดไม่ได้ ผู้ได้รับแจ้งเตือนไม่ได้สิทธิ์อ่านไฟล์เพราะมี URL
6. ทุกช่องทาง download/export/print/worker ใช้ gate เดียวกัน URL อายุสั้นตรวจ fresh ACL ไม่คืน bucket/object_key หรือ URL ถาวร เมื่อถอนสิทธิ์/ถอนเผยแพร่ต้องไม่ให้ cache หรือ CDN คืนเนื้อเดิม ต้องพิสูจน์พฤติกรรม URL หมดอายุ/เพิกถอนใน Q019

เอกสาร/ไฟล์ไม่มีสำเนาทะเบียนแยกตามระบบ Admin เทคนิคไม่ได้สิทธิ์ดู H/อนุมัติผลสอบ/งบอัตโนมัติ การช่วยงานฉุกเฉินถ้าจำเป็นต้องเป็นกระบวนการที่รับรองพร้อมเวลาและ audit ไม่ถือเป็น grant ถาวรจากบทนี้

## 4 Public DTO ที่เสนอ

ชื่อช่องต่อไปนี้เป็น contract ที่เสนอ ไม่ใช่ API ที่ติดตั้งแล้ว `public_ref` เป็นรหัส publication สำหรับเผยแพร่ ไม่ใช่ raw Person/Application/Document ID ห้ามใช้รหัสยากเดาเป็นหลักฐานสิทธิ์

| DTO / เส้นทางจาก SITEMAP | รายการฟิลด์ที่ยอมให้ส่งเมื่อผ่าน gate | แหล่งข้อมูลและเงื่อนไข |
| --- | --- | --- |
| site_content_public / หน้าแรก ข่าว คู่มือ FAQ นโยบาย ติดต่อเรา | public_ref, content_key, title_th, body_th, version_no, effective_date_th | site_content/news_post รุ่นที่รับรอง + publication; แหล่งกลางชุดเดียว ข้อความ/ภาพ/ลิงก์ตรวจข้อมูลส่วนตัวก่อนเผยแพร่ |
| organization_public / ทะเบียนหน่วยงาน | public_ref, display_name_th, organization_type_label_th, geography_label_th, office_address_th, office_channels | Organization และ name/location/contact history รุ่นที่รับรอง ช่องทางหน่วยงานต้องมีหลักฐานว่าเป็นช่องทางงาน ไม่คัดลอกเบอร์/ที่อยู่ส่วนตัว |
| person_public / ค้นหาบุคคล | public_ref, display_name_th, public_role_label_th, affiliation_label_th | เฉพาะ field allowlist ของ Q008 ที่ VERIFIED และ source history ตรึงใน publication; ค่าเริ่มต้นข้อมูลจริงปิด ห้ามเลขประชาชน วันเกิด ที่อยู่/เบอร์ส่วนตัวเสมอ |
| curriculum_public / หลักสูตรและคลังเรียน | public_ref, title_th, learning_group_label_th, version_no, approved_lesson_content | curriculum/lesson รุ่นเผยแพร่ตาม policy; ไม่เอาคำตอบหรือเฉลยจาก answer_key/grading มาแสดงก่อนส่งแบบฝึก คะแนนฝึกไม่เป็นผลสอบทางการ |
| exam_result_public / สืบค้นผลสอบรายปี | public_ref, academic_year_th, exam_type_label_th, exam_level_label_th, release_version, display_name_th, affiliation_label_th, outcome_label_th | result_release + result_release_item รุ่นที่รับรอง ชื่อ/ผลทุกช่องมี allowlist ที่ VERIFIED; ข้อมูลจริงปิดระหว่าง Q008 เปิด คะแนนเป็นช่องเพิ่มเติมได้เฉพาะเมื่อมีหลักฐานนโยบายอนุญาต ไม่มีเลขสมัคร/raw IDs/วันเกิด |
| download_public / ดาวน์โหลด | public_ref, title_th, file_type, byte_size, version_no, download_action_url | download_entry + FileVersion ที่อนุมัติตรงรุ่น ตรวจ scan/ACL/สิทธิ์เผยแพร่ใหม่ ไม่ส่ง object_key/original filename ที่มี PII; URL เป็นการเรียกบริการตรวจ gate |
| request_tracking_minimal / ติดตามคำขอ | reference_label, status_label_th, updated_date_th, next_action_label_th | ไม่ใช่การเผยแพร่ทะเบียน ต้องพิสูจน์สิทธิ์ตาม Q019 ก่อนตอบ เผยเฉพาะเรื่องของผู้มีสิทธิ์ รหัสคำขออย่างเดียวไม่พอ ปิดข้อมูลจริงจนรับรองวิธีพิสูจน์ |

ค่าข้อความที่เป็นส่วนตัวในฟิลด์อนุญาตก็ต้องปฏิเสธ ไม่พึ่งชื่อช่องอย่างเดียว whitelist สาธารณะต้องอ้าง source table+field+source version+purpose ไม่ใช่ alias `phone` ที่แอบมาจาก person_private ชื่อ/สังกัดที่แก้หลังอนุมัติไม่เผยแพร่โดยอัตโนมัติ ต้องรับรอง projection รุ่นใหม่ก่อน

ห้ามเผยแพร่ person_private, person_identifier, answer_key, import_row/normalized_payload, response, raw evidence/file payload หรือ log เป็นตารางหรือ record ทั้งชุด Permanent denylist สำหรับ DTO สาธารณะรวม national_id/citizen_id/identifier ciphertext-HMAC, birth_date, private_address, private_phone, credential, token, secret, object_key, raw private IDs, answer_key/solution และ aliases ที่มาจากแหล่งเหล่านี้ URL ชื่อไฟล์ metadata ภาพ/EXIF หรือข้อความในเอกสารต้องตรวจด้วย ไม่ใช้การซ่อนคอลัมน์บน UI เป็นหลักฐานว่าไม่รั่ว

ตัวอย่างสมมติเมื่อ policy รับรองแล้ว: `{public_ref: 'รหัสเผยแพร่สมมติ', academic_year_th: '2568', display_name_th: 'บุคคลสมมติ ก', outcome_label_th: 'ผลสมมติ'}` ไม่มีหลักฐานกฎ/คะแนนทางการ และไม่เป็นรูปแบบ response จริงที่ deploy แล้ว

## 5 JSON ข้อความอิสระและ audit

| เนื้อหา | การจัดการเสนอ |
| --- | --- |
| normalized_payload / proposed_changes / response และต้นฉบับ Excel | H ทั้ง object; schema allowlist ต่อชนิด ทุก leaf ต้องมีชนิด วัตถุประสงค์ ชั้นข้อมูล และข้อจำกัด unknown field/leaf ปฏิเสธ ไม่ยกเป็น I เพราะเก็บใน JSON |
| policy/config/template schema | I เฉพาะโครง/รหัสไม่มีค่า PII/credential; ห้ามใส่ข้อมูลบุคคล/secret เป็นตัวอย่างใน config การเปลี่ยน rules ต้องมี version/effective/evidence/approval |
| body_th/public_summary_th | P หลังตรวจและรับรองในบริบท public; draft อย่างน้อย I/R ตามเจ้าของเรื่อง ถ้าพบ PII ใช้ระดับเข้มกว่าและยังไม่เผยแพร่ |
| ข้อความอิสระ/เหตุผล/ไฟล์หลักฐาน | H ตามฟิลด์ dictionary ไม่มีการเปิดต่อด้วย policy wildcard เจ้าของเรื่องเลือก projection ที่ตรวจเนื้อหาแล้ว |
| audit_logs | เก็บ actor/action/target/เวลา/receipt/result และชื่อฟิลด์ที่เปลี่ยนหรือ digest ที่จำเป็น ไม่เก็บ before/after payload ส่วนตัวทั้งหมด password/token/secret ห้ามอยู่ DB app/repo/log |

การจัดชั้นไม่ทดแทน validation ของค่าจริง ไม่ใช้ผู้ใช้กรอกชื่อชั้นข้อมูลเพื่อลดข้อจำกัด ต้องมี registry/schema version ที่ผู้รับผิดชอบยืนยัน งานเพิ่มแก้ปิดใช้งาน audit ร่วม transaction; ถ้าบันทึก audit ไม่สำเร็จ business mutation ต้อง rollback ส่วน audit เองเป็น append-only ไม่สร้าง recursive audit ไม่ลบข้อมูลจริงในบทนี้

## 6 อายุเก็บ ปิดใช้งาน และสำรอง

| ประเภท | นโยบายตาม dictionary | ข้อที่ต้องยืนยัน |
| --- | --- | --- |
| RET-S master/ทะเบียน | is_active=false; เก็บ FK ไม่ใช้รหัสเดิมกับคนใหม่ | inactive ยังอ่านประวัติที่มีสิทธิ์ได้ ต้องกำหนดการหยุดใช้ข้อมูลแต่ละเรื่อง |
| RET-H ประวัติ | รุ่นแทน + effective interval + recorded/superseded stamps + หลักฐาน | เก็บ snapshot ปีเดิม; การลด/ปกปิด PII ต้องวิธีที่เจ้าของและ C03 รับรอง ไม่อ้างว่าประวัติอนุญาตเก็บตลอดไป |
| RET-E งาน/ผล/ledger | draft ใช้ row_version; หลังมีผล revision/reversal/withdrawal แทนลบ | แก้ผลย้อนหลัง/กลับรายการงบต้องอำนาจและหลักฐานเฉพาะเรื่อง |
| RET-F ไฟล์/staging | quarantine/archived/access closed/hold ไม่ลบจริง | อายุเก็บไฟล์ชั่วคราว แถวผิด และหลักฐานจริงรอ Q016/Q025 ไม่แต่งจำนวนวัน |
| RET-A audit/legal hold | append-only จำกัดสิทธิ์; การยุติ hold ตามการรับรอง | ฐานอำนาจ ระยะเก็บ ผู้ตรวจ และผลต่อสำรองรอหลักฐาน ไม่เขียนข้อกฎหมายจากการเดา |

Backup ต้องครอบคลุมข้อมูลและเนื้อไฟล์จริง พร้อม version/hash/ACL manifest กุญแจเข้ารหัสแยกและกระบวนการกู้คืนที่รับรอง ต้องตรวจ restore ข้อมูล/ไฟล์/สิทธิ์/hold/withdrawal/outbox ไม่ให้ส่งงานซ้ำ เป้าหมาย RPO/RTO จากบท02ยัง Proposal ไม่มีการสร้างสำรองหรือทดสอบกู้คืนในบท04 ทุก schema/policy เปลี่ยนด้วย migration เท่านั้น

## 7 บัญชีชั้นข้อมูลครบทุกฟิลด์

บัญชีนี้มี **128 ตาราง / 1551 ฟิลด์**: P=10, I=684, R=833, H=24 รวม metadata ทุกฟิลด์ แต่ละชื่ออยู่ช่องเดียวตาม [data_model.json](data_model.json) ไม่สรุปรวมว่าโมดูลทั้งชุดเป็น public/private แทนตรวจทีละช่อง

| ตาราง | P เมื่อรับรอง | I | R | H |
| --- | --- | --- | --- | --- |
| user_account | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, auth_user_id, person_id, account_status, bound_at | — |
| role | — | created_at, updated_at, row_version, is_active, role_code, label_th | id, created_by, updated_by | — |
| permission | — | created_at, updated_at, row_version, is_active, action_code, label_th | id, created_by, updated_by | — |
| role_permission | — | created_at, updated_at, row_version, is_active, module_code, resource_kind | id, created_by, updated_by, role_id, permission_id | — |
| scope | — | created_at, updated_at, row_version, is_active, include_descendants | id, created_by, updated_by, scope_code, root_organization_id, relation_type_id, exam_session_id, center_session_id, warehouse_id, funding_source_id, fiscal_year_id | — |
| role_assignment | — | created_at, updated_at, row_version, is_active, valid_from, valid_to, revoked_at | id, created_by, updated_by, user_account_id, role_id, scope_id, policy_version_id, evidence_document_id, granted_by | — |
| policy_version | — | created_at, updated_at, row_version, is_active, policy_namespace, version_no, verification_status, configuration, effective_from, effective_to, verified_at | id, created_by, updated_by, evidence_document_id, verified_by | — |
| document | — | created_at, updated_at, row_version, is_active, document_kind, visibility_class, lifecycle_status | id, created_by, updated_by, owner_organization_id, retention_policy_id | title |
| file_version | — | created_at, updated_at, row_version, is_active, version_no, media_type, size_bytes, scan_status, scanned_at, sealed_at | id, created_by, updated_by, document_id, bucket_id, sha256, scan_policy_version_id | object_key, original_filename |
| document_acl | — | created_at, updated_at, row_version, is_active, valid_from, valid_to | id, created_by, updated_by, document_id, file_version_id, user_account_id, scope_id, permission_id, evidence_document_id | — |
| operation_receipt | — | recorded_at, module_code, operation_code, operation_status, completed_at | id, recorded_by, initiating_account_id, idempotency_key, payload_digest, correlation_id, result_summary | — |
| audit_logs | — | recorded_at, service_actor_code, action_code, target_kind | id, recorded_by, actor_account_id, initiating_account_id, target_id, changed_fields, safe_change_summary, correlation_id, policy_version_id | — |
| outbox | — | created_at, updated_at, row_version, is_active, event_code, job_status, attempt_count, next_attempt_at | id, created_by, updated_by, operation_receipt_id, initiating_account_id, payload_refs, correlation_id | — |
| notification | — | created_at, updated_at, row_version, is_active, event_code, target_kind | id, created_by, updated_by, recipient_account_id, outbox_id, target_id, seen_at | — |
| publication_policy | — | created_at, updated_at, row_version, is_active, dto_kind, allowed_fields, public_search_fields, valid_from, valid_to | id, created_by, updated_by, policy_version_id | — |
| publication | public_summary_th, public_ref | recorded_at, target_kind, published_at, withdrawn_at, source_effective_on, source_recorded_at | id, recorded_by, person_id, organization_id, curriculum_id, result_release_id, record_version_id, site_content_id, news_post_id, download_entry_id, publication_policy_id, approval_decision_id, published_by, source_person_name_history_id, source_organization_name_history_id | — |
| site_content | title_th, body_th | created_at, updated_at, row_version, is_active, content_key, version_no, content_status | id, created_by, updated_by, organization_id, evidence_document_id | — |
| news_post | — | created_at, updated_at, row_version, is_active, category_code, announced_at | id, created_by, updated_by, site_content_id | — |
| download_entry | label_th | created_at, updated_at, row_version, is_active, entry_key, audience_kind | id, created_by, updated_by, file_version_id, form_template_id | — |
| person | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, person_code, identity_review_status, current_state_code, merged_into_person_id | — |
| person_private | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, person_id | birth_date, private_address_text, private_phone, private_notes |
| person_identifier | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, person_id, evidence_document_id, verified_at | identifier_kind, issuer_namespace, encrypted_value, lookup_hmac |
| person_name_history | — | effective_from, effective_to, recorded_at, superseded_at, name_kind | id, recorded_by, evidence_document_id, replaces_id, person_id, prefix_text, given_name, family_name | — |
| education_branch | — | created_at, updated_at, row_version, is_active, branch_code, label_th | id, created_by, updated_by | — |
| position_type | — | created_at, updated_at, row_version, is_active, position_code, label_th | id, created_by, updated_by, education_branch_id, policy_version_id | — |
| position_assignment | — | effective_from, effective_to, recorded_at, superseded_at, assignment_kind | id, recorded_by, evidence_document_id, replaces_id, person_id, organization_id, position_type_id, source_request_id | — |
| affiliation_history | — | effective_from, effective_to, recorded_at, superseded_at | id, recorded_by, evidence_document_id, replaces_id, person_id, organization_id, relation_type_id, source_request_id | — |
| person_status_event | — | effective_from, effective_to, recorded_at, superseded_at, status_dimension | id, recorded_by, evidence_document_id, replaces_id, person_id, event_code, source_request_version_id, policy_version_id | — |
| person_change_request | — | created_at, updated_at, row_version, is_active, change_kind | id, created_by, updated_by, change_request_id, person_id | — |
| geography | label_th | created_at, updated_at, row_version, is_active, geography_code, geography_kind | id, created_by, updated_by, parent_geography_id | — |
| organization_type | — | created_at, updated_at, row_version, is_active, type_code, label_th | id, created_by, updated_by | — |
| organization_relation_type | — | created_at, updated_at, row_version, is_active, relation_code, label_th, is_hierarchy | id, created_by, updated_by, policy_version_id | — |
| organization | — | created_at, updated_at, row_version, is_active, current_status_code | id, created_by, updated_by, organization_code, organization_type_id, merged_into_organization_id | — |
| organization_name_history | — | effective_from, effective_to, recorded_at, superseded_at | id, recorded_by, evidence_document_id, replaces_id, organization_id, display_name | — |
| organization_relation | — | effective_from, effective_to, recorded_at, superseded_at | id, recorded_by, evidence_document_id, replaces_id, parent_organization_id, child_organization_id, relation_type_id, source_request_id | — |
| address_version | — | effective_from, effective_to, recorded_at, superseded_at, address_kind | id, recorded_by, evidence_document_id, replaces_id, organization_id, address_text, geography_id, postal_code | — |
| organization_location | — | effective_from, effective_to, recorded_at, superseded_at, location_code | id, recorded_by, evidence_document_id, replaces_id, organization_id, geography_id, latitude, longitude | — |
| organization_contact | — | effective_from, effective_to, recorded_at, superseded_at, channel_kind, is_public_eligible, contact_code | id, recorded_by, evidence_document_id, replaces_id, organization_id, contact_value | — |
| academic_year | — | created_at, updated_at, row_version, is_active, year_code, display_year_be, starts_on, ends_on | id, created_by, updated_by, policy_version_id | — |
| exam_type | — | created_at, updated_at, row_version, is_active, type_code, label_th | id, created_by, updated_by | — |
| exam_level | — | created_at, updated_at, row_version, is_active, level_code, label_th | id, created_by, updated_by, exam_type_id | — |
| exam_session | — | created_at, updated_at, row_version, is_active, session_code, registration_opens_at, registration_closes_at | id, created_by, updated_by, academic_year_id, exam_type_id, policy_version_id | — |
| session_level | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, exam_session_id, exam_level_id, exam_type_id | — |
| exam_center | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, organization_id, center_code | — |
| center_session | — | created_at, updated_at, row_version, is_active, session_status | id, created_by, updated_by, exam_center_id, exam_session_id, status_event_id | — |
| center_session_level | — | created_at, updated_at, row_version, is_active, capacity | id, created_by, updated_by, center_session_id, session_level_id, exam_session_id | — |
| exam_center_appointment | — | effective_from, effective_to, recorded_at, superseded_at, duty_code | id, recorded_by, evidence_document_id, replaces_id, center_session_id, person_id, person_name_history_id, affiliation_history_id, address_version_id, display_name_snapshot, organization_name_snapshot, delivery_address_snapshot, organization_name_history_id | — |
| learning_group | — | created_at, updated_at, row_version, is_active, group_code, label_th | id, created_by, updated_by | — |
| curriculum | title_th | created_at, updated_at, row_version, is_active, curriculum_code, version_no, content_status | id, created_by, updated_by, learning_group_id, source_document_id, policy_version_id | — |
| course | title_th | created_at, updated_at, row_version, is_active, course_code | id, created_by, updated_by, curriculum_id | — |
| lesson_version | title_th, body_th | created_at, updated_at, row_version, is_active, lesson_code, version_no, content_status | id, created_by, updated_by, course_id, source_document_id | — |
| question_version | — | created_at, updated_at, row_version, is_active, question_code, version_no, question_kind, content_status | id, created_by, updated_by, course_id, stem, options, source_document_id | — |
| answer_key | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, question_version_id, max_score | correct_answer, rubric |
| assessment_blueprint | — | created_at, updated_at, row_version, is_active, assessment_code, version_no, phase_code | id, created_by, updated_by, curriculum_id, policy_version_id | — |
| assessment_item | — | created_at, updated_at, row_version, is_active, item_no | id, created_by, updated_by, assessment_blueprint_id, question_version_id | — |
| learning_enrollment | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, person_id, curriculum_id, academic_year_id, organization_id | — |
| attempt | — | created_at, updated_at, row_version, is_active, attempt_no | id, created_by, updated_by, learning_enrollment_id, assessment_blueprint_id, started_at, submitted_at, attempt_status, policy_version_id, curriculum_id | — |
| attempt_item | — | created_at, updated_at, row_version, is_active, item_no | id, created_by, updated_by, attempt_id, question_version_id, stem_snapshot, options_snapshot | — |
| response | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, attempt_item_id, saved_at, is_final | answer_payload |
| learning_progress | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, learning_enrollment_id, lesson_version_id, progress_status, last_confirmed_at, last_attempt_id | — |
| manual_grading | — | recorded_at, grade_version_no | id, recorded_by, response_id, grader_account_id, answer_key_id, score | feedback |
| change_request | — | created_at, updated_at, row_version, is_active, subject_kind | id, created_by, updated_by, request_code, target_person_id, target_organization_id, target_center_session_id, requester_account_id, policy_version_id, request_status | — |
| request_version | — | created_at, updated_at, row_version, is_active, version_no, effective_on | id, created_by, updated_by, change_request_id, evidence_document_id, submitted_at | proposed_changes |
| workflow_case | — | created_at, updated_at, row_version, is_active, target_kind, case_status, round_no | id, created_by, updated_by, request_version_id, application_id, result_draft_id, budget_event_id, procurement_request_id, stocktake_id, disposal_id, record_version_id, lesson_version_id, question_version_id, site_content_id, creator_account_id, policy_version_id, period_close_id, curriculum_id | — |
| decision | — | recorded_at, decision_code, decided_at | id, recorded_by, workflow_case_id, actor_account_id, evidence_document_id | reason |
| impact_assessment | — | created_at, updated_at, row_version, is_active, impact_kind | id, created_by, updated_by, request_version_id, affected_record_refs, evidence_document_id | resolution_summary |
| status_event | — | effective_from, effective_to, recorded_at, superseded_at, event_code, status_dimension | id, recorded_by, evidence_document_id, replaces_id, organization_id, center_session_id, source_request_version_id, policy_version_id | — |
| activation_record | — | recorded_at, activated_at | id, recorded_by, request_version_id, decision_id, status_event_id, person_status_event_id, operation_receipt_id | — |
| candidate | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, person_id, candidate_code | — |
| enrollment | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, person_id, organization_id, academic_year_id, education_branch_id, enrollment_no, enrollment_status | — |
| eligibility_rule_version | — | created_at, updated_at, row_version, is_active, verification_status | id, created_by, updated_by, policy_version_id, session_level_id | — |
| application | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, person_id, candidate_id, enrollment_id, session_level_id, center_session_level_id, eligibility_rule_version_id, application_status, submitted_at, operation_receipt_id | — |
| application_snapshot | — | recorded_at, version_no, captured_at, source_effective_on | id, recorded_by, application_id, person_name_history_id, organization_name_history_id, affiliation_history_id, address_version_id, display_name_snapshot, organization_name_snapshot, delivery_address_snapshot | — |
| seat_allocation | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, application_id, center_session_level_id, seat_number, operation_receipt_id | — |
| exam_subject | — | created_at, updated_at, row_version, is_active, subject_code, label_th | id, created_by, updated_by | — |
| session_subject | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, session_level_id, exam_subject_id | — |
| grading_rule_version | — | created_at, updated_at, row_version, is_active, verification_status | id, created_by, updated_by, policy_version_id, session_subject_id, max_score | — |
| subject_score | — | recorded_at, score_version_no | id, recorded_by, application_id, session_subject_id, grading_rule_version_id, score_value, source_file_version_id, supersedes_score_id, session_level_id | — |
| result_draft | — | created_at, updated_at, row_version, is_active, draft_version_no | id, created_by, updated_by, center_session_level_id, draft_status, policy_version_id | — |
| result_draft_item | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, result_draft_id, application_snapshot_id, outcome_code, application_id | — |
| result_score_link | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, result_draft_item_id, subject_score_id, application_id, session_subject_id | — |
| result_release | — | recorded_at, sealed_at | id, recorded_by, result_draft_id, release_no, approval_decision_id, supersedes_release_id | — |
| result_release_item | — | recorded_at | id, recorded_by, result_release_id, result_draft_item_id, display_name_snapshot, organization_name_snapshot, outcome_snapshot, result_draft_id | — |
| fiscal_year | — | created_at, updated_at, row_version, is_active, year_code, display_year_be, starts_on, ends_on | id, created_by, updated_by, policy_version_id | — |
| funding_source | — | created_at, updated_at, row_version, is_active, source_code, label_th, currency_code | id, created_by, updated_by, organization_id | — |
| project | — | created_at, updated_at, row_version, is_active, project_code, starts_on, ends_on | id, created_by, updated_by, organization_id, title_th | — |
| project_exam_session | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, project_id, exam_session_id | — |
| budget_line | — | created_at, updated_at, row_version, is_active, line_code, category_code, currency_code | id, created_by, updated_by, organization_id, fiscal_year_id, funding_source_id, project_id | — |
| budget_event | — | created_at, updated_at, row_version, is_active, event_code, business_on, posting_status, posted_at | id, created_by, updated_by, organization_id, fiscal_year_id, operation_receipt_id, policy_version_id, evidence_document_id, reverses_event_id | — |
| allocation | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, budget_event_id, budget_line_id, authorized_amount | — |
| reservation | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, budget_event_id, budget_line_id, requested_amount, procurement_request_id | — |
| obligation | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, budget_event_id, budget_line_id, reservation_id, purchase_order_id, committed_amount | — |
| disbursement | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, budget_event_id, obligation_id, goods_receipt_id, paid_amount | payment_reference |
| budget_posting | — | recorded_at, entry_no, bucket_code | id, recorded_by, budget_event_id, budget_line_id, amount_delta, reservation_id, obligation_id, disbursement_id | — |
| period_close | — | created_at, updated_at, row_version, is_active, period_key, starts_on, ends_on, closed_at | id, created_by, updated_by, organization_id, fiscal_year_id, decision_id | — |
| unit_of_measure | — | created_at, updated_at, row_version, is_active, unit_code, label_th, quantity_scale | id, created_by, updated_by | — |
| item | — | created_at, updated_at, row_version, is_active, item_code, label_th, item_kind | id, created_by, updated_by, unit_of_measure_id | — |
| warehouse | — | created_at, updated_at, row_version, is_active, warehouse_code, label_th | id, created_by, updated_by, organization_id | — |
| procurement_request | — | created_at, updated_at, row_version, is_active, request_status | id, created_by, updated_by, organization_id, budget_line_id, request_code, estimated_amount, evidence_document_id | — |
| procurement_request_line | — | created_at, updated_at, row_version, is_active, line_no, requested_quantity | id, created_by, updated_by, procurement_request_id, item_id, estimated_unit_price | — |
| purchase_order | — | created_at, updated_at, row_version, is_active, order_status | id, created_by, updated_by, procurement_request_id, order_code, obligation_id, evidence_document_id | — |
| purchase_order_line | — | created_at, updated_at, row_version, is_active, line_no, ordered_quantity | id, created_by, updated_by, purchase_order_id, procurement_request_line_id, unit_price, procurement_request_id | — |
| goods_receipt | — | created_at, updated_at, row_version, is_active, received_on | id, created_by, updated_by, purchase_order_id, warehouse_id, receipt_code, evidence_document_id, operation_receipt_id | — |
| goods_receipt_line | — | created_at, updated_at, row_version, is_active, line_no, received_quantity | id, created_by, updated_by, goods_receipt_id, purchase_order_line_id, purchase_order_id | — |
| stock_movement | — | created_at, updated_at, row_version, is_active, movement_code, business_on, posted_at | id, created_by, updated_by, operation_receipt_id, goods_receipt_id, stocktake_id, reverses_movement_id, evidence_document_id | — |
| stock_movement_line | — | recorded_at, line_no, quantity_delta | id, recorded_by, stock_movement_id, warehouse_id, item_id, goods_receipt_line_id | — |
| asset | — | created_at, updated_at, row_version, is_active, asset_ordinal, asset_status | id, created_by, updated_by, item_id, organization_id, goods_receipt_line_id, asset_code, serial_number, acquisition_cost | — |
| asset_assignment | — | effective_from, effective_to, recorded_at, superseded_at | id, recorded_by, evidence_document_id, replaces_id, asset_id, person_id, organization_id | — |
| loan | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, asset_id, borrower_person_id, loaned_at, due_at, returned_at, evidence_document_id | — |
| maintenance | — | created_at, updated_at, row_version, is_active, started_on, ended_on | id, created_by, updated_by, asset_id, cost_amount, budget_event_id, evidence_document_id | description |
| stocktake | — | created_at, updated_at, row_version, is_active, counted_on, stocktake_status | id, created_by, updated_by, warehouse_id, stocktake_code, evidence_document_id | — |
| stocktake_line | — | created_at, updated_at, row_version, is_active, expected_quantity_snapshot, counted_quantity | id, created_by, updated_by, stocktake_id, item_id | — |
| disposal | — | created_at, updated_at, row_version, is_active, proposed_on, effective_on, disposal_status | id, created_by, updated_by, asset_id, evidence_document_id, policy_version_id | — |
| register_counter | — | created_at, updated_at, row_version, is_active, register_kind, period_key, next_number | id, created_by, updated_by, organization_id, policy_version_id | — |
| correspondence | — | created_at, updated_at, row_version, is_active, secrecy_code, urgency_code | id, created_by, updated_by, organization_id, register_counter_id, register_number | title_th |
| record_version | — | created_at, updated_at, row_version, is_active, version_no, record_status, secrecy_code_snapshot | id, created_by, updated_by, correspondence_id, file_version_id, content_hash, supersedes_version_id | title_th_snapshot |
| routing | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, record_version_id, sender_account_id, outbox_id, sent_at | — |
| recipient_snapshot | — | recorded_at, target_kind | id, recorded_by, record_version_id, person_id, organization_id, person_name_snapshot, organization_name_snapshot | — |
| receipt | — | recorded_at | id, recorded_by, recipient_snapshot_id, acknowledged_by, acknowledged_at, operation_receipt_id | — |
| assignment | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, record_version_id, assigned_to, assigned_by, due_at, assignment_status, evidence_document_id | — |
| approval_evidence | — | created_at, updated_at, row_version, is_active, signing_status | id, created_by, updated_by, decision_id, record_version_id, file_version_id, approved_hash | — |
| retention_hold | — | created_at, updated_at, row_version, is_active, held_from, released_at | id, created_by, updated_by, document_id, evidence_document_id | hold_reason |
| form_template_registry | — | created_at, updated_at, row_version, is_active, template_code, version_no, official_form_reference, verification_status, machine_schema | id, created_by, updated_by, evidence_document_id, file_version_id | — |
| import_batch | — | created_at, updated_at, row_version, is_active, batch_status, dry_run_version_no, total_rows | id, created_by, updated_by, organization_id, exam_session_id, template_id, source_file_version_id, initiating_account_id, policy_version_id, operation_receipt_id | — |
| import_row | — | created_at, updated_at, row_version, is_active, row_number, dry_run_version_no, row_status | id, created_by, updated_by, import_batch_id, matched_person_id | normalized_payload |
| validation_issue | — | created_at, updated_at, row_version, is_active, field_code, issue_code, severity | id, created_by, updated_by, import_row_id, message_th | — |
| commit_receipt | — | recorded_at | id, recorded_by, import_batch_id, import_row_id, application_id, operation_receipt_id | — |
| amendment_link | — | created_at, updated_at, row_version, is_active | id, created_by, updated_by, import_batch_id, application_id, request_version_id, previous_commit_receipt_id | — |

## 8 เกณฑ์ตรวจเอกสารและสิ่งที่ยังไม่รัน

- ทุกฟิลด์ใน JSON ต้องพบใน dictionary และแถวชั้นข้อมูลหนึ่งครั้ง ชื่อ/ชนิด/FK/class ไม่ขัดกัน ทุกตารางมี RLS/scope/owner/retention เสนอ
- ข้อมูลสมมติทดสอบ projection: policy TO VERIFY ไม่ออกข้อมูลจริง allowlist ที่ขอข้อมูล H/raw private ID/alias จากแหล่งห้ามต้องปฏิเสธ ผลปีเก่าดึง snapshot รุ่นที่รับรอง
- การตรวจเอกสารและ fixture ไม่ใช่ API/RLS/Auth/Storage/scan/restore/cache จริง ทั้งหมดนั้นยัง NOT RUN เช่นเดียวกับ TC90 ของบท02 ดูหลักฐานจริงใน [PROGRESS](PROGRESS.md)

## ส่วนเพิ่มบท06 — physical core schema0.6.0

แบบ128ตารางเดิมยังเป็นlogicaldesign ไม่ถูกอ้างว่าทำครบ ปัจจุบันมี19ตาราง/213scalar fieldsจริงตามprisma/schema.prisma ไม่รวมrelation navigation ทุกตารางprivate ENABLE/FORCE RLS ไม่มีpublic DTO/view/API; ทุกฟิลด์ยังห้ามเผยแพร่ ใช้ระดับด้านล่างเป็นminimumสำหรับcoreทดลอง หากนโยบายจริงกำหนดเข้มกว่าให้ปรับผ่านรุ่นเอกสาร/implementationและQ025

| ตาราง/กลุ่ม | ระดับของทุกscalar field | เหตุผล/วิธีใช้ |
| --- | --- | --- |
| service_actor | R ทุกฟิลด์ | provenancebootstrap ไม่มีlogin/grants ไม่เปิดactor/codeต่อสาธารณะ |
| reference_code, organization_type, exam_type, exam_level | I ยกเว้นid/FK/actorIdเป็นR | mastersสมมติ TO_VERIFY ไม่ใช่รหัสทางการ; labelsยังไม่เผยแพร่ |
| geography | I สำหรับcode/label/time/flag/version; id/FK/actorIdเป็นR | ไม่เป็นscopeอัตโนมัติ รหัสสมมติ |
| organization | R สำหรับid/FK/actorId/code/status/merge; timestamp/flag/versionเป็นI | organizationกลาง currentstatusเป็นbootstrapplaceholder |
| person | R สำหรับid/FK/actorId/code/status/merge; timestamp/flag/versionเป็นI | ไม่ระบุpublicnameจากทะเบียนนี้ |
| person_private | H ทุกฟิลด์ | วันเกิด ที่อยู่ เบอร์และnotes รวมPK/FK/timeของรายการส่วนตัวไม่เป็นDTO |
| person_name_history, person_contact | H ทุกฟิลด์ | personlink, name/contact, หลักฐานและประวัติของบุคคล ไม่ส่งออกAPI/cache/print/exportโดยไม่มีpolicy |
| organization_name_history, address_version, organization_contact | R ทุกฟิลด์ | ชื่อ/ที่ตั้ง/ช่องทางและประวัติต้องรับรองpublicallowlistก่อน ไม่เปิดจากis_public_eligibleอย่างเดียว |
| document | H ทุกฟิลด์ | หลักฐานmetadataไม่มีไฟล์จริง การเลือกI/R/Hในvisibility_classไม่ให้สิทธิ์เอง |
| policy_version | R ทุกฟิลด์; JSONleafขั้นต่ำR | configurationทดลองเท่านั้น ไม่มีsecret/ข้อมูลจริงในJSON Unknownkeysต้องvalidatedในbusinessserviceบทที่จะรับinput |
| academic_year, fiscal_year | I สำหรับyear_code/label_year_ce/dates/time/flag/version; id/FK/actorIdเป็นR | labelCEเก็บมาตรฐาน แปลงBEตอนแสดง; ช่วงปีทดลองไม่ใช่ปฏิทินทางการ |
| audit_logs | R ทุกฟิลด์ | target/actor/correlation/ชื่อฟิลด์ ไม่มีrawPII values หรือpassword/token/secret |

ครอบคลุมทั้ง213scalar fields: defaultของตารางตามแถวนี้รวมcreated_at/updated_at/effective_from/effective_to/recorded_at/superseded_at/replaces_id/row_version/is_activeและFKทุกตัว ไม่ตกเป็นPublicเพียงเพราะชื่อคอลัมน์ คลาสIไม่ได้แปลว่าข้อมูลเผยแพร่ได้

Retention: current rowsปิดด้วยis_active, historysupersede+replacement, auditappend-only ทุกตารางห้ามphysicalDELETEในDML Migration/seedสิทธิ์สูงเฉพาะlocal ข้อมูลสมมติไม่มีเลขบัตร/วันเกิด/เบอร์/ที่อยู่จริง; นโยบายอายุเก็บ/retentionจริงยังQ016/Q025 การทำลายข้อมูลจริงต้องผ่านนโยบายที่รับรองและmigration/ขั้นตอนรักษาหลักฐาน
