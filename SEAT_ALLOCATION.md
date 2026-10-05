# อนุมัติผู้สมัครและออกเลขที่นั่งสอบ — บท 37

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) เวลาไทย | source `db51163` | **Proposal / BLOCKED — ไม่มี approval/seat allocation services จริง**

บท36ยังไม่ผ่านตาม [ELIGIBILITY_RULES](ELIGIBILITY_RULES.md) และ [PROGRESS](PROGRESS.md) ไม่มี Application/SeatAllocation/ExamSession/CenterSession/CenterSessionLevel/WorkflowInstance/RoleAssignment/FileVersion/outbox ใน Prisma มี19coremodelsและmigrationเดียว จึงยังไม่สร้างบริการที่ต้องพึ่ง FK/สิทธิ์/ความจุที่ขาด เอกสารนี้ไม่ใช่ migration หรือผลทดสอบ PostgreSQL

ใช้ [APPLICATION_SCHEMA](APPLICATION_SCHEMA.md), [APPLICATION_STATES](APPLICATION_STATES.md), [EXAM_SESSIONS](EXAM_SESSIONS.md), [APPLICANT_REVIEW_IMPACT](APPLICANT_REVIEW_IMPACT.md), [EXAM_ADMISSION_OUTPUTS](EXAM_ADMISSION_OUTPUTS.md) ร่วม Person/Organization/บัญชี/Application/เอกสารกลางทั้ง9ระบบ importer9เรียกบริการเดียวกับ05 ไม่สร้างทะเบียนหรือ engineอนุมัติอีกชุด

## 1 แนวคิดทีละขั้น

1. อนุมัติคือคำตัดสินต่อใบสมัครรุ่นที่ตรวจ เลขที่นั่งคือธุรกรรมทรัพยากรอีกส่วน ไม่ให้ client เปลี่ยน approved หรือ seat number เอง
2. ความจุกำหนดว่าจะรับเพิ่มได้หรือไม่ เขตเลขไม่ซ้ำกำหนดว่าเลขเดียวกันใช้ร่วมกับใครได้ ทั้งสองอย่างไม่จำเป็นต้องเป็นขอบเขตเดียวกัน
3. การตรวจว่า “ยังเหลือที่” บนหน้าจอไม่จองที่นั่ง ต้องตรวจและบันทึกภายใน transaction ที่ประสาน writersทุกฝ่าย
4. retryต้องคืนผลคำสั่งเดิมเมื่อยังมีสิทธิ์ ไม่เพิ่มที่นั่งหรือสร้างคำตัดสินใหม่ การแก้สนามใช้ amendmentที่ตรวจแล้วและเก็บเลขเดิมไว้ตรวจย้อนหลัง

## 2 Seat key ที่ต้องรับรองก่อน DDL

แบบlogical04มีunique(application_id) และunique(center_session_level_id,seat_number) พร้อมcompositeFKไปApplication; ยังไม่มีจริง ขอบเขตระดับในkeyนี้เป็น Proposal อาจแคบเกินกฎทางการ ห้ามถือว่าเลขไม่ซ้ำต่อระดับหรือทั้งประเทศทุกปีโดยอัตโนมัติ

เสนอ stable `seat_namespace_id` ที่ resolveจาก domain tuple ตามกฎที่ยืนยัน และ unique `(seat_namespace_id, canonical_seat_number)` NOT NULLทุกส่วน ใช้ExamSession UUIDซึ่งผูกปี/ประเภท/รอบจริง ไม่ใช้เพียงเลขปีหรือชื่อสนาม

| ตัวอย่าง Proposal เท่านั้น | Domain ที่ต้องเจ้าของยืนยัน         | ข้อควรระวัง                                                              |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| ต่อรอบ+สนาม                | exam_session_id + exam_center_id    | หากหลายระดับแชร์เลข ต้อง namespaceเดียวกัน ไม่แบ่งระดับเพื่อหลบunique    |
| ต่อรอบ+สนาม+ระดับ/offering | เพิ่ม dimensionเฉพาะกฎระบุชัด       | ช่วงชั้นกับระดับคนละมิติ ไม่ใส่ทุกdimensionเผื่อไว้จนเลขซ้ำได้ผิดกฎ      |
| รอบอื่น                    | namespaceคนละรอบที่มีหลักฐาน        | display numberเดียวกันอาจใช้ได้ตามกฎ ไม่globalunique seat_number         |
| เปลี่ยนรุ่นกฎ              | rule versionแยกจากbusinessnamespace | ห้ามเพิ่มpolicyversion/channel/UUIDสุ่มให้เกิดnamespaceคู่ขนานในรอบเดียว |

รูปแบบ prefix/เลขเริ่ม/ช่วง/ศูนย์นำหน้า/canonicalization/การใช้เลขซ้ำหลังถอนต้อง Q004/Q024 TO VERIFY กฎทดลองเสนอ `DEMO_SEAT_RULE_V1` ต่อรอบ+สนาม ไม่reuseเลขที่เคยissued และไม่มีข้ออ้างว่าเป็นรหัสที่นั่งทางการ เก็บเลขเป็นtext ไม่Numberที่ทำเลขยาวหรือศูนย์นำหน้าหาย การเปลี่ยนรูปแบบต้องแผนรักษาcanonical uniqueness ไม่เปลี่ยนruleแล้วปล่อยเลขเดิมชนกัน

## 3 Schema contract ที่เสนอ — ไม่ใช่modelsใหม่ที่สร้างแล้ว

| Contract               | ความสัมพันธ์/หลักฐานที่ต้องมี                                                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SeatAllocation         | UUID identityหนึ่งต่อApplication; current_revision_idเป็นprojectionที่CASได้; approved decision/snapshot/receipt refs ต้องคนและcontextตรงกัน                                                                                    |
| SeatAllocationRevision | append-onlyรุ่น, allocation_id/version_no, application_snapshot_id, decision/amendment ref, center/offering/namespace/numberclaim, valid_from/valid_until, recorded_at, replaces_id/source evidence; รุ่นเก่าไม่rewriteเลข/สนาม |
| SeatNamespace          | UUID + canonical typed domainที่uniqueและimmutableตามกฎรับรอง มีcounter/row_versionเมื่อเลือกวิธีcounter; ruleversionไม่เป็นทางหนีbusinesskey                                                                                   |
| SeatNumberClaim        | durable unique(namespace_id,canonical_number), allocation/revision binding/issued_at; เก็บclaimที่retiredตามpolicyไม่คืนเลขด้วยการลบแถว                                                                                         |
| Capacity/quota guard   | ใช้resourcepool/quotasกลางตาม21 พร้อมcapacity/confirmed/active reservations/revision; allocate/release/expire/close/shrinkร่วมprotocol ไม่สร้างpoolต่อระดับจนความจุรวมเกิน                                                      |

ทุกPK/FK UUID, map snake_case, private/RLS deny by default, RESTRICT, provenance/account, effective/recorded time ชัด ตัวallocationกับรุ่นไม่ใช่ทะเบียนผู้สมัครใหม่ ต้องปรับADR/dictionary/logical04/typedFKพร้อมmigrationจริงก่อนใช้ การเพิ่มรุ่นแก้สนามขัดกับการเก็บseatทั้งหมดในแถวเดียวและuniqueapplicationเดิม จึงต้องresolveก่อน implementation ไม่แก้DDLเดิมทับ

compositeFKแบบ04ผูกสนามกับApplicationเป้าหมายเดิม การamendไปสนามใหม่ต้องtyped target bindingของamendmentรุ่นที่อนุมัติ เชื่อมoriginalApplication/snapshot/canonicaldecisionและปลายทางใหม่อย่างตรวจได้ ไม่dropFKเพื่อย้ายสนามหรือrewriteสนามบนsnapshotต้นเรื่องให้ตรงเลขใหม่ การสิ้นสุดvalidityของrevisionเดิมอ้างappend-only end/replacement eventและprojectionที่ตรวจได้ ไม่แก้sealedpayloadหรือrecorded_atย้อนหลังให้เหมือนไม่เคยออกเลขเดิม

| Ref    | Constraint/service invariant ที่เสนอ                                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K37-01 | unique allocation.application_id และunique revision(allocation_id,version_no); headต้องเป็นrevisionของallocationเดียวกัน                                 |
| K37-02 | unique stable namespace domain และunique claim(namespace_id,canonical_number) NOT NULL ไม่partialactiveuniqueเพื่อreuseเลขเอง                            |
| K37-03 | compositeFK/context binding application-snapshot-decision-person-session-center-level-stage ตรงกัน ไม่client org_idหรือseat_number                       |
| K37-04 | current allocationหนึ่งชุดต่อใบสมัคร; approvalอ้างterminaldecision/cycle/snapshotที่ถูกต้อง CAS/terminaluniqueจากworkflowกลาง                            |
| K37-05 | used=confirmed+active reservationsตามpolicy; nonnegative/used<=capacity ทุกpool/quotaที่เกี่ยวข้อง 0ไม่unlimited unknownNOT_READY                        |
| K37-06 | operation receipt command/actor/resource/key/fingerprint unique + allocationbusinessuniqueกันkeyใหม่ createซ้ำ; mutation/audit/outbox atomic             |
| K37-07 | status/eligibility/window/evidence/impact/assignment/currentgrant guards ใช้ในtransactionร่วมwriters ไม่CHECKข้ามตารางหรืออ่านcountก่อนแล้วinsertนอกlock |
| K37-08 | amend/releaseไม่harddeleteApplication/เลข/คำตัดสิน/ผลสอบ/ประวัติ; revision/claim/sourceorder immutableตามretentionที่รับรอง                              |

## 4 Approval และ allocation transaction ที่เสนอ

DEMOเสนอ compound command `approveAndAllocate` ให้ terminal approval และallocation commitด้วยกัน หากcapacityไม่พร้อมไม่มีpartial approval/seat/counter เพื่อให้ตรวจเกณฑ์อนุมัติไม่เกินความจุได้ หากกฎจริงต้องแยกอนุมัติก่อนจัดที่นั่ง ต้องมีคำอนุมัติ/สถานะการจัดที่นั่งแยก และ `allocateApproved`ตรวจterminaldecisionรุ่นเดิมทุกครั้ง ไม่ตีความApplicationapprovedว่ามีที่นั่งแล้ว

| ขั้น            | พฤติกรรมที่ต้องทำในบริการจริง                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S37-01 Resolve  | verified actor/current account/action/scope/ช่วงมอบหมาย/maker-checker พร้อม server resolve typed contextและcommand fingerprint                                                                  |
| S37-02 Lock     | sharedguard graphของaccount/status/target/application/workflow/receipt/pools/quotas/namespacesตามลำดับเดียวกันทุกwriter; เรียงIDsภายในชนิดเดียวกัน ห้ามlockเฉพาะApplicationแล้วถือกันทุกraceได้ |
| S37-03 Recheck  | expected revision/current canonical decision/eligibility36/calendar21/scan-reviewed-evidence/impactreport; cutoffตามserver ณ linearization pointที่รับรอง รวมวันที่สอบตามกฎ                     |
| S37-04 Dedupe   | ตรวจreceipt/businessallocationเดิม; retryที่ตรงคืนผลเดิมภายใต้currentgrant keyต่างไม่ทำapproval/allocateซ้ำ                                                                                     |
| S37-05 Capacity | conditional update/counterหรือกลไกserializableที่เลือกและพิสูจน์จริง ตรวจทุกpool/quotaและreservationconversion; ทุกส่วนไม่ผ่านrollbackทั้งหมด                                                   |
| S37-06 Number   | allocateตามserver ruleจากnamespaceที่lockและunique claim; ห้ามMAX(seat)+1แบบไม่มีการประสานล็อกกับwriterอื่น                                                                                     |
| S37-07 Persist  | terminalworkflow decision + approved state + allocation/revision/claim + capacitydelta + receipt + audit + outbox ในtransactionเดียวตามcommandที่เลือก                                          |
| S37-08 Commit   | commitก่อนแจ้ง/สร้างบัตร; report responseตามfieldpolicy ใช้devnotification sink/outbox11 ห้ามส่งข้อความภายนอกกลางtransaction                                                                    |

นี่เป็นprotocol ไม่ใช่functions/SQLที่มีแล้ว ต้องยืนยันลำดับlock/guard ownershipกับบริการสถานะPerson/Organization/ExamCenterและquota/allocation/release/amendmentทั้งหมด การlockแถวที่มีอยู่ไม่กันbinding/assignmentใหม่ที่เข้ามาต่างเส้นทางเอง ต้องstableguard/epochหรือserializableที่เจ้าของรับรองและnative testsพิสูจน์

reservationที่กินpoolอยู่แล้วแปลงconfirmedโดยnet deltaตามbindingเดิม ไม่เพิ่มusedซ้ำ expiry/releaseมีcommandreceipt/CASของreservation/seatเอง ทุกquotaต้องนับตามpolicy การลดcapacityต่ำกว่าusedต้องblock/มีแผนที่ตรวจแล้ว ห้ามลบที่นั่งแก้ยอด

## 5 Retry conflict และ fault recovery

| Ref    | กรณี                                    | Contract                                                                                                                                           |
| ------ | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| R37-01 | keyเดิม payloadเดิม/ACKหาย              | ตรวจcurrentgrantแล้วคืนreceiptเดิม ไม่เพิ่มdecision/seat/used/outbox; ถ้ามีamendแล้วแสดงผลเดิมเป็นhistoryพร้อมcurrentrevision ไม่reactivateเลขเดิม |
| R37-02 | keyเดิม payloadต่าง                     | 409safeconflict ไม่มีwrite ไม่เปิดชื่อ/เลข/เหตุผลของผู้สมัครอีกพื้นที่                                                                             |
| R37-03 | keyใหม่แต่Applicationเดิม               | businessunique/head guardไม่ออกใหม่ คืนalreadyprocessedหรือconflictตามpolicy ไม่approveอีกรอบเพื่อเลขใหม่                                          |
| R37-04 | serialization/deadlock                  | bounded retryทั้งtransactionด้วยข้อมูล/สิทธิ์/clockที่ตรวจใหม่; exhaustionแจ้งretryable conflict ไม่partialcommit                                  |
| R37-05 | stale revision/unique business conflict | reloadที่มีสิทธิ์หรือreceipt lookup ไม่retry23505ทุกกรณีเพื่อเลขใหม่และไม่autoapproveรุ่นที่เปลี่ยน                                                |

อิงPostgreSQL18: row locksและการเรียงlock order, UNIQUE/FK/NOT NULL, การretryทั้งtransactionเมื่อ40001และพิจารณา40P01 ส่วน23505อาจเป็นbusinessconflictถาวร จึงต้องแยก ไม่ใช่ข้อพิสูจน์ว่าPrisma retry/constraintsของโครงการมีแล้ว ไม่มีexactly-once claimจากoutboxหรือmock

## 6 ย้ายสนามหลังออกเลข — amendment ที่มีอนุมัติ

| ขั้นแก้ไขเสนอ | หลักฐานและสิ่งที่รักษา                                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| เสนอและตรวจ   | อ้างApplication/snapshot/approval/allocationrevision/เลขเดิม สนามใหม่เหตุผล/evidence/policy/request revision พร้อมmaker-checker/currentscopeทั้งสองปลาย                                                |
| ประเมินผล     | ตรวจcontextรอบ/ประเภท/ระดับ/ช่วงชั้น สนามเปิดวันสอบ ความจุ/quotasทั้งสองปลาย บัตรเดิม/รายชื่อ/งานส่งออก/การจัดส่งที่เกี่ยวข้อง ไม่autoย้ายจากที่อยู่                                                   |
| มีผล atomic   | lockguardsทั้งสองปลายตามลำดับเดียว recheckapprovedamendment/due/version ตรวจcapacitydeltaก่อนปิดรุ่นเดิม เพิ่มrevision/claimใหม่เมื่อกฎต้องเลขใหม่ ปรับhead/ledger/receipt/audit/outboxร่วมtransaction |
| แจ้งและติดตาม | แสดงเลขเดิม→เลขใหม่/สนามเดิม→ใหม่และวันที่มีผล มีreplacement refs บัตรเดิมแสดงหมดใช้ตามpolicy แจ้งผ่านoutbox; โหลดไฟล์เดิมไปแล้วลบจากเครื่องผู้ใช้ไม่ได้                                               |

destinationเต็ม/ไม่พร้อมหรือrevisionเปลี่ยนให้rollback คงที่นั่งเดิม ไม่มีvoidก่อนแล้วโยกไม่สำเร็จ ย้ายภายในpoolเดียวกันต้องnetdeltaพร้อมquota ไม่release/consumeซ้ำ from/toต่างpoolต้องสำเร็จทั้งคู่

เลขคงเดิมหรือเปลี่ยนต้องกฎnamespaceที่รับรอง ไม่เดาว่าย้ายสนามต้องได้เลขใหม่เสมอ DEMOเก็บclaimเลขที่เคยissuedเพื่อไม่reuse ถอนที่นั่ง/ยกเลิกบัตรไม่ลบApplication/ผลสอบ หากมีผล downstreamแล้วต้องowner planก่อน amendmentอนุมัติ อนุมัติแล้วรอวันมีผลไม่เปลี่ยนheadก่อนวันจริง

## 7 แผนตรวจรับ — P37 ทุกกรณี NOT RUN

| Case ref | กรณี native/API/artifact เมื่อพร้อม                                  | Oracle ที่ต้องพิสูจน์                                                                        |
| -------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| P37-01   | 3ใบสมัครพร้อมกัน capacityสมมติ2 ใช้barrierอย่างน้อย2PGconnections    | 2approval+seatสำเร็จที่เหลือFULL ไม่มีusedเกิน2 ไม่มีเลขซ้ำ                                  |
| P37-02   | 2ผู้อนุมัติใบสมัคร/cycle/revisionเดียวกัน                            | terminaldecision/seatชุดเดียว อีกคนconflictเข้าใจได้                                         |
| P37-03   | samekey retry/ACKlost/newkey/workerrestart ใบเดิม                    | receipt/allocation/number/usedไม่เพิ่ม ไม่มีnotificationซ้ำตามdedupe                         |
| P37-04   | ต่างระดับ/offering/quotaแต่ใช้poolความจุสมมติ1ร่วมกัน                | รวมconfirmed+reservationไม่เกิน1 ไม่capacityแยกจนoverbook                                    |
| P37-05   | sharednamespaceข้ามระดับ และเลขแสดงเหมือนกันต่างรอบที่DEMOอนุญาต     | ไม่ชนในdomainเดียว ต่างdomainได้ตามpolicy ไม่globaluniqueหรือchannel-ruleversionหลบkey       |
| P37-06   | capacity0/unknown/ลดต่ำกว่าused และคนสอบซ้ำไม่ผ่านrule               | FULL/NOT_READY/INELIGIBLE ไม่unlimited/ลบที่นั่งเพื่อแก้ยอด                                  |
| P37-07   | convertreservation/expire/releaseซ้ำหรือแข่งallocate                 | netledgerถูกต้อง ไม่doublecount/negative/คืนquotaสองครั้ง                                    |
| P37-08   | close/ย้าย/ยุติสถานะสนามหลังสมัคร แข่งapprovalตามวันที่มีผล          | impactแสดงก่อนตัดสินและtransactionใช้guardล่าสุด ไม่ใช้statusจากsnapshotเก่า                 |
| P37-09   | Personย้าย/พ้นหน้าที่/ลาสิกขา/เสียชีวิต/สถานะอนาคตหลังสมัคร          | reportsource/valid_at/known_atถูกต้อง ประเมินตามruleไม่เหมาwithdrawทุกสถานะ                  |
| P37-10   | adapterขาด/unknown/stale report/แก้สถานะย้อนหลังระหว่างตรวจ          | NOT_READY/refresh conflict ไม่unknown=0หรือackแล้วอนุมัติผ่าน                                |
| P37-11   | maker/นอกscope/หมดdelegation/revokeก่อนdecisionหรือworker/download   | currentdenyทุกentrypoint ไม่มีPII/เลข/เหตุผลผ่านID/key/response                              |
| P37-12   | faultหลังdecision/counter/claim/revision/outboxและkillก่อนหลังcommit | rollbackทั้งชุดหรือreceiptเดิม history/FK/ledgerไม่หาย ไม่มีexternalnotifyก่อนcommit         |
| P37-13   | amendmentปลายทางเต็ม/ปิด/นอกscope/เปลี่ยนversion                     | ที่นั่งเดิมคงใช้ตามpolicy ไม่มีhalftransfer/voidเลขก่อนสำเร็จ                                |
| P37-14   | amendmentผ่าน/rerun/futuredate/oldPDF/เลขเดิมaudit                   | revisionใหม่ครั้งเดียว dueถูกต้อง ต้นเรื่อง/เลข/คำสั่งเดิมตรวจได้ ผู้ใช้เห็นการเปลี่ยน       |
| P37-15   | 40001/40P01/23505/staleversion และretryจนหมดเพดาน                    | wholetransaction retryเฉพาะชนิดที่เหมาะ currentguardใหม่ ไม่มีเปลี่ยนเลขหลบbusinessconflict  |
| P37-16   | รายชื่อ/บัตรจริง/HTML-RSC-cache/PDFไทยA4/QR/ถอนtemplate/session      | DTOตามpurpose currentseatvalidity/sourcepins ไม่มีpublicPIIหรือofficialcardเมื่อขาดแบบรับรอง |

เกณฑ์37-01ผูกP37-01–07/12/15; เกณฑ์37-02ผูกP37-08–10/13/14 ทุกP37และทั้งสองเกณฑ์ **BLOCKED / NOT RUN** ไม่มีnativeconcurrency/seat uniqueness/retry/impactreport/services/artifactsผ่านจากสัญญานี้

## 8 Versions ผลจริง และแหล่งทางเทคนิค

app/schema0.6.0 Prisma7.10.0 Next16.3.8 pnpm11.28.2 lockfile9 core19models/migration1 `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่เปลี่ยน ไม่มีpackage/schema/migration/seed/runtime/workerแก้ ไม่แตะproduction

รอบ37อ่านrepositoryและPythoninventory/checksumจริง: requiredmodels14ขาด โมดูล05/09มีREADMEเท่านั้น DockerCLI/socketไม่มี loopback5432/5546ConnectionRefusedError `corepack pnpm db:test` exit1safeerrorไม่แยกenv/connection ไม่เดาสาเหตุย่อย DB-06/Q027และDOCKER-05/Q026ยังเปิด

อ่านเอกสารทางการ PostgreSQL18วันที่5ตุลาคม2569เพื่อทบทวนสัญญา ไม่อ้างว่ารันSQLแล้ว:

- [Explicit locking](https://www.postgresql.org/docs/18/explicit-locking.html)
- [Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html)
- [Serialization failure handling](https://www.postgresql.org/docs/18/mvcc-serialization-failure-handling.html)

ไม่รันtypecheck/lint/build/rootunit/SQLWASM/nativeapproval-seat/API/workerbusiness/browser/P37ในรอบ37 เพราะไม่มีruntimeใหม่ ไม่ใช้ผลhelper3PASSบท36หรือการไม่มีตารางเป็นPASS ต้องผ่าน36และต้นทางก่อนimplementation/acceptance37 บท38ยังไม่เริ่ม ไม่เดาขอบเขต ไม่push/deploy

## 9 คำสั่งและผลตรวจเอกสารรอบ37

```bash
corepack pnpm db:test
corepack pnpm exec prettier --ignore-path /dev/null --check docs/SEAT_ALLOCATION.md docs/APPLICANT_REVIEW_IMPACT.md docs/EXAM_ADMISSION_OUTPUTS.md src/modules/exams/README.md src/modules/exam-imports/README.md
git diff --check
git diff --cached --check
corepack pnpm secrets:check
```

db:test exit1ตามหัวข้อ8 ส่วนPrettier/whitespace/secretscheckผ่านตามขอบเขตตัวตรวจ Pythoninlineตรวจ K37-01–08/S37-01–08/R37-01–05/P37-01–16, 36local linksใน3สัญญาใหม่และ2README, 3officialPG sourceURLs, traceabilityหัวข้อ31, DEC-156–159, 4versionheaders และ9changedfilesผ่าน ตรวจcore19models/migration1/checksumและschema/seed/package/lock/logical04/workerไม่เปลี่ยนผ่าน

การตรวจIDs/ลิงก์/เวอร์ชันไม่ใช่executionของ16กรณีP37 ไม่มีallocation/impact/card/service artifactผ่าน ความจุ/unique/retry/ผลกระทบก่อนอนุมัติยังต้องพิสูจน์กับnativeDBและบริการจริง ทั้งสองเกณฑ์ยังBLOCKED
