# แผนเปิดใช้เว็บไซต์เดียวครบเก้าระบบ

รุ่น 0.1 | บท72 | 9 ตุลาคม 2569 | **NO_GO / BLOCKED / PLAN_ONLY**

ยังไม่อนุญาตเปิดใช้งานจริง บท71ยังไม่ผ่าน clean staging หรือ restore drill และ [UAT_MASTER](UAT_MASTER.md) ยังไม่มีผลรับรอง การเตรียมเอกสารไม่ใช่การตรวจรับระบบหรือคำสั่ง deploy ใช้ [release plan](../tests/fixtures/release/release-plan.json) และ [ผลจริงบท72](../tests/results/lesson72-results.json) แยกจากแผนอย่างชัดเจน

## 1 แนวคิดและสถานะที่ตรวจพบ

Release checklist ถามว่าแต่ละเงื่อนไขมีหลักฐานของรุ่นที่จะเปิดใช้แล้วหรือยัง ส่วน handover ถามว่าผู้รับงานได้รับคู่มือ สิทธิ์ ความรู้ และฝึกกู้คืนได้จริงหรือยัง การมีไฟล์คู่มือหรือผล unit test ไม่ทำให้ทั้งสองข้อผ่านโดยอัตโนมัติ

Baseline `cef51f8` มี starterหน้าแรกและ core19models รุ่น0.6.0 โมดูลธุรกิจเก้าชุดมี README/สัญญาออกแบบ แต่ยังไม่มีบริการธุรกิจ Login/บัญชีและ DAL, FileVersion/scan, workflow/outbox และงานธุรกิจของ workerยังขาด `/app/[[...path]]` ปฏิเสธทุก method403/no-store ไม่ใช่ portalที่ใช้งานครบ ไม่สร้างทะเบียนคน หน่วยงาน ใบสมัคร หรือ loginอีกชุดเพื่อทำให้ checklistดูผ่าน

CIบท71อยู่นอก workflowsและยังไม่ทำงาน Staging/providerrefsยังว่าง การติดตั้ง clean checkoutบท71 offlineล้มเหลวและ normal installtimeout55.071s; nativecoreและ workerreadinessexit1 ไม่มี backupหรือ restoredfiles/accountsที่ตรวจแล้ว [lesson71-results](../tests/results/lesson71-results.json) เป็นหลักฐานของรอบ71 ไม่ใช่ผลรันใหม่บท72

## 2 Checklist สำหรับแต่ละระบบ

ทุกแถวต้องมี implementationของรุ่นจริง, executable tests, negative read/mutate/export/download/approve/worker, scope/time/delegation, maker-checker, UATที่เจ้าหน้าที่รับรอง และ training/คู่มือที่ตรวจจากหน้าจอจริง ใช้ [HANDOVER](HANDOVER.md) เชื่อม REQ/UC/test/UAT/manual ตามรหัสเดิม

| ระบบ / ownerเสนอ | เงื่อนไขเฉพาะก่อนเปิด                                                               | กฎหรือแบบที่ต้องยืนยัน                                             | หลักฐานและสถานะปัจจุบัน                                                |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 01 / O01         | คนเดียวหลายหน้าที่ ประวัติวันมีผล/บันทึก การเปลี่ยนหน้าที่เพิกถอนสิทธิ์             | จศป.ทุกแท่ง อำนาจ/มอบหมาย publicfieldpolicy                        | UAT01 BLOCKED; มี corePerson ไม่ businessflow                          |
| 02 / O02         | Organizationกลาง ที่ตั้งย้อนหลัง สนามแม่บทแยกสนามรายรอบ/ผู้รับข้อสอบ                | รหัสหน่วย ผังพื้นที่ รูปแบบที่อยู่และการเปิดสนาม                   | UAT02 BLOCKED; มี coreOrganization ไม่ centerworkflow                  |
| 03 / O03         | pre/lesson/post แยกผลทางการ accessibility/captions/rubricผู้ตรวจ                    | เนื้อหา สิทธิ์คัดลอก เกณฑ์สมมติแยกเกณฑ์ยืนยัน                      | UAT03 BLOCKED; ยังไม่มี learningruntime                                |
| 04 / O04         | draft/revision/return/impact/checker/activation/tracking รักษาผู้สมัครเมื่อปิดหน่วย | ประเภทคำขอ ผู้มีอำนาจ วันมีผล แผนจัดการผู้ได้รับผลกระทบ            | UAT04 BLOCKED; ยังไม่มี requestruntime                                 |
| 05 / O05         | Enrollment/Application/snapshotกลาง seatlock/scorebatch/rule/secondchecker/release  | ศ.1/2/3/4/5/6/8ตามหลักฐานจริง คุณสมบัติ คะแนน fieldpolicy/ผู้เยาว์ | UAT05 BLOCKED; แบบและเกณฑ์ TO VERIFYไม่ผลิตผลทางการ                    |
| 06 / O06         | exactledger จอง→ผูกพัน→จ่ายไม่ทับ ย้อนยอด/reversal/ปิดงวดได้                        | แหล่งเงิน หมวด วงเงิน อำนาจ/มอบหมาย rounding/closepolicy           | UAT06 BLOCKED; ไม่มี ledgerและnativeconcurrencyผ่าน                    |
| 07 / O07         | partialreceipt/unitversions/stocklock/custody/loan/repair/stocktake/disposalhistory | จัดซื้อ ภาษี แปลงหน่วย จำหน่าย ค่าเสื่อมที่ยืนยัน                  | UAT07 BLOCKED; ไม่ถือรับของเท่ากับจ่ายเงิน                             |
| 08 / O08         | numberlock/approvedversion/recipient snapshot/receipt/ACL/hold/evidence             | แบบหนังสือ ชั้นความลับ retention/signingproviderและอำนาจ           | UAT08 BLOCKED; hashหรือapprovalไม่เป็น digital signatureที่รับรอง      |
| 09 / O09+O05     | template→boundedparse→dryrun→atomiccommit→Application05เดียว/retry/recovery         | machine schema/หมายเหตุ/identity/evidence/เพดานจากผลจริง           | UAT09 BLOCKED; ไม่มี parser/commitworkerผ่าน ไม่อนุมัติจากข้อความอิสระ |

## 3 Checklist ส่วนกลางและ release authorization

| Gate                                   | หลักฐานที่ต้องมีในรุ่นเดียวกัน                                                                     | สถานะปัจจุบัน / ownerเสนอ       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------- |
| G72-01 เจ้าของและอำนาจ                 | รายชื่อแต่งตั้ง scope/ช่วงมอบหมาย ผู้ปล่อยรุ่น ผู้รับงาน/นโยบาย                                    | PENDING_UNSIGNED / C01+O01–O09  |
| G72-02 ข้อมูลและกฎ                     | basis/purpose/field/retention/minors/template/rule decisions อ้างเอกสารและรุ่นจริง                 | NEEDS_LEGAL_REVIEW / C03+owners |
| G72-03 implementationและtests          | core/business/negative/nativeconcurrency/recoveryสามเส้นทาง ผ่านตามscope                           | BLOCKED / C02+owners            |
| G72-04 UATและtraining                  | UATรายระบบ+ข้ามระบบ screenshotsสมมติ attendance/competencyและผู้รับรอง                             | PENDING_UNSIGNED / owners+C04   |
| G72-05 environment                     | cleanstaging/HTTPS/login/admin/DB/files/worker9smokes, immutableartifact/migrationcompatibility    | BLOCKED / C02                   |
| G72-06 security/capacity/accessibility | ปิด riskตาม [SECURITY_REVIEW](SECURITY_REVIEW.md) พร้อม privatecache/scan/log/advisory/limits/a11y | BLOCKED / C02+C03               |
| G72-07 monitoring/support              | dashboard/alertsที่ทดสอบถึงผู้รับเวรจริง ช่องทางกลาง เบอร์/เวลาบริการที่ยืนยัน                     | NOT_CONFIGURED / C02+C04        |
| G72-08 backup/recovery                 | coherent DB+fileversions+ACL+keys+identity restoreแยก และ reconciliation/เวลา/RPO/RTOที่รับรอง     | NOT_RUN / C02+owners            |
| G72-09 centralportal                   | บัญชี Person Organization Application Document เมนู/ติดต่อชุดเดียวใช้จริง                          | NOT_PROVEN / C02+C04            |
| G72-10 deploymentauthorization         | appointedauthorizer, approvedpilot/scope/window, commit/artifactdigest, evidence/gatesและลายเซ็น   | NOT_AUTHORIZED / C01            |

ไม่มีชื่อ/วันที่/ลายเซ็น/หน่วยนำร่องที่อนุมัติแล้วในรอบนี้ Authorizationต้องผูก environmentและรุ่นเฉพาะ คำสั่งบท72อนุญาตเตรียมแผน ไม่ใช่อนุญาตdeployโดยปริยาย ห้ามใช้การยอมรับความเสี่ยงทั่วไปข้าม Criticalหรือข้อมูลจริงที่ยังไม่มีนโยบาย เงื่อนไข TO VERIFY ปิดเฉพาะ featureทางการที่เกี่ยวข้อง การทดสอบสมมติแยกยังดำเนินต่อได้

## 4 การเปิดเป็นระยะเมื่อ gatesผ่าน

| ระยะ                    | ขอบเขตเสนอ                                | เข้า/ออกระยะ                                   | สถานะจริง                  |
| ----------------------- | ----------------------------------------- | ---------------------------------------------- | -------------------------- |
| R0 เตรียมและแก้ blocker | source/docs/isolated TEST เท่านั้น        | ปิดB72และ71/70dependenciesพร้อมหลักฐาน         | กำลังเตรียมเอกสาร ไม่ live |
| R1 stagingสมมติ         | เก้าระบบและสามเส้นทางข้ามระบบในพื้นที่แยก | native/tests/UAT/recoveryและdenyครบ            | NOT_STARTED                |
| R2 หน่วยนำร่อง          | เฉพาะหน่วย/scope/ข้อมูลที่ได้รับอนุมัติ   | G72-01–10ครบ authorization/version/windowชัด   | NOT_STARTED; pilotrefsว่าง |
| R3 ขยายพื้นที่          | เพิ่มเฉพาะหน่วยที่ฝึกและสิทธิ์พร้อม       | ตรวจ7วัน/30วันและrisk/restoreผ่านก่อนแต่ละwave | NOT_STARTED                |

ไม่ระบุจำนวนหน่วยหรือประเทศที่รองรับจนทดสอบ workload/เครื่องจริง นำร่องไม่สร้างข้อมูลกลางสำเนาแต่ใช้ scoped accessใน portalเดียว การย้ายข้อมูลใช้ reconciliation/หลักฐานต้นทาง ไม่ importข้อมูลจริงเพื่อทดลองสิทธิ์

วันเริ่มจริง T0ว่างทั้งหมด หลัง approvedT0จึงคำนวณตาราง: ตรวจทุกวันช่วง T0ถึงT0+14วัน เวลา09:00 Asia/Bangkokเป็นข้อเสนอ ร่วมowners/C02/C03/C04; นัด review T0+7 และT0+30วันตาม [POST_RELEASE_REVIEW](POST_RELEASE_REVIEW.md) ยังไม่มีนัดหมายหรือส่งข้อความจริง

## 5 Freeze criteria และการเปิดกลับ

| Triggerเสนอ — พบหนึ่งกรณีต้องหยุดประเมิน                        | Freeze scopeขั้นต่ำ                                                       | ผู้ประสานเสนอ  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------- |
| F72-01 งบผิด/คงเหลือติดลบ/จองหรือจ่ายซ้ำ                        | writesอนุมัติ/จ่ายของ budgetlineที่เกี่ยวข้องและprocurementconsumer       | O06+O07+C02    |
| F72-02 ใบสมัคร/Personซ้ำ หรือ seatเกิน/ซ้ำ                      | submission/importcommit/seatallocationของรอบที่กระทบ                      | O05+O09+C02    |
| F72-03 private/minordata/หนังสือลับรั่ว หรือข้ามscope           | read/search/export/download/cacheและtokensที่รั่ว; ระงับช่องทางตามผลกระทบ | C03+C02+owner  |
| F72-04 ประกาศคะแนนผิด/draftหรือถอนแล้วโผล่                      | affectedrelease/publicAPI/HTML/cache/export                               | O05+C03+C02    |
| F72-05 stockติดลบ/รับซ้ำ/ยืมชิ้นเดียวซ้ำ                        | goodsreceipt/issue/transfer/custodyของitem/locationที่กระทบ               | O07+C02        |
| F72-06 ไฟล์เปลี่ยนหลังอนุมัติ หรือ replayมีผลซ้ำ                | delivery/activation/consumerที่เกี่ยวข้อง เก็บ sourceversion/evidence     | O04+O08+C02    |
| F72-07 restoreไม่ได้/keyสูญหาย/backupไม่ครบ/monitoringจำเป็นล่ม | หยุดขยายพื้นที่และwritesที่ไม่สามารถกู้คืนได้ตามrisk                      | C01+C02+owners |

ตัวเลข zero-toleranceด้านความถูกต้องและสิทธิ์เป็น triggerเสนอ ไม่ใช่ SLAทางการ latency/error/queue thresholdsยังรอworkloadพิสูจน์ตามบท69 ระดับfreezeต้องป้องกันผลกระทบจริงทุกช่องทาง ไม่ถือการแก้เอกสารหรือซ่อนเมนูเป็น runtimefreeze ห้ามลบ transaction/events/filesเพื่อทำให้ยอดตรง ใช้ [SUPPORT_RUNBOOK](SUPPORT_RUNBOOK.md) และ [ROLLBACK_RUNBOOK](ROLLBACK_RUNBOOK.md) เปิดกลับหลังตรวจต้นเหตุ/แก้/negative/reconcile/recoveryและauthorizationใหม่ ไม่ใช้เฉพาะ health200

## 6 คำตัดสินและสิ่งที่ยังต้องส่งมอบ

คำตัดสินรอบ72คือ **NO_GO** ตาม prerequisite/implementation/UAT/deployment/restore gaps ไม่ได้ลงนามแทนผู้ใช้ Checklistครบในระดับแผน แต่ AC72-01ยังขาด implementation/tests/UATจริง และ AC72-02ยังพิสูจน์ centralportalใช้งานจริงไม่ได้ ติดตาม owner/วันเป้าหมายเสนอใน HANDOVER และ release-plan วันที่เหล่านี้ไม่ใช่กำหนดเปิดจริง ไม่เริ่มบทถัดไปอัตโนมัติ
