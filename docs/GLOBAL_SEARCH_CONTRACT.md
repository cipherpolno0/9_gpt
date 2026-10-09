# ค้นหากลางตามสิทธิ์ — บท 66

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **Proposal / BLOCKED — ไม่มี global search endpoint/index จริง**

ใช้ [PERMISSIONS](PERMISSIONS.md), [RECORD_ACCESS_CONTROL](RECORD_ACCESS_CONTROL.md), [METRIC_DICTIONARY](METRIC_DICTIONARY.md) และ [REPORT_CENTER_CONTRACT](REPORT_CENTER_CONTRACT.md) Search เป็น read adapter ของข้อมูลกลาง ไม่เป็นทะเบียนคน/หน่วย/ใบสมัครอีกชุด ไม่สร้าง indexจาก Document metadata แล้วอ้าง full text/FileVersionACLจริง

## 1 ลำดับตรวจที่ server

1. ตรวจ account/session/action/assignment/scope/time ปัจจุบัน การซ่อนช่องค้นหาไม่พอ technicaladminไม่อ่านทุกเรื่อง
2. แปลง term เป็น Unicode NFC รักษาวรรณยุกต์ ไม่ fuzzy merge Person และตรวจขอบเขต/filter/limit จาก allowlist ไม่ logคำค้นที่อาจเป็นชื่อ/เลขส่วนตัว
3. กำหนด resource set และ searchable fields ที่ผู้ใช้มีสิทธิ์ **ก่อน match/rank/count/facet/snippet/autocomplete** ฟิลด์ที่อ่านไม่ได้ห้ามใช้ matchให้เกิดผล/count แม้ไม่ส่งฟิลด์กลับ
4. อ่านผ่าน owner query/RLS และ record/FileVersion/recipient/confidentiality ACL ณ เวลาค้น Indexเป็น candidate reference เท่านั้น currentDALต้องตรวจอีกครั้งก่อนตอบ หาก indexไม่แยกสิทธิ์และ field policyพอให้ปิด resourceนั้น ไม่ดึงทั้งฐานมาซ่อนใน client
5. สร้าง DTOขั้นต่ำและ cursorที่ผูก context/filter/policy/source ไม่คืน hidden IDs/tokenจากพื้นที่อื่น เปิดรายละเอียด/downloadตรวจใหม่อีกครั้ง

## 2 Resource และ field allowlistเสนอ

| resource                      | owner / searchable fieldsเมื่อมี grant                                 | ผลขั้นต่ำที่อนุญาต / สิ่งที่ห้าม                                                                             |
| ----------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Person                        | O01 / ชื่อที่ policyอนุญาต รหัสอ้างอิงองค์กร ตำแหน่งใน scope           | opaque ref + labelที่มีสิทธิ์; ไม่identity/วันเกิด/เบอร์ส่วนตัวหรือ assignmentนอกscope                       |
| Organization / ExamCenter     | O02 / รหัส ชื่อ snapshot/ชื่อรุ่นที่เลือก สถานะประเภท/รอบ              | refs/title/typeตามscope; private exam contactsไม่snippet                                                     |
| Request                       | O04 / tracking ref ชนิด สถานะและเหตุผลเฉพาะfieldgrant                  | refs/statusตามcurrentACL; รู้trackingไม่อ่านevidenceหรือผู้เสนอ                                              |
| Application / released result | O05 / ref/name snapshotตามgrantและpurpose ปี/session/type              | approvedfieldDTO; learnerselfเท่านั้น publicผลใช้39releasepolicy endpointต่างจากworkspace ไม่draft/withdrawn |
| Learning activity             | O03 / ชื่อหลักสูตร/บทเรียนที่เผยแพร่และมีสิทธิ์                        | resource label; ไม่answer key/pre-submit feedback/ชื่อผู้เรียนอื่น/privateprogress                           |
| Budget / Inventory            | O06/O07 / ref/project/item/assetที่อ่านได้                             | refsกับlabelsตามgrant; ไม่จำนวนเงิน/ราคา/custodyจากชื่อฝ่ายหรือQRอย่างเดียว                                  |
| Correspondence                | O08 / tracking/register ref/title/bodyเฉพาะเมื่อแต่ละfieldpolicyอนุญาต | refsกับapprovedtitle; ไม่มีbody snippet/thumbnailค่าเริ่มต้น ถ้าtitleลับก็ไม่คืนtitle/countจากmatchbody      |
| ImportBatch                   | O09 / ref/status/authorizedunit                                        | refs/status; ไม่rawrow/errorPII/filenameคนอื่น ownerApplicationยัง05                                         |

ค่าเริ่มต้น body full text/thumbnail/private document preview **disabled** จน ACLและfieldpolicy/scan/provider ผ่าน ไม่สร้างsnippetจาก rawไฟล์แล้วค่อย mask เป็น HTML ไม่ส่งprivatecanaryใน accessible labels, tooltip, matched_fields, highlights, error, cache, analytics หรือ export

## 3 Metadata การค้นก็เป็นข้อมูล

Facet counts/total/has_more/score/suggestions/recent queries และ pagination ต้องคำนวณจาก authorized matched populationเดียวกัน ไม่เผย total_all/hidden_count/“มีผลอีก5รายการแต่ไม่มีสิทธิ์” ไม่มี exact globalcountfallbackจากsearchengine index Statsของหนังสือลับกับผู้เรียนรวมกลุ่มต้องผ่านprivacy policy หากpolicyยังไม่ยืนยันให้ไม่ส่ง aggregate ไม่คืน0แทน suppressed

ต้นทางที่ไม่พร้อมแสดง safe partial/unavailable เฉพาะ resourceที่มีสิทธิ์รู้ว่ามี ไม่รายงานรายการdenied resourceจากอีกพื้นที่ เพื่อพิสูจน์ A/Bต้องเปรียบเทียบ responseของAก่อน/หลังเพิ่มB โดย term/filter/sourceที่Aอ่านไม่เปลี่ยน: rows/count/facet/snippet/cursor-visiblemetadataของAต้องเหมือนเดิม ไม่อ้างป้องกัน timing side channel สมบูรณ์ก่อนทดสอบ performanceจริง

เสนอ querymin/limit/rate/bound budgetให้ configurationหลังทดสอบ ไม่มี hardcodedความจุที่อ้างว่า measured Pagination stable sort+opaque cursor boundprincipal/filter/context/policy รายสิทธิ์เปลี่ยนระหว่างหน้าให้ invalidatecursor/requery currentvalidation ไม่ exportผล oldpolicyหรือใช้cursorBในA รหัสผิด/ไม่มีสิทธิ์ตอบ safeerrorไม่แยก existence

## 4 ประวัติและขอบเขต

Public searchยังใช้ public projections ของ15/39/56 ไม่นำworkspaceDTOมาลดฟิลด์ที่client อดีตใช้ชื่อsnapshotหรือcentralversion ณ วันกับ currentACL การเปลี่ยนชื่อใหม่ไม่rewriteApplicationปีเก่า ไม่index privatehistoricalrawnamesโดยไม่มีsearchfieldgrant

Audit/log ใช้requestref/resourcekind/action/time/safeerrorตามpolicy ไม่rawterm/fullnames/fullbody/fileURL Jobpayloadส่ง manifest/jobrefขั้นต่ำ workerrecheckสิทธิ์ ไม่clientauthoritativeallowed=true Search/export cacheใช้no-storeตามreportcontract และ currentchecksไม่รอoutbox invalidation65

ดู [REPORTING_CASES](../tests/reporting/REPORTING_CASES.md) P66-06–12/18–20 ทั้งหมดNOT_RUN ไม่มี browser/API/index/canaryproofจริง ไม่อ้าง403bootstrapว่าแต่ละพื้นที่เห็นข้อมูลของตนและไม่เห็นอีกพื้นที่แล้ว
