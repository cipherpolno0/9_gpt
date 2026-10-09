# หน้ายืม คืน ซ่อม และส่งมอบ กับแผนตรวจรับ — บท 50

รุ่น 0.1 | 8 ตุลาคม 2569 (2026-10-08) | source `3441054` | **Proposal / BLOCKED: ยังไม่มีหน้า routes/server actions ที่ใช้งานได้**

ใช้ [ASSET_LIFECYCLE](ASSET_LIFECYCLE.md), [ASSET_CUSTODY_HISTORY](ASSET_CUSTODY_HISTORY.md) และ sharedUI09/auth08/DAL07/files10/workflow-audit-outbox11 เดิม ไม่สร้างlogin/หน้าติดต่อหรือengineใหม่

## 1 หน้าและบริการที่เสนอ

| หน้า                             | Flow และ server contract                                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| /app/inventory/assets/[asset_id] | แสดงเจ้าของ/ผู้รับผิดชอบ/ผู้ถือของ/ที่ตั้ง/คำขอแยกส่วน ประวัติvalid_at/known_atและรายการค้างตามscope                         |
| /app/inventory/loans             | draft/resume/returned correction/CAS/หลักฐาน→review→approveAndReserveLoan→handoverLoan; availabilityจากserver ไม่เชื่อclient |
| /app/inventory/returns           | receiveReturn→inspectAndCloseLoan บันทึกphysicalcustody/สภาพ/อุปกรณ์/ผลตรวจ; damage/claim/repair holdปิดความพร้อมต่อ         |
| /app/inventory/maintenance       | request/approveHold→startMaintenance→receiveFromRepair→inspectAndReleaseHold; ค่าใช้จ่ายและbudget refsแยกจากยอดจ่าย          |
| /app/inventory/custody           | draft/review/applyCustodyHandover อ้างassignment/versionเดิมและสองscope; ผู้รับใหม่ไม่เป็นเจ้าของหรือมีgrantอัตโนมัติ        |

ชื่อบริการเป็นสัญญาเสนอ ไม่มีplaceholdercodeรับtraffic Clientส่งresource IDs/revision/quantityหรือmoneystringsที่เกี่ยวข้อง/evidenceversion/idempotencykey serverresolveidentity/สิทธิ์/วัน/สภาพ/ยอดเอง ถ้าbusiness sourceหรือpolicyไม่ครบแสดงเหตุผลและคงdraft ไม่สร้างgrant/คำอนุมัติจากclient

ใช้keyboardทั้งเลือกPerson/asset/ที่ตั้งและส่งฟอร์ม labelsไทย ชื่อหน่วยทุกช่อง error summary/focus/CAS conflict/empty stateอธิบายวิธีแก้ statusเป็นข้อความ รองรับ375/768/1024/1440 มีกลับมาต่อและtextlinkแทนQR รายงาน/GET/exportไม่มีside effectsหรือสร้างpayment privateperson/price/evidence/claimไม่ออกpublic response/HTML/cache/static assets

## 2 Cases ที่ต้อง execute เมื่อ dependencyพร้อม

| Case   | หลักฐานที่ต้องได้จริง                                                                                                                       | สถานะ   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| P50-01 | draft/returned resume/revision→approval claim→physicalhandover→due/overdue→returnreceived→inspectionclosed; ไม่availableก่อนตรวจ            | NOT RUN |
| P50-02 | approve/reserveหรือhandoverชิ้นเดียวพร้อมกันสองnativeconnections barrierก่อนlock หนึ่งbusinessclaim/activeLoan อีกคำขอconflict              | NOT RUN |
| P50-03 | Loanactive/returnpending/reservation/repairhold/maintenance/closed-damaged/openclaim/disposed/inactive ไม่ให้ยืมซ้ำ; unknownstatefailclosed | NOT RUN |
| P50-04 | approveLoanแข่งstartMaintenance/closeReturn/custody/revokeddisposal status writer ใช้assetlockเดียว ไม่มีloanและซ่อมที่ขัดกัน               | NOT RUN |
| P50-05 | samekey/hashretry/newhashconflict/newkeysameoperation/CAS ไม่doublehandover/return/claim/event                                              | NOT RUN |
| P50-06 | physicalreturnยังไม่inspected สภาพเสียหาย/อุปกรณ์ขาด/claim แยกloanphysicalclosedจากavailabilityและliability                                 | NOT RUN |
| P50-07 | repairfinish/expectedend/workerlateยังไม่releaseจนinspect; exactcost/unknownNULL/currency/approvedbudget refs ไม่autoจ่าย                   | NOT RUN |
| P50-08 | custodyhandoverสร้างช่วงใหม่/oldnames-place-docsคงเดิม Persontransfer/resignationeventretryไม่เลือกคนแทนอัตโนมัติ                           | NOT RUN |
| P50-09 | valid_at/known_at/half-open/same-day timestamp/future/correctionreplaces อ่านต้นเรื่องได้ ไม่มีhistoryหาย                                   | NOT RUN |
| P50-10 | primarycustodyช่วงซ้อนข้ามPersonถูกปฏิเสธ ส่วนsecondarykindเฉพาะpolicy ไม่autoRoleAssignment/ownership                                      | NOT RUN |
| P50-11 | Loan/asset/person/place/org/file IDsข้ามscopeผ่านURL/body/export/job/QR/privateHTMLcacheไม่ได้ ตรวจสองscope                                 | NOT RUN |
| P50-12 | maker/techdeny/delegationexpiry/suspend/revokedworker/currentAuthDAL/directlimitedSQL ไฟล์notCLEANหรือACLdenyไม่post                        | NOT RUN |
| P50-13 | failpointsclaim/loan/return/maintenance/custody/location/event/projection/receipt/audit/outbox/beforecommit rollbackทั้งหมด                 | NOT RUN |
| P50-14 | commitแล้วresponseหาย/workerrestart-deliveryACK durableinbox/devsinkdedupe/deadletter ไม่event/notificationซ้ำ                              | NOT RUN |
| P50-15 | ค้างคืนเวลาserver/reload/networkretry/ไม่มีบัญชีPerson/ผู้ยืมถูกระงับมีauthorizedintake ไม่มีautoforgedreturn                               | NOT RUN |
| P50-16 | Thai keyboard/labels/focus/empty-error/4viewports/read-onlyreport/export/print/filedownload privacy                                         | NOT RUN |
| P50-17 | current/historyprojectionreconcile source manifests/pinnedversions/oldnames ไม่ใช้latestjoinหรือ0ซ่อนsourceหาย                              | NOT RUN |
| P50-18 | unknownauthority/custody/repairliability/rounding/closedperiod/futureconflicts/returnrecovery/adaptersไม่พร้อมdeny มีpolicyTO VERIFY        | NOT RUN |

เกณฑ์50-01ผูกP50-01–07/10–15/18 เกณฑ์50-02ผูกP50-08–12/16–18 ทั้งสอง **BLOCKED** ต้อง49/47/ส่วนกลาง/nativeDB/models/migrations/ADR/servicesจริงก่อนทดสอบ `db:test` ปัจจุบันเป็นcore06 runner ไม่executeP50 ไม่ใช้fixture/PGlite/mockauthแทนnativeacceptance

เก็บexecutionmanifestprivate: commit/DB+migration/policy/sourcehash/actorscope/valid-known dates/expected-actual/SQLSTATE/receipt/evidence/audit/outbox/ผู้ทดสอบ/ปัญหา โดยไม่มีsecretsหรือข้อมูลจริง typecheck/lint/build/nativeDB/API/UI/browser/scan/worker/loan-repair-budget/concurrency/ownerUAT **NOT RUN รอบ50**

หลังปิดblockerและทำruntime50จึงตรวจครบ18กรณี บท51รอพรอมป์ต์และdependency ไม่อ้างว่าตัวอย่างได้ผ่านการรับรองพัสดุหรือการเงิน
