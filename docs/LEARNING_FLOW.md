# ก่อนเรียน → บทเรียน → หลังเรียน — บท 27

รุ่น 0.1 | 4 ตุลาคม 2569 | source ก่อนแก้ `997445a` | **Proposal / BLOCKED — ยังไม่มี learning pages/progress services**

บท26ยังไม่ผ่านตาม [PRETEST_FLOW](PRETEST_FLOW.md) และ [PRETEST_AUTOSAVE](PRETEST_AUTOSAVE.md) learningมีREADMEเท่านั้น ไม่มีpretest/lesson/progress/authzจริง เอกสารนี้เป็นสัญญาสำหรับพัฒนาต่อ ไม่ใช่หน้าเว็บหรือAPIที่เปิดใช้แล้ว อ่านร่วม [CURRICULUM_SCHEMA](CURRICULUM_SCHEMA.md), [QUESTION_REVIEW](QUESTION_REVIEW.md) และ [LEARNING_CONTENT_POLICY](LEARNING_CONTENT_POLICY.md)

## 1 ลำดับที่ผู้เรียนต้องผ่าน

1. เลือกหนึ่งใน9คู่ที่มีสิทธิ์และเริ่มpretestผ่านAttemptกลางของ26 ผู้เรียนจากUser-Person binding/enrollmentที่serverยืนยัน ไม่รับownerจากbrowser
2. หลังservercommit pretest submittedของenrollment/Curriculumรุ่นนั้น ให้เข้าเนื้อหาบทเรียนตามcurrentpublication/grant แม้ข้อเขียนยังรอตรวจอาจเรียนbaselineต่อได้ตามpolicy ไม่ถือawaitingmanualเป็นคะแนน0หรือสร้างคำอธิบายข้อผิดจากผลที่ยังไม่มี
3. แสดงบทเรียนตามLearningPlanRevisionที่มีหลักฐานพร้อม แต่แยกจากLearningRequirementSetที่กำหนดกิจกรรมrequiredก่อนposttest แผนแนะนำไม่ได้เพิ่มสิทธิ์หรือลดrequiredเอง
4. ทำกิจกรรมและบันทึกprogress/evidenceผ่านserver กลับมาเรียนต่อได้จากcheckpointที่ยืนยัน แก้คำตอบ/ส่งซ้ำตามrevision/receipt ไม่ประกาศจบจากหน้าเว็บค้าง
5. backendเปิดโอกาสposttestเมื่อpretest/requiredactivities/อำนาจและรุ่นที่เกี่ยวข้องผ่านทั้งหมด ตรวจซ้ำในtransactionที่เริ่มposttest ไม่ใช้readyflag/tokenจากหน้าบทเรียนแทนpolicy

คะแนนpre/post/practiceเป็นข้อมูลการเรียนรู้ ไม่ใช่SubjectScore/ResultReleaseของระบบ5 บท27ออกแบบguardที่posttestต้องเรียก แต่ไม่สร้างposttest engine/ข้อสอบหลังเรียน/ผลทางการล่วงหน้า

## 2 ประตูฝั่งserver

| Gateเสนอ             | เงื่อนไขจากข้อมูลserver                                                                                                                 | เมื่อไม่ผ่าน                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| PRETEST_REQUIRED     | currentactor/selfหรือassignedteachergrant/activebinding/enrollment/Curriculumมีสิทธิ์ แต่ไม่มีpretest PRE ที่submittedจริงของcontextนี้ | ปิดการเริ่มpersonal lessonflow/posttest แสดงวิธีเริ่มpretest; publicpreviewเป็นคนละpolicy ไม่ถือpreviewทำกิจกรรมครบ |
| LEARNING_IN_PROGRESS | pretestถูกsubmitจริงและpublication/rights/requirementsetผ่าน มีrequiredactivityที่ยังไม่ครบ                                             | อ่านบทที่มีสิทธิ์/ทำต่อได้; postteststartให้409เหตุผลปลอดภัย ไม่มีเนื้อหาผู้เรียนอื่น                               |
| POSTTEST_READY       | currentgrant+samecurriculumpins+required evidenceทุกข้อผ่าน+pretestgradingถ้าpolicyต้องการ+posttestopportunityพร้อม                     | เป็นreadinessจากserver ไม่ใช่grantถาวร startต้องตรวจซ้ำ                                                             |
| POLICY_NOT_READY     | requiredpolicy/lesson/rubric/rights/withdrawaladapterไม่พร้อมหรือpretestcontinuationยังไม่รับรอง                                        | denyการปลดล็อก แสดง“ยังประเมินเงื่อนไขไม่ได้” ไม่count0ว่าเรียนครบ                                                  |
| ACCESS_DENIED        | revoke/suspend/assignmentหมด/bindingผิด/enrollmentนอกscope                                                                              | ไม่คืนprogress/checkpoint/feedbackหรือไฟล์ แม้เคยเรียนจบ                                                            |

startPosttestเสนอให้เป็นguardใน shared attempt-start serviceที่phase=POST ไม่ใช่ตรวจเฉพาะGETหน้าหรือRouteHandler หน้าจอ ServerActions jobs directRPCและStorageต้องมีpolicyตรงกัน limitedDBwrite pathห้ามข้ามguard หากbodyเปลี่ยนphase PRE→POST ยังต้องderivephase/contextจากBlueprintจริง

transactionเริ่มposttest lock enrollment/requirementset/currentprogress/opportunityตามลำดับที่ใช้ร่วมกัน ตรวจpretestfinalized/กิจกรรมที่ต้องครบ/currentversions แล้วสร้างattempt/receipt/audit/outboxร่วมกัน Uniqueโอกาสสอบตาม26ป้องกันstartหลายtab Stateที่เปลี่ยนระหว่างreadinessกับstartให้conflict/deny ไม่อ้างreadinessเก่าหรือlastclientprogress

## 3 ข้อมูลprogressและหลักฐานที่เสนอ

ใช้LearningEnrollment/Person/User/Organization/LessonVersion/Document/Workflowกลาง ไม่สร้างทะเบียนผู้เรียนอีกชุด ต่อยอด learning_progress04 unique(enrollment_id,lesson_version_id) บันทึกเวลาเป็นค่ามาตรฐาน แสดงพ.ศ./AsiaBangkok และFK RESTRICT/private ENABLE-FORCE RLS

| Concept/modelเสนอ        | ฟิลด์เฉพาะ/ความสัมพันธ์                                                                                                                                    | ข้อบังคับ                                                                                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LearningRequirementSet   | enrollment_id,curriculum_id,pretest_attempt_id,manifest_hash,requirement_policy_version_id,revision_no,recorded_at                                         | pincurriculum/lesson/activity/ทางเลือกและrequiredslotsจากpolicy; pretestเป็นของenrollmentนี้ unique(enrollment,revision_no); ไม่ใช้LessonPlan suggestionsหรือlessoncountล่าสุดเป็นrequirements |
| LessonActivityVersion    | lesson_version_id,activity_code,version_no,kind,completion_rule_version_id,alternative_group_ref nullable,requiredslot_ref                                 | unique(lesson_version,activity_code,version_no); kind TEXT/IMAGE/MEDIA/PRACTICE/WRITING_REFLECTIONตามกิจกรรม; policy/evidenceทางเลือกที่เทียบเท่าต้องมีรุ่น ไม่ผูกmediaดูครบเป็นกฎทุกกิจกรรม   |
| LearningProgress         | enrollment_id,lesson_version_id,requirementset_ref,progress_status,row_version,last_confirmed_at,last_attempt_id                                           | ขยาย04เมื่อพร้อม; servercompute not_started/in_progress/completedจากacceptedactivityevidence; lesson/enrollmentตรงcurriculumและlast_attemptของenrollmentเดียว ไม่รับcompletedจากclient         |
| ActivityEvidenceRevision | progress_id,requirementset_ref/manifest_hash,activity_version_id,revision_no,operation_id,accepted_at,evidence_refs/result_refs,completion_rule_version_id | append-only/private unique(progress,activity,revision_no); receipts/revisionCASตาม26 กิจกรรมpracticeใช้Attemptกลาง PRACTICEและsnapshotจาก25 ไม่มีrawคำตอบในaudit                               |
| ResumeCheckpoint         | progress_id,checkpoint_code,activity_version_id,revision_no,server_confirmed_at                                                                            | unique(progress_id)สำหรับcurrentcheckpoint; revisionhistory/retentionตามpolicy Checkpointเป็นตำแหน่งกลับมา ไม่เป็นหลักฐานจบหรือgrantใหม่                                                       |

แบบ04ยังไม่มีrequirementset/activity rules/evidence/checkpoint bindings ต้องปรับdictionary/ERD/ADR/migrationก่อนimplementation ไม่ใช้progress_statusเดิมพิสูจน์ความครบทั้งหมด Curriculumใหม่เปลี่ยนmanifest/requiredกิจกรรมต้องrevisionและapproved transition ไม่ย้ายprogressข้ามรุ่นเงียบๆ ไม่ให้regradepretestเปลี่ยนrequiredsetที่ใช้อยู่โดยไม่มีpolicyและบันทึกผลกระทบ LearningProgress.statusเป็นcurrentprojectionที่ต้องประเมินกับrequirementset/policyนั้น ไม่อ่านcompletedเดี่ยวๆ ทุกacceptedActivityEvidenceตรึงrequirementset/manifest/ruleเพื่อสร้างผลย้อนหลังโดยไม่อ่านparentที่เปลี่ยนไปแล้ว

จะมีหลายrequirementsetsหรือactive revisionเดียว/การยกเว้น/alternate activity ให้ใช้naturalkeysและpolicyที่เจ้าของรับรอง Q007/Q024 ไม่เลือกcurrentlatestเอง requirementsetของflow27ต้องมีrequiredslotอย่างน้อยหนึ่งที่เป็นบทเรียน/กิจกรรมตามflowผู้ใช้ ถ้าsetว่างหรือpolicyไม่พร้อม ให้POLICY_NOT_READY ไม่ปลดล็อกแบบvacuous all-of-empty

## 4 เนื้อหาและเงื่อนไขเรียนจบ

| กิจกรรม            | เนื้อหา/การเข้าถึงที่ต้องเตรียม                                                                      | หลักฐานจบเสนอที่ต้องconfig                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| TEXT               | หัวข้อไทยอ่านง่ายแบ่งช่วง ตัวอย่างDEMO/source/versionชัด ไม่มีactiveHTML                             | การยืนยันอ่าน/ทบทวนพร้อมreflectionหรือกิจกรรมตรวจตามpolicy; selfackเป็นคำยืนยันตน ไม่อ้างพิสูจน์เข้าใจด้วยเวลาเปิดหน้า                   |
| IMAGE              | alttextมีความหมาย/คำอธิบายยาวเมื่อจำเป็น ภาพมีrights/scan/privategatewayตามpurpose                   | กิจกรรมเกี่ยวกับภาพหรือทางเลือกข้อความที่equivalentได้รับอนุมัติ ไม่บังคับดาวน์โหลดภาพเป็นหลักฐานเรียนรู้                                |
| MEDIA              | captions/transcriptและคำอธิบายภาพ/เสียงตามเนื้อหา ควบคุมหยุด/เล่น ไม่autoplayมีเสียง ทางเลือกข้อความ | reflection/แบบฝึกหรือalternativeactivityตามrule ดูtimeupdate/scroll/heartbeatเป็นtelemetryไม่trusted proofว่าดูหรือเรียนรู้จริง          |
| PRACTICE           | ข้อย่อยreviewed/pinnedpracticeจาก25 ไม่officialembargo Feedbackตามpolicyหลังsubmit                   | serverยืนยันsubmit/evaluationตามrule คะแนนเต็ม/ผ่าน/จำนวนครั้งยังTO VERIFY ไม่รับคะแนนclientหรือใช้posttestเพื่อชดเชยบทเรียนที่ยังไม่ครบ |
| WRITING_REFLECTION | formlabels/คำสั่งและrubric/ผู้ตรวจเมื่อจำเป็น เก็บคำตอบprivateไม่ในpublicbody                        | acceptedsubmissionหรือmanualreviewตามpolicy รอตรวจแยกจาก0 หากruleต้องreviewยังไม่completed ห้ามใช้objective scorerแทนข้อเขียน            |

completionruleมีรุ่น/owner/evidenceและrequired/optional/alternativegroups กิจกรรมoptionalไม่ควรถูกนับเป็นrequiredโดยบังเอิญ และทางเลือกต้องเทียบrequiredslotเดียวกัน ไม่ใช้ORกับกิจกรรมที่ไม่เกี่ยวข้องเพื่อปลดล็อก เวลาการใช้งานclientเปลี่ยนได้จึงไม่ยืนยันmastery จากstatus completedต้องอธิบายว่า“ทำกิจกรรมตามเงื่อนไขครบ” ไม่ใช่รับรองความรู้หรือผลสอบทางการ

บทเรียนที่แนะนำจากข้อผิด pretestใช้Question/Explanation/TopicMappingรุ่นที่pretestตรึงและgradingที่ยืนยันแล้ว เฉพาะself/teacherและfeedbackpolicy25ผ่าน หากkey/rights/officialreleaseไม่อนุญาตให้คำแนะนำหัวข้อแบบไม่เผยเฉลย ไม่ฝังfeedbackส่วนตัวในLessonVersion.body_thหรือpubliclessonDTOที่ทุกคนอ่านได้

บทเรียนจริงทุกวิชา/กลุ่มต้องsource/rights/reviewer/ช่วงเผยแพร่ตาม24–25 ตัวอย่างprototypeเป็นDEMO ไม่คัดลอกหนังสือ ข้อสอบ หรือกฎเรียนจบทางการที่ยังไม่ได้หลักฐาน

## 5 เส้นทางและบริการเสนอ — ยังไม่มีจริง

| Route/commandเสนอ                                      | บริการและสิ่งที่ต้องตรวจ                                                                                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET /app/learning/{curriculum_ref}/lessons             | lessonJourney.read: currentactor/enrollment/pretestsubmitted/requirementsetและpublishedsafecontent แสดงบทที่ต้องทำกับแนะนำแยกกัน                             |
| GET /app/learning/lessons/{lesson_ref}                 | lesson.read: currentcontentgrant/rights/window/withdrawal/manifest; publicpreviewไม่มีpersonalprogressหรือactivityreceipt                                    |
| GET /api/learning/progress/{enrollment_ref}            | progress.read: currentowner/assignedteachergrant/status/requirements/checkpoint no-store ไม่เชื่อperson_id                                                   |
| POST /api/learning/activities/{activity_ref}/evidence  | progress.record: operation_id/expected_revision/context/answer-or-referencedreceiptตามชนิด; servervalidate/grade/privateevidence/receipt ไม่รับcompletedflag |
| PATCH /api/learning/progress/{progress_ref}/checkpoint | progress.saveCheckpoint: CASrevision/curriculum-activitybinding/currentgrant; serveracceptedposition ไม่คืนkeyหรือยืนยันจบ                                   |
| POST /api/learning/posttests/start                     | sharedAttempt.start: phasePOSTจากBlueprint ตรวจguardข้อ2ในtransaction ไม่ใช่posttestengineจริงของ27                                                          |

401ให้reauthแล้วrestoreเฉพาะbindingเดิม 404ซ่อนobjectนอกscope 403actionไม่มีgrant 409stale/state/prerequisiteไม่ผ่าน 422payloadไม่ตรงschema ไม่มีPII/key/internalSQL/รายการขาดของคนอื่นในerror No-storeprivateprogress/feedbackและno sharedpublic cacheของHTMLที่มีข้อมูลส่วนตัว

## 6 Resumeและการกลับทบทวน

checkpointserverack+requirementset/policy/LessonVersionที่pinเป็นฐานreload ต่อactivity/save queueแบบrevision26 โดยunknowncommitค้นreceiptก่อนretry คิวเก่าไม่ทับcheckpoint/revisionใหม่ ไม่สร้างenrollment/attemptใหม่จากbrowserstateหาย ถ้าpersistentdraftในเครื่องไม่ได้รับอนุญาตหรือwriteล้มเหลว ต้องแจ้งunsentdraftอาจสูญหาย ไม่บอกบันทึกแล้วก่อนserverยืนยัน

บทที่completedแล้วกลับทบทวนได้ตามcurrentrights/policyโดยไม่ลดacceptedprogressหรือเปิดposttest/retakeใหม่เอง การทำแบบฝึกซ้ำเป็นattempt/receiptใหม่ตามopportunitypolicy ไม่updateคะแนน/หลักฐานเก่า ต้องแสดงcurrentcompletionกับreviewactivityคนละส่วน

เนื้อหาv2หรือถอนv1ให้รักษาrefs/hash/accepted evidenceเดิมแต่ตรวจcurrentaccess ไม่resolve latestเพื่อให้เปิดได้อัตโนมัติ ถ้าrequiredบทถูกถอนต้องPOLICY_NOT_READY/pauseและapprovedalternative/requirementrevision ไม่markครบหรือข้ามไปposttestเพื่อแก้ติดขัด ไม่ลบประวัติ/ผลสอบเดิม

progress/evidence/checkpoint/เวลาหรือผลเฉพาะผู้เรียนไม่อยู่ในpublicDTO/HTML/RSC/staticassets/cache/exportนอกgrant ให้ publicเนื้อหาผ่านallowlist24 ส่วนprivate journey/feedbackใช้projectionและcachepolicyแยก ไม่ใช้public URLของlessonเป็นหลักฐานว่ามีสิทธิ์อ่านprogressคนนั้น ผู้สอนดูเฉพาะกลุ่ม/ช่วงassignment ทุกworker/export/downloadตรวจcurrentgrantเช่นกัน

## 7 Accessibilityและเครื่องช้า

ใช้design components/tokensร่วม09เมื่อพร้อม heading/labelภาษาไทย linkและbuttonเหมาะกับงาน focusมองเห็นและเรียงตามเนื้อหา keyboardเข้าถึงกิจกรรม/กลับทบทวน/ข้อความconflictได้ Statusแบบข้อความไม่อาศัยสี timerไม่รบกวนอ่าน และaria-liveแจ้งserverackอย่างพอดี ไม่กระโดดfocusทุกsave

เนื้อหาข้อความหลักและnavigationใช้งานได้ก่อนโหลดmedia แบ่งloadเป็นส่วน โหลดภาพ/mediaเมื่อจำเป็น รักษาตำแหน่งlayout และมีtranscript/ข้อความแทนเมื่อภาพ/เสียงล่ม การไม่โหลดmediaเพราะเครื่องช้าไม่ถือactivitycompletedเอง แต่อาจเลือกapprovedequivalentpathได้

no-JS/read-only fallbackสำหรับเนื้อหาที่อนุญาตไม่หมายถึงกิจกรรมsubmit/completeผ่านโดยไม่มีserver การทำกิจกรรมต้องมีform/serviceที่ยังตรวจpolicy และไม่บอกserverบันทึกแล้วเมื่อยังไม่มีผลยืนยัน ต้องทดสอบ375/768/1024/1440 keyboard/zoom/slowdevice/offline-reconnectจริงก่อนอ้างผ่าน

## 8 Coverageทั้ง9คู่ — เอกสารเท่านั้น

| Group ref                | ช่วงชั้น | ระดับธรรมศึกษา | เส้นทางที่ต้องมี                               | ผลruntime |
| ------------------------ | -------- | -------------- | ---------------------------------------------- | --------- |
| DEMO_GROUP_PRIMARY_TRI   | ประถม    | ตรี            | submittedPRE→lessons/evidence/resume→guardPOST | NOT RUN   |
| DEMO_GROUP_PRIMARY_THO   | ประถม    | โท             | submittedPRE→lessons/evidence/resume→guardPOST | NOT RUN   |
| DEMO_GROUP_PRIMARY_EK    | ประถม    | เอก            | submittedPRE→lessons/evidence/resume→guardPOST | NOT RUN   |
| DEMO_GROUP_SECONDARY_TRI | มัธยม    | ตรี            | submittedPRE→lessons/evidence/resume→guardPOST | NOT RUN   |
| DEMO_GROUP_SECONDARY_THO | มัธยม    | โท             | submittedPRE→lessons/evidence/resume→guardPOST | NOT RUN   |
| DEMO_GROUP_SECONDARY_EK  | มัธยม    | เอก            | submittedPRE→lessons/evidence/resume→guardPOST | NOT RUN   |
| DEMO_GROUP_HIGHER_TRI    | อุดม     | ตรี            | submittedPRE→lessons/evidence/resume→guardPOST | NOT RUN   |
| DEMO_GROUP_HIGHER_THO    | อุดม     | โท             | submittedPRE→lessons/evidence/resume→guardPOST | NOT RUN   |
| DEMO_GROUP_HIGHER_EK     | อุดม     | เอก            | submittedPRE→lessons/evidence/resume→guardPOST | NOT RUN   |

รหัสสมมติตรงcoverage24 ไม่มีseed/หน้าจอ9คู่จริง ไม่มีการรับรองว่าเนื้อหาวิชาหรือกฎกิจกรรมครบทางการ Q007ยังTO VERIFY

## 9 แผนตรวจรับ — ทั้งหมด NOT RUN

| Case   | ทำซ้ำเมื่อ26และfoundationพร้อม                                                    | ผลที่ต้องassert                                                                     |
| ------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| P27-01 | 9คู่ PREdraft/PREsubmitted/lessonrequired/POSTrequestจริง                         | submittedPRE→บทเรียนก่อนPOSTทุกคู่ backendไม่ใช้browserstate                        |
| P27-02 | POSTURLตรง/ServerAction/job/directRPC/เปลี่ยนphase-body/tokenreadyปลอม            | guardร่วมdenyหากpretestขาด/requiredไม่ครบหรือcontextผิด ไม่สร้างattempt/receiptPOST |
| P27-03 | tabsแข่งprogress/withdrawal/requirementrevisionกับstartPOST                       | transactioncurrentversions/conflict/uniquepostopportunity ไม่มีใช้readinessเก่า     |
| P27-04 | openpageค้าง/scroll/timer/heartbeat/ส่งcompleted=true/scoreclient                 | ไม่completedหรือปลดล็อกจากtelemetry/flag หลักฐานตามruleมีservervalidate             |
| P27-05 | optional/required/alternativegroups/writingpending/emptyrequiredconfig            | requiredslotถูกต้อง awaitingmanualไม่0 policyขาดไม่all-emptyผ่าน                    |
| P27-06 | mini PRACTICEretry/ผิดrevision/คำตอบเก่า/leaseและcommitackหาย                     | receipt/evidence/progressไม่ซ้ำ CASconflictไม่ทับ; ไม่เขียนofficialresult           |
| P27-07 | reload/offlinecheckpoint/storageerror/401reauth/เครื่องร่วม                       | resumeเฉพาะserverack/policyที่อนุญาต ไม่มีprivateของคนอื่นหรือsavedปลอม             |
| P27-08 | ทำครบแล้วทบทวน/retake/regradepretest/เปลี่ยนแผนแนะนำ                              | progressacceptedคง ไม่ลด/เพิ่มrequiredเงียบๆ ไม่มีPOSTโอกาสใหม่โดยอัตโนมัติ         |
| P27-09 | v2/ถอนv1/กิจกรรมrequired unavailable/rubricเปลี่ยน                                | pins/historyคง currentrightsจริง pause/approvedalternativeไม่skipหรือjoinlatest     |
| P27-10 | feedbackจากข้อผิด/รอตรวจ/officialembargo/publiclessoncache                        | ไม่เปิดkey/Explanationที่ไม่มีpolicy และไม่ใส่personalfeedbackในsharedpublicbody    |
| P27-11 | IDtamper progress/person/org/enrollment/lesson/activity/checkpoint/export/Storage | currentowner/group/assignment/RLS/ACLdeny ไม่มีPII/evidence/existenceoracle         |
| P27-12 | revoke/suspend/assignmentหมดก่อนsave/job/POSTstart/download                       | currentscope/timeบังคับซ้ำ แม้เคยเรียนcompleted/มีreadyreceipt                      |
| P27-13 | HTML/RSC/JS/static/cache/networkpubliccanary/progress/privatefeedback             | publicresponseไม่มีprogress/attempt/reason/answers/keyส่วนตัว                       |
| P27-14 | 4viewport keyboard/labels/zoom/aria-live/transcript/slowmedia/no-JS               | navigation/กิจกรรม/ทบทวน/emptystateใช้ได้ ไม่บันทึกว่าเรียนครบเพียงเพราะสื่อล่ม     |

executionต้องเก็บsource/policy/fixture/manifest/actor/scope/time/actualHTTP/assert/concurrencyfault/receipt/evidence refsแบบprivate ไม่ใส่rawคำตอบ/ชื่อผู้เรียน/key/tokenในpubliclogs ไม่มีexecutabletests/pages/endpointsของ27ให้เรียกในrepositoryตอนนี้

## 10 Gate, versionsและงานค้าง

เกณฑ์posttestข้ามpretest/บทเรียนไม่ได้ **BLOCKED / NOT RUN** เกณฑ์ครบ9คู่และกลับเรียนต่อได้ **BLOCKED / NOT RUN** ไม่ใช้403starterหรือ9แถวMarkdownแทนpolicy/flowจริง

schema/app0.6.0 Prisma7.10.0 Next16.3.8 core19models/213scalarfields/migration1ไม่เปลี่ยน ไม่เพิ่มmodels/routes/services/migration/seed Q007/Q024ต้องcompletion/required-alternative/awaitingmanual/requirementtransitionที่รับรอง Q008/Q025/Q016ต้องprivateprogress/feedback/browserdraft/retention Q023/Q011ต้องDAL/RLS/guardtransaction/receipt/worker/withdrawalจริง Q018/Q019/Q021ต้องaccessibility/browser/slowdeviceจริง

ต้องผ่าน26และdependencyเดิมก่อนimplementation27 จากนั้นรันP27-01–14เพื่อปิดเกณฑ์ ไม่สร้างposttestengineของบทถัดไปหรือเลื่อนไป28จากผลเอกสาร

## 11 ผลตรวจจริงรอบเอกสาร27

| คำสั่ง/วิธี                                                                                                        | ผลจริงและขอบเขต                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Python inlineอ่านตาราง/contracts/routes/caseIDs/links/schema/package/migrationhash                                 | PASS: 5concept contractsแบบเสนอ/9คู่สองแกนไม่ซ้ำตรงcoverage24/6proposedroutes/14caseIDs/45local linksไม่ขาด; core19models/213scalarfields/migration1/checksumเดิม learningREADME-only |
| `corepack pnpm exec prettier --ignore-path /dev/null --check docs/LEARNING_FLOW.md src/modules/learning/README.md` | PASS เฉพาะ2ไฟล์ที่ระบุ                                                                                                                                                                |
| `git diff --check` / `git diff --cached --check` / `corepack pnpm secrets:check`                                   | PASS ไม่มีwhitespaceerrorหรือรูปแบบsecretที่ตัวตรวจรองรับ ไม่ใช่การตรวจความปลอดภัยครบ                                                                                                 |
| learning/progress/resume/posttestprerequisite/nativePG/browser/privacy                                             | NOT RUN ไม่มีimplementation27และ26ยังBLOCKED                                                                                                                                          |

migration SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน ไม่รันunit/lint/typecheck/build/SQLWASM/nativeDB/environmentprobeใหม่ ผลunit17ใน23เป็นประวัติ ไม่ใช้เป็นผล27 ไม่มีroute/page/activityถูกเรียกสำเร็จ การตรวจเอกสารไม่ปิดเกณฑ์ผู้ใช้ทั้งสองข้อ
