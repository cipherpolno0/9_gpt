# Handler และการกู้คืนเหตุการณ์ข้ามระบบ — บท 65

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **Proposal / BLOCKED — ยังไม่มี executable handlers**

อ้าง [INTEGRATION_MAP](INTEGRATION_MAP.md), [EVENT_CONTRACTS](EVENT_CONTRACTS.md), [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md) worker/index.tsปัจจุบันตรวจconnection ไม่ได้consumequeue สัญญานี้ไม่เพิ่มfakeproducer/consumerหรือAuthgrantแทนต้นทาง

## 1 Handler catalogและeffects

| handler_idเสนอ              | events                      | effectที่ต้องauthorize/dedupe                                                 | ห้ามทำ                                                       |
| --------------------------- | --------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| AUTH_IMPACT                 | PersonChanged               | invalidate/reconcileauthorization+handovertask keyedsourcechange/currentgrant | grantตำแหน่งใหม่จากevent/revokehistory/auditเก่า             |
| RECORD_ACCESS_RECHECK       | PersonChanged               | reconcilecurrentrecordACL/readconditions+taskที่ได้รับมอบหมาย                 | copyfile/แจกACLเพียงมีlink                                   |
| CENTER_CUSTODY_IMPACT       | PersonChanged               | impactappointment/custodytask keyedchange/target                              | autoแต่งตั้งคนแทน/deletecustody                              |
| ORGANIZATION_REPORT_REFRESH | OrganizationStatusEffective | projection/reportinput watermark+buildintent                                  | activate/approveOrganizationซ้ำ                              |
| CENTER_READINESS_RECHECK    | OrganizationStatusEffective | refreshreadinessfromcentral02                                                 | openทุกcenterจากparentname/closedstatusevent                 |
| CENTER_APPOINTMENT_IMPACT   | ExamCenterChanged           | reportmissing/endedappointmentsจาก02/01ตามปีรอบ                               | choosePersonแทน/resetshipping snapshotเก่า                   |
| IMPORT_CONTEXT_RECHECK      | ExamCenterChanged           | stale/revalidatecurrentimportcontext+statuslookup                             | commit/withdrawApplicationจากnotification                    |
| IMPORT_MONITORING           | ApplicationCommitted        | rowreceipt/summary link read62/05 version-safe                                | mintnewApplication/commitทั้งbatchอีก                        |
| APPLICATION_REPORT_REFRESH  | ApplicationCommitted        | authorizedreportgeneration source snapshot/version                            | approve/allocate/publishscore                                |
| PROCUREMENT_BUDGET_LINK     | BudgetReserved              | reconcile07request→06reservation receiptตามapprovedsource                     | reserve/commit/payงบจากeventอีก                              |
| BUDGET_REPORT_REFRESH       | BudgetReserved              | reportwatermark+reconcileledger06                                             | clientcalculatefloat/เปลี่ยนledger                           |
| STOCK_REPORT_REFRESH        | GoodsReceived               | reconcilepartialreceipts/ledgerqty+report                                     | stockpostทั้งorder/pay/ปิดorderก่อนครบ                       |
| RECORD_LINK_RECONCILE       | GoodsReceived               | approvedsourceFileVersion/decision→record08 typedlinkหรือreviewtask           | autoอนุมัติ/สร้างเอกสารสำเนาแทนกลาง                          |
| INBOX_NOTIFICATION          | RecordDelivered             | minimumportalnotification keyedrecipient/version/delivery                     | readsecretbody/ACKfromnotification/emailจริงที่ไม่configured |
| DELIVERY_REPORT_REFRESH     | RecordDelivered             | perrecipientdeliveryreport/statuscountsตามscope                               | treatdelivered=ack/completed                                 |

Effectsที่จำเป็นต้องสร้างหนังสือ/approval/taskใช้บริการกลาง08/11พร้อมcurrentcommandgrant/review ไม่จัดเป็นsideeffectwriteทะเบียนจากeventโดยอัตโนมัติ Serviceprincipalต้องมีเฉพาะcapability/action/scope/expiryที่อนุมัติ ไม่technicaladminall Actorrefของproducerเป็นprovenanceไม่ให้workerimpersonateสิทธิ์เก่า

## 2 Transaction, dedupe และ worker fencing

Outboxclaimมีlease/generation; queueACKทำหลังconsumerผลdurable Replayevent_idเดิม+fingerprintตรงคืนreceiptเดิม; payloadต่างเป็นEVENT_CONTENT_CONFLICT Receiptเสนอunique(consumer_id,event_id) และsemanticEffectReceiptunique(effect_family,source_domain_receipt_ref,effect_kind,target_ref) ต้องtargetNOTNULL/typedและownershipชัด effect_familyเป็นstablelogicalconsumerข้ามdeployment; handler_versionเก็บเป็นหลักฐานไม่เป็นทางหนีkey Fingerprintpinversionที่ได้รับอนุมัติ การupgrade/เปลี่ยนconsumerชื่อหรือreplayต้องapprovedmapping/recoveryplan ไม่mintfamilyใหม่เพื่อทำeffectเดิมเพิ่ม

Consumerตรวจschema/verifiedproducer/source receipt-version+currentserviceauthority/targetACLทุกuse แล้วบันทึกdedupe receipt+DBeffect/projection+audit+downstreamoutboxพร้อมcursor/CASในtransactionเดียว **ไม่insertprocessedreceiptก่อนทำeffectแยกtx** หากrollbackไม่markDONE Leasegenerationเก่าห้ามwrite/ACK/failedทับgenerationใหม่ Rowlock/CAS/uniqueconstraintsร่วมทุกwriterพร้อมboundedwholetransactionretry ต้องnativePGทดสอบก่อนเปิดใช้

เสนอ3attemptsรวมครั้งแรก+backoff/jitter/deadlineก่อนdurableFAILED_RETRYABLE/QUARANTINED; malformed/producer/PII/hashconflictไม่blindretry Source/ACLunavailableใช้WAITING_DEPENDENCY/ACCESS_BLOCKEDตามเหตุ ไม่unknown=allow/success ต้องcurrentpolicy recheckเมื่อmanualretry correlationยังเดิม ไม่มีการdeletefailedrecordเพื่อmintjobใหม่แล้วหลบdedupe

Reportartifact/storage/notificationproviderอยู่นอกSQL transaction ให้สร้างbuild/deliveryintent+outboxในconsumertransaction จากนั้นartifactworkerใช้stableintent/providerkey/currentACLและper-targetreceipt ไม่อ้างSQLrollbackยกเลิกobject/emailที่ออกไปแล้ว Providerไม่มีidempotency/reconciliationต้องแสดงunknown/manualcheck ไม่อ้างexactly-onceexternal delivery บทนี้portal-only ไม่มีส่งemail/Slack/providerจริง

## 3 Recovery และ invariants

| failure mode                             | sourceต้องเป็นอย่างไร                             | recoveryที่เสนอ                                                               |
| ---------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------- |
| sourcewriteแล้วoutboxinsertล้มในtx       | source/receipt/audit/eventrollbackด้วยกัน         | retryownercommandkeyเดิมโดยcurrentvalidation ไม่claimsourcecommit             |
| publishสำเร็จworkerตายก่อนACK            | sourceคงcommitted queueอาจซ้ำ                     | sameeventidและconsumerreceipts/semantickeyเดิม                                |
| effectทำแล้วreceiptinsertล้มก่อนCOMMIT   | consumerDBeffectทั้งหมดrollback sourceไม่rollback | rerunconsumerหลังcurrentchecks                                                |
| consumerCOMMITแล้วACKล้ม                 | source+consumerreceiptคงเดิม                      | replayreceipt noeffectเพิ่ม                                                   |
| vใหม่มาก่อนvเก่า                         | sourceจริงไม่เปลี่ยนจากconsumer                   | projectionCASไม่downgrade; immutablefactsไม่dropเพราะcursor; dependenciesWAIT |
| neweventidแต่domainreceiptเดิม           | sourceไม่ทำธุรกรรมใหม่                            | semanticdedupe link/task/artifact/notifyตามownerreceipt                       |
| reportbuild/storageล้ม                   | sourceledger/Application/delivery/historyคงเดิม   | pending/stalereport+buildretryจากsourceversion ไม่recommitต้นทาง              |
| ACL/delegationหมดหลังqueue               | sourceproofretained แต่ไม่grantreader             | ACCESS_BLOCKED/denyartifact/currentreport ไม่copyfileหรือglobaltrace          |
| consumerpoison/factsconflict/outofbudget | sourcecommittedไม่แก้เงียบ                        | quarantine/reconcileหรือapprovedamendment newcommandที่อ้างต้นเรื่อง          |

Reportmanifestpin source/snapshot/fileversion/policy/lastsuccess/as_of currentpolicyตึงขึ้นdenyoldartifactหรือrebuildmaskedversion แก้ชื่อปัจจุบันไม่rewritehistoricalreports Notificationไม่ส่งprivatephone/ชื่อเต็ม/identity/documenttitleลับตามค่าที่cacheไว้ report failureห้ามใช้learning/stock/financeprojectionสร้างofficialresult/ledgerใหม่

## 4 Correlationและหลักฐาน

Traceใช้rootcorrelation→causation→event→sourceaggregate/version/receipt/approveddecision→consumerreceipt→effect/artifact/deliveryintent ต้องscopefilteredทุกnode/search/count/download ไม่timelineทั้งระบบจากcorrelationidเป็นbearertoken Logsมีopaqueevent/job/consumer/correlation refs+safeerror/attempt/time ไม่payload/name/token/rawbody/secretURL

ไม่logfingerprintถือเป็นตัวแทนrawdataที่อ่านได้ทุกคน Retention/holdกับevent/effect/auditขั้นต่ำตามpolicyกลางยังTO_VERIFY ไม่purgecursor/receiptก่อนprotectedreplayhorizon/hold/sourcehistoryโดยไม่มีownerapproval เสนอ [INTEGRATION_CASES](../tests/integration/INTEGRATION_CASES.md)24cases ALL_NOT_RUN ไม่มีsource/downstreamevidenceจริง

อ้างอิงเทคนิคที่อ่านรอบ65: [PostgreSQL18 isolation/retry](https://www.postgresql.org/docs/current/transaction-iso.html), [constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) สนับสนุนการออกแบบtransaction/uniqueเท่านั้น ไม่พิสูจน์handlerของโครงการหรือรับรองอำนาจทางการ
