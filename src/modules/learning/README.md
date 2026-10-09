# ระบบ 03 — การเรียนและคลังข้อสอบ

เจ้าของงานเสนอ O03 ตามCharter โฟลเดอร์นี้เป็นที่ตั้งบริการของโมดูล บท05ยังไม่มีbusinessimplementation ตารางและสัญญาข้อมูลตามบท04 ไม่ใช้READMEแทนmodel/migration

เมื่อได้รับพรอมป์ต์บทลงมือ ให้หน้าเว็บและworkerเรียกserviceของโมดูล เจ้าของserviceตรวจactor/action/scope/เวลา/fieldvisibility/transaction/audit ใช้Person Organization บัญชีและเอกสารกลางร่วมกัน ไม่เขียนโมดูลอื่นโดยลัดกฎ

สถานะบท24: prerequisite23ยังBLOCKED อ่าน [CURRICULUM_SCHEMA](../../../docs/CURRICULUM_SCHEMA.md), [CURRICULUM_COVERAGE](../../../docs/CURRICULUM_COVERAGE.md), [LEARNING_CONTENT_POLICY](../../../docs/LEARNING_CONTENT_POLICY.md) เป็นแบบเตรียม ไม่มี Curriculum/Course/Subject/Topic/LessonVersionmodelsหรือ9หน้าจอจริง Stageแยกlevelธรรมศึกษา ชุดบทเรียนต้องตรึงตามรุ่น ข้อเขียนใช้manualrubric คะแนนฝึกแยกofficialresults และไม่copyเนื้อหาจากแหล่งที่ยังไม่มีสิทธิ์ P24-01–09ยังNOT RUN

สถานะบท25: prerequisite24ยังBLOCKED ดู [QUESTION_BANK_CONTRACT](../../../docs/QUESTION_BANK_CONTRACT.md) และ [QUESTION_REVIEW](../../../docs/QUESTION_REVIEW.md) เป็นแบบเตรียม ไม่มีquestion models/CMS/attemptengineหรือnetworktestsจริง แยกpractice/officialembargoและwritingrubricจากobjectivekey Key/Explanationห้ามเข้าlearnerDTOก่อนsubmit รุ่นpublishedแก้เป็นรุ่นใหม่ withdrawalรักษาต้นทางและตรวจcurrentpolicy P25-01–12ยังNOT RUN

สถานะบท26: prerequisite25ยังBLOCKED อ่าน [PRETEST_FLOW](../../../docs/PRETEST_FLOW.md) และ [PRETEST_AUTOSAVE](../../../docs/PRETEST_AUTOSAVE.md) เป็นแบบเตรียม ไม่มีroutes/services/attempt/autosaveจริง PretestAttemptต่อAttemptกลางPRE serverseed/pinnedmanifest/privateKey CASrevision/receiptและserverclockหลังlockป้องกันstale/ส่งซ้ำ คะแนนฝึก/learningplanไม่officialresult Offlineunsentdraftต้องpolicy/storageผ่านก่อนบอกเก็บแล้ว P26-01–15ยังNOT RUN

สถานะบท27: prerequisite26ยังBLOCKED ดู [LEARNING_FLOW](../../../docs/LEARNING_FLOW.md) เป็นแบบเตรียม ไม่มีlearningpages/progressservices/sharedPOSTguardจริง submittedPRE→บทเรียนrequiredตามpolicy→POSTต้องbackendtransaction แผนแนะนำแยกrequired ไม่markcompleteจากpageview/flagclient Progress/evidence/checkpoint/feedbackprivate pinรุ่น/currentrights มีtranscript/equivalentpath/ทบทวนตามpolicy P27-01–14และ9flowยังNOT RUN

สถานะบท28: prerequisite27ยังBLOCKED ดู [ASSESSMENT_RULES](../../../docs/ASSESSMENT_RULES.md) และ [LEARNING_REPORTS](../../../docs/LEARNING_REPORTS.md) เป็นแบบเตรียม ไม่มีPOST/grading/learningreportจริง POSTต่อAttemptกลาง pinKeyหรือRubric/algorithm/policy แยกrawกับcertifiedภายใน PairRecordmode/version/evidenceชัด ไม่bestscore/causalclaim ครูcurrentassignment/selfเท่านั้น Aggregateขาดprivacyconfigdeny คะแนนฝึกไม่มีofficialwrite/eventcapabilityระบบ5 P28-01–14ยังNOT RUN

สถานะบท29: prerequisite24–28ยังBLOCKED อ่าน [UAT_SYSTEM_03](../../../docs/UAT_SYSTEM_03.md), [MANUAL_LEARNING](../../../docs/MANUAL_LEARNING.md) และ [test specification](../../../tests/system03/ACCEPTANCE_CASES.md) เป็นชุดเตรียม23กรณี/9คู่ [coverage plan](../../../tests/fixtures/system03/coverage-plan.csv) refsสมมติไม่seed ไม่มีexecutableE2E/learningflowจริง ทุกUAT29NOT RUN rootunit17ไม่รับรองระบบ3 SoftwareQAแยกจากexpertcontentreview ยังไม่มีข้อสมมติที่รับรองธรรม ไม่เลื่อนไป30
