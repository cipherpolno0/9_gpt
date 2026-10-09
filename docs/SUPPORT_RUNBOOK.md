# คู่มือรับเหตุ หยุดผลกระทบ และกู้คืน

รุ่น 0.1 | บท72 | 9 ตุลาคม 2569 | **PROPOSAL / ยังไม่มีเวรหรือระบบรับเหตุที่เปิดจริง**

ใช้ [GO_LIVE](GO_LIVE.md) freezecriteria, [ROLLBACK_RUNBOOK](ROLLBACK_RUNBOOK.md), [BACKUP_RESTORE](BACKUP_RESTORE.md) และ [HANDOVER](HANDOVER.md) เจ้าของ/ช่องทาง/เวลาบริการเป็น placeholdersจนได้รับยืนยัน ไม่ได้ส่งข้อความ ตั้งเวร หรือแจ้งเหตุให้บุคคลใดจริง

## 1 ช่องทางเดียวและข้อมูลรับแจ้ง

C04ดูแล contactrecordกลางและทางลัด `/contact` ตาม BLUEPRINT ขณะนี้หน้าและ recordยังไม่พร้อม ประชาชน/ผู้เรียน/เจ้าหน้าที่ใช้ officialchannelที่ได้รับอนุมัติจากต้นทางเดียว ส่วน ticket/incident/evidenceภายในต้องตรวจ ACLและcurrentduty ไม่เผยชื่อผู้เรียน หนังสือ ผลdraft หรือวงเงินของหน่วยอื่นในสถานะสาธารณะ

รับเฉพาะ incidentid, เวลาพบพร้อม timezone, feature/ปีการศึกษาหรือปีงบตามความหมาย, errorcode/correlationหรือ referenceที่จำเป็น, ขั้นตอนสมมติทำซ้ำ, ผลที่คาด/ผลที่เห็น และscopeที่กระทบ ห้ามขอpassword/token/เลขบัตร/ไฟล์ส่วนตัวเต็มทางข้อความสาธารณะ หลักฐานภายในเข้าบริการเอกสารกลางผ่านชนิด/scan/ACLเมื่อพร้อม ไม่อัปโหลด dump/.env/authtrace/raw payloadลงGitหรือCIartifact

ผู้รับเหตุตรวจสิทธิ์ก่อนเปิด file/version/log ไม่ค้นหนังสือของหน้าที่ที่หมดแล้วเพียงเพราะเคยรับเรื่อง ตอบยืนยันการรับแจ้งแยกจากการรับทราบหนังสือ/อนุมัติงานธุรกิจ

## 2 ระดับเหตุและผู้ประสานที่เสนอ

| ระดับเสนอ | ตัวอย่าง / Trigger                                                                                        | การตอบสนอง                                                                                                  | Ownerเสนอ                          |
| --------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| SEV1      | private/minordataรั่ว งบ/stockผิดหรือtransactionซ้ำ คะแนนประกาศผิด authข้ามscopeหรือหลักฐานอนุมัติเปลี่ยน | เริ่มcontainmentทันที หยุดaffectedchannels/ขยายพื้นที่ เก็บsourceauditและแจ้งผู้มีอำนาจผ่านchannelที่ยืนยัน | C02+C03+C01+ownerข้อมูล            |
| SEV2      | worker/เอกสารส่ง/restore/readinessล้มเหลว งานธุรกิจจำเป็นค้างโดยไม่พบข้อมูลผิด                            | หยุดretryที่อาจซ้ำ ตรวจdurablereceipt/outbox/สิทธิ์และrecoveryก่อนทำใหม่                                    | C02+O04/O05/O06/O07/O08/O09ตามเหตุ |
| SEV3      | คู่มือผิด UI/a11yหรือรายงานไม่สำคัญ โดยtransaction/privacyยังถูก                                          | triage/versionedfixและให้เจ้าของตรวจ เก็บในbacklog                                                          | C04+C02+owner                      |

Response time/เวลาบริการ/on-call/escalationcontactและSLAยัง TO VERIFY ไม่กำหนด15นาทีหรือเวลาปิดเหตุว่าเจ้าหน้าที่รับรองแล้ว วันกำหนดแก้แต่ละticketต้องมีผู้รับจริงและยืนยัน ไม่มีเหตุsoftwarecriticalที่ถูกยืนยันจากscannerในรอบนี้ แต่coverageยังขาด ไม่รับรองว่าทั้งระบบไม่มีCritical

## 3 ขั้นตอนปฏิบัติ

1. ตรวจว่าเป็น TEST/staging/productionใด เก็บ releasecommit/schema/rule/policyversionและเวลาที่พบ ยืนยันscope/ผู้ปฏิบัติตามcurrentduty ไม่เข้าด้วยservice/adminbypassเป็นผู้ใช้ทั่วไป
2. ระบุ knowncommitted/pending/unknownoutcome จาก transactionreceiptก่อนretry อย่าใช้หน้าจอtimeoutตัดสินว่าไม่ได้บันทึก source สำเร็จแล้ว notification/reportล้มไม่สร้างsourceใหม่
3. ใช้ authorizedruntimecontrolsหยุดเฉพาะaffectedwriters/consumers/publicrelease/cache/downloadตามF72 ห้ามถือการตั้งค่าใน release-planนี้เป็น switchที่ใช้งานได้จริง ตอนนี้runtimecontainmentมีเพียงbootstrap403และไม่มีbusinesshandlers
4. เก็บ audit/decision/event/documentversion/ledger และevidencehashไว้ ตรวจ legalhold ห้ามลบผิดแถว แก้ยอดทับหรือส่งไฟล์เปลี่ยนเป็นรุ่นที่อนุมัติเดิม ผู้สร้างยังห้ามอนุมัติ correctionสำคัญของตน
5. วิเคราะห์ source/independentreconciliation/currentACL/migrationstatus/pool/queue ใช้ leastprivilegeroleและ private diagnosticsที่ผ่านredaction ไม่พิมพ์ environment หรือconnectionURL
6. ทำ fixในisolatedsyntheticenvironmentตามrunbook พร้อม negative/nativeconcurrency/idempotency/restoreที่ตรงเหตุ ผู้มีอำนาจreview versionใหม่ domainerrorใช้ amendment/reversalที่อ้างต้นทาง ไม่ใช้physicaldelete/downmigrationแก้บัญชี
7. ก่อนเปิดกลับ ตรวจต้นเหตุ/แก้/complete source ledgerและไฟล์/privacy/cache, duplicate/crash replay, currentpermission, UATของownerและauthorizationที่ผูกversion/scope บันทึกdecisionเวลาและหลักฐาน ไม่เปิดกลับจากhealth200เพียงอย่างเดียว
8. ปิดเหตุเมื่อownerยืนยันผลและresidualrisk พร้อมติดfollowupในreview7/30วัน หากส่วนหนึ่งยังล้มเหลวให้ PARTIAL/OPEN ไม่ลบticketหรือเรียกว่าหายแล้ว

## 4 Recovery ตามประเภทงาน

| เหตุ                                   | วิธีตรวจ/กู้ที่ต้องใช้เมื่อ runtimeพร้อม                                                                   | สิ่งที่ต้องคงไว้                                                    |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Person/หน้าที่/หน่วยงานมีผลผิด         | ตรวจeffective/recordeddateและapprovedversion แก้ด้วยคำสั่งใหม่ ตรวจrevokeสิทธิ์currenttimeทันที            | ประวัติชื่อ หน้าที่ ที่ตั้ง เอกสารและคำตัดสินเดิม                   |
| Import/webชนกันหรือworkercommittimeout | sharedApplicationbusinesskey/checksum/durablereceipt/currentrevalidate ก่อนretry หรือcompensationที่review | Person/Application/seat/score/release ไม่ถอนข้อมูลปลายทางด้วยdelete |
| Budgetreservation/paymentผิด           | exactledgerและ sourceallocation/reserve/commit/paid/reversalในtransaction ไม่retry paymentด้วยkeyใหม่      | เงินเป็นหลักฐานบันทึก ไม่โอนธนาคารจริง ไม่ลบโพสต์                   |
| Stock/receipt/custodyผิด               | sourceorder/inspection/unitversion/stockevents ตรวจpartialและnative lock ให้ownerอนุมัติ adjustment        | quantityledger, serial/custody/history/ราคากับbudgetrefs            |
| Releaseผลผิดหรือwithdraw cacheค้าง     | ระงับรุ่นที่กระทบทุกpublicAPI/HTML/export/cache และสร้างreviewedreleaseใหม่พร้อมreason                     | snapshotปีเก่า scorebatch/rule/ผู้อนุมัติ/withdrawhistory           |
| หนังสือส่งซ้ำ/ไฟล์เปลี่ยน/accessหมด    | approvedcontent/filehash/version/currentACL/recipient snapshot/dedupreceipt บังคับreviewรุ่นใหม่           | การเปิดnotificationไม่สร้างack; deliveryaudit/holdอยู่ครบ           |
| Backup/กุญแจ/ไฟล์ไม่ตรง                | restoreเฉพาะtargetแยก ตรวจDB/objectversionmapping/keys/identity/reconcileตาม71                             | sourceและwritecutover evidence ไม่restoreทับprodเงียบ ๆ             |

Alertpayloadใช้แค่event/aggregate/version/correlationและerrorcodeที่จำเป็น ผู้รับต้องมีcurrentauthorityตามtime/action/scope/ACL Notificationไม่เพิ่มสิทธิ์อ่านต้นเรื่อง การเปลี่ยนหน้าที่หรือมอบหมายไม่grantไฟล์เก่าโดยปริยาย

## 5 คำสั่งพื้นฐานที่มีจริง

สำหรับ source/starterในเครื่องทดลองที่ไม่มีข้อมูลจริง:

```sh
corepack pnpm test
corepack pnpm secrets:check
corepack pnpm build
corepack pnpm smoke
```

`db:test` และ `worker:check` มีจริงแต่ใช้ guardlocal/ฐานบท06เท่านั้น ไม่เป็นคำสั่งตรวจproductionและไม่เป็นbusinessworker recovery รอบ71ทั้งคู่exit1 ไม่ใช้schema reset/seed/pgrestoreจากเหตุ productionโดยไม่มี authorizedtargetและplan ไม่มีCLI runtimefreeze/backup/replayที่ใช้ได้จริงในรุ่น0.6.0 จึงห้ามแต่งชื่อคำสั่งเหล่านี้

## 6 แบบบันทึกเหตุและการสื่อสาร

incident_id/environment/commit/schema, severityเสนอและผู้ยืนยัน, scope/affectedoperation, detected/declaration/containment/restored/verified_at, source/evidence refs, correlation, currentoperatorauthority, knowncommitstatus, exactreconciliation, fix/rollback/forwardmigrationversion, ownerdecision/authorization, residualrisk/followup/กำหนดแก้ที่ยืนยัน ทุกactualfieldในรอบนี้ว่าง ไม่มีincidentหรือrecoverydrillจริง

สถานะสาธารณะใช้เฉพาะข้อความที่C04/C03อนุมัติ ไม่ออกชื่อผู้เรียน/หนังสือลับ/ยอดงบหรือsecuritydetails การแจ้งผู้ได้รับผลกระทบ/หน่วยงานตามกฎหมายให้C03วินิจฉัยฐาน/เนื้อหา/ระยะเวลา ไม่เดากฎหมายหรือส่งแทนโดยอัตโนมัติ
