# พจนานุกรมตัวเลขรายงานกลาง — บท 66

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | baseline `1793fed` | **Proposal / BLOCKED — ยังไม่มีบริการคำนวณรายงานจริง**

อ่าน [BLUEPRINT](../BLUEPRINT.md), [INTEGRATION_MAP](INTEGRATION_MAP.md), [PERMISSIONS](PERMISSIONS.md) และ [REPORT_CENTER_CONTRACT](REPORT_CENTER_CONTRACT.md) ร่วมกัน บท65ยังไม่ผ่าน มี core19models แต่ไม่มี PositionAssignment/Application/ExamCenter/ledger/RecordVersion/FileVersion/consumer หรือสิทธิ์รายงานจริง `db:test` รอบ66 exit1 ค่าที่นิยามนี้ยังไม่ถูกใช้ใน dashboard จริง

## 1 วิธีคิดทีละขั้น

1. ระบุว่ากำลังนับคน รายการ ตำแหน่ง หรือจำนวนเงิน ชื่อการ์ดต้องบอกหน่วยให้ชัด
2. ตรวจบัญชี หน้าที่ พื้นที่ ช่วงมอบหมาย และสิทธิ์ฟิลด์จาก server แล้วเลือกข้อมูลที่อ่านได้ก่อนนับ ห้ามนับทั้งฐานแล้วค่อยซ่อนแถว
3. ใช้รหัสกลางเป็น key ของสิ่งที่นับ ไม่ใช้ชื่อหรือจำนวนแถวหลัง join เป็นจำนวนคน
4. ตรึงตัวกรอง วันอ้างอิง รุ่นนิยาม และชุดข้อมูลต้นทาง เพื่อให้จอและ export ใช้ฐานเดียวกัน
5. แสดงเวลา ความสด และข้อจำกัด ถ้ายังไม่มีข้อมูลหรือสิทธิ์ ให้แสดงสถานะนั้น ไม่สร้างยอดศูนย์แทน

ทุกนิยามเป็น Proposal ที่เจ้าของ O01–O09 ต้องทบทวน ไม่ใช่การแต่งตั้งอำนาจจริง แต่ข้อกำหนดแยกคน/ตำแหน่ง ปี และสิทธิ์เป็นข้อกำหนดผู้ใช้

## 2 ตัวกรองและเวลา

ตัวกรองร่วม: metric_version, requested_scope, status_set, effective_as_of, knowledge_mode, source_manifest_ref และ purpose ฝั่ง server resolve requested_scope ให้เป็นขอบเขตที่อนุญาต ถ้าขอพื้นที่นอก grant ให้ปฏิเสธ ไม่ขยายตามค่าจาก client

- ช่วงวันใช้ขอบเขตเริ่มรวม–สิ้นสุดไม่รวม ตาม Asia/Bangkok แสดง พ.ศ. แต่เก็บวันที่/เวลาและปีด้วย typed ID กลาง
- รายงาน ณ วันใช้สถานะที่มีผลจาก owner ไม่ตีความ draft/approved request เป็นสถานะทะเบียน Future ที่ยังไม่ activated เป็น pending
- historical sealed ใช้ committed membership/versions ที่ตรึงไว้และชื่อ snapshot ณ วันนั้น; restated เป็นรุ่นใหม่พร้อมเหตุผล ไม่ใช้ recorded_at cutoff เพียงอย่างเดียวแทน manifest
- academic_year_id และ fiscal_year_id เป็นตัวกรองคนละชนิด โครงการสอบผูกหลายปีงบได้ รายงานเงินต้องเลือก FY/currency ไม่บวกข้ามปีโดยไม่ระบุ breakdown
- ตัวกรองช่วงชั้น/ระดับ/ประเภทสอบ/session, หลักสูตร, แหล่งเงิน, คลัง/หน่วย และ ACL ผู้รับ ต้องเป็นรหัสใน catalog ของ owner ไม่เป็นชื่อ free text ที่เลือก SQL ได้

## 3 Catalog metric 0.1

สูตรด้านล่างคำนวณบน **ชุดข้อมูลที่ผ่านสิทธิ์และตัวกรองแล้วเท่านั้น** ID เป็นชื่อ logical model ตามบทก่อน ไม่ใช่ตารางใหม่ในบท66 ทุก count ส่งเป็น exact integer string; เงิน/จำนวน decimal ส่งเป็น decimal string ไม่แปลงผ่าน JavaScript floating point

| metric_id / ชื่อบนจอ             | owner / grain และ key ไม่ซ้ำ             | นิยามสถานะ/สูตรและมิติจำเป็น                                                                                                                                                    |
| -------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M66-01 งานค้างของฉัน             | workflowกลาง / active task_id            | task ที่ยังต้องทำของ account ปัจจุบัน มี action/assignment ที่ยังใช้ได้; หลายบทบาทเห็น task เดิมนับครั้งเดียว overdue แยกตาม server time                                        |
| M66-02 คำขอรอพิจารณา             | O04 / request_id                         | request ปัจจุบันใน submitted/reviewing/returned ตาม filter รุ่นเก่าไม่บวกเพิ่ม approved ไม่ถือว่ามีผลแล้ว                                                                       |
| M66-03 บุคลากรไม่ซ้ำ             | O01 / person_id                          | distinct Person ที่เข้าประชากรตาม effective status และมีความสัมพันธ์ใน scope ที่อ่านได้; หนึ่งคนหลายตำแหน่งยังหนึ่งคน ไม่มีตัวตนที่ยืนยันให้ DATA_INCOMPLETE ไม่รวมจากชื่อคล้าย |
| M66-04 ตำแหน่งที่มีผล            | O01 / assignment_id                      | assignment ที่มีผล ณ วันและอยู่ในสาย/พื้นที่ที่ได้รับมอบหมาย; Person เดียวในพื้นที่ A ไม่ให้เห็น assignment ใน B โดยปริยาย                                                      |
| M66-05 หน่วยงานที่มีผล           | O02 / organization_id                    | แยกชนิดสำนักเรียน/สถานศึกษาและสถานะ effective ไม่รวม ExamCenter เป็นหน่วยอีกครั้งเพราะ join                                                                                     |
| M66-06 สนามแม่บท                 | O02 / exam_center_id                     | distinct central ExamCenter ตามสถานะ ณ วัน ไม่ใช่จำนวน center-session                                                                                                           |
| M66-07 สนามรายรอบ                | O02 / center_session_id                  | สถานะสนามราย academic year/exam session/type; สนามแม่บทเดียวเปิดสองรอบเป็นสองรายการ ไม่แสดงยอดนี้ว่าเป็นจำนวนสนามแม่บท                                                          |
| M66-08 ผู้เรียนไม่ซ้ำ            | O05 / person_id ผ่าน Enrollment          | distinct ผู้เรียนที่ enrollment เข้าสถานะ/ปี/หน่วยที่เลือก; enrollment หลายรายการไม่เพิ่มจำนวนคน                                                                                |
| M66-09 รายการสมัครเรียน          | O05 / enrollment_id                      | จำนวน enrollment ตามปี/หลักสูตร/หน่วยและสถานะ แยกจากจำนวนผู้เรียนและ Application                                                                                                |
| M66-10 ใบสมัครสอบ                | O05 / application_id                     | web และ Excel จากทะเบียน05เดียว ตามปี/session/type/ระดับ/ช่วงชั้น/status; snapshot/row receipt/import batch ไม่เพิ่มใบสมัคร                                                     |
| M66-11 ผู้สมัครไม่ซ้ำ            | O05 / candidate.person_id                | distinct คนที่มี Application เข้า filter; Candidate กลางไม่คนละทะเบียนตามช่องทางหรือปี จำนวนใบสมัครไม่ใช่จำนวนคน                                                                |
| M66-12 ผลสอบที่รับรอง            | O05 / result_id + certified version      | ผลรับรองที่มีผลตาม year/session/type/level แยกจาก draft/raw/practice; รุ่นแทนที่ไม่บวกกับรุ่นเดิม                                                                               |
| M66-13 ผลที่ประกาศผ่าน           | O05 / released result_id                 | ผลผ่านใน release snapshot รุ่น active ที่อนุมัติและถึงเวลาเผยแพร่ตาม field policy; ถอนเผยแพร่ไม่อยู่ใน public metric/export                                                     |
| M66-14 ผู้เรียนในกิจกรรมการเรียน | O03 / person_id ผ่าน learning enrollment | self หรือกลุ่มที่ผู้สอนได้รับมอบหมาย; progress เป็น private แยกจากผู้เรียนทะเบียน05 และไม่รวมสองประชากรเป็นยอดเดียว                                                             |
| M66-15 แบบทดสอบที่ส่งแล้ว        | O03 / attempt_id                         | submitted PRE/POST แยกชนิด ครั้งทำซ้ำและรอตรวจ rubric; ไม่ใช้ request retry เป็นครั้งสอบ ไม่เข้าสู่ผลทางการ05                                                                   |
| M66-16 งบคงเหลือ                 | O06 / budget_line_id + currency + FY     | จัดสรรสุทธิ − จองคงค้าง − ภาระยังไม่จ่าย − ค่าใช้จ่ายที่บันทึกแล้ว ใช้ ledger exact และหมวดไม่ทับกัน ตามสูตร43 ไม่ถือค่า missing เป็น0                                          |
| M66-17 วัสดุคงเหลือ              | O07 / item_id + location_id + unit_id    | sum signed posted stock movements ณ วันและหน่วยตามรุ่น conversion; ไม่รวมกล่องกับชิ้นโดยไม่มี policy ไม่เท่ากับยอดเงินจ่าย06                                                    |
| M66-18 ครุภัณฑ์รายชิ้น           | O07 / asset_id                           | distinct ชิ้นตามหน่วย/ที่ตั้ง/ผู้รับผิดชอบ/สถานะ ณ วัน การยืมและซ่อมไม่สร้างชิ้นใหม่ จำหน่ายคงประวัติ                                                                           |
| M66-19 หนังสือที่อ่านได้         | O08 / correspondence_id                  | distinct เรื่องผ่าน current record/version/confidentiality ACL; หลายผู้รับ/หน้าที่/รุ่นไม่เพิ่มจำนวนเรื่อง snippet และชื่อเรื่องต้องผ่าน field policy เพิ่ม                     |
| M66-20 การส่งและรับทราบหนังสือ   | O08 / delivery_receipt_id                | แยก queued/delivered/acknowledged/assigned/completed ต่อผู้รับและรุ่น หนังสือเวียนหนึ่งเรื่องหลาย receipt ไม่เป็นหลายเรื่อง notification opened ไม่ACK                          |
| M66-21 ชุดนำเข้า Excel           | O09 / import_batch_id                    | batch ตามหน่วย/status/รุ่น lineage ไม่ใช่ใบสมัคร; จำนวนที่สร้างอ่าน summary62 กับ Application05จริง ไม่บวก committed row เป็น Applicationอีกชุด                                 |

ไม่สร้างยอดรวมทั้ง21 metric เพราะคน รายการ ปี หน่วย และประชากรต่างกัน การรวม count รายพื้นที่ต้องใช้ union ของรหัสกลางแล้ว distinct ใหม่ เช่น คนอยู่สองหน่วยไม่เอายอดสองหน่วยมาบวกเป็นจำนวนคนรวม

## 4 ตัวอย่างสมมติและ denominator

[fixture](../tests/fixtures/reporting/reporting-plan.json) เป็น reference plan เท่านั้น TEST_P001 มี A สองตำแหน่งและ B หนึ่งตำแหน่ง, TEST_P002 มี A หนึ่งตำแหน่ง, TEST_P003 มี B หนึ่งตำแหน่ง Expected A: 2 คน/3 ตำแหน่ง; A∪B: 3 คน/5 ตำแหน่ง; A+B จำนวนคนแบบบวกย่อยจะได้4 จึงห้ามใช้แทน union3 ไม่มี runtime Person/assignment/grant IDs หรือข้อมูลคนจริงใน fixture

อัตราต้องแสดง numerator/denominator/version และ populations เดียวกัน: ตัวอย่างอัตราผ่านนับ distinct ผลผ่านต่อ distinct ผลรับรองที่มีสิทธิ์ใน session เดียวกัน ไม่หารด้วยทุก draft Application อัตราเรียนจบใช้ eligible learning enrollments ตาม completion policy ไม่ใช้เวลาเปิดหน้า จำนวน denominator0 ให้ NOT_COMPUTABLE ไม่ NaN/0% การเปรียบเทียบ pre/post ใช้เงื่อนไข [LEARNING_REPORTS](LEARNING_REPORTS.md) ไม่สรุปเหตุจากคะแนนสองครั้ง

Aggregate ของผู้เรียนหรือข้อมูลอ่อนไหวต้อง approved privacy policy/version/cohort/minimum distinct contributors และการป้องกัน complementary/differencing ตาม28 หากยังไม่ยืนยันให้ SUPPRESSED โดยไม่คืน count จริงใน metadata หรือ export ไม่ตั้ง threshold ตัวเลขใหม่เอง ไม่ใช้จำนวน attempts แทนจำนวนคนเพื่อผ่านเกณฑ์กลุ่มเล็ก

## 5 สถานะและการตรวจรับ

ค่าที่ตอบต้องมี metric_id/version, unit/grain, value หรือ null, value_status, applied_filter_ref, source_manifest_ref, effective_as_of, generated_at, last_successful_refresh, freshness และ reconciliation_status ค่า0ใช้เฉพาะผลสำเร็จที่อนุญาตและไม่มีสมาชิกจริง ไม่แสดง0แทน NOT_AUTHORIZED/UNAVAILABLE/SUPPRESSED/DATA_INCOMPLETE

ตัวเลขบนจอ tooltip accessible label HTML JSON API facets export และ worker ใช้นโยบายเดียวกัน ยอดเงิน mismatch ให้หยุดรับรองและแสดงข้อผิดพลาดที่ไม่เผยข้อมูลนอก scope ไม่แก้ ledger ให้ตรง projection

ดู [REPORTING_CASES](../tests/reporting/REPORTING_CASES.md) AC66-01/02 ยัง BLOCKED_NOT_RUN ต้อง65/owner services/currentAuth-RLS/nativeDB/report endpoints และ browser พร้อมก่อนพิสูจน์ ไม่เลื่อนไป67

เอกสารเทคนิคที่อ่านรอบ66: [PostgreSQL18 aggregate functions](https://www.postgresql.org/docs/18/functions-aggregate.html) และ [row security](https://www.postgresql.org/docs/18/ddl-rowsecurity.html) ใช้ประกอบการออกแบบ count/empty-set/RLS ไม่ใช่ผลทดสอบบริการหรือการรับรองนโยบายของโครงการ
