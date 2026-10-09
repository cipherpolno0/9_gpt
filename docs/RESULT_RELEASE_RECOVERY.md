# แก้ ถอน และตรวจรับประกาศผลสอบ — บท 39

รุ่น 0.1 | 5 ตุลาคม 2569 (2026-10-05) | source `cffcf98` | **Proposal / BLOCKED — ไม่มี activation/invalidation worker หรือ tests จริง**

## 1 การแก้ประกาศที่ตรวจย้อนหลังได้

ใช้ [RESULT_PUBLICATION_POLICY](RESULT_PUBLICATION_POLICY.md), [RESULT_SEARCH_CONTRACT](RESULT_SEARCH_CONTRACT.md) และ [RESULT_CERTIFICATION](RESULT_CERTIFICATION.md) เดิม ผู้เสนอไม่อนุมัติการแก้ของตนเองและต้องตรวจ current grant/scope/delegation ไม่แก้ certified manifest/release items/audit เดิม

| เหตุ | การแก้ที่เสนอ | สิ่งที่คงไว้ |
| --- | --- | --- |
| Personเปลี่ยนชื่อหรือสังกัดปีใหม่ | แก้ทะเบียนกลางตามอนุมัติเดิม ไม่แก้releaseปีเก่า | ชื่อ/สังกัดและsource snapshotปีที่สอบ |
| ชื่อบนประกาศเดิมบันทึกผิด | คำขอแก้มีเหตุผล/หลักฐาน ตรวจsource/ApplicationSnapshot amendment version แล้วสร้างreleaseใหม่ | snapshotเดิม+รุ่นแก้+decision lineage ไม่ดึงชื่อปัจจุบันมาแทนโดยไม่มีหลักฐาน |
| คะแนนหรือoutcomeผิด | score amendment38 → second checker → recertify rule/context → releaseใหม่และอนุมัติเผยแพร่ใหม่ | คะแนน/manifest/rule/checksum/เอกสารและการตัดสินต้นทาง |
| ต้องถอนประกาศ/ปกปิดฟิลด์ | ผู้มีอำนาจอนุมัติ withdrawalหรือpolicyrestriction event ยกvisibility epoch ปิดreadทันทีตามgate | sealed payloadและauditภายในตามretention/holdที่ยืนยัน ไม่ลบประวัติเงียบ ๆ |
| แทนรุ่นเดิม | approve versionใหม่ pin supersedes_release_id แล้วtransactionเปลี่ยนcurrenthead+visibilityของสองรุ่น | old/new source lineage เหตุผล/evidenceภายในและpublicnoticeallowlistที่อนุมัติ |

หากเก็บoldreleaseให้เข้าถึงpublicย้อนหลัง ต้องมีpolicyอนุมัติแยก baselineปิดoldsuperseded/withdrawn publicpayload ไม่ใช้ลิงก์historicalเพื่อเปิดข้อมูลที่ถอนแล้ว เจ้าหน้าที่ตรวจlineageตามscopeได้โดยไม่เผยเหตุผลอ่อนไหวผ่านpublicnotice

## 2 Failure และ recovery

| Ref | Failure mode | Recovery ที่ต้องพิสูจน์ |
| --- | --- | --- |
| R39-01 | revision/source/approvedhashเปลี่ยนระหว่างตรวจ | 409อธิบายว่าข้อมูลเปลี่ยน ให้refresh/เริ่มตรวจรุ่นใหม่ ไม่publishจากdecisionเก่า |
| R39-02 | สองคนpublish/replace/withdrawพร้อมกัน | CASexpectedhead/revision/epoch ในtransactionมีหนึ่งผู้ชนะ อีกคนconflict; receiptretryไม่เพิ่มรุ่น/event |
| R39-03 | transactionหยุดก่อนcommit | payload/head/publication/audit/outboxrollbackร่วมกัน ไม่มีpublicครึ่งชุด |
| R39-04 | commitแล้วworkerหยุด/ACKหาย | retryoutboxdedupe; sink/index/cache receipt ไม่ส่งnoticeซ้ำ ไม่publishซ้ำ |
| R39-05 | cache/index/CDNยังเก่า | livegateหลังwithdrawcommitdeny; outboxretries/backoff/deadletterพร้อมalert ไม่เปิดstalepayloadระหว่างpurge |
| R39-06 | policy/บัญชี/delegationถอนหรือหมดอายุระหว่างqueue | ตรวจcurrentตอนactivation/read/export/download/job denyและบันทึกsafe outcome ไม่ถือenqueueเป็นgrant |
| R39-07 | scheduledpublicationเวลาอนาคต/jobช้า | denyก่อนscheduled_at; หลังเวลาต้องผ่านactivation/approval/source/currentpolicyครบ ไม่ถือวันที่ถึงแล้วpublishเอง; reportเวลาที่มีผลกับrecorded_atแยก |
| R39-08 | template/ไฟล์หลักฐานขาดหรือยังscanไม่ผ่าน | officialrender/preview/downloadblocked ไม่มีlayoutfallbackจากชื่อศ.4/8; reportmissing safe ไม่ส่งobjectkey |

invalidationออกในtransactionเดียวกับevent/head/epoch; workerต้องมีretry/deadletter/operationalalertและACLปัจจุบันตาม11/10/07 ขณะนี้เป็นสัญญาเท่านั้น workerที่มีจริงตรวจDB/Redis readiness ไม่ทำงานนี้ ไม่มีjobหรือfakecachepurgeสร้างในบท39

## 3 แผนตรวจรับข้อมูลสมมติ — ทุกกรณี NOT RUN

fixturesที่ต้องสร้างเมื่อruntimeพร้อม: Personเดียวชื่อ“บุคคลสมมติ ผลสอบ DEMO-39-A”สองปี (รหัสDEMO ไม่บัตรจริง), ปีใหม่เปลี่ยนชื่อ, release draft/scheduled/published/withdrawn/superseded, ผู้สร้าง/ผู้อนุมัติ/เจ้าหน้าที่พื้นที่A/B/เจ้าของข้อมูล/เพื่อน/anonymous ใช้บัญชีsharedrealm08 ไม่มีเบอร์ที่อยู่จริง ทุกsourceคะแนนเป็นofficial-domain DEMOที่ตรวจผ่าน38; เพิ่มpractice-domainเพื่อทดสอบboundary ไม่เป็นผลทางการ

| Ref | กรณีและหลักฐานที่ต้องได้ | สถานะ |
| --- | --- | --- |
| P39-01 | draft/raw/uncertifiedเรียกpublicตรงไม่คืนผลทุกAPI/HTML/RSC/metadata/cache/index/export | NOT RUN |
| P39-02 | approved policy+certified pass manifest+คนอนุมัติคนละcreator publishแล้วค้นเฉพาะปี/type/level/stageตรง | NOT RUN |
| P39-03 | scheduledอนาคต/ใกล้เที่ยงคืนAsia/Bangkokยังปิด; activationถึงเวลาและcurrentchecksผ่านจึงเปิด | NOT RUN |
| P39-04 | withdrawแล้วrequestใหม่ API/HTML/cachehit/indexhit/cursor/download/publicexportไม่คืนรุ่นแม้purgeworkerหยุด | NOT RUN |
| P39-05 | publicpayload/filters/autocomplete/facets/meta/exportไม่มีDOB/บัตร/ที่อยู่/เบอร์/privatefile/sourceIDsและเด็กunknownถูกปิด | NOT RUN |
| P39-06 | maker checker/ไม่มีgrant/ข้ามscope/หมดdelegation/revokedaccountห้ามapproveหรือqueuedpublish | NOT RUN |
| P39-07 | publishสองคนและpayloadeditแข่งมีหนึ่งdecision/head; loser409; requesthash/idempotencyretryไม่สร้างซ้ำ | NOT RUN |
| P39-08 | เปลี่ยนชื่อและสังกัดปีใหม่ ผลปีเก่ายังใช้sealedsnapshot ชื่อเดิมค้นปีเก่าพบ ไม่joinชื่อใหม่อัตโนมัติ | NOT RUN |
| P39-09 | approvedcorrectionสร้างversionใหม่ อ้างold/evidence/decision/sourceamendment ครบและauditเดิมไม่แก้ | NOT RUN |
| P39-10 | oldsupersededpublicปิด; privatehistoryตามscopeยังตรวจlineageได้ ไม่มีเหตุผลอ่อนไหวในpublicnotice | NOT RUN |
| P39-11 | คนอื่นเปลี่ยนperson_id/org_id/fields/include_private/URL/body/query/exportอ่านผลส่วนตัวไม่ได้ ownerlinkที่ยืนยันจึงอ่านได้ | NOT RUN |
| P39-12 | cap/cursor/query validation/rateหลายreplica/ปลอมproxyheader/budgetstoreoutageไม่dumpฐานหรือfallbackunlimited | NOT RUN |
| P39-13 | transactionfaultทุกจุดrollback; commitแล้วACKหาย/restartworkerส่งnotice/invalidateไม่ซ้ำตามdedupe | NOT RUN |
| P39-14 | ศ.4/ศ.8ไม่มีsourceverifiedห้ามofficialrender/API/job/download; DEMOlayoutติดป้ายไม่เป็นแบบทางการ | NOT RUN |
| P39-15 | practice scoreไม่เข้ารายชื่อpass; publication source/rule/checksum/resultrevision mismatchปิด | NOT RUN |
| P39-16 | ThaiIME/keyboard/labels/focus/empty/loading/error/paginationที่375/768/1024/1440 และreload/back/prefetchไม่แสดงprivate data | NOT RUN |
| P39-17 | audit/logมีactor/purpose/year/release/ref/correlationที่จำเป็น ไม่มีsecret/ชื่อคำค้นเต็ม/DOB/เบอร์/objectkey; exportjobถอนgrantแล้วหยุด | NOT RUN |
| P39-18 | build/staticassets/searchindex/sitemap/CDN/serviceworker/exportartifact/publicfolderไม่มีdraft/withdrawn/privatepayload; origin/gatewaypostcommitgateพร้อมretention/hold | NOT RUN |

เกณฑ์39-01 → P39-01/03/04/05/10/13/18; เกณฑ์39-02 → P39-08/09/10 ทั้งสอง **BLOCKED** ไม่ให้documentcheck/ไม่มีตารางเป็นPASS ต้องnativeDB/API/browser/cache/export/workerexecutionจริงก่อนผ่าน ชื่อสมมติ/ฟอร์มสมมติไม่ใช่ผลหรือเอกสารทางการ

## 4 ผลตรวจรอบนี้และ dependency

รันจริง `corepack pnpm db:test` exit1 ข้อความsafe “คำสั่งฐานทดลองไม่สำเร็จ ตรวจ PostgreSQL/URL รุ่น migration และ DATABASE.md; ไม่แสดง credential” ไม่แยกเดาว่าURLหรือconnectionเป็นสาเหตุ DockerCLI/socketไม่มี; TCP127.0.0.1:5432/5546 connect_ex111 (refused) ยืนยันdevDBในสภาพปัจจุบันไม่พร้อม ส่วน Auth/DAL/files/workflow/score/release runtimeก็ยังขาดตามsource ไม่ใช้credentialsหรือproductionทดลองแทน

schema0.6.0/Prisma7.10.0/Next16.3.8/pnpm11.28.2/lockfile9คงเดิม migrationเดียว `20261003130000_core_foundation` SHA256 `04a149fcd349f0ac3f1b5929cfcf571f8b0880541e84a40ad929054b67d72756` ไม่มีrelease migration/seed/testsใหม่ Registryเอกสารรุ่น0.2มี7รหัสที่ยังTO VERIFY ไม่ใช่DBregistryพร้อมใช้

typecheck/lint/build/rootunit/SQLWASM/native release/API/cache/browser/export/businessworker และ P39-01–18 **NOT RUN** รอบนี้ ไม่มีruntimeใหม่ ไม่ใช้ผลทดสอบบทเก่าแทนผลจริงของ39 ผลตรวจเอกสาร/format/links/hash/secret/whitespaceบันทึกใน [PROGRESS](PROGRESS.md) และ mappingใน [TRACEABILITY](TRACEABILITY.md)

ต้องแก้DB-06/DOCKER-05และส่วนกลาง06–12 ผ่าน35–38จริง แล้วimplementation39ตามสัญญาที่reviewอีกครั้งก่อนทดสอบ ทุกกฎทางการรอเจ้าของยืนยัน บท40ยังไม่เริ่มและไม่เดาขอบเขต ไม่push/deploy
