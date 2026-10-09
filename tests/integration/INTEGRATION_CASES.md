# ตรวจรับเหตุการณ์และเอกสารข้ามเก้าระบบ — บท 65

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **PLAN_ONLY / ALL_NOT_RUN**

ใช้ [INTEGRATION_MAP](../../docs/INTEGRATION_MAP.md), [EVENT_CONTRACTS](../../docs/EVENT_CONTRACTS.md), [INTEGRATION_HANDLERS](../../docs/INTEGRATION_HANDLERS.md), [fixture](../fixtures/integration/integration-plan.json) ไม่มีruntimehandler/queue/ownerdomainmodels/Auth/FileVersionจริง db:testexit1 ไม่สร้างfakeALLOW/in-memoryconsumerแล้วอ้างnativeacceptance

Harnessต้องPostgreSQLสองconnection/server/worker/sharedownerservices/privatefiles/scanner/currentAuth/ACL/workflowจริง ใช้TEST_ทุกข้อมูล บันทึกsourceID/version/rowhash/counts, FileVersion/hash/decision, outboxeventid, effectFamily/sourceReceipt/consumerReceipt/projectionVersionและmaskedcorrelationtraceก่อนหลังทุกcase Sourceที่commitแล้วต้องไม่หายหรือทำซ้ำจากconsumerfailure; sourceoutboxinsertล้มก่อนCOMMITต้องrollbackทั้งsource ใช้barriers/faultpointsไม่ใช้sleepเป็นหลักฐานreordering/concurrency

| case_id | สิ่งที่จำลอง                                                           | ผลที่ต้องยืนยันเมื่อruntimeพร้อม                                                                                    | execution |
| ------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------- |
| P65-01  | centralreferencesทั้ง9ระบบ/7eventowners และหนึ่งbatchหลายApp           | typedIDsจริงไม่มีPerson/Org/Application/FileVersionregistryซ้ำ logical04uniqueรับหลายaggregateตามADR linkcurrentACL | NOT_RUN   |
| P65-02  | S65-01 เปลี่ยนหน้าที่ eventล่าช้า                                      | currentrightsทันeffective source ไม่มีoldroleaccess/autoใหม่ recordhistory/approvedversionคงไว้                     | NOT_RUN   |
| P65-03  | S65-02 เปิดสนาม appointmentไม่ครบ Excelcommit                          | dueapproval+central02 appointments+05receipt ไม่autoเลือกPerson/autoapprove-seat                                    | NOT_RUN   |
| P65-04  | S65-03 reserve/order/partialinspection/record                          | reservation06/stock07/เอกสารรุ่นเดียว nosecondreserve/stockpost/pay                                                 | NOT_RUN   |
| P65-05  | mandatoryfields/types/producer/aggregateownership/sourceversions       | validationrejectwrongowner/id/clock/version/missing ไม่มีeffects                                                    | NOT_RUN   |
| P65-06  | eventเดิมพร้อมกันสองconsumerworkers                                    | oneconsumerreceipt/oneeffect durable no duplicatejobs/artifact/delivery                                             | NOT_RUN   |
| P65-07  | event_idเดิมpayload/hashต่าง                                           | EVENT_CONTENT_CONFLICT quarantine nooverwriteoldreceipt                                                             | NOT_RUN   |
| P65-08  | event_idใหม่แต่domainreceiptเดิม                                       | stableeffectFamilysemanticdedupe noeffectsเพิ่มแม้handlerupgrade                                                    | NOT_RUN   |
| P65-09  | projectionv2ก่อนv1                                                     | sourceversionCAS nohistoricaldowngrade snapshotpin/currentpolicy                                                    | NOT_RUN   |
| P65-10  | aggregateversiongap/หลายeventtypes                                     | ไม่เดาว่าeventหาย immutablefactsยังlink ไม่dropทุกoldreceiptด้วยcursor                                              | NOT_RUN   |
| P65-11  | predecessor/sourceartifactยังไม่พร้อม                                  | WAITING_DEPENDENCY currentreconcileไม่มีforcefastforward/fakezero                                                   | NOT_RUN   |
| P65-12  | consumerตายก่อนeffect/tx                                               | sourceคงcommitted receiptไม่DONE retryeffectเดียว                                                                   | NOT_RUN   |
| P65-13  | DB effectแล้วreceipt/outboxinsertล้ม                                   | consumertxrollbackทุกeffect sourceไม่rollback retrycurrentchecks                                                    | NOT_RUN   |
| P65-14  | consumerCOMMITแล้วACKล้ม                                               | receiptlookupผลเดิม noeffectซ้ำ                                                                                     | NOT_RUN   |
| P65-15  | sourcechangeแล้วproduceroutboxinsertล้ม                                | rollbacksource/audit/receipt/eventก่อนCOMMIT noorphanbusinesschange                                                 | NOT_RUN   |
| P65-16  | publisherส่งแล้วตายก่อนACK/Redisล่ม                                    | outboxdurable stableeventid redelivery safe ไม่มีsourcecommandใหม่                                                  | NOT_RUN   |
| P65-17  | leaseหมด workerเก่ากลับ/servicegrant/targetACLถูกถอน                   | fencedCAS nooldACK/overwrite receipt currentdeny read/export/worker                                                 | NOT_RUN   |
| P65-18  | poison/timeout/deadlock/boundedretry exhausted                         | durablefailure/quarantine currentmanualretry noeventdelete/remint                                                   | NOT_RUN   |
| P65-19  | reportbuild/storageล้มกลางทาง/afterconsumerCOMMIT                      | sourcecounts/IDs/ledger/Appคงเดิม staleversion intentreceipt retryไม่recommit                                       | NOT_RUN   |
| P65-20  | notificationsล้ม/ส่งซ้ำ/เปิดแจ้งเตือน                                  | recipient-versiondedupe noautoACK/contentgrant/emailจริงไม่ได้configured                                            | NOT_RUN   |
| P65-21  | correlationtrace crossscope/search/count/download                      | root-causation-event-receipt/evidenceครบ scopedmetadataไม่มีbearergrant/PII                                         | NOT_RUN   |
| P65-22  | futureeffective/notactivated/delayednotice/ปีacademic-fiscal           | pendingก่อนactivationไม่effective staleeventไม่ย้อนsource mixedyearreject                                           | NOT_RUN   |
| P65-23  | partialreceipts exactquantity/decimal/sourcebudget-stockreport         | distinctdomainreceiptsแต่ละpartial reconciliation noorder-leveldedupeสูญreceipt/noledgerwrites                      | NOT_RUN   |
| P65-24  | contractversionunknown/PIIextra/sourcefilechanged/TO_VERIFY/holdreplay | deny/quarantine officialdisabled nooldartifactleak noreceiptpurgeหลบdedupe                                          | NOT_RUN   |

| เกณฑ์                                                                      | casesหลัก          | ผลจริง          |
| -------------------------------------------------------------------------- | ------------------ | --------------- |
| AC65-01 linkcentralIDs/FileVersion/decisionจริง ไม่ทะเบียนซ้ำ              | P65-01–05/21–24    | BLOCKED_NOT_RUN |
| AC65-02 duplicate/outoforder/crashrecovery noeffectsซ้ำและtracecorrelation | P65-06–20/21/23/24 | BLOCKED_NOT_RUN |

กรณีReport/notifyfailureต้องตรวจsourceยอด/IDs/versions/evidenceไม่เปลี่ยน นับeffect/receipt/intentที่DBจริงหลังallworkersจบ ไม่snapshotJSON/diagram/digestcheckแทนnativeclaims Projectioncacheอาจstaleโดยไม่แก้source เลข/hash/eventlabelsในfixtureไม่เป็นหลักฐานapproved/certificates ข้อกำหนดทางการและownerpowersต้องยืนยันแยก software ไม่เลื่อนบท66จากเอกสารครบ
