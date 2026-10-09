# ตรวจคนที่สอง ล็อกคะแนน และรับรองผล — บท 38

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) เวลาไทย | source `4e91fad` | **Proposal / BLOCKED — ไม่มี locking/grading/certification/amendment services จริง**

ใช้ [GRADING_RULES](GRADING_RULES.md), [SCORE_IMPORT_REVIEW](SCORE_IMPORT_REVIEW.md), [APPLICATION_STATES](APPLICATION_STATES.md), [SEAT_ALLOCATION](SEAT_ALLOCATION.md), [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md) ไม่สร้างengineอนุมัติใหม่ บันทึกต้นทางผู้ทำและผู้ตรวจที่verified ไม่service credentialหรือroleจากclientเป็นauthority

## 1 ตรวจคนที่สองก่อนล็อกชุดคะแนน

ผู้ตรวจคนที่สองต้องคนละmakerผู้นำเข้า/แก้สาระของrevision รวมprincipalการมอบอำนาจตามนโยบาย ตรวจdiff/รายการใหม่/คะแนน/status/identity-context/หลักฐาน/rule/pins/member set/checksum ตรงกับbatchrevisionที่ตัดสิน ไม่checkboxหรือackของrevisionเก่า ต้องcurrentassignment/action/scopeขณะตัดสินและCAS

ต้องแก้blocking errors missing/extra/duplicate/seat-subject-range/evidence ให้เป็นผลที่policyรับรองก่อนlock warningแก้หรือรับทราบได้เฉพาะruleที่ยอมรับ ไม่genericforceignore อำนาจและจำนวนผู้ตรวจเพิ่มเติมตามวิชา/กระบวนการยังTO VERIFY ไม่เดาว่าคนที่สองเพียงคนเดียวแทนอำนาจทุกขั้นได้

## 2 สถานะข้อมูลที่เสนอ

| สถานะProposal | ความหมาย/guard                                                                             |
| ------------- | ------------------------------------------------------------------------------------------ |
| DRAFT         | staging/raw ยังไม่ตรวจครบ ไม่มีacceptedscore                                               |
| REVIEWING     | checkerกำลังตรวจbatchrevision/manifest/diff ไม่approvedscore                               |
| RETURNED      | ส่งกลับพร้อมreasonที่fieldACLกำหนด แก้revisionใหม่ไม่เปลี่ยนraw/คำตัดสินเดิม               |
| LOCKED        | checkerdecisionตรงรุ่นแล้ว sealacceptedbatch/SubjectScore revisions atomic ห้ามeditค่าเดิม |
| CALCULATED    | ผลคำนวณจากaccepted score/rule/algorithm pins ยังไม่ผลรับรอง                                |
| CERTIFIED     | canonicalhuman certification ตรงResultDraft/manifestที่ตรวจ ยังไม่publicrelease            |

เป็นlifecyclecontractไม่enumจริงในPrisma ไม่ใช้Applicationstatusหรือlearningcertificationแทน เรียงขั้นตอนต้องbackendguard ผู้รับรองสุดท้ายอาจเป็นผู้ตรวจคนที่สองหรืออีกผู้มีอำนาจตามpolicyที่ยืนยัน แต่ต้องไม่makerของคะแนนที่รับรอง ไม่เดาว่าต้องมีบุคคลที่สามเสมอ

## 3 Transaction และการรับรองที่เสนอ

| ขั้น                | Contract                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C38-01 Context      | currentaccount/grants/assignment/maker-checker/serverbindings/expectedrevision พร้อมstable guardของbatch/score aggregate/roster/rule/evidence/workflow              |
| C38-02 Revalidate   | ทบทวนvalidation/expected completeness/currentwithdrawal/context/gradeevidence/pins/checksumและcheckerdecision ไม่dryrunเก่าเป็นgrant                                |
| C38-03 Lock scores  | typedunique/CAS/receiptและimmutableacceptedSubjectScore revisions+batchseal+checker/audit/outbox atomic; fault rollbackทุกส่วน                                      |
| C38-04 Calculate    | อ่านlockedmanifestและexactscore/rule/algorithm versionsอย่างdeterministic เก็บResultDraft/Item/ScoreLinks/trace/hash ไม่latestjoinหรือofficialoutcomeจากunknownrule |
| C38-05 Certify      | ผู้มีอำนาจcurrentstep/scopeรับรองResultDraftรุ่นที่ตรวจและOFFICIALverifiedsource/rules เมื่อDEMOเก็บmodeDEMOแยกไม่CERTIFIED_OFFICIAL                                |
| C38-06 Commit/audit | decision/certificationmanifest/receipt/audit/outboxตามcommand atomic แจ้งdevsinkหลังcommit ผ่านworkerที่ตรวจสิทธิ์ ไม่publishผลจากcertifyเอง                        |

writersแก้source/evidence/rule/roster/score revisions/amendmentต้องprotocolguard/lockorderเดียวกันหรือserializationที่รับรองและnative testsพิสูจน์ ล็อกแถวbatchอย่างเดียวไม่ป้องกันแหล่งอีกตารางเปลี่ยน receiptผูกactor/command/resource/key/fingerprint retrypayloadเดียวคืนผลเดิมภายใต้currentgrant payloadต่าง409 keyใหม่ไม่เพิ่มscore/certificationdecisionของrevisionเดิม

## 4 Checksumที่มีความหมาย

source_file_sha256เป็นhashbytesต้นฉบับ แยกจากcanonicalmanifesthashของtypedcontext/members/raw locators/decimal-status/evidence-source refs/normalizedrows/parser-schema/rule/score/allocation/snapshot versions เรียงcanonicalorderingและserializationversionที่กำหนด ไม่checksumยอดรวมอย่างเดียวหรือชื่อไฟล์/เวลาupload

acceptedmanifestและresultmanifestคนละhash อ้างinputhashที่ใช้พร้อมrecorded_by/checker/certifier/correlation/recorded_at เก็บdecimalเป็นrepresentation canonicalที่validateตามschema ไม่float locale/ambiguousencoding ผู้เปลี่ยนค่าหนึ่งหรือสลับcontext/member setต้องchecksum/revisionเปลี่ยนและreviewใหม่ Hashพิสูจน์ความตรงbytes/input ไม่พิสูจน์ว่าคะแนนถูกหรือเอกสารแท้ ต้องhumanreview/provenance/currentACLด้วย

## 5 แก้หลังล็อกเป็นคำขอแก้ไข

| ขั้นแก้ไขเสนอ      | หลักฐาน/ผลที่รักษา                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| เปิดเรื่อง         | อ้างbatch/score/result revision/hash/sourcefile/decisionเดิม พร้อมเหตุผล/evidence/ข้อเสนอค่าใหม่และผู้เสนอในscope                                               |
| ตรวจและอนุมัติ     | currentmaker-checker/workflow/rule/authority/ผลกระทบต่อผลรับรอง/เอกสาร/งานค้าง/การเผยแพร่ที่ownerเกี่ยวข้อง ถ้าขาดโมดูลให้NOT_READYไม่unknown0                  |
| มีผล               | transactionเพิ่มSubjectScore/result revisionsและsupersedes/amendment refsตามdue/CAS/receipt อ้างruleและinputที่อนุมัติ เก็บoldmanifest/decision/auditไม่rewrite |
| คำนวณและรับรองใหม่ | ผลใหม่ต้องpins/trace/newhuman decisionตามpolicy ไม่อนุมัติคะแนนเท่ากับผลใหม่certified/publishedเอง                                                              |

returned/rejected/cancelled amendmentไม่เปลี่ยนชุดล็อกเดิม retryเรื่องที่มีผลแล้วไม่เพิ่มscore_version/resultversionอีกย้อนหลัง การแก้คะแนนไม่เปลี่ยนเลขที่นั่ง/Person/Applicationเก่าเพื่อให้matchผ่าน เรื่องที่มีผลต่อResultReleaseภายหลังต้องownerworkflowของการเผยแพร่ก่อนเปลี่ยนpublic ไม่สร้างResultReleaseใน38

## 6 Gate และตรวจรับ

P38-06–14/16/18ในGRADING_RULESเป็นแผน ไม่มีchecker/CAS/score lock/certify/amendment/DB grants/consumer/ResultDraftจริง ทั้งสองเกณฑ์38ยังBLOCKED ไม่มีaccepted/resultmanifestจริงเพื่อrecomputeหรือเปรียบเทียบchecksum ไม่ใช้learningtablesว่างอ้างisolationผ่าน

ไม่มีschema/migration/runtimeเพิ่ม ต้องผ่าน37และส่วนกลางก่อนimplementation/nativeAPI/worker/fixture execution บท39ยังไม่เริ่ม ไม่push/deploy
