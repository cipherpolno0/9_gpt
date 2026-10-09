# Rollback และ roll forward fix

รุ่น 0.1 | บท71 | 9 ตุลาคม 2569 | RUNBOOK_PROPOSAL / NOT_EXECUTED

ยังไม่มี stagingdeployment หรือ migration/restore drillในรอบ71 เอกสารนี้เป็นขั้นตอนที่ต้องตรวจร่วมกับเจ้าของงาน ไม่ใช่คำสั่งย้อนฐานที่อนุมัติแล้ว ดู [DEPLOYMENT](DEPLOYMENT.md), [BACKUP_RESTORE](BACKUP_RESTORE.md) และ [SECURITY_REVIEW](SECURITY_REVIEW.md)

## 1 ตัดสินใจจากสถานะจริง

| เหตุ                                                  | ทางเลือก                                    | เงื่อนไข                                                                                        |
| ----------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Web artifactผิดก่อนมี schema/data/eventเปลี่ยน        | คืน immutableartifactรุ่นก่อน               | verify previousversion+config+ACL+smokeจริง ไม่ rebuildจากbranchลอย                             |
| Expand migrationแล้ว มี old/newwriters                | คืน appได้เฉพาะพิสูจน์ N/N-1 compatibility  | schema/query/role/event/templateครบ; ห้าม downmigrationตามแค่เลขรุ่น                            |
| Destructive schema/backfillทำให้รุ่นก่อนอ่านไม่ได้    | roll forward fix                            | freezeaffectedwriters, preserve events/audit, reviewed forwardmigrationและreconcile             |
| Ledger/status/custody/resultคำสั่งผิดแต่ commitสำเร็จ | domainamendment/reversalที่ตรวจแล้ว         | อ้างต้นเรื่อง/version/เหตุผล/makerchecker ไม่ SQLdeleteหรือเปลี่ยน historicalevent              |
| Projection/report/notificationผิดหรือ consumerล่ม     | repair/rebuild/replayที่ idempotent         | source transactionยังอยู่ event_id/version/correlationเดิม ไม่โพสต์งบ/stock/ใบสมัครอีก          |
| สูญเสีย DB/files/keys                                 | disaster recoveryจาก coherentverifiedbackup | approvedisolatedrestoreก่อนสลับ target เปิดเผย data loss/reconcileใหม่ ไม่restoreทับใหม่เงียบ ๆ |

## 2 ขั้นตอนรับเหตุและจำกัดผลกระทบ

1. บันทึก incident_id เวลา UTC detection/declaration affectedcommit/schema/migrationchecksum/config/rule/policy version และ correlation ที่เกี่ยวข้อง เก็บ diagnosticsใน private scopeหลัง redaction ไม่ dump.env/password/tokenหรือชื่อเต็มลงlog
2. C02ประเมิน affectedoperationsร่วมกับ owners; C03ตรวจ disclosure/access ถ้าจำเป็นปิดเฉพาะ affected real/public/writefeatureและ pauseconsumersที่เกิดผลข้างเคียง ระบบทดสอบสมมติในพื้นที่แยกดำเนินต่อได้ ไม่เพิ่ม adminbypassเพื่อทำให้บริการกลับมา
3. รักษา sourceevents/ledger/docversions/decision/audit/outboxไว้ แยก pending/retry/committedก่อน replay ไม่ ACKเพียงเพราะเห็น notification ไม่ลบ dedup/receiptเพื่อทำให้ส่งใหม่ง่ายขึ้น
4. ตรวจความครบถ้วนของ backupและ writecutover window พร้อม ownerยอมรับ RPO lossที่ประเมิน อย่าถือ providerbackupมีไฟล์หรือ keysครบโดยอัตโนมัติ เก็บ snapshotก่อนแก้ที่ทำให้สืบย้อน incidentได้ตามสิทธิ์

## 3 Migration ที่ล้มเหลว

1. ตรวจ migrationstatus/finished/failed/transaction stateด้วย restrictedoperatorและ protecteddiagnostics ไม่แก้ applied SQLหรือ checksumใน Git
2. ระบุว่า DDL/dataส่วนใด applyจริง รันซ้ำได้หรือไม่และมี partialbackfill/oldworkersหรือไม่ PGtransactionช่วย atomicบางกรณีแต่ไม่ได้พิสูจน์ทุก migrationstepหรือ externalfilecopy
3. เลือก forwardmigration/recoveryที่ตรวจใน isolatedtargetจาก schemastateเดียวกัน การใช้ migrate resolveต้องมีหลักฐาน reviewedDBstateและผู้อนุมัติ ไม่ markappliedอัตโนมัติเพียงเพื่อให้ deploygreen
4. คืนหรือ deploy compatibleweb/workerartifactพร้อม releaseidเดียวที่ตรวจแล้ว งานที่ยังค้างต้องจำ version/correlation ไม่แปลง eventผิดลำดับเป็นการอนุมัติใหม่
5. ตรวจ RLS/grants/defaultdeny/currentassignment/expireddelegation และ reconciliationledger/stock/results/filesก่อนเปิด affectedwriters ไม่ใช้ db push/reset/drop/seedproductionใน runbookนี้

## 4 Recovery verification และการเปิดกลับ

ใช้ staging smokeใน DEPLOYMENT และ restorechecksใน BACKUP_RESTORE พร้อม negativeauthorization/export/download/search/worker ตรวจ privatecacheisolationและ revokedaccessด้วย ไม่ถือหน้า health200 หรือ SQLSELECT1เป็นการฟื้นธุรกิจสำเร็จ

Verifyงบจากเหตุการณ์ exactdecimal, stockตามunit/location, Application/seat/scorerule/releaseจาก sharedregistry, Document/FileVersion/ACL/scan/hash และ identitylogin/currentrights แล้ว replayduplicate+crashกรณีสามเส้นทาง UAT68 ใน synthetictarget Channelsเงินจริง/bank/NBMS/e-GP/signing/emailไม่เปิดใน recoverytest

ผู้รับผิดชอบ C02/C03/C01และ O01–O09เป็น roleเสนอ ไม่มีแต่งตั้งหรือ signoffแทนบุคคล บันทึกเวลาเปิดกลับ/ผ่านchecks/remainingrisk/ownerdecision/nextaction ถ้าฟื้นเพียงบางส่วนรายงาน PARTIAL ไม่เซ็น PASSทั้งหมด ปัญหาความครบถ้วนหรือ schema compatibilityยังไม่พิสูจน์ให้คง gateและ rollforwardfix

## 5 สถานะรุ่นและหลักฐาน

App/schema0.6.0 lock9 Node24.19.0 pnpm11.28.2 Next16.3.8 Prisma7.10.0 migration `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` เดิม ไม่มี rollback/applyใหม่ในบท71 Evidenceactual rollback/redeploy/DBrestore/workerreplayทั้งหมด NOT_RUN รอ prerequisites70และบริการธุรกิจพร้อม ก่อนตรวจรับ71และเริ่ม72
