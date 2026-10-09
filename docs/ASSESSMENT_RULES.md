# กฎ posttest การให้คะแนนและผลรับรองภายใน — บท 28

รุ่น0.1 | 4 ตุลาคม 2569 | sourceก่อนแก้ `474c03d` | **Proposal / BLOCKED — ยังไม่มี posttest/grading/report services**

บท27ยังไม่ผ่านตาม [LEARNING_FLOW](LEARNING_FLOW.md) learningมีREADMEเท่านั้น ไม่มีAttempt/QuestionVersion/Key/Rubric/progress/Auth/DALจริง เอกสารนี้เป็นสัญญาเตรียม ไม่ใช่ Prisma schemaหรือendpointที่ทำงานแล้ว รายงานกำหนดใน [LEARNING_REPORTS](LEARNING_REPORTS.md) ใช้ข้อมูลกลางเดิม ไม่สร้างบัญชีหรือทะเบียนผู้เรียนอีกชุด

## 1 PosttestAttemptและประตูเริ่มสอบ

PosttestAttemptเสนอเป็นtyped service/viewหรือextension1:1ของAttemptกลางเมื่อAssessmentBlueprint.phase_code=POST ใช้enrollment/opportunity/receipt/answer revision/clock/snapshotกลางของ [PRETEST_FLOW](PRETEST_FLOW.md) ไม่สร้างคำตอบ/status/ownerคู่ขนาน ใช้snapshot/KeyหรือRubric/Explanation/choiceorder/TopicMapping/scorepolicyรุ่นที่ตรึงตาม [QUESTION_BANK_CONTRACT](QUESTION_BANK_CONTRACT.md)

sharedAttempt.start phasePOSTต้องตรวจcurrentverifiedowner/action/enrollment/Curriculum/group/Blueprint/version/pool/rightsและguard27ในtransactionว่าpretest submittedและrequiredactivitiesครบตามpolicyจริง ไม่รับready/completed/phase/score/elapsed/person_idจากclient Posttestretryใช้server-issuedopportunity/unique slotเหมือน26 ไม่เพิ่มattemptหรือสุ่มชุดใหม่เมื่อACKหาย

รายการPRE/POSTทุกคู่ต้องธรรมศึกษากลุ่มเดียวกันจาก9คู่แยกstageกับlevel ชุดทางการembargoไม่เข้าpracticepool คะแนน28เป็นคะแนนเรียนรู้แม้ใช้ข้อฝึกที่อ้างแหล่งทางการ ไม่ย้ายไปSubjectScore/ResultReleaseหรือทะเบียนApplicationระบบ5/9

## 2 เงื่อนไขเปรียบเทียบต้องตรึงก่อนใช้

| Comparison modeเสนอ           | สิ่งที่ต้องบันทึกและตรวจ                                                                                                                    | การแสดงผล                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| SAME_ITEMS                    | PRE/POST QuestionVersion multisetเดียวกัน รวมitemweights/maxscores/rubric/scorepolicyที่เทียบได้ order/choiceorderที่ต่างเก็บจริงในmanifest | ระบุ“ใช้คำถามรุ่นเดิม”และการทำซ้ำ/การเห็นคำอธิบายตามpolicy ไม่ใช้question_codeเดียวแต่contentversionต่างอ้างข้อเดิม |
| COMPARABLE_ITEMS              | blueprintทั้งสองมีtopic/coverage/difficulty/kind/weights/rubric/score-scale mapping และreviewevidence/ข้อจำกัดรายรุ่น                       | ระบุ“ใช้ชุดที่ออกแบบให้เทียบเคียง”พร้อมสถานะการรับรอง ไม่อ้างความเทียบเท่าเชิงการวัดผ่านเพียงเพราะคะแนนเต็มเท่ากัน  |
| NOT_COMPARABLE / NOT_VERIFIED | หลักฐานหรือmapping/คะแนนสุดท้ายขาด ต่างCurriculum/group/เงื่อนไขที่policyห้าม หรือข้อมูลยังไม่ตรวจ                                          | แสดงคะแนนแยกที่มีสิทธิ์ดูและเหตุผลปลอดภัย ไม่แสดงdelta/หัวข้อดีขึ้นปลอม                                             |

AssessmentComparisonSpecเสนอเก็บpre/post blueprint UUIDs+versions/curriculum+group, mode, comparison_policy_version_id, coverage/scale/retake/pair-selection rules, evidence refs, reviewer/approval/recorded_at และsealedhash Changesเป็นรุ่นใหม่ไม่เปลี่ยนPairRecordเดิม ไม่ให้clientเลือกmodeเพื่อเปิดรายงานหรือขยายgrant

เมื่อmodeเป็นSAME_ITEMS การสร้างPOSTต้องใช้QuestionVersion multisetจากpairedPRE manifestที่pinและตรวจcurrenteligibilityก่อน ไม่สุ่มpoolใหม่แล้วเรียกข้อเดิม หากข้อนั้นถูกถอน/ใช้ไม่ได้ให้holdตามpolicy ไม่แทนข้ออื่นเงียบๆ COMPARABLE_ITEMSสุ่มจากsealedPOSTpoolที่มีapprovedcomparisonmappingแล้วตรึงactualselectionตาม26

แม้เป็นSAME_ITEMSก็ต้องตรวจข้อเงื่อนไขอื่นร่วม เช่นgrading revision/finalness/คะแนนเต็ม/weight/topiccoverage ไม่เทียบคะแนนpartialกับcertifiedหรือชนิดข้อที่ยังรอตรวจเป็น0 กฎequivalence/ความยาก/rubric/จำนวนครั้ง/เกณฑ์ผ่านยังQ007/Q024 TO VERIFY ไม่ตั้งจากเว็บตัวอย่าง

## 3 Modelsและการต่อแบบเดิม

ทุกPK UUID FK RESTRICT map snake_case private ENABLE/FORCE RLS เวลาrecorded_at/accepted_atมาตรฐาน แสดงพ.ศ./AsiaBangkok ตัวconcept28ต้องปรับdictionary/ERD/ADR/migrationเมื่อimplementationพร้อม physicalcoreยังไม่เปลี่ยน

| Concept/modelเสนอ             | ฟิลด์และbindingขั้นต่ำ                                                                                                                                 | ข้อบังคับ                                                                                                                                                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PosttestAttempt → Attemptกลาง | enrollment/curriculum/POSTblueprint/opportunity refs, serverstatus/clock, selectedmanifest/itemresponsefinalhash/scorepolicy                           | phase/contextderiveจากDB; uniqueopportunityตาม26และsamecurriculumFK ไม่client-controlled                                                                                                                                                                                                                |
| AssessmentComparisonSpec      | pre/post blueprint refs, curriculum/group, mode/policy/evidence/sealedhash                                                                             | unique(spec_code,version_no); compositecontextsและverifiedmappingก่อนdelta SAME_ITEMSตรวจmultisetไม่ใช่codeหรือจำนวนข้ออย่างเดียว                                                                                                                                                                       |
| ObjectiveScoreRun             | attempt_id, final_response_hash, itemmanifest_hash, grading_algorithm_version, policy_version_id, keyrefs, computed_item_scores/exacttotal, runreceipt | unique(attempt,input_hash,algorithm_version,policy_version)ให้retryผลเดิม; inputhashครอบคลุมfinalresponse/manifest/key/weights/policy/canonicalizationversion ไม่รับhashจากclientเป็นหลักฐาน                                                                                                            |
| ManualGradingRevision         | response_id, question_version_id, rubric_version_id, grader_account_id, grading_revision, exactscore, feedback/evidence refs, recorded_at              | unique(response_id,grading_revision); rubricตรงQuestionVersion/AttemptItem คะแนนตามcriteria/scaleของรุ่น; ผู้ตรวจมีcurrentassignmentไม่ใช่เจ้าของresponse แก้เป็นrevisionใหม่                                                                                                                           |
| PracticeResultRevision        | attempt_id, result_revision, raw_run/manual_revision refs, score/maxscore exactnumeric, result_status, policy/evidence/hash/recorded_at                | unique(attempt,result_revision); RAW/PARTIAL/AWAITING_MANUAL/REVIEWED/CERTIFIED/WITHDRAWNตามcontractที่รับรอง ไม่สับสนstatusกับofficialresult                                                                                                                                                           |
| ResultCertification           | result_revision_id, checker_account_idหรือapprovedsystempolicy_ref, decision/evidence/recorded_at                                                      | unique(result_revision_id)สำหรับdecisionที่ตรึง; checker_account_id/systempolicy_refเป็นnullableแต่ต้องexactlyoneตามtypedpolicy; currentcertifygrant/makerchecker checkerไม่learnerหรือผู้สร้างmanualgrading revisionนั้น การใช้auto-certificationต้องpolicyเฉพาะที่รับรอง ไม่ใช้technicaladminแทนอำนาจ |

แบบ04 manual_grading.answer_key_id/rubricJSONยังต้องปรับเป็นtypedRubricVersionตาม25 ข้อเขียนไม่มีobjectiveAnswerKey ไม่สร้างgraderpassword/loginใหม่ PracticeScoreRevision26กับPracticeResultRevision28ต้องเป็นscore/resultextensionกลางเดียว ไม่สร้างคะแนนสองแหล่งที่เขียนได้พร้อมกัน ให้ADRกำหนดowner/projectionก่อนmigration

ดัชนีเพิ่มเติมเลือกจาก query ของคิวและรายงานที่ใช้จริง เช่น การค้นคิวตามผู้ตรวจ สถานะ และช่วงมอบหมาย ต้องตรวจ EXPLAIN ก่อนเพิ่ม ไม่สร้าง index ซ้ำกับ unique constraint เดิม และไม่เปิดการค้น feedback/key ผ่านสิทธิ์ดูคะแนน

## 4 ตรวจคะแนนฝั่งserverและการตรวจซ้ำ

submitใช้CAS/revisionmanifest/serverclock/finalreceiptของ26 ข้อมูลยังไม่finalหรือwithdrawal/rights/currentauthorityไม่ผ่านต้องdeny/holdตามpolicy ไม่รันscorerจากbrowser ผู้เรียนไม่เรียกgradepreviewก่อนส่งเพื่อเดาเฉลย

Objectivegraderอ่านimmutablefinalanswers/choices/Key/itemweights/maxscoreและalgorithm/rounding policyรุ่นที่pin ทุกitemตรงattempt/context/ชนิด ข้อmultiplechoice partial-credit/penalty/blankanswerเป็นversionedconfigไม่เดา คะแนนexactdecimalตามscaleที่รับรอง RejectNaN/Infinity/scaleเกินก่อนcast ใช้roundingที่pinกำหนดระดับitem/total ไม่ใช้floatหรือdefaultlatestkey

inputเดียว+algorithm/policyversionเดิมต้องให้itemscore/total/result hashเดิมแม้CMSออกKeyใหม่ เก็บpins/manifestและcanonicalized inputhash ไม่อ้างhashอย่างเดียวพิสูจน์ตรรกะถูก ต้องมีreplayassertจริงตามP28-02/03 หากต้องแก้bug/scoringpolicyให้newrun/resultrevisionที่มีเหตุผลและหลักฐาน ไม่updateผลเก่าเงียบๆ

WRITINGส่งผ่านoutboxกลาง11ไปqueueผู้ตรวจ currentgrant/rubric scope/ช่วงassignmentก่อนclaim/read/record ผู้เรียนอ่านผลตนได้ตามpolicyแต่ไม่มีgrade/certifygrant การหมดassignment/leaseเก่าหรือส่งผลซ้ำต้องdeny/conflict/receiptไม่ซ้ำ ไม่ใช้currentrubricหรือobjectivecorrect-choiceแทนrubricรุ่นเดิม

## 5 ผลดิบ ผลรับรอง และข้อเสนอแนะ

ผลดิบคือscoreที่engine/ผู้ตรวจบันทึกตามpins ยังไม่เท่ากับผลรับรองภายใน ข้อเขียนรอตรวจให้AWAITING_MANUAL/partialscoreชัด ไม่แสดงคะแนนเต็มรวมที่ทำเหมือนผลfinalและไม่เติม0 ผลรับรองภายในคือPracticeResultRevisionที่ผ่านcurrentcheckergroup/policy/evidenceและmakercheckerตามที่รับรอง **ไม่ใช่ผลสอบนักธรรมหรือธรรมศึกษาทางการ**

หากให้ผู้เรียนดูผลดิบต้องlabel“คะแนนร่าง/รอตรวจ”ตามpolicy ส่วนdeltaเปรียบเทียบมาตรฐานใช้eligible result revisionsที่กำหนดชัด รายงานร่างต้องแยกจากcertified ไม่auto-certifiedเมื่อจบqueueหรือจากcheckboxclient Withdrawal/correctionสร้างrevision/decisionใหม่ อ้างต้นฉบับและเก็บประวัติไม่แก้audit

feedbackหลังsubmit servercommitต้องowner/currentgrant/feedbackpolicy/release/rightsผ่าน ข้อเสนอแนะเลือกExplanation/rubricguidanceที่อนุญาต ไม่คืนAnswerKey/hiddenrubricทั้งแถว ไม่ส่งเฉลยก่อนส่งหรือเปิดข้อOFFICIALลับหลังส่งเพราะเคยทำสำเร็จ Feedbackของผู้เรียนไม่ลงpublicLessonVersion/body/sharedcache

Result/grade/certify transactionรวมdomainrevision/receipt/audit/outboxและdedup/optimisticversions Auditเก็บrefs/action/revision/hash/reason/evidence/correlationไม่rawคำตอบ/key/seed/password/token Workerretryตรวจcurrentauthority/lease/inputversionเดิม ไม่อ้างexactlyonceภายนอก ในdevใช้sinkเท่านั้น

## 6 ขอบเขตกับระบบ5

Learningservice/limitedDBroleเสนอให้มีwritegrantเฉพาะคะแนน/ผลเรียนรู้ ไม่มีwrite/RPC capabilityไปsubject_score/result_draft/result_release/applicationofficialstatus ห้ามcopyคะแนนpre/postผ่านexport/importหรือoutboxเป็นผลทางการ Event namespace learning.* ไม่ใช่exam-result eventและconsumerระบบ5ต้องปฏิเสธชนิด/แหล่งที่ไม่ใช่officialservice

รายงาน/API/export/printทุกแห่งติด“คะแนนฝึกหัด ไม่ใช่ผลสอบทางการ” การรับรองภายในไม่ได้สร้างเลขประกาศ/คุณสมบัติผ่านสอบ/ใบรับรองนักธรรมธรรมศึกษา ระบบผลทางการใน5ยังไม่สร้าง ไม่ใช้ความว่างของตารางหรือไม่มีconsumerอ้างเกณฑ์2ผ่าน ต้องnegative nativegrant/consumer/effect testsเมื่อระบบพร้อม

## 7 Gate

schema/app0.6.0 Prisma7.10.0 Next16.3.8 core19models/213scalarfields/migration1ไม่เปลี่ยน ไม่มีPOST/grading/reportmodels/services/workerจริง ต้องผ่าน27และdependencyเดิมก่อนimplementation28 เกณฑ์replayคะแนนเดิมและไม่เผยคะแนนฝึกเป็นofficial **BLOCKED / NOT RUN** ดูแผนตรวจในLEARNING_REPORTS ไม่เลื่อนไป29จากแบบเอกสาร
