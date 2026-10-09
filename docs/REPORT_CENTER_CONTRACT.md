# Dashboard และศูนย์รายงาน — บท 66

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **Proposal / BLOCKED — ไม่มีหน้า dashboard/report center ที่ทำงานจริง**

บท65และบริการต้นทางยัง BLOCKED `/app` ทุก method ยัง403/no-store Workerเป็น connection checker ไม่มี report builder อ่าน [METRIC_DICTIONARY](METRIC_DICTIONARY.md), [GLOBAL_SEARCH_CONTRACT](GLOBAL_SEARCH_CONTRACT.md), [INTEGRATION_HANDLERS](INTEGRATION_HANDLERS.md), [BUDGET_RECONCILIATION](BUDGET_RECONCILIATION.md) ก่อน implementation ไม่ตั้งฐานรายงานเป็นทะเบียนใหม่

## 1 หน้าตามหน้าที่และ UX

Route เสนอ `/app` สำหรับภาพรวม, `/app/reports` สำหรับรายงานกลาง และ `/app/search` สำหรับค้น ทุกรายการเป็น private workspace ผ่านบัญชีเดียว Role เป็นตัวช่วยจัดลำดับหน้าจอ การอนุญาตใช้ action + assignment + scope + time + field policy ของต้นทางจริง ไม่มี technical admin wildcard

| หน้าที่เสนอ                  | การ์ดและทางลัดเมื่อมี grant                             | ขอบเขตบังคับ                                                        |
| ---------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| เจ้าของข้อมูล / ผู้เรียน     | งานของฉัน M01, การเรียน M14–15, สมัครและผลของฉัน M08–13 | verified self binding เท่านั้น ไม่ค้นชื่อเพื่อน                     |
| เจ้าหน้าที่พื้นที่ / ทะเบียน | บุคลากร M03–04, หน่วย M05–07, คำขอ M02                  | สายการปกครอง/การศึกษาและช่วงมอบหมาย ไม่ถือจังหวัดเดียวกันเป็นทุกสาย |
| สำนัก/สถานศึกษา / สนาม       | ผู้เรียน/ใบสมัคร/ผล M08–13, สนาม M06–07, batch M21      | หน่วย/session/center assignment ปัจจุบัน importerไม่เพิ่มgrant05    |
| ผู้สอน / ผู้ตรวจ             | การเรียน M14–15 และงานตรวจ M01                          | รายผู้เรียน/กลุ่ม/วิชาที่ได้รับมอบหมาย รวมกลุ่มตาม privacy policy   |
| การเงิน                      | M16 แยก FY/source/project/currency กับงานรับรอง M01     | วงเงิน/action/delegation การเห็นยอดไม่ให้approveหรือจ่าย            |
| เจ้าหน้าที่คลัง / ผู้ถือครอง | M17–18 และงานของฉัน                                     | คลัง/หน่วย/custody ที่อนุญาต ผู้ถือครองไม่เห็นทุก asset ในหน่วย     |
| สารบรรณ / ผู้รับหนังสือ      | M19–20 กับงานรับทราบ/มอบหมาย M01                        | เรื่อง+รุ่น+ผู้รับ+ชั้นความลับ ACL intersection                     |
| ผู้ตรวจสอบ / ผู้อนุมัติ      | รายงานเฉพาะภารกิจและงานค้างที่ได้รับมอบหมาย             | read/export/approve ต่าง action maker-checker ยังคงใช้              |
| ผู้ดูแลเทคนิค                | service health ที่ไม่เปิดข้อมูลธุรกิจ                   | ไม่มีจำนวนคน/เรื่อง/เงินทั้งหมดจากชื่อ admin                        |

ใช้หัวเรื่องไทย ฟอนต์ Sarabun และ พ.ศ. แต่ละการ์ดมีชื่อหน่วย ตัวกรอง เวลา ณ วัน/ปรับล่าสุด แหล่งข้อมูล และปุ่มเปิดรายการตาม applied filter การเลือกหลายหน้าที่รวม grant ที่มีจริง แต่ distinct task/person/document ก่อนนับ ไม่ union สิทธิ์จนฟิลด์ลับของอีกหน้าที่เปิด

สถานะหน้าจอ: loading, empty หลัง query สำเร็จ, error/unavailable, no permission, stale, suppressed และ not configured ต้องแยกกัน แสดง “ยังไม่มีบริการรายงาน” เมื่อ dependencyขาด ไม่ทำการ์ดศูนย์ให้ดูเหมือนมีระบบ Keyboard/focus order heading→filters→apply→status→cards/table→export มี label ไม่อาศัยสี aria-live สุภาพ ตารางมี caption/header ไม่ประกาศข้อมูลที่ suppress ผ่าน screen reader

เครื่องช้าใช้แบ่งหน้าและโหลดแผงตามสิทธิ์ ไม่โหลดทั้งฐานเข้า browser การเปลี่ยน filter ยกเลิก response เก่าด้วย request revision เพื่อไม่ให้ข้อมูลเดิมทับจอใหม่ เปลี่ยน scope ต้องล้างค่าการ์ด/ผลค้น/cursorเก่าก่อนแสดง และไม่เก็บผล private ใน localStorage/service worker

## 2 Applied filter และ manifest

Filter input เสนอ: metric_ids, requested_scope, effective_as_of, knowledge_mode, academic_year_id หรือ fiscal_year_id ตาม metric, exam_session_id/type/level/stage, curriculum_id, organization_id, funding_source_id/project_id/currency, warehouse/location/unit และ status_set Serverตรวจชนิด/allowlist/limits/ปีที่เข้ากันและ permissionก่อน resolve ไม่มี raw SQL หรือ client total

Manifest ที่เสนอมี report_id/version, metric_dictionary_version, server-normalized filters/filter_digest, exact committed source memberships/version refs, per-owner source watermarks, generated_at, effective_as_of, knowledge_mode, last_successful_refresh, reconciliation_status, policy version refs และ authorized population/field schema refs แบบ protected ไม่คืน denied IDs หรือ raw scope graph ใน public metadata

Dashboard แต่ละแผงอาจ refreshต่างเวลา ต้องแสดง watermark ของแผง ห้ามอ้าง whole dashboard เป็น snapshot เดียวหากไม่ได้สร้างจริง รายงานเปรียบเทียบหลาย owner ต้องใช้ source cut ที่สอดคล้องพร้อม manifest ไม่ join projectionใหม่กับ ledgerเก่าแล้วแสดงว่า reconcileแล้ว Events65ไม่มี global order; sourceversion gap ไม่พิสูจน์ eventหาย ตรวจ committed receipts/dependencies/canonical owner ตามสัญญา65

Historical sealed manifest เก็บ label/name/affiliation snapshots หรือ central name-version ref ที่อนุมัติ รุ่นเดิมไม่เปลี่ยนจาก rename ปัจจุบัน CurrentACLยังตรวจแม้ดูอดีต Exportไม่ได้เปิดฟิลด์ที่ policy ปัจจุบันห้าม

Catalog7eventsของบท65เป็นจุดเชื่อมที่ผู้ใช้กำหนด ไม่ครอบคลุมทุกการแก้ progress/ผลสอบ/release/หนังสือ/ledger จึงห้ามใช้เวลาได้รับeventล่าสุดเป็นหลักฐานว่ารายงานทุกmetricสดแล้ว ต้องตรวจ source watermark/membership จาก ownerโดยตรง หรือมี change coverage ที่รับรองและทดสอบก่อนแสดง FRESH รอบ66ไม่เพิ่ม event catalogใหม่เพื่ออ้าง coverageครบ

## 3 จอและ export ต้องตรงกัน

จอและ export ใช้ report manifest กับ applied filters รุ่นเดียวกัน Export ทุกหน้าใน manifest ได้เมื่อมี export action ไม่ใช่เฉพาะหน้าที่จอแสดง แต่ row count/metric totals/grain/currency/unit/time ต้องตรง ห้ามเปลี่ยน filter เงียบหรือใช้ query ทั้งฐานใหม่แล้วอ้างรายงานเดิม

Server/worker/download ตรวจสิทธิ์ปัจจุบันและสิทธิ์ตั้งต้นของ manifest ทุกครั้ง ไม่ grant เพราะมี report_id หากสิทธิ์ถูกจำกัด/ไฟล์ถูกถอน/field policyเปลี่ยนระหว่างสร้าง ให้ปฏิเสธและสร้าง manifest ใหม่ที่ตรวจแล้ว ไม่กรองเงียบจนยอดจอเก่ากับ exportต่างกัน ถ้าสิทธิ์เพิ่มก็ไม่เติมข้อมูลใหม่ใน manifestเก่า

Excelใช้ฟิลด์ allowlist typed text สำหรับชื่อ/รหัสและป้องกัน formula injection; decimal exact และ leading zeroไม่หาย PDFตาม central export/print pipeline Sarabun/A4ที่ทดสอบแล้ว ไม่มี adapter/runtimeใหม่รอบนี้ Artifactอยู่ private file service ผ่านชนิด/scan/currentACL ตาม10/56 ห้ามส่ง signed URL/log private title หรือซ่อนไฟล์เต็มใน HTML/JS CSVยังปิดจนมี adapterและtestsจริง

เสนอ private responses ใช้ no-store รวม preview/HTML/API/download/search ไม่ static prerender/CDN shared cache Cacheถ้าจำเป็นภายหลังต้อง ADR keyedทั้ง principal/context/policy/filter/source/version/field visibility และ revoke tests ไม่อาศัย async event invalidation เพื่อรักษาสิทธิ์ปัจจุบัน

## 4 Reconciliation และ recovery

Ledger06/07 และ snapshot05/03/08 เป็น source of truth ตาม owner รายงานเป็น read projection ไม่มีเปิดรายงานแล้วสร้าง reservation/payment/stock/Application/receipt ใหม่ Projection reconcileกับ typed source receipt/version/row membership และ exact totals ไม่แค่ checksumชื่อปัจจุบัน

| เหตุขัดข้อง                        | สิ่งที่จอแสดง                         | กู้คืนโดยไม่ทำ source ซ้ำ                                 |
| ---------------------------------- | ------------------------------------- | --------------------------------------------------------- |
| source/permission service ไม่พร้อม | UNAVAILABLE ไม่มี0หรือ count fallback | retry read หลัง currentchecks ไม่ใช้ globalcachedtotal    |
| eventซ้ำ/ผิดลำดับ                  | versionเดิมหรือ stale ไม่downgrade    | receipts/CAS/sharedhandler65 และ canonical rebuild        |
| report build/storageล้ม            | pending/error ไม่มี export success    | stable build intent + receipt/reconcile ไม่recommitsource |
| ledger/projectionต่าง              | MISMATCH พร้อม safe locator           | rebuild projectionจาก owner ไม่แก้ ledgerให้ตรงภาพรวม     |
| grantหมด/hold/recordถูกถอน         | deny artifact และล้างผล private       | new authorized manifest ตาม policy ไม่emailผล cached      |

Query/search/export ไม่ส่ง notificationภายนอกหรือทำธุรกรรมธุรกิจโดยปริยาย Correlationตาม65เป็น protected trace ไม่เป็น bearer permission ผู้ดูแลเทคนิคเห็น health/errorsขั้นต่ำไม่ private payload

## 5 Gate

ทั้งAC66ยัง BLOCKED_NOT_RUN ดู [REPORTING_CASES](../tests/reporting/REPORTING_CASES.md) และ [fixture](../tests/fixtures/reporting/reporting-plan.json) ต้องผ่าน65/currentAuth-RLS/owner domain/report builder/export/private file/nativeDBก่อนหน้าและ workerจริง MASTERข้อ2ต้องแผน runtimeที่อนุมัติเฉพาะงานก่อนเขียนโค้ด รอบนี้เป็นเอกสารเตรียมกับหลักฐาน blocker ไม่ขออนุมัติแทนการปิด dependency ไม่เริ่ม67
