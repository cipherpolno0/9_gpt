# ตรวจรับคลังข้อสอบและการเรียน — บท 29

รุ่น 0.1 | 4 ตุลาคม 2569 | source ก่อนแก้ `30b92a5` | **BLOCKED — ยังไม่ผ่านการตรวจรับระบบ 3**

อ่าน BLUEPRINT, MASTER, PROGRESS, DECISIONS และแบบบท 24–28 ก่อนจัดเอกสารนี้ ผลตรวจไฟล์จริงพบว่า `src/modules/learning` มี README เท่านั้น พื้นที่ `/app` ใช้ starter ที่ตอบ 403 ทุก method ไม่มีหน้าเลือกกลุ่ม แบบทดสอบ บทเรียน คะแนน รายงาน หรือ CMS จึงยังรัน E2E ที่ผู้ใช้ขอไม่ได้ การตอบ 403 ของ starter ไม่พิสูจน์ว่าผู้เรียนที่มีสิทธิ์ใช้งานได้ หรือว่า policy รายคนทำงานแล้ว

## 1 สถานะและ dependency

PASS ต้องมี execution พร้อม assertion และหลักฐานจริง; FAIL คือรันแล้วผลผิด; BLOCKED คือสิ่งที่ต้องใช้ยังขาด; NOT RUN คือยังไม่ได้รันกรณีนั้น; TO VERIFY คือกฎหรือหลักฐานยังไม่ยืนยัน ไม่ใช้ skipped test, mock ที่อนุญาตทุก action หรือผลตรวจ CSV แทน PASS

| บท  | สิ่งที่มี                                                         | สิ่งที่ยังต้องพัฒนาและตรวจรับ                                                    | สถานะ   |
| --- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------- |
| 24  | CURRICULUM_SCHEMA / CURRICULUM_COVERAGE / LEARNING_CONTENT_POLICY | Curriculum/Course/Subject/Topic/LessonVersion, seed และหน้าหลักสูตรจริง          | BLOCKED |
| 25  | QUESTION_BANK_CONTRACT / QUESTION_REVIEW                          | คลังคำถามรุ่น immutable, Key/Rubric, CMS และ publication policy                  | BLOCKED |
| 26  | PRETEST_FLOW / PRETEST_AUTOSAVE                                   | Attempt/Opportunity/Response, snapshot, revision/receipt, server clock, autosave | BLOCKED |
| 27  | LEARNING_FLOW                                                     | required activities, private progress/resume และ shared POST guard               | BLOCKED |
| 28  | ASSESSMENT_RULES / LEARNING_REPORTS                               | scorer, manual queue, certification, pairing และ report privacy                  | BLOCKED |

ส่วนกลางตาม [FOUNDATION_ACCEPTANCE](FOUNDATION_ACCEPTANCE.md) ยังไม่มี Auth/session/DAL/RLS runtime, private-file scan/ACL, workflow/audit/outbox ที่บริการเรียนต้องใช้ ต้องปิด DB-06/Q027 และ DOCKER-05/Q026 พร้อม dependency ตามสถานะจริงก่อน ไม่สร้าง login หรือฐานข้อมูลอีกชุดเพื่อให้ test ดูเหมือนผ่าน

## 2 สิ่งส่งมอบรอบนี้

- [ACCEPTANCE_CASES](../tests/system03/ACCEPTANCE_CASES.md): ขั้นทำซ้ำและ assertion 23 กรณี เป็น **test specification ไม่ใช่ executable E2E**
- [coverage-plan.csv](../tests/fixtures/system03/coverage-plan.csv): 9 คู่ช่วงชั้น × ระดับ และ actor refs สมมติสำหรับเตรียม fixture; ไม่ใช่บัญชีหรือ enrollment ที่ seed แล้ว
- [MANUAL_LEARNING](MANUAL_LEARNING.md): คู่มือผู้สอนและบรรณาธิการฉบับเตรียม แยกความพร้อมซอฟต์แวร์กับการรับรองเนื้อหา

ไม่มี executable tests/routes/services, migration หรือ seed ระบบ 3 เพิ่มในบทนี้ root script `corepack pnpm test` ใช้ `tests/*.test.ts` และไม่รัน specification ใน `tests/system03` ไม่อ้างคำสั่ง `test:e2e` ที่โครงการยังไม่มี

## 3 Matrix flow ครบเก้ากลุ่ม

อ้าง group และ Curriculum refs จาก [CURRICULUM_COVERAGE](CURRICULUM_COVERAGE.md) โดยแยกช่วงชั้นกับระดับธรรมศึกษา ไม่รวมกับระดับนักธรรม แต่ละแถวต้องมี execution ของตนเองสำหรับเลือกกลุ่ม → PRE submitted → บทเรียน required → POST submitted → รายงาน พร้อมการเรียก POST โดยตรงก่อนผ่านเงื่อนไข

| Group ref สมมติ          | ช่วงชั้น | ระดับ | PRE     | บทเรียน/resume | POST    | รายงาน  | server guard | เนื้อหาผู้เชี่ยวชาญรับรอง |
| ------------------------ | -------- | ----- | ------- | -------------- | ------- | ------- | ------------ | ------------------------- |
| DEMO_GROUP_PRIMARY_TRI   | ประถม    | ตรี   | NOT RUN | NOT RUN        | NOT RUN | NOT RUN | NOT RUN      | TO VERIFY                 |
| DEMO_GROUP_PRIMARY_THO   | ประถม    | โท    | NOT RUN | NOT RUN        | NOT RUN | NOT RUN | NOT RUN      | TO VERIFY                 |
| DEMO_GROUP_PRIMARY_EK    | ประถม    | เอก   | NOT RUN | NOT RUN        | NOT RUN | NOT RUN | NOT RUN      | TO VERIFY                 |
| DEMO_GROUP_SECONDARY_TRI | มัธยม    | ตรี   | NOT RUN | NOT RUN        | NOT RUN | NOT RUN | NOT RUN      | TO VERIFY                 |
| DEMO_GROUP_SECONDARY_THO | มัธยม    | โท    | NOT RUN | NOT RUN        | NOT RUN | NOT RUN | NOT RUN      | TO VERIFY                 |
| DEMO_GROUP_SECONDARY_EK  | มัธยม    | เอก   | NOT RUN | NOT RUN        | NOT RUN | NOT RUN | NOT RUN      | TO VERIFY                 |
| DEMO_GROUP_HIGHER_TRI    | อุดม     | ตรี   | NOT RUN | NOT RUN        | NOT RUN | NOT RUN | NOT RUN      | TO VERIFY                 |
| DEMO_GROUP_HIGHER_THO    | อุดม     | โท    | NOT RUN | NOT RUN        | NOT RUN | NOT RUN | NOT RUN      | TO VERIFY                 |
| DEMO_GROUP_HIGHER_EK     | อุดม     | เอก   | NOT RUN | NOT RUN        | NOT RUN | NOT RUN | NOT RUN      | TO VERIFY                 |

ใช้ UAT29-T01/T02/T03/T12/T13/T14/T17 กับทุกแถว ส่วนกรณีอื่นต้องประกาศชนิดข้อ/กิจกรรม/รุ่นกฎที่รองรับและ parameterize ทุกกลุ่มที่มี configuration นั้น ไม่มี fixture ที่ต้องใช้ให้ BLOCKED ไม่ข้ามแล้วนับ flow ครบ

Course/Topic/Lesson refs ในบท 24 เป็น template ต่อกลุ่ม ไม่เชื่อมทุกกลุ่มกับ Course ที่มี curriculum_id เดียว ตัวเลข 9 แถวเป็น coverage plan ไม่ใช่หลักฐาน 9 หน้าหรือผลรัน 9 flow

## 4 แผนตรวจและหลักฐานที่ต้องเก็บ

| กรณี         | ขอบเขต                                                                                  | ผลจริง  |
| ------------ | --------------------------------------------------------------------------------------- | ------- |
| UAT29-T01–03 | ทั้ง 9 flow, enrollment/group binding, ลำดับ backend ทุกช่องทาง                         | NOT RUN |
| UAT29-T04–08 | sampling, ครบ/ไม่ครบ, server deadline, retake/retry, offline/CAS                        | NOT RUN |
| UAT29-T09–11 | รุ่นเนื้อหา/คะแนน, withdrawal, ข้อเขียน/ผู้ตรวจ                                         | NOT RUN |
| UAT29-T12–16 | answer-key leakage, คะแนนเพื่อน, client tamper, revoke/job, report scope/privacy        | NOT RUN |
| UAT29-T17–19 | keyboard/4 viewport/สื่อ/เวลา, CMS maker-checker, file/public visibility                | NOT RUN |
| UAT29-T20–23 | official-result boundary, transaction/history, content certification, comparison report | NOT RUN |

ก่อนรันต้องสร้างบัญชีสมมติผ่านระบบกลางที่ยืนยัน User–Person binding มีผู้เรียน A/B ผู้สอนที่มอบหมาย/ไม่มอบหมาย บรรณาธิการ ผู้ตรวจเนื้อหา ผู้ตรวจข้อเขียน และ checker แยกกัน พร้อม current assignments ที่มีช่วงเวลา ไม่ใช้ actor refs ใน CSV เป็นสิทธิ์โดยตัวมันเอง

แต่ละ execution เก็บ source commit, test/runner version, schema/migration checksum, fixture/config hash, group/context refs, policy versions, actors/assignments, server time, browser/device, ขั้นทำซ้ำ, HTTP/DB assertions, fault point, receipts/revisions/effect counts และ private evidence refs บันทึก before/after manifest เพื่อพิสูจน์รุ่นและประวัติไม่หาย ไม่ใช้เพียง screenshot หรือ row count

หลักฐานจาก network/HTML/RSC/storage trace อาจมีคำตอบหรือ session ต้องเก็บ private ตาม ACL/retention ก่อนลบข้อมูลอ่อนไหวออกจากรายงานสรุป ห้าม commit token/password/Key/คำตอบเต็ม/รายชื่อผู้เรียนหรือ canary values; fixture ใน repository เป็นแผน refs สมมติเท่านั้น ผลตรวจ public leakage ต้องตรวจ payload จริงและเส้นทางเข้าถึงจริง ไม่ใช้ search คำว่า `answer_key` เพียงอย่างเดียว

## 5 ผลที่รันจริงและวิธีทำซ้ำ

| คำสั่ง/วิธี                                            | ผลจริง 4 ตุลาคม 2569                                                                                          | ขอบเขต                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| git status/log และอ่าน schema/module/app route/package | ก่อนแก้ `30b92a5`, clean, main ahead 18; learning README-only; auth/authz/workflow/audit directories ยังไม่มี | ยืนยัน blocker ไม่ใช่ authz/E2E PASS                                    |
| Python read-only ตรวจ UID/Docker/TCP                   | uid 0, uid_map 0:0:1; ไม่มี Docker CLI/socket; 127.0.0.1:5432 และ :5546 เป็น ConnectionRefusedError           | ไม่ได้เริ่ม DB หรือตรวจ credentials; DB-06/DOCKER-05 ยังเปิด            |
| `corepack pnpm test`                                   | exit 0; tests 17 / pass 17 / fail 0 / skipped 0                                                               | starter/core helpers เท่านั้น รวม Thai-date helpers 3 กรณี ไม่ใช่ UAT29 |

ตรวจ Markdown/CSV, formatting, Git diff และ secret ตามผลที่จะบันทึกท้ายเอกสาร ไม่รัน lint/typecheck/build/native DB/SQLWASM/API/browser/worker ระบบ 3 รอบนี้ เพราะไม่มี runtime/schema เปลี่ยนและ dependency ขาด ไม่มี production หรือข้อมูลจริงถูกเปลี่ยน

เมื่อ dependency พร้อม ให้ใช้ README ตั้ง dev ที่แยกจาก production ตรวจ limited DB role/migrations/seed จริง สร้าง executable integration และ browser runner ตาม routes/ADR ที่ยืนยัน แล้วเพิ่มคำสั่งรันจริงใน package และเอกสารนี้ก่อนประกาศว่าใช้ได้ ทำ fault injection/replay กับ PostgreSQL จริง ไม่แทน concurrency ด้วย mock

## 6 รับรองซอฟต์แวร์แยกจากเนื้อหาทางธรรม

| Track            | ต้องมีหลักฐาน                                                                                                                                                      | ผลปัจจุบัน                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| Software QA      | 9 flow และ negative server guard, privacy, retry/replay/manual/accessibility ผ่านตามกรณีจริง                                                                       | BLOCKED / NOT RUN              |
| Content review   | ผู้เชี่ยวชาญที่มีอำนาจ แหล่ง/ฉบับ/หน้าที่อ้าง สิทธิ์ใช้เนื้อหา group/subject/topic mapping, Lesson/Question/Key-or-Rubric/Explanation manifest, ขอบเขตและวันรับรอง | TO VERIFY ไม่มีคำรับรองแนบ     |
| Release decision | เจ้าของ O03/C02/C03 ที่ยืนยัน พิจารณาสอง track และข้อค้าง พร้อม scope/date ของการอนุญาตใช้งาน                                                                      | ยังไม่มีผู้ลงนามรับรอง release |

ข้อสมมติและเนื้อหา DEMO ของบท 24 เป็นทักษะทดลองการใช้เว็บ ไม่ใช่ข้อสอบทางธรรมที่รับรอง การผ่าน unit/E2E หรือ maker-checker ของ CMS ไม่ทำให้เนื้อหานั้นถูกต้องทางธรรม การรับรองเฉพาะรุ่น/กลุ่มไม่ขยายไปทั้งคลัง รุ่นใหม่ต้องทบทวนขอบเขตใหม่ ดูวิธีปฏิบัติใน MANUAL_LEARNING

## 7 Gate, versions และข้อค้าง

เกณฑ์มีหลักฐาน flow ครบ 9 กลุ่มและลำดับบังคับฝั่ง server: **BLOCKED / NOT RUN** เกณฑ์แยกความถูกต้องทางธรรมกับซอฟต์แวร์: กำหนด track/label ชัดแล้ว แต่การรับรองเนื้อหาและ UI จริงยัง **TO VERIFY / NOT RUN** ไม่อ้างว่าข้อสอบสมมติรับรองแล้ว

App/schema `0.6.0`, Prisma `7.10.0`, Next `16.3.8`, pnpm `11.28.2`, lockfile `9`; core 19 models / 213 scalar fields / migration 1 ไม่เปลี่ยน Migration `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่มี schema/migration/seed ใหม่

Q007/Q024 ต้อง curriculum/rights/rubric/sampling/retake/clock/comparison/certification ที่มีรุ่น Q005/Q006 ต้องผู้สอน/ผู้ตรวจ/checker และหลักฐานอำนาจ Q008/Q025/Q016 ต้อง key/feedback/public/aggregate/offline data/retention Q011/Q023 ต้อง worker/DAL/RLS/limited write และ Q018/Q019/Q021 ต้อง UI/browser/accessibility จริง

ขั้นต่อไปปิด foundation และ implementation/ตรวจรับ 24–28 ตาม dependency แล้วรัน UAT29-T01–23 พร้อมหลักฐาน ไม่เลื่อนไปบท 30 จากแผน CSV/Markdown หรือ unit ของ starter

## 8 ผลตรวจชุดเอกสารและแผน fixture รอบนี้

| คำสั่ง/วิธี                                                                                                                                                                   | ผลจริง                                                                                                                                           | ขอบเขต                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Python inline อ่าน CSV, ตาราง coverage, actor refs, case IDs, source cases, local links, schema/package/lock/migration                                                        | PASS: 9คู่ไม่ซ้ำตรงบท24/UAT29; actorrefsแยกตามหน้าที่; 23caseIDs; 64caseIDsต้นทางมีจริง; 31local linksมีปลายทาง; inventory/checksum/versionsเดิม | โครงสร้างแผนเท่านั้น ไม่ใช่ seed/login/E2E/เนื้อหาถูกต้อง                       |
| `corepack pnpm exec prettier --ignore-path /dev/null --check docs/UAT_SYSTEM_03.md docs/MANUAL_LEARNING.md tests/system03/ACCEPTANCE_CASES.md src/modules/learning/README.md` | PASS                                                                                                                                             | รูปแบบMarkdown4ไฟล์นี้ CSVตรวจด้วยPython ไม่ใช้formatterที่ไม่รองรับCSV         |
| `git diff --check` และ `git diff --cached --check`                                                                                                                            | PASS working/staged9ไฟล์                                                                                                                         | whitespaceไม่ใช่privacyหรือbusiness assertions                                  |
| `corepack pnpm secrets:check` หลังstage                                                                                                                                       | PASS                                                                                                                                             | ตัวตรวจครอบคลุมแพตเทิร์นที่รองรับ/ไฟล์ที่Gitเห็น ไม่รับรองว่าไม่มีsecretทุกชนิด |

SHA256 `coverage-plan.csv`: `e8f9eb0b0cf84e080bdc17b97414d5a79afa856ae2290ee49bcf3c3921f7b53f` แผนนี้ยังNOT_SEEDED/NOT_EXPERT_APPROVED/NOT_RUN ไม่เก็บKey/password/คะแนนผู้เรียนจริง ทุกUAT29ยังNOT RUN ผลrootunit17และstructuralcheckนี้ไม่ปิดสองเกณฑ์ของผู้ใช้ ไม่มีpush/deploy
