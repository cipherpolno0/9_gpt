# สัญญาคลังข้อสอบและรุ่นคำถาม — บท 25

รุ่น 0.1 | 4 ตุลาคม 2569 | source ก่อนแก้ `2dfbe0d` | **Proposal / BLOCKED**

บท24ยังไม่ผ่านตาม [CURRICULUM_SCHEMA](CURRICULUM_SCHEMA.md) learningมีREADMEเท่านั้น ไม่มีQuestionVersion/CMS/attempt engine เอกสารนี้เป็น logical contract ไม่ใช่ Prisma schemaหรือmigrationที่รันได้ ดูขั้นตรวจใน [QUESTION_REVIEW](QUESTION_REVIEW.md) ไม่สร้างระบบบัญชี เอกสาร workflow หรือผลสอบทางการอีกชุด

## 1 แยกชนิดข้อและการเผยแพร่

question_kind เสนอ SINGLE_CHOICE / MULTIPLE_CHOICE / WRITING แยกจาก usage_kind = PRACTICE / OFFICIAL และ confidentiality/release policy ข้อOFFICIALอาจเป็น archiveที่อนุญาตเผยแพร่ หรือข้อสอบจำกัดเฉพาะผู้ได้รับมอบหมาย/ยัง embargo ไม่ใช้ boolean publishedตัวเดียวแทนสิทธิ์และวันเปิดใช้

PRACTICEต้องติดป้ายคะแนนฝึก ไม่ใช้ผลเป็น SubjectScore/ResultReleaseระบบ5 OFFICIALต้องมีอำนาจ/แหล่ง/รุ่น/หลักฐานสิทธิ์และวันเปิดใช้ที่ยืนยัน ไม่เปลี่ยนประเภทหรือห่อเอกสารลับเป็นแบบฝึกเพื่อเปิดpublic ไม่คัดลอกข้อสอบจากเว็บตัวอย่างหรือแหล่งบท24ที่ยังไม่ได้สิทธิ์

ข้อเขียนใช้ RubricVersion และผู้ตรวจ ไม่ใช้correct_choiceหรือanswer_keyแบบปรนัย อาจมีคำแนะนำการเขียนที่ให้ผู้ตรวจใช้ แต่ไม่เปิดเป็นเฉลยก่อนส่งคำตอบโดยอัตโนมัติ ไม่กำหนดจำนวนตัวเลือก/คะแนนผ่าน/จำนวนหน้าข้อเขียนทางการเอง

## 2 ต่อแบบบท04อย่างชัดเจน

DATA_DICTIONARY04มี question_version.options jsonb, AnswerKey.correct_answer/rubric jsonb และ manual_grading.answer_key_id แต่ไม่มี Choice/Explanation/TopicMapping ตารางจริง รอบนี้เสนอ normalized Choice และ correct-choice FK สำหรับปรนัย แยก RubricVersionสำหรับข้อเขียน ไม่สร้าง representationของตัวเลือกอีกชุดที่เขียนได้พร้อมกัน

เมื่อพร้อม implementation ต้องแก้ dictionary/ERD/ADR/migration ให้ optionsเดิมเป็นderived representationหรือเลิกใช้ ไม่เก็บ JSONกับChoiceสองชุดที่ขัดกันได้ และต้องปรับ manual_gradingจากAnswerKeyFKเดิมให้ตรึง RubricVersionที่ถูกชนิด ไม่อ้างว่าแบบ04รองรับการแยกนี้ครบแล้ว

## 3 Models และข้อบังคับเสนอ

ทุก PK ใช้ UUID, ชื่อ modelอ่านเข้าใจและ map snake_case, FK RESTRICT, private schema ENABLE/FORCE RLS และ limited server write path ทุก versionมี version_no>=1, recorded_at timestamptz, creator_account_idจากบัญชีกลาง, row_version>=1, source/rights/review refs, content_hash, supersedes_id และ policy_version_id ไม่ใช้ServiceActorแทนผู้สร้างหรือผู้ตรวจที่ยังไม่มี User model

| Model → ตารางเสนอ                   | ฟิลด์เฉพาะขั้นต่ำ                                                                                                                                                                                                                          | ความสัมพันธ์/ข้อบังคับ                                                                                                                                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| QuestionVersion → question_version  | course_id UUID, question_code text, version_no int, question_kind text, stem text, difficulty_reference_id UUID, usage_kind text, confidentiality_reference_id UUID, content_status text, source_evidence_id UUID, rights_evidence_id UUID | unique(course_id,question_code,version_no), unique(id,course_id); CourseตรึงCurriculumและLearningGroupจาก24 ห้ามclientส่งกลุ่มอื่นทับ; difficultyอ้างconfigมีรุ่น ไม่เดารหัสทางการ; supersedesต้องcourse/question_codeเดียวกัน                         |
| Choice → choice                     | question_version_id UUID, choice_code text, body text, display_order int, safe_media_file_version_id UUID nullable                                                                                                                         | unique(question_version_id,choice_code), unique(id,question_version_id), unique(question_version_id,display_order); ไม่เก็บis_correct/คะแนน/คำอธิบายเฉลยในChoice; mediaผ่านscan/purposeACL                                                             |
| AnswerKey → answer_key              | question_version_id UUID, grading_policy_version_id UUID, max_score numeric(10,4)                                                                                                                                                          | unique(question_version_id), unique(id,question_version_id); objectiveเท่านั้น ใช้versionของคำถามเดียวกัน ไม่เปิดตารางให้learner; max_score/precisionตามconfigที่รับรองและปฏิเสธNaN/Infinity/scaleเกินก่อนcast                                         |
| AnswerKeyChoice → answer_key_choice | answer_key_id UUID, question_version_id UUID, choice_id UUID                                                                                                                                                                               | FK(answer_key_id,question_version_id)→AnswerKey(id,question_version_id), FK(choice_id,question_version_id)→Choice(id,question_version_id); unique(answer_key_id,choice_id); กันcorrect-choiceของข้ออื่น ไม่เก็บarbitrarychoiceIDsในJSONแทนFK           |
| RubricVersion → rubric_version      | question_version_id UUID, rubric_code text, version_no int, criteria jsonbตามschemaที่รับรอง, max_score numeric(10,4), review_decision_id UUID                                                                                             | unique(question_version_id,rubric_code,version_no), unique(id,question_version_id); WRITINGเท่านั้น; rubricต้องpin criteria/คะแนน/ผู้ตรวจ configกำหนดactive rubricเมื่อseal ไม่เลือกlatestตอนgrade                                                     |
| Explanation → explanation           | question_version_id UUID, explanation_code text, version_no int, body text, source_evidence_id UUID, rights_evidence_id UUID, feedback_policy_version_id UUID                                                                              | unique(question_version_id,explanation_code,version_no), unique(id,question_version_id); ถือsensitiveจนfeedback grantผ่าน อาจมีเฉลยในbody จึงห้ามincludeกับstem หรือค้นในpublic search                                                                 |
| TopicMapping → topic_mapping        | question_version_id UUID, topic_id UUID, course_id UUID, mapping_kind_reference_id UUID, mapping_evidence_id UUID                                                                                                                          | compositeFK(question_version_id,course_id)→QuestionVersion(id,course_id), FK(topic_id,course_id)→Topic(id,course_id); unique(question_version_id,topic_id); จำนวนprimary/weight/multiple topicsตามconfigไม่เดา ต้องอยู่Course/Curriculum/Groupเดียวกัน |

source_evidence/rights/reviewเป็นtyped contractกลางที่ยังต้องผูก Document/FileVersion/Workflowจริง ไม่ยอมให้UUIDคนละชนิดหรือDocumentmetadataแทนไฟล์ผ่านscan Content/Choice/Key/Rubric/Explanation/TopicMappingต้อง sealร่วมเป็นชุดโดย manifestที่เก็บhashและUUIDของทุกส่วน ไม่อ้างversionคำถามอย่างเดียวแต่ไปอ่านExplanation/rubric latest

public/effective windowsใช้ publish_from/publish_until และ embargo_until timestamptz nullable [from,until) เก็บค่ามาตรฐานและแสดง พ.ศ./AsiaBangkok วันรับรองไม่เท่ากับวันเปิดใช้ timezoneตามclientไม่ใช้ตัดสินสิทธิ์

## 4 ความครบตามชนิด

| ตรวจ                                              | Objective                                                                                           | Writing                                                                              |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| stem/กลุ่ม/course/source/rights/difficulty/review | nonblank/sanitized/groupตรง manifest ทุกส่วนครบ                                                     | เช่นเดียวกันและคำสั่งเขียนชัด                                                        |
| Choice                                            | code/orderไม่ซ้ำ เนื้อหาไม่ว่าง/ไม่ซ้ำตามnormalizationที่รับรอง จำนวนตามdemo/officialconfig         | ไม่มีChoiceหรือcorrect-choiceแบบปรนัย                                                |
| Key/rubric                                        | SINGLEถูกหนึ่งchoice; MULTIPLEจำนวนถูกตามpolicyและเป็นsubsetของchoiceข้อนั้น ไม่ใช้หลักฐานจากclient | มีrubricตรึงครบ criteria/maxscore/ผู้ตรวจที่มอบหมาย ไม่มีAnswerKeyแบบobjective       |
| Explanation                                       | มีคำอธิบายพร้อมsource/versionที่ตรวจได้ เก็บในsensitiveprojection                                   | มีguidance/เกณฑ์อธิบายสำหรับผู้ตรวจ และfeedbackตามpolicy ไม่บังคับให้เป็นคำตอบตายตัว |
| readiness                                         | draftอาจยังไม่ครบ แต่submit/review/seal/publishต้องผ่านvalidation                                   | รอตรวจไม่ใช่คะแนน0 ขาดrubric/graderไม่autoผ่าน                                       |

FKอย่างเดียวไม่บังคับจำนวนkey/ชนิดข้ามตารางทั้งหมด ต้อง validationในtransactionพร้อมlock question revision/children และปิดทางเขียนที่ข้ามservice ตรวจnativeconcurrencyก่อนอ้างผ่าน ผู้แก้Choiceพร้อมผู้รับรองต้องได้conflict ไม่ sealชุดครึ่งเก่าใหม่

ดัชนีเสนอเฉพาะunique keysและ queryหลัก: QuestionVersion(course_id,content_status,usage_kind), TopicMapping(topic_id,question_version_id), publicationwindowเมื่อมีqueryจริง ต้องEXPLAINก่อนขยาย ไม่indexทุกfieldหรือsearchExplanation/AnswerKeyผ่านสิทธิ์อ่านคำถาม

## 5 Server projections แยกจาก storage

สิทธิ์เริ่มattemptไม่ได้สิทธิ์อ่านAnswerKey/Rubric/Explanationโดยตรง ใช้question serviceเลือกDTOใหม่จากallowed fields ก่อนserialization ไม่spread ORM entityหรือส่งkeyแล้วซ่อนด้วยCSS/encryptionฝั่งbrowser ข้อมูลคนละattempt/group/organizationให้denyตามcurrentgrantก่อนโหลดcount/filter

| Projectionเสนอ             | ฟิลด์ยอมให้มีเมื่อgrantผ่าน                                                                                                | ห้ามมี                                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LearnerQuestionDTO ก่อนส่ง | opaque attempt_item_ref, stem, question_kind, choices[{choice_ref,body,display_order}], permittedpromptmediaที่ผ่านgateway | is_correct, correct-choice/keyIDs, rubricที่เผยคำตอบ, Explanation, gradinglogic/scoreweightsที่เผยคำตอบ, sensitive sourcepath/filename/hash, privateobjectkey |
| FeedbackDTO หลังส่ง        | receipt/status และfeedbackที่feedbackpolicyอนุญาตเฉพาะเจ้าของattempt/ผู้ตรวจ เช่นคำแนะนำผ่านการรับรอง                      | ไม่คืนAnswerKeytableทั้งแถว ไม่เปิดข้ออื่น/attemptที่ยังไม่submitted ไม่เปิดofficialembargoเพราะส่งคำตอบแล้ว                                                  |
| ReviewerDTO                | stem/choices/KeyหรือRubric/Explanation/topic/source/rights refsที่ได้รับreviewgrantเฉพาะเรื่อง                             | secret credentials/ข้อมูลผู้เรียนเต็มชุดหรือofficialcontentนอกassignment                                                                                      |

LearnerQuestionDTOเป็นprivate authenticated attempt response ไม่ใช่เพิ่มfieldให้curriculum_publicเดิม คลังpublicมีเฉพาะเนื้อหาที่release/purposeอนุญาต และยังไม่มีapprovedpublicquestionDTO; denyจนQ007/Q008/Q025และpublicationcontractรับรอง Media/alttext/captions/sourceURLs/topiclabelsก็ต้องไม่มีคำตอบแฝง

เก็บ server-only moduleและDALกลาง ไม่import key loaderในclient component แม้keyอยู่DBprivateก็ไม่รับรองว่าHTML/JS/APIไม่รั่วจนตรวจbuild/networkจริง No-storeสำหรับattempt/key/review responsesและป้องกัน sharedcache/log/telemetry/sourcemap/prefetch/RSC leaks ห้ามgrade-preview/validatechoice endpointก่อนsubmitกลายเป็นoracleเฉลยผ่านถูกผิด/คะแนน/เหตุผล

## 6 การถอนเผยแพร่และหลักฐานเดิม

Published/ถูกreferencedแล้วห้ามแก้stem/choices/key/rubric/Explanation/topic/sourceของรุ่นเดิม สร้างQuestionVersionใหม่และreview/sealใหม่ Attemptเดิมตรึงmanifest/choiceorder/QuestionVersion/KeyหรือRubric/Explanation refsที่อนุญาต และhashตาม24 ไม่มีON DELETE CASCADEหรือjoinlatest

withdrawalเปลี่ยนavailability/readpolicyและบันทึกเหตุการณ์ใหม่ ไม่delete/rewriteรุ่นเก่าหรือaudit หยุดใช้เริ่มattemptใหม่ทันทีตามserver gate การรับมือattemptที่เริ่มก่อนถอน (จบต่อ/พัก/ยกเลิก) เป็นversioned policyที่ต้องรับรอง ถ้ายังไม่มีpolicyให้ไม่resume/submit/gradeอัตโนมัติและเข้าคิวตรวจที่ได้รับมอบหมาย เก็บเหตุผลสถานะที่ปลอดภัย/หลักฐานเดิม การมีrefs/hashไม่ได้ให้สิทธิ์ผู้เรียนเปิดข้อที่ถูกถอน

Correctionคะแนนใช้grading revisionที่มีเหตุผล/หลักฐาน/ผู้ตรวจและapproval ไม่เปลี่ยนคะแนนpracticeไปผลสอบทางการ รวมwithdraw/audit/outbox/receiptในtransaction idempotent และตรวจversion/currentauthorityเมื่อworker retry ไม่อ้างการเพิกถอนsigned URLเก่าทันทีสำหรับfileที่ไม่ได้ผ่านgateway

app/schema0.6.0 Prisma7.10.0 Next16.3.8 core19models/migration1ไม่เปลี่ยน ข้อเสนอทั้งหมดต้องปรับschema/ADRและตรวจจริงเมื่อ24/foundationผ่าน ไม่เพิ่มmigration/seedหรือassessmentengineในบทเตรียมนี้
