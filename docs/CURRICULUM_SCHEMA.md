# สัญญาโครงสร้างหลักสูตร — บท 24

รุ่นเอกสาร 0.1 | 4 ตุลาคม 2569 | source ก่อนแก้ `22a62d2` | **Proposal / BLOCKED**

บท 23 ยังไม่ผ่าน ดู [UAT_SYSTEM_02](UAT_SYSTEM_02.md) โมดูล learning มีเพียง README ไม่มี Prisma models หรือบริการหลักสูตร เอกสารนี้เป็น logical contract สำหรับพัฒนาต่อ **ไม่ใช่ Prisma schema ที่ generate/migrate ได้** ไม่สร้าง migration หรือ seed24 และไม่อ้างว่าหน้าหลักสูตรเปิดใช้ได้

## 1 แยกสองแกนก่อนสร้างหลักสูตร

ช่วงชั้น = ประถม / มัธยม / อุดม ส่วนระดับธรรมศึกษา = ตรี / โท / เอก เก็บคนละ field และประกอบเป็น LearningGroup จำนวน 3 × 3 = 9 คู่ตามขอบเขตผู้ใช้ ไม่ใช้ enum เดียวที่มีชื่อปนสองแกน ไม่เอาตรีของนักธรรมมาแทนตรีของธรรมศึกษา และไม่อนุมานช่วงชั้นจากอายุหรือบัญชีผู้ใช้

ชื่อกลุ่มและรหัส DEMO ใน [CURRICULUM_COVERAGE](CURRICULUM_COVERAGE.md) เป็นข้อกำหนดโครงการ ไม่ใช่การรับรองรหัสหลักสูตรทางการ ชื่อหนังสือ กลุ่มผู้มีสิทธิ์เรียนและ mapping วิชาต้องตรวจหลักฐานรายรุ่นตาม Q007

## 2 สิ่งที่ต่อจากแบบบท 04

DATA_DICTIONARY มี learning_group, curriculum, course, lesson_version และแบบการประเมินอยู่แล้ว แต่ยังไม่มี Subject/Topic และแกนช่วงชั้นแยกอย่างชัดเจน Course เดิมอธิบายทั้งวิชาและหน่วยเรียน รอบนี้เสนอให้ Course เป็นหน่วยจัดการเรียนใน Curriculum รุ่นหนึ่ง ส่วน Subject เป็นหมวดวิชาที่อ้างแหล่งและ Topic เป็นหัวข้อใน Course ไม่สร้าง course อีกชุดหรือใช้ exam_subject ของผลสอบทางการเป็นวิชาฝึกโดยอัตโนมัติ

เมื่อ implementation พร้อม ต้องปรับ dictionary/ERD/ADR และ migration ให้ตรงกันก่อนใช้จริง รุ่นเอกสารนี้ไม่เปลี่ยน baseline128ตารางหรือ physical schema0.6.0

## 3 ฟิลด์ร่วมและความสัมพันธ์ที่เสนอ

ทุก model ใช้ UUID PK; FK RESTRICT และ snake_case ผ่าน map/model mapping ไม่ใช้ชื่อไทยหรือชื่อคนเป็น key เก็บ created_at/recorded_at เป็น timestamptz มาตรฐาน วันที่ช่วงหลักสูตรเป็น Gregorian date และเวลาเผยแพร่เป็น instant; แสดง พ.ศ. และตรวจ cutoff ด้วย Asia/Bangkok

รายการที่แก้ได้ขณะร่างมี row_version >= 1, created_by/updated_by อ้างบัญชีกลางฝั่ง server และ recorded_at ถาวร ตารางรุ่นมี version_no >= 1, supersedes_id อ้างรุ่นก่อน, creator_account_id, submitted_at, sealed_at, content_hash และ policy_version_id โดยไม่ลบรุ่นที่มีการอ้างอิง supersedes_id ต้องอยู่ชุด curriculum_code/กลุ่มเดียวกัน หรือ course_id/lesson_codeเดียวกันตามชนิด ไม่ข้ามเจ้าของ ใช้ FK/context guard ใน transaction; publish_from/publish_until เป็น timestamptz nullable แยกจาก valid_from/valid_to และใช้ [from, until) ผู้ตรวจ/หลักฐานอ้างบริการกลาง ไม่ใช้ ServiceActor แทนบัญชีผู้ตรวจที่ยังไม่สร้าง

| Model → ตารางเสนอ                                   | ฟิลด์เฉพาะขั้นต่ำและชนิด                                                                                                                                                                    | FK / ข้อบังคับเสนอ                                                                                                                                                                                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| LearningGroup → learning_group                      | group_code text, stage_reference_id UUID, exam_type_id UUID, exam_level_id UUID, label_th text                                                                                              | stage อ้าง ReferenceCode ชุด LEARNING_STAGE ที่รับรอง; (exam_level_id, exam_type_id) → ExamLevel(id, exam_type_id); unique(stage_reference_id, exam_level_id), unique(group_code); ตรวจชนิดธรรมศึกษาและ stage code-set ใน transaction ตาม master ที่ยืนยัน ไม่ CHECK ข้ามตาราง |
| Curriculum → curriculum                             | learning_group_id UUID, curriculum_code text, version_no int, title_th text, valid_from date, valid_to date nullable, content_status text, source_evidence_id UUID, rights_evidence_id UUID | FK กลุ่มเดียวต่อรุ่น; unique(curriculum_code, version_no) ตาม04 โดย code ระบุกลุ่มชัดเจน; unique(id, learning_group_id); ช่วง [valid_from, valid_to); ห้ามเปลี่ยนกลุ่มเมื่อ seal; การเลือก default เมื่อรุ่นทับซ้อนต้องมี policy ไม่เดารุ่นสูงสุด                              |
| Subject → subject                                   | subject_code text, label_th text, discipline_reference_id UUID, source_evidence_id UUID, verification_status text                                                                           | unique(subject_code); หมวด DEMO ธรรม/พุทธ/วินัย/ข้อเขียนแยก label ในหลักสูตรจริง; label master ไม่ใช้แทน snapshot ของรุ่นที่เผยแพร่; ไม่มี FK ไป official exam score โดยอัตโนมัติ                                                                                              |
| Course → course                                     | curriculum_id UUID, subject_id UUID, course_code text, title_th text, display_order int, assessment_mode text                                                                               | FK Curriculum/Subject; unique(curriculum_id, course_code), unique(id, curriculum_id); title_th เป็น snapshot ของรุ่นนั้น; assessment_mode = OBJECTIVE / MANUAL_WRITING / MIXED ตามหลักฐาน; MIXED ต้องแยกชนิด item ห้ามตรวจข้อเขียนด้วย objective scorer                        |
| Topic → topic                                       | course_id UUID, topic_code text, title_th text, display_order int, parent_topic_id UUID nullable                                                                                            | unique(course_id, topic_code), unique(id, course_id); composite FK (parent_topic_id, course_id) → Topic(id, course_id); ไม่มี parent ข้าม Course; ตรวจ self/descendant cycle และ race ใน transaction ไม่ให้ลำดับหัวข้อวน                                                       |
| LessonVersion → lesson_version                      | course_id UUID, topic_id UUID, lesson_code text, version_no int, title_th text, body_th text, source_evidence_id UUID, rights_evidence_id UUID, review_decision_id UUID                     | unique(course_id, lesson_code, version_no), unique(id, course_id); composite FK (topic_id, course_id) → Topic(id, course_id); body เป็น authored content ที่ผ่าน sanitization; immutable เมื่อ submit/seal หรือถูกอ้างโดยการเรียน/attempt; เปลี่ยนเป็นรุ่นใหม่                 |
| CurriculumLessonBinding → curriculum_lesson_binding | curriculum_id UUID, course_id UUID, lesson_version_id UUID, display_order int                                                                                                               | FK (course_id, curriculum_id) → Course(id, curriculum_id), (lesson_version_id, course_id) → LessonVersion(id, course_id); unique(curriculum_id, lesson_version_id); เป็น manifest ที่ตรึงรุ่นบทเรียน ไม่ resolve latest ใน runtime; binding immutable เมื่อ seal               |

common version fields ในข้อ3ใช้กับ Curriculum และ LessonVersion ไม่เพิ่ม version_no ซ้ำสองคอลัมน์ Course/Topic ถูกตรึงพร้อม Curriculum; การเปลี่ยนโครงของรุ่นที่ seal แล้วต้องสร้าง Curriculum รุ่นใหม่พร้อม Course/Topic ใหม่ที่อ้าง Subject กลางเดิมได้ การเปลี่ยนชื่อ Subject ภายหลังไม่เปลี่ยน title snapshot ของ Course เดิม

source_evidence_id/rights_evidence_id เป็นสัญญา typed evidence กลางที่ยังต้องออกแบบร่วม Document/FileVersion/Workflow ห้ามชี้ UUID ไปคนละชนิดโดยไม่มี FK และห้ามใช้ Document metadata เดิมแทนไฟล์ที่ผ่าน scan ดู [LEARNING_CONTENT_POLICY](LEARNING_CONTENT_POLICY.md) ต้องกำหนด physical evidence bindings เมื่อส่วนกลางพร้อม

## 4 ดัชนีและ write path

ใช้ unique indexes ตาม key ข้างต้นก่อน ดัชนีเพิ่มเติมเสนอเฉพาะ query ที่ต้องใช้: Curriculum(learning_group_id, content_status, valid_from), Course(curriculum_id, display_order), Topic(course_id, display_order), LessonVersion(course_id, content_status), และ publication window เมื่อมี actual query/EXPLAIN ไม่สร้าง index ทุก field หรือ text search ทั้งเนื้อหาที่ผู้ใช้ไม่มีสิทธิ์อ่าน

private schema เปิดและ FORCE RLS ทุกตาราง ใช้ limited server role และตรวจ current actor/action/resource/group/organization context/ช่วงมอบหมาย/field policy แบบ deny by default ทั้ง read/edit/review/publish/export/job/download คนหนึ่งหลายบทบาทได้แต่ creator ห้ามรับรองผลงานสำคัญตนเอง Group/course_id จาก client ไม่ให้สิทธิ์ ต้อง resolve FK จาก DB ภายใต้สิทธิ์จริงก่อน query/count/project

การ submit/review/seal/publish มี optimistic expected row_version, correlation, evidence และ receipt ใน transaction เดียวกับ audit/outbox ใช้ workflowกลาง ไม่สร้าง engine ใหม่ Worker ต้องตรวจการมอบหมายและรุ่น ณ เวลาทำงานจริง การถอนสิทธิ์ไม่ถูกข้ามด้วย scheduled job เก่า

## 5 รักษา attempt รุ่นเก่า

1. ก่อนเริ่ม attempt บริการประเมินต้องตรึง curriculum UUID รุ่น, manifest hash และชุด LessonVersion/QuestionVersion/AnswerKey หรือ rubric/score-policy UUID ที่อนุญาต ไม่อ่าน current/latest ตอน replay คะแนน
2. blueprint/enrollment/attempt ต้องมี Curriculum context เดียวกันตาม composite FK แบบ04 รวมทั้งบทเรียนและคำถามใน manifest จริง
3. ออก v2 แล้วให้ผู้เรียนใหม่ใช้ v2 ตาม policy ส่วน attempt v1 ยังใช้ manifest/เนื้อหา/เกณฑ์ v1 การแก้เนื้อหาไม่ rescore หรือเปลี่ยนคำตอบเดิมอัตโนมัติ
4. ถ้าต้องแก้คะแนน ให้สร้าง grading revision อ้างต้นทางพร้อมเหตุผล ผู้ตรวจ หลักฐาน และ policy ที่อนุมัติ แสดงผลเดิมกับ revision ได้ ไม่แก้ audit เดิม คะแนนฝึกไม่เขียน subject_score/result_release ของระบบ5
5. ถอนเนื้อหาเนื่องจากสิทธิ์หรือความปลอดภัยให้หยุดการเข้าถึงตาม policy ปัจจุบันได้ ประวัติเดิมยังมี refs/hash และผลคะแนน แต่ไม่ถือ immutable หมายถึงต้องเผยเนื้อหาที่ถูกถอนต่อไปตลอด อายุการเก็บ/สิทธิ์ดูต้นทางต้อง Q016 รับรอง

แบบ04 attempt/attempt_item ตรึง blueprint/question อยู่บางส่วน แต่ยังไม่มี complete lesson manifest และ explicit immutable rubric/grading binding ที่พิสูจน์ข้อ2ได้ ต้องเติม contract ก่อน implementation assessment ไม่อ้างว่าบทนี้มี attempt engine แล้ว

## 6 การตรวจรับที่เตรียมไว้ — runtime ทั้งหมด NOT RUN

| Case   | ตรวจเมื่อ dependency พร้อม                                                       | ผลที่ต้องได้                                                                       |
| ------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| P24-01 | สร้าง9คู่และลองซ้ำ/สลับแกน/level ของนักธรรม                                      | unique/FK/type guard ปฏิเสธผิดจริงทั้ง DBและservice                                |
| P24-02 | Course/Topic/LessonVersion binding ข้ามหลักสูตรหรือ cycle พร้อม concurrent write | deny/rollback ไม่เกิด manifest ที่ข้ามรุ่นหรือหัวข้อวน                             |
| P24-03 | เปิดหน้าหลักสูตรและโครงบทเรียนของทั้ง9กลุ่ม                                      | label/วิชา/หัวข้อ/DEMO/source/review ครบจากบริการจริง ไม่ใช่9แถว Markdown          |
| P24-04 | ส่งข้อเขียนและปรนัยตามชนิด                                                       | ข้อเขียนรอผู้ตรวจ rubric ไม่เรียก objective scorer; เฉลยไม่รั่ว                    |
| P24-05 | แหล่ง/สิทธิ์/scan/reviewer ขาด หรือ creator approveเอง                           | deny publish; ไม่ถือ linkดาวน์โหลดคือสิทธิ์คัดลอก                                  |
| P24-06 | publication ก่อน/ตรง/หลัง cutoff วันไทย และ workerถอนสิทธิ์                      | current policy/window/actionบังคับจริง cacheไม่เก็บ private                        |
| P24-07 | attempt v1 → ออกv2/เปลี่ยนSubject label/บทเรียน/rubric                           | v1 refs/manifest/คะแนน/ต้นทางไม่เปลี่ยน ไม่ join latest                            |
| P24-08 | ถอนเนื้อหา/regrade revision/retryหรือconflict                                    | ปิดการเข้าถึงตามpolicy historyยังตรวจได้ ไม่แก้ audit/ส่ง eventซ้ำ                 |
| P24-09 | เปลี่ยน group/course/lesson/attemptID ในURL body query export job                | ไม่มี grantไม่อ่านเนื้อหาร่าง/เฉลย/ข้อมูลผู้เรียน; self scopeไม่ให้สิทธิ์ของคนอื่น |

app/schema0.6.0 Prisma7.10.0 Next16.3.8 migrationcore1ไม่เปลี่ยน ไม่มี model/migration/UI/attempt24เพิ่ม Gate: foundationและ23ต้องผ่านก่อนลงมือและรันกรณีนี้ ไม่เลื่อนไป25ด้วยผลตรวจเอกสาร
