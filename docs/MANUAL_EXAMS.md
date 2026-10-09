# คู่มือบัญชีผู้สมัครและผลสอบ — บท 40

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) | source `37a30c0` | **คู่มือ flow เสนอ / BLOCKED — หน้าจอและบริการยังไม่มีจริง**

คู่มือนี้สำหรับreviewขั้นตอนกับเจ้าหน้าที่ ไม่ใช่คู่มือระบบที่เปิดใช้งานแล้ว อ่าน [UAT_SYSTEM_05](UAT_SYSTEM_05.md) ก่อนใช้ ทะเบียนผู้เรียน/ผู้สมัคร/Person/Organization/ปี/สนาม/บัญชี/เอกสาร/แจ้งเตือนร่วมทั้ง9ระบบ importer9ใช้บริการสมัคร05เดียวกัน ไม่มีloginหรือบัญชีสมัครสำเนา ส่วนติดต่อเราใช้หน้ากลางเดียว

## 1 แยกข้อมูลก่อนเริ่ม

| เรื่อง | ความหมายและข้อควรตรวจ |
| --- | --- |
| Person / Candidate | คนกลางหนึ่งรายการ Candidateเชื่อมคนเดิมข้ามปี ไม่สร้างจากการสะกดชื่อคล้ายและไม่รวมอัตโนมัติ |
| Enrollment / Application | สมัครเรียนแยกจากสมัครสอบ การมีEnrollmentไม่เป็นการอนุมัติApplication/ที่นั่ง |
| ปี/ประเภท/ช่วงชั้น/ระดับ/รอบ | AcademicYearไม่ใช่FiscalYear นักธรรมตรี/โท/เอกไม่ใช้stageธรรมศึกษา ธรรมศึกษาประถม/มัธยม/อุดมแยกจากตรี/โท/เอก |
| Raw / Accepted / Calculated / Certified / Published | คะแนนรับเข้าหรือรับรองไม่ใช่ผลที่เปิดpublic ต้องผ่านpublicationapprovalและfieldpolicyอีกขั้น |
| Snapshot / Current | ใบสมัครและประกาศปีเก่าเก็บชื่อ/สังกัด/บริบทเดิม การเปลี่ยนชื่อปัจจุบันไม่แก้ผลเก่า |
| DEMO / OFFICIAL | ตัวอย่างสมมติไม่เป็นผล/แบบทางการ TO VERIFYปิดการผลิตofficialแม้เปิดทดลองได้ภายหลัง |

## 2 เจ้าหน้าที่สำนัก/สถานศึกษา/สนาม

1. เข้าบัญชีเดียวผ่านprovider08ที่ตั้งค่า ตรวจหน้าที่/พื้นที่/ช่วงมอบหมายปัจจุบัน ไม่เลือกorg_idเพื่อขยายสิทธิ์เอง ขณะนี้login/workspaceจริงยังBLOCKED
2. เลือกAcademicYear/ExamSession/ประเภท/ระดับ/ช่วงชั้นและสังกัดที่ได้รับมอบหมาย ตรวจหน้าต่างสมัคร/สนามเปิด/ความจุจากconfigurationมีรุ่น ไม่ใช้วันจากเว็บเก่าหรือclientclock
3. ค้นPersonกลางด้วยรหัสอ้างอิงที่ยืนยัน ดูคู่ชื่อคล้ายให้เจ้าหน้าที่ตรวจ ไม่สร้างคนใหม่เพราะเปลี่ยนชื่อ ไม่มีเลขไทยให้ใช้หลักฐานทางเลือกที่นโยบายรับรอง ไม่กรอกเลขหรือที่อยู่สมมติให้ดูเป็นคนจริง
4. ลงEnrollmentเมื่อสมัครเรียน แล้วApplicationสำหรับสมัครสอบตามbusinesskeyและกฎที่รับรอง บันทึกdraft/กลับมาแก้ได้ การretryใช้receiptเดียวไม่สร้างหลายใบ
5. ตรวจชื่อขณะสมัคร/ชื่อเดิม/ประโยคเดิม/fieldrequirementsและversionedeligibility แนบหลักฐานผ่านบริการเอกสารกลางprivatequarantine→scan→ACL ไม่แนบpublicfolder; ยังไม่ผ่านตรวจใช้ส่งอนุมัติไม่ได้
6. ตรวจทานก่อนส่ง: ข้อมูลครบ หลักฐานและcontextถูกต้อง snapshotversionตรง หากrevisionconflictโหลดรายการล่าสุดและตรวจความต่างก่อนส่ง ไม่แก้ทับเงียบ ๆ
7. returnedให้แก้ตามเหตุผลและrevisionแล้วส่งคำขอเดิมใหม่; rejected/withdrawnติดตามhistory ไม่ลบเรื่อง/หลักฐานหรือออกseatเอง

ข้อผิดพลาดและstateรายละเอียดตาม [APPLICATION_STATES](APPLICATION_STATES.md), [ELIGIBILITY_RULES](ELIGIBILITY_RULES.md), [ROSTER_WORKSPACE](ROSTER_WORKSPACE.md) การเห็นชื่อในหน้าร่างไม่ถือว่าสมัครสอบอนุมัติแล้ว

## 3 ผู้ตรวจและผู้อนุมัติผู้สมัคร

ตรวจcurrentgrant/action/scope/delegation/dateทั้งอ่านและตัดสิน ผู้สร้างห้ามอนุมัติงานสำคัญของตน ผู้ดูแลเทคนิคไม่มีอำนาจธุรกิจอัตโนมัติ ตรวจduplicate/eligibility/sourceevidence/currentperson-centerstatusและรายการผลกระทบก่อนapprove

ออกseatเฉพาะapprovedApplicationในสนาม/รอบที่เปิดและยังเหลือความจุ serviceใช้transaction/unique/receipt ไม่แจกเลขจากExcelหรือหน้าclient หากคนอื่นใช้ที่นั่งสุดท้ายก่อนcommitให้conflictและตรวจใหม่ ไม่เพิ่มcapacityโดยไม่มีอนุมัติ ไม่เดาว่าseatnumberต้องไม่ซ้ำทั้งประเทศทุกปี

สนาม/บุคคลยุติสถานะหลังสมัครต้องรายงานผลกระทบ ไม่ย้ายสนามหรือเลขที่นั่งเงียบ ๆ การแก้หลังissueใช้approvedamendmentเก็บold/new/เหตุผล/หลักฐานและแจ้งเจ้าของ อ่าน [SEAT_ALLOCATION](SEAT_ALLOCATION.md), [APPLICANT_REVIEW_IMPACT](APPLICANT_REVIEW_IMPACT.md), [EXAM_ADMISSION_OUTPUTS](EXAM_ADMISSION_OUTPUTS.md)

## 4 เจ้าหน้าที่คะแนนและผู้รับรอง

1. เลือกcontextปี/ประเภท/ระดับ/วิชา/สนาม/รอบตรงรายชื่อapproved seats ใช้scorefile/provenanceที่อนุญาตส่งผ่านเอกสารกลางและscorestaging ไม่นำคะแนนฝึกระบบ3มาปน
2. ตรวจreportmissing/extra/duplicate/unknownseat/wrongsubject/year/type/range/context อย่าบังคับrowที่ผิดให้เป็นacceptedเพื่อให้จำนวนครบ แก้ที่sourceด้วยreceipt/versionตามกฎ
3. ตรวจruleversion/algorithm/range/rounding/evidenceและexpectedrostercoverage คะแนนraw/accepted/calculatedคนละชั้น ข้อเขียนต้องผู้ตรวจ/rubric ไม่ใช้ปรนัยหรือAIสร้างผลผ่าน
4. ผู้ตรวจคนที่สองตรวจความต่างกับpinnedsource/checksum/revision คนสร้างหรือบันทึกชุดนั้นไม่รับรองของตนเอง เมื่อdataเปลี่ยนให้conflict/เริ่มreviewrevisionใหม่
5. lock/certifyด้วยcurrentgrantและtransaction เก็บrule/manifest/scorebatch/sourcehash/ผู้ตรวจ/เวลา การแก้หลังlockใช้approvedamendmentและrecertify ไม่เขียนทับคะแนนเดิม

อ่าน [SCORE_IMPORT_REVIEW](SCORE_IMPORT_REVIEW.md), [GRADING_RULES](GRADING_RULES.md), [RESULT_CERTIFICATION](RESULT_CERTIFICATION.md) **ไม่มีเกณฑ์ผ่านทางการในคู่มือนี้** ยังต้องผู้เชี่ยวชาญยืนยัน การรับรองผลไม่ทำให้publicอ่านได้เอง

## 5 ผู้เผยแพร่ ผู้ค้นผล และการแก้ประกาศ

ผู้มีpublicationgrantคนละreleasecreatorตรวจcertifiedpassmanifest/approvedfields/เด็ก/เวลา/แหล่งแบบ/วัตถุประสงค์ตามpolicyที่รับรอง Sealรายชื่อและsource snapshotปีนั้น ผู้ไม่อยู่ในscope/หมดassignment/ระงับบัญชีทำผ่านAPI/jobไม่ได้ และไม่มีไฟล์ศ.4/8ที่verifiedครบให้คงOFFICIALBLOCKED

Publicค้นเฉพาะปี/type/level/stage/ชื่อsnapshot/สำนักที่policyอนุญาต จำกัดpagination/rateไม่bulk dump ไม่มีบัตร/DOB/เบอร์/ที่อยู่/เหตุผลภายใน/เอกสารส่วนตัว Privateownerต้องUser–Personlinkยืนยัน เจ้าหน้าที่ตรวจgrantและfieldpolicyทุกview/export/download ไม่ใช้queryเพื่อขอprivatefields

เมื่อพบผลผิดหลังประกาศ ให้เปิดคำขอแก้มีเหตุผล/หลักฐาน คนละผู้ตรวจ/ผู้อนุมัติ และย้อนsource score amendment/recertifyก่อนออกreleaseรุ่นใหม่ตามเหตุที่ผิด คงoldrelease/audit/source lineage การถอน/แทนรุ่นเพิ่มvisibilityepochและoutboxinvalidation ตรวจlivegateทุกครั้งแม้workerช้า ลิงก์signed/ไฟล์ที่ส่งแล้วไม่อ้างว่าเรียกคืนbytesทันที; หากต้องrevokeการอ่านครั้งถัดไปใช้gatewayตรวจACL/visibilityตามระบบ10

อ่าน [RESULT_PUBLICATION_POLICY](RESULT_PUBLICATION_POLICY.md), [RESULT_SEARCH_CONTRACT](RESULT_SEARCH_CONTRACT.md), [RESULT_RELEASE_RECOVERY](RESULT_RELEASE_RECOVERY.md) เปิดpublicย้อนหลังของoldsuperseded/withdrawnต้องpolicyอนุมัติแยก ไม่เผยprivateเหตุผลผ่านลิงก์tracking

## 6 แบบฟอร์ม UAT และการขอความช่วยเหลือ

ศ.1/2/3/4/5/6/8ยังTO VERIFYใน [FORM_TEMPLATE_REGISTRY](FORM_TEMPLATE_REGISTRY.md) ไม่เดาศ.3หรือmappingศ.4/8จากเมนู แบบที่ใช้จริงต้องsourceedition/hash/meaning/purpose/type/level/stage/year/fields/layout/rights/ผู้ตรวจครบและผ่านUATกับเจ้าหน้าที่ ผู้เชี่ยวชาญแยกรับรองกฎสอบจากsoftwaretests DEMOlayoutต้องระบุไม่ใช่แบบทางการทุกหน้า ไม่fallbackเมื่อOFFICIALถูกปิด

แจ้งปัญหาผ่านช่องทางติดต่อกลางที่เจ้าของโครงการยืนยัน (Q005) ส่งsafe correlation/ปี/context/revision/ขั้นตอนและข้อความผิดพลาดที่ลดข้อมูล ไม่ส่งpassword/token/secret/เลขบัตร/scorefilesคนจริงในlogหรือissueสาธารณะ คู่มือนี้ไม่มีช่องทางติดต่อจริงหรือชื่อเจ้าหน้าที่ที่เดาขึ้น

สถานะปัจจุบัน **ยังไม่มีหน้าจอขั้นตอน2–5ให้ใช้งาน** ใช้คู่มือนี้reviewและเตรียมUATเท่านั้น ไม่ใช้ผลตรวจบทอื่นแทนกรณีตรวจรับบท40: 26cases/48runsทั้งหมดNOT RUNตามUAT_SYSTEM_05 ต้องผ่าน35–39จริงก่อนตรวจรับ ไม่เริ่มบท41
