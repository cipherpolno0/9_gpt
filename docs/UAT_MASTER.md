# ตรวจรับงานข้ามระบบกับเจ้าหน้าที่ — บท 68

รุ่น0.1 | 9 ตุลาคม 2569 (2026-10-09) | baseline `8ea0c36` | **BLOCKED / PENDING_SIGNOFF — ยังไม่ผ่าน E2E หรือ UAT**

อ่าน [BLUEPRINT](../BLUEPRINT.md), [TEST_RESULTS](TEST_RESULTS.md), [INTEGRATION_MAP](INTEGRATION_MAP.md), [TEST_MATRIX](TEST_MATRIX.md) และ [UAT_SIGNOFF_TEMPLATE](UAT_SIGNOFF_TEMPLATE.md) บท67ยังBLOCKED ไม่มีบัญชี/grants/FileVersion/workflow/owner servicesหรือnativePGที่รัน3เส้นทางได้ ตอนนี้ /appทุกmethod403/no-store ไม่ใช่หน้าธุรกิจ

รอบ68ตรวจใหม่: db:test/worker:check exit1; buildผ่านและ HTTPsmoke27รายการผ่านเฉพาะstarter ไม่เป็นPlaywright/businessE2E พบplaywright library1.62.1จากenvironment แต่ไม่ใช่dependencyที่ประกาศในpackage ไม่มี @playwright/test/config/e2e script ไม่พบbundledChromiumหรือChrome/ChromiumในPATH ไม่มีbrowserถูกเปิด ไม่มีscreenshots/traceหรือผู้ตรวจรับจริง อ่านหลักฐาน [lesson68-results](../tests/results/lesson68-results.json)

## 1 วิธีทำทีละขั้นเมื่อ dependencyพร้อม

1. แยกการทดสอบซอฟต์แวร์จากการรับรองเนื้อหา/แบบ/กฎทางการ ผลE2Eผ่านไม่ปิด TO VERIFY
2. ให้เจ้าของงานยืนยันผู้ทดสอบ ผู้รับรอง อำนาจ scope และช่วงมอบหมายก่อนใช้บัญชี TEST_ จากบัญชีกลางเดียว ห้ามสร้างloginต่อโมดูล
3. ตั้งisolatedDB/backend/files/scan/workerจริงตาม67 โหลดข้อมูลสมมติและconfigรุ่นทดลองที่ชัด ไม่มีข้อมูลบุคคลจริงหรือproduction credentials
4. ทำขั้นตอนผ่านUIจริง ใช้requestและsourceIDs/versions/receiptsตรวจว่าบันทึกแล้ว ไม่route.fulfillตอบsuccessหรือsetbrowserstateเพื่อปลดล็อกงาน
5. หยุดเครือข่าย/workerในสภาพแวดล้อมทดลอง แล้วฟื้นและตรวจจำนวนรายการ/ledger/สิทธิ์ต้นทางก่อนหลัง ไม่ให้notification/reportfailureทำsourceซ้ำ
6. เก็บภาพจากหน้าจอจริงหลังprivacycheck พร้อมevidence manifest/รุ่น/เวลา ทุกหลักฐานอยู่ตามACL ไม่เติมภาพตัวอย่างให้ดูเหมือนมีผลรันแล้ว
7. เจ้าหน้าที่ลงผลรายcaseและรายการค้าง ผู้มีอำนาจรับรองตามtemplateเอง ผู้พัฒนาไม่ลงชื่อ/วันที่/อำนาจแทน

## 2 สามเส้นทางข้ามระบบและการเรียนที่แยกต่างหาก

ใช้ [E2E_CASES](../tests/e2e/E2E_CASES.md)18case plans + [fixture](../tests/fixtures/e2e/uat-plan.json) ไม่มี executableใหม่หรือ actualPerson/Application/FileVersion/grant IDs

| flow                                    | UI stepsที่ต้องทำเมื่อพร้อม                                                                                                                                                                                               | persisted pass criteria / recovery                                                                                                                                                                                                                  | สถานะจริง       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| E68-01 บุคคล→สิทธิ์→หนังสือ             | TESTผู้เสนอร่างแก้สถานะ/หน้าที่และแนบไฟล์กลาง → ส่ง → checkerคนละคนตรวจ/อนุมัติรุ่น → ก่อนวันมีผลยังpending → activationมีผล → currentrightsของหน้าที่เดิมยุติ → หนังสือแจ้ง08อ้างdecision/FileVersionเดิม                | Person/assignment historyไม่หาย effective/recordedแยก; selfapproveไม่ได้; explicitnewgrantเท่านั้น ไม่grantจากชื่อหน้าที่; notificationretryไม่หนังสือ/receiptซ้ำ recipientACKต้องกดเอง                                                             | BLOCKED_NOT_RUN |
| E68-02 สนาม→แต่งตั้ง→Excel→สอบ→ประกาศ   | Request04เปิดสนาม → owner02มีผล → แต่งตั้งประธาน/ผู้รับจากPerson01ตามปี/session → upload/scan/dryrunแก้error → commitผ่านApplication05 → approve/seat → scorestaging/mismatch → checkerคนที่สองรับรอง → DEMOreleaseและค้น | คน/หน่วย/ใบสมัครชุดเดียว; appointmentไม่ครบมีimpactไม่เลือกคนแทน; seatunique/capacity; missing/wrong/outofrangeไม่certify; publicก่อนrelease/หลังwithdrawไม่มีผล; historicalname snapshotคงเดิม; retryExcel/paymentไม่sourceซ้ำ                     | BLOCKED_NOT_RUN |
| E68-03 แผนงบ→พัสดุ→จ่าย→ยืม/นับ→หนังสือ | แผนอนุมัติ → request07จองผ่าน06 → Orderconvertreserveเป็นcommitment → partialreceipt/inspection → stock+assetregister → certifiedpayment → loan/handover/return → stocktake/approvedadjustment → record08อ้างไฟล์กลาง     | exactbudget100000 reserve20000/commit20000/pay5000 available80000 unpaid15000; รับบางส่วนไม่closeทั้งorder/chargeซ้ำ; assetactive loanหนึ่งเดียว; discrepancyต้องreviewledger event ไม่overwrite; retryreceive/pay no duplicate; ไม่มีโอนธนาคารจริง | BLOCKED_NOT_RUN |
| L68-01 การเรียน03แยกofficial05          | pretestตามกลุ่ม → submit → บทเรียน/กิจกรรมcompletionที่backendตรวจ → resume → posttest → ผลเรียน/รอrubricchecker                                                                                                          | ทั้ง9learninggroupsมีlessonก่อนposttest; reload/autosave revisionไม่lostanswer; ไม่มีanswer keyก่อนส่ง; scorepracticeไม่officialresult ไม่อนุมานเหตุจากpre/postสองครั้ง                                                                             | BLOCKED_NOT_RUN |

Exam flowเสนอ parameterizationนักธรรมตรี/โท/เอก3ชุด +ธรรมศึกษาประถม/มัธยม/อุดม×ตรี/โท/เอก9ชุด=12combinations จากสัญญา05/09 มีตัวตนมี/ไม่มีเลขไทยตามverifiedidentity policyไม่name merge ทั้งหมดNOT_RUN กลุ่มการเรียน9กลุ่มเป็นประชากรแยกไม่ปะปนกับ12examcombinations ไม่ใช้ผลแบบทดสอบเรียนสร้างคะแนนสอบ

DEMOrelease/config/หนังสือทดลองต้องติดTEST_และไม่ออกแบบหรือผลทางการ หากform/eligibility/grading/publication/authorityยังTO_VERIFYให้ปิดOFFICIAL ทุกครั้ง ไม่ใช้E2EDEMOผ่านแทนรับรองแบบศ.3หรือกฎทางการ UATแยกตรวจหลักฐานแบบจริงกับเจ้าของงานตาม [FORM_TEMPLATE_REGISTRY](FORM_TEMPLATE_REGISTRY.md), [GRADING_RULES](GRADING_RULES.md), [RESULT_PUBLICATION_POLICY](RESULT_PUBLICATION_POLICY.md)

## 3 UAT script เจ้าหน้าที่9ฝ่าย ผู้เรียนและประชาชน

ทุกแถวเริ่มจากsession TESTที่มีcurrentrole/action/scope/timeกับpositiveA/Bที่สร้างจริงเมื่อพร้อม ใช้UI ไม่directSQLแทนงานมนุษย์ ผู้รับผิดชอบด้านล่างเป็นบทบาทเสนอ ไม่ใช่ชื่อผู้ได้รับแต่งตั้ง ผู้ทดสอบ/ผู้รับรองจริงยังว่างทั้งหมด

| UAT ID / บทบาทรับผิดชอบเสนอ  | ขั้นตอนปฏิบัติและตัวอย่างสมมติ                                                                                | เกณฑ์ผ่านที่ต้องบันทึก                                                                                                             | screenshot checkpointsเสนอ                                | ค้างจริง                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------- |
| U68-01 O01 บุคลากร           | เปิดTESTคน → เสนอแก้พร้อมหลักฐาน → ให้checkerคนละคนอนุมัติ → ดูก่อน/หลังมีผลและสิทธิ์เดิม                     | ประวัติ/decision/FileVersionตรง ไม่มีselfapproveหรือoldroleaccess; scopedsearchไม่ชื่อB                                            | person-review, effective-history, access-denied           | BLOCKED / PENDING_SIGNOFF |
| U68-02 O02 หน่วยงาน/สนาม     | เปิดสนามแม่บทและsession → เลือกประธาน/ผู้รับด้วยรหัสและสังกัด → ตรวจยุติหน้าที่/นัดส่ง                        | masterไม่session duplicate appointmentมีช่วงเวลา missingมีimpact; publicไม่privatecontacts                                         | center-session, appointment-review, impact                | BLOCKED / PENDING_SIGNOFF |
| U68-03 O03 ผู้สอน/บรรณาธิการ | draftข้อTEST → reviewerคนละคน → publishversion → ดูassigned learner/ข้อเขียนรอตรวจ                            | answerkeyserveronly, versionoldattemptคงเดิม, rubriccheckerแยกผู้เรียน, กลุ่มเล็กไม่leak                                           | question-review, learner-assignment, rubric-queue         | BLOCKED / PENDING_SIGNOFF |
| U68-04 O04 ผู้ตรวจคำขอ       | draft→resume→submit→return→แก้revision→approve→activation                                                     | ปฏิเสธ/ยกเลิกไม่registryeffective; concurrentdecisionหนึ่งชุด; documentsapprovedversion                                            | request-before-after, returned-correction, decision       | BLOCKED / PENDING_SIGNOFF |
| U68-05 O05 สมัครและวัดผล     | web/Excelบัญชีกลาง → eligibility → approve/seat → scoremismatch → secondchecker → DEMOrelease/search/withdraw | person/appไม่ซ้ำ seatไม่ซ้ำ/เกินcap mismatchไม่certify; practiceไม่official; ชื่อปีเก่าคงsnapshot                                  | roster-seat, score-review, release-search                 | BLOCKED / PENDING_SIGNOFF |
| U68-06 O06 การเงิน           | แผนเสนอ/ตรวจ/อนุมัติ → reserve/commit/partialpay → retry/reversal → reportledger                              | available80000/unpaid15000ตามตัวอย่าง; maker/วงเงิน/grantsคุม; invoiceซ้ำไม่payซ้ำ FYไม่AY ไม่มีbanktransfer                       | budget-approval, balance-ledger, payment-receipt          | BLOCKED / PENDING_SIGNOFF |
| U68-07 O07 คลัง/ครุภัณฑ์     | partialreceipt/inspect → issue/transfer → registerasset/loan/return → stocktake/adjust                        | stockไม่negative assetnoactive2loan ซ่อมไม่ยืม adjustmentreviewed ราคา/แหล่งงบ/historyไม่หาย                                       | partial-receipt, custody-return, stocktake-difference     | BLOCKED / PENDING_SIGNOFF |
| U68-08 O08 สารบรรณ           | draft→review→approvefrozenversion→number→send→recipientACK→assign/complete                                    | ผู้รับชื่อซ้ำเลือกตัวตนด้วยID ACLทุกversion งานretryไม่receipt/เลขซ้ำ; ACKไม่notificationopened; holdไม่destroy                    | recipient-confirm, delivery-history, hold-status          | BLOCKED / PENDING_SIGNOFF |
| U68-09 O09 นำเข้าExcel       | templateTEST → upload/scanner → dryrunerror → newbatchcorrect → commit/retry → เปิดApp05/ติดตาม               | textไทย/leading0ไม่เสีย formula/macroreject dryrunไม่createsource; commitatomic/oneAppservice; compensationไม่ลบseat/score/release | row-errors, corrected-preview, actual-app-links           | BLOCKED / PENDING_SIGNOFF |
| U68-10 ผู้เรียน              | เลือกกลุ่ม → pretest/autosave/reload → lesson/resume → posttest/result                                        | 9groups backendordergate, ownresultเท่านั้น noanswerkeysก่อนsubmit ข้อเขียนpendingไม่fakecertified                                 | pretest-resume, lesson-completion, own-result             | BLOCKED / PENDING_SIGNOFF |
| U68-11 ประชาชน               | publicทะเบียน/ปีสอบ/ประเภท/ระดับ/ชื่อที่policyอนุญาต → page/filter → withdrawแล้วค้นใหม่                      | ไม่draft/withdrawn/secretcontacts/เด็กนอกfieldpolicy count/snippet/exportไม่privateB keyboardใช้ได้                                | public-filter, published-demo-result, withdrawn-no-result | BLOCKED / PENDING_SIGNOFF |

Testers11กลุ่มไม่ใช่11บุคคลหรือการแต่งตั้ง O01–O09ผู้แทนจริง/authorityยังQ005/Q013 เครื่องdesktop/mobile/keyboard/slowdeviceให้บันทึกbrowser/viewport/เวลา ไม่อ้างaccessibilityPASSจากภาพอย่างเดียว ผู้เชี่ยวชาญธรรมตรวจเนื้อหาต่างจากsoftwaretester เจ้าหน้าที่การเงิน/สารบรรณรับรองpolicyต่างจากflowPASS

## 4 หลักฐานและความลับ

Evidence manifestเสนอ: run/case/checkpoint/sourcecommit/browser version/testdataset/configversions/actualsource refs/decision/FileVersion/hash/correlation/observed result/screenshot protectedref/redactionreviewer/time ทุกrefต้องของจริงเมื่อรัน ห้ามTESTlabels/UUIDสมมติเป็นruntimeproof รอบนี้ actualrefs=[] screenshots=[] และ reviewers/signatures=null

ถ่ายเฉพาะTESTdataจากหน้าUIจริง ไม่production/บัญชีส่วนตัว ไม่credentials/sessiontoken/cookie/rawheaders/storageState/downloadlinkลับ ห้ามcommitauthenticatedtrace/HAR/storageStateเพียงเพราะชื่อคนเป็นTEST_ เพราะยังมีsecret ใช้private evidence store/ACL/scan/retentionกลาง10/56เมื่อพร้อม ตรวจก่อนshare/downloadexport URLหรือมีlinkไม่grant

Screenshot maskช่วยเฉพาะสิ่งที่ปรากฏในภาพ ไม่รับประกันtrace/networkหมดความลับ หลีกเลี่ยงbody titleลับและข้อมูลจริงตั้งแต่fixture/run ไม่บันทึกauthtraceโดยไม่มีapprovedcapture/redactionplan ภาพผ่านQAต้องเห็นcheckpointที่ต้องพิสูจน์ ไม่blurจนตรวจresultไม่ได้ ชื่อไฟล์ใช้run/case/checkpointopaqueไม่ชื่อบุคคล/หนังสือจริง Hashยืนยันbytesไม่signature/UATapproval

## 5 สถานะ ผลค้าง และ gate

แยก execution=NOT_RUN/BLOCKED/FAIL/PASS_SOFTWARE จาก signoff=PENDING/ACCEPTED/REJECTED/CONDITIONAL โดยเจ้าหน้าที่ผู้มีอำนาจเท่านั้น TestPASSไม่เปลี่ยนsignoffอัตโนมัติ เรื่องcritical privacy/wrongscore/money/stock/doubleApp/noevidenceห้ามconditionalrelease ผู้รับผิดชอบรายการแก้/กำหนดเสร็จ/หลักฐานต้องบันทึกจริง ไม่ตั้งdeadlineหรือชื่อเจ้าหน้าที่เอง

AC68-01 **BLOCKED_NOT_RUN** ทั้ง3crossflows+network/workerrecoverไม่มีผลจริง AC68-02 **PENDING_UNSIGNED** มีรายการค้าง11scriptsกับtemplateว่าง ไม่เซ็นแทนผู้ใช้ ไม่ประกาศผ่านบท68หรือเริ่ม69 ไม่ติดต่อเจ้าหน้าที่/ส่งemail/ลงนาม/เผยแพร่จริงในรอบนี้
