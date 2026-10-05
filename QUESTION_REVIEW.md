# การตรวจคำถามและ CMS คลังข้อสอบ — บท 25

รุ่น0.1 | 4 ตุลาคม 2569 | sourceก่อนแก้ `2dfbe0d` | **Proposal / BLOCKED — ยังไม่มี question bank/CMS ที่ทำงานจริง**

อ่าน [QUESTION_BANK_CONTRACT](QUESTION_BANK_CONTRACT.md), [CURRICULUM_SCHEMA](CURRICULUM_SCHEMA.md), [LEARNING_CONTENT_POLICY](LEARNING_CONTENT_POLICY.md) และ [DATA_CLASSIFICATION](DATA_CLASSIFICATION.md) prerequisite24ยังไม่ผ่าน learningREADME-only ไม่มีmodels/attempt/network flowจริง เอกสารนี้เป็นขั้นตอนสำหรับพัฒนาต่อ ไม่ใช่คู่มือปุ่มหรือAPIที่เปิดใช้แล้ว

## 1 ขั้นทำงานและความหมายของรุ่น

คำถามหนึ่งรหัสมีหลายรุ่นได้ แต่แต่ละattemptต้องรู้ว่าใช้รุ่นไหน แยกคำถาม ตัวเลือก เฉลยและคำอธิบายออกจากDTOของผู้เรียน ไม่ส่งเฉลยให้browserแล้วหวังว่าซ่อนหน้าจอจะพอ ถอนเผยแพร่หมายถึงหยุดการใช้ตามpolicyปัจจุบัน ไม่ลบหลักฐานรุ่นที่ใช้แล้ว

สถานะเนื้อหาเสนอ draft → reviewing → returned/approved → scheduled/published → withdrawn ส่วนworkflowกลางเก็บ submitted/reviewing/returned/approved ตาม11 แยก availability/embargo จากผลอนุมัติ ไม่สร้างengineหรือCMSส่วนกลางอีกชุด ใช้contenteditorร่วมเมื่อ09พร้อมและdomain serviceของlearningควบคุมinvariants

| ขั้น             | ผู้กระทำเสนอและสิ่งที่ต้องตรวจ                                                                                         | ผลเสนอ                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| ร่าง             | authorมีaction/scopeจริงเลือกCourse/Groupจาก24 กำหนดPRACTICE/OFFICIAL/source/rights/difficulty/kind และแนบไฟล์ผ่าน10   | draftยังไม่public ไม่มีผลต่อattemptเก่า                                           |
| ส่งตรวจ          | creatorตรวจความครบตามชนิด pinchildversions/source/rights/manifestและexpected row_version                               | transactionworkflow/audit/outbox/receipt ไม่มีkeyในnotification                   |
| ตรวจ/ส่งกลับ     | reviewerบัญชีคนละคนกับcreator มีassignmentช่วงเวลาและกลุ่มที่ตรวจได้ ตรวจเนื้อหา/คำตอบหรือrubric/คำอธิบาย/TopicMapping | reason/evidenceและrevisionที่ตรวจ ถ้าเนื้อหาเปลี่ยนapprovalเก่าใช้ไม่ได้          |
| แก้หลังส่งกลับ   | authorเปิดrevisionร่างใหม่อ้างต้นทาง ไม่แก้snapshotที่reviewใช้                                                        | revalidation/resubmit ผู้ตรวจต้องเห็นdiffที่ได้รับgrant                           |
| รับรอง           | checkerไม่ใช่creator ตรวจsource/rights/ทุกส่วนและpolicygroup                                                           | sealversionและmanifest ป้องกันraceกับeditor; approvedไม่publicเอง                 |
| เผยแพร่/ตั้งเวลา | publisherมีpublishgrantที่แยกจากreview ทุกevidence/scan/rights/window/embargoครบ                                       | publishเฉพาะaudienceที่อนุญาต workerตรวจสิทธิ์ล่าสุด ไม่ให้OFFICIALลับเข้าpublic  |
| ถอน/แก้รุ่น      | ผู้มีwithdrawgrantให้เหตุผล/หลักฐานและimpactต่อattempt/ไฟล์/cache                                                      | availabilityevent+receipt/audit/outbox เก็บต้นฉบับ; ถ้าแก้เนื้อหาสร้างversionใหม่ |

ผู้กระทำตามหน้าที่เสนอ O03/C03/C02 ไม่ใช่ชื่อบุคคลที่แต่งตั้งแล้ว ขาดassignment/อำนาจ/evidenceให้deny ไม่ถือadminเทคนิคเป็นผู้ตรวจ และไม่ใช้Roleหลายชุดของผู้สร้างอนุมัติตนเอง

## 2 Checklistก่อนรับรอง

1. ตรงCurriculumรุ่น/ช่วงชั้น/ระดับธรรมศึกษา/Course/Topicและชนิดข้อ ไม่มีcrossgroupหรือTopicของCourseอื่น
2. stem/ตัวเลือก/คำอธิบายไม่ว่าง รูป/alttext/linksไม่แอบเปิดเฉลย ไม่มีactiveHTMLหรือunsafe embed จำนวน/ความซ้ำตัวเลือกตามpolicyที่ยืนยัน
3. objectiveมีcorrect-choice FKของข้อเดียวกัน SINGLEหนึ่งคำตอบ MULTIPLEตามpolicy; writingมีrubric/ผู้ตรวจ ไม่มีkeyแบบปรนัย และรอตรวจไม่เท่ากับคะแนน0
4. source/edition/filehash/pages/rights/attribution/reviewer/difficultyมีหลักฐานและรุ่น ไม่แปลงdownloadlinkเป็นlicense ไม่ให้webตัวอย่างเป็นแหล่งข้อสอบที่คัดลอกได้อัตโนมัติ
5. usage_kindกับreleaseclassificationชัดเจน: DEMO/PRACTICEติดป้ายก่อนผู้เชี่ยวชาญรับรอง OFFICIALยังembargoไม่มีpublicroute/filelabelหรือexportช่องทางแอบเปิด
6. seal manifestทั้งQuestion/Choice/KeyหรือRubric/Explanation/TopicMapping/source/policy ไม่อนุมัติเฉพาะstemแล้วใช้latest key Workerและexport/downloadตรวจcurrentaction/scope/fields/timeด้วย

คำถาม/ตัวอย่างในรอบนี้เป็นข้อเสนอ ไม่มีseedใหม่ ไม่มีข้อสอบจริงหรือkeyจริงเข้าrepository เกณฑ์คะแนน/จำนวนchoice/ความยาก/rubricทางการยังQ007/Q024 TO VERIFY ใช้configDEMOที่เจ้าของรับรองในการทดลองภายหลัง

## 3 ตรวจการรั่วเฉลยก่อนส่งคำตอบ

ผู้ตรวจระบบต้องใช้บัญชีผู้เรียนที่มีสิทธิ์เริ่มattemptจริง โดยสร้างopaque canaryที่มีเฉพาะKey/Explanation/hiddenrubric/solutionmedia และตรวจว่าไม่มีค่าเหล่านี้ก่อนsubmit ไม่ใช้keyชื่อfieldเพียงอย่างเดียว เพราะเฉลยอาจอยู่ในbody aliases filenames หรือmediaได้ Canaryเป็นข้อมูลสมมติและไม่publishบนGitHub

ตรวจ initialHTML/RSC/prefetch hydration payload, API/ServerAction responses, networkpreview/media/alttext, browserJS/sourcemaps/staticassets, search/export, cache/CDN/serviceworkerและerror/telemetryที่ผู้เรียนเข้าถึงได้ รวมanti-oracleจากgradepreviewก่อนsubmit ดูresponseทุกช่อง ไม่ตรวจเฉพาะDOM

จากนั้นเปลี่ยนquestion/choice/attemptID/กลุ่ม/องค์กร/URL/body/query/directRPC/Storageไปเรื่องอื่น และเรียกด้วยrevoke/expiredassignment ตรวจserver/DAL/RLS/fileACLปฏิเสธ ไม่มีleakจากerror/detail/count/facet โหลดหน้าใหม่ย้อนcacheและdownloadURLด้วย

การsubmitผ่านserverต้องcommitก่อนfeedbackcheck Retryได้receiptเดิมตามidempotency ไม่ให้client setsubmittedหรือส่งชื่อเฉลยเพื่อunlock หากหลังsubmitยังไม่มีfeedbackpolicy/rights/releaseให้ตอบสถานะที่ปลอดภัย ไม่ส่งrawAnswerKey ผู้ตรวจที่มีgrantอ่านkeyในprivateCMSได้โดยไม่ทำให้learnerDTOมีkey

## 4 ถอนเผยแพร่และทดสอบประวัติ

เก็บprivate manifestก่อนเริ่มattempt v1: curriculum/blueprint/question/choiceorder/key-or-rubric/Explanation/topic/source-fileversion/hash/policy/เวลา/receipt ออกv2หรือถอนv1แล้วอ่านผ่านcurrentpolicyที่อนุญาตต้องยังหาต้นทางv1ได้ ไม่ใช้จำนวนrowอย่างเดียวพิสูจน์history

การถอนต้องหยุดเริ่มใหม่ตามcurrentgateและจัดattemptที่กำลังทำตามpolicyที่รับรอง ถ้ายังขาดpolicyไม่อ้างทำต่ออัตโนมัติหรือgradeหลังถอนตามสิทธิ์เก่า Receipt/audit/eventไม่ซ้ำเมื่อretry แก้คะแนนเป็นrevisionใหม่ตาม24 ไม่updateคำตอบหรือคะแนนเดิมเงียบๆ ไม่มีผลสอบทางการถูกแก้

ไม่เอาmanifest/key/เนื้อหาลับ/คำตอบเต็ม/logส่วนตัวไปpublicrepoหรือexportแก่ผู้ไม่มีgrant เนื้อหาที่ถูกถอนยังมีหลักฐานต้นทางได้แต่ไม่จำเป็นต้องเปิดbodyให้ผู้เรียนเสมอ retention/legalhold/purposeต้องQ016รับรอง

## 5 กรณีเตรียมตรวจรับ — ทั้งหมด NOT RUN

| Case   | ทำซ้ำเมื่อdependencyพร้อม                                                 | ผลที่ต้องassert                                                                               |
| ------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| P25-01 | ข้อสมมติทั้ง9คู่/kind/difficulty/TopicMapping และmapข้ามCourse/Group      | ถูกscope/typedFK/configพร้อม ผิดให้deny ไม่อนุมานนักธรรมเป็นธรรมศึกษา                         |
| P25-02 | blankstem/choiceซ้ำ/ผิดจำนวน/keychoiceข้ามข้อ/ไม่มีExplanation            | draftเก็บได้ตามpolicy แต่submit/seal/publishไม่ผ่าน objectiveconstraintจริง                   |
| P25-03 | writingไม่มีrubric/grader/มีobjectivekeyหรือเรียกobjective scorer         | deny/awaitingmanualแยกจาก0 ไม่ใช้ปรนัยแทนข้อเขียน                                             |
| P25-04 | ผู้สร้างreview/approveเอง/ไม่มีrightsหรือsource/scanpending               | deny; public/preview/downloadยังปิด                                                           |
| P25-05 | authorแก้Choice/Key/Explanationระหว่างreviewหรือseal พร้อมparallelwrites  | optimisticconflict/rollback ไม่มีอนุมัติmanifestผสมรุ่น                                       |
| P25-06 | published v1แก้stem/key/topic/source และสร้างv2                           | denyแก้v1 สร้างv2พร้อมreviewใหม่ attemptv1ไม่เปลี่ยน                                          |
| P25-07 | learnerก่อนsubmitเปิดnetwork/HTML/RSC/JS/media/search/export/error/caches | ไม่มีcanary/เฉลย/solutionและanti-oracleทุกช่องตามข้อ3                                         |
| P25-08 | submittedปลอม/retry/feedbackไม่มีpolicy/คนอื่นหรือofficialembargo         | serverstate/receipt/owner/releaseบังคับไม่เปิดkeyก่อนส่งหรือเปิดข้ออื่นหลังส่ง                |
| P25-09 | OFFICIALembargo/time/rightswindow/เปลี่ยนusagekind/publicfile/metadata    | denyจนอำนาจ/วันเปิดใช้/purposeผ่าน ไม่อ้างpublishedคือpublic                                  |
| P25-10 | withdrawv1ก่อนและหลังstart/submit ออกv2แล้วค้นprivatehistory              | หยุดใช้ใหม่ตามpolicy v1manifest/filehash/evidenceยังอยู่ currentgrantไม่ถูกข้าม ไม่joinlatest |
| P25-11 | withdraw/publishworkerหยุด/retry/leaseเก่า/revokeหรือหมดassignment        | effect/outbox/receiptไม่ซ้ำ currentgrant/versionตรวจใหม่                                      |
| P25-12 | crossscopeID/directRPC/Storage/export/download/retentionwithdrawal        | ไม่มีprivate/key/existenceoracleนอกgrant auditไม่มีsecretหรือrawคำตอบ                         |

ไม่มีexecutabletests/CMS/endpointของ25 `corepack pnpm test` เดิมไม่รันกรณีP25นี้ ต้องสร้างintegration/network/browser/nativePGtestsจริงเมื่อ24ผ่าน ไม่สร้างmockALLOWหรือskiptestsเพื่อประกาศเกณฑ์ผ่าน

## 6 สถานะและการส่งต่อ

เกณฑ์ผู้เรียนเปิดnetworkไม่พบเฉลยก่อนส่ง **NOT RUN / BLOCKED** เกณฑ์withdrawแล้วattemptเดิมมีหลักฐานรุ่น **NOT RUN / BLOCKED** ไม่ใช้privateDBdesignหรือMarkdown12casesแทนผลจริง

schema/app0.6.0 Prisma7.10.0 Next16.3.8 core19models/213scalarfields/migration1ไม่เปลี่ยน Q007หลักสูตร/rights/rubric/difficulty Q005/Q006reviewpublishwithdrawauthority Q008/Q025public/officialembargo/feedback Q016retention Q017windows Q023/Q011DAL/RLS/files/workflow/worker Q024choicekeys/rubric/manualgrading/manifestbindingยังเปิด

ต้องปิด24และdependencyเดิมก่อนimplementation25 แล้วรัน P25-01–12พร้อมหลักฐาน ไม่มีproduction/schema/seedเปลี่ยน ไม่เลื่อนไป26จากเอกสาร

## 7 ผลตรวจเอกสารรอบนี้

| คำสั่ง/วิธี                                                                                                                                         | ผลจริง                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Python inlineอ่านตารางmodel/case IDs/links/schema/package/migrationhash                                                                             | PASS: 7model contractsแบบเสนอ, 12case IDsไม่ซ้ำ, 40local linksไม่ขาด; core19models/213scalarfields/migration1/checksumเดิม learningREADME-only ไม่มีquestion/attemptmodels |
| `corepack pnpm exec prettier --ignore-path /dev/null --check docs/QUESTION_BANK_CONTRACT.md docs/QUESTION_REVIEW.md src/modules/learning/README.md` | PASS เฉพาะ3ไฟล์ที่ระบุ                                                                                                                                                     |
| `git diff --check`, `git diff --cached --check` และ `corepack pnpm secrets:check`                                                                   | PASS ไม่มีwhitespaceerrorหรือรูปแบบsecretที่ตัวตรวจรองรับ ไม่ใช่รับรองความปลอดภัยครบ                                                                                       |
| network/HTML/RSC/JS/cache/CMS/nativeFK/withdrawhistory                                                                                              | NOT RUN ไม่มีimplementationและ24ยังBLOCKED                                                                                                                                 |

migration SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน ไม่รันunit/lint/typecheck/build/SQLWASM/nativeDB/environmentprobeใหม่ ไม่มีข้อสอบ/เฉลยจริงเข้าGit ผลตรวจMarkdownนี้ไม่พิสูจน์ว่าlearnernetworkไม่รั่วหรือattemptรุ่นเก่าคงครบ
