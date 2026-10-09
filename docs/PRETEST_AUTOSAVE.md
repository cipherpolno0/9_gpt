# Autosave, retry และเกณฑ์ตรวจแบบทดสอบก่อนเรียน — บท 26

รุ่น0.1 | 4 ตุลาคม 2569 | **Proposal / BLOCKED — ยังไม่มี autosave หรือ executable tests**

อ่าน [PRETEST_FLOW](PRETEST_FLOW.md), [QUESTION_REVIEW](QUESTION_REVIEW.md), [CURRICULUM_SCHEMA](CURRICULUM_SCHEMA.md) บท25ยังBLOCKED ไม่มีattempt engine/DAL/session/workerจริง เอกสารนี้กำหนดวิธีรักษาคำตอบเมื่อพัฒนาต่อ ไม่อ้างว่าreload/offlineflowใช้งานแล้ว

## 1 แยกสถานะของคำตอบให้ผู้เรียนเห็น

“บันทึกแล้ว”หมายถึงservercommitและคืนrevisionที่ยืนยัน ไม่ใช่กดตัวเลือกแล้วหรือfetchเริ่มแล้ว ข้อความเสนอ: ยังไม่บันทึก → เก็บร่างในเครื่องแล้วรอส่ง (เมื่อpersistentwriteสำเร็จตามpolicy) → กำลังส่ง → บันทึกแล้ว revisionN หรือข้อมูลขัดแย้ง/หมดเวลา/ต้องเข้าสู่ระบบใหม่

serveracceptedanswersเป็นแหล่งจริงสำหรับคะแนน ส่วนunsentdraftเป็นข้อมูลค้างที่ยังไม่ยืนยัน เวลาclient/filemtimeหรือคำตอบล่าสุดที่มาถึงไม่ได้ชนะเอง ไม่ทำlast-write-winsจากsaved_atของclient

## 2 Revision และreceiptที่เสนอ

| สัญญาเสนอ               | ข้อมูล/ข้อบังคับ                                                                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Response revision       | integerเพิ่มจากserver successfulCASต่อAttemptItem; ไม่มีResponseเริ่มbase_revision0 การบันทึกค่าNULL/ล้างคำตอบต้องเป็นoperationชัดตามschema ไม่สับสนfieldหายกับลบ                                                             |
| AnswerRevision          | append-only private response_id/revision_no/parent_revision/answer_payload/accepted_at/actor/correlation; unique(response_id,revision_no); sourceledgerเพื่อrecoveryไม่copyคำตอบลงaudit                                       |
| AttemptOperationReceipt | attempt_id/verifiedactor/operation_kind/operation_id/payloadhash/status/acceptedrevision/resultrefs; unique(attempt_id,operation_kind,operation_id); startscopeใช้opportunityก่อนมีattempt ห้ามretrievalนอกowner/currentgrant |
| submit manifest         | attemptversionและitem-ref/revisionครบชุดที่commitแล้ว; รับrevisionhashไม่รับคะแนน/Key/เวลาclient ไม่มีคำตอบชุดใหม่แอบข้ามautosave                                                                                             |

receiptและpayloadhashผูกcanonicalschemaที่มีรุ่น ห้ามhashclientเป็นหลักฐานเพียงอย่างเดียว Keyเดิมpayloadต่างให้409 ไม่ทำmutationใหม่ Keyเดิมpayloadเดียวที่commitแล้วคืนackเดิมภายใต้grant ตรวจauthzก่อนlookup/ตอบreceipt ไม่เปิดprivateexistenceจากoperation_id

saveบริการตรวจowner/item/currentgrant/state/deadline/schemaก่อนwrite แล้วlockAttemptก่อนResponseด้วยลำดับเดียวกับsubmit CAS expected_revision=currentrevision จึงเพิ่มrevisionและappendledger/receipt/auditในtransactionเดียว ไม่commitเฉพาะreceiptแต่คำตอบหายหรือให้revisionจากclientข้ามค่า

## 3 ตัวอย่างคำตอบเก่าไม่ทับคำตอบใหม่

สมมติserverrevision4 จากคำตอบDEMOไม่ใช่คนจริง TabAและTabBต่างอ่านrevision4 Aส่งoperation_A/base4และcommitrevision5 Bส่งoperation_B/base4ภายหลังต้อง409 ไม่มีoverwrite5 หากpacketAซ้ำต้องคืนack5จากreceiptโดยไม่เพิ่มrevision6

เมื่อ409 clientอ่านcurrentrevisionตามgrantแล้วให้ผู้เรียนเลือกข้อมูลที่จะเก็บ หรือแสดงว่าค่าตรงกับserverและยืนยันการsyncตามpolicy ไม่retryคำตอบเก่าด้วยbase5อัตโนมัติ เพราะจะกลายเป็นoverwriteคำตอบใหม่หลังconflict แม้ค่าถูกแก้ในtabเดียวต้องไม่เล่นqueuepacketเก่าทับผลใหม่

## 4 Offline queue และreload

ต่อหนึ่งitem clientมีoperationที่กำลังส่งหนึ่งรายการและคิวeditใหม่ที่ยังไม่ส่ง เก็บoperation_id/base_revision/payload/ref/contextต่อattempt ไม่สร้างoperation_idใหม่ให้packetที่ผลcommitยังunknown ACKมาผิดลำดับไม่ลดrevisionหรือเปลี่ยนคำตอบที่ผู้เรียนกำลังแก้

เมื่อofflineและpolicyอนุญาต เสนอpersistentdraft queueเช่นIndexedDBแยกตามverifiedaccount/attempt/item สำหรับข้อมูลสมมติ ต้องwriteสำเร็จก่อนแสดง“เก็บร่างในเครื่องแล้ว” เมื่อreloadตรวจsession/ownerปัจจุบันจากserverก่อนrestore/render/sync อ่านack/receipt/revisionจริงก่อนreplay ไม่สร้างattemptใหม่เพราะbrowserไม่มีstate

การเก็บคำตอบในเครื่องเป็นpolicy Q008/Q025/Q016 ที่ยังไม่รับรอง ไม่เก็บKey/seed/token/คำตอบไว้ในURLหรือlog ไม่ใส่draftในsharedcache/serviceworker โดยอ้างofflineเป็นเหตุ การแยกnamespaceหรือเข้ารหัสclientอย่างเดียวไม่ได้พิสูจน์ป้องกันXSS/ผู้ใช้เครื่องร่วม ไม่รับรองว่าsignout/revokeล้างเครื่องที่offlineได้ทันที

โหมดDEMOต้องกำหนดlocalretention/ล้างเมื่อlogout-switchaccount/expiryและวิธีตรวจquota/privatebrowser/storageerrorก่อนใช้งานจริง ถ้าpersistentwriteไม่ผ่านหรือpolicyห้ามเก็บในเครื่อง ให้แจ้งชัดว่าร่างยังไม่ถูกเก็บและreloadอาจสูญหาย ห้ามบอกว่าบันทึกสำเร็จ ระบบยังไม่รับรอง“คำตอบไม่มีวันหาย”เมื่อผู้ใช้ล้างstorage/ปิดprivatebrowserหรือเครื่องเสีย

เมื่อconnectกลับ currentservergrant/withdrawal/time/stateต้องผ่านก่อนreplay หากrevoked/expired/sentแล้วให้haltqueueและแสดงrecoveryตามpolicy ไม่แก้score/submitโดยใช้คำตอบlocalที่ไม่ทันdeadline การเข้าสู่ระบบใหม่resumeได้เฉพาะbindingเดิมที่ยืนยัน ไม่เชื่อemail/person_idจากqueue

## 5 Submit, clocks และcrash recovery

ก่อนsubmit clientflushdraftและรอackทุกรายการ แล้วส่งexpectedrevisionmanifestของชุดที่ตนยืนยัน หากoffline/unknowncommit/conflictยังไม่เสร็จให้แสดงยังไม่ส่ง ห้ามส่งserverdraftเก่าเงียบๆหรือclientelapsedเพื่อขยายเวลา

autosaveและsubmitต่างlockAttemptก่อนResponse ชนะตามCAS/เวลาserverหลังlock ถ้าส่งfinalแล้วsavelateให้stateconflict ไม่แก้finalresponses ถ้าsavecommitก่อนsubmitแต่manifestclientเก่าต้อง409และให้ตรวจคำตอบใหม่ ไม่มีsnapshotผสมrevision

คำตอบที่serverรับก่อนdeadlineยังเก็บได้ แต่ไม่ได้แปลว่าจะsubmitสำเร็จหลังdeadline automaticexpiry/autosubmit/grace/retakeตามpolicy Q007/Q017ต้องรับรอง หากยังไม่มีให้pauseexpiredattemptไม่gradeหรือเปลี่ยนคำตอบเอง โดยแสดงเหตุผลที่ปลอดภัยจากserver

crashก่อนcommitต้องrollbackคำตอบ/revision/receipt/audit/outboxทั้งหมด Retryทำครั้งแรกได้ crashหลังcommitก่อนHTTPackต้องคืนreceiptเดิม ไม่มีgradingหรือLearningPlanซ้ำ workerinputhash/revision/leaseและcurrentauthorityต้องตรวจตาม11/25 หากproviderภายนอกไม่รองรับdedupeห้ามอ้างexactlyonce ในบท26ไม่มีการส่งออกนอกdevsink

## 6 กรณีเตรียมตรวจรับ — P26ทั้งหมด NOT RUN

| Case   | ทำซ้ำเมื่อ25และfoundationพร้อม                                                        | ผลที่ต้องassert                                                                                                         |
| ------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| P26-01 | เลือกทั้ง9กลุ่มและPRE blueprintรุ่นตรึง รวมpoolquotaไม่พอ/ข้อต่างระดับ                | canonicalattempt/group/manifestถูก; NOT_READYไม่ลดquotaหรือใช้officialทดแทน                                             |
| P26-02 | startretrykeyเดิม/หลายtabคนละkeyในopportunityเดียว/crashก่อนหลังcommit                | Attempt+Items/startreceiptครั้งเดียว ไม่จัดคำถามใหม่จากretry Retakeต้องserver-issuedopportunityใหม่                     |
| P26-03 | seed+algorithm+canonicalpoolreplay/choiceorderหลังreloadและquestionv2                 | snapshot/order v1เดิมไม่joinlatest serverseedไม่ออกlearner/network/log                                                  |
| P26-04 | savekeyเดิมpayloadเดิม/ต่างpayload/invalidchoiceจากข้ออื่น                            | ackเดิมหรือ409/schema deny ไม่เพิ่มrevision/คำตอบซ้ำ                                                                    |
| P26-05 | A/Bbase4แข่งรับ5แล้วส่งpacketเก่า/baseผิด/ACKกลับช้า                                  | CAS409ไม่ทับ revisionไม่ย้อน Clientไม่autoเปลี่ยนbaseเพื่อเขียนคำตอบเก่า                                                |
| P26-06 | offlinepersistentqueueแล้วreload/reconnect/ackหาย/quotaerror/logoutswitch             | acknowledgedserveranswersคง Unsentdraftกู้ได้เมื่อpolicy/storageผ่าน ไม่มีsilentlossหรือdraftคนอื่น/คำว่าsavedปลอม      |
| P26-07 | flushpendingแล้วsubmit/retry/ปลอมsubmitted/is_final/scoreจากclient                    | finalsnapshotตามackedrevision receipt/gradingrevisionครั้งเดียว flags/คะแนนservercontrolled                             |
| P26-08 | autosaveแข่งsubmitและmanifestเก่า พร้อมnativeconcurrency                              | conflict/rollbackหรือlinearizedsnapshot ไม่มีlateoverwritefinal/ผสมrevision                                             |
| P26-09 | deadlineก่อน/ตรง/หลัง/รอlockข้ามdeadline/clientclockเปลี่ยน/retryacceptedreceipt      | serverinstantและpolicyบังคับเวลาจริง acceptedretryไม่mutationใหม่ เปลี่ยนclientclockไม่เปลี่ยนคะแนน                     |
| P26-10 | learnerAส่ง/อ่านattemptBแก้URL/body/query/person-org/group/item refs/directRPC/export | currentowner/action/RLSdeny ไม่มีresponse/key/existenceoracleข้ามคน/พื้นที่                                             |
| P26-11 | revoke/suspend/หมดassignment/401แล้วreauth/replay/workerretry                         | currentpolicydenyหรือresumeเฉพาะownerเดิม ไม่ใช้rightsจากqueue/seed/jobเก่า                                             |
| P26-12 | objective/writingawaitingmanual/TopicMappingoverlap/หัวข้อไม่วัด/planretry            | pinnedexactscore partialไม่เท่ากับ0 ไม่มีdoublecount/noevidenceคำแนะนำ Planversionไม่ซ้ำไม่เพิ่มgrantหรือofficialresult |
| P26-13 | ก่อนsubmitตรวจnetwork/HTML/RSC/JS/media/cache/error/gradepreviewและfeedbackหลังส่ง    | ไม่มีseed/key/Explanation/hiddenrubricก่อนส่ง หลังส่งต้องowner/releasepolicyผ่านไม่เปิดkeyทั้งแถว                       |
| P26-14 | withdrawระหว่างทำ เปลี่ยนหลักสูตร/key/topic/rubric/planrule และregrade                | currentwithdrawalpolicyใช้จริง v1pins/historyคง score/planrevisionใหม่มีหลักฐาน ไม่แก้auditเดิม                         |
| P26-15 | keyboard9กลุ่ม/375/768/1024/1440/aria-live/conflict/empty/networkstatus               | focus/labelsและสถานะข้อความใช้ได้ ไม่อ้างresponsiveผ่านจากเอกสาร                                                        |

หลักฐานprivateแต่ละexecutionต้องมีsource/migration/policy/fixture refs, actor/scopes/clock, actualHTTP/assert/faultpoint, before-aftermanifest/revisions/receipt/effectcounts ไม่มีrawคำตอบ/token/password/keyในpubliclogs ไม่มีintegration/nativePG/browsertestsของ26ให้เรียกในrepositoryตอนนี้

## 7 Gateและข้อจำกัด

เกณฑ์reload/networkretryไม่ทำคำตอบหายหรือattemptซ้ำ **BLOCKED / NOT RUN** เกณฑ์คนอื่น/เวลาclientไม่เปลี่ยนคะแนน **BLOCKED / NOT RUN** การตรวจMarkdown/IDsไม่ใช้แทนCAS/lock/receipt/clockที่ทำงานจริง

Q007/Q024ต้องretake/activeopportunity/quota/sampling/scoring/topicaggregation/rubric/learningplanconfig Q017ต้องdeadline/grace/expirylinearization Q008/Q025/Q016ต้องofflinebrowserstorage/feedback/retention Q023/Q011ต้องauthbinding/DAL/RLS/transaction/worker/lease/currentrevoke Q018/Q019/Q021ต้องbrowser/accessibilityจริง

schema/app0.6.0 Prisma7.10.0 Next16.3.8 core19models/213scalarfields/migration1ไม่เปลี่ยน ไม่เพิ่มroutes/services/migration/seed/executabletests ต้องปิด25และdependencyเดิมก่อนimplementation26 ไม่เลื่อนไป27จากแบบเอกสาร

## 8 ผลตรวจจริงรอบเอกสาร26

| คำสั่ง/วิธี                                                                                                                                | ผลจริงและขอบเขต                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Python inlineตรวจตาราง/contracts/routes/caseIDs/links/schema/package/migrationhash                                                         | PASS: 7concept contractsแบบเสนอ/6route contractsไม่ซ้ำ/15caseIDs/45local linksไม่ขาด; core19models/213scalarfields/migration1/checksumเดิม learningREADME-only |
| `corepack pnpm exec prettier --ignore-path /dev/null --check docs/PRETEST_FLOW.md docs/PRETEST_AUTOSAVE.md src/modules/learning/README.md` | PASS เฉพาะ3ไฟล์ที่ระบุ                                                                                                                                         |
| `git diff --check` / `git diff --cached --check` / `corepack pnpm secrets:check`                                                           | PASS ไม่มีwhitespaceerrorหรือรูปแบบsecretที่ตัวตรวจรองรับ ไม่ใช่ตรวจความปลอดภัยครบ                                                                             |
| nativePG/route/autosave/reload/offline/retry/clock/grading/privacy/browser                                                                 | NOT RUN ไม่มีimplementation26และprerequisite25ยังBLOCKED                                                                                                       |

migration SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน ไม่รันunit/lint/typecheck/build/SQLWASM/nativeDB/environmentprobeใหม่ ไม่ใช้rootunit17จาก23เป็นผล26 ไม่มีrouteในตารางถูกเรียกสำเร็จหรือgradeจริง ผลตรวจเอกสารไม่ปิดเกณฑ์ผู้ใช้ทั้งสองข้อ
