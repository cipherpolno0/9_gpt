# สัญญาเหตุการณ์กลาง — บท 65

รุ่น 0.1 | 9 ตุลาคม 2569 (2026-10-09) | **Proposal / BLOCKED — wire/storage contract ไม่ใช่producer runtime**

ใช้ [INTEGRATION_MAP](INTEGRATION_MAP.md), [WORKFLOW_ENGINE](WORKFLOW_ENGINE.md), [DATA_DICTIONARY](DATA_DICTIONARY.md) และ [PERMISSIONS](PERMISSIONS.md) Envelopeอยู่protectedoutboxกลาง ไม่ใช่publicAPI/log/queueที่ทุกคนอ่าน Aggregateยังต้องcurrentauth/fieldpolicyแม้รู้ID/hash/correlation

## 1 Envelope และความหมาย

| field               | typeเสนอ / required               | ความหมายและguard                                                                                                  |
| ------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| event_id            | UUID / required                   | producerสร้างฝั่งserver stableต่อeventทั้งpublishretry; keyเดิมpayloadต่างquarantine ไม่mintใหม่ทุกretry          |
| event_type          | closedenum7ชนิด / required        | producer/aggregate_kindต้องตรงcatalog ไม่clientcustomhandler/table/URL                                            |
| contract_version    | text e.g.0.1 / required           | pincontractschema unknownversionไม่รับ/ไม่defaultแบบเดา migrationมีcompatibilityreview                            |
| producer            | ownerdomainenum / required        | verifiedproducerbindingกับservice ไม่trustค่าstringให้scope                                                       |
| aggregate_kind      | typedclosedenum / required        | Person/Organization/ExamCenter/Application/BudgetLine/GoodsReceipt/RecordDelivery; typedresolver/FK ไม่dynamicSQL |
| aggregate_id        | UUID / required                   | centralIDจริงในruntime ไม่names/ไทยIDเป็นPK; TESTlabelsในfixtureไม่runtimeUUID                                    |
| aggregate_version   | positive exactinteger / required  | ownerrow/eventstreamrevisionหลังcommit ไม่clienttime/sortname; ห้ามfraction/overflow ต้องADRrangeก่อนschema       |
| occurred_at         | UTC RFC3339 timestamp / required  | เวลาบันทึกtransitionจริงแยกจากวันที่มีผล ไม่ใช่เวลาที่workerรับ                                                   |
| correlation_id      | opaqueUUID / required             | คงrootcommandtraceทั้ง3scenarios ไม่PII ไม่grantreadtraceข้ามscope                                                |
| causation_id        | UUID หรือnull / required          | event/commandreceiptที่ก่อเหตุ ผูกแบบtypedprovenance ไม่copycorrelationเป็นเหตุ                                   |
| effective_at        | UTC timestamp หรือnull / required | actualeffectivefromsourceเมื่อเกี่ยวข้อง ไม่ใช้occurred_atแทนวันมีผล; futureplannedไม่emiteffectiveล่วงหน้า       |
| source_receipt_ref  | centraltypedUUID / required       | durableoperation/status/ledger/deliveryreceiptของowner ไม่fakecommandที่clientใส่เอง                              |
| source_decision_ref | typedUUIDหรือnull / required      | mandatoryเมื่อtransitionต้องapproval policy ผู้สร้างไม่selfapprove; nullต้องเหตุผลจากpolicy                       |
| payload             | allowlist references / required   | fieldsตามeventpolicyด้านล่าง ไม่มีrawname/contacts/identity/money/answerkeys/documentbody                         |

Eventไม่ได้ส่งactorgrant/session/token/password/sourceURL/privatefilepath/wholePerson/Application JSON producerตรวจpolicyก่อนinsert Serializedfingerprintเป็นcanonicaldigestของenvelopeimmutable ADRcanonicalizationร่วม61/62ก่อนproduction **hashไม่digital signature/approval** Queueส่งeventreference+leasegenerationไม่สำเนาข้อมูลส่วนตัว Replayอ่านstoredbytes/schemaเดิมไม่upcastเงียบหรือแก้occurred_at

## 2 Payload allowlistเสนอ

| event_type                  | payload refsที่อนุญาตในprotectedoutbox                                              | ข้อบังคับ                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| PersonChanged               | change_revision_ref                                                                 | consumerโหลดfield/assignmentimpactตามscope ไม่กระจายname/phone/สถานะละเอียดผ่านqueue |
| OrganizationStatusEffective | status_event_ref, request_version_ref                                               | approval/dueconditionsจากต้นเรื่อง; typeOrganizationไม่fakeExamCenter                |
| ExamCenterChanged           | change_revision_ref, center_session_ref                                             | centralyear/sessionจริง ไม่clientAY/FiscalYearสับกัน                                 |
| ApplicationCommitted        | application_snapshot_ref, operation_receipt_ref, import_commit_receipt_ref nullable | webchannelมีimportrefnull; Excelrefจริงอยู่62 sameApplication05                      |
| BudgetReserved              | reservation_receipt_ref, budget_line_ref                                            | sourceReceiptจาก06 Amountอ่านservice06 exactdecimal ไม่JSONfloat                     |
| GoodsReceived               | inspection_ref, stock_posting_receipt_ref, order_ref                                | acceptedreceiptจริง stocktransactionposted ไม่draftinspection                        |
| RecordDelivered             | record_version_ref, delivery_receipt_ref                                            | receiptต่อrecipient/versionจริง currentconfidentiality/FileVersionยังต้องตรวจ        |

SourceDocument/FileVersion/approvedcontenthashเชื่อมผ่านtypedsourceevidence refsขณะresolve ไม่copyไฟล์/presignedURL/ชื่อprivatefileเข้าenvelope Unknownpayloadkeysreject NestedextraPIIห้ามโยนเป็นremarks ไม่ถือreferenceเหมือนไม่มีความอ่อนไหว ต้องscopefilteredtraceและlogsminimal

## 3 Producer และ consistency

Ownerตรวจcurrentcommandauthority/version/conditionsแล้วบันทึกdomainchange+audit+operationreceipt+outboxในtransactionเดียว Eventuniqueproducer+source_receipt_ref+event_type+aggregate_id ป้องกันnew_event_idหลบsemanticdedupe หนึ่งcommandแตะหลายaggregateออกeventแยกที่centralIDจริงภายในtxเดียวไม่ใช้aggregateversionเดียวครอบทุกentity

Partialreceiptหลายครั้งเป็นsource_receiptคนละรายการ ไม่dedupeโดยorder_idอย่างเดียว ApplicationCommittedออกจาก05ต่อApplicationรวมweb/Excel ไม่ออกจาก09ซ้ำ ไม่มีaggregateapplicationของimporter RecordDeliveredต่อdeliveryrecipient/version ไม่correspondenceIDเดียวครอบหลายผู้รับ

StatusEvent/Document hashrefsห้ามclientแต่งให้เป็นsourcevalid ต้องFK+ownership/sourceversion+approveddecision/CLEAN/currentACLจริง Logical04 `outbox` กับ11OutboxEventต้องADRmappingหนึ่งstorage ไม่newtableซ้ำเพียงrename contracts65 Schema/migration/RLSยังไม่สร้างจริง

### Mapping logical04 ที่ต้องแก้ก่อน physical migration

| contract65                                                            | logical04 / deltaเสนอ                        | ข้อจำกัด                                                                              |
| --------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| event_id / event_type / payload                                       | outbox.id / event_code / payload_refs        | immutableenvelopeแยกจากdeliverystatus/attempts/lease                                  |
| source_receipt_ref                                                    | typedownerreceipt + operation_receipt_idเดิม | ต้องตรวจparentcommand/domainreceiptownership ไม่สับสนledgerreceiptกับoperationreceipt |
| aggregate_id/kind/version / producer / occurred_at / contract_version | เพิ่มtypedcolumns/bindingsตามownerADR        | aggregate_versionเป็นdomainrevision ไม่ใช้outbox.row_versionที่เพิ่มเมื่อclaim/retry  |
| correlation_id / causation_id / effective_at / decisionref            | correlationเดิมและtypedprovenancedelta       | currentACLก่อนtrace ไม่มีdynamicFKที่clientเลือกtableเอง                              |

`uq_outbox_01(operation_receipt_id,event_code)`เดิมไม่พอสำหรับbatchที่commandเดียวcommitหลายApplicationแล้วออกApplicationCommittedชนิดเดียว ต้องADR/physicaluniqueที่รวมproducer/source_receipt/event_type/aggregate_kind/aggregate_idและcompatiblebackfill ไม่dropconstraintเดิมบนฐานโดยไม่มีmigration ไม่เอาnewUUIDแปะเป็นoperationreceiptปลอมเพื่อเลี่ยงข้อจำกัด ทุกoutboxยังอ้างcentraloperationreceipt/accountตามอำนาจที่ยืนยัน ต้องauthmodelsจริง ไม่ใช้ServiceActorแทนUserหรือscopegrant

## 4 เวลา ordering และ contract evolution

occurred_at/correlation/eventUUIDไม่เป็นorder guarantee ไม่มีglobalorderทั้ง9ระบบ aggregate_versionของownerอาจมีช่องว่างเพราะwriterเปลี่ยนfieldที่consumerไม่subscribe **versiongapไม่พิสูจน์ว่าeventหาย** Projectionrefreshอ่านcanonicalversionล่าสุดตามcurrentACLแล้วCASไม่downgradeไปvเก่าได้ ส่วนsideeffectที่ต้องpredecessorตรวจsource_receipt/decision/dependencyที่ต้องมีจริง ไม่เดาv-1ต้องเป็นeventชนิดเดียวกัน

Older/duplicateeventอาจยังมีledgerreceiptสำคัญที่ต้องlink ไม่dropทุกeventเพราะcursorใหม่กว่า ใช้immutablefacthandler order-independent unique semanticreceipt หรือWAITING_DEPENDENCY+reconcileเมื่อจำเป็น Neverreapplyreservation/payment/stockจากbody หากversion/hash/sourceconflict quarantineพร้อมsafeerror ห้ามfastforwardcursorเพื่อซ่อนmissingdependency

Newcontractversionต้องreviewDTO/currentpolicy/migration/upcasterที่approved/compatibilitytests ไม่เปลี่ยนretainedenvelopeหรือproducerbindingเก่า Snapshotoldversionยังใช้evidenceเดิมแต่readACLล่าสุด Futureactivationยังไม่commitให้แสดงpendingไม่effectiveแม้dateผ่าน; notificationdelayไม่ย้อนcommittedsource ตาม33

## 5 ตรวจรับและข้อจำกัด

ดู [INTEGRATION_HANDLERS](INTEGRATION_HANDLERS.md), [INTEGRATION_CASES](../tests/integration/INTEGRATION_CASES.md), [fixture](../tests/fixtures/integration/integration-plan.json) Contract/mutationvectorsเป็นPLAN_ONLYไม่มีconsumervalidation/DBdedupe/runtimeUUIDที่รันแล้ว ต้องnativePostgreSQL/outbox/currentAuth/FileVersion/ownertransactionsพร้อมจึงพิสูจน์duplicate/order/crashได้
