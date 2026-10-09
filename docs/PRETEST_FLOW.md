# แบบทดสอบก่อนเรียน: เส้นทางและสัญญา attempt — บท 26

รุ่น 0.1 | 4 ตุลาคม 2569 | source ก่อนแก้ `db10826` | **Proposal / BLOCKED — ยังไม่มี routes/services/attempt engine**

บท25ยังไม่ผ่าน ดู [QUESTION_REVIEW](QUESTION_REVIEW.md) learningมีREADMEเท่านั้น ไม่มีUser/enrollment/Curriculum/question/attemptmodelsหรือDALจริง เอกสารนี้เป็นสัญญาเตรียม ไม่ใช่ Prisma schemaหรือAPIที่เรียกใช้ได้ การตรวจautosaveและเกณฑ์ทำซ้ำอยู่ใน [PRETEST_AUTOSAVE](PRETEST_AUTOSAVE.md)

## 1 ใช้ทะเบียนกลางและแยก pretest

PretestAttemptเสนอเป็น typed service/view ของ Attemptกลางที่ AssessmentBlueprint.phase_code=PRE ไม่สร้างPerson/User/enrollmentหรือattemptทะเบียนคู่ขนาน ถ้าต้องมีextensiontableให้PK/FK attempt_id unique1:1 เก็บเฉพาะpretest metadata ห้ามสำเนาคำตอบ/ผู้เรียน/statusที่แก้คนละแหล่งได้ ต่อยอดแบบ04และ [CURRICULUM_SCHEMA](CURRICULUM_SCHEMA.md) ไม่สร้างposttestหรือการปลดล็อกบทเรียนล่วงหน้า

เริ่มจากผู้เรียนที่User-Person bindingยืนยันแล้ว resolve enrollment/กลุ่ม/หลักสูตรจากserverตามสิทธิ์จริง ช่วงชั้นกับระดับธรรมศึกษาแยกกันทั้ง9คู่ ไม่เชื่อ person_id/org_id/group_idหรือRoleที่clientส่งมา การแก้URL/body/queryไม่เปลี่ยนเจ้าของattempt

## 2 โครงสร้างเสนอและจุดที่แบบ04ยังขาด

ทุกmodelใช้ UUID PK, snake_case, FK RESTRICT, private schema ENABLE/FORCE RLS, row_versionและrecorded_atมาตรฐาน actorจากบัญชีกลาง ไม่ใช้ServiceActorแทนผู้เรียน Blueprint/enrollment/attemptมีCurriculum contextตรงกันตามcomposite FK04 ข้อมูลส่วนตัว/คำตอบอยู่ตารางที่มีACL ไม่ลงauditเป็นpayloadเต็ม

| Concept/modelเสนอ            | สิ่งที่เพิ่มหรือตรึงจากแบบ04                                                                                                                                                                                               | ข้อบังคับ                                                                                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AssessmentBlueprint          | phase_code PRE, version_no, sealed poolmanifest, topic/level quotas, sampling/scoring/time/retake policy refs, content/source rights versions                                                                              | unique(curriculum_id,assessment_code,version_no)และ(id,curriculum_id)เดิม; samplingruleกับcandidatepoolimmutableเมื่อseal ทุกQuestionVersionเป็นpracticeที่ใช้pretestได้ตาม25      |
| AssessmentOpportunity        | learning_enrollment_id, phase_code, opportunity_ref, authority/policy refs, recorded_at                                                                                                                                    | serverออกโอกาสสอบ/สอบซ้ำตามpolicy ไม่ให้clientสร้างด้วยUUIDใหม่เอง ใช้unique(enrollment,phase,opportunity_ref); retake/multipleactiveยังQ007/Q024                                  |
| PretestAttempt → Attemptกลาง | enrollment/blueprint/curriculum/opportunity refs, attempt_no, started_at, deadline_at nullable, submitted_at, serverstatus, private sampling_seed, sampling_algorithm_version, candidate_pool_hash, selected_manifest_hash | unique(opportunity_id)ให้หนึ่งโอกาสหนึ่งattemptจริง และunique(enrollment,blueprint,attempt_no)04; phase/contextตรวจจากDB; seed/policy/clockไม่client-controlled ไม่มีdefaultlatest |
| AttemptItem                  | attempt_id,item_no,QuestionVersion UUID, stem_snapshot, safeoptions_snapshot, choiceorder, kind, private KeyหรือRubric/Explanation refs, TopicMapping snapshot, sourcefileversion/hash/scorepolicy                         | unique(attempt_id,item_no); choice_refsต้องตรงQuestionVersionนั้น; questions/keys/rubric/topic/groupตรงmanifest ไม่มีofficialembargo/ข้ามcurriculum                                |
| Response                     | unique attempt_item_id, answer_payload, revision, saved_at, is_final, final_revision                                                                                                                                       | เก็บcurrentdraftของผู้เรียนกลาง ต่อยอดresponse04 ไม่ให้is_final/revision/saved_atจากclientกำหนดเอง; revisionledger/receiptตามPRETEST_AUTOSAVE                                      |
| PracticeScoreRevision        | attempt_id, grading_revision, pinnedscoringpolicy/key-or-rubric refs, exactnumeric score/maxscore, gradingstatus, evidence/correlation/recorded_at                                                                         | unique(attempt_id,grading_revision); versionedscore ไม่มีSubjectScore/ResultReleaseระบบ5; WRITING awaitingmanualแยกจากคะแนน0                                                       |
| LearningPlanRevision         | attempt_id, grading_revision, plan_rule_version_id, curriculum_manifest_hash, topic/lessonversion refs, safe recommendation reasoncodes, recorded_at                                                                       | unique(attempt_id,grading_revision,plan_rule_version_id); suggestionsไม่เพิ่มสิทธิ์/enrollmentหรือเปลี่ยนlessonprogressเป็นcompleted ผลใหม่เป็นrevisionไม่แก้แผนเก่า               |

แบบ04ยังไม่มีopportunity/deadline/serverseed/samplingmanifest/TopicMapping/response revision receipts/completegrading-planbinding ต้องปรับdictionary/ADR/migrationเมื่อพร้อม ไม่ใช้JSONหรือtimestampเดิมอ้างว่าปิดretry/autosaveได้แล้ว ดัชนีเพิ่มเติมเฉพาะquery: Attempt(enrollment,status), Attempt(deadline_at,status)สำหรับexpiryworker, LearningPlanRevision(attempt_id,grading_revision)ถ้าuniqueindexยังไม่พอ ตรวจEXPLAINก่อนเพิ่ม ไม่indexทุกfield

## 3 การเลือกและ snapshotคำถาม

1. serverตรวจcurrentactor/enrollment/group/blueprint PRE/rights/publication/withdrawal/timewindowก่อนเริ่ม ผู้เรียนไม่มีสิทธิ์ให้deny ไม่ส่งcandidatepool/seed/AnswerKeyกลับbrowser
2. lock enrollment/opportunityตามลำดับเดียวกันทุกstart ตรวจexisting attempt/receiptและcurrentpolicyก่อนออกattempt_no โดยหลายtabหรือคนละrequestkeyในโอกาสเดียวต้องได้attemptเดิม ไม่ใช้keyอย่างเดียวกันduplicate
3. ตรึงcandidatepoolที่review/sealแล้วพร้อมQuestionVersion/TopicMapping/KeyหรือRubric/Explanationและpolicy ใช้server-generated randomnessและsamplingalgorithmมีรุ่น ลำดับcandidateต้องcanonicalก่อนสุ่ม quotas/overlappingtopics/allow-repeat/จำนวนข้อเป็นconfig ไม่เดากฎ
4. ถ้าeligiblepoolไม่พอquota/ข้อมูลreviewขาดให้NOT_READY ไม่ดึงข้อต่างระดับหรือofficialมาทดแทน ไม่ลดจำนวนข้อเงียบๆ Algorithm/unbiasedsampling/replayต้องได้รับการทดสอบจริงก่อนใช้ ไม่อ้างhashหรือseedอย่างเดียวพิสูจน์สุ่มถูก
5. สร้างAttempt+AttemptItems/options order/privatepins+startreceipt/audit/outboxในtransactionเดียว snapshotสิ่งที่ใช้จริงทั้งข้อความและrefs/hash ไม่resolve latestตอนreload Seedเก็บprivate serverพร้อมversionเพื่อreplay ภายใต้นโยบายretention ไม่log/exportในlearnerDTO

Random orderและตัวเลือกที่ส่งbrowserต้องไม่มีis_correct/key/rubric/Explanationที่เผยคำตอบ ใช้ [QUESTION_BANK_CONTRACT](QUESTION_BANK_CONTRACT.md) projectionเท่านั้น Media/alt/sourceชื่อไฟล์ต้องไม่มีคำตอบแฝง ไม่สร้างAPIvalidateคำตอบที่กลายเป็นoracleก่อนsubmit

## 4 เส้นทางเสนอ — ยังไม่สร้างจริง

เส้นทางนี้เป็นข้อเสนอที่ต้องปรับSITEMAP/ADRเมื่อimplementation ไม่ใช่URLที่เปิดใช้งานในstarter Auth/CSRF/rate limitใช้บริการกลาง08 ทุกhandler/actionเรียกDAL/serviceเดียวกัน ไม่ให้ServerActionข้ามpolicy

| เส้นทาง/commandเสนอ                                             | สิ่งที่รับ                                                                 | การตรวจและผลที่อนุญาต                                                                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| GET /app/learning/pretest                                       | กลุ่ม/หลักสูตรpublic_refที่ผู้เรียนเลือก                                   | resolveauthorizedcurriculum9คู่ ไม่คืนข้อมูลคนอื่น มีloading/empty/errorและlabelไทย                                               |
| POST /api/learning/pretests/start                               | curriculum/blueprint/opportunity opaque refs, operation_id                 | serverderiveowner/policy/clock ตรวจstartgrant+quota+eligibility; transactionreceiptและคืนsafeattempt_ref ไม่มีseed/key            |
| GET /api/learning/attempts/{attempt_ref}                        | opaque ref                                                                 | currentselfgrant/read/status/withdrawalpolicy; safeitems/currentanswers/revisions/server_now/deadlineตามgrant ไม่มีkeyและno-store |
| PATCH /api/learning/attempts/{attempt_ref}/responses/{item_ref} | operation_id, expected_revision, answer_payload                            | itemอยู่attempt/ownerจริง schema/right/time/state+CASตามPRETEST_AUTOSAVE; ackเฉพาะcommitแล้ว ไม่มีgradepreview                    |
| POST /api/learning/attempts/{attempt_ref}/submit                | operation_id, expected_response_revisionsทั้งชุด, expected_attempt_version | flushackก่อนส่ง lockparent/time/state/revisions snapshotanswers/receipt แล้วgrading/planตามpolicy ไม่มีclientelapsed/score/key    |
| GET /api/learning/attempts/{attempt_ref}/result                 | opaque ref                                                                 | currentselfหรือassignedteachergrant; serverfinalized/scorestatusและfeedbackpolicy; ไม่คืนkeyทั้งแถว คนอื่นhidden404               |

401เมื่อsessionหมดให้กลับเข้าสู่ระบบโดยรักษาdraftตามนโยบาย ไม่เปลี่ยนowner; 404เมื่อobjectต้องซ่อน; 403เมื่อactionไม่มีสิทธิ์; 409revision/state/payloadconflict; 422schemaไม่ผ่าน เวลาสิ้นสุดตอบexpiredstateที่ปลอดภัยตามpolicy ไม่มีrawSQL/privateexists/keyในerror

มือถือ/keyboard:9คู่มีlabels/headingเลือกกลุ่ม Startไม่กดจากhiddengrant ร่าง/ค้างส่ง/ส่งสำเร็จเป็นข้อความไม่สีอย่างเดียว มีaria-liveแจ้งack/conflictและfocusข้อผิด ไม่จับfocusกลับทุกautosave มีemptystateบอกpoolยังไม่พร้อม ไม่มีtimerเตือนถี่จนscreenreaderใช้ไม่ได้ ยังไม่ได้ตรวจviewport/browserจริง

## 5 เวลาตัดสินจากserverและการส่งแบบทดสอบ

started_at/deadline_atมาจากserverและtimepolicyรุ่นที่ตรึง ไม่มีdeadlineให้ใช้NULLตามpolicy ไม่อนุมาน0/ไม่จำกัดเอง Window [start,deadline) แสดงAsia/Bangkok/พ.ศ. timerclientเป็นเพียงประมาณจากserver_nowและต้องsyncเมื่อต่อใหม่ เปลี่ยนเครื่อง/Date/elapsedไม่เพิ่มเวลาและไม่เปลี่ยนคะแนน

เวลาที่ยอมรับsave/submitต้องตรึงหลังได้lockและตรวจสิทธิ์ ณ จุดที่policyกำหนด ไม่ใช้transaction-start timestampที่อาจเก่ากว่าเวลารอlock จัดraceกับexpiryworkerแบบเดียวกัน หากมีpolicygrace/acceptreceivedbeforedeadlineต้องยืนยันและpin ไม่เดาเผื่อเวลาเพราะnetworkช้า

submitตรวจexpected attempt/response revisionmanifestตรงcurrentdraftที่commitแล้ว lockAttemptเหมือนautosaveเพื่อป้องกันsaveวิ่งผ่านfinalization ข้อที่ไม่ได้ตอบตามpolicyที่ยืนยัน ถ้ายังค้างofflineไม่ประกาศส่งสำเร็จหรือส่งคำตอบเก่าที่serverมีเงียบๆ ห้ามclient setis_final/submitted_at/คะแนน

transactionsubmitบันทึกimmutablefinalresponses/pins/submitted_at/receipt/audit/outboxครั้งเดียว Gradingที่ทำแยกworkerใช้receipt/inputhash/lease/currentjobauthority ผลscore/planมีuniquededupตามrevision Workerไม่ใช้currentkey/latesttopicmapping หลังwithdraw/revokeต้องตามpolicy25 ไม่อ้างทำต่อได้จากสิทธิ์เดิม

retryหลังresponseหายให้ค้นreceiptตามauthenticatedowner+operation/payloadbinding รับreceiptเดิมของsubmitที่commitแล้วได้แม้เวลาหมดภายใต้currentgrant ไม่ยอมรับsubmitใหม่หลังdeadlineเพราะอ้างretry Unknownผลnetworkต้องแสดงกำลังตรวจสถานะ ไม่เรียกsuccessก่อนserverconfirm

## 6 คะแนน หัวข้อ และlearning plan

scoreเป็นexactdecimalตามgradingpolicyที่ตรึง ไม่รับscoreจากclient ไม่gradeข้อเขียนด้วยobjective ถ้าawaitingmanualให้แสดงคะแนนส่วนที่ตรวจได้และจำนวนยังไม่ตรวจ แยกจาก0และจากผลสุดท้าย ไม่เปิดfeedback/เฉลยเพียงเพราะsubmitสำเร็จ ต้องowner/release/feedbackpolicyผ่าน

TopicMapping snapshotและplan-ruleversionกำหนดวิธีรวมหลายหัวข้อ/weight/denominator/minimumevidenceก่อนแนะนำ ไม่countคะแนนซ้ำโดยใช้ทุกmappingเต็มน้ำหนัก ไม่เสนอว่าผู้เรียนอ่อนหัวข้อที่ไม่มีคำถามวัดหรือยังรอตรวจ หากcoverageไม่พอแสดง“ข้อมูลยังไม่พอประเมินหัวข้อนี้” ไม่มีofficialpass/failหรือคุณสมบัติสมัครจากคะแนนpretest

LearningPlanRevisionแนะนำTopic/LessonVersionของCurriculummanifestเดียวกันพร้อมเหตุผลที่ไม่เผยเฉลย ตรวจcurrentpublication/rights/withdrawalก่อนให้เปิดบท ไม่เพิ่มrole/scope/สิทธิ์เข้าหลักสูตรใหม่จากคะแนน ระบบ26ไม่ทำposttest/unlockengineหรือเลือกผลสอบทางการให้เอง

app/schema0.6.0 Prisma7.10.0 Next16.3.8 migrationcore1ไม่เปลี่ยน ไม่มีmodels/routes/services/autosave/learningplanจริง เกณฑ์reload-retry/no-duplicate/คนอื่น/clienttimeยังNOT RUN ดูP26ในเอกสารคู่ ไม่มีproduction/seed/migrationเปลี่ยน ไม่เลื่อนไป27ก่อนผ่าน25และตรวจ26จริง
