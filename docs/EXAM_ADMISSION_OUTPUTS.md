# รายชื่อผู้เข้าสอบและบัตรสอบ — บท 37

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) เวลาไทย | source `db51163` | **Proposal / BLOCKED — ไม่มีรายชื่อ/บัตรสอบ/PDFจริง**

ต่อ [APPLICATION_EXPORT](APPLICATION_EXPORT.md), [FORM_TEMPLATE_REGISTRY](FORM_TEMPLATE_REGISTRY.md), [SEAT_ALLOCATION](SEAT_ALLOCATION.md), [APPLICANT_REVIEW_IMPACT](APPLICANT_REVIEW_IMPACT.md) ไม่สร้างPerson/Application/registryหรือloginอีกชุด แบบบัตร/บัญชีผู้เข้าสอบทางการยังไม่มีไฟล์รับรอง ไม่จับคู่กับศ.3หรือแบบศ.อื่นโดยเดา

## 1 Output contract ที่เสนอ

| Output                 | ข้อมูลจากpinsเดียวกัน                                                                                                                                 | สิทธิ์/เงื่อนไข                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| รายชื่อผู้เข้าสอบภายใน | application snapshot/terminalapproval/activeallocationrevision/seatnamespace/displaynumber, year/type/level/stage/center/calendarและmanifest revision | grantหน่วย/สนาม/รอบตามactionและfieldpolicy scopeก่อนquery/count/export ไม่มีบัตรไทย/เบอร์ส่วนตัว/เหตุผล/evidencecontents |
| บัตรสอบของตน           | ชื่อ/ฉายาขณะสมัคร referenceเลขที่นั่ง สนาม/รอบ/วันสอบจากรุ่นที่รับรอง สถานะ/รุ่นบัตรและreplacementref                                                 | verifiedUser–Person/selfgrantหรือผู้แทนที่รับรอง currentapproved+allocated/validตามpolicy ไม่รู้IDแล้วdownloadได้        |
| ประวัติ/amendment      | เลข/สนามเดิมและใหม่ allocationrevision/order/effective/recorded refs รายงานผลกระทบตามหน้าที่                                                          | เหตุผลและหลักฐานแยกACL รายชื่อปีเก่าใช้pinsเดิมไม่latestjoin                                                             |
| DEMO preview           | snapshotสมมติ + DEMOseat rule/layout/context พร้อมป้ายทุกหน้า                                                                                         | ไม่ตรา/ลายเซ็น/แบบทางการ ไม่อ้างว่าใช้เข้าสอบจริง                                                                        |

Approvalอย่างเดียวไม่มีที่นั่งหรือบัตรใช้งานได้เมื่อpolicyต้องallocationก่อน Templateverifiedไม่ทำให้ผู้สมัครผ่านapprove การwithdraw/amendในอนาคตต้องแสดงvalidityตามวันที่จริง ไม่ออกบัตรสนามใหม่ก่อนคำสั่งมีผลเอง

## 2 Manifest และความถูกต้อง

ตรึงapplication/snapshot/decision/allocationrevision/namespace/seat claim/rule/template/layout/calendar/source versions และhash/member orderให้รายชื่อกับบัตรจากชุดเดียวกัน ไม่selectlatestnameหรือlatestseatแล้วพิมพ์ประวัติปีเก่าใหม่

ข้อมูลตรวจสอบปัจจุบันแยกจากภาพบัตรที่issuedไว้ หากมีamendmentแล้วให้หน้าดูแสดง “มีฉบับแทน” พร้อมเลขเดิม→ใหม่/สนาม/วันมีผลตามสิทธิ์ currentvalidityจากserver ไม่เปลี่ยนไฟล์บัตรเดิมลับ ๆ และไม่อ้างลบPDFที่ผู้ใช้ดาวน์โหลดแล้วได้

QR/barcodeหากเจ้าของต้องการใช้เป็นopaque reference ไม่PII/sessiontokenหรือdownloadgrantในตัว publicverificationต้องนโยบาย/allowlistใหม่ที่รับรองก่อนเปิด ขณะนี้ไม่สร้างpublicendpointเพื่อให้ใครรู้referenceแล้วอ่านข้อมูลผู้สมัคร ทุกread/print/export/download/cache/workerตรวจcurrentACL ตาม36และบริการเอกสารที่จะพัฒนาต่อ

## 3 Rendering และความเป็นส่วนตัว

ตามMASTERใช้HTMLprint/Sarabun5.3.0/A4ตามแบบที่ได้รับ ไม่มีrenderer/print route/PDF/ExcelJSadapterใหม่ใน37 ต้องทดสอบชื่อไทย สระวรรณยุกต์ ศูนย์นำหน้า เลขreference/seatเป็นtext หลายหน้า fontloaded/embeddedและภาพจริง ไม่CSSfont-familyหรือtext extractionอย่างเดียว

ไฟล์ผลเป็นprivate ใช้purpose-specificDTOไม่ดึงข้อมูลทั้งPerson/คนทั้งหมดมาให้browserซ่อนฟิลด์ รายชื่อ/A4 printview/RSC/HTML/cache/metadata/notification/errorsห้ามfullPII evidenceobjectkeysหรือprivatephone เก็บauditmanifestrefs/hash/correlationไม่password/tokenหรือชื่อผู้ค้นเต็มชุด

Withdrawn/supersededcardต้องpolicyกำหนดสิทธิ์อ่านประวัติและcurrentvalidity gatewayตรวจทุกrequestเมื่อจำเป็นrevokeทันที ไม่อ้างsignedstorageURLที่ออกแล้วเพิกถอนทันที Jobตรวจสิทธิ์ผู้ร้อง/recipientและรุ่นที่withdrawตอนrender/download Retryคืนartifact/receiptเดิมอย่างมีสิทธิ์ไม่สร้างseatใหม่

## 4 Gate และตรวจรับ

P37-03/11/14/16ในSEAT_ALLOCATIONเป็นแผน ไม่มีactualcard/roster/nativeallocation/privacy/cache/QR/browserผ่านใน37 ไม่มีpublicresult/คะแนน/ใบสมัครทางการเพิ่ม

ทั้งสองเกณฑ์37ยังBLOCKED สถานะและtemplate rulesTO VERIFYต้องหลักฐาน/ผู้รับรอง ไม่ใช้DEMOรับรองกฎจริง ต้องผ่าน36และต้นทางก่อนimplementation บท38ยังไม่เริ่ม ไม่push/deploy
